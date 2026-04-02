import { prisma } from "../config/prisma";

export type PayrollRecord = {
  id: number;
  memberId: number;
  name: string;
  department: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: "paid" | "pending" | "processing";
  period: string;
  paymentMode: string;
};

export const payrollService = {
  async list(_query?: { period?: string }) {
    const members = await prisma.teamMember.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    });

    const currentPeriod = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

    return members.map((member) => ({
      id: member.id, // Using member ID as temporary record ID
      memberId: member.id,
      name: member.name,
      department: member.department,
      baseSalary: member.baseSalary,
      allowances: member.allowances,
      deductions: member.deductions,
      netPay: member.baseSalary + member.allowances - member.deductions,
      status: "pending" as const,
      period: currentPeriod,
      paymentMode: member.paymentMode,
    }));
  },

  async generate(period: string) {
    const members = await prisma.teamMember.findMany({
      where: { deletedAt: null },
    });

    // In a real app, we would save these to a 'Payroll' table.
    // For now, we return the calculated current state.
    return members.map((member) => ({
      id: member.id,
      memberId: member.id,
      name: member.name,
      period,
      netPay: member.baseSalary + member.allowances - member.deductions,
      status: "processing" as const,
    }));
  },
};
