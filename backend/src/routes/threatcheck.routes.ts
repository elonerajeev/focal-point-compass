import { Router } from "express";
import { threatcheckController } from "../controllers/threatcheck.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import { validateBody, validateQuery } from "../middleware/validate.middleware";
import { createScanSchema, queryScansSchema } from "../validators/threatcheck.schema";

export const threatcheckRouter = Router();

threatcheckRouter.get(
  "/",
  requireAuth,
  requireRole(["admin", "manager"]),
  validateQuery(queryScansSchema),
  asyncHandler(threatcheckController.list),
);

threatcheckRouter.get(
  "/:id",
  requireAuth,
  requireRole(["admin", "manager"]),
  asyncHandler(threatcheckController.getOne),
);

threatcheckRouter.post(
  "/",
  requireAuth,
  requireRole(["admin", "manager"]),
  validateBody(createScanSchema),
  asyncHandler(threatcheckController.create),
);

threatcheckRouter.delete(
  "/:id",
  requireAuth,
  requireRole(["admin"]),
  asyncHandler(threatcheckController.remove),
);
