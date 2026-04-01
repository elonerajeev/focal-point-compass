import type { Request, Response } from "express";

import { AppError } from "../middleware/error.middleware";
import { clientsService } from "../services/clients.service";
import { clientQuerySchema } from "../validators/client.schema";

function readClientId(request: Request) {
  const clientId = Number(request.params.id);
  if (!Number.isInteger(clientId) || clientId <= 0) {
    throw new AppError("Invalid client id", 400, "BAD_REQUEST");
  }
  return clientId;
}

export const clientsController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const parsed = clientQuerySchema.safeParse(req.query);
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

    const clients = await clientsService.list(parsed.data);
    res.status(200).json(clients);
  },

  getOne: async (req: Request, res: Response): Promise<void> => {
    const clientId = readClientId(req);
    const client = await clientsService.getById(clientId);
    res.status(200).json(client);
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const client = await clientsService.create(req.body);
    res.status(201).json(client);
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const clientId = readClientId(req);
    const client = await clientsService.update(clientId, req.body);
    res.status(200).json(client);
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    const clientId = readClientId(req);
    await clientsService.delete(clientId);
    res.status(200).json({ message: "Client deleted successfully" });
  },

  getPipeline: async (_req: Request, res: Response): Promise<void> => {
    const pipeline = await clientsService.getPipeline();
    res.status(200).json(pipeline);
  },
};
