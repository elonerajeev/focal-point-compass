import { Skeleton } from "@/components/ui/skeleton";
import { RADIUS, SPACING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export default function PageLoader() {
  return (
    <div className="space-y-6" role="status" aria-live="polite" aria-busy="true">
      <div className={cn("border border-border/70 bg-secondary/35", RADIUS.pill, SPACING.buttonCompact)}>
        <div className={cn("relative h-1.5 overflow-hidden bg-secondary/60", RADIUS.pill)}>
          <div className="absolute left-0 top-0 h-full w-1/3 rounded-full bg-gradient-to-r from-primary via-accent to-info animate-loading-progress" />
        </div>
      </div>

      <div className="space-y-3">
        <div className={cn("inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground", RADIUS.pill)}>
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Loading workspace
        </div>
        <Skeleton className={cn("h-10 w-64", RADIUS.pill)} />
        <Skeleton className={cn("h-4 w-80", RADIUS.pill)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={cn("border border-border/70 bg-card/80 shadow-card", RADIUS.xl, SPACING.cardCompact)}
          >
            <Skeleton className={cn("h-10 w-10", RADIUS.lg)} />
            <div className="mt-5 space-y-3">
              <Skeleton className={cn("h-3 w-24", RADIUS.pill)} />
              <Skeleton className={cn("h-8 w-32", RADIUS.pill)} />
              <Skeleton className={cn("h-3 w-3/4", RADIUS.pill)} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className={cn("border border-border/70 bg-card/80 shadow-card lg:col-span-2", RADIUS.xl, SPACING.card)}>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className={cn("h-3 w-24", RADIUS.pill)} />
              <Skeleton className={cn("h-6 w-56", RADIUS.pill)} />
            </div>
            <Skeleton className={cn("h-8 w-24", RADIUS.pill)} />
          </div>
          <Skeleton className={cn("mt-6 h-[240px] w-full", RADIUS.xl)} />
        </div>
        <div className={cn("border border-border/70 bg-card/80 shadow-card", RADIUS.xl, SPACING.card)}>
          <div className="space-y-2">
            <Skeleton className={cn("h-3 w-24", RADIUS.pill)} />
            <Skeleton className={cn("h-6 w-44", RADIUS.pill)} />
          </div>
          <div className="mt-6 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className={cn("h-14 w-full", RADIUS.lg)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
