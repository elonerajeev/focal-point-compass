import { z } from "zod";

export const noteColorSchema = z.enum(["default", "blue", "green", "amber", "rose", "slate"]);

export const createNoteSchema = z.object({
  title: z.string().min(1).max(160),
  content: z.string().max(5000).optional(),
  isPinned: z.boolean().optional(),
  color: noteColorSchema.optional(),
});

export const updateNoteSchema = createNoteSchema.partial();
