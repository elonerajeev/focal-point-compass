import type { NextFunction, Request, Response } from "express";

import { AppError } from "./error.middleware";
import { verifyAccessToken } from "../utils/jwt";
import type { UserRole } from "../config/types";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Missing bearer token", 401, "UNAUTHORIZED"));
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role as UserRole,
    };
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401, "UNAUTHORIZED"));
  }
}

export function requireRole(roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }
    if (!roles.includes(req.auth.role)) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }
    next();
  };
}
