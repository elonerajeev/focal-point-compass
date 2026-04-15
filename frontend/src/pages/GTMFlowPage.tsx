import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Target,
  Users,
  Handshake,
  Building2,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Bell,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { crmService } from "@/services/crm";
import { cn } from "@/lib/utils";
import { RADIUS, TEXT } from "@/lib/design-tokens";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function GTMFlowPage() {
  const { data: gtmData, isLoading } = useQuery({
    queryKey: ["gtm-overview"],
    queryFn: crmService.getGTMOverview,
    refetchInterval: 60000,
  });

  const stages = [
    {
      id: "lead",
      icon: Target,
      title: "Lead",
      description: "New potential customer enters the system",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-500",
      count: gtmData?.summary?.totalLeads || 0,
      status: "start",
    },
    {
      id: "contact",
      icon: Users,
      title: "Contact",
      description: "Contact created when lead is reached out",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      textColor: "text-yellow-500",
      count: gtmData?.summary?.totalContacts || 0,
      status: "middle",
    },
    {
      id: "deal",
      icon: Handshake,
      title: "Deal",
      description: "Opportunity created when lead is qualified",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      textColor: "text-purple-500",
      count: gtmData?.summary?.totalDeals || 0,
      status: "middle",
    },
    {
      id: "client",
      icon: Building2,
      title: "Client",
      description: "Won deal converts lead to client",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      textColor: "text-green-500",
      count: gtmData?.summary?.totalClients || 0,
      status: "end",
    },
  ];

  const conditions = [
    {
      from: "Lead",
      to: "Contact",
      trigger: "Status = contacted",
      icon: CheckCircle2,
      color: "text-blue-500",
      description: "When you mark a lead as 'Contacted'",
      badge: "Auto",
      badgeColor: "bg-green-500/10 text-green-500 border-green-500/30",
    },
    {
      from: "Lead",
      to: "Deal",
      trigger: "Status = qualified",
      icon: CheckCircle2,
      color: "text-blue-500",
      description: "When a lead becomes 'Qualified'",
      badge: "Auto",
      badgeColor: "bg-green-500/10 text-green-500 border-green-500/30",
    },
    {
      from: "Lead",
      to: "Client",
      trigger: "Status = closed_won",
      icon: Building2,
      color: "text-green-500",
      description: "When a deal is successfully closed",
      badge: "Auto",
      badgeColor: "bg-green-500/10 text-green-500 border-green-500/30",
    },
  ];

  const automationActions = [
    {
      title: "Creates Contact",
      description: "A new contact is created from the lead's information",
      icon: Users,
      color: "text-yellow-500",
      when: "Lead status → contacted",
    },
    {
      title: "Creates Deal",
      description: "A new deal opportunity is created in the pipeline",
      icon: Handshake,
      color: "text-purple-500",
      when: "Lead status → qualified",
    },
    {
      title: "Creates Task",
      description: "A follow-up task is automatically assigned",
      icon: CheckCircle2,
      color: "text-info",
      when: "Any stage change",
    },
    {
      title: "Creates Client",
      description: "Lead is converted to a client when deal is won",
      icon: Building2,
      color: "text-green-500",
      when: "Deal → closed_won",
    },
    {
      title: "Sends Alert",
      description: "Alerts are sent for stale deals or churn risk",
      icon: Bell,
      color: "text-warning",
      when: "7+ days inactive",
    },
    {
      title: "Updates Score",
      description: "Lead score is recalculated based on activity",
      icon: TrendingUp,
      color: "text-primary",
      when: "On change",
    },
  ];

  const stats = [
    { label: "Total Leads", value: gtmData?.summary?.totalLeads || 0, color: "text-blue-500" },
    { label: "Contacts Created", value: gtmData?.summary?.totalContacts || 0, color: "text-yellow-500" },
    { label: "Deals in Pipeline", value: gtmData?.summary?.totalDeals || 0, color: "text-purple-500" },
    { label: "Clients Won", value: gtmData?.summary?.totalClients || 0, color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <motion.div variants={container} initial="hidden" animate="show" className="text-center space-y-4">
          <motion.div variants={item}>
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm">
              <Zap className="mr-2 h-4 w-4 text-primary" />
              Automated Lifecycle
            </Badge>
          </motion.div>
          <motion.h1 variants={item} className="text-4xl font-display font-bold text-foreground">
            How Lead-to-Client Works
          </motion.h1>
          <motion.p variants={item} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how leads automatically flow through the system and become clients. 
            Every step is tracked and automated.
          </motion.p>
        </motion.div>

        {/* Live Stats */}
        <motion.div variants={container} initial="hidden" animate="show">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <motion.div key={stat.label} variants={item}>
                <Card className={cn("border-border/40", RADIUS.lg)}>
                  <CardContent className="p-4 text-center">
                    <p className={cn("text-3xl font-bold", stat.color)}>{stat.value}</p>
                    <p className={cn("text-sm text-muted-foreground", TEXT.meta)}>{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Flow Diagram */}
        <motion.div variants={container} initial="hidden" animate="show">
          <Card className={cn("border-border/60 shadow-card", RADIUS.xl)}>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                The Lifecycle Flow
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Watch how a lead automatically becomes a client
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Visual Flow */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
                {stages.map((stage, idx) => (
                  <motion.div
                    key={stage.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <div className={cn(
                      "flex-1 min-w-[140px] rounded-xl border-2 p-4 text-center transition-all hover:scale-105",
                      stage.bgColor,
                      stage.borderColor
                    )}>
                      <div className={cn("mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br border", stage.color, "text-white")}>
                        <stage.icon className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-foreground">{stage.title}</p>
                      <p className={cn("text-2xl font-bold", stage.textColor)}>{stage.count}</p>
                      <p className={cn("text-xs text-muted-foreground mt-1", TEXT.meta)}>{stage.description}</p>
                    </div>
                    {idx < stages.length - 1 && (
                      <ArrowRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Arrow Labels */}
              <div className="flex justify-between px-8 text-sm text-muted-foreground">
                <span>Lead enters</span>
                <span className="flex items-center gap-1 text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                  Conditions met
                </span>
                <span>Client created</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Conditions That Trigger */}
        <motion.div variants={container} initial="hidden" animate="show">
          <Card className={cn("border-border/60 shadow-card", RADIUS.xl)}>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                What Triggers Each Step
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                When these conditions are met, automation takes over
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {conditions.map((condition, idx) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="rounded-xl border border-border/40 bg-secondary/20 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        {condition.from}
                        <ArrowRight className="mx-2 h-4 w-4 inline" />
                        {condition.to}
                      </span>
                      <Badge className={cn("text-xs border", condition.badgeColor)}>
                        {condition.badge}
                      </Badge>
                    </div>
                    <p className="font-semibold text-foreground">{condition.trigger}</p>
                    <p className={cn("text-sm text-muted-foreground mt-1", TEXT.meta)}>
                      {condition.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* What Happens Automatically */}
        <motion.div variants={container} initial="hidden" animate="show">
          <Card className={cn("border-border/60 shadow-card", RADIUS.xl)}>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                What Happens Automatically
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                The system does all of this for you - no manual work needed
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {automationActions.map((action, idx) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="rounded-xl border border-border/40 bg-secondary/20 p-4 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", action.color, "bg-current/10")}>
                        <action.icon className="h-4 w-4" style={{ color: 'currentColor' }} />
                      </div>
                      <span className="font-semibold text-foreground">{action.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {action.when}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lead Stage Journey */}
        <motion.div variants={container} initial="hidden" animate="show">
          <Card className={cn("border-border/60 shadow-card", RADIUS.xl)}>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Lead Stage Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {[
                  { stage: "New", color: "bg-blue-500", created: "Lead added" },
                  { stage: "Contacted", color: "bg-yellow-500", created: "Contact created" },
                  { stage: "Qualified", color: "bg-green-500", created: "Deal created" },
                  { stage: "Proposal", color: "bg-orange-500", created: "" },
                  { stage: "Negotiation", color: "bg-purple-500", created: "" },
                  { stage: "Won", color: "bg-emerald-500", created: "Client created" },
                ].map((s, idx) => (
                  <motion.div
                    key={s.stage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex items-center gap-2 rounded-full border border-border/40 bg-secondary/20 px-4 py-2">
                      <div className={cn("h-3 w-3 rounded-full", s.color)} />
                      <span className="text-sm font-medium text-foreground">{s.stage}</span>
                    </div>
                    {s.created && (
                      <span className="text-xs text-green-500 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {s.created}
                      </span>
                    )}
                    {idx < 5 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary */}
        <motion.div variants={container} initial="hidden" animate="show">
          <Card className={cn("border-border/60 shadow-card bg-gradient-to-br from-primary/5 to-transparent", RADIUS.xl)}>
            <CardContent className="p-8 text-center">
              <motion.div variants={item}>
                <RefreshCw className="mx-auto h-12 w-12 text-primary mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Everything is Automated
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  From the moment a lead enters, the system automatically creates contacts, 
                  deals, and eventually clients. You just focus on selling!
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
