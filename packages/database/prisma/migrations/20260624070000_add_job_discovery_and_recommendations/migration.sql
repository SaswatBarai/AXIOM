-- CreateEnum
CREATE TYPE "DiscoveryStatus" AS ENUM ('PENDING', 'SCRAPING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activeResumeId" TEXT;

-- CreateTable
CREATE TABLE "job_discoveries" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "status" "DiscoveryStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_discoveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_recommendations" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "matchedSkills" TEXT[],
    "missingSkills" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_discoveries_resumeId_key" ON "job_discoveries"("resumeId");

-- CreateIndex
CREATE INDEX "job_recommendations_resumeId_idx" ON "job_recommendations"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "job_recommendations_resumeId_jobId_key" ON "job_recommendations"("resumeId", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "users_activeResumeId_key" ON "users"("activeResumeId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_activeResumeId_fkey" FOREIGN KEY ("activeResumeId") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_discoveries" ADD CONSTRAINT "job_discoveries_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_recommendations" ADD CONSTRAINT "job_recommendations_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_recommendations" ADD CONSTRAINT "job_recommendations_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
