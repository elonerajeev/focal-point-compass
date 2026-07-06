import "dotenv/config";
import { prisma } from "./db";
import { dependencyEngine } from "./engines/dependency.engine";
import { dockerEngine } from "./engines/docker.engine";
import { notifyWebhook } from "./notifier";
import { recordMetrics, logMetricsSummary } from "./metrics";
import { logger } from "./logger";
import type { ScanEngine, ScanJob, ScanResult } from "./types";

const POLL_INTERVAL_MS = parseInt(process.env.WORKER_POLL_INTERVAL || "5000", 10);
const MODE = process.env.WORKER_MODE || "poll";
const MAX_CONCURRENCY = parseInt(process.env.WORKER_MAX_CONCURRENCY || "3", 10);
const MAX_RETRIES = parseInt(process.env.WORKER_MAX_RETRIES || "3", 10);
const RETRY_DELAY_MS = parseInt(process.env.WORKER_RETRY_DELAY || "2000", 10);

const engines: Map<string, ScanEngine> = new Map();
engines.set(dependencyEngine.type, dependencyEngine);
engines.set(dockerEngine.type, dockerEngine);

let activeJobs = 0;
let pollTimer: ReturnType<typeof setTimeout> | null = null;
let shuttingDown = false;

async function processScan(scan: { id: number; type: string; target: string; packageJson?: string | null }, retries = 0): Promise<void> {
  const engine = engines.get(scan.type);
  if (!engine) {
    logger.warn("No engine found for scan type", { scanId: scan.id, type: scan.type });
    await prisma.threatScan.update({
      where: { id: scan.id },
      data: { status: "FAILED", error: `Unknown scan type: ${scan.type}`, completedAt: new Date() },
    });
    return;
  }

  const startTime = Date.now();
  const startedAt = new Date();

  await prisma.threatScan.update({
    where: { id: scan.id },
    data: { status: "RUNNING", startedAt },
  });

  const job: ScanJob = { id: scan.id, type: scan.type as ScanJob["type"], target: scan.target, packageJson: scan.packageJson };

  try {
    logger.info("Starting scan", { scanId: scan.id, type: scan.type, target: scan.target, engine: engine.name });
    const result: ScanResult = await engine.scan(job);
    const durationMs = Date.now() - startTime;

    await prisma.threatScan.update({
      where: { id: scan.id },
      data: {
        status: "COMPLETED",
        results: result.results as never,
        summary: result.summary as never,
        report: result.report || null,
        completedAt: new Date(),
      },
    });

    logger.info("Scan completed", {
      scanId: scan.id,
      type: scan.type,
      target: scan.target,
      durationMs,
      findings: result.summary.total,
      critical: result.summary.critical,
      high: result.summary.high,
      medium: result.summary.medium,
      low: result.summary.low,
    });

    recordMetrics({
      scanId: scan.id,
      type: scan.type,
      target: scan.target,
      durationMs,
      status: "COMPLETED",
      totalFindings: result.summary.total,
      criticalCount: result.summary.critical,
      highCount: result.summary.high,
      mediumCount: result.summary.medium,
      lowCount: result.summary.low,
      timestamp: new Date().toISOString(),
    });

    await notifyWebhook("scan.completed", scan.id, scan.type, scan.target, "COMPLETED", result.summary);
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : "Unknown scan error";

    // Retry with exponential backoff
    if (retries < MAX_RETRIES && !shuttingDown) {
      const backoffMs = RETRY_DELAY_MS * Math.pow(2, retries);
      logger.warn("Scan failed, retrying", { scanId: scan.id, retry: retries + 1, maxRetries: MAX_RETRIES, backoffMs, error: errorMessage });
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
      return processScan(scan, retries + 1);
    }

    logger.error("Scan failed permanently", { scanId: scan.id, type: scan.type, target: scan.target, durationMs, retries, error: errorMessage });
    await prisma.threatScan.update({
      where: { id: scan.id },
      data: { status: "FAILED", error: errorMessage, completedAt: new Date() },
    });

    recordMetrics({
      scanId: scan.id,
      type: scan.type,
      target: scan.target,
      durationMs,
      status: "FAILED",
      totalFindings: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      timestamp: new Date().toISOString(),
    });

    await notifyWebhook("scan.failed", scan.id, scan.type, scan.target, "FAILED", null, errorMessage);
  }
}

async function poll() {
  if (shuttingDown) return;

  try {
    const pending = await prisma.threatScan.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: MAX_CONCURRENCY,
    });

    if (pending.length > 0) {
      logger.info("Fetched pending scans", { count: pending.length, concurrency: MAX_CONCURRENCY });

      for (const scan of pending) {
        if (shuttingDown) break;
        if (activeJobs >= MAX_CONCURRENCY) break;

        activeJobs++;
        processScan(scan).finally(() => {
          activeJobs--;
        });
      }
    }
  } catch (err) {
    logger.error("Poll cycle failed", { error: err instanceof Error ? err.message : String(err) });
  } finally {
    if (!shuttingDown) {
      pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
    }
  }
}

async function runOneshot(scanId: number) {
  logger.info("Starting one-shot scan", { scanId });
  const scan = await prisma.threatScan.findUnique({ where: { id: scanId } });
  if (!scan) {
    logger.error("Scan not found in one-shot mode", { scanId });
    await prisma.$disconnect();
    process.exit(1);
  }
  if (scan.status !== "PENDING") {
    logger.info("Scan already processed, skipping", { scanId, status: scan.status });
    await prisma.$disconnect();
    process.exit(0);
  }
  await processScan(scan);
  logMetricsSummary();
  await prisma.$disconnect();
  process.exit(0);
}

async function shutdown() {
  shuttingDown = true;
  logger.info("Shutting down gracefully...");

  if (pollTimer) clearTimeout(pollTimer);

  // Wait for active jobs to complete (max 30s)
  const maxWait = 30000;
  const interval = 500;
  let waited = 0;
  while (activeJobs > 0 && waited < maxWait) {
    logger.info("Waiting for active jobs", { activeJobs, waitedMs: waited });
    await new Promise((resolve) => setTimeout(resolve, interval));
    waited += interval;
  }

  if (activeJobs > 0) {
    logger.warn("Forcing shutdown with active jobs remaining", { activeJobs });
  }

  logMetricsSummary();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// ─── Entry ──────────────────────────────────────────────────────────────
const scanIdArg = process.env.SCAN_ID || process.argv.find((a) => a.startsWith("--scan-id="))?.split("=")[1];

if (MODE === "oneshot" && scanIdArg) {
  runOneshot(parseInt(scanIdArg, 10)).catch((err) => {
    logger.error("Fatal error in one-shot mode", { error: err instanceof Error ? err.message : String(err) });
    prisma.$disconnect();
    process.exit(1);
  });
} else {
  logger.info("Worker starting", {
    mode: "poll",
    pollIntervalMs: POLL_INTERVAL_MS,
    maxConcurrency: MAX_CONCURRENCY,
    maxRetries: MAX_RETRIES,
    engines: Array.from(engines.keys()),
  });
  logger.info(`Registered engines: ${Array.from(engines.entries()).map(([k, v]) => `${k} (${v.name})`).join(", ")}`);
  poll();
}
