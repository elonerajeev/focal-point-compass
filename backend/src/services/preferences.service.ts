import crypto from "crypto";
import { prisma } from "../config/prisma";
import type { Prisma } from "@prisma/client";

type PreferencesData = Record<string, unknown>;

export const preferencesService = {
  async get(userId: string) {
    const existing = await prisma.userPreference.findUnique({ where: { userId } });
    
    if (existing) {
      return { userId: existing.userId, data: existing.data as PreferencesData };
    }
    
    const preferences = await prisma.userPreference.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        data: {},
        updatedAt: new Date(),
      },
    });
    
    return { userId: preferences.userId, data: preferences.data as PreferencesData };
  },

  async update(userId: string, data: PreferencesData) {
    const current = await this.get(userId);

    const merged = {
      ...(current.data as PreferencesData),
      ...data,
    };

    const preferences = await prisma.userPreference.update({
      where: { userId },
      data: { data: merged as Prisma.InputJsonValue },
    });

    return { userId: preferences.userId, data: preferences.data as PreferencesData };
  },
};
