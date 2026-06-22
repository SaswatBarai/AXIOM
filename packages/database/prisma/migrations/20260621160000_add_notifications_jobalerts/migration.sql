-- Phase 17: Email & Notification System

CREATE TABLE "notifications" (
  "id"        TEXT         NOT NULL PRIMARY KEY,
  "userId"    TEXT         NOT NULL,
  "type"      TEXT         NOT NULL,
  "payload"   JSONB        NOT NULL DEFAULT '{}',
  "readAt"    TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");

CREATE TABLE "job_alerts" (
  "id"         TEXT         NOT NULL PRIMARY KEY,
  "userId"     TEXT         NOT NULL,
  "name"       TEXT         NOT NULL,
  "filters"    JSONB        NOT NULL DEFAULT '{}',
  "frequency"  TEXT         NOT NULL DEFAULT 'daily',
  "active"     BOOLEAN      NOT NULL DEFAULT true,
  "lastSentAt" TIMESTAMP(3),
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "job_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "job_alerts_userId_idx"            ON "job_alerts"("userId");
CREATE INDEX "job_alerts_active_frequency_idx"  ON "job_alerts"("active", "frequency");
