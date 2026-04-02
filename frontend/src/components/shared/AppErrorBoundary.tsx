import React, { type ReactNode } from "react";

import { RADIUS, SPACING, TEXT } from "@/lib/design-tokens";
import { reportError } from "@/lib/logger";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export default class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error) {
    reportError("App crashed:", error);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className={["w-full max-w-xl border border-border/70 bg-card/90 text-center shadow-card", RADIUS.xl, SPACING.card].join(" ")}>
            <p className={["uppercase tracking-[0.2em] text-muted-foreground", TEXT.meta].join(" ")}>Application error</p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">Something broke in the app</h1>
            <p className={["mx-auto mt-3 max-w-lg leading-6 text-muted-foreground", TEXT.body].join(" ")}>
              The interface caught an unexpected error instead of showing a blank screen. Reload to recover the workspace.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="premium-hover mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-105"
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
