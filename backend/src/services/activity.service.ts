import { prisma } from "../config/prisma";
import type { AccessActor } from "../utils/access-control";

export type ActivityEntityType = "lead" | "client" | "deal";

export interface LogActivityInput {
  entityType: ActivityEntityType;
  entityId: number;
  type: "email" | "call" | "meeting" | "note" | "stage_change" | "task" | "other";
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export const activityService = {
  async log(actor: AccessActor, input: LogActivityInput) {
    const activity = await prisma.activity.create({
      data: {
        entityType: input.entityType,
        entityId: input.entityId,
        type: input.type,
        title: input.title,
        description: input.description || "",
        metadata: input.metadata ? JSON.stringify(input.metadata) : "",
        createdBy: String(actor?.userId || actor?.email || "system"),
      },
    });

    if (input.entityType === "lead") {
      await prisma.lead.update({
        where: { id: input.entityId },
        data: {
          lastContactDate: new Date(),
          updatedAt: new Date(),
        },
      }).catch(() => {});
    }

    return activity;
  },

  async list(entityType: ActivityEntityType, entityId: number, limit = 50) {
    const activities = await prisma.activity.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return activities.map((a) => ({
      ...a,
      metadata: a.metadata ? JSON.parse(a.metadata) : {},
    }));
  },

  async getRecent(limit = 20) {
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return activities.map((a) => ({
      ...a,
      metadata: a.metadata ? JSON.parse(a.metadata) : {},
    }));
  },
};
