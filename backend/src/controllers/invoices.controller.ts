import type { Request, Response } from "express";

import { AppError } from "../middleware/error.middleware";
import { invoicesService } from "../services/invoices.service";
import { invoiceQuerySchema } from "../validators/query.schema";

function readInvoiceId(request: Request) {
  const invoiceId = String(request.params.id ?? "").trim();
  if (!invoiceId) {
    throw new AppError("Invalid invoice id", 400, "BAD_REQUEST");
  }
  return invoiceId;
}

export const invoicesController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const parsed = invoiceQuerySchema.safeParse(req.query);
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

    const invoices = await invoicesService.list(parsed.data);
    res.status(200).json(invoices);
  },
  getOne: async (req: Request, res: Response): Promise<void> => {
    const invoice = await invoicesService.getById(readInvoiceId(req));
    res.status(200).json(invoice);
  },
  create: async (req: Request, res: Response): Promise<void> => {
    const invoice = await invoicesService.create(req.body);
    res.status(201).json(invoice);
  },
  update: async (req: Request, res: Response): Promise<void> => {
    const invoice = await invoicesService.update(readInvoiceId(req), req.body);
    res.status(200).json(invoice);
  },
  remove: async (req: Request, res: Response): Promise<void> => {
    await invoicesService.delete(readInvoiceId(req));
    res.status(200).json({ message: "Invoice deleted successfully" });
  },
};
