import { useMemo, useState } from "react";

import { Activity, Clock3, Inbox, MessageSquare, Sparkles, Users } from "lucide-react";

import PageLoader from "@/components/shared/PageLoader";
import ErrorFallback from "@/components/shared/ErrorFallback";
import ProgressRing from "@/components/shared/ProgressRing";
import { useDashboardData } from "@/hooks/use-crm-data";
import { TEXT } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export default function ActivityPage() {
  const { data: dashboard, isLoading, error: dashboardError, refetch } = useDashboardData();
  const [selectedHeatCell, setSelectedHeatCell] = useState<number | null>(null);
  const [activityFilter, setActivityFilter] = useState<"all" | "collaboration" | "sales" | "delivery" | "finance" | "hiring" | "system">("all");

  // Build heatmap from real backend 28-day data
  const heatmap = useMemo(() => {
    const raw = dashboard?.activityHeatmap ?? [];
    const maxCount = Math.max(...raw.map((d) => d.count), 1);
    return raw.map((cell, index) => ({
      index,
      date: cell.date,
      count: cell.count,
      intensity: cell.count === 0 ? 0 : Math.min(4, Math.ceil((cell.count / maxCount) * 4)),
    }));
  }, [dashboard?.activityHeatmap]);

  const visibleActivity = useMemo(
    () => (dashboard?.activityFeed ?? []).filter((item) => activityFilter === "all" || item.category === activityFilter),
    [activityFilter, dashboard?.activityFeed],
  );

  const selectedHeat = selectedHeatCell !== null ? (heatmap[selectedHeatCell] ?? null) : null;

  if (dashboardError) {
    return (
      <ErrorFallback
        title="Activity feed failed to load"
        error={dashboardError}
        description="We could not load the live activity snapshot. Retry to refresh recent events and collaborators."
        onRetry={() => refetch()}
        retryLabel="Retry activity"
      />
    );
  }
  if (isLoading || !dashboard) return <PageLoader />;

  const focusPoints = dashboard.todayFocus ?? [];
  const executionReadiness = dashboard.executionReadiness ?? 0;
  const unreadMessages = dashboard.unreadMessages ?? 0;
  const collaborators = dashboard.collaborators ?? [];
  const hasHeatmapData = heatmap.some((cell) => cell.count > 0);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/60 bg-card p-6">
        <div className="space-y-3">
          <div className={cn("inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/40 px-3 py-1 font-medium text-muted-foreground", TEXT.eyebrow)}>
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Overview
          </div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Activity</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            A single view for recent events, notifications, and workspace movement.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Recent events", value: dashboard.activityFeed.length > 0 ? String(dashboard.activityFeed.length) : "None", icon: Inbox, color: "text-primary bg-primary/10" },
            { label: "Unread messages", value: unreadMessages > 0 ? String(unreadMessages) : "None", icon: MessageSquare, color: "text-info bg-info/10" },
            { label: "Focus window", value: "Today", icon: Clock3, color: "text-warning bg-warning/10" },
            { label: "Execution", value: `${executionReadiness}%`, icon: Sparkles, color: executionReadiness >= 70 ? "text-success bg-success/10" : "text-warning bg-warning/10" },
          ].map((item) => (
            <div key={item.label} className="rounded-[1.25rem] border border-border/70 bg-secondary/20 p-4 flex items-center gap-3">
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl flex-shrink-0", item.color)}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
                <p className="font-display text-2xl font-bold text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Activity feed — real DB-sourced events */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(["all", "collaboration", "sales", "delivery", "finance", "hiring", "system"] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setActivityFilter(id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-semibold uppercase tracking-[0.14em]",
                  TEXT.eyebrow,
                  activityFilter === id
                    ? "border-primary/25 bg-primary/10 text-foreground"
                    : "border-border/70 bg-secondary/30 text-muted-foreground",
                )}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>

          {visibleActivity.length > 0 ? (
            visibleActivity.map((item) => (
              <article key={item.id} className="premium-hover rounded-xl border border-border/60 bg-card p-5">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "mt-1 h-3 w-3 shrink-0 rounded-full",
                    item.type === "completed" ? "bg-success" :
                    item.type === "active" ? "bg-primary" :
                    item.type === "in-progress" ? "bg-info" : "bg-warning",
                  )} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{item.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.time}
                      {item.category ? ` · ${item.category}` : ""}
                      {item.source ? ` · ${item.source}` : ""}
                    </p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 bg-secondary/10 p-10 text-center">
              <Activity className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
              <p className="font-semibold text-foreground">No activity yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {activityFilter === "all"
                  ? "Add clients, projects, tasks, or invoices to see activity here."
                  : `No ${activityFilter} activity recorded yet.`}
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          {/* Live collaborators — real team members from DB */}
          <div className="premium-hover rounded-xl border border-border/60 bg-card p-5">
            <p className={cn("uppercase tracking-[0.14em] text-muted-foreground", TEXT.eyebrow)}>Live collaborators</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-foreground">Active team members</h2>
            {collaborators.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-secondary/20 px-3 py-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-foreground">
                      {collaborator.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{collaborator.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {collaborator.role} · {collaborator.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-border/60 bg-secondary/10 p-6 text-center">
                <Users className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No team members added yet.</p>
                <p className="mt-1 text-xs text-muted-foreground">Add members at People → Team.</p>
              </div>
            )}
          </div>

          {/* Today's focus — real DB-derived summary */}
          <div className="premium-hover rounded-xl border border-border/60 bg-card p-5">
            <p className={cn("uppercase tracking-[0.14em] text-muted-foreground", TEXT.eyebrow)}>Today&apos;s focus</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-foreground">Daily brief</h2>
            <div className="mt-4 space-y-2">
              {focusPoints.length > 0 ? (
                focusPoints.map((point) => (
                  <div key={point} className="rounded-2xl border border-border/70 bg-secondary/20 px-4 py-3 text-sm leading-6 text-muted-foreground">
                    {point}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border/60 bg-secondary/10 px-4 py-3 text-sm text-muted-foreground">
                  No focus data yet. Add clients and projects to generate your daily brief.
                </div>
              )}
            </div>
            <div className="mt-4 rounded-lg border border-border/70 bg-secondary/20 p-4">
              <ProgressRing
                value={executionReadiness}
                size={120}
                strokeWidth={12}
                label="Readiness"
                sublabel="Calculated from live DB records"
                className="mx-auto"
              />
            </div>
          </div>

          {/* Activity heatmap — real 28-day record creation data from DB */}
          <div className="premium-hover rounded-xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={cn("uppercase tracking-[0.14em] text-muted-foreground", TEXT.eyebrow)}>Activity heatmap</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-foreground">Last 28 days</h2>
              </div>
              {selectedHeat ? (
                <span className="rounded-full border border-border/70 bg-secondary/30 px-3 py-1 text-xs font-semibold text-foreground">
                  {selectedHeat.count} {selectedHeat.count === 1 ? "event" : "events"}
                </span>
              ) : null}
            </div>

            {hasHeatmapData ? (
              <>
                <div className="mt-4 grid grid-cols-7 gap-2">
                  {heatmap.map((cell) => {
                    const cellTone = ["bg-secondary/25", "bg-info/20", "bg-primary/20", "bg-primary/35", "bg-primary/55"][cell.intensity];
                    return (
                      <button
                        key={cell.index}
                        type="button"
                        onClick={() => setSelectedHeatCell(cell.index === selectedHeatCell ? null : cell.index)}
                        title={`${cell.date}: ${cell.count} events`}
                        className={cn(
                          "premium-hover aspect-square rounded-xl border border-border/70 transition",
                          cellTone,
                          selectedHeatCell === cell.index ? "ring-2 ring-primary/35" : "",
                        )}
                      />
                    );
                  })}
                </div>
                {selectedHeat ? (
                  <div className="mt-4 rounded-lg border border-border/70 bg-background/45 p-4">
                    <p className={cn("uppercase tracking-[0.14em] text-muted-foreground", TEXT.eyebrow)}>{selectedHeat.date}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {selectedHeat.count} {selectedHeat.count === 1 ? "record created" : "records created"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Counts clients, projects, tasks, and invoices created on this day.
                    </p>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-border/60 bg-secondary/10 p-6 text-center">
                <div className="grid grid-cols-7 gap-2 mb-4 opacity-20 pointer-events-none select-none">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl border border-border/70 bg-secondary/25" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">No activity in the last 28 days.</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add clients, projects, tasks, or invoices to populate the heatmap.
                </p>
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
