import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShowMoreButtonProps {
  total: number;
  visible: number;
  pageSize?: number;
  onShowMore: () => void;
  onShowLess: () => void;
  className?: string;
}

export default function ShowMoreButton({ total, visible, pageSize = 6, onShowMore, onShowLess, className }: ShowMoreButtonProps) {
  if (total <= pageSize) return null;

  const remaining = total - visible;
  const isExpanded = visible >= total;

  return (
    <button
      onClick={isExpanded ? onShowLess : onShowMore}
      className={cn(
        "group flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed py-3 text-sm font-medium transition-all duration-200",
        "border-border/50 bg-secondary/10 text-muted-foreground",
        "hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
        "active:scale-[0.99]",
        className,
      )}
    >
      {isExpanded ? (
        <>
          <ChevronUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          Show less
        </>
      ) : (
        <>
          <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          Show {Math.min(pageSize, remaining)} more
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {remaining} left
          </span>
        </>
      )}
    </button>
  );
}
