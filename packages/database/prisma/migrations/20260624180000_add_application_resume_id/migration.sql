-- AlterTable
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "resumeId" TEXT;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
