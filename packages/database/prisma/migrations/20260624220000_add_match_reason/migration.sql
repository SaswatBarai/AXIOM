-- AlterTable: add matchReason explainability column to job_recommendations
ALTER TABLE "job_recommendations" ADD COLUMN IF NOT EXISTS "matchReason" JSONB;
