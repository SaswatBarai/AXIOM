/**
 * One-time cleanup: remove stale jobs and orphaned recommendations.
 *
 * Usage: npx ts-node -r dotenv/config scripts/prune-stale-jobs.ts
 */
import { prisma } from "@axiom/database";
import { activeJobWhere, isActiveJob } from "../src/utils/jobFreshness";

async function main(): Promise<void> {
  const candidates = await prisma.job.findMany({
    select: { id: true, title: true, postedAt: true, expiresAt: true },
  });

  const staleIds = candidates.filter((j) => !isActiveJob(j)).map((j) => j.id);

  if (staleIds.length === 0) {
    console.log("No stale jobs to prune.");
    return;
  }

  const deletedRecs = await prisma.jobRecommendation.deleteMany({
    where: { jobId: { in: staleIds } },
  });

  const deletedJobs = await prisma.job.deleteMany({
    where: { id: { in: staleIds } },
  });

  console.log(
    `Pruned ${deletedJobs.count} stale jobs, ${deletedRecs.count} recommendations ` +
    `(max age ${process.env.JOB_MAX_AGE_DAYS ?? 90} days).`,
  );

  const remaining = await prisma.job.count({ where: activeJobWhere() });
  console.log(`Active jobs remaining (date filter): ${remaining}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
