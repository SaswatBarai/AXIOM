-- Phase 18: Add suspendedAt, audit_logs, fix indexes and defaults

-- ── Users: drop legacy columns, add suspendedAt ─────────────────────────────
ALTER TABLE "users" DROP COLUMN "refreshToken",
                    DROP COLUMN "resetToken",
                    DROP COLUMN "resetTokenExpiry";

ALTER TABLE "users" ADD COLUMN "suspendedAt" TIMESTAMP(3);

-- ── Chat messages: extend index to include createdAt ─────────────────────────
DROP INDEX IF EXISTS "chat_messages_userId_sessionId_idx";
CREATE INDEX "chat_messages_userId_sessionId_createdAt_idx" ON "chat_messages"("userId", "sessionId", "createdAt");

-- ── Interview sessions: remove explicit defaults (Prisma manages via app) ────
ALTER TABLE "interview_sessions" ALTER COLUMN "sections" DROP DEFAULT;
ALTER TABLE "interview_sessions" ALTER COLUMN "questions" DROP DEFAULT;

-- ── Career roadmaps: add unique constraint for (userId, targetRole, version) ─
CREATE UNIQUE INDEX "career_roadmaps_userId_targetRole_version_key" ON "career_roadmaps"("userId", "targetRole", "version");

-- ── Job alerts: drop updatedAt default (Prisma @updatedAt manages it) ────────
ALTER TABLE "job_alerts" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- ── New table: audit_logs for admin actions ──────────────────────────────────
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_adminId_idx" ON "audit_logs"("adminId");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_targetType_targetId_idx" ON "audit_logs"("targetType", "targetId");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

ALTER TABLE "audit_logs"
    ADD CONSTRAINT "audit_logs_adminId_fkey"
    FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
