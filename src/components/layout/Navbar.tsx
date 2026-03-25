import { Search, Bell, Sun, Moon, ChevronDown, Command, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme, UserRole } from "@/contexts/ThemeContext";

const roleLabels: Record<UserRole, { label: string; emoji: string }> = {
  admin: { label: "Admin", emoji: "👑" },
  manager: { label: "Manager", emoji: "📋" },
  employee: { label: "Employee", emoji: "💼" },
  client: { label: "Client", emoji: "🤝" },
};

export default function Navbar() {
  const { mode, toggleMode, role, setRole } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const notifications = [
    { id: 1, text: "🎉 New client added: Acme Corp", time: "2m ago", unread: true },
    { id: 2, text: "✅ Task 'Design Review' completed", time: "15m ago", unread: true },
    { id: 3, text: "📅 Meeting with Sarah at 3 PM", time: "1h ago", unread: false },
    { id: 4, text: "🏆 Project milestone reached", time: "3h ago", unread: false },
    { id: 5, text: "📧 New message from Lisa Park", time: "5h ago", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/70 backdrop-blur-xl px-6">
      {/* Search */}
      <div className="relative w-full max-w-lg group">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search anything..."
          className="h-10 w-full rounded-xl border border-input bg-secondary/40 pl-10 pr-20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-card transition-all"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-0.5 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          <Command className="h-2.5 w-2.5" /> K
        </kbd>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1.5 ml-4">
        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-1.5 h-9 rounded-lg px-3 text-xs font-medium bg-secondary/60 text-foreground hover:bg-secondary transition-colors"
          >
            <span>{roleLabels[role].emoji}</span>
            <span className="hidden sm:inline">{roleLabels[role].label}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          {showRoleSwitcher && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowRoleSwitcher(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card shadow-xl z-50 animate-scale-in overflow-hidden">
                <div className="p-2 border-b border-border">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2">Switch Role</p>
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRole(r); setShowRoleSwitcher(false); }}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors",
                      r === role ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <span className="text-base">{roleLabels[r].emoji}</span>
                    <span>{roleLabels[r].label}</span>
                    {r === role && <Sparkles className="h-3 w-3 ml-auto text-primary" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <button onClick={toggleMode} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all hover:scale-105">
          {mode === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all hover:scale-105"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground min-w-[18px] h-[18px] px-1">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-xl z-50 animate-scale-in overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-display font-semibold text-sm text-foreground">Notifications</h3>
                  <span className="text-[10px] font-medium bg-primary/10 text-primary rounded-full px-2 py-0.5">{unreadCount} new</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={cn("flex items-start gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border last:border-0", n.unread && "bg-primary/[0.03]")}>
                      <div className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.unread ? "bg-primary animate-pulse" : "bg-transparent")} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{n.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border text-center">
                  <button className="text-xs text-primary font-medium hover:underline">View all notifications</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div className="ml-1 flex items-center gap-3 rounded-xl px-3 py-1.5 hover:bg-secondary/60 transition-colors cursor-pointer">
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-foreground">JD</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-card" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-foreground leading-tight">John Doe</p>
            <p className="text-[10px] text-muted-foreground capitalize">{roleLabels[role].emoji} {roleLabels[role].label}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
