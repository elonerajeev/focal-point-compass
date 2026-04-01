import { Globe, KeyRound, Link2, Mail, PlugZap, Webhook, Construction } from "lucide-react";
import {
  SiGooglecalendar,
  SiGmail,
  SiZapier,
  SiStripe,
  SiGithub,
  SiNotion,
  SiHubspot,
  SiJira,
  SiMailchimp,
} from "@icons-pack/react-simple-icons";
import { cn } from "@/lib/utils";

type IntegrationItem = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  eta: string;
  category: string;
};

const integrations: IntegrationItem[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Send workspace alerts, task updates, and approvals to Slack channels.",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
      </svg>
    ),
    iconColor: "#4A154B",
    eta: "Q2 2026",
    category: "Communication",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync meetings, deadlines, and events with Google Calendar.",
    icon: SiGooglecalendar,
    iconColor: "#4285F4",
    eta: "Q2 2026",
    category: "Calendar",
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Send transactional emails and workflow notifications via Gmail API.",
    icon: SiGmail,
    iconColor: "#EA4335",
    eta: "Q2 2026",
    category: "Communication",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Sync contacts, deals, and pipeline data with HubSpot CRM.",
    icon: SiHubspot,
    iconColor: "#FF7A59",
    eta: "Q3 2026",
    category: "CRM",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Connect payment processing and invoice automation via Stripe.",
    icon: SiStripe,
    iconColor: "#635BFF",
    eta: "Q3 2026",
    category: "Finance",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Automate workflows by connecting this CRM to 5000+ apps via Zapier.",
    icon: SiZapier,
    iconColor: "#FF4A00",
    eta: "Q2 2026",
    category: "Automation",
  },
  {
    id: "webhooks",
    name: "Webhooks",
    description: "Push real-time event payloads to your backend systems.",
    icon: Webhook,
    iconColor: undefined,
    eta: "Q3 2026",
    category: "Developer",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Link project tasks and milestones to GitHub issues and PRs.",
    icon: SiGithub,
    iconColor: "#181717",
    eta: "Q3 2026",
    category: "Developer",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Sync notes, wikis, and project docs with Notion workspaces.",
    icon: SiNotion,
    iconColor: "#000000",
    eta: "Q4 2026",
    category: "Productivity",
  },
  {
    id: "jira",
    name: "Jira",
    description: "Sync tasks and project milestones with Jira boards.",
    icon: SiJira,
    iconColor: "#0052CC",
    eta: "Q4 2026",
    category: "Productivity",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Sync client lists and trigger email campaigns from CRM events.",
    icon: SiMailchimp,
    iconColor: "#FFE01B",
    eta: "Q4 2026",
    category: "Marketing",
  },
  {
    id: "api-access",
    name: "REST API",
    description: "Manage API keys for external systems and custom integrations.",
    icon: KeyRound,
    iconColor: undefined,
    eta: "Q2 2026",
    category: "Developer",
  },
];

const categories = [...new Set(integrations.map((i) => i.category))];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <section className="rounded-[1.75rem] border border-border/70 bg-card/90 p-6 shadow-card">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            <PlugZap className="h-3.5 w-3.5 text-primary" />
            Integrations
          </div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Integrations</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Connect your workspace with external tools and services. Integrations are currently in development.
          </p>
        </div>
      </section>

      {/* Under development banner */}
      <section className="rounded-[1.5rem] border border-warning/30 bg-warning/5 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-warning/10">
            <Construction className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Integrations are under development</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Our team is actively building these connections. Each integration will be available as it reaches production-ready status. You'll be notified when they go live.
            </p>
          </div>
        </div>
      </section>

      {/* Integration cards by category */}
      {categories.map((category) => (
        <section key={category} className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground px-1">{category}</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {integrations.filter((i) => i.category === category).map((integration) => (
              <div
                key={integration.id}
                className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70"
                      style={{ backgroundColor: integration.iconColor ? `${integration.iconColor}18` : undefined }}
                    >
                      <integration.icon
                        className="h-5 w-5"
                        style={{ color: integration.iconColor ?? "currentColor" }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{integration.name}</p>
                      <span className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-secondary/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
                        In development · {integration.eta}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">{integration.description}</p>
                <button
                  disabled
                  className={cn(
                    "mt-4 w-full rounded-xl border border-dashed border-border/50 bg-secondary/10 py-2 text-xs font-medium text-muted-foreground/60 cursor-not-allowed",
                  )}
                >
                  Coming soon
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
