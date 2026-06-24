/**
 * Subscription access control + lifecycle reconciliation.
 *
 * Premium access is determined from DB state (subscription + payments), never
 * from JWT role alone. `requireActiveSubscription` middleware calls into here.
 */
import { prisma, type Prisma } from "@axiom/database";
import { AppError } from "../middleware/errorHandler.middleware";
import { logger } from "../utils/logger";

/** Grace period after a failed renewal before revoking access. */
export const PAST_DUE_GRACE_DAYS = 3;

/** Reject webhook deliveries older than this (replay protection). */
export const WEBHOOK_MAX_AGE_MS = 24 * 60 * 60 * 1000;

type Tx = Prisma.TransactionClient;

export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";

/**
 * Returns true when the user may access premium features right now.
 *
 * Rules:
 *  - ADMIN: always allowed
 *  - Paid plan (not FREE) required
 *  - status ACTIVE or CANCELLED (paid-through period) or PAST_DUE (within grace)
 *  - currentPeriodEnd in the future, OR PAST_DUE within grace window
 *  - At least one CAPTURED payment on record for the user
 */
export async function hasPremiumAccess(
  userId: string,
  userRole?: string,
): Promise<boolean> {
  if (userRole === "ADMIN") return true;

  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub || sub.plan === "FREE") return false;

  const capturedCount = await prisma.payment.count({
    where: { userId, status: "CAPTURED" },
  });
  if (capturedCount === 0) return false;

  const now = new Date();

  if (sub.status === "EXPIRED") return false;

  if (sub.status === "PAST_DUE") {
    const graceEnd = addDays(sub.currentPeriodEnd, PAST_DUE_GRACE_DAYS);
    return now <= graceEnd;
  }

  if (sub.status === "ACTIVE" || sub.status === "CANCELLED") {
    return sub.currentPeriodEnd > now;
  }

  return false;
}

/** Downgrade user when subscription period (+ grace) has elapsed. */
export async function reconcileExpiredSubscriptions(): Promise<number> {
  const now = new Date();
  let downgraded = 0;

  const candidates = await prisma.subscription.findMany({
    where: {
      plan: { not: "FREE" },
      status: { in: ["ACTIVE", "PAST_DUE", "CANCELLED"] },
    },
    select: {
      id: true,
      userId: true,
      status: true,
      currentPeriodEnd: true,
    },
  });

  for (const sub of candidates) {
    const graceEnd =
      sub.status === "PAST_DUE"
        ? addDays(sub.currentPeriodEnd, PAST_DUE_GRACE_DAYS)
        : sub.currentPeriodEnd;

    if (graceEnd > now) continue;

    await prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: sub.id },
        data:  { status: "EXPIRED" },
      });
      await revokePremiumRole(tx, sub.userId);
    });
    downgraded++;
    logger.info(`subscription reconciled: user ${sub.userId} downgraded (expired)`);
  }

  return downgraded;
}

export async function revokePremiumRole(tx: Tx, userId: string): Promise<void> {
  await tx.user.update({
    where: { id: userId },
    data:  { role: "USER" },
  });
}

export async function grantPremiumRole(tx: Tx, userId: string): Promise<void> {
  await tx.user.update({
    where: { id: userId },
    data:  { role: "PREMIUM" },
  });
}

/** Block new checkout when user already has an open or active paid subscription. */
export async function assertCanCreateSubscription(userId: string): Promise<void> {
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (!existing || existing.plan === "FREE") return;

  const now = new Date();
  const openStatuses: SubscriptionStatus[] = ["ACTIVE", "PAST_DUE", "CANCELLED"];

  if (
    openStatuses.includes(existing.status as SubscriptionStatus) &&
    existing.currentPeriodEnd > now &&
    existing.razorpaySubscriptionId
  ) {
    throw new AppError(409, "You already have an open subscription. Cancel it or wait for the current period to end.", "SUBSCRIPTION_ALREADY_OPEN");
  }
}

export function addDays(d: Date, days: number): Date {
  const out = new Date(d.getTime());
  out.setDate(out.getDate() + days);
  return out;
}

export function addMonths(d: Date, months: number): Date {
  const out = new Date(d.getTime());
  out.setMonth(out.getMonth() + months);
  return out;
}
