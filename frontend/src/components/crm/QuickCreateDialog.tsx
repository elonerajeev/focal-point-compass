import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, CheckCircle2, ClipboardList, CreditCard, FolderKanban, Zap } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { triggerHaptic } from "@/lib/micro-interactions";
import { crmService } from "@/services/crm";
import { crmKeys } from "@/hooks/use-crm-data";
import { useSharedTeamMembers } from "@/lib/team-roster";

const workflows = [
  { id: "client",  title: "New Client",    description: "Account with owner, segment, and next action.", icon: Building2,   color: "text-blue-500",   activeBg: "bg-blue-500/10 border-blue-500/30" },
  { id: "project", title: "New Project",   description: "Delivery track with budget and milestones.",    icon: FolderKanban, color: "text-violet-500", activeBg: "bg-violet-500/10 border-violet-500/30" },
  { id: "task",    title: "New Task",      description: "Execution task with priority and due date.",    icon: ClipboardList, color: "text-emerald-500", activeBg: "bg-emerald-500/10 border-emerald-500/30" },
  { id: "invoice", title: "Invoice Draft", description: "Finance-ready invoice draft for review.",       icon: CreditCard,   color: "text-orange-500", activeBg: "bg-orange-500/10 border-orange-500/30" },
];

export default function QuickCreateDialog() {
  const { quickCreateOpen, closeQuickCreate, canUseQuickCreate } = useWorkspace();
  const sharedTeamMembers = useSharedTeamMembers();
  const [selected, setSelected] = useState(workflows[0].id);
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0");
  const [taskAssigneeKind, setTaskAssigneeKind] = useState<"team" | "member">("member");
  const [taskAssigneeValue, setTaskAssigneeValue] = useState("");
  const queryClient = useQueryClient();

  const selectedWorkflow = useMemo(() => workflows.find(w => w.id === selected) ?? workflows[0], [selected]);
  const availableTeams = useMemo(() => Array.from(new Set(sharedTeamMembers.map(m => m.team))).filter(Boolean), [sharedTeamMembers]);
  const availableMembers = useMemo(() => sharedTeamMembers.map(m => ({ value: m.email, label: `${m.name} · ${m.designation}` })), [sharedTeamMembers]);

  const inputCls = "h-10 w-full rounded-xl border border-border/70 bg-background/60 px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20";

  const createMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      switch (workflowId) {
        case "client":
          return crmService.createClient({ name: name.trim(), industry: "General", manager: owner.trim() || "Unassigned", status: "pending", revenue: "$0", location: "Unassigned", avatar: (name.trim() || "CL").slice(0, 2).toUpperCase(), tier: priority === "high" ? "Enterprise" : "Growth", healthScore: 75, nextAction: description.trim() || "Follow up", segment: "New Business", email: `${name.trim().toLowerCase().replace(/\s+/g, ".") || "client"}@client.local`, phone: "", company: name.trim() || "New Client" });
        case "project":
          return crmService.createProject({ name: name.trim() || "New Project", description: description.trim(), progress: 0, status: "pending", team: [owner.trim().slice(0, 2).toUpperCase() || "OW"], dueDate: dueDate || "", tasks: { done: 0, total: 0 }, stage: "Discovery", budget: "$0" });
        case "task": {
          const member = availableMembers.find(m => m.value === taskAssigneeValue);
          const assignee = taskAssigneeKind === "team" ? (taskAssigneeValue || "Team") : ((member?.label.split(" · ")[0] ?? taskAssigneeValue) || "Unassigned");
          return crmService.createTask({ title: name.trim() || "New Task", assignee, avatar: assignee.slice(0, 2).toUpperCase(), priority, dueDate: dueDate || new Date().toISOString().slice(0, 10), tags: ["Quick Create"], valueStream: "Growth" });
        }
        case "invoice":
          return crmService.createInvoice({ client: name.trim() || "New Client", amount: `$${Number(amount || 0).toLocaleString()}`, date: new Date().toISOString().slice(0, 10), due: dueDate || new Date().toISOString().slice(0, 10), status: "pending" });
        default: return null;
      }
    },
    onSuccess: async (_, workflowId) => {
      const keyMap: Record<string, typeof crmKeys.clients> = { client: crmKeys.clients, project: crmKeys.projects, task: crmKeys.tasks, invoice: crmKeys.invoices };
      await queryClient.invalidateQueries({ queryKey: keyMap[workflowId] });
      triggerHaptic("success");
      toast.success(`${selectedWorkflow.title} created!`);
      closeQuickCreate();
      setName(""); setOwner(""); setPriority("medium"); setDueDate(""); setDescription(""); setAmount("0"); setTaskAssigneeKind("member"); setTaskAssigneeValue("");
    },
    onError: () => toast.error(`Failed to create ${selectedWorkflow.title.toLowerCase()}.`),
  });

  if (!canUseQuickCreate) return null;

  return (
    <Dialog open={quickCreateOpen} onOpenChange={open => !open && closeQuickCreate()}>
      <DialogContent className="w-[min(96vw,56rem)] max-w-none overflow-hidden rounded-[1.75rem] border border-border/70 bg-card p-0 shadow-xl">
        <div className="grid lg:grid-cols-[220px_1fr]">

          {/* Left - workflow picker */}
          <div className="border-b border-border/60 bg-secondary/30 p-5 lg:border-b-0 lg:border-r">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Quick Create</p>
                <p className="text-[11px] text-muted-foreground">Choose what to create</p>
              </div>
            </div>

            <div className="space-y-2">
              {workflows.map(w => {
                const Icon = w.icon;
                const isActive = w.id === selected;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSelected(w.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
                      isActive ? w.activeBg : "border-transparent hover:bg-secondary/60"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? w.color : "text-muted-foreground")} />
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-semibold", isActive ? "text-foreground" : "text-muted-foreground")}>{w.title}</p>
                      <p className="text-[10px] text-muted-foreground/70 line-clamp-1">{w.description}</p>
                    </div>
                    {isActive && <CheckCircle2 className={cn("h-4 w-4 flex-shrink-0", w.color)} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right - form */}
          <div className="p-6">
            <DialogHeader className="mb-5">
              <DialogTitle className="font-display text-xl font-semibold text-foreground">{selectedWorkflow.title}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">{selectedWorkflow.description}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</span>
                <input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder={`${selectedWorkflow.title} name`} />
              </label>

              {selected !== "task" && (
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Owner</span>
                  <input value={owner} onChange={e => setOwner(e.target.value)} className={inputCls} placeholder="Assign owner" />
                </label>
              )}

              {selected === "task" && (
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Assign to</span>
                  <div className="flex gap-2">
                    <Select value={taskAssigneeKind} onValueChange={v => { setTaskAssigneeKind(v as "team" | "member"); setTaskAssigneeValue(""); }}>
                      <SelectTrigger className="w-28 h-10 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={taskAssigneeValue} onValueChange={setTaskAssigneeValue}>
                      <SelectTrigger className="flex-1 h-10 rounded-xl"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {taskAssigneeKind === "member"
                          ? availableMembers.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)
                          : availableTeams.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</span>
                <select value={priority} onChange={e => setPriority(e.target.value as "high" | "medium" | "low")} className={inputCls}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Due Date</span>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputCls} />
              </label>

              {selected === "invoice" && (
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Amount ($)</span>
                  <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} placeholder="0" />
                </label>
              )}

              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</span>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none" placeholder="Optional description..." />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => { triggerHaptic("selection"); closeQuickCreate(); }} className="rounded-xl border border-border/70 bg-secondary/30 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground">
                Cancel
              </button>
              <button type="button" disabled={createMutation.isPending || !name.trim()} onClick={() => createMutation.mutate(selected)} className={cn("rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50", selectedWorkflow.color.replace("text-", "bg-").replace("-500", "-500 hover:opacity-90"))}>
                {createMutation.isPending ? "Creating..." : `Create ${selectedWorkflow.title}`}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
