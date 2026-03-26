import { useMemo, useState } from "react";

import { Clock3, Inbox, MessageSquare, Sparkles } from "lucide-react";

import PageLoader from "@/components/shared/PageLoader";
import ProgressRing from "@/components/shared/ProgressRing";
import { useDashboardData } from "@/hooks/use-crm-data";
import { TEXT } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export default function ActivityPage() {
  const { data: dashboard, isLoading } = useDashboardData();
  const [selectedHeatCell, setSelectedHeatCell] = useState<number>(0);
  const [activityFilter, setActivityFilter] = useState<"all" | "collaboration" | "sales" | "delivery" | "finance" | "hiring" | "system">("all");
  const heatmap = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => {
        const base = (dashboard?.activityFeed.length ?? 0) + (dashboard?.executionReadiness ?? 0) + index * 3;
        const intensity = Math.min(4, Math.max(0, Math.floor((base + (index % 7) * 5) % 5)));
        return {
          index,
          label: `Day ${index + 1}`,
          intensity,
          count: intensity * 3 + (index % 4),
        };
      }),
    [dashboard?.activityFeed.length, dashboard?.executionReadiness],
  );

  const visibleActivity = useMemo(
    () => (dashboard?.activityFeed ?? []).filter((item) => activityFilter === "all" || item.category === activityFilter),
    [activityFilter, dashboard?.activityFeed],
  );

  const selectedHeat = heatmap[selectedHeatCell] ?? heatmap[0];

  if (isLoading || !dashboard) return <PageLoader />;

  const focusPoints = dashboard.todayFocus ?? [];
  const executionReadiness = dashboard.executionReadiness ?? 0;

  return (
    <div className="space-y-6">
      <section className="glass-panel premium-border rounded-[1.75rem] p-6">
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
            { label: "Recent events", value: dashboard.activityFeed.length, icon: Inbox },
            { label: "Unread messages", value: 3, icon: MessageSquare },
            { label: "Focus window", value: "Today", icon: Clock3 },
            { label: "Execution", value: `${executionReadiness}%`, icon: Sparkles },
          ].map((item) => (
            <div key={item.label} className="premium-hover rounded-[1.25rem] border border-border/70 bg-secondary/20 p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <p className={cn("uppercase tracking-[0.14em] text-muted-foreground", TEXT.eyebrow)}>{item.label}</p>
              <p className="mt-1 font-display text-2xl font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All" },
              { id: "collaboration", label: "Collaboration" },
              { id: "sales", label: "Sales" },
              { id: "delivery", label: "Delivery" },
              { id: "finance", label: "Finance" },
              { id: "hiring", label: "Hiring" },
              { id: "system", label: "System" },
            ].map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActivityFilter(filter.id as typeof activityFilter)}
                className={cn(
                  "premium-hover rounded-full border px-3 py-1.5 font-semibold uppercase tracking-[0.14em]",
                  TEXT.eyebrow,
                  activityFilter === filter.id
                    ? "border-primary/25 bg-primary/10 text-foreground"
                    : "border-border/70 bg-secondary/30 text-muted-foreground",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {visibleActivity.map((item) => (
            <article key={item.id} className="premium-hover glass-panel rounded-[1.5rem] p-5">
              <div className="flex items-start gap-3">
                <div className={cn("mt-1 h-3 w-3 rounded-full", item.type === "completed" ? "bg-success" : item.type === "active" ? "bg-primary" : item.type === "in-progress" ? "bg-info" : "bg-warning")} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{item.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="premium-hover glass-panel rounded-[1.5rem] p-5">
            <p className={cn("uppercase tracking-[0.14em] text-muted-foreground", TEXT.eyebrow)}>Live collaborators</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-foreground">Who is watching now</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {dashboard.collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-secondary/20 px-3 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/35 via-accent/25 to-info/30 text-xs font-bold text-foreground">
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
          </div>

          <div className="premium-hover glass-panel rounded-[1.5rem] p-5">
            <p className={cn("uppercase tracking-[0.14em] text-muted-foreground", TEXT.eyebrow)}>Why it matters</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-foreground">Notification hygiene</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Keep event streams separate from tasks and messages so the product stays legible as it grows.
            </p>
          </div>

          <div className="premium-hover glass-panel rounded-[1.5rem] p-5">
            <p className={cn("uppercase tracking-[0.14em] text-muted-foreground", TEXT.eyebrow)}>Today&apos;s focus</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-foreground">Daily brief</h2>
            <div className="mt-4 space-y-2">
              {focusPoints.map((point) => (
                <div key={point} className="rounded-2xl border border-border/70 bg-secondary/20 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  {point}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-[1.25rem] border border-border/70 bg-secondary/20 p-4">
              <ProgressRing
                value={executionReadiness}
                size={120}
                strokeWidth={12}
                label="Readiness"
                sublabel="Live signal from the dashboard snapshot"
                className="mx-auto"
              />
            </div>
          </div>

          <div className="premium-hover glass-panel rounded-[1.5rem] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={cn("uppercase tracking-[0.14em] text-muted-foreground", TEXT.eyebrow)}>Activity heatmap</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-foreground">Engagement across recent sessions</h2>
              </div>
              <span className="rounded-full border border-border/70 bg-secondary/30 px-3 py-1 text-xs font-semibold text-foreground">
                {selectedHeat?.count ?? 0} hits
              </span>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {heatmap.map((cell) => {
                const cellTone = [
                  "bg-secondary/25",
                  "bg-info/20",
                  "bg-primary/20",
                  "bg-primary/35",
                  "bg-primary/55",
                ][cell.intensity];

                return (
                  <button
                    key={cell.index}
                    type="button"
                    onClick={() => setSelectedHeatCell(cell.index)}
                    title={`${cell.label}: ${cell.count} activity hits`}
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
              <div className="mt-4 rounded-[1.25rem] border border-border/70 bg-background/45 p-4">
                <p className={cn("uppercase tracking-[0.14em] text-muted-foreground", TEXT.eyebrow)}>{selectedHeat.label}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{selectedHeat.count} activity hits</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  This cell is clickable so the heatmap can grow into deeper day-by-day drill-down later.
                </p>
              </div>
            ) : null}
          </div>
        </aside>
      </section>
    </div>
  );
}
