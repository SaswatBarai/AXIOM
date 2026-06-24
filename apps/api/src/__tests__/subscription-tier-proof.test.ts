/**
 * Runtime proof: paid tiers (MONTHLY / QUARTERLY / ANNUAL) share identical access.
 * This test FAILS if any tier gets different hasPremiumAccess() outcome.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@axiom/database", () => ({
  prisma: {
    subscription: { findUnique: vi.fn() },
    payment:      { count: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@axiom/database";
import { hasPremiumAccess } from "../services/subscription.service";

const PAID_PLANS = ["MONTHLY", "QUARTERLY", "ANNUAL"] as const;
const future = new Date(Date.now() + 30 * 86_400_000);

function mockPaidSub(plan: string) {
  vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
    plan,
    status: "ACTIVE",
    currentPeriodEnd: future,
  } as never);
  vi.mocked(prisma.payment.count).mockResolvedValue(1);
}

beforeEach(() => vi.clearAllMocks());

describe("runtime proof: paid tier access is identical", () => {
  it("MONTHLY, QUARTERLY, ANNUAL all return true — same access gate", async () => {
    const outcomes: boolean[] = [];
    for (const plan of PAID_PLANS) {
      mockPaidSub(plan);
      outcomes.push(await hasPremiumAccess("user-1", "USER"));
    }
    expect(outcomes).toEqual([true, true, true]);
    expect(new Set(outcomes).size).toBe(1);
  });
});

describe("runtime proof: FREE is the only denied tier among plan types", () => {
  it("FREE plan → false", async () => {
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
      plan: "FREE",
      status: "ACTIVE",
      currentPeriodEnd: future,
    } as never);
    vi.mocked(prisma.payment.count).mockResolvedValue(0);
    expect(await hasPremiumAccess("u", "USER")).toBe(false);
  });
});
