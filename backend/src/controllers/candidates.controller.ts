import type { Request, Response } from "express";

import { AppError } from "../middleware/error.middleware";
import { candidatesService } from "../services/candidates.service";

function readCandidateId(request: Request) {
  const candidateId = Number(request.params.id);
  if (!Number.isInteger(candidateId) || candidateId <= 0) {
    throw new AppError("Invalid candidate id", 400, "BAD_REQUEST");
  }
  return candidateId;
}

export const candidatesController = {
  list: async (_req: Request, res: Response): Promise<void> => {
    const candidates = await candidatesService.list();
    res.status(200).json(candidates);
  },
  getOne: async (req: Request, res: Response): Promise<void> => {
    const candidate = await candidatesService.getById(readCandidateId(req));
    res.status(200).json(candidate);
  },
  create: async (req: Request, res: Response): Promise<void> => {
    const candidate = await candidatesService.create(req.body);
    res.status(201).json(candidate);
  },
  update: async (req: Request, res: Response): Promise<void> => {
    const candidate = await candidatesService.update(readCandidateId(req), req.body);
    res.status(200).json(candidate);
  },
  remove: async (req: Request, res: Response): Promise<void> => {
    await candidatesService.delete(readCandidateId(req));
    res.status(200).json({ message: "Candidate deleted successfully" });
  },
  moveToNextStage: async (req: Request, res: Response): Promise<void> => {
    const candidate = await candidatesService.moveToNextStage(readCandidateId(req));
    res.status(200).json(candidate);
  },
  reject: async (req: Request, res: Response): Promise<void> => {
    const candidate = await candidatesService.reject(readCandidateId(req), req.body.reason);
    res.status(200).json(candidate);
  },
  generateOfferLetter: async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing session" } });
      return;
    }
    const data = await candidatesService.generateOfferLetter(readCandidateId(req), req.auth.userId, req.body);
    res.status(200).json(data);
  },
  getTimeline: async (req: Request, res: Response): Promise<void> => {
    const activities = await candidatesService.getTimeline(readCandidateId(req));
    res.status(200).json(activities);
  },
  addNote: async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) { res.status(401).json({ error: { code: "UNAUTHORIZED" } }); return; }
    const candidate = await candidatesService.addNote(readCandidateId(req), req.body.note, req.auth.email);
    res.status(200).json(candidate);
  },
};
