import { useMemo, useState } from "react";
import { BadgeDollarSign, CirclePlus, Search, Target, TrendingUp, Users } from "lucide-react";

import PageLoader from "@/components/shared/PageLoader";
import ErrorFallback from "@/components/shared/ErrorFallback";
import { useLeads, useDeals } from "@/hooks/use-crm-data";
import { TEXT } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

const ACTIVE_LEAD_STATUSES = new Set(["new", "contacted", "qualified", "proposal", "negotiation"]);
const ACTIVE_DEAL_STAGES = new Set(["prospecting", "qualification", "proposal", "negotiation"]);

export default function SalesPage() {
  const { data: leads = [], isLoading: leadsLoading, error: leadsError, refetch: refetchLeads } = useLeads();
  const { data: deals = [], isLoading: dealsLoading, error: dealsError, refetch: refetchDeals } = useDeals();
  const [leadSearch, setLeadSearch] = useState("");
  const [dealSearch, setDealSearch] = useState("");

  const activeLeads = useMemo(
    () => leads.filter((lead) => ACTIVE_LEAD_STATUSES.has(lead.status)),
    [leads],
  );

  const activeDeals = useMemo(
    () => deals.filter((deal) => ACTIVE_DEAL_STAGES.has(deal.stage)),
    [deals],
  );

  const filteredLeads = useMemo(() => {
    const q = leadSearch.toLowerCase();
    if (!q) return activeLeads;
    return activeLeads.filter(
      (lead) =>
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(q) ||
        (lead.company ?? "").toLowerCase().includes(q) ||
        (lead.assignedTo ?? "").toLowerCase().includes(q),
    );
  }, [activeLeads, leadSearch]);

  const filteredDeals = useMemo(() => {
    const q = dealSearch.toLowerCase();
    if (!q) return activeDeals;
    return activeDeals.filter(
      (deal) =>
        deal.title.toLowerCase().includes(q) ||
        deal.assignedTo.toLowerCase().includes(q),
    );
  }, [activeDeals, dealSearch]);

  const totalPipelineValue = useMemo(
    () => activeDeals.reduce((sum, deal) => sum + (deal.value ?? 0), 0),
    [activeDeals],
  );

  const avgForecast = useMemo(
    () =>
      activeDeals.length
        ? Math.round(activeDeals.reduce((sum, deal) => sum + deal.probability, 0) / activeDeals.length)
        : 0,
    [activeDeals],
  );

  if (leadsLoading || dealsLoading) return <PageLoader />;

  if (leadsError) {
    return (
      <ErrorFallback
        title="Leads failed to load"
        error={leadsError}
        description="Could not load the leads pipeline. Retry to refresh."
        onRetry={() => refetchLeads()}
        retryLabel="Retry leads"
      />
    );
  }

  if (dealsError) {
    return (
      <ErrorFallback
        title="Deals failed to load"
        error={dealsError}
        description="Could not load the deals pipeline. Retry to refresh."
        onRetry={() => refetchDeals()}
        retryLabel="Retry deals"
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-border/70 bg-card/90 p-6 shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className={cn("inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/45 px-3 py-1 text-xs uppercase tracking-[0.22em] text-muted-foreground", TEXT.eyebrow)}>
              <CirclePlus className="h-3.5 w-3.5 text-primary" />
              Sales
            </div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Pipeline</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Consolidated leads and deals so the team focuses on routing, scoring, and closing.
            </p>
          </div>
          {totalPipelineValue > 0 && (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-success/40 bg-success/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-success">
              ${totalPipelineValue.toLocaleString()} pipeline value
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Active leads",
              value: activeLeads.length > 0 ? String(activeLeads.length) : "None",
              detail: "Ready for nurture",
              icon: Users,
            },
            {
              label: "Deals in motion",
              value: activeDeals.length > 0 ? String(activeDeals.length) : "None",
              detail: "High propensity",
              icon: Target,
            },
            {
              label: "Avg forecast",
              value: activeDeals.length > 0 ? `${avgForecast}%` : "—",
              detail: "Probabilistic",
              icon: TrendingUp,
            },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-border/60 bg-secondary/20 p-4 shadow-inner">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <card.icon className="h-4 w-4" />
              </div>
              <p className={cn("uppercase tracking-[0.18em] text-muted-foreground", TEXT.eyebrow)}>{card.label}</p>
              <p className="font-display text-2xl font-semibold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          {/* Leads */}
          <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Leads</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-foreground">Early funnel</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  placeholder="Search leads"
                  className="h-9 rounded-2xl border border-border/70 bg-background/55 pl-9 pr-3 text-xs text-foreground outline-none transition focus:border-primary"
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <article key={lead.id} className="rounded-xl border border-border/70 bg-secondary/15 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {lead.company ?? "—"}
                          {lead.assignedTo ? ` · ${lead.assignedTo}` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-border/70 bg-secondary/30 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {lead.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Score {lead.score}/100</span>
                      <span className="capitalize">via {lead.source}</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border/60 bg-secondary/10 p-6 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {leadSearch ? "No matching leads" : "No active leads"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {leadSearch
                      ? "Try a different search term."
                      : "Leads will appear here as they enter the pipeline."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Deals */}
          <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Deals</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-foreground">High-intent pipeline</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={dealSearch}
                  onChange={(e) => setDealSearch(e.target.value)}
                  placeholder="Search deals"
                  className="h-9 rounded-2xl border border-border/70 bg-background/55 pl-9 pr-3 text-xs text-foreground outline-none transition focus:border-primary"
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {filteredDeals.length > 0 ? (
                filteredDeals.map((deal) => (
                  <article key={deal.id} className="rounded-xl border border-border/70 bg-secondary/15 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{deal.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {deal.stage} · {deal.assignedTo}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-foreground">
                        {deal.currency} {deal.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Probability {deal.probability}%</span>
                      <span>Close: {deal.expectedCloseDate}</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border/60 bg-secondary/10 p-6 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {dealSearch ? "No matching deals" : "No active deals"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dealSearch
                      ? "Try a different search term."
                      : "Deals in progress will appear here."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5 shadow-card">
            <div className="flex items-center gap-3">
              <BadgeDollarSign className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold text-foreground">Pipeline summary</p>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { label: "Total leads", value: String(leads.length) },
                { label: "Total deals", value: String(deals.length) },
                { label: "Won deals", value: String(deals.filter((d) => d.stage === "closed-won").length) },
                { label: "Lost deals", value: String(deals.filter((d) => d.stage === "closed-lost").length) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-secondary/20 px-4 py-3"
                >
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border/70 bg-card/90 p-5 shadow-card">
            <p className={cn("text-muted-foreground", TEXT.eyebrow)}>Pipeline notes</p>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>Leads stay separate from clients so late-stage revenue doesn't blur qualification.</p>
              <p>Stage and score fields are the ones wired to automation services first.</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
