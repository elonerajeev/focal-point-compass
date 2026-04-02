import { Prisma, type CandidateStage } from "@prisma/client";

import { prisma } from "../config/prisma";
import { AppError } from "../middleware/error.middleware";

type CandidateRecord = {
  id: number;
  name: string;
  email: string;
  jobId: number;
  jobTitle: string;
  stage: "applied" | "screening" | "interview" | "offer" | "hired" | "rejected";
  source?: string;
  phone?: string | null;
  rating?: number;
  interviewDate?: string | null;
  interviewers?: string[];
  resume?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

type CandidateInput = {
  name: string;
  email: string;
  jobId: number;
  stage?: CandidateRecord["stage"];
  resume?: string;
  notes?: string;
};

function mapStage(stage: CandidateStage): CandidateRecord["stage"] {
  return stage;
}

function mapCandidate(candidate: {
  id: number;
  name: string;
  email: string;
  jobId: number;
  stage: CandidateStage;
  source: string;
  phone: string | null;
  rating: number;
  interviewDate: Date | null;
  interviewers: string[];
  resume: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  JobPosting: { title: string };
}): CandidateRecord {
  return {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    jobId: candidate.jobId,
    jobTitle: candidate.JobPosting.title,
    stage: mapStage(candidate.stage),
    source: candidate.source,
    phone: candidate.phone ?? undefined,
    rating: candidate.rating,
    interviewDate: candidate.interviewDate?.toISOString() ?? undefined,
    interviewers: candidate.interviewers,
    resume: candidate.resume ?? undefined,
    notes: candidate.notes ?? undefined,
    createdAt: candidate.createdAt.toISOString(),
    updatedAt: candidate.updatedAt.toISOString(),
  };
}

function isEmailUniqueConstraintError(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;
  if (Array.isArray(target)) {
    return target.includes("email");
  }
  if (typeof target === "string") {
    return target.includes("email");
  }
  return false;
}

export const candidatesService = {
  async list() {
    const candidates = await prisma.candidate.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { JobPosting: { select: { title: true } } },
    });
    return { data: candidates.map(mapCandidate) };
  },

  async getById(candidateId: number) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { JobPosting: { select: { title: true } } },
    });
    if (!candidate || candidate.deletedAt) {
      throw new AppError("Candidate not found", 404, "NOT_FOUND");
    }
    return mapCandidate(candidate);
  },

  async create(input: CandidateInput) {
    const existingEmail = await prisma.candidate.findUnique({ where: { email: input.email } });
    if (existingEmail) {
      throw new AppError("Candidate email already exists", 409, "CONFLICT");
    }

    const job = await prisma.jobPosting.findUnique({ where: { id: input.jobId } });
    if (!job || job.deletedAt) {
      throw new AppError("Job posting not found", 404, "NOT_FOUND");
    }

    try {
      const candidate = await prisma.candidate.create({
        data: {
          name: input.name,
          email: input.email,
          jobId: input.jobId,
          stage: input.stage ?? "applied",
          resume: input.resume ?? null,
          notes: input.notes ?? null,
          updatedAt: new Date(),
        },
        include: { JobPosting: { select: { title: true } } },
      });
      return mapCandidate(candidate);
    } catch (error) {
      if (isEmailUniqueConstraintError(error)) {
        throw new AppError("Candidate email already exists", 409, "CONFLICT");
      }
      throw error;
    }
  },

  async update(candidateId: number, patch: Partial<CandidateInput>) {
    const existing = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!existing || existing.deletedAt) {
      throw new AppError("Candidate not found", 404, "NOT_FOUND");
    }

    if (patch.jobId !== undefined) {
      const job = await prisma.jobPosting.findUnique({ where: { id: patch.jobId } });
      if (!job || job.deletedAt) {
        throw new AppError("Job posting not found", 404, "NOT_FOUND");
      }
    }

    if (patch.email !== undefined && patch.email !== existing.email) {
      const emailOwner = await prisma.candidate.findUnique({ where: { email: patch.email } });
      if (emailOwner && emailOwner.id !== existing.id) {
        throw new AppError("Candidate email already exists", 409, "CONFLICT");
      }
    }

    try {
      const candidate = await prisma.candidate.update({
        where: { id: candidateId },
        data: {
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.email !== undefined ? { email: patch.email } : {}),
          ...(patch.jobId !== undefined ? { jobId: patch.jobId } : {}),
          ...(patch.stage !== undefined ? { stage: patch.stage as CandidateStage } : {}),
          ...(patch.resume !== undefined ? { resume: patch.resume } : {}),
          ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
        },
        include: { JobPosting: { select: { title: true } } },
      });
      return mapCandidate(candidate);
    } catch (error) {
      if (isEmailUniqueConstraintError(error)) {
        throw new AppError("Candidate email already exists", 409, "CONFLICT");
      }
      throw error;
    }
  },

  async delete(candidateId: number) {
    const existing = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!existing || existing.deletedAt) {
      throw new AppError("Candidate not found", 404, "NOT_FOUND");
    }

    await prisma.candidate.update({
      where: { id: candidateId },
      data: { deletedAt: new Date() },
    });
  },

  async moveToNextStage(candidateId: number) {
    const existing = await prisma.candidate.findUnique({ 
      where: { id: candidateId },
      include: { JobPosting: true },
    });
    if (!existing || existing.deletedAt) {
      throw new AppError("Candidate not found", 404, "NOT_FOUND");
    }

    const stageFlow: Record<CandidateStage, CandidateStage | null> = {
      applied: "screening",
      screening: "interview",
      interview: "offer",
      offer: "hired",
      hired: null,
      rejected: null,
    };

    const nextStage = stageFlow[existing.stage];
    if (!nextStage) {
      throw new AppError(`Cannot move from ${existing.stage} stage`, 400, "BAD_REQUEST");
    }

    // Update candidate stage
    const candidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: { stage: nextStage },
      include: { JobPosting: { select: { title: true } } },
    });

    // Log activity
    await (prisma as any).candidateActivity.create({
      data: { candidateId, action: "stage_change", detail: `Moved from ${existing.stage} to ${nextStage}`, performedBy: "HR" },
    });

    // 🎯 AUTO-CREATE EMPLOYEE when hired
    if (nextStage === "hired") {
      const existingEmployee = await prisma.teamMember.findUnique({ where: { email: existing.email } });
      
      if (!existingEmployee) {
        await prisma.teamMember.create({
          data: {
            name: existing.name,
            email: existing.email,
            role: "Employee",
            status: "pending",
            avatar: existing.name.slice(0, 2).toUpperCase(),
            department: existing.JobPosting.department,
            team: "New Hires",
            designation: existing.JobPosting.title,
            manager: "HR Manager",
            workingHours: "09:00 - 18:00",
            officeLocation: existing.JobPosting.location,
            timeZone: "Asia/Calcutta",
            baseSalary: 60000,
            allowances: 10000,
            deductions: 2500,
            paymentMode: "bank_transfer",
            attendance: "present",
            checkIn: "-",
            location: "Onboarding",
            workload: 0,
            updatedAt: new Date(),
          },
        });
        await (prisma as any).candidateActivity.create({
          data: { candidateId, action: "hired", detail: "Automatically added to team members", performedBy: "System" },
        });
      }
    }

    return mapCandidate(candidate);
  },

  async generateOfferLetter(candidateId: number, hrUserId: string, input: {
    joiningDate: string;
    offeredSalary: string;
    signatureUrl?: string;
  }) {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { JobPosting: true },
    });
    if (!candidate || candidate.deletedAt) {
      throw new AppError("Candidate not found", 404, "NOT_FOUND");
    }
    if (candidate.stage !== "offer") {
      throw new AppError("Candidate must be in offer stage to generate offer letter", 400, "BAD_REQUEST");
    }

    const hr = await prisma.user.findUnique({ where: { id: hrUserId } });
    if (!hr) throw new AppError("HR user not found", 404, "NOT_FOUND");

    // Save joining date and offered salary to candidate
    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        joiningDate: input.joiningDate,
        offeredSalary: input.offeredSalary,
        offerLetterSent: true,
      },
    });

    // Return all data needed to render the offer letter
    return {
      candidate: {
        name: candidate.name,
        email: candidate.email,
        jobTitle: candidate.JobPosting.title,
        department: candidate.JobPosting.department,
        location: candidate.JobPosting.location,
      },
      hr: {
        name: hr.name,
        designation: hr.designation,
        email: hr.email,
        signatureUrl: input.signatureUrl ?? null,
      },
      offer: {
        joiningDate: input.joiningDate,
        offeredSalary: input.offeredSalary,
        jobTitle: candidate.JobPosting.title,
        department: candidate.JobPosting.department,
        location: candidate.JobPosting.location,
        type: candidate.JobPosting.type,
        generatedAt: new Date().toISOString(),
      },
    };
  },

  async reject(candidateId: number, reason?: string) {
    const existing = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!existing || existing.deletedAt) {
      throw new AppError("Candidate not found", 404, "NOT_FOUND");
    }

    if (existing.stage === "rejected") {
      throw new AppError("Candidate already rejected", 400, "BAD_REQUEST");
    }

    const candidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: { stage: "rejected" },
      include: { JobPosting: { select: { title: true } } },
    });
    await (prisma as any).candidateActivity.create({
      data: { candidateId, action: "rejected", detail: reason ?? "No reason provided", performedBy: "HR" },
    });
    return mapCandidate(candidate);
  },

  async getTimeline(candidateId: number) {
    const existing = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!existing || existing.deletedAt) throw new AppError("Candidate not found", 404, "NOT_FOUND");

    const activities = await (prisma as any).candidateActivity.findMany({
      where: { candidateId },
      orderBy: { createdAt: "desc" },
    });
    return activities;
  },

  async addNote(candidateId: number, note: string, performedBy: string) {
    const existing = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!existing || existing.deletedAt) throw new AppError("Candidate not found", 404, "NOT_FOUND");

    await (prisma as any).candidateActivity.create({
      data: { candidateId, action: "note", detail: note, performedBy },
    });
    const candidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: { notes: existing.notes ? `${existing.notes}\n\n${note}` : note },
      include: { JobPosting: { select: { title: true } } },
    });
    return mapCandidate(candidate);
  },
};
