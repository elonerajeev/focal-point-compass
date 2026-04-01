import { Router } from "express";

import { dashboardController } from "../controllers/dashboard.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const dashboardRouter = Router();

dashboardRouter.get("/", requireAuth, asyncHandler(dashboardController.get));
