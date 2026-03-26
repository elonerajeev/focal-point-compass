import { useState } from "react";
import { Building2, ClipboardList, CreditCard, FolderKanban, Sparkles, Zap, CheckCircle2, Clock, User } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { RADIUS, SPACING, TEXT } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { triggerHaptic } from "@/lib/micro-interactions";

const workflows = [
  {
    id: "client",
    title: "New Client",
    description: "Create an account shell with owner, segment, and next action.",
    icon: Building2,
    gradient: "from-blue-500/20 via-blue-400/10 to-transparent",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    border: "border-blue-500/20",
  },
  {
    id: "project",
    title: "New Project", 
    description: "Open a delivery track, assign budget, and map milestones.",
    icon: FolderKanban,
    gradient: "from-purple-500/20 via-purple-400/10 to-transparent",
    iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
    border: "border-purple-500/20",
  },
  {
    id: "task",
    title: "New Task",
    description: "Create an execution task with priority, owner, and due date.",
    icon: ClipboardList,
    gradient: "from-emerald-500/20 via-emerald-400/10 to-transparent",
    iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    border: "border-emerald-500/20",
  },
  {
    id: "invoice",
    title: "Invoice Draft",
    description: "Generate a finance-ready invoice draft for review.",
    icon: CreditCard,
    gradient: "from-orange-500/20 via-orange-400/10 to-transparent",
    iconBg: "bg-gradient-to-br from-orange-500 to-orange-600",
    border: "border-orange-500/20",
  },
];

export default function QuickCreateDialog() {
  const { quickCreateOpen, closeQuickCreate, canUseQuickCreate } = useWorkspace();
  const [selected, setSelected] = useState(workflows[0].id);

  if (!canUseQuickCreate) {
    return null;
  }

  return (
    <Dialog open={quickCreateOpen} onOpenChange={(open) => (open ? undefined : closeQuickCreate())}>
      <DialogContent className={cn("w-[min(96vw,64rem)] max-w-none overflow-hidden border-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950/30 p-0 shadow-[0_40px_100px_rgba(0,0,0,0.25)] backdrop-blur-xl", RADIUS.xl)}>
        <div className="max-h-[min(92vh,48rem)] overflow-hidden lg:grid lg:grid-cols-[0.8fr_1.2fr]">
          {/* Left Panel - Workflow Selection */}
          <div className={cn("border-b border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-blue-950/95 backdrop-blur-xl", SPACING.card, "lg:flex lg:min-h-[32rem] lg:flex-col lg:border-b-0 lg:border-r lg:border-white/10 lg:p-6")}>
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className={cn("flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg", RADIUS.lg)}>
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-display text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Quick Create</p>
                <p className="text-blue-200/70 text-sm">Choose what to create</p>
              </div>
            </div>

            {/* Workflow Options */}
            <div className="flex-1 space-y-3">
              {workflows.map((workflow) => {
                const Icon = workflow.icon;
                const isSelected = workflow.id === selected;

                return (
                  <button
                    key={workflow.id}
                    type="button"
                    onClick={() => setSelected(workflow.id)}
                    className={cn(
                      "premium-hover w-full text-left transition-all duration-300 group relative overflow-hidden",
                      RADIUS.lg,
                      SPACING.cardCompact,
                      isSelected
                        ? `border ${workflow.border} bg-gradient-to-r ${workflow.gradient} shadow-lg scale-[1.02]`
                        : "border border-white/10 bg-white/5 hover:bg-white/10 hover:scale-[1.01]",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 items-center justify-center text-white shadow-md", workflow.iconBg, RADIUS.md)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">{workflow.title}</p>
                        <p className="text-blue-200/70 text-sm">{workflow.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className={cn("flex min-h-0 flex-col bg-gradient-to-br from-white via-slate-50 to-blue-50/50 dark:from-slate-800 dark:via-slate-700 dark:to-blue-900/20", SPACING.card, "lg:p-6")}>
            <DialogHeader className="mb-6 text-left">
              <DialogTitle className="font-display text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 dark:from-white dark:to-blue-300 bg-clip-text text-transparent">
                {workflows.find((workflow) => workflow.id === selected)?.title}
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-300">
                Fill in the details to create your {workflows.find((workflow) => workflow.id === selected)?.title.toLowerCase()}.
              </DialogDescription>
            </DialogHeader>
            
            {/* Form Fields */}
            <div className="grid gap-4 md:grid-cols-2 flex-1">
              <label className="space-y-2">
                <span className="font-medium text-slate-700 dark:text-slate-200">Name</span>
                <input 
                  className={cn("h-10 w-full border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20", RADIUS.md)} 
                  placeholder="Enter a name" 
                />
              </label>
              
              <label className="space-y-2">
                <span className="font-medium text-slate-700 dark:text-slate-200">Owner</span>
                <input 
                  className={cn("h-10 w-full border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20", RADIUS.md)} 
                  placeholder="Assign owner" 
                />
              </label>
              
              <label className="space-y-2">
                <span className="font-medium text-slate-700 dark:text-slate-200">Priority</span>
                <select 
                  className={cn("h-10 w-full border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20", RADIUS.md)}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
              
              <label className="space-y-2">
                <span className="font-medium text-slate-700 dark:text-slate-200">Due Date</span>
                <input 
                  type="date"
                  className={cn("h-10 w-full border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20", RADIUS.md)} 
                />
              </label>
              
              <label className="space-y-2 md:col-span-2">
                <span className="font-medium text-slate-700 dark:text-slate-200">Description</span>
                <textarea 
                  className={cn("min-h-20 w-full border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20", RADIUS.md)} 
                  placeholder="Add a description..." 
                />
              </label>
            </div>
            
            {/* Actions */}
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("selection");
                  closeQuickCreate();
                }}
                className={cn("premium-hover border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 font-medium text-slate-700 dark:text-slate-200 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-700", RADIUS.md, SPACING.button)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("success");
                  toast.success(`${workflows.find((workflow) => workflow.id === selected)?.title} created!`, {
                    description: "Your item has been created successfully.",
                  });
                  closeQuickCreate();
                }}
                className={cn("premium-hover bg-gradient-to-r from-blue-500 to-purple-600 font-medium text-white transition-all duration-200 hover:from-blue-600 hover:to-purple-700 shadow-lg", RADIUS.md, SPACING.button)}
              >
                Create {workflows.find((workflow) => workflow.id === selected)?.title}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
