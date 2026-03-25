import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, UserCheck, ClipboardList, FolderKanban,
  Briefcase, Shield, ChevronLeft, ChevronRight, Zap, Settings,
  BarChart3, MessageSquare, Calendar, FileText, HelpCircle,
  CreditCard, Globe, Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme, UserRole, ThemeColor } from "@/contexts/ThemeContext";

interface NavSection {
  title: string;
  items: { to: string; icon: any; label: string; roles: UserRole[]; badge?: string }[];
}

const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "manager", "employee", "client"] },
      { to: "/analytics", icon: BarChart3, label: "Analytics", roles: ["admin", "manager"], badge: "New" },
      { to: "/calendar", icon: Calendar, label: "Calendar", roles: ["admin", "manager", "employee"] },
      { to: "/messages", icon: MessageSquare, label: "Messages", roles: ["admin", "manager", "employee", "client"], badge: "3" },
    ],
  },
  {
    title: "Management",
    items: [
      { to: "/team", icon: Users, label: "Team", roles: ["admin", "manager"] },
      { to: "/clients", icon: UserCheck, label: "Clients", roles: ["admin", "manager", "client"] },
      { to: "/tasks", icon: ClipboardList, label: "Tasks", roles: ["admin", "manager", "employee"] },
      { to: "/projects", icon: FolderKanban, label: "Projects", roles: ["admin", "manager", "employee"] },
    ],
  },
  {
    title: "HR & Finance",
    items: [
      { to: "/hiring", icon: Briefcase, label: "Hiring", roles: ["admin", "manager"] },
      { to: "/invoices", icon: CreditCard, label: "Invoices", roles: ["admin", "manager", "client"] },
      { to: "/reports", icon: FileText, label: "Reports", roles: ["admin"] },
    ],
  },
  {
    title: "System",
    items: [
      { to: "/roles", icon: Shield, label: "Roles & Access", roles: ["admin"] },
      { to: "/settings", icon: Settings, label: "Settings", roles: ["admin", "manager", "employee", "client"] },
    ],
  },
];

const colorSwatches: { value: ThemeColor; color: string; label: string }[] = [
  { value: "teal", color: "bg-[hsl(173,58%,39%)]", label: "Teal" },
  { value: "violet", color: "bg-[hsl(262,83%,58%)]", label: "Violet" },
  { value: "rose", color: "bg-[hsl(346,77%,50%)]", label: "Rose" },
  { value: "amber", color: "bg-[hsl(38,92%,50%)]", label: "Amber" },
  { value: "blue", color: "bg-[hsl(217,91%,60%)]", label: "Blue" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { role, color, setColor } = useTheme();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar border-r border-sidebar-border sidebar-transition",
        collapsed ? "w-[72px]" : "w-[270px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-sidebar-border">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <span className="font-display text-lg font-extrabold bg-gradient-to-r from-primary-foreground/90 to-primary-foreground/60 bg-clip-text text-transparent whitespace-nowrap">
                CRM Pro
              </span>
              <p className="text-[10px] text-sidebar-muted font-medium -mt-0.5">Enterprise Suite</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => item.roles.includes(role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted px-3 mb-2"
                  >
                    {section.title}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium sidebar-transition relative",
                        isActive
                          ? "bg-sidebar-active/15 text-sidebar-active shadow-sm"
                          : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-foreground"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-sidebar-active"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-sidebar-active" : "group-hover:text-sidebar-foreground")} />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="flex items-center justify-between flex-1 whitespace-nowrap overflow-hidden"
                          >
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className={cn(
                                "ml-auto text-[10px] font-bold rounded-full px-1.5 py-0.5",
                                item.badge === "New"
                                  ? "bg-success/20 text-success"
                                  : "bg-destructive/20 text-destructive"
                              )}>
                                {item.badge}
                              </span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Color picker (only when expanded) */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 border-t border-sidebar-border"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted mb-2 flex items-center gap-1">
              <Palette className="h-3 w-3" /> Theme Color
            </p>
            <div className="flex gap-2">
              {colorSwatches.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setColor(s.value)}
                  className={cn(
                    "h-6 w-6 rounded-full transition-all",
                    s.color,
                    color === s.value ? "ring-2 ring-offset-2 ring-offset-sidebar ring-sidebar-foreground scale-110" : "opacity-60 hover:opacity-100"
                  )}
                  title={s.label}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn("flex items-center gap-3 rounded-xl p-2 hover:bg-sidebar-hover transition-colors cursor-pointer", collapsed && "justify-center")}>
          <div className="relative">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/30 text-sm font-bold text-sidebar-foreground">
              JD
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-sidebar" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 overflow-hidden"
              >
                <p className="text-sm font-semibold text-sidebar-foreground truncate">John Doe</p>
                <p className="text-[10px] text-sidebar-muted capitalize">{role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <div className="px-3 pb-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-xl p-2 text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground sidebar-transition"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  );
}
