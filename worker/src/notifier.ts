import type { ScanResult } from "./types";
import { logger } from "./logger";

const WEBHOOK_URL = process.env.WORKER_WEBHOOK_URL;

interface WebhookPayload {
  event: "scan.completed" | "scan.failed";
  scanId: number;
  type: string;
  target: string;
  status: string;
  summary: ScanResult["summary"] | null;
  error?: string | null;
  completedAt: string;
}

export async function notifyWebhook(
  event: WebhookPayload["event"],
  scanId: number,
  type: string,
  target: string,
  status: string,
  summary: ScanResult["summary"] | null,
  error?: string | null,
): Promise<void> {
  if (!WEBHOOK_URL) return;

  const payload: WebhookPayload = {
    event,
    scanId,
    type,
    target,
    status,
    summary,
    error,
    completedAt: new Date().toISOString(),
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      logger.warn("Webhook returned non-200", { status: response.status, scanId });
    } else {
      logger.debug("Webhook sent", { scanId, event });
    }
  } catch (err) {
    logger.warn("Webhook request failed", { scanId, error: err instanceof Error ? err.message : String(err) });
  }
}
