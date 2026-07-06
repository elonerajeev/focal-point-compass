import { prisma } from "../config/prisma";
import { AppError } from "../middleware/error.middleware";

export const threatcheckService = {
  async list(query: { page: number; limit: number; type?: string; status?: string }, orgId?: string) {
    const where: Record<string, string> = {};
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (orgId) where.organizationId = orgId;

    const [scans, total] = await Promise.all([
      prisma.threatScan.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.threatScan.count({ where }),
    ]);

    return {
      data: scans,
      pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async getById(id: number, orgId?: string) {
    const where: Record<string, unknown> = { id };
    if (orgId) where.organizationId = orgId;
    const scan = await prisma.threatScan.findFirst({ where: where as never });
    if (!scan) throw new AppError("Scan not found", 404, "NOT_FOUND");
    return scan;
  },

  async create(input: { type: "DEPENDENCY" | "DOCKER"; target: string; packageJson?: string }, userId?: string, orgId?: string) {
    const data: Record<string, unknown> = {
      type: input.type,
      target: input.target,
      status: "PENDING",
      createdById: userId,
    };
    if (input.packageJson) data.packageJson = input.packageJson;
    if (orgId) data.organizationId = orgId;

    const scan = await prisma.threatScan.create({ data: data as never });
    return scan;
  },

  async delete(id: number, orgId?: string) {
    const where: Record<string, unknown> = { id };
    if (orgId) where.organizationId = orgId;
    const scan = await prisma.threatScan.findFirst({ where: where as never });
    if (!scan) throw new AppError("Scan not found", 404, "NOT_FOUND");
    await prisma.threatScan.delete({ where: { id } });
  },
};
