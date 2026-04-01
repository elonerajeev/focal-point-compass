import { Router } from "express";

import { attendanceController } from "../controllers/attendance.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const attendanceRouter = Router();

attendanceRouter.get("/", requireAuth, asyncHandler(attendanceController.list));
attendanceRouter.patch("/:id", requireAuth, asyncHandler(attendanceController.update));
