import { Search, Bell, Sun, Moon, ChevronDown, Command, Sparkles, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme, UserRole } from "@/contexts/ThemeContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationCenter from "@/components/layout/NotificationCenter";
import { RADIUS, SPACING, TEXT } from "@/lib/design-tokens";
import { toast } from "@/components/ui/sonner";
import { triggerHaptic } from "@/lib/micro-interactions";

const roleLabels: Record<UserRole, { label: string; emoji: string }> = {
  admin: { label: "Admin", emoji: "👑" },
  manager: { label: "Manager", emoji: "" },
  employee: { label: "Employee", emoji: "" },
  client: { label: "Client", emoji: "" },
};

export default function Navbar() {
  const { mode, toggleMode, role, setRole } = useTheme();
  const { openCommandPalette, openQuickCreate, canUseQuickCreate } = useWorkspace();
  const { unreadCount, toggleCenter, centerOpen } = useNotifications();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex flex-col gap-3 border-b border-border/70 bg-[linear-gradient(180deg,hsl(var(--card)_/_0.92),hsl(var(--card)_/_0.82))] px-4 py-3 backdrop-blur-2xl shadow-[0_14px_34px_hsl(222_36%_8%_/_0.05)] md:h-16 md:flex-row md:items-center md:justify-between md:px-6 md:py-0">
      {/* Search */}
      <div className="relative w-full max-w-none group md:max-w-lg">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search anything..."
          onFocus={openCommandPalette}
          className={cn("h-10 w-full border border-border/80 bg-background/72 pl-10 pr-20 text-foreground placeholder:text-muted-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%_/_0.04)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-card transition-all", RADIUS.xl, TEXT.body)}
        />
        <kbd className={cn("absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-0.5 border border-border/80 bg-secondary/58 font-medium uppercase tracking-[0.12em] text-muted-foreground", RADIUS.sm, "px-1.5 py-0.5", TEXT.meta)}>
          <Command className="h-2.5 w-2.5" /> K
        </kbd>
      </div>

      {/* Right side */}
      <div className="flex w-full items-center justify-between gap-1.5 md:ml-4 md:w-auto md:justify-end">
        {canUseQuickCreate ? (
          <button
            onClick={openQuickCreate}
            className={cn("premium-hover inline-flex items-center gap-2 h-9 bg-primary font-semibold uppercase tracking-[0.14em] text-primary-foreground transition hover:brightness-105", RADIUS.xl, "px-3.5", TEXT.eyebrow)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Quick Create</span>
          </button>
        ) : (
          <div className={cn("flex h-9 items-center border border-border/70 bg-secondary/30 font-semibold uppercase tracking-[0.14em] text-muted-foreground md:hidden", RADIUS.xl, "px-3", TEXT.meta)}>
            Read only
          </div>
        )}

        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className={cn("premium-hover flex items-center gap-1.5 h-9 border border-border/70 bg-secondary/40 font-semibold uppercase tracking-[0.12em] text-foreground hover:bg-secondary transition-colors", RADIUS.xl, "px-3", TEXT.eyebrow)}
          >
            {role === "admin" && <span>👑</span>}
            <span className="hidden sm:inline">{roleLabels[role].label}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          {showRoleSwitcher && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowRoleSwitcher(false)} />
              <div className={cn("absolute right-0 top-full mt-2 w-48 border border-border bg-card shadow-xl z-50 animate-scale-in overflow-hidden", RADIUS.xl)}>
                <div className="p-2 border-b border-border">
                  <p className={cn("font-semibold uppercase tracking-wider text-muted-foreground px-2", TEXT.meta)}>Switch Role</p>
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setShowRoleSwitcher(false);
                      triggerHaptic("success");
                      toast.success(`Switched to ${roleLabels[r].label}`, {
                        description: "The workspace updated instantly.",
                      });
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 transition-colors",
                      SPACING.button,
                      TEXT.body,
                      r === role ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <span className="text-base">{r === "admin" ? "👑" : ""}</span>
                    <span>{roleLabels[r].label}</span>
                    {r === role && <Sparkles className="h-3 w-3 ml-auto text-primary" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <button onClick={toggleMode} className={cn("premium-hover flex h-9 w-9 items-center justify-center border border-border/70 bg-secondary/28 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all hover:scale-105", RADIUS.xl)}>
          {mode === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={toggleCenter}
            className={cn("premium-hover relative flex h-9 w-9 items-center justify-center border border-border/70 bg-secondary/28 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all hover:scale-105", RADIUS.xl)}
            aria-expanded={centerOpen}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground min-w-[18px] h-[18px] px-1">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationCenter />
        </div>

        {/* Profile */}
        <div className={cn("premium-hover ml-1 flex items-center gap-3 border border-border/70 bg-secondary/28 hover:bg-secondary/50 transition-colors cursor-pointer", RADIUS.lg, SPACING.buttonCompact)}>
          <div className="relative">
            <div className={cn("flex h-9 w-9 items-center justify-center bg-gradient-to-br from-info/60 via-accent/45 to-primary/55 shadow-[0_8px_24px_hsl(218_80%_8%_/_0.16)]", RADIUS.pill)}>
              <span className="text-sm font-bold text-foreground">JD</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-card" />
          </div>
          <div className="hidden md:block">
            <p className={cn("font-semibold text-foreground leading-tight", TEXT.body)}>John Doe</p>
            <p className={cn("text-muted-foreground capitalize", TEXT.meta)}>{role === "admin" && "👑 "}{roleLabels[role].label}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
