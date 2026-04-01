import { useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ClipboardList, FolderKanban, Search, Sparkles, Users, Zap } from "lucide-react";

import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useClients, useProjects, useTasks, useTeamMembers } from "@/hooks/use-crm-data";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { cn } from "@/lib/utils";

type EntryType = "action" | "client" | "project" | "task" | "member";

interface SearchEntry {
  id: string;
  title: string;
  description: string;
  type: EntryType;
  route?: string;
  intent?: "open-quick-create";
}

const typeConfig: Record<EntryType, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  action:  { icon: Sparkles,     color: "text-primary bg-primary/10",     label: "Action" },
  client:  { icon: Building2,    color: "text-blue-500 bg-blue-500/10",   label: "Client" },
  project: { icon: FolderKanban, color: "text-violet-500 bg-violet-500/10", label: "Project" },
  task:    { icon: ClipboardList, color: "text-emerald-500 bg-emerald-500/10", label: "Task" },
  member:  { icon: Users,        color: "text-orange-500 bg-orange-500/10", label: "Member" },
};

export default function CommandPalette() {
  const { commandOpen, closeCommandPalette, openQuickCreate, canUseQuickCreate } = useWorkspace();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  // Only fetch when open - enabled flag
  const { data: clients = [] }     = useClients();
  const { data: projects = [] }    = useProjects();
  const { data: tasks = { todo: [], "in-progress": [], done: [] } } = useTasks();
  const { data: teamMembers = [] } = useTeamMembers();

  const allEntries = useMemo<SearchEntry[]>(() => {
    const entries: SearchEntry[] = [];

    if (canUseQuickCreate) {
      entries.push({ id: "quick-create", title: "Quick Create", description: "New client, project, task, or invoice", type: "action", intent: "open-quick-create" });
    }

    clients.slice(0, 10).forEach(c => entries.push({ id: `c-${c.id}`, title: c.name, description: `${c.industry} · ${c.tier} · ${c.status}`, type: "client", route: "/sales/clients" }));
    projects.slice(0, 8).forEach(p => entries.push({ id: `p-${p.id}`, title: p.name, description: `${p.stage} · ${p.progress}% complete`, type: "project", route: "/workspace/projects" }));
    [...tasks.todo, ...tasks["in-progress"], ...tasks.done].slice(0, 10).forEach(t => entries.push({ id: `t-${t.id}`, title: t.title, description: `${t.priority} · ${t.assignee}`, type: "task", route: "/workspace/tasks" }));
    teamMembers.slice(0, 8).forEach(m => entries.push({ id: `m-${m.id}`, title: m.name, description: `${m.designation} · ${m.department}`, type: "member", route: "/people/team" }));

    return entries;
  }, [canUseQuickCreate, clients, projects, tasks, teamMembers]);

  const filtered = useMemo(() => {
    if (!deferredQuery.trim()) return allEntries.slice(0, 10);
    const q = deferredQuery.toLowerCase();
    return allEntries.filter(e =>
      e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [allEntries, deferredQuery]);

  // Group by type when no query
  const grouped = useMemo(() => {
    if (deferredQuery.trim()) return null;
    const groups: Partial<Record<EntryType, SearchEntry[]>> = {};
    for (const e of filtered) {
      if (!groups[e.type]) groups[e.type] = [];
      groups[e.type]!.push(e);
    }
    return groups;
  }, [filtered, deferredQuery]);

  const handleSelect = (entry: SearchEntry) => {
    if (entry.intent === "open-quick-create") openQuickCreate();
    else if (entry.route) navigate(entry.route);
    closeCommandPalette();
    setQuery("");
  };

  const renderItem = (entry: SearchEntry) => {
    const cfg = typeConfig[entry.type];
    const Icon = cfg.icon;
    return (
      <CommandItem
        key={entry.id}
        onSelect={() => handleSelect(entry)}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer"
      >
        <div className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg", cfg.color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{entry.title}</p>
          <p className="text-xs text-muted-foreground truncate">{entry.description}</p>
        </div>
        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide flex-shrink-0">{cfg.label}</span>
      </CommandItem>
    );
  };

  return (
    <CommandDialog open={commandOpen} onOpenChange={open => { if (!open) { closeCommandPalette(); setQuery(""); } }} filter={() => 1}>
      <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Global Search</p>
            <p className="text-[11px] text-muted-foreground">{allEntries.length} items indexed</p>
          </div>
        </div>

        <CommandInput
          placeholder="Search clients, projects, tasks, team..."
          value={query}
          onValueChange={setQuery}
          className="border-0 bg-transparent"
        />

        <CommandList className="max-h-[360px] overflow-y-auto p-2">
          <CommandEmpty className="py-8 text-center">
            <Search className="mx-auto mb-2 h-6 w-6 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No results for "{deferredQuery}"</p>
          </CommandEmpty>

          {grouped ? (
            // Grouped view when no query
            (Object.entries(grouped) as [EntryType, SearchEntry[]][]).map(([type, items]) => (
              <CommandGroup key={type} heading={typeConfig[type].label}>
                {items.map(renderItem)}
              </CommandGroup>
            ))
          ) : (
            // Flat filtered results
            <CommandGroup heading={`${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}>
              {filtered.map(renderItem)}
            </CommandGroup>
          )}
        </CommandList>

        <div className="border-t border-border/50 px-4 py-2 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            <kbd className="rounded bg-secondary px-1.5 py-0.5 text-[10px]">↑↓</kbd> navigate
            {" · "}
            <kbd className="rounded bg-secondary px-1.5 py-0.5 text-[10px]">↵</kbd> select
            {" · "}
            <kbd className="rounded bg-secondary px-1.5 py-0.5 text-[10px]">Esc</kbd> close
          </p>
          <p className="text-[10px] text-muted-foreground">⌘K</p>
        </div>
      </div>
    </CommandDialog>
  );
}
