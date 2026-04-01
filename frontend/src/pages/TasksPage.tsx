import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Flag, GripVertical, Pin, Plus, Search } from "lucide-react";

import StatusBadge from "@/components/shared/StatusBadge";
import ShowMoreButton from "@/components/shared/ShowMoreButton";
import ErrorFallback from "@/components/shared/ErrorFallback";
import { useTheme } from "@/contexts/ThemeContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useTasks } from "@/hooks/use-crm-data";
import type { TaskColumn, TaskRecord } from "@/types/crm";
import { cn } from "@/lib/utils";
import { readStoredJSON, writeStoredJSON } from "@/lib/preferences";

const priorityConfig = {
  high:   { color: "text-destructive bg-destructive/10 border-destructive/20", dot: "bg-destructive" },
  medium: { color: "text-warning bg-warning/10 border-warning/20",             dot: "bg-warning" },
  low:    { color: "text-success bg-success/10 border-success/20",             dot: "bg-success" },
} as const;

const columnMeta: Record<TaskColumn, { label: string; tone: string; dot: string; headerBg: string }> = {
  todo:          { label: "To Do",       tone: "border-warning/40",  dot: "bg-warning",  headerBg: "bg-warning/5" },
  "in-progress": { label: "In Progress", tone: "border-info/40",     dot: "bg-info",     headerBg: "bg-info/5" },
  done:          { label: "Done",        tone: "border-success/40",  dot: "bg-success",  headerBg: "bg-success/5" },
};

const orderedColumns: TaskColumn[] = ["todo", "in-progress", "done"];

function readPinned(key: string) {
  return readStoredJSON<string[]>(key, []);
}

function moveTask(
  board: Record<TaskColumn, TaskRecord[]>,
  taskId: number,
  direction: "left" | "right",
) {
  const sourceColumn = orderedColumns.find((column) => board[column].some((task) => task.id === taskId));
  if (!sourceColumn) return board;

  const currentIndex = orderedColumns.indexOf(sourceColumn);
  const nextIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
  const destination = orderedColumns[nextIndex];
  if (!destination) return board;

  const task = board[sourceColumn].find((entry) => entry.id === taskId);
  if (!task) return board;

  return {
    ...board,
    [sourceColumn]: board[sourceColumn].filter((entry) => entry.id !== taskId),
    [destination]: [...board[destination], task],
  };
}

function TaskCard({
  task,
  column,
  pinned,
  onMove,
  onPin,
  onDragStart,
  onDropCard,
}: {
  task: TaskRecord;
  column: TaskColumn;
  pinned: boolean;
  onMove: (taskId: number, direction: "left" | "right") => void;
  onPin: (taskId: number) => void;
  onDragStart: (taskId: number) => void;
  onDropCard: (taskId: number, targetColumn: TaskColumn) => void;
}) {
  return (
    <article
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDropCard(task.id, column)}
      className={cn(
        "rounded-[1.25rem] border border-border/70 bg-card p-4 shadow-card transition hover:border-border",
        pinned ? "ring-1 ring-primary/20" : "",
      )}
    >
      {/* Priority + tags */}
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {task.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-border/60 bg-secondary/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
        <span className={cn(
          "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase flex items-center gap-1 flex-shrink-0",
          priorityConfig[task.priority as keyof typeof priorityConfig]?.color ?? "border-border/70 bg-secondary/20 text-muted-foreground"
        )}>
          <span className={cn("h-1.5 w-1.5 rounded-full", priorityConfig[task.priority as keyof typeof priorityConfig]?.dot ?? "bg-muted-foreground")} />
          {task.priority}
        </span>
      </div>

      <h3 className="text-sm font-semibold leading-5 text-foreground">{task.title}</h3>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPin(task.id)}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full border transition",
              pinned ? "border-primary/30 bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground",
            )}
          >
            <Pin className="h-3 w-3" />
          </button>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/50 text-[10px] font-bold text-foreground">
            {task.avatar}
          </div>
          <span className="text-xs text-muted-foreground">{task.assignee.split(" ")[0]}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(task.id, "left")}
            disabled={column === "todo"}
            className="rounded-full border border-border/60 p-1 text-muted-foreground transition hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
          <span className="text-[10px] text-muted-foreground">{task.dueDate}</span>
          <button
            type="button"
            onClick={() => onMove(task.id, "right")}
            disabled={column === "done"}
            className="rounded-full border border-border/60 p-1 text-muted-foreground transition hover:text-foreground disabled:opacity-30"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function TasksPage() {
  const { data, isLoading, error: tasksError, refetch } = useTasks();
  const { openQuickCreate, canUseQuickCreate } = useWorkspace();
  const { role } = useTheme();
  const [search, setSearch] = useState("");
  const [board, setBoard] = useState<Record<TaskColumn, TaskRecord[]> | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const pinnedKey = `crm-task-pins-${role}`;
  const [pinnedTaskIds, setPinnedTaskIds] = useState<string[]>([]);
  const [doneVisible, setDoneVisible] = useState(5);
  const DONE_PAGE = 5;

  useEffect(() => {
    setPinnedTaskIds(readPinned(pinnedKey));
  }, [pinnedKey]);

  const effectiveBoard = board ?? data ?? null;

  const filteredBoard = useMemo(() => {
    if (!effectiveBoard) return null;

    return orderedColumns.reduce<Record<TaskColumn, TaskRecord[]>>((acc, column) => {
      const query = search.toLowerCase();
      const visible = effectiveBoard[column].filter((task) => {
        return (
          task.title.toLowerCase().includes(query) ||
          task.assignee.toLowerCase().includes(query) ||
          task.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      });
      acc[column] = [
        ...visible.filter((task) => pinnedTaskIds.includes(String(task.id))),
        ...visible.filter((task) => !pinnedTaskIds.includes(String(task.id))),
      ];
      return acc;
    }, {} as Record<TaskColumn, TaskRecord[]>);
  }, [effectiveBoard, pinnedTaskIds, search]);

  const persistPinned = (nextPinned: string[]) => {
    setPinnedTaskIds(nextPinned);
    writeStoredJSON(pinnedKey, nextPinned);
  };

  const togglePin = (taskId: number) => {
    const key = String(taskId);
    const next = pinnedTaskIds.includes(key) ? pinnedTaskIds.filter((id) => id !== key) : [key, ...pinnedTaskIds];
    persistPinned(next);
  };

  const handleDropToColumn = (taskId: number, targetColumn: TaskColumn) => {
    setBoard((current) => {
      const currentBoard = current ?? effectiveBoard;
      if (!currentBoard) return current;

      const sourceColumn = orderedColumns.find((column) => currentBoard[column].some((task) => task.id === taskId));
      if (!sourceColumn) return current;

      const task = currentBoard[sourceColumn].find((entry) => entry.id === taskId);
      if (!task) return current;

      if (sourceColumn === targetColumn) {
        const sourceTasks = currentBoard[sourceColumn].filter((entry) => entry.id !== taskId);
        return {
          ...currentBoard,
          [sourceColumn]: sourceTasks,
          [targetColumn]: [...sourceTasks, task],
        };
      }

      return {
        ...currentBoard,
        [sourceColumn]: currentBoard[sourceColumn].filter((entry) => entry.id !== taskId),
        [targetColumn]: [...currentBoard[targetColumn], task],
      };
    });
  };

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

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/60 bg-card p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/45 px-3 py-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              <Flag className="h-3.5 w-3.5 text-primary" />
              Execution Board
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold text-foreground">Functional task operations, not just static cards.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Tasks can move through execution states, be pinned to the top, and be reordered with drag and drop. That gives you a realistic interaction model for future integrations, optimistic updates, and audit logging.
              </p>
            </div>
          </div>
          {canUseQuickCreate ? (
            <button
              type="button"
              onClick={openQuickCreate}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-105"
            >
              <Plus className="h-4 w-4" />
              New Task
            </button>
          ) : (
            <div className="inline-flex items-center rounded-2xl border border-border/70 bg-secondary/30 px-5 py-3 text-sm font-semibold text-muted-foreground">
              Read only
            </div>
          )}
        </div>
        <div className="relative mt-6 max-w-lg">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search task title, owner, or tag"
            className="h-12 w-full rounded-2xl border border-border/70 bg-background/55 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {orderedColumns.map((column) => (
          <div
            key={column}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => draggedTaskId && handleDropToColumn(draggedTaskId, column)}
            className={cn("rounded-[1.5rem] border bg-card shadow-card overflow-hidden", columnMeta[column].tone)}
          >
            {/* Column header */}
            <div className={cn("flex items-center justify-between px-4 py-3 border-b border-border/40", columnMeta[column].headerBg)}>
              <div className="flex items-center gap-2">
                <div className={cn("h-2.5 w-2.5 rounded-full", columnMeta[column].dot)} />
                <p className="text-sm font-semibold text-foreground">{columnMeta[column].label}</p>
              </div>
              <span className="rounded-full bg-background/60 border border-border/50 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {effectiveBoard[column].length}
              </span>
            </div>
            <div className="space-y-2.5 p-3">
              {filteredBoard[column].length > 0 ? (
                (column === "done" ? filteredBoard[column].slice(0, doneVisible) : filteredBoard[column]).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    column={column}
                    pinned={pinnedTaskIds.includes(String(task.id))}
                    onMove={(taskId, direction) => {
                      setBoard((current) => moveTask(current ?? effectiveBoard, taskId, direction));
                    }}
                    onPin={togglePin}
                    onDragStart={(taskId) => setDraggedTaskId(taskId)}
                    onDropCard={handleDropToColumn}
                  />
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border/60 bg-secondary/10 p-6 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {search ? "No matching tasks" : "No tasks here"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {search
                      ? "Try a different search term."
                      : column === "todo"
                        ? "Add a task to get started."
                        : `Nothing in ${columnMeta[column].label} yet.`}
                  </p>
                </div>
              )}
              {column === "done" && (
                <ShowMoreButton
                  total={filteredBoard[column].length}
                  visible={doneVisible}
                  pageSize={DONE_PAGE}
                  onShowMore={() => setDoneVisible(v => Math.min(v + DONE_PAGE, filteredBoard[column].length))}
                  onShowLess={() => setDoneVisible(DONE_PAGE)}
                />
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
