import type { Request, Response } from "express";
import { payrollService } from "../services/payroll.service";

export const payrollController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const period = req.query.period as string;
    const payroll = await payrollService.list({ period });
    res.status(200).json(payroll);
  },

  generate: async (req: Request, res: Response): Promise<void> => {
    const { period } = req.body;
    const result = await payrollService.generate(period);
    res.status(200).json(result);
  },
};
