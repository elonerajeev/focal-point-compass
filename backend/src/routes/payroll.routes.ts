import { Router } from "express";
import { payrollController } from "../controllers/payroll.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const payrollRouter = Router();

payrollRouter.get("/", requireAuth, requireRole(["admin", "manager"]), asyncHandler(payrollController.list));
payrollRouter.post("/generate", requireAuth, requireRole(["admin"]), asyncHandler(payrollController.generate));
