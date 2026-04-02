import { Router } from "express";

import { notesController } from "../controllers/notes.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import { validateBody } from "../middleware/validate.middleware";
import { createNoteSchema, updateNoteSchema } from "../validators/note.schema";

export const notesRouter = Router();

notesRouter.get("/", requireAuth, asyncHandler(notesController.list));
notesRouter.get("/:id", requireAuth, asyncHandler(notesController.getOne));
notesRouter.post("/", requireAuth, validateBody(createNoteSchema), asyncHandler(notesController.create));
notesRouter.patch("/:id", requireAuth, validateBody(updateNoteSchema), asyncHandler(notesController.update));
notesRouter.delete("/:id", requireAuth, asyncHandler(notesController.remove));
