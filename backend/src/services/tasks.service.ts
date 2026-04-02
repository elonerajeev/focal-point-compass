import { Prisma, type TaskColumn, type TaskPriority } from "@prisma/client";

import { prisma } from "../config/prisma";
import { AppError } from "../middleware/error.middleware";

type TaskRecord = {
  id: number;
  title: string;
  assignee: string;
  avatar: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  tags: string[];
  valueStream: "Growth" | "Product" | "Support";
  column: "todo" | "in-progress" | "done";
};

type TaskInput = {
  title: string;
  assignee: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  tags?: string[];
  valueStream?: "Growth" | "Product" | "Support";
  column?: "todo" | "in-progress" | "done";
  avatar?: string;
};

type TaskQuery = {
  page: number;
  limit: number;
  column?: TaskRecord["column"];
  priority?: TaskRecord["priority"];
};

function toDbPriority(priority: TaskRecord["priority"]): TaskPriority {
  return priority;
}

function fromDbPriority(priority: TaskPriority): TaskRecord["priority"] {
  return priority;
}

function toDbColumn(column: TaskRecord["column"]): TaskColumn {
  return column === "in-progress" ? "in_progress" : column;
}

function fromDbColumn(column: TaskColumn): TaskRecord["column"] {
  return column === "in_progress" ? "in-progress" : column;
}

function mapTask(task: {
  id: number;
  title: string;
  assignee: string;
  avatar: string;
  priority: TaskPriority;
  dueDate: string;
  tags: string[];
  valueStream: string;
  column: TaskColumn;
}): TaskRecord {
  return {
    id: task.id,
    title: task.title,
    assignee: task.assignee,
    avatar: task.avatar,
    priority: fromDbPriority(task.priority),
    dueDate: task.dueDate,
    tags: task.tags,
    valueStream: task.valueStream as TaskRecord["valueStream"],
    column: fromDbColumn(task.column),
  };
}

export const tasksService = {
  async getById(taskId: number) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.deletedAt) {
      throw new AppError("Task not found", 404, "NOT_FOUND");
    }
    return mapTask(task);
  },

  async list(query: TaskQuery) {
    const where: Prisma.TaskWhereInput = {
      deletedAt: null,
      ...(query.column ? { column: toDbColumn(query.column) } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
    };

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ column: "asc" }, { createdAt: "asc" }],
    });
    const grouped: Record<TaskRecord["column"], TaskRecord[]> = {
      todo: [],
      "in-progress": [],
      done: [],
    };
    tasks.map(mapTask).forEach((task) => grouped[task.column].push(task));
    return grouped;
  },

  async create(input: TaskInput) {
    const task = await prisma.task.create({
      data: {
        title: input.title,
        assignee: input.assignee,
        avatar: input.avatar ?? input.assignee.slice(0, 2).toUpperCase(),
        priority: toDbPriority(input.priority),
        dueDate: input.dueDate,
        tags: input.tags ?? [],
        valueStream: input.valueStream ?? "Growth",
        column: toDbColumn(input.column ?? "todo"),
        updatedAt: new Date(),
      },
    });
    return mapTask(task);
  },

  async update(taskId: number, patch: Partial<TaskInput>) {
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing || existing.deletedAt) {
      throw new AppError("Task not found", 404, "NOT_FOUND");
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.assignee !== undefined ? { assignee: patch.assignee } : {}),
        ...(patch.avatar !== undefined ? { avatar: patch.avatar } : {}),
        ...(patch.priority !== undefined ? { priority: toDbPriority(patch.priority) } : {}),
        ...(patch.dueDate !== undefined ? { dueDate: patch.dueDate } : {}),
        ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
        ...(patch.valueStream !== undefined ? { valueStream: patch.valueStream } : {}),
        ...(patch.column !== undefined ? { column: toDbColumn(patch.column) } : {}),
      },
    });
    return mapTask(task);
  },

  async delete(taskId: number) {
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing || existing.deletedAt) {
      throw new AppError("Task not found", 404, "NOT_FOUND");
    }

    await prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    });
  },
};
