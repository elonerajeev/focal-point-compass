import { useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, ArrowUpRight, Command } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { commandActions, conversations, invoices, clientRecords, projectRecords, reports, taskBoard, teamMembers } from "@/data/mock-crm";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface SearchEntry {
  id: string;
  title: string;
  description: string;
  route?: string;
  intent?: "open-quick-create" | "open-settings";
}

function highlightText(text: string, query: string) {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, "ig");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <span key={index} className="bg-primary/20 text-primary font-medium">
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

export default function CommandPalette() {
  const { commandOpen, closeCommandPalette, openQuickCreate, canUseQuickCreate } = useWorkspace();
  const { role } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  // Build search entries
  const searchEntries = useMemo(() => {
    const entries: SearchEntry[] = [];

    // Actions
    if (canUseQuickCreate) {
      entries.push({
        id: "quick-create",
        title: "Quick Create",
        description: "Create new client, project, task, or invoice",
        intent: "open-quick-create",
      });
    }

    // Clients
    clientRecords.slice(0, 8).forEach((client) => {
      entries.push({
        id: `client-${client.id}`,
        title: client.name,
        description: `${client.industry} • ${client.tier}`,
        route: "/sales/clients",
      });
    });

    // Projects
    projectRecords.slice(0, 6).forEach((project) => {
      entries.push({
        id: `project-${project.id}`,
        title: project.name,
        description: `${project.status} • ${project.stage}`,
        route: "/workspace/projects",
      });
    });

    // Tasks
    [...taskBoard.todo, ...taskBoard["in-progress"], ...taskBoard.done].slice(0, 8).forEach((task) => {
      entries.push({
        id: `task-${task.id}`,
        title: task.title,
        description: `${task.priority} priority • ${task.assignee}`,
        route: "/workspace/tasks",
      });
    });

    // Team
    teamMembers.slice(0, 6).forEach((member) => {
      entries.push({
        id: `member-${member.id}`,
        title: member.name,
        description: `${member.role} • ${member.department}`,
        route: "/people/team",
      });
    });

    return entries;
  }, [canUseQuickCreate]);

  // Filter results
  const filteredEntries = useMemo(() => {
    if (!deferredQuery) return searchEntries.slice(0, 12);
    
    return searchEntries
      .filter((entry) => 
        entry.title.toLowerCase().includes(deferredQuery.toLowerCase()) ||
        entry.description.toLowerCase().includes(deferredQuery.toLowerCase())
      )
      .slice(0, 8);
  }, [searchEntries, deferredQuery]);

  const handleSelect = (entry: SearchEntry) => {
    if (entry.intent === "open-quick-create") {
      openQuickCreate();
    } else if (entry.route) {
      navigate(entry.route);
    }
    closeCommandPalette();
  };

  return (
    <CommandDialog open={commandOpen} onOpenChange={closeCommandPalette}>
      <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950/30">
        <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Search className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Global Search</p>
            <p className="text-xs text-muted-foreground">Find anything in your workspace</p>
          </div>
        </div>
        
        <CommandInput
          placeholder="Search clients, projects, tasks, team..."
          value={query}
          onValueChange={setQuery}
          className="border-0 bg-transparent px-4 py-3 text-sm focus:ring-0"
        />
        
        <CommandList className="max-h-80 overflow-y-auto px-2 pb-2">
          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
            No results found for "{deferredQuery}"
          </CommandEmpty>
          
          {filteredEntries.length > 0 && (
            <CommandGroup>
              {filteredEntries.map((entry) => (
                <CommandItem
                  key={entry.id}
                  onSelect={() => handleSelect(entry)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-200",
                    "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50",
                    "data-[selected=true]:bg-gradient-to-r data-[selected=true]:from-blue-100 data-[selected=true]:to-purple-100",
                    "dark:data-[selected=true]:from-blue-900/50 dark:data-[selected=true]:to-purple-900/50"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600">
                    {entry.intent === "open-quick-create" ? (
                      <Sparkles className="h-4 w-4 text-primary" />
                    ) : entry.route?.includes("client") ? (
                      <ArrowUpRight className="h-4 w-4 text-blue-500" />
                    ) : entry.route?.includes("project") ? (
                      <ArrowUpRight className="h-4 w-4 text-purple-500" />
                    ) : entry.route?.includes("task") ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {highlightText(entry.title, deferredQuery)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {highlightText(entry.description, deferredQuery)}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Command className="h-3 w-3" />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
        
        <div className="border-t border-border/50 px-4 py-2">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">↵</kbd> to select • <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Esc</kbd> to close
          </p>
        </div>
      </div>
    </CommandDialog>
  );
}
