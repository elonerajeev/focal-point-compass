import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  MoveRight,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";

import StatCard from "@/components/shared/StatCard";
import ProgressRing from "@/components/shared/ProgressRing";
import StatusBadge from "@/components/shared/StatusBadge";
import PageLoader from "@/components/shared/PageLoader";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useClients, useDashboardData, useProjects } from "@/hooks/use-crm-data";
import { RADIUS, SPACING, TEXT } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import type { ClientRecord } from "@/types/crm";

const DashboardCharts = lazy(() => import("@/components/dashboard/DashboardCharts"));

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

function LazyDashboardChartsSection({
  revenueSeries,
  pipelineBreakdown,
  operatingCadence,
  focusClients,
  atRiskClients,
}: {
  revenueSeries: Array<{ month: string; revenue: number; deals: number; retention: number }>;
  pipelineBreakdown: Array<{ name: string; value: number; color: string }>;
  operatingCadence: Array<{ name: string; value: number }>;
  focusClients: ClientRecord[];
  atRiskClients: ClientRecord[];
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={sectionRef}>
      {shouldLoad ? (
        <Suspense
          fallback={
            <motion.section variants={item} className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
              <div className={cn("h-[420px] border border-border/70 bg-card/80 shadow-card", RADIUS.xl)} />
              <div className={cn("h-[420px] border border-border/70 bg-card/80 shadow-card", RADIUS.xl)} />
            </motion.section>
          }
        >
          <DashboardCharts
            revenueSeries={revenueSeries}
            pipelineBreakdown={pipelineBreakdown}
            operatingCadence={operatingCadence}
            focusClients={focusClients}
            atRiskClients={atRiskClients}
          />
        </Suspense>
      ) : (
        <motion.section variants={item} className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <div className={cn("h-[420px] border border-border/70 bg-card/80 shadow-card", RADIUS.xl)} />
          <div className={cn("h-[420px] border border-border/70 bg-card/80 shadow-card", RADIUS.xl)} />
        </motion.section>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { openQuickCreate, canUseQuickCreate } = useWorkspace();
  const dashboardQuery = useDashboardData();
  const clientsQuery = useClients();
  const projectsQuery = useProjects();

  const loading = dashboardQuery.isLoading || clientsQuery.isLoading || projectsQuery.isLoading;

  const dashboard = dashboardQuery.data;
  const [activityFilter, setActivityFilter] = useState<"all" | "collaboration" | "sales" | "delivery" | "finance" | "hiring" | "system">("all");

  const dashboardView = useMemo(() => {
    const clients = clientsQuery.data ?? [];
    const projects = projectsQuery.data ?? [];
    const revenueSeries = dashboard?.revenueSeries ?? [];
    const sortedClients = [...clients].sort((a, b) => a.healthScore - b.healthScore);
    const focusClients = [...sortedClients].reverse().slice(0, 3);
    const atRiskClients = sortedClients.slice(0, 3);
    const metricSparklines = [[], [], [], []] as number[][];

    for (const point of revenueSeries) {
      metricSparklines[0].push(point.revenue);
      metricSparklines[1].push(point.deals * 6 + 30);
      metricSparklines[2].push(point.retention * 12);
      metricSparklines[3].push(Math.max(0, 100 - point.deals * 2));
    }

      return {
        focusClients,
        atRiskClients,
        featuredProjects: projects.filter((project) => project.status !== "completed").slice(0, 3),
        revenueSeries,
        metricSparklines,
        executionReadiness: dashboard?.executionReadiness ?? 0,
        filteredActivityFeed: (dashboard?.activityFeed ?? []).filter(
          (activity) => activityFilter === "all" || activity.category === activityFilter,
        ),
      };
  }, [activityFilter, clientsQuery.data, dashboard, projectsQuery.data]);

  if (loading || !dashboard) {
    return <PageLoader />;
  }
  const widgetDefinitions = [
    {
      id: "hero",
      title: "Workspace Overview",
      description: "Your business metrics and key actions in one place",
      node: (
        <motion.section variants={item} className={cn("border border-border/60 bg-card/90", RADIUS.xl, SPACING.card)}>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight text-foreground">
                  Revenue, delivery, and client health in one view.
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground">Your business metrics and key actions in one place.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {canUseQuickCreate ? (
                  <button
                    type="button"
                    onClick={openQuickCreate}
                    className={cn("premium-hover inline-flex items-center gap-2 bg-primary font-semibold text-primary-foreground transition hover:translate-y-[-1px]", RADIUS.lg, SPACING.button, TEXT.body)}
                  >
                    Launch Quick Create
                    <MoveRight className="h-4 w-4" />
                  </button>
                ) : (
                  <div className={cn("inline-flex items-center gap-2 border border-border/70 bg-secondary/30 font-semibold text-muted-foreground", RADIUS.lg, SPACING.button, TEXT.body)}>
                    Limited access
                  </div>
                )}
              </div>
            </div>
            <div className={cn("rounded-3xl border border-border/60 bg-secondary/15", RADIUS.xl, SPACING.cardCompact)}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Today&apos;s focus</p>
                  <p className="mt-1 font-display text-xl font-semibold text-foreground">Keep the next move obvious</p>
                </div>
                <ProgressRing
                  value={dashboardView.executionReadiness}
                  size={104}
                  strokeWidth={11}
                  label="Ready"
                  sublabel="Operational health"
                />
              </div>
              <div className="mt-4 space-y-2">
                {(dashboard.todayFocus ?? []).slice(0, 3).map((point) => (
                  <div key={point} className={cn("border border-border/50 bg-background/55 text-muted-foreground", RADIUS.lg, SPACING.field, TEXT.bodyRelaxed)}>
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      ),
    },
    {
      id: "stats",
      title: "KPI Strip",
      description: "Live metric cards with sparklines",
      node: (
        <motion.section variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboard.metrics.map((metric, index) => (
            <StatCard
              key={metric.label}
              title={metric.label}
              value={metric.value}
              change={`${metric.change} ${metric.detail}`}
              changeType={metric.direction}
              icon={[CircleDollarSign, Building2, Target, BriefcaseBusiness][index]}
              iconColor={[
                "bg-primary/15 text-primary",
                "bg-info/22 text-info-foreground",
                "bg-accent/18 text-accent-foreground",
                "bg-success/15 text-success",
              ][index]}
              sparkline={dashboardView.metricSparklines[index]}
              sparklineLabel={["Revenue trend", "Client mix", "Retention pulse", "Risk curve"][index]}
            />
          ))}
        </motion.section>
      ),
    },
    {
      id: "charts",
      title: "Analytics",
      description: "Revenue curve, pipeline mix, and operating cadence",
      node: (
          <LazyDashboardChartsSection
            revenueSeries={dashboardView.revenueSeries}
            pipelineBreakdown={dashboard.pipelineBreakdown}
            operatingCadence={dashboard.operatingCadence}
            focusClients={dashboardView.focusClients}
            atRiskClients={dashboardView.atRiskClients}
          />
      ),
    },
    {
      id: "portfolio",
      title: "Delivery Programs",
      description: "Active programs and their progress",
      node: (
        <motion.section variants={item} className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className={cn("glass-panel premium-border", RADIUS.xl, SPACING.card)}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Delivery Programs</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-foreground">Execution portfolio</h2>
              </div>
              <button type="button" className={cn("premium-hover inline-flex items-center gap-1 font-semibold text-primary", TEXT.meta)}>
                Open Projects
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-4">
              {dashboardView.featuredProjects.map((project) => (
                <div key={project.id} className={cn("premium-hover glass-panel", RADIUS.lg, SPACING.cardCompact)}>
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-lg font-semibold text-foreground">{project.name}</p>
                      <p className={cn("mt-1 text-muted-foreground", TEXT.body)}>{project.description}</p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="mb-4 h-2 rounded-full bg-secondary">
                    <div className="h-2 rounded-full bg-[linear-gradient(90deg,#5483B3,#7DA0CA,#C1E8FF)]" style={{ width: `${project.progress}%` }} />
                  </div>
                  <div className="grid gap-3 text-sm md:grid-cols-4">
                    <div>
                      <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Stage</p>
                      <p className="mt-1 font-semibold text-foreground">{project.stage}</p>
                    </div>
                    <div>
                      <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Budget</p>
                      <p className="mt-1 font-semibold text-foreground">{project.budget}</p>
                    </div>
                    <div>
                      <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Tasks</p>
                      <p className="mt-1 font-semibold text-foreground">
                        {project.tasks.done}/{project.tasks.total}
                      </p>
                    </div>
                    <div>
                      <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Due</p>
                      <p className="mt-1 font-semibold text-foreground">{project.dueDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={cn("glass-panel premium-border", RADIUS.xl, SPACING.card)}>
            <div className="mb-6">
              <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Recent Activity</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-foreground">Live workspace timeline</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                This section refreshes from the current day snapshot, so the feed and focus area shift without backend data.
              </p>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
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
                    "premium-hover rounded-full border font-semibold uppercase tracking-[0.14em]",
                    SPACING.buttonCompact,
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
            <div className="space-y-3">
              {dashboardView.filteredActivityFeed.map((activity) => (
                <div key={activity.id} className={cn("flex items-start gap-3 border border-border/70 bg-secondary/28", RADIUS.lg, SPACING.inset)}>
                  <div
                    className={cn(
                      "mt-1 h-3 w-3 rounded-full",
                      activity.type === "completed"
                        ? "bg-success"
                        : activity.type === "active"
                          ? "bg-primary"
                          : activity.type === "in-progress"
                            ? "bg-info"
                            : "bg-warning",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-foreground", TEXT.body)}>{activity.text}</p>
                    <p className={cn("mt-1 text-muted-foreground", TEXT.meta)}>
                      {activity.time}
                      {activity.category ? ` · ${activity.category}` : ""}
                      {activity.source ? ` · ${activity.source}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={activity.type} />
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      ),
    },
  ];
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {widgetDefinitions.map((widget) => (
        <div key={widget.id}>{widget.node}</div>
      ))}
    </motion.div>
  );
}
