interface ScanMetrics {
  scanId: number;
  type: string;
  target: string;
  durationMs: number;
  status: "COMPLETED" | "FAILED";
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  timestamp: string;
}

const metrics: ScanMetrics[] = [];
const MAX_METRICS = 1000;

export function recordMetrics(m: ScanMetrics) {
  metrics.push(m);
  if (metrics.length > MAX_METRICS) metrics.shift();
}

export function getMetricsSummary() {
  if (metrics.length === 0) return null;

  const total = metrics.length;
  const completed = metrics.filter((m) => m.status === "COMPLETED").length;
  const failed = metrics.filter((m) => m.status === "FAILED").length;
  const avgDuration = Math.round(metrics.reduce((s, m) => s + m.durationMs, 0) / total);
  const totalFindings = metrics.reduce((s, m) => s + m.totalFindings, 0);

  return {
    totalScans: total,
    completed,
    failed,
    avgDurationMs: avgDuration,
    totalFindings,
    byType: [...new Set(metrics.map((m) => m.type))].map((type) => ({
      type,
      count: metrics.filter((m) => m.type === type).length,
    })),
  };
}

export function logMetricsSummary() {
  const summary = getMetricsSummary();
  if (summary) {
    console.log(`[Metrics] ${summary.totalScans} scans | ${summary.completed} OK / ${summary.failed} fail | avg ${summary.avgDurationMs}ms | ${summary.totalFindings} findings`);
  }
}
