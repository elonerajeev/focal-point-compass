import { useMemo, useState } from "react";

import { ArrowUpRight, Clock3, Zap } from "lucide-react";
import { motion } from "framer-motion";

import StatusBadge from "@/components/shared/StatusBadge";
import { SimpleAreaChart, SimpleBarChart, SimpleDonutChart } from "@/components/shared/SimpleCharts";
import { RADIUS, SPACING, TEXT } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import type { ClientRecord } from "@/types/crm";

type DashboardChartsProps = {
  revenueSeries: Array<{ month: string; revenue: number; deals: number; retention: number }>;
  pipelineBreakdown: Array<{ name: string; value: number; color: string }>;
  operatingCadence: Array<{ name: string; value: number }>;
  focusClients: ClientRecord[];
  atRiskClients: ClientRecord[];
};

export default function DashboardCharts({
  revenueSeries,
  pipelineBreakdown,
  operatingCadence,
  focusClients,
  atRiskClients,
}: DashboardChartsProps) {
  const [selectedStage, setSelectedStage] = useState(pipelineBreakdown[0] ?? null);
  const [selectedCadence, setSelectedCadence] = useState(operatingCadence[0] ?? null);

  const totalPipeline = useMemo(
    () => pipelineBreakdown.reduce((sum, stage) => sum + stage.value, 0),
    [pipelineBreakdown],
  );
  const revenuePoints = revenueSeries.map((point) => ({
    label: point.month,
    value: point.revenue,
  }));

  return (
    <>
      <motion.section variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className={cn("border border-border/60 bg-card/90", RADIUS.xl, SPACING.card)}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Growth Curve</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">Revenue and retention momentum</h2>
            </div>
            <div className={cn("border border-border/60 bg-secondary/25 font-medium text-muted-foreground", RADIUS.pill, SPACING.buttonCompact, TEXT.meta)}>
              Quarter to date
            </div>
          </div>
          <SimpleAreaChart
            data={revenuePoints}
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary) / 0.2)"
            accentFill="hsl(var(--accent) / 0.16)"
          />
        </div>

        <div className={cn("border border-border/60 bg-card/90", RADIUS.xl, SPACING.card)}>
          <div className="mb-6">
            <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Pipeline Mix</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">Weighted by stage</h2>
          </div>
          <SimpleDonutChart
            segments={pipelineBreakdown}
            selected={selectedStage}
            onSelect={setSelectedStage}
          />
          {selectedStage ? (
            <div className={cn("mt-4 border border-border/60 bg-secondary/15", RADIUS.lg, SPACING.inset)}>
              <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Drill-down</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="font-semibold text-foreground">{selectedStage.name}</p>
                <span className={cn("border border-border/60 bg-background/60 font-semibold text-foreground", RADIUS.pill, SPACING.buttonCompact, TEXT.meta)}>
                  {Math.round((selectedStage.value / totalPipeline) * 100)}% of pipeline
                </span>
              </div>
              <p className={cn("mt-2 text-muted-foreground", TEXT.bodyRelaxed)}>
                This stage is now selectable so the chart can act like a planning surface instead of a static chart.
              </p>
            </div>
          ) : null}
        </div>
      </motion.section>

      <motion.section variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr_0.9fr]">
        <div className={cn("border border-border/60 bg-card/90", RADIUS.xl, SPACING.card)}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Operating Cadence</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-foreground">Cross-team performance</h2>
              </div>
              <Zap className="h-5 w-5 text-primary" />
            </div>
          <SimpleBarChart
            items={operatingCadence}
            selectedIndex={selectedCadence ? operatingCadence.findIndex((item) => item.name === selectedCadence.name) : 0}
            onSelect={(index) => setSelectedCadence(operatingCadence[index] ?? operatingCadence[0] ?? null)}
          />
          {selectedCadence ? (
            <div className={cn("mt-4 border border-border/60 bg-secondary/15", RADIUS.lg, SPACING.inset)}>
              <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Selected segment</p>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="font-semibold text-foreground">{selectedCadence.name}</p>
                <p className={cn("font-semibold text-foreground", TEXT.body)}>{selectedCadence.value}%</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--accent)))]" style={{ width: `${selectedCadence.value}%` }} />
              </div>
            </div>
          ) : null}
        </div>

        <div className={cn("border border-border/60 bg-card/90", RADIUS.xl, SPACING.card)}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Priority Accounts</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-foreground">Account management radar</h2>
            </div>
            <button type="button" className={cn("premium-hover inline-flex items-center gap-1 font-semibold text-primary", TEXT.meta)}>
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-4">
            {focusClients.map((client) => (
              <div key={client.id} className={cn("border border-border/60 bg-secondary/15", RADIUS.lg, SPACING.inset)}>
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-12 w-12 items-center justify-center bg-primary/10 font-semibold text-foreground", RADIUS.lg, TEXT.body)}>
                      {client.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{client.name}</p>
                      <p className={cn("text-muted-foreground", TEXT.meta)}>
                        {client.industry} · {client.segment}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={client.status} />
                </div>
                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Health</p>
                    <p className="mt-1 font-semibold text-foreground">{client.healthScore}/100</p>
                  </div>
                  <div>
                    <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Owner</p>
                    <p className="mt-1 font-semibold text-foreground">{client.manager}</p>
                  </div>
                  <div>
                    <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Next Action</p>
                    <p className="mt-1 font-semibold text-foreground">{client.nextAction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={cn("border border-border/60 bg-card/90", RADIUS.xl, SPACING.card)}>
          <div className="mb-5">
            <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Risk Monitor</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-foreground">Accounts that need intervention</h2>
          </div>
          <div className="space-y-3">
            {atRiskClients.map((client) => (
              <div key={client.id} className={cn("border border-border/60 bg-secondary/15", RADIUS.lg, SPACING.inset)}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{client.name}</p>
                    <p className={cn("text-muted-foreground", TEXT.meta)}>{client.nextAction}</p>
                  </div>
                  <span className={cn("bg-warning/12 font-semibold text-warning", RADIUS.pill, SPACING.buttonCompact, TEXT.meta)}>
                    {client.healthScore}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className={cn("mt-6 border border-border/60 bg-secondary/15", RADIUS.lg, SPACING.inset)}>
            <div className={cn("mb-3 flex items-center gap-2 font-semibold text-foreground", TEXT.body)}>
              <Clock3 className="h-4 w-4 text-primary" />
              Suggested focus this afternoon
            </div>
            <p className={cn("text-muted-foreground", TEXT.bodyRelaxed)}>
              Have customer success call the two lowest-health enterprise accounts before the next billing cycle. That is the highest-leverage frontend workflow to connect to backend reminders and automation later.
            </p>
          </div>
        </div>
      </motion.section>
    </>
  );
}
