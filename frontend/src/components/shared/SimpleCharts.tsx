import { useId } from "react";

import { cn } from "@/lib/utils";

type SparklineProps = {
  data: number[];
  stroke?: string;
  fill?: string;
  accentFill?: string;
  className?: string;
};

type BarChartProps = {
  items: Array<{ label?: string; name?: string; value: number }>;
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  className?: string;
};

const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 60;

const BAR_COLORS = [
  "hsl(213 55% 52%)",
  "hsl(173 58% 44%)",
  "hsl(38 88% 52%)",
  "hsl(258 50% 58%)",
  "hsl(0 68% 52%)",
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeValues(values: number[], height = VIEWBOX_HEIGHT, padding = 6) {
  const safeValues = values.length ? values : [0];
  const min = Math.min(...safeValues);
  const max = Math.max(...safeValues);
  const spread = max - min || 1;
  const span = height - padding * 2;

  return safeValues.map((value, index) => {
    const x = safeValues.length === 1 ? VIEWBOX_WIDTH / 2 : (index / (safeValues.length - 1)) * VIEWBOX_WIDTH;
    const normalized = (value - min) / spread;
    const y = height - padding - normalized * span;
    return { x, y, value };
  });
}

function buildPath(points: Array<{ x: number; y: number }>) {
  if (!points.length) return "";
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function buildAreaPath(points: Array<{ x: number; y: number }>, height = VIEWBOX_HEIGHT, padding = 6) {
  if (!points.length) return "";
  const baseY = height - padding;
  const line = buildPath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
}

export function SimpleSparkline({
  data,
  stroke = "hsl(var(--primary))",
  fill = "hsl(var(--primary) / 0.22)",
  accentFill = "hsl(var(--accent) / 0.14)",
  className,
}: SparklineProps) {
  const id = useId();
  const points = normalizeValues(data, 40, 5);
  const path = buildPath(points);
  const area = buildAreaPath(points, 40, 5);
  const gradientId = `sparkline-fill-${id.replace(/:/g, "")}`;

  return (
    <div className={cn("h-10 w-full", className)}>
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} 40`} className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity={0.95} />
            <stop offset="60%" stopColor={accentFill} stopOpacity={0.55} />
            <stop offset="100%" stopColor={accentFill} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={path} fill="none" stroke={stroke} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function SimpleBarChart({ items, selectedIndex, onSelect, className }: BarChartProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className={cn("grid gap-3", className)}>
      {items.map((item, index) => {
        const active = selectedIndex === index;
        const width = clamp((item.value / max) * 100, 6, 100);
        const color = BAR_COLORS[index % BAR_COLORS.length];
        const label = item.label ?? item.name;

        return (
          <button
            key={label ?? index}
            type="button"
            onClick={() => onSelect?.(index)}
            className={cn(
              "rounded-xl border px-4 py-3 text-left transition",
              active ? "bg-secondary/40" : "border-border/60 bg-secondary/20 hover:bg-secondary/35",
            )}
            style={active ? { borderColor: `${color}55` } : undefined}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">{label}</span>
              <span className="text-sm font-semibold tabular-nums" style={{ color }}>
                {item.value}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary/60">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${width}%`, backgroundColor: color }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
