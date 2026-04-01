import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const members = await prisma.teamMember.findMany();
    let sum = 0;
    console.log("--- Real DB Records ---");
    for (const m of members) {
        const netPay = m.baseSalary + m.allowances - m.deductions;
        sum += netPay;
        console.log(`+ ${m.name} (${m.role}): Base: ${m.baseSalary}, Allowances: ${m.allowances}, Deductions: ${m.deductions} => Net: ${netPay}`);
    }
    console.log("-----------------------");
    console.log(`Total Database Payroll Sum: $${sum.toLocaleString()}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
