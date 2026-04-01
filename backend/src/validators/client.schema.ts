import { z } from "zod";

export const clientStatusSchema = z.enum(["active", "pending", "completed"]);
export const clientTierSchema = z.enum(["Enterprise", "Growth", "Strategic"]);
export const clientSegmentSchema = z.enum(["Expansion", "Renewal", "New Business"]);

export const clientQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  status: clientStatusSchema.optional(),
  tier: clientTierSchema.optional(),
  search: z.string().trim().optional(),
  sort: z.enum(["name", "revenue", "createdAt", "healthScore"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const createClientSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  industry: z.string().min(1).max(120).optional(),
  manager: z.string().min(1).max(120).optional(),
  status: clientStatusSchema.optional(),
  revenue: z.string().min(1).max(80).optional(),
  location: z.string().min(1).max(120).optional(),
  tier: clientTierSchema.optional(),
  segment: clientSegmentSchema.optional(),
  phone: z.string().min(1).max(40).optional(),
  company: z.string().min(1).max(160).optional(),
  companyId: z.string().min(1).max(120).optional(),
  jobTitle: z.string().min(1).max(120).optional(),
  source: z.string().min(1).max(120).optional(),
  assignedTo: z.string().min(1).max(120).optional(),
  healthScore: z.coerce.number().int().min(0).max(100).optional(),
  nextAction: z.string().min(1).max(160).optional(),
  avatar: z.string().min(1).max(10).optional(),
  tags: z.array(z.string().min(1).max(40)).optional(),
});

export const updateClientSchema = createClientSchema.partial();
