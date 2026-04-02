import { beforeEach, describe, expect, it, jest } from "@jest/globals";

type MockClient = {
  id: number;
  name: string;
  email: string;
  industry: string;
  manager: string;
  status: "active" | "pending" | "completed";
  revenue: string;
  location: string;
  avatar: string;
  tier: "Enterprise" | "Growth" | "Strategic";
  healthScore: number;
  nextAction: string;
  segment: "Expansion" | "Renewal" | "New Business";
  companyId: string | null;
  jobTitle: string | null;
  source: string | null;
  assignedTo: string | null;
  phone: string;
  company: string;
  tags: string[];
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const mockState = {
  clients: [] as MockClient[],
};

const mockPrisma = {
  client: {
    findUnique: jest.fn(async ({ where }: { where: { email?: string; id?: number } }) => {
      if (where.email) return mockState.clients.find((client) => client.email === where.email) ?? null;
      if (where.id) return mockState.clients.find((client) => client.id === where.id) ?? null;
      return null;
    }),
    count: jest.fn(async () => mockState.clients.filter((client) => !client.deletedAt).length),
    findMany: jest.fn(async () => mockState.clients.filter((client) => !client.deletedAt)),
    create: jest.fn(async ({ data }: { data: Omit<MockClient, "id" | "deletedAt" | "createdAt" | "updatedAt"> }) => {
      const client: MockClient = {
        id: mockState.clients.length + 1,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      mockState.clients.push(client);
      return client;
    }),
    update: jest.fn(async ({ where, data }: { where: { id: number }; data: Partial<MockClient> }) => {
      const client = mockState.clients.find((entry) => entry.id === where.id);
      if (!client) throw new Error("Client not found");
      Object.assign(client, data, { updatedAt: new Date() });
      return client;
    }),
  },
  $transaction: jest.fn(async (ops: unknown[]) => Promise.all(ops as Array<Promise<unknown>>)),
};

jest.mock("../config/prisma", () => ({
  prisma: mockPrisma,
}));

describe("clientsService", () => {
  beforeEach(() => {
    mockState.clients.length = 0;
    mockPrisma.client.findUnique.mockClear();
    mockPrisma.client.count.mockClear();
    mockPrisma.client.findMany.mockClear();
    mockPrisma.client.create.mockClear();
    mockPrisma.client.update.mockClear();
    mockPrisma.$transaction.mockClear();
  });

  it("creates a client with required fields", async () => {
    const { clientsService } = await import("../services/clients.service");
    const client = await clientsService.create({
      name: "Acme Corp",
      email: "acme@example.com",
    });
    expect(client.email).toBe("acme@example.com");
    expect(client.name).toBe("Acme Corp");
  });

  it("throws 409 if email already exists", async () => {
    mockState.clients.push({
      id: 1,
      name: "Acme Corp",
      email: "acme@example.com",
      industry: "General",
      manager: "Unassigned",
      status: "pending",
      revenue: "$0",
      location: "Unknown",
      avatar: "AC",
      tier: "Growth",
      healthScore: 75,
      nextAction: "Initial contact",
      segment: "New Business",
      companyId: null,
      jobTitle: null,
      source: null,
      assignedTo: null,
      phone: "",
      company: "",
      tags: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { clientsService } = await import("../services/clients.service");
    await expect(
      clientsService.create({
        name: "Acme Corp",
        email: "acme@example.com",
      }),
    ).rejects.toThrow("Client email already exists");
  });

  it("throws 409 if email belongs to a soft-deleted client", async () => {
    mockState.clients.push({
      id: 1,
      name: "Archived Client",
      email: "archived@example.com",
      industry: "General",
      manager: "Unassigned",
      status: "pending",
      revenue: "$0",
      location: "Unknown",
      avatar: "AC",
      tier: "Growth",
      healthScore: 75,
      nextAction: "Initial contact",
      segment: "New Business",
      companyId: null,
      jobTitle: null,
      source: null,
      assignedTo: null,
      phone: "",
      company: "",
      tags: [],
      deletedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { clientsService } = await import("../services/clients.service");
    await expect(
      clientsService.create({
        name: "New Client",
        email: "archived@example.com",
      }),
    ).rejects.toThrow("Client email already exists");
  });

  it("throws 404 if client not found on update", async () => {
    const { clientsService } = await import("../services/clients.service");
    await expect(clientsService.update(999, { name: "Missing" })).rejects.toThrow("Client not found");
  });

  it("soft-deletes on delete", async () => {
    mockState.clients.push({
      id: 1,
      name: "Acme Corp",
      email: "acme@example.com",
      industry: "General",
      manager: "Unassigned",
      status: "pending",
      revenue: "$0",
      location: "Unknown",
      avatar: "AC",
      tier: "Growth",
      healthScore: 75,
      nextAction: "Initial contact",
      segment: "New Business",
      companyId: null,
      jobTitle: null,
      source: null,
      assignedTo: null,
      phone: "",
      company: "",
      tags: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { clientsService } = await import("../services/clients.service");
    await clientsService.delete(1);
    expect(mockState.clients[0].deletedAt).toEqual(expect.any(Date));
  });
});
