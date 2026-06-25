import type { Prisma } from "@axiom/database";

export function getJobMaxAgeDays(): number {
  const n = Number(process.env["JOB_MAX_AGE_DAYS"] ?? 90);
  return Number.isFinite(n) && n > 0 ? n : 90;
}

export function isStaleTitleRejectEnabled(): boolean {
  return process.env["JOB_STALE_TITLE_REJECT"] !== "false";
}

/** True when title embeds a campaign year below currentYear-1 and postedAt is not recent. */
export function hasStaleTitleYear(title: string, postedAt: Date): boolean {
  if (!isStaleTitleRejectEnabled()) return false;
  const minAllowedYear = new Date().getFullYear() - 1;
  const years = [...title.matchAll(/\b20\d{2}\b/g)].map((m) => parseInt(m[0]!, 10));
  if (!years.some((y) => y < minAllowedYear)) return false;
  const cutoff = new Date(Date.now() - getJobMaxAgeDays() * 86_400_000);
  return postedAt < cutoff;
}

export function isActiveJob(job: {
  title: string;
  postedAt: Date;
  expiresAt: Date | null;
}): boolean {
  const now = new Date();
  const cutoff = new Date(now.getTime() - getJobMaxAgeDays() * 86_400_000);
  if (job.postedAt < cutoff) return false;
  if (job.expiresAt && job.expiresAt <= now) return false;
  if (hasStaleTitleYear(job.title, job.postedAt)) return false;
  return true;
}

export function activeJobWhere(): Prisma.JobWhereInput {
  const now = new Date();
  const cutoff = new Date(now.getTime() - getJobMaxAgeDays() * 86_400_000);
  return {
    postedAt: { gte: cutoff },
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };
}

export function isActiveJobPayload(j: {
  title: string;
  posted_at?: string | null;
  expires_at?: string | null;
}): boolean {
  if (!j.posted_at) return false;
  const postedAt = new Date(j.posted_at);
  if (Number.isNaN(postedAt.getTime())) return false;
  const expiresAt = j.expires_at ? new Date(j.expires_at) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) return false;
  return isActiveJob({ title: j.title, postedAt, expiresAt });
}
