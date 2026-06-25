import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks (must be hoisted before imports that trigger module load) ────────────

vi.mock("@axiom/database", () => ({
  prisma: {
    subscription: { findUnique: vi.fn() },
    payment:      { count: vi.fn() },
    jobAlert:     { count: vi.fn() },
  },
}));

vi.mock("../services/redis.service", () => ({
  redis: { get: vi.fn(), incr: vi.fn(), pexpire: vi.fn() },
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { prisma } from "@axiom/database";
import { redis } from "../services/redis.service";
import { PLAN_ENTITLEMENTS, getEntitlements } from "../config/plan-entitlements";
import { getUserPlan } from "../services/subscription.service";
import { createAlert } from "../services/notification.service";
import { planRateLimit } from "../middleware/rateLimit.middleware";
import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";

const future = new Date(Date.now() + 30 * 86_400_000);

beforeEach(() => vi.clearAllMocks());

// ── Test 1: maxJobAlerts differs across paid tiers ────────────────────────────

describe("PLAN_ENTITLEMENTS — maxJobAlerts differs per tier", () => {
  it("MONTHLY=3, QUARTERLY=10, ANNUAL=25", () => {
    expect(PLAN_ENTITLEMENTS.MONTHLY.maxJobAlerts).toBe(3);
    expect(PLAN_ENTITLEMENTS.QUARTERLY.maxJobAlerts).toBe(10);
    expect(PLAN_ENTITLEMENTS.ANNUAL.maxJobAlerts).toBe(25);
  });
});

// ── Test 2: chatMessagesPerHour strictly increases across tiers ───────────────

describe("PLAN_ENTITLEMENTS — chatMessagesPerHour strictly increasing", () => {
  it("MONTHLY < QUARTERLY < ANNUAL", () => {
    expect(PLAN_ENTITLEMENTS.MONTHLY.chatMessagesPerHour).toBeLessThan(
      PLAN_ENTITLEMENTS.QUARTERLY.chatMessagesPerHour,
    );
    expect(PLAN_ENTITLEMENTS.QUARTERLY.chatMessagesPerHour).toBeLessThan(
      PLAN_ENTITLEMENTS.ANNUAL.chatMessagesPerHour,
    );
  });
});

// ── Test 3: getUserPlan returns FREE when no subscription exists ──────────────

describe("getUserPlan()", () => {
  it("returns FREE when user has no subscription row", async () => {
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue(null);
    expect(await getUserPlan("user-no-sub")).toBe("FREE");
  });

  it("returns FREE when subscription plan is FREE", async () => {
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
      plan: "FREE", status: "ACTIVE", currentPeriodEnd: future,
    } as never);
    vi.mocked(prisma.payment.count).mockResolvedValue(0);
    expect(await getUserPlan("user-free")).toBe("FREE");
  });

  // ── Test 4: getUserPlan returns the correct plan for a MONTHLY user ─────────

  it("returns MONTHLY for an active MONTHLY subscriber", async () => {
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
      plan: "MONTHLY", status: "ACTIVE", currentPeriodEnd: future,
    } as never);
    vi.mocked(prisma.payment.count).mockResolvedValue(1);
    expect(await getUserPlan("user-monthly")).toBe("MONTHLY");
  });

  it("returns FREE when subscription is expired", async () => {
    const past = new Date(Date.now() - 86_400_000);
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
      plan: "MONTHLY", status: "EXPIRED", currentPeriodEnd: past,
    } as never);
    vi.mocked(prisma.payment.count).mockResolvedValue(1);
    expect(await getUserPlan("user-expired")).toBe("FREE");
  });
});

// ── Test 5: createAlert enforces maxJobAlerts cap ─────────────────────────────

describe("createAlert() — job alert cap enforcement", () => {
  it("throws 403 JOB_ALERT_LIMIT when MONTHLY user hits cap of 3", async () => {
    // getUserPlan internals
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
      plan: "MONTHLY", status: "ACTIVE", currentPeriodEnd: future,
    } as never);
    vi.mocked(prisma.payment.count).mockResolvedValue(1);
    // existing alert count at cap
    vi.mocked(prisma.jobAlert.count).mockResolvedValue(3);

    await expect(
      createAlert("user-monthly", "My Alert", { keywords: "engineer" }),
    ).rejects.toMatchObject({ statusCode: 403, code: "JOB_ALERT_LIMIT" });
  });

  it("throws 403 PREMIUM_REQUIRED for FREE user (maxJobAlerts=0)", async () => {
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue(null);

    await expect(
      createAlert("user-free", "My Alert", {}),
    ).rejects.toMatchObject({ statusCode: 403, code: "PREMIUM_REQUIRED" });
  });
});

// ── Test 6: planRateLimit blocks at the correct per-plan threshold ────────────

describe("planRateLimit() — blocks at plan threshold", () => {
  function makeReq(userId: string): AuthRequest {
    return { userId } as AuthRequest;
  }

  function makeRes(): Response {
    const json = vi.fn().mockReturnThis();
    const status = vi.fn().mockReturnValue({ json });
    return { status, json } as unknown as Response;
  }

  it("returns 429 on the 51st chat message for a MONTHLY user", async () => {
    // getUserPlan mocks for MONTHLY
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
      plan: "MONTHLY", status: "ACTIVE", currentPeriodEnd: future,
    } as never);
    vi.mocked(prisma.payment.count).mockResolvedValue(1);

    // Redis incr returns 51 (one over the 50 limit)
    vi.mocked(redis.incr).mockResolvedValue(51);
    vi.mocked(redis.pexpire).mockResolvedValue(1);

    const middleware = planRateLimit("chatMessagesPerHour");
    const req  = makeReq("user-monthly");
    const res  = makeRes();
    const next = vi.fn() as unknown as NextFunction;

    await middleware(req as never, res, next);

    expect(next).not.toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(res.status).toHaveBeenCalledWith(429);
  });

  it("calls next() for the 50th chat message (at limit, not over)", async () => {
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
      plan: "MONTHLY", status: "ACTIVE", currentPeriodEnd: future,
    } as never);
    vi.mocked(prisma.payment.count).mockResolvedValue(1);

    vi.mocked(redis.incr).mockResolvedValue(50);
    vi.mocked(redis.pexpire).mockResolvedValue(1);

    const middleware = planRateLimit("chatMessagesPerHour");
    const req  = makeReq("user-monthly");
    const res  = makeRes();
    const next = vi.fn() as unknown as NextFunction;

    await middleware(req as never, res, next);

    expect(next).toHaveBeenCalled();
  });
});

// ── getEntitlements helper ────────────────────────────────────────────────────

describe("getEntitlements()", () => {
  it("returns FREE entitlements for null/undefined/unknown plan", () => {
    expect(getEntitlements(null)).toEqual(PLAN_ENTITLEMENTS.FREE);
    expect(getEntitlements(undefined)).toEqual(PLAN_ENTITLEMENTS.FREE);
    expect(getEntitlements("BOGUS")).toEqual(PLAN_ENTITLEMENTS.FREE);
  });

  it("returns correct entitlements for each named plan", () => {
    expect(getEntitlements("MONTHLY")).toEqual(PLAN_ENTITLEMENTS.MONTHLY);
    expect(getEntitlements("QUARTERLY")).toEqual(PLAN_ENTITLEMENTS.QUARTERLY);
    expect(getEntitlements("ANNUAL")).toEqual(PLAN_ENTITLEMENTS.ANNUAL);
  });
});
