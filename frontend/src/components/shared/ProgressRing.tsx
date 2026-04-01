import { motion } from "framer-motion";

import { TEXT } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

type ProgressRingProps = {
  value: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
  className?: string;
};

export default function ProgressRing({
  value,
  size = 132,
  strokeWidth = 14,
  label,
  sublabel,
  className,
}: ProgressRingProps) {
  const normalized = Math.max(0, Math.min(100, value));
  const innerSize = size - strokeWidth * 2;

  return (
    <motion.div
      className={cn("relative inline-flex items-center justify-center", className)}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(hsl(213 55% 52%) 0%, hsl(173 58% 44%) ${normalized * 0.6}%, hsl(38 88% 52%) ${normalized}%, hsl(var(--secondary)) ${normalized}% 100%)`,
          padding: strokeWidth,
          boxShadow: "0 18px 40px hsl(222 42% 12% / 0.12)",
        }}
      >
        <div className="h-full w-full rounded-full bg-card/92 backdrop-blur-xl" />
      </div>
      <div
        className="relative flex flex-col items-center justify-center rounded-full text-center"
        style={{ width: innerSize, height: innerSize }}
      >
        <span className="text-3xl font-display font-semibold text-foreground">{normalized}%</span>
        <span className={cn("mt-1 uppercase tracking-[0.18em] text-muted-foreground", TEXT.eyebrow)}>{label}</span>
        {sublabel ? <span className={cn("mt-1 max-w-[11rem] text-muted-foreground", TEXT.meta, "leading-5")}>{sublabel}</span> : null}
      </div>
    </motion.div>
  );
}
