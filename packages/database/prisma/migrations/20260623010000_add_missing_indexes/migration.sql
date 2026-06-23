-- Add missing indexes for query performance

CREATE INDEX IF NOT EXISTS "applications_jobId_idx" ON "applications"("jobId");
CREATE INDEX IF NOT EXISTS "saved_jobs_jobId_idx" ON "saved_jobs"("jobId");
CREATE INDEX IF NOT EXISTS "jobs_postedAt_idx" ON "jobs"("postedAt" DESC);
CREATE INDEX IF NOT EXISTS "jobs_location_idx" ON "jobs"("location");
CREATE INDEX IF NOT EXISTS "jobs_expiresAt_idx" ON "jobs"("expiresAt");
CREATE INDEX IF NOT EXISTS "jobs_salary_idx" ON "jobs"("salaryMin", "salaryMax");
CREATE INDEX IF NOT EXISTS "career_roadmaps_userId_targetRole_idx" ON "career_roadmaps"("userId", "targetRole");
CREATE INDEX IF NOT EXISTS "interview_sessions_createdAt_idx" ON "interview_sessions"("createdAt" DESC);

-- Add GIN index for skill array queries (handled via raw SQL; Prisma does not support GIN natively)
CREATE INDEX IF NOT EXISTS "jobs_requiredSkills_idx" ON "jobs" USING GIN ("requiredSkills");

-- Remove redundant index (email is already unique-indexed)
DROP INDEX IF EXISTS "users_email_idx";
