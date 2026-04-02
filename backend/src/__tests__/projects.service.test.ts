import { beforeEach, describe, expect, it, jest } from "@jest/globals";

type MockProject = {
  id: number;
  name: string;
  description: string;
  progress: number;
  status: "active" | "pending" | "completed" | "in-progress";
  team: string[];
  dueDate: string;
  stage: "Discovery" | "Build" | "Review" | "Launch";
  budget: string;
  tasksDone: number;
  tasksTotal: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const mockState = {
  projects: [] as MockProject[],
};

const mockPrisma = {
  project: {
    findUnique: jest.fn(async ({ where }: { where: { id: number } }) => mockState.projects.find((project) => project.id === where.id) ?? null),
    count: jest.fn(async () => mockState.projects.filter((project) => !project.deletedAt).length),
    findMany: jest.fn(async () => mockState.projects.filter((project) => !project.deletedAt)),
    create: jest.fn(async ({ data }: { data: Omit<MockProject, "id" | "deletedAt" | "createdAt" | "updatedAt"> }) => {
      const project: MockProject = {
        id: mockState.projects.length + 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      mockState.projects.push(project);
      return project;
    }),
    update: jest.fn(async ({ where, data }: { where: { id: number }; data: Partial<MockProject> }) => {
      const project = mockState.projects.find((entry) => entry.id === where.id);
      if (!project) throw new Error("Project not found");
      Object.assign(project, data, { updatedAt: new Date() });
      return project;
    }),
  },
  $transaction: jest.fn(async (ops: unknown[]) => Promise.all(ops as Array<Promise<unknown>>)),
};

jest.mock("../config/prisma", () => ({
  prisma: mockPrisma,
}));

describe("projectsService", () => {
  beforeEach(() => {
    mockState.projects.length = 0;
    mockPrisma.project.findUnique.mockClear();
    mockPrisma.project.count.mockClear();
    mockPrisma.project.findMany.mockClear();
    mockPrisma.project.create.mockClear();
    mockPrisma.project.update.mockClear();
    mockPrisma.$transaction.mockClear();
  });

  it("creates a project with defaults", async () => {
    const { projectsService } = await import("../services/projects.service");
    const project = await projectsService.create({ name: "CRM v2" });
    expect(project.name).toBe("CRM v2");
    expect(project.status).toBe("pending");
  });

  it("throws 404 if not found on update", async () => {
    const { projectsService } = await import("../services/projects.service");
    await expect(projectsService.update(99, { name: "Missing" })).rejects.toThrow("Project not found");
  });

  it("soft-deletes on delete", async () => {
    mockState.projects.push({
      id: 1,
      name: "CRM v2",
      description: "",
      progress: 0,
      status: "pending",
      team: [],
      dueDate: "",
      stage: "Discovery",
      budget: "$0",
      tasksDone: 0,
      tasksTotal: 0,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { projectsService } = await import("../services/projects.service");
    await projectsService.delete(1);
    expect(mockState.projects[0].deletedAt).toEqual(expect.any(Date));
  });
});
