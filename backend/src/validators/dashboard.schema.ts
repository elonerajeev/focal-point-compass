import { z } from "zod";

export const todoItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1).max(500),
  completed: z.boolean(),
  createdAt: z.string(),
});

export const userDashboardSchema = z.object({
  focusText: z.string().max(200).optional(),
  todos: z.array(todoItemSchema).max(20),
});
