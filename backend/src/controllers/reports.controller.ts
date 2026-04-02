import type { Request, Response } from "express";

import { reportsService } from "../services/reports.service";

export const reportsController = {
  list: async (_req: Request, res: Response): Promise<void> => {
    const reports = await reportsService.list();
    res.status(200).json(reports);
  },

  getAnalytics: async (_req: Request, res: Response): Promise<void> => {
    const analytics = await reportsService.getAnalytics();
    res.status(200).json(analytics);
  },
};
