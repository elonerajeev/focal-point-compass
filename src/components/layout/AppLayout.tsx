import { useState } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import FloatingElements from "@/components/shared/FloatingElements";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingElements />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={cn("sidebar-transition relative z-10", collapsed ? "ml-[72px]" : "ml-[270px]")}>
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
