import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding sample data...\n");

  // Add 2 clients
  const client1 = await prisma.client.create({
    data: {
      name: "Acme Corporation",
      email: "contact@acme.com",
      industry: "Technology",
      manager: "John Smith",
      status: "active",
      revenue: "$250,000",
      location: "San Francisco",
      avatar: "AC",
      tier: "Enterprise",
      healthScore: 85,
      nextAction: "Quarterly review",
      segment: "Expansion",
      updatedAt: new Date(),
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: "TechStart Inc",
      email: "hello@techstart.com",
      industry: "Software",
      manager: "Sarah Johnson",
      status: "active",
      revenue: "$120,000",
      location: "New York",
      avatar: "TS",
      tier: "Growth",
      healthScore: 65,
      nextAction: "Follow-up call",
      segment: "new_business",
      updatedAt: new Date(),
    },
  });

  console.log("✅ Created 2 clients");

  // Add 2 projects
  await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Complete overhaul of company website",
      status: "active",
      stage: "Build",
      budget: "$50,000",
      progress: 65,
      dueDate: "Apr 15, 2026",
      tasksTotal: 12,
      tasksDone: 8,
      updatedAt: new Date(),
    },
  });

  await prisma.project.create({
    data: {
      name: "Mobile App Development",
      description: "iOS and Android app for customer portal",
      status: "in_progress",
      stage: "Discovery",
      budget: "$120,000",
      progress: 30,
      dueDate: "Jun 30, 2026",
      tasksTotal: 25,
      tasksDone: 7,
      updatedAt: new Date(),
    },
  });

  console.log("✅ Created 2 projects");

  // Add 3 tasks
  await prisma.task.create({
    data: {
      title: "Design homepage mockup",
      assignee: "John Doe",
      avatar: "JD",
      priority: "high",
      column: "done",
      dueDate: "Mar 25, 2026",
      valueStream: "Design",
      updatedAt: new Date(),
    },
  });

  await prisma.task.create({
    data: {
      title: "Setup development environment",
      assignee: "Jane Smith",
      avatar: "JS",
      priority: "high",
      column: "in_progress",
      dueDate: "Apr 05, 2026",
      valueStream: "Development",
      updatedAt: new Date(),
    },
  });

  await prisma.task.create({
    data: {
      title: "Write API documentation",
      assignee: "Bob Wilson",
      avatar: "BW",
      priority: "medium",
      column: "todo",
      dueDate: "Apr 10, 2026",
      valueStream: "Documentation",
      updatedAt: new Date(),
    },
  });

  console.log("✅ Created 3 tasks");

  // Add 2 invoices
  await prisma.invoice.create({
    data: {
      id: crypto.randomUUID(),
      client: "Acme Corporation",
      amount: "25000",
      date: "2026-03-15",
      due: "2026-04-15",
      status: "active",
      updatedAt: new Date(),
    },
  });

  await prisma.invoice.create({
    data: {
      id: crypto.randomUUID(),
      client: "TechStart Inc",
      amount: "15000",
      date: "2026-03-20",
      due: "2026-04-20",
      status: "pending",
      updatedAt: new Date(),
    },
  });

  console.log("✅ Created 2 invoices");

  console.log("\n🎉 Sample data seeded successfully!");
  console.log("\n📊 Summary:");
  console.log("- 2 Clients (1 Enterprise, 1 Growth)");
  console.log("- 2 Projects (1 active, 1 in_progress)");
  console.log("- 3 Tasks (1 done, 1 in_progress, 1 todo)");
  console.log("- 2 Invoices ($40,000 total)");
  console.log("\n✨ Refresh your dashboard to see the data!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
