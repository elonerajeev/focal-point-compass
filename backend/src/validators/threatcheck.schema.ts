import { z } from "zod";

export const scanTypeSchema = z.enum(["DEPENDENCY", "DOCKER"]);

export const createDependencyScanSchema = z.object({
  type: z.literal("DEPENDENCY"),
  target: z.string().min(1).max(200),
  packageJson: z.string().optional(),
});

export const createDockerScanSchema = z.object({
  type: z.literal("DOCKER"),
  target: z.string().min(1).max(200),
});

export const createScanSchema = z.discriminatedUnion("type", [
  createDependencyScanSchema,
  createDockerScanSchema,
]);

export const queryScansSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: scanTypeSchema.optional(),
  status: z.string().optional(),
});

export type CreateDependencyScanInput = z.infer<typeof createDependencyScanSchema>;
export type CreateDockerScanInput = z.infer<typeof createDockerScanSchema>;
export type CreateScanInput = z.infer<typeof createScanSchema>;
