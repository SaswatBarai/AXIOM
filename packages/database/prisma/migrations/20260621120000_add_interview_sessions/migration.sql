-- Phase 14: Interview Question Generator — add interview_sessions table

CREATE TABLE "interview_sessions" (
  "id"         TEXT NOT NULL,
  "userId"     TEXT NOT NULL,
  "jobTitle"   TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "sections"   JSONB NOT NULL DEFAULT '[]',
  "questions"  JSONB NOT NULL DEFAULT '[]',
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "interview_sessions_userId_idx" ON "interview_sessions"("userId");

ALTER TABLE "interview_sessions"
  ADD CONSTRAINT "interview_sessions_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
