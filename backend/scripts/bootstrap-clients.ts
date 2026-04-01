import { prisma } from "../src/config/prisma";

async function main() {
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      CREATE TYPE "ClientStatus" AS ENUM ('active', 'pending', 'completed');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      CREATE TYPE "ClientTier" AS ENUM ('Enterprise', 'Growth', 'Strategic');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      CREATE TYPE "ClientSegment" AS ENUM ('Expansion', 'Renewal', 'new_business');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Client" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "industry" TEXT NOT NULL DEFAULT 'General',
      "manager" TEXT NOT NULL DEFAULT 'Unassigned',
      "status" "ClientStatus" NOT NULL DEFAULT 'pending',
      "revenue" TEXT NOT NULL DEFAULT '$0',
      "location" TEXT NOT NULL DEFAULT 'Unknown',
      "avatar" TEXT NOT NULL,
      "tier" "ClientTier" NOT NULL DEFAULT 'Growth',
      "healthScore" INTEGER NOT NULL DEFAULT 75,
      "nextAction" TEXT NOT NULL DEFAULT 'Initial contact',
      "segment" "ClientSegment" NOT NULL DEFAULT 'new_business',
      "companyId" TEXT,
      "jobTitle" TEXT,
      "source" TEXT,
      "assignedTo" TEXT,
      "phone" TEXT NOT NULL DEFAULT '',
      "company" TEXT NOT NULL DEFAULT '',
      "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "deletedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Client_email_key" ON "Client" ("email");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Client_status_idx" ON "Client" ("status");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Client_tier_idx" ON "Client" ("tier");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Client_deletedAt_idx" ON "Client" ("deletedAt");
  `);

  await prisma.$disconnect();
  console.log("Client schema bootstrapped");
}

main().catch(async (error: unknown) => {
  console.error(error);
  await prisma.$disconnect();
  process.exitCode = 1;
});
