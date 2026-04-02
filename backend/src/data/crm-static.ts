export type LeadSource = "website" | "referral" | "social" | "email" | "phone" | "event" | "advertisement" | "other";
export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
export type DealStage = "prospecting" | "qualification" | "proposal" | "negotiation" | "closed-won" | "closed-lost";
export type CompanySize = "startup" | "small" | "medium" | "large" | "enterprise";
export type SalesMetrics = {
  totalRevenue: number;
  monthlyRevenue: number;
  dealsWon: number;
  dealsLost: number;
  conversionRate: number;
  averageDealSize: number;
  salesCycle: number;
  pipelineValue: number;
  forecastedRevenue: number;
};

export type ContactRecord = {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  isPrimary: boolean;
  avatar?: string;
  createdAt: string;
};

export type CompanyRecord = {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: CompanySize;
  phone?: string;
  email?: string;
  status: "active" | "inactive" | "prospect";
  contacts: ContactRecord[];
  deals: Array<Record<string, never>>;
  value: number;
  createdAt: string;
  updatedAt: string;
};

export type LeadRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  assignedTo?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  convertedAt?: string;
  convertedToClientId?: string;
};

export type DealRecord = {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number;
  expectedCloseDate: string;
  actualCloseDate?: string;
  companyId?: string;
  contactId?: string;
  assignedTo: string;
  description?: string;
  tags: string[];
  activities: [];
  createdAt: string;
  updatedAt: string;
};

export type CommandActionRecord = {
  id: string;
  title: string;
  description: string;
  section: string;
  route?: string;
  shortcut?: string;
  intent?: "open-quick-create" | "open-settings";
};

export type ThemePreviewRecord = {
  label: string;
  subtitle: string;
  vibe: string;
};

export type ConversationSeedRecord = {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  team: string;
};

export type MessageSeedRecord = {
  id: number;
  conversationId: number;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
};

export const commandActions: CommandActionRecord[] = [
  { id: "open-dashboard", title: "Open Dashboard", description: "Review pipeline, revenue, and team focus", section: "Navigate", route: "/overview" },
  { id: "open-activity", title: "Open Activity", description: "See events, notifications, and updates", section: "Navigate", route: "/overview/activity" },
  { id: "open-clients", title: "Open Clients", description: "View accounts, health scores, and next actions", section: "Navigate", route: "/sales/clients" },
  { id: "open-attendance", title: "Open Attendance", description: "Review check-ins, remote work, and absences", section: "Navigate", route: "/people/attendance" },
  { id: "open-projects", title: "Open Projects", description: "Track delivery progress and budgets", section: "Navigate", route: "/workspace/projects" },
  { id: "open-leads", title: "Open Leads", description: "Review early-stage opportunities", section: "Navigate", route: "/sales/leads" },
  { id: "open-deals", title: "Open Deals", description: "Track pipeline close probability", section: "Navigate", route: "/sales/deals" },
  { id: "open-analytics", title: "Open Analytics", description: "Inspect business trends and growth", section: "Navigate", route: "/insights/analytics" },
  { id: "quick-create", title: "Quick Create", description: "Add a client, project, task, or invoice draft", section: "Actions", shortcut: "Shift+N", intent: "open-quick-create" },
  { id: "open-settings", title: "Open Settings", description: "Adjust workspace, theme, and role preview", section: "Actions", route: "/system/settings" },
];

export const themePreviews: Record<string, ThemePreviewRecord> = {
  ocean: { label: "Ocean", subtitle: "Professional SaaS blue", vibe: "Best for corporate CRM, sales leadership, and clean data density." },
  midnight: { label: "Midnight", subtitle: "Dark executive mode", vibe: "Best for night users, dense dashboards, and high-contrast workflows." },
  nebula: { label: "Nebula", subtitle: "Startup premium gradient", vibe: "Best for modern product teams and a more expressive brand feel." },
  slate: { label: "Slate", subtitle: "Minimal enterprise", vibe: "Best for conservative corporate environments and long-form work." },
};

export const leadRecords: LeadRecord[] = [
  {
    id: "lead-1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@newcorp.com",
    phone: "+1-555-1234",
    company: "NewCorp Industries",
    jobTitle: "VP of Operations",
    source: "website",
    status: "qualified",
    score: 85,
    assignedTo: "user-1",
    notes: "Interested in enterprise package. Budget approved.",
    tags: ["enterprise", "hot-lead"],
    createdAt: "2024-03-20T09:00:00Z",
    updatedAt: "2024-03-25T14:30:00Z",
  },
  {
    id: "lead-2",
    firstName: "Michael",
    lastName: "Chen",
    email: "m.chen@innovate.co",
    phone: "+1-555-5678",
    company: "Innovate Co",
    jobTitle: "CTO",
    source: "referral",
    status: "contacted",
    score: 72,
    assignedTo: "user-2",
    notes: "Technical evaluation in progress.",
    tags: ["technical", "saas"],
    createdAt: "2024-03-22T11:15:00Z",
    updatedAt: "2024-03-26T09:45:00Z",
  },
  {
    id: "lead-3",
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily@fastgrow.com",
    phone: "+1-555-9012",
    company: "FastGrow Startup",
    jobTitle: "Founder",
    source: "social",
    status: "new",
    score: 45,
    assignedTo: "user-1",
    notes: "Early stage startup, limited budget.",
    tags: ["startup", "founder"],
    createdAt: "2024-03-25T16:20:00Z",
    updatedAt: "2024-03-25T16:20:00Z",
  },
];

export const dealRecords: DealRecord[] = [
  {
    id: "deal-1",
    title: "TechCorp Enterprise License",
    value: 125000,
    currency: "USD",
    stage: "negotiation",
    probability: 75,
    expectedCloseDate: "2024-04-15T00:00:00Z",
    companyId: "comp-1",
    contactId: "contact-1",
    assignedTo: "user-1",
    description: "Annual enterprise license with premium support",
    tags: ["enterprise", "annual"],
    activities: [],
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-03-25T15:30:00Z",
  },
  {
    id: "deal-2",
    title: "Global Dynamics Integration",
    value: 250000,
    currency: "USD",
    stage: "proposal",
    probability: 60,
    expectedCloseDate: "2024-05-01T00:00:00Z",
    companyId: "comp-2",
    contactId: "contact-2",
    assignedTo: "user-2",
    description: "Custom integration and implementation services",
    tags: ["integration", "custom"],
    activities: [],
    createdAt: "2024-02-15T14:00:00Z",
    updatedAt: "2024-03-26T11:00:00Z",
  },
  {
    id: "deal-3",
    title: "StartupX Growth Plan",
    value: 45000,
    currency: "USD",
    stage: "qualification",
    probability: 40,
    expectedCloseDate: "2024-04-30T00:00:00Z",
    companyId: "comp-3",
    assignedTo: "user-1",
    description: "Growth plan with scaling options",
    tags: ["growth", "startup"],
    activities: [],
    createdAt: "2024-03-10T09:30:00Z",
    updatedAt: "2024-03-24T16:45:00Z",
  },
];

export const companyRecords: CompanyRecord[] = [
  {
    id: "comp-1",
    name: "TechCorp Solutions",
    website: "https://techcorp.com",
    industry: "Technology",
    size: "medium",
    phone: "+1-555-0123",
    email: "contact@techcorp.com",
    status: "active",
    contacts: [],
    deals: [],
    value: 125000,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-03-20T14:30:00Z",
  },
  {
    id: "comp-2",
    name: "Global Dynamics",
    website: "https://globaldynamics.com",
    industry: "Manufacturing",
    size: "large",
    phone: "+1-555-0456",
    email: "info@globaldynamics.com",
    status: "prospect",
    contacts: [],
    deals: [],
    value: 250000,
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-03-25T16:45:00Z",
  },
  {
    id: "comp-3",
    name: "StartupX",
    website: "https://startupx.io",
    industry: "SaaS",
    size: "startup",
    phone: "+1-555-0789",
    email: "hello@startupx.io",
    status: "active",
    contacts: [],
    deals: [],
    value: 45000,
    createdAt: "2024-03-01T11:00:00Z",
    updatedAt: "2024-03-26T10:15:00Z",
  },
];

export const salesMetrics: SalesMetrics = {
  totalRevenue: 420000,
  monthlyRevenue: 125000,
  dealsWon: 8,
  dealsLost: 3,
  conversionRate: 72.7,
  averageDealSize: 52500,
  salesCycle: 45,
  pipelineValue: 420000,
  forecastedRevenue: 315000,
};

export const conversationSeedRecords: ConversationSeedRecord[] = [
  { id: 1, name: "Sarah Johnson", avatar: "SJ", lastMessage: "The client approved the proposal.", time: "2m", unread: 2, online: true, team: "Revenue" },
  { id: 2, name: "Mike Chen", avatar: "MC", lastMessage: "API docs are ready for review.", time: "15m", unread: 1, online: true, team: "Platform" },
  { id: 3, name: "Lisa Park", avatar: "LP", lastMessage: "Updated design tokens are in Figma.", time: "1h", unread: 0, online: false, team: "Design" },
  { id: 4, name: "Emily Davis", avatar: "ED", lastMessage: "Meeting notes from yesterday.", time: "3h", unread: 0, online: true, team: "Growth" },
  { id: 5, name: "Team General", avatar: "TG", lastMessage: "Emily: Let's sync tomorrow morning.", time: "6h", unread: 0, online: false, team: "All Hands" },
];

export const messageSeedRecords: MessageSeedRecord[] = [
  { id: 1, conversationId: 1, sender: "Sarah Johnson", text: "Hey John, just wrapped the call with Acme.", time: "10:30 AM", isMe: false },
  { id: 2, conversationId: 1, sender: "Me", text: "Did they lean toward the multi-year plan?", time: "10:32 AM", isMe: true },
  { id: 3, conversationId: 1, sender: "Sarah Johnson", text: "Yes. They want the annual contract with expansion seats in Q3.", time: "10:33 AM", isMe: false },
  { id: 4, conversationId: 2, sender: "Mike Chen", text: "I pushed the latest auth flow contract docs.", time: "09:18 AM", isMe: false },
  { id: 5, conversationId: 2, sender: "Me", text: "Perfect. I'll review the payload shapes today.", time: "09:24 AM", isMe: true },
];
