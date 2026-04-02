import { Router } from "express";

import { tasksController } from "../controllers/tasks.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import { validateBody, validateQuery } from "../middleware/validate.middleware";
import { taskQuerySchema } from "../validators/query.schema";
import { createTaskSchema, updateTaskSchema } from "../validators/task.schema";

export const tasksRouter = Router();

tasksRouter.get("/", requireAuth, validateQuery(taskQuerySchema), asyncHandler(tasksController.list));
tasksRouter.get("/:id", requireAuth, asyncHandler(tasksController.getOne));
tasksRouter.post("/", requireAuth, validateBody(createTaskSchema), asyncHandler(tasksController.create));
tasksRouter.patch("/:id", requireAuth, validateBody(updateTaskSchema), asyncHandler(tasksController.update));
tasksRouter.delete("/:id", requireAuth, asyncHandler(tasksController.remove));
