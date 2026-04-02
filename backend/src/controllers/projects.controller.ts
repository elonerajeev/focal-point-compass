import type { Request, Response } from "express";

import { AppError } from "../middleware/error.middleware";
import { projectsService } from "../services/projects.service";
import { projectQuerySchema } from "../validators/query.schema";

function readProjectId(request: Request) {
  const projectId = Number(request.params.id);
  if (!Number.isInteger(projectId) || projectId <= 0) {
    throw new AppError("Invalid project id", 400, "BAD_REQUEST");
  }
  return projectId;
}

export const projectsController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const parsed = projectQuerySchema.safeParse(req.query);
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

    const projects = await projectsService.list(parsed.data);
    res.status(200).json(projects);
  },
  getOne: async (req: Request, res: Response): Promise<void> => {
    const project = await projectsService.getById(readProjectId(req));
    res.status(200).json(project);
  },
  create: async (req: Request, res: Response): Promise<void> => {
    const project = await projectsService.create(req.body);
    res.status(201).json(project);
  },
  update: async (req: Request, res: Response): Promise<void> => {
    const project = await projectsService.update(readProjectId(req), req.body);
    res.status(200).json(project);
  },
  remove: async (req: Request, res: Response): Promise<void> => {
    await projectsService.delete(readProjectId(req));
    res.status(200).json({ message: "Project deleted successfully" });
  },
};
