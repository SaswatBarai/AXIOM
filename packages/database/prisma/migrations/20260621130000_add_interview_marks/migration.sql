-- Phase 14 completion: add marks column to interview_sessions for persisting "got it" / "needs review" per question

ALTER TABLE "interview_sessions" ADD COLUMN "marks" JSONB NOT NULL DEFAULT '{}';
