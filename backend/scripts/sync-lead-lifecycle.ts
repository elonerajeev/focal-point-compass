import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function syncAllLeadsToLifecycle() {
  console.log("Starting lead lifecycle sync...\n");

  const leads = await prisma.lead.findMany({
    where: { deletedAt: null },
    orderBy: { id: "asc" },
  });

  console.log(`Found ${leads.length} leads to process\n`);

  let contactsCreated = 0;
  let dealsCreated = 0;
  let clientsCreated = 0;
  let tasksCreated = 0;

  for (const lead of leads) {
    console.log(`\n--- Processing Lead #${lead.id}: ${lead.firstName} ${lead.lastName} ---`);
    console.log(`Status: ${lead.status}, Score: ${lead.score}`);

    const shouldBridgeToContact = ["contacted", "qualified", "proposal", "negotiation", "closed_won"].includes(lead.status);
    const shouldCreateDeal = ["qualified", "proposal", "negotiation", "closed_won", "closed_lost"].includes(lead.status);

    // Check if contact already exists
    let contact = await prisma.contact.findUnique({ where: { email: lead.email } });
    
    if (shouldBridgeToContact && !contact) {
      contact = await prisma.contact.create({
        data: {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          jobTitle: lead.jobTitle,
          department: "Sales",
          clientId: lead.convertedToClientId ?? undefined,
        },
      });
      contactsCreated++;
      console.log(`✅ Contact created: #${contact.id}`);
    } else if (contact) {
      console.log(`ℹ️ Contact already exists: #${contact.id}`);
    } else {
      console.log(`⏭️ Skipping contact (status: ${lead.status})`);
    }

    // Check if deal already exists for this lead
    const existingDeal = await prisma.deal.findFirst({
      where: {
        deletedAt: null,
        tags: { has: `lead:${lead.id}` },
      },
    });

    if (shouldCreateDeal && !existingDeal) {
      const deal = await prisma.deal.create({
        data: {
          title: `${lead.company || `${lead.firstName} ${lead.lastName}`} Opportunity`,
          value: 0,
          currency: "USD",
          stage: toDealStage(lead.status),
          probability: probabilityForStage(lead.status),
          assignedTo: lead.assignedTo ?? "unassigned",
          expectedClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          tags: ["gtm-auto", `lead:${lead.id}`],
          description: `Auto-created from lead ${lead.firstName} ${lead.lastName}.`,
        },
      });
      dealsCreated++;
      console.log(`✅ Deal created: #${deal.id}`);
    } else if (existingDeal) {
      console.log(`ℹ️ Deal already exists: #${existingDeal.id}`);
    } else {
      console.log(`⏭️ Skipping deal (status: ${lead.status})`);
    }

    // Create client if lead is won and no client exists
    if (lead.status === "closed_won" && !lead.convertedToClientId) {
      const existingClient = await prisma.client.findUnique({ where: { email: lead.email } });
      
      if (!existingClient) {
        const client = await prisma.client.create({
          data: {
            name: `${lead.firstName} ${lead.lastName}`,
            email: lead.email,
            phone: lead.phone ?? "",
            company: lead.company,
            jobTitle: lead.jobTitle,
            source: lead.source,
            assignedTo: lead.assignedTo,
            manager: lead.assignedTo ?? "Unassigned",
            avatar: `${lead.firstName[0] ?? "C"}${lead.lastName[0] ?? ""}`.toUpperCase(),
            status: "active",
            nextAction: "Customer kickoff and onboarding",
            segment: "new_business",
            tier: "Growth",
            revenue: "$0",
            location: "Unknown",
            industry: "General",
            healthScore: 75,
          },
        });
        
        // Update lead with client reference
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            convertedAt: new Date(),
            convertedToClientId: client.id,
            tags: { push: ["converted-client"] },
          },
        });

        // Update contact with client reference
        if (contact) {
          await prisma.contact.update({
            where: { id: contact.id },
            data: { clientId: client.id },
          });
        }

        // Update deal with client reference
        const deal = await prisma.deal.findFirst({
          where: { tags: { has: `lead:${lead.id}` } },
        });
        if (deal) {
          await prisma.deal.update({
            where: { id: deal.id },
            data: {
              stage: "closed_won",
              probability: 100,
              tags: { push: `client:${client.id}` },
            },
          });
        }

        clientsCreated++;
        console.log(`✅ Client created: #${client.id}`);
      }
    }

    // Create follow-up task if not closed
    if (lead.assignedTo && !["closed_won", "closed_lost"].includes(lead.status)) {
      const existingTask = await prisma.task.findFirst({
        where: {
          column: { not: "done" },
          tags: { has: `lead:${lead.id}` },
        },
      });

      if (!existingTask) {
        const task = await prisma.task.create({
          data: {
            title: `Follow up: ${lead.company || `${lead.firstName} ${lead.lastName}`}`,
            assignee: lead.assignedTo,
            avatar: "FU",
            priority: lead.status === "negotiation" ? "high" : "medium",
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            tags: ["gtm-followup", "gtm-auto", `lead:${lead.id}`, `status:${lead.status}`],
            valueStream: "sales",
            column: "todo",
          },
        });
        tasksCreated++;
        console.log(`✅ Task created: #${task.id}`);
      }
    }
  }

  console.log("\n========================================");
  console.log("SYNC COMPLETE!");
  console.log("========================================");
  console.log(`Contacts created: ${contactsCreated}`);
  console.log(`Deals created:    ${dealsCreated}`);
  console.log(`Clients created:  ${clientsCreated}`);
  console.log(`Tasks created:    ${tasksCreated}`);
  console.log(`Total leads:     ${leads.length}`);
  console.log("========================================\n");

  await prisma.$disconnect();
  process.exit(0);
}

function toDealStage(leadStatus: string): string {
  switch (leadStatus) {
    case "qualified": return "qualification";
    case "proposal": return "proposal";
    case "negotiation": return "negotiation";
    case "closed_won": return "closed_won";
    case "closed_lost": return "closed_lost";
    default: return "prospecting";
  }
}

function probabilityForStage(stage: string): number {
  switch (stage) {
    case "prospecting": return 20;
    case "qualification": return 40;
    case "proposal": return 65;
    case "negotiation": return 80;
    case "closed_won": return 100;
    case "closed_lost": return 0;
    default: return 50;
  }
}

syncAllLeadsToLifecycle().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
