import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";

import { cn } from "@/lib/utils";

function getErrorMessage(error?: unknown) {
  if (!error) return "We could not load this section.";
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected problem stopped this section from loading.";
}

type ErrorFallbackProps = {
  title?: string;
  description?: string;
  error?: unknown;
  onRetry?: () => void;
  retryLabel?: string;
};

export default function ErrorFallback({
  title = "Something went wrong",
  description,
  error,
  onRetry,
  retryLabel = "Try again",
}: ErrorFallbackProps) {
  const offline = typeof navigator !== "undefined" && navigator.onLine === false;
  const detail = description ?? getErrorMessage(error);

  return (
    <div className="rounded-[1.5rem] border border-destructive/20 bg-destructive/5 p-6 shadow-card">
      <div className="flex items-start gap-4">
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border", offline ? "border-warning/25 bg-warning/10 text-warning" : "border-destructive/25 bg-destructive/10 text-destructive")}>
          {offline ? <WifiOff className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{offline ? "Connection issue" : "Load failed"}</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{detail}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-105"
              >
                <RefreshCw className="h-4 w-4" />
                {retryLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
