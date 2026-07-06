import type { Request, Response } from "express";
import { AppError } from "../middleware/error.middleware";
import { threatcheckService } from "../services/threatcheck.service";

function readScanId(req: Request) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0)
    throw new AppError("Invalid scan id", 400, "BAD_REQUEST");
  return id;
}

export const threatcheckController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const type = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;
    const orgId = req.auth?.organizationId;

    const result = await threatcheckService.list({ page, limit, type, status }, orgId);
    res.status(200).json(result);
  },

  getOne: async (req: Request, res: Response): Promise<void> => {
    const id = readScanId(req);
    const orgId = req.auth?.organizationId;
    const scan = await threatcheckService.getById(id, orgId);
    res.status(200).json({ data: scan });
  },

  create: async (req: Request, res: Response): Promise<void> => {
    if (!req.auth?.userId) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");

    const { type, target, packageJson } = req.body;
    const orgId = req.auth?.organizationId;
    const scan = await threatcheckService.create(
      { type, target, packageJson },
      req.auth.userId,
      orgId,
    );
    res.status(201).json({ data: scan });
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    const id = readScanId(req);
    const orgId = req.auth?.organizationId;
    await threatcheckService.delete(id, orgId);
    res.status(200).json({ success: true });
  },
};
