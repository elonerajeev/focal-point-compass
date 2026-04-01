export type HapticStyle = "selection" | "light" | "medium" | "success" | "error";

const hapticPatterns: Record<HapticStyle, number[]> = {
  selection: [10],
  light: [12],
  medium: [18, 12, 18],
  success: [12, 18, 12],
  error: [24, 18, 24],
};

export function triggerHaptic(style: HapticStyle = "selection") {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  navigator.vibrate(hapticPatterns[style]);
}
