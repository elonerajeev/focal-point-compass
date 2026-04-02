import { appEnv, isProduction } from "@/lib/env";

// Error tracking and reporting
export class ErrorTracker {
  private static instance: ErrorTracker
  private errors: Array<{
    message: string
    stack?: string
    timestamp: number
    url: string
    userAgent: string
    userId?: string
  }> = []

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker()
    }
    return ErrorTracker.instance
  }

  init(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.captureError({
          message: event.message,
          stack: event.error?.stack,
        })
      })

      window.addEventListener('unhandledrejection', (event) => {
        this.captureError({
          message: `Unhandled Promise: ${event.reason}`,
          stack: event.reason?.stack,
        })
      })
    }
  }

  captureError(error: { message: string; stack?: string; userId?: string }): void {
    const errorRecord = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      userId: error.userId,
    }

    this.errors.push(errorRecord)

    if (!isProduction) {
      console.error('Error captured:', errorRecord)
    }

    void this.sendToAnalytics(errorRecord)
  }

  private async sendToAnalytics(errorRecord: {
    message: string
    stack?: string
    timestamp: number
    url: string
    userAgent: string
    userId?: string
  }) {
    if (!appEnv.enableAnalytics) return
    if (!appEnv.analyticsEndpoint) return

    try {
      await fetch(appEnv.analyticsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "error", payload: errorRecord }),
      })
    } catch {
      // Best-effort reporting only.
    }
  }

  getErrorSummary() {
    return {
      totalErrors: this.errors.length,
      recentErrors: this.errors.filter(e => Date.now() - e.timestamp < 3600000).length,
    }
  }
}
