import { prisma } from "../config/prisma";
import { AppError } from "../middleware/error.middleware";
import type { AccessActor } from "../utils/access-control";

function generateJitsiUrl(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let roomId = "";
  for (let i = 0; i < 12; i++) {
    roomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `https://meet.jit.si/CRM-${roomId}`;
}

function generateGoogleMeetUrl(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let roomId = "";
  for (let i = 0; i < 20; i++) {
    roomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `https://meet.google.com/${roomId.slice(0, 3)}-${roomId.slice(3, 7)}-${roomId.slice(7)}`;
}

export interface CreateMeetingInput {
  leadId?: number;
  clientId?: number;
  title: string;
  type?: "demo" | "discovery" | "proposal" | "negotiation" | "onboarding" | "check_in" | "other";
  scheduledAt: string;
  duration?: number;
  meetingType?: "jitsi" | "google" | "zoom" | "phone" | "in_person";
  inviteeEmail: string;
  inviteeName: string;
  agenda?: string;
}

export interface UpdateMeetingInput {
  title?: string;
  type?: "demo" | "discovery" | "proposal" | "negotiation" | "onboarding" | "check_in" | "other";
  scheduledAt?: string;
  duration?: number;
  notes?: string;
  status?: "scheduled" | "completed" | "cancelled" | "no_show";
  meetingUrl?: string;
}

export const meetingService = {
  async list(actor: AccessActor, filters?: { leadId?: number; clientId?: number; status?: string }) {
    const where: any = {};

    if (filters?.leadId) where.leadId = filters.leadId;
    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.status) where.status = filters.status;

    const meetings = await prisma.meeting.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
      include: {
        lead: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return meetings;
  },

  async getById(id: number) {
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        lead: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        client: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!meeting) {
      throw new AppError("Meeting not found", 404, "NOT_FOUND");
    }

    return meeting;
  },

  async create(actor: AccessActor, input: CreateMeetingInput) {
    let meetingUrl: string | undefined;

    if (input.meetingType === "jitsi") {
      meetingUrl = generateJitsiUrl();
    } else if (input.meetingType === "google") {
      meetingUrl = generateGoogleMeetUrl();
    }

    const meeting = await prisma.meeting.create({
      data: {
        leadId: input.leadId,
        clientId: input.clientId,
        title: input.title,
        type: input.type || "other",
        scheduledAt: new Date(input.scheduledAt),
        duration: input.duration || 30,
        meetingUrl,
        hostId: String(actor?.userId || actor?.email || "unknown"),
        hostName: actor?.email || "Unknown Host",
        inviteeEmail: input.inviteeEmail,
        inviteeName: input.inviteeName,
        agenda: input.agenda || "",
        status: "scheduled",
      },
      include: {
        lead: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (input.leadId) {
      await prisma.activity.create({
        data: {
          entityType: "lead",
          entityId: input.leadId,
          type: "meeting",
          title: `Meeting Scheduled: ${input.title}`,
          description: `Meeting scheduled for ${new Date(input.scheduledAt).toLocaleString()} with ${input.inviteeName}`,
          metadata: JSON.stringify({ meetingId: meeting.id, meetingUrl }),
          createdBy: String(actor?.userId || actor?.email || "system"),
        },
      });
    }

    return meeting;
  },

  async update(id: number, actor: AccessActor, input: UpdateMeetingInput) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new AppError("Meeting not found", 404, "NOT_FOUND");
    }

    const meeting = await prisma.meeting.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.type && { type: input.type }),
        ...(input.scheduledAt && { scheduledAt: new Date(input.scheduledAt) }),
        ...(input.duration && { duration: input.duration }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.status && { status: input.status }),
      },
      include: {
        lead: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (existing.leadId && (input.status === "completed" || input.notes)) {
      await prisma.activity.create({
        data: {
          entityType: "lead",
          entityId: existing.leadId,
          type: "meeting",
          title: input.status === "completed" ? `Meeting Completed: ${meeting.title}` : `Meeting Updated: ${meeting.title}`,
          description: input.notes || `Meeting ${input.status} on ${new Date().toLocaleString()}`,
          metadata: JSON.stringify({ meetingId: meeting.id }),
          createdBy: String(actor?.userId || actor?.email || "system"),
        },
      });
    }

    return meeting;
  },

  async delete(id: number, actor: AccessActor) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new AppError("Meeting not found", 404, "NOT_FOUND");
    }

    await prisma.meeting.delete({ where: { id } });

    return { success: true };
  },

  async getUpcoming(actor: AccessActor, limit = 10) {
    const meetings = await prisma.meeting.findMany({
      where: {
        scheduledAt: { gte: new Date() },
        status: "scheduled",
      },
      orderBy: { scheduledAt: "asc" },
      take: limit,
      include: {
        lead: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return meetings;
  },

  async getByLead(leadId: number) {
    const meetings = await prisma.meeting.findMany({
      where: { leadId },
      orderBy: { scheduledAt: "desc" },
    });

    return meetings;
  },
};
