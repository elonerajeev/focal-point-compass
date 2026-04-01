import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, FolderKanban, FolderOpen, Gauge, Pin, Wallet } from "lucide-react";

import PageLoader from "@/components/shared/PageLoader";
import ErrorFallback from "@/components/shared/ErrorFallback";
import ShowMoreButton from "@/components/shared/ShowMoreButton";
import { useTheme } from "@/contexts/ThemeContext";
import { useProjects } from "@/hooks/use-crm-data";
import { useListPreferences } from "@/hooks/use-list-preferences";
import { cn } from "@/lib/utils";

type ProjectStage = "Discovery" | "Build" | "Review" | "Launch";

const stageConfig: Record<ProjectStage, { color: string; bg: string; dot: string }> = {
  Discovery: { color: "text-info",        bg: "bg-info/10 border-info/20",        dot: "bg-info" },
  Build:     { color: "text-primary",     bg: "bg-primary/10 border-primary/20",  dot: "bg-primary" },
  Review:    { color: "text-warning",     bg: "bg-warning/10 border-warning/20",  dot: "bg-warning" },
  Launch:    { color: "text-success",     bg: "bg-success/10 border-success/20",  dot: "bg-success" },
};

const statusGradient: Record<string, string> = {
  active:      "from-success/20 via-success/5 to-transparent",
  "in-progress": "from-primary/20 via-primary/5 to-transparent",
  pending:     "from-warning/15 via-warning/5 to-transparent",
  completed:   "from-muted/20 via-muted/5 to-transparent",
};

const progressColor = (pct: number) =>
  pct >= 80 ? "from-success to-emerald-400" :
  pct >= 50 ? "from-primary to-blue-400" :
  pct >= 25 ? "from-warning to-amber-400" : "from-destructive/70 to-red-400";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function ProjectsPage() {
  const { data: projects = [], isLoading, error: projectsError, refetch } = useProjects();
  const { role } = useTheme();
  const [visibleCount, setVisibleCount] = useState(5);
  const PAGE_SIZE = 5;
  const { orderedItems: preferredProjects, pinnedIds, togglePin } = useListPreferences(
    `crm-projects-preferences-${role}`,
    projects,
    (p) => String(p.id),
  );

  const summary = useMemo(() => ({
    active: projects.filter(p => p.status === "active" || p.status === "in-progress").length,
    completed: projects.filter(p => p.status === "completed").length,
    avgProgress: projects.length ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length) : 0,
    totalBudget: projects.reduce((s, p) => {
      const n = Number(String(p.budget).replace(/[^0-9.]/g, ""));
      return s + (Number.isFinite(n) ? n : 0);
    }, 0),
  }), [projects]);

  if (isLoading) return <PageLoader />;
  if (projectsError) return (
    <ErrorFallback title="Projects failed to load" error={projectsError} onRetry={() => refetch()} retryLabel="Retry" />
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.section variants={item} className="rounded-[1.75rem] border border-border/70 bg-card/90 p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground">
              <FolderKanban className="h-3.5 w-3.5 text-primary" />
              Program Delivery
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Projects</h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Track delivery stages, budgets, and progress across all active programs.
            </p>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex lg:gap-3">
            {[
              { label: "Active", value: summary.active, icon: FolderKanban, color: "text-primary bg-primary/10" },
              { label: "Done", value: summary.completed, icon: CheckCircle2, color: "text-success bg-success/10" },
              { label: "Avg Progress", value: `${summary.avgProgress}%`, icon: Gauge, color: "text-warning bg-warning/10" },
              { label: "Total Budget", value: summary.totalBudget >= 1000 ? `$${(summary.totalBudget/1000).toFixed(0)}K` : `$${summary.totalBudget}`, icon: Wallet, color: "text-accent bg-accent/10" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-secondary/20 px-4 py-3 min-w-[110px]">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="font-display text-lg font-bold text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Project list */}
      <motion.div variants={item} className="space-y-3">
        {preferredProjects.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-border/60 bg-secondary/10 p-12 text-center">
            <FolderOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="font-semibold text-foreground">No projects yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add a project to start tracking delivery.</p>
          </div>
        ) : (
          preferredProjects.slice(0, visibleCount).map((project, idx) => {
            const stage = project.stage as ProjectStage;
            const stageCfg = stageConfig[stage] ?? stageConfig.Discovery;
            const gradient = statusGradient[project.status] ?? statusGradient.pending;

            return (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-card shadow-card"
              >
                {/* Colored top gradient strip */}
                <div className={cn("bg-gradient-to-r p-5 pb-4", gradient)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => togglePin(String(project.id))}
                        className={cn(
                          "mt-0.5 flex h-7 w-7 items-center justify-center rounded-xl border transition",
                          pinnedIds.includes(String(project.id))
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border/50 bg-background/40 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Pin className="h-3 w-3" />
                      </button>
                      <div>
                        <h2 className="font-display text-lg font-semibold text-foreground">{project.name}</h2>
                        {project.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{project.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase flex items-center gap-1", stageCfg.bg)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", stageCfg.dot)} />
                        {stage}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="px-5 py-3 border-t border-border/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Progress</span>
                    <span className={cn("text-xs font-bold",
                      project.progress >= 80 ? "text-success" :
                      project.progress >= 50 ? "text-primary" : "text-warning"
                    )}>{project.progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/40">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 0.7, delay: idx * 0.04 + 0.2 }}
                      className={cn("h-full rounded-full bg-gradient-to-r", progressColor(project.progress))}
                    />
                  </div>
                </div>

                {/* Meta row */}
                <div className="grid grid-cols-3 divide-x divide-border/40 border-t border-border/30">
                  <div className="px-5 py-3">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Budget</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">{project.budget}</p>
                  </div>
                  <div className="px-5 py-3">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Tasks</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      {project.tasks.done}/{project.tasks.total}
                      {project.tasks.total > 0 && (
                        <span className="ml-1 text-[10px] text-muted-foreground">
                          ({Math.round((project.tasks.done / project.tasks.total) * 100)}%)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="px-5 py-3">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Due</p>
                    <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-foreground">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {project.dueDate || "—"}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })
        )}

        <ShowMoreButton
          total={preferredProjects.length}
          visible={visibleCount}
          pageSize={PAGE_SIZE}
          onShowMore={() => setVisibleCount(v => Math.min(v + PAGE_SIZE, preferredProjects.length))}
          onShowLess={() => setVisibleCount(PAGE_SIZE)}
        />
      </motion.div>
    </motion.div>
  );
}
