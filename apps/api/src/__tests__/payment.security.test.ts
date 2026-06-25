/**
 * Payment security regression tests — covers audit findings.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import express, { type Application } from "express";
import request from "supertest";

vi.hoisted(() => {
  process.env["RAZORPAY_KEY_ID"]         = "rzp_test_aaaa";
  process.env["RAZORPAY_KEY_SECRET"]     = "test_key_secret_aaaaaa";
  process.env["RAZORPAY_WEBHOOK_SECRET"] = "test_webhook_secret_bbbbbb";
  process.env["NODE_ENV"]                = "test";
});

vi.mock("@axiom/database", () => ({
  prisma: {
    subscription: {
      findUnique: vi.fn(),
      findMany:   vi.fn(),
      update:     vi.fn(),
      upsert:     vi.fn(),
    },
    payment: {
      findUnique: vi.fn(),
      findFirst:  vi.fn(),
      findMany:   vi.fn(),
      count:      vi.fn(),
      create:     vi.fn(),
      update:     vi.fn(),
    },
    webhookEvent: { create: vi.fn() },
    user:         { update: vi.fn() },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn({
      subscription: { findUnique: vi.fn(), update: vi.fn(), upsert: vi.fn() },
      payment:      { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
      user:         { update: vi.fn() },
    })),
  },
}));

vi.mock("../utils/razorpay", async () => {
  const actual = await vi.importActual<typeof import("../utils/razorpay")>("../utils/razorpay");
  return {
    ...actual,
    razorpay: {
      payments: { fetch: vi.fn() },
      orders:   { create: vi.fn() },
      subscriptions: { create: vi.fn(), cancel: vi.fn() },
    },
    fetchAndValidatePayment: vi.fn(),
  };
});

import { prisma } from "@axiom/database";
import { verifyWebhookSignature } from "../utils/razorpay";
import { hasPremiumAccess, reconcileExpiredSubscriptions } from "../services/subscription.service";
import { handleWebhook } from "../services/payment.service";
import { errorHandler, AppError } from "../middleware/errorHandler.middleware";
import { webhookHandler } from "../controllers/payment.controller";

function signWebhook(body: string): string {
  return crypto.createHmac("sha256", "test_webhook_secret_bbbbbb").update(body).digest("hex");
}

beforeEach(() => vi.clearAllMocks());

describe("hasPremiumAccess", () => {
  it("denies free users without subscription", async () => {
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.payment.count).mockResolvedValue(0);
    expect(await hasPremiumAccess("u1", "USER")).toBe(false);
  });

  it("denies USER with expired ACTIVE subscription", async () => {
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
      plan: "MONTHLY",
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() - 86_400_000),
    } as never);
    vi.mocked(prisma.payment.count).mockResolvedValue(1);
    expect(await hasPremiumAccess("u1", "USER")).toBe(false);
  });

  it("allows ACTIVE subscription within period with captured payment", async () => {
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
      plan: "MONTHLY",
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 86_400_000),
    } as never);
    vi.mocked(prisma.payment.count).mockResolvedValue(1);
    expect(await hasPremiumAccess("u1", "USER")).toBe(true);
  });

  it("allows CANCELLED subscription until period end", async () => {
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
      plan: "MONTHLY",
      status: "CANCELLED",
      currentPeriodEnd: new Date(Date.now() + 86_400_000),
    } as never);
    vi.mocked(prisma.payment.count).mockResolvedValue(1);
    expect(await hasPremiumAccess("u1", "USER")).toBe(true);
  });

  it("allows ADMIN without subscription check", async () => {
    expect(await hasPremiumAccess("admin", "ADMIN")).toBe(true);
    expect(prisma.subscription.findUnique).not.toHaveBeenCalled();
  });
});

describe("handleWebhook security", () => {
  it("rejects forged webhook signature", async () => {
    const body = JSON.stringify({ event: "subscription.charged", created_at: Math.floor(Date.now() / 1000), payload: {} });
    await expect(
      handleWebhook(Buffer.from(body), { signature: "deadbeef".repeat(8), eventId: "evt_1" }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("rejects replayed webhook event id", async () => {
    const body = JSON.stringify({
      event: "payment.captured",
      created_at: Math.floor(Date.now() / 1000),
      payload: { payment: { entity: { id: "pay_x", order_id: "order_x" } } },
    });
    const sig = signWebhook(body);
    vi.mocked(prisma.webhookEvent.create)
      .mockResolvedValueOnce({} as never)
      .mockRejectedValueOnce({ code: "P2002" } as never);
    vi.mocked(prisma.payment.findUnique).mockResolvedValue(null);

    await handleWebhook(Buffer.from(body), { signature: sig, eventId: "evt_dup" });
    const second = await handleWebhook(Buffer.from(body), { signature: sig, eventId: "evt_dup" });
    expect(second.duplicate).toBe(true);
  });

  it("rejects stale webhook by timestamp", async () => {
    const old = Math.floor((Date.now() - 48 * 60 * 60 * 1000) / 1000);
    const body = JSON.stringify({ event: "payment.captured", created_at: old, payload: {} });
    const sig = signWebhook(body);
    await expect(
      handleWebhook(Buffer.from(body), { signature: sig, eventId: "evt_old" }),
    ).rejects.toMatchObject({ statusCode: 400, code: "WEBHOOK_STALE" });
  });
});

describe("reconcileExpiredSubscriptions", () => {
  it("downgrades users past period end", async () => {
    vi.mocked(prisma.subscription.findMany).mockResolvedValue([
      {
        id: "sub1",
        userId: "u1",
        status: "ACTIVE",
        currentPeriodEnd: new Date(Date.now() - 1000),
      },
    ] as never);
    vi.mocked(prisma.$transaction).mockImplementation(async (fn) => fn({
      subscription: { update: vi.fn().mockResolvedValue({}) },
      user:         { update: vi.fn().mockResolvedValue({}) },
    } as never));

    const n = await reconcileExpiredSubscriptions();
    expect(n).toBe(1);
  });
});

describe("webhook HTTP handler", () => {
  function buildApp(): Application {
    const app = express();
    app.post("/api/payments/webhook", express.raw({ type: "application/json" }), webhookHandler);
    app.use(errorHandler);
    return app;
  }

  it("returns 401 for invalid signature at HTTP layer", async () => {
    vi.mocked(prisma.webhookEvent.create).mockResolvedValue({} as never);
    const app = buildApp();
    const res = await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .set("X-Razorpay-Signature", "bad")
      .set("X-Razorpay-Event-Id", "evt_bad")
      .send('{"event":"x","created_at":' + Math.floor(Date.now() / 1000) + "}");
    expect(res.status).toBe(401);
  });
});

describe("verifyWebhookSignature", () => {
  it("accepts valid HMAC", () => {
    const body = '{"event":"test"}';
    const sig  = signWebhook(body);
    expect(verifyWebhookSignature(body, sig)).toBe(true);
  });

  it("rejects placeholder secret attempts when real secret configured", () => {
    const body = '{"event":"test"}';
    const bad  = crypto.createHmac("sha256", "placeholder_webhook_secret").update(body).digest("hex");
    expect(verifyWebhookSignature(body, bad)).toBe(false);
  });
});
