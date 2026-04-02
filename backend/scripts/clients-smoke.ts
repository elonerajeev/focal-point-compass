import { clientsService } from "../src/services/clients.service";
import { prisma } from "../src/config/prisma";

async function main() {
  const email = `client-${Date.now()}@example.com`;

  const created = await clientsService.create({
    name: "Acme Holdings",
    email,
    industry: "Technology",
    manager: "Team Manager",
    status: "active",
    revenue: "$120,000",
    location: "Remote",
    tier: "Growth",
    segment: "Expansion",
    phone: "+1-555-0100",
    company: "Acme Holdings",
    healthScore: 82,
    nextAction: "Follow up with decision maker",
  });

  const listed = await clientsService.list({
    page: 1,
    limit: 10,
    sort: "createdAt",
    order: "desc",
  });

  const updated = await clientsService.update(created.id, {
    healthScore: 90,
    nextAction: "Schedule demo",
    status: "pending",
  });

  await clientsService.delete(created.id);

  console.log(
    JSON.stringify(
      {
        created: created.email,
        listed: listed.pagination.total,
        updated: updated.healthScore,
        deleted: created.id,
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
