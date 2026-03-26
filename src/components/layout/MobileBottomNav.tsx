import { LayoutDashboard, Search, Sparkles, BriefcaseBusiness, BadgeDollarSign } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useTheme, type UserRole } from "@/contexts/ThemeContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { RADIUS, SPACING, TEXT } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { getFirstAccessiblePathForSection } from "./sidebarConfig";
import { triggerHaptic } from "@/lib/micro-interactions";

const items = [
  {
    key: "overview",
    label: "Home",
    icon: LayoutDashboard,
    getPath: (role: UserRole) => getFirstAccessiblePathForSection("overview", role),
    matches: (pathname: string) => pathname.startsWith("/overview"),
  },
  {
    key: "workspace",
    label: "Workspace",
    icon: BriefcaseBusiness,
    getPath: (role: UserRole) => getFirstAccessiblePathForSection("workspace", role),
    matches: (pathname: string) => pathname.startsWith("/workspace"),
  },
  {
    key: "sales",
    label: "Sales",
    icon: BadgeDollarSign,
    getPath: (role: UserRole) => getFirstAccessiblePathForSection("sales", role),
    matches: (pathname: string) => pathname.startsWith("/sales"),
  },
] as const;

export default function MobileBottomNav() {
  const { role } = useTheme();
  const { openCommandPalette, openQuickCreate, canUseQuickCreate } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-[linear-gradient(180deg,hsl(var(--card)_/_0.98),hsl(var(--card)_/_0.9))] px-3 py-2 shadow-[0_-14px_34px_hsl(222_36%_8%_/_0.12)] backdrop-blur-2xl md:hidden">
      <div className="grid grid-cols-5 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.matches(location.pathname);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                navigate(item.getPath(role));
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 border transition",
                RADIUS.lg,
                SPACING.buttonCompact,
                TEXT.meta,
                active
                  ? "border-primary/20 bg-primary/10 text-foreground"
                  : "border-border/70 bg-secondary/20 text-muted-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
              {item.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => {
            triggerHaptic("selection");
            openCommandPalette();
          }}
          className={cn("flex flex-col items-center justify-center gap-1 border border-border/70 bg-secondary/20 text-muted-foreground transition", RADIUS.lg, SPACING.buttonCompact, TEXT.meta)}
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          Search
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic(canUseQuickCreate ? "medium" : "selection");
            if (canUseQuickCreate) {
              openQuickCreate();
            } else {
              openCommandPalette();
            }
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-1 border transition",
            RADIUS.lg,
            SPACING.buttonCompact,
            TEXT.meta,
            canUseQuickCreate ? "border-primary/20 bg-primary text-primary-foreground" : "border-border/70 bg-secondary/20 text-muted-foreground",
          )}
        >
          <Sparkles className={cn("h-4 w-4", canUseQuickCreate ? "text-primary-foreground" : "text-muted-foreground")} />
          Create
        </button>
      </div>
    </nav>
  );
}
