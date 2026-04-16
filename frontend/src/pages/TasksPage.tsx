import { useEffect, useMemo, useState, useCallback, memo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ChevronLeft, ChevronRight, Flag, Pin, Plus, Search, Edit2, Trash2, 
  RefreshCw, MessageSquare, CheckCircle2, Clock, ListTodo, GripVertical,
  Calendar, User, Tag, ArrowRight, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import PageLoader from "@/components/shared/PageLoader";
import ShowMoreButton from "@/components/shared/ShowMoreButton";
import ErrorFallback from "@/components/shared/ErrorFallback";
import TaskDetailModal from "@/components/crm/TaskDetailModal";
import { useTheme } from "@/contexts/ThemeContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { crmKeys, useProjects, useTasks } from "@/hooks/use-crm-data";
import { crmService } from "@/services/crm";
import type { TaskColumn, TaskRecord } from "@/types/crm";
import { cn } from "@/lib/utils";
import { RADIUS, SPACING, TEXT } from "@/lib/design-tokens";
import { Button } from "@/components/ui/button";
import { readStoredJSON, writeStoredJSON } from "@/lib/preferences";
import { useRefresh } from "@/hooks/use-refresh";
import { getRefreshMessage, getRefreshSuccessMessage } from "@/lib/refresh-messages";

const priorityConfig = {
  high:   { color: "text-destructive bg-destructive/10 border-destructive/30", dot: "bg-destructive", label: "High", gradient: "from-destructive/20 to-destructive/5" },
  medium: { color: "text-warning bg-warning/10 border-warning/30",         dot: "bg-warning", label: "Medium", gradient: "from-warning/20 to-warning/5" },
  low:    { color: "text-success bg-success/10 border-success/30",         dot: "bg-success", label: "Low", gradient: "from-success/20 to-success/5" },
} as const;

const columnMeta: Record<TaskColumn, { label: string; tone: string; dot: string; headerBg: string; gradient: string; icon: typeof Clock }> = {
  todo:          { label: "To Do",       tone: "border-warning/30",  dot: "bg-warning",  headerBg: "bg-warning/10", gradient: "from-warning/10 to-transparent", icon: Clock },
  "in-progress": { label: "In Progress", tone: "border-info/30",     dot: "bg-info",     headerBg: "bg-info/10", gradient: "from-info/10 to-transparent", icon: ListTodo },
  done:          { label: "Completed",   tone: "border-success/30",  dot: "bg-success",  headerBg: "bg-success/10", gradient: "from-success/10 to-transparent", icon: CheckCircle2 },
};

const orderedColumns: TaskColumn[] = ["todo", "in-progress", "done"];

function readPinned(key: string) {
  return readStoredJSON<string[]>(key, []);
}

interface TaskCardProps {
  task: TaskRecord;
  column: TaskColumn;
  projectName?: string;
  pinned: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isMoving?: boolean;
  onMove: (taskId: number, direction: "left" | "right") => void;
  onPin: (taskId: number) => void;
  onDelete: (taskId: number) => void;
  onClick: (task: TaskRecord) => void;
}

const TaskCard = memo(function TaskCard({
  task,
  column,
  projectName,
  pinned,
  canEdit,
  canDelete,
  isMoving = false,
  onMove,
  onPin,
  onDelete,
  onClick,
}: TaskCardProps) {
  const { openQuickCreate } = useWorkspace();
  const [isDragging, setIsDragging] = useState(false);

  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] ?? priorityConfig.medium;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && column !== "done";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, boxShadow: "0 8px 30px -10px rgba(0,0,0,0.15)" }}
      drag
      dragSnapToOrigin
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      className={cn(
        "group relative rounded-2xl border bg-card p-4 cursor-grab active:cursor-grabbing transition-all duration-200",
        "hover:border-primary/30",
        pinned && "ring-2 ring-primary/20 ring-offset-2 ring-offset-background",
        isDragging && "opacity-50 scale-105 rotate-1 shadow-2xl z-50",
        isMoving && "opacity-50 pointer-events-none"
      )}
    >
      {/* Drag Handle */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-muted-foreground/50" />
      </div>

      {/* Priority Badge */}
      <div className="absolute -top-2 right-3">
        <span className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm",
          priority.color,
          priority.gradient.includes("destructive") && "bg-gradient-to-r " + priority.gradient,
          priority.gradient.includes("warning") && "bg-gradient-to-r " + priority.gradient,
          priority.gradient.includes("success") && "bg-gradient-to-r " + priority.gradient,
          !priority.gradient.includes("destructive") && !priority.gradient.includes("warning") && !priority.gradient.includes("success") && "bg-gradient-to-r from-success/20 to-success/5"
        )}>
          <span className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} />
          {priority.label}
        </span>
      </div>

      {/* Pin Indicator */}
      {pinned && (
        <div className="absolute -top-2 left-3">
          <Pin className="h-4 w-4 text-primary fill-primary" />
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        {/* Title */}
        <h3 className="pr-12 text-sm font-semibold leading-snug text-foreground line-clamp-2">
          {task.title}
        </h3>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag} 
                className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-secondary/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag.length > 15 ? tag.slice(0, 15) + "..." : tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{task.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Project */}
        {projectName && (
          <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/5 border border-primary/20 px-2 py-1 text-xs font-medium text-primary">
            <Flag className="h-3 w-3" />
            {projectName}
          </div>
        )}

        {/* Meta Row */}
        <div className="flex items-center justify-between pt-1 border-t border-border/30">
          {/* Assignee */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-info/20 text-[10px] font-bold text-primary border border-primary/20">
              {task.avatar}
            </div>
            <span className="text-xs font-medium text-muted-foreground truncate max-w-[80px]">
              {task.assignee.split("@")[0]}
            </span>
          </div>

          {/* Due Date */}
          <div className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium",
            isOverdue ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-secondary/30 text-muted-foreground"
          )}>
            <Calendar className="h-3 w-3" />
            <span>{task.dueDate || "No date"}</span>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2">
          {/* Move Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMove(task.id, "left"); }}
              disabled={column === "todo" || isMoving}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/40 bg-background/50 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:hover:bg-background/50 disabled:hover:text-muted-foreground"
              title="Move left"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMove(task.id, "right"); }}
              disabled={column === "done" || isMoving}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/40 bg-background/50 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:hover:bg-background/50 disabled:hover:text-muted-foreground"
              title="Move right"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClick(task); }}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/40 bg-background/50 text-muted-foreground transition-all hover:bg-info/10 hover:text-info hover:border-info/30"
              title="View details"
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onPin(task.id); }}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg border transition-all",
                pinned 
                  ? "bg-primary/10 text-primary border-primary/30" 
                  : "border-border/40 bg-background/50 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
              )}
              title={pinned ? "Unpin" : "Pin"}
            >
              <Pin className={cn("h-3.5 w-3.5", pinned && "fill-primary")} />
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); openQuickCreate("task", task); }}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/40 bg-background/50 text-muted-foreground transition-all hover:bg-warning/10 hover:text-warning hover:border-warning/30"
                title="Edit"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/40 bg-background/50 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Moving Overlay */}
      {isMoving && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/80 backdrop-blur-sm">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
    </motion.article>
  );
});

export default function TasksPage() {
  const queryClient = useQueryClient();
  const { openQuickCreate, canUseQuickCreate } = useWorkspace();
  const { role } = useTheme();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const projectId = selectedProject === "all" ? undefined : Number(selectedProject);
  const { data, isLoading, error: tasksError, refetch } = useTasks(projectId);
  const { data: projects = [] } = useProjects();
  const [search, setSearch] = useState("");
  const [board, setBoard] = useState<Record<TaskColumn, TaskRecord[]> | null>(null);
  const pinnedKey = `crm-task-pins-${role}`;
  const [pinnedTaskIds, setPinnedTaskIds] = useState<string[]>([]);
  const TASK_PAGE_SIZE = 6;
  const [todoVisible, setTodoVisible] = useState(6);
  const [inProgressVisible, setInProgressVisible] = useState(6);
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [doneVisible, setDoneVisible] = useState(6);
  const [movingTaskId, setMovingTaskId] = useState<number | null>(null);
  const { refresh, isRefreshing } = useRefresh();

  const handleRefresh = useCallback(async () => {
    await refresh(
      () => refetch(),
      {
        message: getRefreshMessage("tasks"),
        successMessage: getRefreshSuccessMessage("tasks"),
      }
    );
  }, [refetch, refresh]);

  const canEdit = role === "admin" || role === "manager";
  const canDelete = role === "admin" || role === "manager";

  useEffect(() => {
    setPinnedTaskIds(readPinned(pinnedKey));
  }, [pinnedKey]);

  useEffect(() => {
    setBoard(null);
    setTodoVisible(TASK_PAGE_SIZE);
    setInProgressVisible(TASK_PAGE_SIZE);
    setDoneVisible(TASK_PAGE_SIZE);
  }, [data]);

  const effectiveBoard = board ?? data ?? null;
  const projectNameById = useMemo(
    () => new Map(projects.map((project) => [project.id, project.name])),
    [projects],
  );

  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, column }: { taskId: number; column: TaskColumn }) =>
      crmService.updateTask(taskId, { column }),
    onMutate: async ({ taskId }) => {
      setMovingTaskId(taskId);
    },
    onSuccess: async (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: crmKeys.tasks });
      queryClient.invalidateQueries({ queryKey: crmKeys.projects });
      toast.success(`Task moved to ${columnMeta[updatedTask.column].label}`);
    },
    onError: async (error) => {
      setBoard(null);
      await refetch();
      toast.error("Failed to move task. Board reloaded.");
    },
    onSettled: () => {
      setMovingTaskId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => crmService.removeTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.tasks });
      queryClient.invalidateQueries({ queryKey: crmKeys.projects });
      toast.success("Task removed successfully");
    },
    onError: () => toast.error("Failed to remove task"),
  });

  const togglePin = useCallback((taskId: number) => {
    const key = String(taskId);
    const next = pinnedTaskIds.includes(key)
      ? pinnedTaskIds.filter((id) => id !== key)
      : [key, ...pinnedTaskIds];
    setPinnedTaskIds(next);
    writeStoredJSON(pinnedKey, next);
  }, [pinnedTaskIds, pinnedKey]);

  const handleDelete = useCallback((taskId: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteMutation.mutate(taskId);
    }
  }, [deleteMutation]);

  const handleMove = useCallback((taskId: number, direction: "left" | "right") => {
    const currentBoard = effectiveBoard;
    if (!currentBoard || movingTaskId) return;

    const sourceColumn = orderedColumns.find((col) => currentBoard[col].some((task) => task.id === taskId));
    if (!sourceColumn) return;
    
    const currentIndex = orderedColumns.indexOf(sourceColumn);
    const nextColumn = direction === "left" ? orderedColumns[currentIndex - 1] : orderedColumns[currentIndex + 1];
    if (!nextColumn || nextColumn === sourceColumn) return;

    moveTaskMutation.mutate({ taskId, column: nextColumn });
  }, [effectiveBoard, moveTaskMutation, movingTaskId]);

  const handleCardClick = useCallback((task: TaskRecord) => {
    setSelectedTask(task);
    setTaskDetailOpen(true);
  }, []);

  const filteredBoard = useMemo(() => {
    if (!effectiveBoard) return null;

    return orderedColumns.reduce<Record<TaskColumn, TaskRecord[]>>((acc, column) => {
      const query = search.toLowerCase();
      const visible = effectiveBoard[column].filter((task) => {
        return (
          task.title.toLowerCase().includes(query) ||
          task.assignee.toLowerCase().includes(query) ||
          task.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          (task.projectId ? projectNameById.get(task.projectId)?.toLowerCase().includes(query) : false)
        );
      });
      acc[column] = [
        ...visible.filter((task) => pinnedTaskIds.includes(String(task.id))),
        ...visible.filter((task) => !pinnedTaskIds.includes(String(task.id))),
      ];
      return acc;
    }, {} as Record<TaskColumn, TaskRecord[]>);
  }, [effectiveBoard, pinnedTaskIds, projectNameById, search]);

  const hasVisibleTasks = filteredBoard
    ? orderedColumns.some((column) => filteredBoard[column].length > 0)
    : false;

  const visibleCountMap = useMemo(() => ({
    todo: todoVisible,
    "in-progress": inProgressVisible,
    done: doneVisible,
  }), [todoVisible, inProgressVisible, doneVisible]);

  const setVisibleCount = useCallback((column: TaskColumn, value: number) => {
    switch (column) {
      case "todo":
        setTodoVisible(value);
        break;
      case "in-progress":
        setInProgressVisible(value);
        break;
      case "done":
        setDoneVisible(value);
        break;
    }
  }, []);

  const stats = useMemo(() => {
    if (!data) return { todo: 0, inProgress: 0, done: 0, total: 0 };
    const todo = data.todo.length;
    const inProgress = data["in-progress"].length;
    const done = data.done.length;
    const total = todo + inProgress + done;
    return { todo, inProgress, done, total };
  }, [data]);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  if (tasksError) {
    return (
      <ErrorFallback
        title="Tasks failed to load"
        error={tasksError}
        description="The task board could not be loaded. Retry to refresh the latest board state."
        onRetry={() => refetch()}
        retryLabel="Retry tasks"
      />
    );
  }
  if (isLoading || !effectiveBoard || !filteredBoard) {
    return <PageLoader />;
  }

  const emptyMessage =
    role === "employee"
      ? "Tasks assigned to your team or yourself will appear here once someone adds them. Talk to your manager to get visibility."
      : "No tasks available yet. Create one via Quick Create.";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Hero Section */}
      <motion.section variants={item} className="relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5" />
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary via-info to-success" />
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-gradient-to-tr from-success/10 to-transparent blur-3xl" />

        <div className={cn("relative", SPACING.card)}>
          <div className="mb-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                <ListTodo className="h-3.5 w-3.5 text-primary" />
                Workspace
              </div>
              <h1 className="font-display text-3xl font-semibold text-foreground">
                Task <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">Board</span>
              </h1>
              <p className={cn("max-w-xl text-muted-foreground", TEXT.bodyRelaxed)}>
                Track tasks through execution states with drag-and-drop, pinning, and real-time updates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                Refresh
              </Button>
              {canUseQuickCreate && (
                <Button size="sm" onClick={openQuickCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Task
                </Button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "To Do", value: stats.todo, icon: Clock, gradient: "from-warning to-warning/60", textColor: "text-warning" },
              { label: "In Progress", value: stats.inProgress, icon: ListTodo, gradient: "from-info to-info/60", textColor: "text-info" },
              { label: "Completed", value: stats.done, icon: CheckCircle2, gradient: "from-success to-success/60", textColor: "text-success" },
              { label: "Total", value: stats.total, icon: Flag, gradient: "from-primary to-primary/60", textColor: "text-primary" },
            ].map((stat) => (
              <motion.div 
                key={stat.label} 
                whileHover={{ scale: 1.02 }}
                className={cn("relative overflow-hidden rounded-xl border border-border/40 bg-secondary/20 p-3 backdrop-blur-sm", RADIUS.md)}
              >
                <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", stat.gradient)} />
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br border backdrop-blur-sm", stat.gradient, "text-white border-white/10")}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={cn("text-2xl font-bold", stat.textColor)}>{stat.value.toLocaleString()}</p>
                    <p className={cn("text-muted-foreground text-xs font-medium", TEXT.meta)}>{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks, assignees, or tags..."
                className="h-10 w-full rounded-xl border border-border/40 bg-background/70 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <select
              value={selectedProject}
              onChange={(event) => setSelectedProject(event.target.value)}
              className="h-10 rounded-xl border border-border/40 bg-background/70 px-4 text-sm outline-none transition-colors focus:border-primary/50 cursor-pointer"
            >
              <option value="all">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={String(project.id)}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.section>

      {!hasVisibleTasks && (
        <div className="rounded-2xl border border-border/60 bg-secondary/10 p-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}

      {/* Kanban Board */}
      <section className="grid gap-4 xl:grid-cols-3">
        {orderedColumns.map((column, columnIndex) => {
          const meta = columnMeta[column];
          return (
            <div
              key={column}
              className={cn(
                "rounded-[1.5rem] border bg-card shadow-card overflow-hidden",
                meta.tone
              )}
            >
              {/* Column header */}
              <div className={cn("flex items-center justify-between px-4 py-3 border-b border-border/40", meta.headerBg)}>
                <div className="flex items-center gap-2">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 border border-border/30", `text-${meta.dot.replace('bg-', '')}`)}>
                    <meta.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{meta.label}</p>
                    <p className="text-[10px] text-muted-foreground">{filteredBoard[column].length} tasks</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {columnIndex > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        const firstTask = filteredBoard[column][0];
                        if (firstTask) handleMove(firstTask.id, "left");
                      }}
                      disabled={filteredBoard[column].length === 0 || movingTaskId !== null}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <span className="rounded-full bg-background/80 border border-border/30 px-2.5 py-0.5 text-xs font-bold text-foreground">
                    {filteredBoard[column].length}
                  </span>
                  {columnIndex < orderedColumns.length - 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        const firstTask = filteredBoard[column][0];
                        if (firstTask) handleMove(firstTask.id, "right");
                      }}
                      disabled={filteredBoard[column].length === 0 || movingTaskId !== null}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Tasks */}
              <div className="space-y-3 p-3 min-h-[200px]">
                {filteredBoard[column].length > 0 ? (
                  <>
                    <AnimatePresence mode="popLayout">
                      {filteredBoard[column].slice(0, visibleCountMap[column]).map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          column={column}
                          projectName={task.projectId ? projectNameById.get(task.projectId) : undefined}
                          pinned={pinnedTaskIds.includes(String(task.id))}
                          canEdit={canEdit}
                          canDelete={canDelete}
                          isMoving={movingTaskId === task.id}
                          onMove={handleMove}
                          onPin={togglePin}
                          onDelete={handleDelete}
                          onClick={handleCardClick}
                        />
                      ))}
                    </AnimatePresence>
                    <ShowMoreButton
                      total={filteredBoard[column].length}
                      visible={visibleCountMap[column]}
                      pageSize={TASK_PAGE_SIZE}
                      onShowMore={() => setVisibleCount(column, Math.min(visibleCountMap[column] + TASK_PAGE_SIZE, filteredBoard[column].length))}
                      onShowLess={() => setVisibleCount(column, TASK_PAGE_SIZE)}
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-secondary/5 p-8 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
                      <meta.icon className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {search ? "No matching tasks" : "No tasks here"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {search
                        ? "Try a different search term."
                        : column === "todo"
                          ? "Add a task to get started."
                          : `Drag tasks here.`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <TaskDetailModal
        task={selectedTask}
        open={taskDetailOpen}
        onOpenChange={setTaskDetailOpen}
      />
    </motion.div>
  );
}
