import type { Request, Response } from "express";

import { AppError } from "../middleware/error.middleware";
import { preferencesService } from "../services/preferences.service";

export const preferencesController = {
  get: async (req: Request, res: Response): Promise<void> => {
    if (!req.auth?.userId) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const preferences = await preferencesService.get(req.auth.userId);
    res.status(200).json(preferences);
  },
  update: async (req: Request, res: Response): Promise<void> => {
    if (!req.auth?.userId) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }
    const preferences = await preferencesService.update(req.auth.userId, req.body);
    res.status(200).json(preferences);
  },
};
