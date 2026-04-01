import { z } from "zod";

import { clientStatusSchema } from "./client.schema";

export const teamMemberRoleSchema = z.enum(["Admin", "Manager", "Employee"]);
export const teamMemberPaymentModeSchema = z.enum(["bank-transfer", "cash", "upi"]);
export const attendanceStatusSchema = z.enum(["present", "late", "remote", "absent"]);

const teamMemberBase = z.object({
  name: z.string().min(1).max(160),
  email: z.string().email(),
  role: teamMemberRoleSchema,
  status: clientStatusSchema.optional(),
  avatar: z.string().min(1).max(10).optional(),
  department: z.string().min(1).max(120).optional(),
  team: z.string().min(1).max(120).optional(),
  designation: z.string().min(1).max(160).optional(),
  manager: z.string().min(1).max(160).optional(),
  workingHours: z.string().min(1).max(80).optional(),
  officeLocation: z.string().min(1).max(160).optional(),
  timeZone: z.string().min(1).max(80).optional(),
  baseSalary: z.coerce.number().int().min(0).optional(),
  allowances: z.coerce.number().int().min(0).optional(),
  deductions: z.coerce.number().int().min(0).optional(),
  paymentMode: teamMemberPaymentModeSchema.optional(),
  warningCount: z.coerce.number().int().min(0).optional(),
  suspendedAt: z.string().datetime().nullable().optional(),
  terminationEligibleAt: z.string().datetime().nullable().optional(),
  handoverCompletedAt: z.string().datetime().nullable().optional(),
  terminatedAt: z.string().datetime().nullable().optional(),
  separationNote: z.string().max(500).optional(),
  attendance: attendanceStatusSchema.optional(),
  checkIn: z.string().min(1).max(32).optional(),
  location: z.string().min(1).max(160).optional(),
  workload: z.coerce.number().int().min(0).max(100).optional(),
});

export const createTeamMemberSchema = teamMemberBase.extend({
  role: teamMemberRoleSchema,
});

export const updateTeamMemberSchema = teamMemberBase.partial();
