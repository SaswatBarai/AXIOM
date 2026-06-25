-- Phase 15: Career Roadmap Generator — extend career_roadmaps with targetRole, weeks, version, progress

ALTER TABLE "career_roadmaps"
  ADD COLUMN "targetRole" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "weeks"      INTEGER NOT NULL DEFAULT 12,
  ADD COLUMN "version"    INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "progress"   JSONB NOT NULL DEFAULT '{}';
