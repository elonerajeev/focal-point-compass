import { Router } from "express";

import { reportsController } from "../controllers/reports.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const reportsRouter = Router();

reportsRouter.get("/", requireAuth, asyncHandler(reportsController.list));
reportsRouter.get("/analytics", requireAuth, asyncHandler(reportsController.getAnalytics));
