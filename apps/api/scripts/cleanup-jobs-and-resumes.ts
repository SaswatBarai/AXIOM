/**
 * Remove all jobs and resume PDFs from S3 + database.
 *
 * Usage: cd apps/api && npx ts-node -r dotenv/config scripts/cleanup-jobs-and-resumes.ts
 */
import { prisma } from "@axiom/database";
import { deleteFromS3, keyFromUrl } from "../src/services/s3.service";

async function main(): Promise<void> {
  const [jobCount, resumeCount, recCount] = await Promise.all([
    prisma.job.count(),
    prisma.resume.count(),
    prisma.jobRecommendation.count(),
  ]);

  console.log(`Before: jobs=${jobCount}, resumes=${resumeCount}, recommendations=${recCount}`);

  const resumes = await prisma.resume.findMany({
    select: { id: true, fileUrl: true, fileName: true },
  });

  await prisma.user.updateMany({
    where: { activeResumeId: { not: null } },
    data: { activeResumeId: null },
  });

  for (const resume of resumes) {
    try {
      await deleteFromS3(keyFromUrl(resume.fileUrl));
      console.log(`S3 deleted: ${resume.fileName}`);
    } catch (err) {
      console.warn(`S3 delete failed for ${resume.id}:`, err);
    }
  }

  const deletedRecs = await prisma.jobRecommendation.deleteMany();
  const deletedDiscoveries = await prisma.jobDiscovery.deleteMany();
  const deletedSaved = await prisma.savedJob.deleteMany();
  const deletedApps = await prisma.application.deleteMany();
  const deletedJobs = await prisma.job.deleteMany();
  const deletedResumes = await prisma.resume.deleteMany();

  console.log(
    `Deleted: jobs=${deletedJobs.count}, resumes=${deletedResumes.count}, ` +
      `recommendations=${deletedRecs.count}, discoveries=${deletedDiscoveries.count}, ` +
      `saved_jobs=${deletedSaved.count}, applications=${deletedApps.count}`,
  );

  const [jobsLeft, resumesLeft] = await Promise.all([
    prisma.job.count(),
    prisma.resume.count(),
  ]);
  console.log(`After: jobs=${jobsLeft}, resumes=${resumesLeft}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
