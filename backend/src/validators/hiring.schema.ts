import { z } from "zod";

export const jobStatusSchema = z.enum(["open", "draft", "closed"]);
export const candidateStageSchema = z.enum(["applied", "screening", "interview", "offer", "hired", "rejected"]);

export const createJobSchema = z.object({
  title: z.string().min(1).max(160),
  department: z.string().min(1).max(120),
  location: z.string().min(1).max(160),
  type: z.string().min(1).max(80).optional(),
  status: jobStatusSchema.optional(),
  description: z.string().max(1000).optional(),
});

export const updateJobSchema = createJobSchema.partial();

export const createCandidateSchema = z.object({
  name: z.string().min(1).max(160),
  email: z.string().email(),
  jobId: z.coerce.number().int().positive(),
  stage: candidateStageSchema.optional(),
  resume: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateCandidateSchema = createCandidateSchema.partial();
