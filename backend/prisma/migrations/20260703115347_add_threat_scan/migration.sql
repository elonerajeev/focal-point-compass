-- DropIndex
DROP INDEX "Team_ownerEmail_idx";

-- CreateTable
CREATE TABLE "threat_scans" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "summary" JSONB,
    "results" JSONB,
    "error" TEXT,
    "packageJson" TEXT,
    "report" TEXT,
    "organizationId" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "threat_scans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "threat_scans_organizationId_idx" ON "threat_scans"("organizationId");

-- CreateIndex
CREATE INDEX "threat_scans_type_idx" ON "threat_scans"("type");

-- CreateIndex
CREATE INDEX "threat_scans_status_idx" ON "threat_scans"("status");

-- CreateIndex
CREATE INDEX "threat_scans_createdAt_idx" ON "threat_scans"("createdAt");
