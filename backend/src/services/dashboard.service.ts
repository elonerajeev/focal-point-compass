import { prisma } from "../config/prisma";

const pipelineColors = [
  { name: "Qualified", color: "hsl(211 38% 51%)" },
  { name: "Proposal", color: "hsl(213 43% 64%)" },
  { name: "Negotiation", color: "hsl(202 100% 88%)" },
  { name: "Closed Won", color: "hsl(173 58% 39%)" },
];

export const dashboardService = {
  async get() {
    // TODO: add 5-min cache.
    const [clientCounts, projectCounts, taskCounts, memberCounts, invoiceCounts, invoices, members] = await Promise.all([
      prisma.client.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.project.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.task.groupBy({
        by: ["column"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.teamMember.groupBy({
        by: ["attendance"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.invoice.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.invoice.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        select: { amount: true, createdAt: true, date: true },
      }),
      prisma.teamMember.findMany({
        where: { deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 4,
        select: { id: true, name: true, designation: true, avatar: true },
      }),
    ]);

    const totalClients = clientCounts.reduce((sum, entry) => sum + entry._count._all, 0);
    const activeClients = clientCounts.find((entry) => entry.status === "active")?._count._all ?? 0;
    const pendingClients = clientCounts.find((entry) => entry.status === "pending")?._count._all ?? 0;

    const totalProjects = projectCounts.reduce((sum, entry) => sum + entry._count._all, 0);
    const activeProjects = projectCounts.find((entry) => entry.status === "active")?._count._all ?? 0;

    const totalTasks = taskCounts.reduce((sum, entry) => sum + entry._count._all, 0);
    const completedTasks = taskCounts.find((entry) => entry.column === "done")?._count._all ?? 0;

    const totalMembers = memberCounts.reduce((sum, entry) => sum + entry._count._all, 0);
    const presentMembers = memberCounts.find((entry) => entry.attendance === "present")?._count._all ?? 0;

    const totalInvoices = invoiceCounts.reduce((sum, entry) => sum + entry._count._all, 0);

    const totalInvoiceRevenue = invoices.reduce((sum, invoice) => {
      const numeric = Number(String(invoice.amount).replace(/[^0-9.]/g, ""));
      return sum + (Number.isFinite(numeric) ? numeric : 0);
    }, 0);

    const monthlyRevenue = invoices.reduce<Record<string, { revenue: number; deals: number; retention: number }>>(
      (acc, invoice) => {
        // Use the invoice date field (billing date) not createdAt
        const invoiceDate = invoice.date ? new Date(invoice.date) : invoice.createdAt;
        const month = invoiceDate.toLocaleString("en-US", { month: "short" });
        acc[month] ??= { revenue: 0, deals: 0, retention: 0 };
        const numeric = Number(String(invoice.amount).replace(/[^0-9.]/g, ""));
        acc[month].revenue += Number.isFinite(numeric) ? numeric : 0;
        acc[month].deals += 1;
        acc[month].retention = totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0;
        return acc;
      },
      {},
    );

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const revenueSeries = months.map((month) => {
      const entry = monthlyRevenue[month];
      return {
        month,
        revenue: entry?.revenue ?? 0,
        deals: entry?.deals ?? 0,
        retention: entry?.retention ?? (totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0),
      };
    });

    const pipelineBreakdown = pipelineColors.map((entry) => {
      const value =
        entry.name === "Qualified"
          ? clientCounts.find((item) => item.status === "pending")?._count._all ?? 0
          : entry.name === "Proposal"
            ? clientCounts.find((item) => item.status === "active")?._count._all ?? 0
            : entry.name === "Negotiation"
              ? projectCounts.find((item) => item.status === "in_progress")?._count._all ?? 0
              : projectCounts.find((item) => item.status === "completed")?._count._all ?? 0;
      return { name: entry.name, value, color: entry.color };
    });

    // Get job postings count for hiring metric
    const jobPostingsCount = await prisma.jobPosting.count({
      where: { deletedAt: null, status: "open" },
    });
    const totalJobPostings = await prisma.jobPosting.count({
      where: { deletedAt: null },
    });

    const operatingCadence = [
      { name: "Revenue", value: totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0 },
      { name: "Delivery", value: totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 0 },
      { name: "Support", value: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0 },
      { name: "Ops", value: totalMembers > 0 ? Math.round((presentMembers / totalMembers) * 100) : 0 },
      { name: "Hiring", value: totalJobPostings > 0 ? Math.round((jobPostingsCount / totalJobPostings) * 100) : 0 },
    ];

    const executionReadiness = Math.round(operatingCadence.reduce((sum, item) => sum + item.value, 0) / operatingCadence.length);

    // Calculate revenue growth
    const currentMonthRevenue = revenueSeries[revenueSeries.length - 1]?.revenue ?? 0;
    const previousMonthRevenue = revenueSeries[revenueSeries.length - 2]?.revenue ?? 0;
    const revenueGrowth = previousMonthRevenue > 0 
      ? Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
      : 0;

    // Real unread message count from Conversation table
    const unreadResult = await prisma.conversation.aggregate({
      where: { deletedAt: null },
      _sum: { unread: true },
    });
    const unreadMessages = unreadResult._sum.unread ?? 0;

    // Real 28-day activity heatmap from record creation dates
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 27);
    twentyEightDaysAgo.setHours(0, 0, 0, 0);

    const [recentTasks, recentClients, recentProjects, recentInvoices] = await Promise.all([
      prisma.task.findMany({ where: { createdAt: { gte: twentyEightDaysAgo }, deletedAt: null }, select: { createdAt: true } }),
      prisma.client.findMany({ where: { createdAt: { gte: twentyEightDaysAgo }, deletedAt: null }, select: { createdAt: true } }),
      prisma.project.findMany({ where: { createdAt: { gte: twentyEightDaysAgo }, deletedAt: null }, select: { createdAt: true } }),
      prisma.invoice.findMany({ where: { createdAt: { gte: twentyEightDaysAgo }, deletedAt: null }, select: { createdAt: true } }),
    ]);

    const activityByDate: Record<string, number> = {};
    for (const record of [...recentTasks, ...recentClients, ...recentProjects, ...recentInvoices]) {
      const date = record.createdAt.toISOString().split("T")[0];
      activityByDate[date] = (activityByDate[date] ?? 0) + 1;
    }

    const activityHeatmap = Array.from({ length: 28 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (27 - i));
      const dateStr = d.toISOString().split("T")[0];
      return { date: dateStr, count: activityByDate[dateStr] ?? 0 };
    });

    // Calculate at-risk accounts using real health scores
    const atRiskClients = await prisma.client.count({
      where: {
        deletedAt: null,
        healthScore: { lt: 70 },
      },
    });

    // Get priority accounts (top clients by health score and tier)
    const priorityAccounts = await prisma.client.findMany({
      where: {
        deletedAt: null,
        status: "active",
      },
      orderBy: [
        { tier: "asc" }, // Enterprise first
        { healthScore: "desc" },
      ],
      take: 3,
    });

    // Get at-risk account details
    const atRiskAccountDetails = await prisma.client.findMany({
      where: {
        deletedAt: null,
        healthScore: { lt: 70 },
      },
      orderBy: { healthScore: "asc" },
      take: 5,
    });

    return {
      metrics: [
        {
          label: "Revenue Run Rate",
          value: totalInvoiceRevenue >= 1_000_000
            ? `$${(totalInvoiceRevenue / 1_000_000).toFixed(2)}M`
            : totalInvoiceRevenue >= 1_000
              ? `$${(totalInvoiceRevenue / 1_000).toFixed(1)}K`
              : totalInvoiceRevenue > 0
                ? `$${totalInvoiceRevenue}`
                : "No data",
          change: totalInvoiceRevenue > 0 ? `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}%` : "—",
          direction: revenueGrowth >= 0 ? "up" as const : "down" as const,
          detail: totalInvoiceRevenue > 0 ? "from invoice ledger" : "No invoices yet",
        },
        {
          label: "Active Clients",
          value: totalClients > 0 ? String(activeClients) : "No data",
          change: totalClients > 0 ? `${pendingClients > 0 ? '+' : ''}${pendingClients}` : "—",
          direction: "up" as const,
          detail: totalClients > 0 ? "active accounts" : "No clients yet",
        },
        {
          label: "Pipeline Coverage",
          value: totalProjects > 0 && activeClients > 0 
            ? `${Math.max(0.1, Math.round((activeClients / totalProjects) * 10) / 10)}x` 
            : "No data",
          change: totalProjects > 0 ? `${activeProjects} active` : "—",
          direction: "up" as const,
          detail: totalProjects > 0 ? "against workload" : "No projects yet",
        },
        {
          label: "At-Risk Accounts",
          value: totalClients > 0 ? String(atRiskClients) : "No data",
          change: totalClients > 0 ? `${atRiskClients} accounts` : "—",
          direction: atRiskClients === 0 ? "up" as const : "down" as const,
          detail: totalClients > 0 ? "health score below 70" : "No clients yet",
        },
      ],
      revenueSeries,
      pipelineBreakdown,
      operatingCadence,
      activityFeed: totalClients > 0 || totalProjects > 0 || totalTasks > 0 ? [
        ...(activeProjects > 0 ? [{ id: 1, text: `${activeProjects} active projects are in progress`, time: "5 min ago", type: "active" as const, category: "delivery" as const, source: "Projects" }] : []),
        ...(totalTasks > 0 ? [{ id: 2, text: `${totalTasks} tracked tasks in the current board`, time: "18 min ago", type: "pending" as const, category: "collaboration" as const, source: "Tasks" }] : []),
        ...(totalMembers > 0 ? [{ id: 3, text: `${totalMembers} team members synchronized`, time: "42 min ago", type: "completed" as const, category: "system" as const, source: "People" }] : []),
        ...(totalInvoices > 0 ? [{ id: 4, text: `${totalInvoices} invoices available`, time: "2 hours ago", type: "in-progress" as const, category: "finance" as const, source: "Billing" }] : []),
      ] : [
        { id: 1, text: "No activity yet. Start by adding clients or projects.", time: "now", type: "pending" as const, category: "system" as const, source: "System" },
      ],
      todayFocus: totalClients > 0 || totalProjects > 0 ? [
        `${activeProjects} projects are currently active.`,
        `${pendingClients} clients need follow-up.`,
        `${completedTasks} tasks are already completed.`,
      ] : [
        "No data available yet.",
        "Start by adding clients and projects.",
        "Your workspace is ready to use.",
      ],
      executionReadiness,
      collaborators: members.map((member) => ({
        id: String(member.id),
        name: member.name,
        role: member.designation,
        avatar: member.avatar,
        status: "online" as const,
        lastSeen: "now",
      })),
      focusClients: priorityAccounts,
      atRiskClients: atRiskAccountDetails,
      unreadMessages,
      activityHeatmap,
    };
  },
};
