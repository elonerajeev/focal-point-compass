import crypto from "crypto";
import { prisma } from "../config/prisma";
import { AppError } from "../middleware/error.middleware";

type InvoiceRecord = {
  id: string;
  client: string;
  amount: string;
  date: string;
  due: string;
  status: "active" | "pending" | "completed";
};

type InvoiceInput = Omit<InvoiceRecord, "id">;

type InvoiceQuery = {
  page: number;
  limit: number;
  status?: InvoiceRecord["status"];
};

export const invoicesService = {
  async getById(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice || invoice.deletedAt) {
      throw new AppError("Invoice not found", 404, "NOT_FOUND");
    }
    return {
      id: invoice.id,
      client: invoice.client,
      amount: invoice.amount,
      date: invoice.date,
      due: invoice.due,
      status: invoice.status,
    };
  },

  async list(query: InvoiceQuery) {
    const where = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
    };

    const [total, invoices] = await prisma.$transaction([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
    ]);

    return {
      data: invoices.map((invoice) => ({
        id: invoice.id,
        client: invoice.client,
        amount: invoice.amount,
        date: invoice.date,
        due: invoice.due,
        status: invoice.status,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async create(input: InvoiceInput) {
    const invoice = await prisma.invoice.create({
      data: {
        id: crypto.randomUUID(),
        client: input.client,
        amount: input.amount,
        date: input.date,
        due: input.due,
        status: input.status ?? "pending",
        updatedAt: new Date(),
      },
    });
    return {
      id: invoice.id,
      client: invoice.client,
      amount: invoice.amount,
      date: invoice.date,
      due: invoice.due,
      status: invoice.status,
    };
  },

  async update(invoiceId: string, patch: Partial<InvoiceInput>) {
    const existing = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!existing || existing.deletedAt) {
      throw new AppError("Invoice not found", 404, "NOT_FOUND");
    }

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ...(patch.client !== undefined ? { client: patch.client } : {}),
        ...(patch.amount !== undefined ? { amount: patch.amount } : {}),
        ...(patch.date !== undefined ? { date: patch.date } : {}),
        ...(patch.due !== undefined ? { due: patch.due } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
      },
    });
    return {
      id: invoice.id,
      client: invoice.client,
      amount: invoice.amount,
      date: invoice.date,
      due: invoice.due,
      status: invoice.status,
    };
  },

  async delete(invoiceId: string) {
    const existing = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!existing || existing.deletedAt) {
      throw new AppError("Invoice not found", 404, "NOT_FOUND");
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { deletedAt: new Date() },
    });
  },
};
