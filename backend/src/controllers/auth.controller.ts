import type { Request, Response } from "express";

import { authService } from "../services/auth.service";

export const authController = {
  signup: async (req: Request, res: Response): Promise<void> => {
    const session = await authService.signup(req.body);
    res.status(201).json(session);
  },

  login: async (req: Request, res: Response): Promise<void> => {
    const session = await authService.login(req.body);
    res.status(200).json(session);
  },

  me: async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing session" } });
      return;
    }

    const bearerToken = req.headers.authorization?.slice("Bearer ".length) ?? "";
    const session = await authService.me(req.auth.userId, bearerToken);
    res.status(200).json(session);
  },

  logout: async (req: Request, res: Response): Promise<void> => {
    if (req.auth) {
      await authService.logout(req.auth.userId);
    }
    res.status(200).json({ message: "Logged out successfully" });
  },

  refresh: async (req: Request, res: Response): Promise<void> => {
    const refreshToken = String(req.body?.refreshToken ?? "");
    const session = await authService.refresh(refreshToken);
    res.status(200).json(session);
  },

  updateProfile: async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing session" } });
      return;
    }
    const user = await authService.updateProfile(req.auth.userId, req.body);
    res.status(200).json({ user });
  },

  switchRole: async (req: Request, res: Response): Promise<void> => {
    if (!req.auth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing session" } });
      return;
    }
    const { targetRole } = req.body;
    const user = await authService.switchRole(req.auth.userId, targetRole);
    res.status(200).json({ user });
  },
};
