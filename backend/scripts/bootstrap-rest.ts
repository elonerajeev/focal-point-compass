import { prisma } from "../src/config/prisma";

async function createEnum(sql: string) {
  await prisma.$executeRawUnsafe(sql);
}

async function main() {
  await createEnum(`
    DO $$
    BEGIN
      CREATE TYPE "ProjectStatus" AS ENUM ('active', 'pending', 'completed', 'in_progress');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await createEnum(`
    DO $$
    BEGIN
      CREATE TYPE "ProjectStage" AS ENUM ('Discovery', 'Build', 'Review', 'Launch');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await createEnum(`
    DO $$
    BEGIN
      CREATE TYPE "TaskPriority" AS ENUM ('high', 'medium', 'low');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await createEnum(`
    DO $$
    BEGIN
      CREATE TYPE "TaskColumn" AS ENUM ('todo', 'in_progress', 'done');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await createEnum(`
    DO $$
    BEGIN
      CREATE TYPE "TeamMemberRole" AS ENUM ('Admin', 'Manager', 'Employee');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Project" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT NOT NULL DEFAULT '',
      "progress" INTEGER NOT NULL DEFAULT 0,
      "status" "ProjectStatus" NOT NULL DEFAULT 'pending',
      "team" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "dueDate" TEXT NOT NULL DEFAULT '',
      "stage" "ProjectStage" NOT NULL DEFAULT 'Discovery',
      "budget" TEXT NOT NULL DEFAULT '$0',
      "tasksDone" INTEGER NOT NULL DEFAULT 0,
      "tasksTotal" INTEGER NOT NULL DEFAULT 0,
      "deletedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Task" (
      "id" SERIAL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "assignee" TEXT NOT NULL,
      "avatar" TEXT NOT NULL,
      "priority" "TaskPriority" NOT NULL,
      "dueDate" TEXT NOT NULL,
      "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      "valueStream" TEXT NOT NULL,
      "column" "TaskColumn" NOT NULL DEFAULT 'todo',
      "deletedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "TeamMember" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "role" "TeamMemberRole" NOT NULL,
      "status" "ClientStatus" NOT NULL DEFAULT 'active',
      "avatar" TEXT NOT NULL,
      "department" TEXT NOT NULL,
      "team" TEXT NOT NULL,
      "designation" TEXT NOT NULL,
      "manager" TEXT NOT NULL,
      "workingHours" TEXT NOT NULL,
      "officeLocation" TEXT NOT NULL,
      "timeZone" TEXT NOT NULL,
      "baseSalary" INTEGER NOT NULL,
      "allowances" INTEGER NOT NULL,
      "deductions" INTEGER NOT NULL,
      "paymentMode" "PaymentMode" NOT NULL,
      "warningCount" INTEGER NOT NULL DEFAULT 0,
      "suspendedAt" TIMESTAMP(3),
      "terminationEligibleAt" TIMESTAMP(3),
      "handoverCompletedAt" TIMESTAMP(3),
      "terminatedAt" TIMESTAMP(3),
      "separationNote" TEXT,
      "attendance" TEXT NOT NULL DEFAULT 'present',
      "checkIn" TEXT NOT NULL DEFAULT '-',
      "location" TEXT NOT NULL DEFAULT '-',
      "workload" INTEGER NOT NULL DEFAULT 0,
      "deletedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Invoice" (
      "id" TEXT PRIMARY KEY,
      "client" TEXT NOT NULL,
      "amount" TEXT NOT NULL,
      "date" TEXT NOT NULL,
      "due" TEXT NOT NULL,
      "status" "ClientStatus" NOT NULL DEFAULT 'pending',
      "deletedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Project_status_idx" ON "Project" ("status")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Project_stage_idx" ON "Project" ("stage")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Project_deletedAt_idx" ON "Project" ("deletedAt")`);

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Task_column_idx" ON "Task" ("column")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Task_priority_idx" ON "Task" ("priority")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Task_deletedAt_idx" ON "Task" ("deletedAt")`);

  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_email_key" ON "TeamMember" ("email")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "TeamMember_status_idx" ON "TeamMember" ("status")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "TeamMember_role_idx" ON "TeamMember" ("role")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "TeamMember_deletedAt_idx" ON "TeamMember" ("deletedAt")`);

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Invoice_status_idx" ON "Invoice" ("status")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Invoice_deletedAt_idx" ON "Invoice" ("deletedAt")`);

  await prisma.$disconnect();
  console.log("Remaining CRM schema bootstrapped");
}

main().catch(async (error: unknown) => {
  console.error(error);
  await prisma.$disconnect();
  process.exitCode = 1;
});
