import { Router } from "express";

import { preferencesController } from "../controllers/preferences.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import { validateBody } from "../middleware/validate.middleware";
import { updatePreferencesSchema } from "../validators/preferences.schema";

export const preferencesRouter = Router();

preferencesRouter.get("/", requireAuth, asyncHandler(preferencesController.get));
preferencesRouter.patch("/", requireAuth, validateBody(updatePreferencesSchema), asyncHandler(preferencesController.update));
