import type { Request, Response } from "express";

import { AppError } from "../middleware/error.middleware";
import { tasksService } from "../services/tasks.service";
import { taskQuerySchema } from "../validators/query.schema";

function readTaskId(request: Request) {
  const taskId = Number(request.params.id);
  if (!Number.isInteger(taskId) || taskId <= 0) {
    throw new AppError("Invalid task id", 400, "BAD_REQUEST");
  }
  return taskId;
}

export const tasksController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const parsed = taskQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid query parameters",
          details: parsed.error.flatten(),
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const tasks = await tasksService.list(parsed.data);
    res.status(200).json(tasks);
  },
  getOne: async (req: Request, res: Response): Promise<void> => {
    const task = await tasksService.getById(readTaskId(req));
    res.status(200).json(task);
  },
  create: async (req: Request, res: Response): Promise<void> => {
    const task = await tasksService.create(req.body);
    res.status(201).json(task);
  },
  update: async (req: Request, res: Response): Promise<void> => {
    const task = await tasksService.update(readTaskId(req), req.body);
    res.status(200).json(task);
  },
  remove: async (req: Request, res: Response): Promise<void> => {
    await tasksService.delete(readTaskId(req));
    res.status(200).json({ message: "Task deleted successfully" });
  },
};
