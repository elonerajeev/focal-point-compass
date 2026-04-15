import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function diagnoseAndFix() {
  console.log("🔍 DIAGNOSING GTM AUTOMATION STATUS...\n");

  // 1. Check leads by status
  const leads = await prisma.lead.findMany({
    where: { deletedAt: null },
    orderBy: { id: "asc" },
  });

  console.log("📊 LEAD STATUS BREAKDOWN:");
  const statusCounts: Record<string, number> = {};
  for (const lead of leads) {
    statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
  }
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`   ${status}: ${count} leads`);
  });

  // 2. Check contacts count
  const contacts = await prisma.contact.findMany({
    where: { deletedAt: null },
  });
  console.log(`\n👥 CONTACTS: ${contacts.length} total`);

  // 3. Check deals count
  const deals = await prisma.deal.findMany({
    where: { deletedAt: null },
  });
  console.log(`💼 DEALS: ${deals.length} total`);

  // 4. Check clients count
  const clients = await prisma.client.findMany({
    where: { deletedAt: null },
  });
  console.log(`🏢 CLIENTS: ${clients.length} total`);

  // 5. Check automation rules
  const rules = await prisma.automationRule.findMany({
    where: { isActive: true },
  });
  console.log(`\n⚙️ ACTIVE AUTOMATION RULES: ${rules.length}`);
  rules.forEach((rule) => {
    console.log(`   - "${rule.name}" (trigger: ${rule.trigger})`);
  });

  // 6. Check automation logs
  const logs = await prisma.automationLog.findMany({
    orderBy: { startedAt: "desc" },
    take: 10,
  });
  console.log(`\n📝 RECENT AUTOMATION LOGS: ${logs.length}`);
  logs.forEach((log) => {
    console.log(`   - ${log.trigger} (${log.status}) - ${log.entityType} #${log.entityId}`);
  });

  // 7. Identify leads that SHOULD have contacts/deals/clients
  console.log("\n🔄 CHECKING LEADS FOR AUTOMATION:");
  const qualifiedLeads = leads.filter(l => 
    ["contacted", "qualified", "proposal", "negotiation", "closed_won"].includes(l.status)
  );
  
  console.log(`\nLeads that SHOULD have contacts (status: contacted+): ${qualifiedLeads.length}`);
  
  for (const lead of qualifiedLeads.slice(0, 5)) {
    const hasContact = contacts.some(c => c.email === lead.email);
    const hasDeal = deals.some(d => (d.tags || []).includes(`lead:${lead.id}`));
    const hasClient = lead.convertedToClientId || clients.some(c => c.email === lead.email);
    
    console.log(`\n   Lead #${lead.id}: ${lead.firstName} ${lead.lastName}`);
    console.log(`   Status: ${lead.status}`);
    console.log(`   Email: ${lead.email}`);
    console.log(`   Has Contact: ${hasContact ? "✅" : "❌ MISSING"}`);
    console.log(`   Has Deal: ${hasDeal ? "✅" : "❌ MISSING"}`);
    console.log(`   Has Client: ${hasClient ? "✅" : lead.status === "closed_won" ? "❌ MISSING" : "N/A"}`);
  }

  // 8. Check why automation isn't working
  console.log("\n\n🔧 ROOT CAUSE ANALYSIS:");
  
  // Check if lead_updated trigger rule exists
  const leadUpdatedRule = rules.find(r => r.trigger === "lead_updated");
  console.log(`\n1. Lead Updated Rule exists: ${leadUpdatedRule ? "✅" : "❌ MISSING"}`);
  if (!leadUpdatedRule) {
    console.log("   → Need to create 'lead_updated' automation rule");
  }

  // Check lifecycle service function exists in rules
  console.log("\n2. Checking rule actions...");
  if (leadUpdatedRule) {
    const actions = leadUpdatedRule.actions as any[];
    const hasLogLifecycle = actions.some((a: any) => a.type === "log_lifecycle_sync");
    console.log(`   Has log_lifecycle_sync action: ${hasLogLifecycle ? "✅" : "❌ MISSING"}`);
  }

  // Summary
  console.log("\n\n📋 SUMMARY:");
  console.log(`   Total Leads: ${leads.length}`);
  console.log(`   Qualified Leads (should have contacts): ${qualifiedLeads.length}`);
  console.log(`   Existing Contacts: ${contacts.length}`);
  console.log(`   Missing Contacts: ${qualifiedLeads.length - contacts.filter(c => qualifiedLeads.some(l => l.email === c.email)).length}`);
  
  const missingContacts = qualifiedLeads.filter(l => !contacts.some(c => c.email === l.email)).length;
  console.log(`   \n   ⚠️ ${missingContacts} contacts are MISSING and need to be created!`);

  console.log("\n\n🚀 RUNNING AUTOMATION SYNC FOR ALL LEADS...\n");

  let contactsCreated = 0;
  let dealsCreated = 0;
  let clientsCreated = 0;
  let tasksCreated = 0;

  for (const lead of leads) {
    console.log(`\nProcessing Lead #${lead.id}: ${lead.firstName} ${lead.lastName} (${lead.status})`);

    // Create contact if status is contacted or higher
    if (["contacted", "qualified", "proposal", "negotiation", "closed_won"].includes(lead.status)) {
      const existingContact = contacts.find(c => c.email === lead.email);
      if (!existingContact) {
        const contact = await prisma.contact.create({
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
        console.log(`   ✅ Contact created: #${contact.id}`);
      } else {
        console.log(`   ⏭️ Contact already exists: #${existingContact.id}`);
      }
    }

    // Create deal if status is qualified or higher
    if (["qualified", "proposal", "negotiation", "closed_won", "closed_lost"].includes(lead.status)) {
      const existingDeal = deals.find(d => (d.tags || []).includes(`lead:${lead.id}`));
      if (!existingDeal) {
        const dealStage = lead.status === "qualified" ? "qualification" :
                         lead.status === "proposal" ? "proposal" :
                         lead.status === "negotiation" ? "negotiation" :
                         lead.status === "closed_won" ? "closed_won" : "closed_lost";
        
        const deal = await prisma.deal.create({
          data: {
            title: `${lead.company || `${lead.firstName} ${lead.lastName}`} Opportunity`,
            value: 0,
            currency: "USD",
            stage: dealStage as any,
            probability: dealStage === "closed_won" ? 100 : dealStage === "closed_lost" ? 0 : 50,
            assignedTo: lead.assignedTo ?? "unassigned",
            expectedClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            tags: ["gtm-auto", `lead:${lead.id}`],
            description: `Auto-created from lead ${lead.firstName} ${lead.lastName}`,
          },
        });
        dealsCreated++;
        console.log(`   ✅ Deal created: #${deal.id}`);
      } else {
        console.log(`   ⏭️ Deal already exists: #${existingDeal.id}`);
      }
    }

    // Create client if lead is won and has no client
    if (lead.status === "closed_won" && !lead.convertedToClientId) {
      const existingClient = clients.find(c => c.email === lead.email);
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
          },
        });

        clientsCreated++;
        console.log(`   ✅ Client created: #${client.id}`);
      }
    }

    // Create follow-up task if lead is assigned and not closed
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
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            tags: ["gtm-followup", "gtm-auto", `lead:${lead.id}`, `status:${lead.status}`],
            valueStream: "sales",
            column: "todo",
          },
        });
        tasksCreated++;
        console.log(`   ✅ Task created: #${task.id}`);
      }
    }
  }

  // Create automation rules if they don't exist
  console.log("\n\n🔧 CREATING MISSING AUTOMATION RULES...");
  
  const existingLeadUpdatedRule = await prisma.automationRule.findFirst({
    where: { trigger: "lead_updated" }
  });
  
  if (!existingLeadUpdatedRule) {
    await prisma.automationRule.create({
      data: {
        name: "Lead Lifecycle Sync",
        description: "Sync lead lifecycle - create contact, deal, and client as lead progresses",
        trigger: "lead_updated",
        conditions: [],
        actions: [{ type: "log_lifecycle_sync", params: {} }],
        isActive: true,
        status: "active",
        priority: 100,
      },
    });
    console.log("   ✅ Created 'Lead Lifecycle Sync' rule");
  } else {
    console.log("   ⏭️ 'Lead Lifecycle Sync' rule already exists");
  }

  const existingLeadCreatedRule = await prisma.automationRule.findFirst({
    where: { trigger: "lead_created" }
  });
  
  if (!existingLeadCreatedRule) {
    await prisma.automationRule.create({
      data: {
        name: "New Lead Welcome",
        description: "Log when new lead is created and tag appropriately",
        trigger: "lead_created",
        conditions: [],
        actions: [{ type: "auto_tag", params: { tags: ["new-lead"] } }],
        isActive: true,
        status: "active",
        priority: 90,
      },
    });
    console.log("   ✅ Created 'New Lead Welcome' rule");
  }

  // Create automation log entry using a real rule
  const firstRule = await prisma.automationRule.findMany({ take: 1 });
  if (firstRule.length > 0) {
    await prisma.automationLog.create({
      data: {
        ruleId: firstRule[0].id,
        trigger: "manual_sync",
        triggerData: { type: "diagnostic_and_fix", performedBy: "system" },
        actionData: [
          { type: "contacts_created", status: "success", details: { count: contactsCreated } },
          { type: "deals_created", status: "success", details: { count: dealsCreated } },
          { type: "clients_created", status: "success", details: { count: clientsCreated } },
          { type: "tasks_created", status: "success", details: { count: tasksCreated } },
        ],
        status: "completed",
        entityType: "System",
        entityId: 0,
        completedAt: new Date(),
      },
    });
  }

  console.log("\n\n" + "=".repeat(50));
  console.log("🎉 SYNC COMPLETE!");
  console.log("=".repeat(50));
  console.log(`\n📊 RESULTS:`);
  console.log(`   Contacts Created: ${contactsCreated}`);
  console.log(`   Deals Created: ${dealsCreated}`);
  console.log(`   Clients Created: ${clientsCreated}`);
  console.log(`   Tasks Created: ${tasksCreated}`);
  console.log(`\n✨ Now go to /sales/contacts to see the auto-created contacts!`);

  await prisma.$disconnect();
  process.exit(0);
}

diagnoseAndFix().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
