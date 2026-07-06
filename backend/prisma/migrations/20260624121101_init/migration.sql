/*
  Warnings:

  - The primary key for the `Integration` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `type` on the `Integration` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id,userId]` on the table `Integration` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Integration` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('demo', 'discovery', 'proposal', 'negotiation', 'onboarding', 'check_in', 'other');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('email', 'call', 'meeting', 'note', 'stage_change', 'task', 'other');

-- CreateEnum
CREATE TYPE "AutomationTrigger" AS ENUM ('lead_created', 'lead_updated', 'lead_scored', 'lead_assigned', 'lead_score_above', 'lead_score_below', 'deal_created', 'deal_stage_changed', 'deal_closed', 'deal_stale', 'task_created', 'task_completed', 'task_overdue', 'client_created', 'client_health_changed', 'client_health_low', 'churn_risk', 'cold_lead_detected', 'followup_due', 'renewal_due', 'invoice_created', 'invoice_overdue', 'payroll_due', 'project_stalled', 'custom_schedule', 'manual');

-- CreateEnum
CREATE TYPE "AutomationAction" AS ENUM ('send_email', 'create_task', 'assign_lead', 'update_score', 'move_deal', 'create_client', 'send_notification', 'tag_entity', 'update_field', 'webhook');

-- CreateEnum
CREATE TYPE "AutomationRuleStatus" AS ENUM ('active', 'paused', 'archived');

-- CreateEnum
CREATE TYPE "AutomationLogStatus" AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "EmailQueueStatus" AS ENUM ('pending', 'sending', 'sent', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('health_warning', 'churn_risk', 'stale_deal', 'escalation', 'renewal_reminder', 'custom');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('info', 'warning', 'critical');

-- CreateEnum
CREATE TYPE "CsvImportStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('task', 'lead', 'deal', 'client', 'project', 'invoice', 'system', 'collaboration');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LeadSource" ADD VALUE 'linkedin';
ALTER TYPE "LeadSource" ADD VALUE 'inbound';
ALTER TYPE "LeadSource" ADD VALUE 'cold_call';
ALTER TYPE "LeadSource" ADD VALUE 'event';
ALTER TYPE "LeadSource" ADD VALUE 'partner';

-- DropIndex
DROP INDEX "Invoice_createdBy_idx";

-- DropIndex
DROP INDEX "Project_createdBy_idx";

-- DropIndex
DROP INDEX "Team_name_key";

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "contractEndDate" TIMESTAMP(3),
ADD COLUMN     "contractStartDate" TIMESTAMP(3),
ADD COLUMN     "engagementScore" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "healthGrade" TEXT NOT NULL DEFAULT 'B',
ADD COLUMN     "lastContactDate" TIMESTAMP(3),
ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "Deployment" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "DevOpsAlert" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Integration" DROP CONSTRAINT "Integration_pkey",
DROP COLUMN "type",
ADD COLUMN     "connectedAt" TIMESTAMP(3),
ADD COLUMN     "lastSynced" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "status" SET DEFAULT 'disconnected',
ADD CONSTRAINT "Integration_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Integration_id_seq";

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "JobPosting" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "budget" TEXT,
ADD COLUMN     "companySize" TEXT,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "lastContactDate" TIMESTAMP(3),
ADD COLUMN     "timeline" TEXT;

-- AlterTable
ALTER TABLE "MonitoredServer" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "MonitoredService" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "ownerEmail" TEXT,
ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "organizationId" TEXT;

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER,
    "clientId" INTEGER,
    "contactId" INTEGER,
    "title" TEXT NOT NULL,
    "type" "MeetingType" NOT NULL DEFAULT 'other',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "meetingUrl" TEXT,
    "hostId" TEXT NOT NULL,
    "hostName" TEXT NOT NULL,
    "inviteeEmail" TEXT NOT NULL,
    "inviteeName" TEXT NOT NULL,
    "agenda" TEXT NOT NULL DEFAULT '',
    "notes" TEXT,
    "status" "MeetingStatus" NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "metadata" TEXT NOT NULL DEFAULT '',
    "createdBy" TEXT NOT NULL,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationRule" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" "AutomationTrigger" NOT NULL,
    "conditions" JSONB NOT NULL DEFAULT '[]',
    "actions" JSONB NOT NULL DEFAULT '[]',
    "cronExpression" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "AutomationRuleStatus" NOT NULL DEFAULT 'active',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "maxRunsPerDay" INTEGER,
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "lastRunAt" TIMESTAMP(3),
    "lastRunError" TEXT,
    "createdBy" TEXT,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationLog" (
    "id" SERIAL NOT NULL,
    "ruleId" INTEGER NOT NULL,
    "trigger" TEXT NOT NULL,
    "triggerData" JSONB NOT NULL DEFAULT '{}',
    "actionData" JSONB NOT NULL DEFAULT '[]',
    "status" "AutomationLogStatus" NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "entityType" TEXT,
    "entityId" INTEGER,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailQueue" (
    "id" SERIAL NOT NULL,
    "to" TEXT NOT NULL,
    "cc" TEXT,
    "bcc" TEXT,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "htmlBody" TEXT,
    "template" TEXT,
    "templateData" JSONB DEFAULT '{}',
    "scheduledFor" TIMESTAMP(3),
    "sendAfter" TIMESTAMP(3),
    "status" "EmailQueueStatus" NOT NULL DEFAULT 'pending',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "lastError" TEXT,
    "nextRetryAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "entityType" TEXT,
    "entityId" INTEGER,
    "recipientName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "description" TEXT,
    "changes" JSONB DEFAULT '{}',
    "metadata" JSONB DEFAULT '{}',
    "performedBy" TEXT,
    "performedByName" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT,
    "color" TEXT,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "type" "AlertType" NOT NULL DEFAULT 'custom',
    "severity" "AlertSeverity" NOT NULL DEFAULT 'warning',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" INTEGER,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CsvImport" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "status" "CsvImportStatus" NOT NULL DEFAULT 'pending',
    "errors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "importedBy" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CsvImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'medium',
    "linkUrl" TEXT,
    "linkLabel" TEXT,
    "entityType" TEXT,
    "entityId" INTEGER,
    "batchKey" TEXT,
    "batchCount" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevOpsLogSource" (
    "id" SERIAL NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'generic',
    "environment" TEXT NOT NULL DEFAULT 'production',
    "endpoint" TEXT,
    "authType" TEXT NOT NULL DEFAULT 'api_key',
    "authConfig" JSONB NOT NULL DEFAULT '{}',
    "ingestKeyHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "lastIngestAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevOpsLogSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Meeting_leadId_idx" ON "Meeting"("leadId");

-- CreateIndex
CREATE INDEX "Meeting_clientId_idx" ON "Meeting"("clientId");

-- CreateIndex
CREATE INDEX "Meeting_contactId_idx" ON "Meeting"("contactId");

-- CreateIndex
CREATE INDEX "Meeting_scheduledAt_idx" ON "Meeting"("scheduledAt");

-- CreateIndex
CREATE INDEX "Meeting_status_idx" ON "Meeting"("status");

-- CreateIndex
CREATE INDEX "Activity_entityType_entityId_idx" ON "Activity"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- CreateIndex
CREATE INDEX "Activity_organizationId_idx" ON "Activity"("organizationId");

-- CreateIndex
CREATE INDEX "AutomationRule_trigger_idx" ON "AutomationRule"("trigger");

-- CreateIndex
CREATE INDEX "AutomationRule_status_idx" ON "AutomationRule"("status");

-- CreateIndex
CREATE INDEX "AutomationRule_isActive_idx" ON "AutomationRule"("isActive");

-- CreateIndex
CREATE INDEX "AutomationRule_organizationId_idx" ON "AutomationRule"("organizationId");

-- CreateIndex
CREATE INDEX "AutomationLog_ruleId_idx" ON "AutomationLog"("ruleId");

-- CreateIndex
CREATE INDEX "AutomationLog_status_idx" ON "AutomationLog"("status");

-- CreateIndex
CREATE INDEX "AutomationLog_entityType_entityId_idx" ON "AutomationLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AutomationLog_startedAt_idx" ON "AutomationLog"("startedAt");

-- CreateIndex
CREATE INDEX "EmailQueue_status_scheduledFor_idx" ON "EmailQueue"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "EmailQueue_entityType_entityId_idx" ON "EmailQueue"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "EmailQueue_to_idx" ON "EmailQueue"("to");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_entityId_idx" ON "ActivityLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ActivityLog_performedBy_idx" ON "ActivityLog"("performedBy");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");

-- CreateIndex
CREATE INDEX "ActivityLog_isVisible_createdAt_idx" ON "ActivityLog"("isVisible", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_organizationId_idx" ON "ActivityLog"("organizationId");

-- CreateIndex
CREATE INDEX "Alert_entityType_entityId_idx" ON "Alert"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Alert_isResolved_idx" ON "Alert"("isResolved");

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");

-- CreateIndex
CREATE INDEX "Alert_type_idx" ON "Alert"("type");

-- CreateIndex
CREATE INDEX "Alert_organizationId_idx" ON "Alert"("organizationId");

-- CreateIndex
CREATE INDEX "CsvImport_status_idx" ON "CsvImport"("status");

-- CreateIndex
CREATE INDEX "CsvImport_createdAt_idx" ON "CsvImport"("createdAt");

-- CreateIndex
CREATE INDEX "CsvImport_importedBy_idx" ON "CsvImport"("importedBy");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_batchKey_idx" ON "Notification"("batchKey");

-- CreateIndex
CREATE INDEX "DevOpsLogSource_organizationId_idx" ON "DevOpsLogSource"("organizationId");

-- CreateIndex
CREATE INDEX "DevOpsLogSource_isActive_idx" ON "DevOpsLogSource"("isActive");

-- CreateIndex
CREATE INDEX "DevOpsLogSource_deletedAt_idx" ON "DevOpsLogSource"("deletedAt");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

-- CreateIndex
CREATE INDEX "CalendarEvent_organizationId_idx" ON "CalendarEvent"("organizationId");

-- CreateIndex
CREATE INDEX "Candidate_organizationId_idx" ON "Candidate"("organizationId");

-- CreateIndex
CREATE INDEX "Client_healthScore_idx" ON "Client"("healthScore");

-- CreateIndex
CREATE INDEX "Client_healthGrade_idx" ON "Client"("healthGrade");

-- CreateIndex
CREATE INDEX "Client_assignedTo_idx" ON "Client"("assignedTo");

-- CreateIndex
CREATE INDEX "Client_lastContactDate_idx" ON "Client"("lastContactDate");

-- CreateIndex
CREATE INDEX "Client_contractEndDate_idx" ON "Client"("contractEndDate");

-- CreateIndex
CREATE INDEX "Client_organizationId_idx" ON "Client"("organizationId");

-- CreateIndex
CREATE INDEX "Deal_assignedTo_idx" ON "Deal"("assignedTo");

-- CreateIndex
CREATE INDEX "Deal_updatedAt_idx" ON "Deal"("updatedAt");

-- CreateIndex
CREATE INDEX "Deal_organizationId_idx" ON "Deal"("organizationId");

-- CreateIndex
CREATE INDEX "Deployment_organizationId_version_idx" ON "Deployment"("organizationId", "version");

-- CreateIndex
CREATE INDEX "Integration_userId_idx" ON "Integration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_id_userId_key" ON "Integration"("id", "userId");

-- CreateIndex
CREATE INDEX "Invoice_organizationId_idx" ON "Invoice"("organizationId");

-- CreateIndex
CREATE INDEX "JobPosting_organizationId_idx" ON "JobPosting"("organizationId");

-- CreateIndex
CREATE INDEX "JobPosting_createdBy_idx" ON "JobPosting"("createdBy");

-- CreateIndex
CREATE INDEX "Lead_score_idx" ON "Lead"("score");

-- CreateIndex
CREATE INDEX "Lead_assignedTo_idx" ON "Lead"("assignedTo");

-- CreateIndex
CREATE INDEX "Lead_updatedAt_idx" ON "Lead"("updatedAt");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_company_idx" ON "Lead"("company");

-- CreateIndex
CREATE INDEX "Note_organizationId_idx" ON "Note"("organizationId");

-- CreateIndex
CREATE INDEX "Project_organizationId_idx" ON "Project"("organizationId");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");

-- CreateIndex
CREATE INDEX "Task_assignee_idx" ON "Task"("assignee");

-- CreateIndex
CREATE INDEX "Task_organizationId_idx" ON "Task"("organizationId");

-- CreateIndex
CREATE INDEX "Team_organizationId_idx" ON "Team"("organizationId");

-- CreateIndex
CREATE INDEX "Team_ownerEmail_idx" ON "Team"("ownerEmail");

-- CreateIndex
CREATE INDEX "Team_deletedAt_idx" ON "Team"("deletedAt");

-- CreateIndex
CREATE INDEX "TeamMember_organizationId_idx" ON "TeamMember"("organizationId");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationLog" ADD CONSTRAINT "AutomationLog_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "AutomationRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
