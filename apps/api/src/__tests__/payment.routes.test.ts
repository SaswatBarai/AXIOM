import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { type Application } from "express";

import { errorHandler, AppError } from "../middleware/errorHandler.middleware";

// Mock the service before routes import — routes pull in the service transitively.
vi.mock("../services/payment.service", () => ({
  getCheckoutConfig:           vi.fn(() => ({ keyId: "rzp_test_aaaa" })),
  createOrder:                 vi.fn(),
  verifyOrderPayment:          vi.fn(),
  createSubscription:          vi.fn(),
  verifySubscriptionPayment:   vi.fn(),
  getSubscription:             vi.fn(),
  cancelSubscription:          vi.fn(),
  listPayments:                vi.fn(),
  handleWebhook:               vi.fn(),
}));

// Inject a fake user via requireAuth
vi.mock("../middleware/auth.middleware", async () => {
  const real = await vi.importActual<typeof import("../middleware/auth.middleware")>(
    "../middleware/auth.middleware",
  );
  return {
    ...real,
    requireAuth: (req: express.Request & { userId?: string; userRole?: string }, _res: express.Response, next: express.NextFunction) => {
      req.userId = "user-1";
      req.userRole = "USER";
      next();
    },
  };
});

import paymentRoutes from "../routes/payment.routes";
import { webhookHandler } from "../controllers/payment.controller";
import * as paymentService from "../services/payment.service";

function buildApp(): Application {
  const app = express();
  // Match production order: webhook BEFORE json so the body stays raw.
  app.post("/api/payments/webhook", express.raw({ type: "application/json" }), webhookHandler);
  app.use(express.json());
  app.use("/api/payments", paymentRoutes);
  app.use(errorHandler);
  return app;
}

const app = buildApp();

beforeEach(() => vi.clearAllMocks());

// ── GET /api/payments/pricing ─────────────────────────────────────────────────

describe("GET /api/payments/pricing", () => {
  it("200 — returns the 3 paid plans with prices in paise", async () => {
    const res = await request(app).get("/api/payments/pricing");
    expect(res.status).toBe(200);
    expect(res.body.plans).toHaveLength(3);
    const monthly = res.body.plans.find((p: { plan: string }) => p.plan === "MONTHLY");
    expect(monthly).toMatchObject({
      plan: "MONTHLY",
      label: "Monthly",
      amountPaise: 49_900,
      currency: "INR",
      intervalMonths: 1,
    });
  });
});

// ── GET /api/payments/checkout-config ─────────────────────────────────────────

describe("GET /api/payments/checkout-config", () => {
  it("200 — returns only the public key id", async () => {
    const res = await request(app).get("/api/payments/checkout-config");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ keyId: "rzp_test_aaaa" });
  });
});

// ── POST /api/payments/create-order ───────────────────────────────────────────

describe("POST /api/payments/create-order", () => {
  it("201 — creates a Razorpay order for a valid plan", async () => {
    vi.mocked(paymentService.createOrder).mockResolvedValue({
      orderId:  "order_AAA",
      amount:   49_900,
      currency: "INR",
      plan:     "MONTHLY",
      keyId:    "rzp_test_aaaa",
    });
    const res = await request(app)
      .post("/api/payments/create-order")
      .send({ plan: "MONTHLY" });
    expect(res.status).toBe(201);
    expect(res.body.orderId).toBe("order_AAA");
    expect(paymentService.createOrder).toHaveBeenCalledWith("user-1", "MONTHLY");
  });

  it("422 — rejects unknown plan", async () => {
    const res = await request(app).post("/api/payments/create-order").send({ plan: "GOLD" });
    expect(res.status).toBe(422);
    expect(paymentService.createOrder).not.toHaveBeenCalled();
  });

  it("422 — rejects FREE plan", async () => {
    const res = await request(app).post("/api/payments/create-order").send({ plan: "FREE" });
    expect(res.status).toBe(422);
  });
});

// ── POST /api/payments/verify ─────────────────────────────────────────────────

describe("POST /api/payments/verify", () => {
  const BODY = {
    razorpay_order_id:   "order_AAA",
    razorpay_payment_id: "pay_BBB",
    razorpay_signature:  "deadbeef".repeat(8),
  };

  it("200 — captures payment + grants PREMIUM", async () => {
    vi.mocked(paymentService.verifyOrderPayment).mockResolvedValue({
      alreadyCaptured: false,
      subscription: {
        plan: "MONTHLY",
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd:   new Date(Date.now() + 30 * 86400 * 1000),
        cancelAtPeriodEnd:  false,
      },
    } as never);
    const res = await request(app).post("/api/payments/verify").send(BODY);
    expect(res.status).toBe(200);
    expect(res.body.subscription.plan).toBe("MONTHLY");
    expect(paymentService.verifyOrderPayment).toHaveBeenCalledWith({
      userId:    "user-1",
      orderId:   BODY.razorpay_order_id,
      paymentId: BODY.razorpay_payment_id,
      signature: BODY.razorpay_signature,
    });
  });

  it("400 — bad signature surfaces as 400", async () => {
    vi.mocked(paymentService.verifyOrderPayment).mockRejectedValue(
      new AppError(400, "Invalid payment signature"),
    );
    const res = await request(app).post("/api/payments/verify").send(BODY);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/signature/i);
  });

  it("422 — rejects missing signature field", async () => {
    const res = await request(app).post("/api/payments/verify").send({
      razorpay_order_id:   "order_AAA",
      razorpay_payment_id: "pay_BBB",
    });
    expect(res.status).toBe(422);
  });

  it("403 — replay against another user's order surfaces as 403", async () => {
    vi.mocked(paymentService.verifyOrderPayment).mockRejectedValue(
      new AppError(403, "Order belongs to another user"),
    );
    const res = await request(app).post("/api/payments/verify").send(BODY);
    expect(res.status).toBe(403);
  });
});

// ── POST /api/payments/create-subscription ────────────────────────────────────

describe("POST /api/payments/create-subscription", () => {
  it("201 — creates a Razorpay subscription", async () => {
    vi.mocked(paymentService.createSubscription).mockResolvedValue({
      subscriptionId: "sub_XYZ",
      plan:           "ANNUAL",
      keyId:          "rzp_test_aaaa",
    });
    const res = await request(app)
      .post("/api/payments/create-subscription")
      .send({ plan: "ANNUAL" });
    expect(res.status).toBe(201);
    expect(res.body.subscriptionId).toBe("sub_XYZ");
  });

  it("409 — refuses duplicate open subscription", async () => {
    vi.mocked(paymentService.createSubscription).mockRejectedValue(
      new AppError(409, "You already have an open subscription. Cancel it or wait for the current period to end.", "SUBSCRIPTION_ALREADY_OPEN"),
    );
    const res = await request(app)
      .post("/api/payments/create-subscription")
      .send({ plan: "ANNUAL" });
    expect(res.status).toBe(409);
  });
});

// ── GET /api/payments/subscription ────────────────────────────────────────────

describe("GET /api/payments/subscription", () => {
  it("200 — returns FREE view for unsubscribed user", async () => {
    vi.mocked(paymentService.getSubscription).mockResolvedValue({
      plan: "FREE",
      status: "ACTIVE",
      currentPeriodStart: null,
      currentPeriodEnd:   null,
      cancelAtPeriodEnd:  false,
    });
    const res = await request(app).get("/api/payments/subscription");
    expect(res.status).toBe(200);
    expect(res.body.subscription.plan).toBe("FREE");
  });
});

// ── POST /api/payments/cancel ─────────────────────────────────────────────────

describe("POST /api/payments/cancel", () => {
  it("200 — schedules cancellation at period end", async () => {
    vi.mocked(paymentService.cancelSubscription).mockResolvedValue({
      plan: "MONTHLY",
      status: "CANCELLED",
      currentPeriodStart: new Date(),
      currentPeriodEnd:   new Date(Date.now() + 86400 * 1000),
      cancelAtPeriodEnd:  true,
    });
    const res = await request(app).post("/api/payments/cancel");
    expect(res.status).toBe(200);
    expect(res.body.subscription.cancelAtPeriodEnd).toBe(true);
  });

  it("404 — no active subscription", async () => {
    vi.mocked(paymentService.cancelSubscription).mockRejectedValue(
      new AppError(404, "No active subscription to cancel"),
    );
    const res = await request(app).post("/api/payments/cancel");
    expect(res.status).toBe(404);
  });
});

// ── POST /api/payments/webhook ────────────────────────────────────────────────

describe("POST /api/payments/webhook", () => {
  it("200 — forwards raw body + signature header to handler", async () => {
    vi.mocked(paymentService.handleWebhook).mockResolvedValue({ ok: true, event: "payment.captured" });
    const payload = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: {} } } });
    const res = await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .set("X-Razorpay-Signature", "abc123")
      .send(payload);
    expect(res.status).toBe(200);
    expect(paymentService.handleWebhook).toHaveBeenCalled();
    const [body, meta] = vi.mocked(paymentService.handleWebhook).mock.calls[0]!;
    expect(Buffer.isBuffer(body)).toBe(true);
    expect((body as Buffer).toString("utf8")).toBe(payload);
    expect(meta).toMatchObject({ signature: "abc123" });
  });

  it("401 — bad webhook signature surfaces as 401", async () => {
    vi.mocked(paymentService.handleWebhook).mockRejectedValue(
      new AppError(401, "Invalid webhook signature"),
    );
    const res = await request(app)
      .post("/api/payments/webhook")
      .set("Content-Type", "application/json")
      .set("X-Razorpay-Signature", "wrong")
      .send('{"event":"x"}');
    expect(res.status).toBe(401);
  });
});
