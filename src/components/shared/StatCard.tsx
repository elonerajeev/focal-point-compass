import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

import SparklineChart from "@/components/shared/SparklineChart";
import { RADIUS, SPACING, TEXT } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  icon: LucideIcon;
  iconColor?: string;
  sparkline?: number[];
  sparklineLabel?: string;
}

export default function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor = "bg-primary/10 text-primary",
  sparkline,
  sparklineLabel = "Live trend",
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 320, damping: 26, mass: 0.8 }}
      className={cn("border border-border/60 bg-card/90", RADIUS.lg, SPACING.cardCompact)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className={cn(TEXT.body, "font-medium text-muted-foreground")}>{title}</p>
          <p className="mt-2 text-3xl font-display font-semibold text-card-foreground">{value}</p>
          <p className={cn("mt-1 font-medium", TEXT.body, changeType === "up" ? "text-success" : "text-destructive")}>
            {changeType === "up" ? "+" : "-"} {change}
          </p>
          {sparkline ? (
            <div className="mt-4">
              <p className={cn("mb-1 font-semibold uppercase tracking-[0.16em] text-muted-foreground", TEXT.meta)}>{sparklineLabel}</p>
              <SparklineChart
                data={sparkline}
                stroke={changeType === "up" ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                fill={changeType === "up" ? "hsl(var(--primary) / 0.22)" : "hsl(var(--destructive) / 0.22)"}
                accentFill={changeType === "up" ? "hsl(var(--accent) / 0.16)" : "hsl(var(--warning) / 0.18)"}
              />
            </div>
          ) : null}
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center border border-border/60", RADIUS.lg, iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
