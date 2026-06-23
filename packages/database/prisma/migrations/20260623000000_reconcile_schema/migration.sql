-- Reconcile schema: drop columns that exist in DB but not in schema.prisma
ALTER TABLE "users" DROP COLUMN IF EXISTS "refreshToken",
                    DROP COLUMN IF EXISTS "resetToken",
                    DROP COLUMN IF EXISTS "resetTokenExpiry";

-- Recreate chat_messages index to match current schema
DROP INDEX IF EXISTS "chat_messages_userId_sessionId_idx";
CREATE INDEX IF NOT EXISTS "chat_messages_userId_sessionId_createdAt_idx" ON "chat_messages"("userId", "sessionId", "createdAt");
