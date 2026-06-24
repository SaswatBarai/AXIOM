-- CreateEnum
CREATE TYPE "ResumeStatus" AS ENUM ('UPLOADING', 'PARSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "resumes" ADD COLUMN     "parsingError" TEXT,
ADD COLUMN     "status" "ResumeStatus" NOT NULL DEFAULT 'UPLOADING';

-- CreateIndex
CREATE INDEX "resumes_status_idx" ON "resumes"("status");
