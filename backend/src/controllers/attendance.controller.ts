import type { Request, Response } from "express";

import { attendanceService } from "../services/attendance.service";

export const attendanceController = {
  list: async (_req: Request, res: Response): Promise<void> => {
    const attendance = await attendanceService.list();
    res.status(200).json(attendance);
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status, checkIn, location } = req.body;
    const userId = req.auth!.userId;
    const result = await attendanceService.update(Number(id), { status, checkIn, location }, userId);
    res.status(200).json(result);
  },
};
