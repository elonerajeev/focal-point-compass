import { cn } from "@/lib/utils";
import { RADIUS, SPACING, TEXT } from "@/lib/design-tokens";

type Status = "active" | "pending" | "completed" | "rejected" | "in-progress" | "high" | "medium" | "low";

const statusStyles: Record<Status, string> = {
  active: "bg-success/14 text-foreground border-success/25",
  completed: "bg-success/14 text-foreground border-success/25",
  pending: "bg-warning/18 text-foreground border-warning/28",
  "in-progress": "bg-info/28 text-foreground border-info/35",
  rejected: "bg-destructive/14 text-foreground border-destructive/25",
  high: "bg-destructive/14 text-foreground border-destructive/25",
  medium: "bg-warning/18 text-foreground border-warning/28",
  low: "bg-info/28 text-foreground border-info/35",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn("inline-flex items-center border font-semibold capitalize tracking-[0.02em]", RADIUS.pill, SPACING.buttonCompact, TEXT.meta, statusStyles[status])}>
      {status.replace("-", " ")}
    </span>
  );
}
