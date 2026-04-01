import type { Request, Response } from "express";

import { AppError } from "../middleware/error.middleware";
import { hiringService } from "../services/hiring.service";

function readJobId(request: Request) {
  const jobId = Number(request.params.id);
  if (!Number.isInteger(jobId) || jobId <= 0) {
    throw new AppError("Invalid job id", 400, "BAD_REQUEST");
  }
  return jobId;
}

export const hiringController = {
  list: async (_req: Request, res: Response): Promise<void> => {
    const jobs = await hiringService.list();
    res.status(200).json(jobs);
  },
  getOne: async (req: Request, res: Response): Promise<void> => {
    const job = await hiringService.getById(readJobId(req));
    res.status(200).json(job);
  },
  create: async (req: Request, res: Response): Promise<void> => {
    const job = await hiringService.create(req.body);
    res.status(201).json(job);
  },
  update: async (req: Request, res: Response): Promise<void> => {
    const job = await hiringService.update(readJobId(req), req.body);
    res.status(200).json(job);
  },
  remove: async (req: Request, res: Response): Promise<void> => {
    await hiringService.delete(readJobId(req));
    res.status(200).json({ message: "Job posting deleted successfully" });
  },
  toggleStatus: async (req: Request, res: Response): Promise<void> => {
    const job = await hiringService.toggleStatus(readJobId(req));
    res.status(200).json(job);
  },
  clone: async (req: Request, res: Response): Promise<void> => {
    const job = await hiringService.clone(readJobId(req));
    res.status(201).json(job);
  },
};
