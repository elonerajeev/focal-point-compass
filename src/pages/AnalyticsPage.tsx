import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight, Globe } from "lucide-react";
import { SimpleAreaChart } from "@/components/shared/SimpleCharts";

const monthlyData = [
  { month: "Jan", revenue: 12400, clients: 45, tasks: 120 },
  { month: "Feb", revenue: 15200, clients: 52, tasks: 135 },
  { month: "Mar", revenue: 18300, clients: 61, tasks: 142 },
  { month: "Apr", revenue: 16800, clients: 58, tasks: 128 },
  { month: "May", revenue: 21500, clients: 67, tasks: 155 },
  { month: "Jun", revenue: 24200, clients: 73, tasks: 168 },
];

const metrics = [
  { label: "Conversion Rate", value: "24.8%", change: "+3.2%", up: true, icon: TrendingUp },
  { label: "Avg Deal Size", value: "$8,420", change: "+12.5%", up: true, icon: DollarSign },
  { label: "Client Retention", value: "94.2%", change: "+1.8%", up: true, icon: Users },
  { label: "Response Time", value: "2.4h", change: "-18%", up: true, icon: Globe },
];

const topPerformers = [
  { name: "Sarah Johnson", deals: 28, revenue: "$124K", avatar: "SJ", trend: "+15%" },
  { name: "Mike Chen", deals: 22, revenue: "$98K", avatar: "MC", trend: "+8%" },
  { name: "Lisa Park", deals: 19, revenue: "$87K", avatar: "LP", trend: "+22%" },
  { name: "Emily Davis", deals: 17, revenue: "$76K", avatar: "ED", trend: "+5%" },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AnalyticsPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-display font-bold text-foreground">Analytics</h1>
            <p className="mt-1 text-sm text-muted-foreground">Deep insights into your business performance</p>
          </div>
          <div className="rounded-full border border-border/70 bg-secondary/30 px-3 py-1 text-xs font-medium text-muted-foreground">
            Jan - Jun snapshot
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-5 shadow-card card-hover">
            <div className="flex items-start justify-between">
              <m.icon className="h-5 w-5 text-primary" />
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${m.up ? "text-success" : "text-destructive"}`}>
                {m.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {m.change}
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground mt-3">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-card backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">Revenue Trend</h3>
              <p className="text-sm text-muted-foreground">Monthly revenue across the first half of the year</p>
            </div>
            <span className="rounded-full border border-border/60 bg-secondary/25 px-3 py-1 text-xs font-medium text-muted-foreground">
              USD
            </span>
          </div>
          <SimpleAreaChart
            data={monthlyData.map(({ month, revenue }) => ({ label: month, value: revenue }))}
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary) / 0.18)"
            accentFill="hsl(var(--accent) / 0.16)"
          />
        </div>

        <div className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-card backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">Client Growth</h3>
              <p className="text-sm text-muted-foreground">Active client count, month over month</p>
            </div>
            <span className="rounded-full border border-border/60 bg-secondary/25 px-3 py-1 text-xs font-medium text-muted-foreground">
              Active
            </span>
          </div>
          <SimpleAreaChart
            data={monthlyData.map(({ month, clients }) => ({ label: month, value: clients }))}
            stroke="hsl(var(--accent))"
            fill="hsl(var(--accent) / 0.16)"
            accentFill="hsl(var(--info) / 0.14)"
            showDots={false}
          />
        </div>
      </motion.div>

      {/* Top Performers */}
      <motion.div variants={item} className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-card">
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">Top Performers 🏆</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topPerformers.map((p, i) => (
            <div key={p.name} className="rounded-xl border border-border bg-secondary/30 p-4 text-center card-hover">
              <div className="relative mx-auto w-fit mb-3">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg font-bold text-foreground">{p.avatar}</div>
                {i === 0 && <span className="absolute -top-1 -right-1 text-lg">👑</span>}
              </div>
              <p className="font-semibold text-sm text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{p.deals} deals · {p.revenue}</p>
              <p className="text-xs text-success font-medium mt-1">{p.trend}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
