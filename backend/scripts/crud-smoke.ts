import { clientsService } from "../src/services/clients.service";
import { dashboardService } from "../src/services/dashboard.service";
import { invoicesService } from "../src/services/invoices.service";
import { projectsService } from "../src/services/projects.service";
import { tasksService } from "../src/services/tasks.service";
import { teamMembersService } from "../src/services/team-members.service";
import { prisma } from "../src/config/prisma";

async function main() {
  const project = await projectsService.create({
    name: "Smoke Project",
    description: "Integration smoke test",
    status: "pending",
    team: ["SM"],
    dueDate: "2026-04-01",
    stage: "Discovery",
    budget: "$1000",
  });

  const task = await tasksService.create({
    title: "Smoke Task",
    assignee: "Smoke User",
    priority: "medium",
    dueDate: "2026-04-01",
    tags: ["Smoke"],
    valueStream: "Growth",
    column: "todo",
  });

  const member = await teamMembersService.create({
    name: "Smoke Member",
    email: `member-${Date.now()}@example.com`,
    role: "Employee",
    status: "active",
    avatar: "SM",
    department: "Ops",
    team: "Smoke",
    designation: "Product Specialist",
    manager: "Team Manager",
    workingHours: "09:00 - 18:00",
    officeLocation: "HQ",
    timeZone: "Asia/Calcutta",
    baseSalary: 50000,
    allowances: 5000,
    deductions: 1000,
    paymentMode: "upi",
    warningCount: 0,
    attendance: "present",
    checkIn: "9:00 AM",
    location: "HQ",
    workload: 50,
  });

  const invoice = await invoicesService.create({
    client: "Smoke Client",
    amount: "$100",
    date: "2026-03-27",
    due: "2026-04-27",
    status: "pending",
  });

  const dashboard = await dashboardService.get();
  const client = await clientsService.create({
    name: "Smoke Client",
    email: `client-${Date.now()}@example.com`,
    company: "Smoke Client",
  });

  await clientsService.delete(client.id);
  await projectsService.delete(project.id);
  await tasksService.delete(task.id);
  await teamMembersService.delete(member.id);
  await invoicesService.delete(invoice.id);

  console.log(
    JSON.stringify(
      {
        project: project.name,
        task: task.title,
        member: member.email,
        invoice: invoice.id,
        metrics: dashboard.metrics.length,
      },
      null,
      2,
    ),
  );

  await prisma.$disconnect();
}

main().catch(async (error: unknown) => {
  console.error(error);
  await prisma.$disconnect();
  process.exitCode = 1;
});
