export const RADIUS = {
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  xl: "rounded-3xl",
  pill: "rounded-full",
} as const;

export const SPACING = {
  card: "p-6",
  cardCompact: "p-5",
  inset: "p-4",
  button: "px-4 py-2.5",
  buttonCompact: "px-3 py-1.5",
  field: "px-4 py-3",
} as const;

export const TEXT = {
  eyebrow: "text-xs uppercase tracking-[0.16em]",
  meta: "text-xs",
  body: "text-sm",
  bodyRelaxed: "text-sm leading-6",
  title: "font-display text-2xl font-semibold",
} as const;
