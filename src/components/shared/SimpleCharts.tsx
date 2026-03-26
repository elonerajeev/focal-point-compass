import { useId } from "react";

import { TEXT } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

type SeriesPoint = {
  label: string;
  value: number;
};

type Segment = {
  label: string;
  value: number;
  color: string;
};

type SparklineProps = {
  data: number[];
  stroke?: string;
  fill?: string;
  accentFill?: string;
  className?: string;
};

type AreaChartProps = {
  data: SeriesPoint[];
  stroke?: string;
  fill?: string;
  accentFill?: string;
  className?: string;
  showDots?: boolean;
  showSummary?: boolean;
};

type DonutChartProps = {
  segments: Segment[];
  selected?: Segment | null;
  onSelect?: (segment: Segment) => void;
  className?: string;
};

type BarChartProps = {
  items: Array<{ label: string; value: number }>;
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  className?: string;
};

const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 60;

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

function formatTickLabel(label: string) {
  return label.length > 8 ? `${label.slice(0, 8)}…` : label;
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
    <svg viewBox={`0 0 ${VIEWBOX_WIDTH} 40`} className={cn("h-10 w-full", className)} preserveAspectRatio="none" aria-hidden="true">
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
  );
}

export function SimpleAreaChart({
  data,
  stroke = "hsl(var(--primary))",
  fill = "hsl(var(--primary) / 0.18)",
  accentFill = "hsl(var(--accent) / 0.16)",
  className,
  showDots = true,
  showSummary = true,
}: AreaChartProps) {
  const id = useId();
  const points = normalizeValues(data.map((point) => point.value), VIEWBOX_HEIGHT, 8);
  const path = buildPath(points);
  const area = buildAreaPath(points, VIEWBOX_HEIGHT, 8);
  const firstPoint = data[0];
  const peakPoint = data.reduce((best, point) => (point.value > best.value ? point : best), firstPoint ?? { label: "", value: 0 });
  const lastPoint = data[data.length - 1];
  const gradientId = `area-fill-${id.replace(/:/g, "")}`;
  const callouts = [peakPoint, lastPoint].filter(
    (point, index, array) => array.findIndex((item) => item.label === point.label) === index,
  );

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="relative flex-1 overflow-hidden rounded-3xl border border-border/40 bg-[radial-gradient(circle_at_12%_18%,hsl(var(--primary)_/_0.08),transparent_32%),radial-gradient(circle_at_82%_20%,hsl(var(--accent)_/_0.08),transparent_28%),radial-gradient(circle_at_50%_86%,hsl(var(--info)_/_0.05),transparent_28%)] p-3">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background)_/_0.04),transparent_40%,hsl(var(--background)_/_0.02))]" />
        <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fill} stopOpacity={0.95} />
              <stop offset="58%" stopColor={accentFill} stopOpacity={0.55} />
              <stop offset="100%" stopColor={accentFill} stopOpacity={0} />
            </linearGradient>
          </defs>

          {[12, 24, 36, 48].map((line) => (
            <line key={line} x1="0" x2={VIEWBOX_WIDTH} y1={line} y2={line} stroke="hsl(var(--border) / 0.28)" strokeDasharray="2 4" />
          ))}
          <path d={path} fill="none" stroke={accentFill} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />
          <path d={area} fill={`url(#${gradientId})`} />
          <path d={path} fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />

          {showDots
            ? points.map((point, index) => (
                <g key={`${point.x}-${index}`}>
                  <circle cx={point.x} cy={point.y} r="2.6" fill={stroke} opacity="0.75" />
                  <circle cx={point.x} cy={point.y} r="4.2" fill={stroke} opacity="0.15" />
                </g>
              ))
            : null}
        </svg>

        {showSummary
          ? callouts.map((point) => {
              const isPeak = point.label === peakPoint.label;
              return (
                <div
                  key={point.label}
                  className={cn(
                    "pointer-events-none absolute -translate-x-1/2 rounded-full border px-3 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-xl",
                    isPeak
                      ? "border-accent/30 bg-accent/12 text-foreground"
                      : "border-primary/30 bg-primary/12 text-foreground",
                  )}
                  style={{
                    left: `${point.x}%`,
                    top: `${Math.max(8, (point.y / VIEWBOX_HEIGHT) * 100 - 12)}%`,
                  }}
                >
                  {formatTickLabel(point.label)} · {Math.round(point.value).toLocaleString()}
                </div>
              );
            })
          : null}

        {showSummary ? (
          <div
            className="pointer-events-none absolute inset-x-3 bottom-2 grid gap-1 text-[10px] font-medium text-muted-foreground"
            style={{ gridTemplateColumns: `repeat(${Math.min(data.length, 6)}, minmax(0, 1fr))` }}
          >
            {data.slice(0, 6).map((point) => (
              <span key={point.label} className="truncate text-center">
                {formatTickLabel(point.label)}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SimpleDonutChart({ segments, selected, onSelect, className }: DonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className={cn("grid gap-4", className)}>
      <div className="relative mx-auto flex h-56 w-56 items-center justify-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_45%,hsl(var(--primary)_/_0.10),transparent_38%),radial-gradient(circle_at_68%_34%,hsl(var(--accent)_/_0.10),transparent_32%),radial-gradient(circle_at_45%_72%,hsl(var(--info)_/_0.08),transparent_28%)]">
        <svg viewBox="0 0 100 100" className="h-full w-full rotate-[-90deg]" aria-hidden="true">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="10" opacity="0.65" />
          {segments.map((segment) => {
            const dash = (segment.value / total) * circumference;
            const circle = (
              <circle
                key={segment.label}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={selected?.label === segment.label ? 11 : 10}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                opacity={selected && selected.label !== segment.label ? 0.42 : 1}
                style={{ transition: "stroke-width 180ms ease, opacity 180ms ease" }}
              />
            );
            offset += dash;
            return circle;
          })}
        </svg>

        <div className="absolute inset-[18%] rounded-full border border-border/70 bg-background/82 p-5 text-center backdrop-blur-xl">
          <p className={cn("uppercase tracking-[0.16em] text-muted-foreground", TEXT.eyebrow)}>Pipeline</p>
          <p className="mt-2 font-display text-3xl font-semibold text-foreground">
            {selected ? Math.round((selected.value / total) * 100) : segments.length}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{selected ? selected.label : "active stages"}</p>
        </div>
      </div>

      <div className="grid gap-3">
        {segments.map((segment) => {
          const active = selected?.label === segment.label;
          return (
            <button
              key={segment.label}
              type="button"
              onClick={() => onSelect?.(segment)}
              className={cn(
                "flex items-center gap-3 border text-left transition",
                active ? "border-primary/30 bg-primary/[0.06]" : "border-border/70 bg-secondary/30",
                "rounded-2xl px-4 py-3",
              )}
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="text-sm font-medium text-foreground">{segment.label}</span>
              <span className="ml-auto text-sm font-semibold text-foreground">
                {Math.round((segment.value / total) * 100)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SimpleBarChart({ items, selectedIndex, onSelect, className }: BarChartProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className={cn("grid gap-3 rounded-3xl bg-[radial-gradient(circle_at_10%_10%,hsl(var(--primary)_/_0.06),transparent_30%),radial-gradient(circle_at_90%_18%,hsl(var(--accent)_/_0.06),transparent_26%)] p-1", className)}>
      {items.map((item, index) => {
        const active = selectedIndex === index;
        const width = clamp((item.value / max) * 100, 6, 100);

        return (
          <button
            key={item.label}
            type="button"
            onClick={() => onSelect?.(index)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left transition",
              active ? "border-primary/30 bg-primary/[0.06]" : "border-border/70 bg-secondary/25",
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              <span className="text-sm font-semibold text-foreground">{item.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--accent)))]"
                style={{ width: `${width}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
