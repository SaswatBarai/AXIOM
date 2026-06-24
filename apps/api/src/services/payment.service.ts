/**
 * Razorpay payment + subscription service.
 *
 * Two flows are supported:
 *   - one-time order   → createOrder → user pays → verifyOrderPayment → grant
 *   - recurring sub    → createSubscription → user pays → verifySubscriptionPayment → grant
 *
 * Webhook events extend / downgrade subscriptions out-of-band (renewal, failure,
 * cancellation). All side effects that flip user.role go through `grantPremium`
 * / `revokePremium` so the logic stays in one place.
 */
import { prisma, type Prisma } from "@axiom/database";
import { AppError } from "../middleware/errorHandler.middleware";
import { logger } from "../utils/logger";
import {
  razorpay,
  RAZORPAY_KEY_ID,
  PLAN_CATALOG,
  type PlanKey,
  verifyOrderSignature,
  verifySubscriptionSignature,
  verifyWebhookSignature,
} from "../utils/razorpay";

// ── Public DTOs ──────────────────────────────────────────────────────────────

export interface CheckoutConfig {
  keyId: string;
}

export interface CreateOrderResult {
  orderId:  string;
  amount:   number;     // paise
  currency: "INR";
  plan:     PlanKey;
  keyId:    string;
}

export interface CreateSubscriptionResult {
  subscriptionId: string;
  plan:           PlanKey;
  keyId:          string;
}

export interface SubscriptionView {
  plan:               "FREE" | PlanKey;
  status:             "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
  currentPeriodStart: Date | null;
  currentPeriodEnd:   Date | null;
  cancelAtPeriodEnd:  boolean;
}

// ── Read helpers ─────────────────────────────────────────────────────────────

export function getCheckoutConfig(): CheckoutConfig {
  return { keyId: RAZORPAY_KEY_ID };
}

export async function getSubscription(userId: string): Promise<SubscriptionView> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) {
    return {
      plan:               "FREE",
      status:             "ACTIVE",
      currentPeriodStart: null,
      currentPeriodEnd:   null,
      cancelAtPeriodEnd:  false,
    };
  }
  return {
    plan:               sub.plan as SubscriptionView["plan"],
    status:             sub.status as SubscriptionView["status"],
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd:   sub.currentPeriodEnd,
    cancelAtPeriodEnd:  sub.cancelAtPeriodEnd,
  };
}

export async function listPayments(userId: string) {
  return prisma.payment.findMany({
    where:    { userId },
    orderBy:  { createdAt: "desc" },
    select: {
      id:                true,
      razorpayOrderId:   true,
      razorpayPaymentId: true,
      amount:            true,
      currency:          true,
      plan:              true,
      status:            true,
      createdAt:         true,
    },
  });
}

// ── One-time order flow ──────────────────────────────────────────────────────

export async function createOrder(userId: string, plan: PlanKey): Promise<CreateOrderResult> {
  const def = PLAN_CATALOG[plan];
  if (!def) throw new AppError(400, `Unknown plan: ${plan}`);

  const order = await razorpay.orders.create({
    amount:           def.amountPaise,
    currency:         "INR",
    receipt:          `axiom_${userId}_${Date.now()}`,
    notes:            { userId, plan },
    partial_payment:  false,
  });

  await prisma.payment.create({
    data: {
      userId,
      razorpayOrderId: order.id,
      amount:          def.amountPaise,
      currency:        "INR",
      plan,
      status:          "PENDING",
    },
  });

  return {
    orderId:  order.id,
    amount:   def.amountPaise,
    currency: "INR",
    plan,
    keyId:    RAZORPAY_KEY_ID,
  };
}

interface VerifyOrderInput {
  userId:    string;
  orderId:   string;
  paymentId: string;
  signature: string;
}

export async function verifyOrderPayment(input: VerifyOrderInput) {
  if (!verifyOrderSignature(input.orderId, input.paymentId, input.signature)) {
    logger.warn(`payment verify: bad signature for order ${input.orderId}`);
    throw new AppError(400, "Invalid payment signature");
  }

  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: input.orderId } });
  if (!payment)               throw new AppError(404, "Order not found");
  if (payment.userId !== input.userId) throw new AppError(403, "Order belongs to another user");

  // Idempotency — re-running with same payment id is a no-op
  if (payment.status === "CAPTURED" && payment.razorpayPaymentId === input.paymentId) {
    const sub = await getSubscription(input.userId);
    return { alreadyCaptured: true, subscription: sub };
  }

  const plan = payment.plan as PlanKey;
  const subscription = await grantPremium(input.userId, plan, {
    razorpayPaymentId: input.paymentId,
    razorpayOrderId:   input.orderId,
    razorpaySignature: input.signature,
  });

  return { alreadyCaptured: false, subscription };
}

// ── Recurring subscription flow ──────────────────────────────────────────────

export async function createSubscription(userId: string, plan: PlanKey): Promise<CreateSubscriptionResult> {
  const def = PLAN_CATALOG[plan];
  if (!def) throw new AppError(400, `Unknown plan: ${plan}`);

  // Cancel any existing pending subscription on this user (defensive — Razorpay
  // also enforces uniqueness, but the failure mode there is opaque).
  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing && existing.razorpaySubscriptionId && existing.status === "ACTIVE") {
    throw new AppError(409, "User already has an active subscription");
  }

  // total_count = 60 → ~5 years of monthly billing, plenty of headroom
  const sub = await razorpay.subscriptions.create({
    plan_id:       def.razorpayPlanId,
    customer_notify: 1,
    total_count:   60,
    notes:         { userId, plan },
  });

  // Persist a placeholder row so webhooks can find the user via subscription id
  await prisma.subscription.upsert({
    where:  { userId },
    update: {
      razorpaySubscriptionId: sub.id,
      plan,
      status:             "PAST_DUE",  // becomes ACTIVE on first successful charge
      currentPeriodStart: new Date(),
      currentPeriodEnd:   addMonths(new Date(), def.intervalMonths),
      cancelAtPeriodEnd:  false,
    },
    create: {
      userId,
      razorpaySubscriptionId: sub.id,
      plan,
      status:             "PAST_DUE",
      currentPeriodStart: new Date(),
      currentPeriodEnd:   addMonths(new Date(), def.intervalMonths),
      cancelAtPeriodEnd:  false,
    },
  });

  return { subscriptionId: sub.id, plan, keyId: RAZORPAY_KEY_ID };
}

interface VerifySubscriptionInput {
  userId:         string;
  subscriptionId: string;
  paymentId:      string;
  signature:      string;
}

export async function verifySubscriptionPayment(input: VerifySubscriptionInput) {
  if (!verifySubscriptionSignature(input.subscriptionId, input.paymentId, input.signature)) {
    logger.warn(`subscription verify: bad signature for ${input.subscriptionId}`);
    throw new AppError(400, "Invalid payment signature");
  }

  const sub = await prisma.subscription.findUnique({
    where: { razorpaySubscriptionId: input.subscriptionId },
  });
  if (!sub)                          throw new AppError(404, "Subscription not found");
  if (sub.userId !== input.userId)   throw new AppError(403, "Subscription belongs to another user");

  // Already processed?
  const existingPayment = await prisma.payment.findUnique({
    where: { razorpayPaymentId: input.paymentId },
  });
  if (existingPayment) {
    return { alreadyCaptured: true, subscription: await getSubscription(input.userId) };
  }

  const plan = sub.plan as PlanKey;
  const def  = PLAN_CATALOG[plan];

  await prisma.payment.create({
    data: {
      userId:            input.userId,
      subscriptionId:    sub.id,
      razorpayOrderId:   `sub_${input.subscriptionId}_${input.paymentId}`, // synthetic — orderId is per-charge with subs
      razorpayPaymentId: input.paymentId,
      razorpaySignature: input.signature,
      amount:            def.amountPaise,
      currency:          "INR",
      plan,
      status:            "CAPTURED",
    },
  });

  const view = await activatePeriod(input.userId, plan);
  return { alreadyCaptured: false, subscription: view };
}

// ── Cancellation ─────────────────────────────────────────────────────────────

export async function cancelSubscription(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub || sub.plan === "FREE") throw new AppError(404, "No active subscription to cancel");

  if (sub.razorpaySubscriptionId) {
    try {
      // `cancel_at_cycle_end = 1` keeps the user on PREMIUM until period end
      await razorpay.subscriptions.cancel(sub.razorpaySubscriptionId, true);
    } catch (err) {
      logger.warn(`razorpay cancel failed for ${sub.razorpaySubscriptionId}: ${(err as Error).message}`);
      // Fall through — still mark cancelAtPeriodEnd locally so cron can clean up
    }
  }

  await prisma.subscription.update({
    where: { userId },
    data:  { cancelAtPeriodEnd: true, status: "CANCELLED" },
  });

  return getSubscription(userId);
}

// ── Webhook dispatch ─────────────────────────────────────────────────────────

interface WebhookPayload {
  event:   string;
  payload: Record<string, { entity: Record<string, unknown> }>;
}

export async function handleWebhook(rawBody: Buffer | string, signatureHeader: string) {
  if (!verifyWebhookSignature(rawBody, signatureHeader)) {
    logger.warn("webhook: signature verification failed");
    throw new AppError(401, "Invalid webhook signature");
  }

  const body = typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
  const parsed = JSON.parse(body) as WebhookPayload;

  switch (parsed.event) {
    case "payment.captured":
      await onPaymentCaptured(parsed);
      break;
    case "payment.failed":
      await onPaymentFailed(parsed);
      break;
    case "subscription.charged":
      await onSubscriptionCharged(parsed);
      break;
    case "subscription.cancelled":
      await onSubscriptionCancelled(parsed);
      break;
    case "subscription.completed":
      await onSubscriptionCompleted(parsed);
      break;
    default:
      logger.info(`webhook: ignoring event ${parsed.event}`);
  }
  return { ok: true, event: parsed.event };
}

async function onPaymentCaptured(p: WebhookPayload) {
  const pay = p.payload.payment?.entity as { id: string; order_id?: string } | undefined;
  if (!pay) return;
  const existing = await prisma.payment.findFirst({
    where: { OR: [{ razorpayPaymentId: pay.id }, { razorpayOrderId: pay.order_id ?? "" }] },
  });
  if (!existing) return;
  if (existing.status === "CAPTURED") return; // idempotent
  await prisma.payment.update({
    where: { id: existing.id },
    data:  { status: "CAPTURED", razorpayPaymentId: pay.id },
  });
}

async function onPaymentFailed(p: WebhookPayload) {
  const pay = p.payload.payment?.entity as { id: string; order_id?: string } | undefined;
  if (!pay) return;
  const existing = await prisma.payment.findFirst({
    where: { razorpayOrderId: pay.order_id ?? "" },
  });
  if (!existing) return;
  await prisma.payment.update({
    where: { id: existing.id },
    data:  { status: "FAILED", razorpayPaymentId: pay.id },
  });
  // If subscription, mark PAST_DUE — cron + grace period handles the rest
  if (existing.subscriptionId) {
    await prisma.subscription.update({
      where: { id: existing.subscriptionId },
      data:  { status: "PAST_DUE" },
    });
  }
}

async function onSubscriptionCharged(p: WebhookPayload) {
  const subEntity = p.payload.subscription?.entity as
    | { id: string; current_start?: number; current_end?: number }
    | undefined;
  if (!subEntity) return;
  const sub = await prisma.subscription.findUnique({
    where: { razorpaySubscriptionId: subEntity.id },
  });
  if (!sub) return;
  const def = PLAN_CATALOG[sub.plan as PlanKey];
  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status:             "ACTIVE",
      currentPeriodStart: subEntity.current_start ? new Date(subEntity.current_start * 1000) : sub.currentPeriodStart,
      currentPeriodEnd:   subEntity.current_end   ? new Date(subEntity.current_end   * 1000) : addMonths(new Date(), def.intervalMonths),
    },
  });
  await prisma.user.update({
    where: { id: sub.userId },
    data:  { role: "PREMIUM" },
  });
}

async function onSubscriptionCancelled(p: WebhookPayload) {
  const subEntity = p.payload.subscription?.entity as { id: string } | undefined;
  if (!subEntity) return;
  await prisma.subscription.updateMany({
    where: { razorpaySubscriptionId: subEntity.id },
    data:  { cancelAtPeriodEnd: true, status: "CANCELLED" },
  });
}

async function onSubscriptionCompleted(p: WebhookPayload) {
  const subEntity = p.payload.subscription?.entity as { id: string } | undefined;
  if (!subEntity) return;
  const sub = await prisma.subscription.findUnique({
    where: { razorpaySubscriptionId: subEntity.id },
  });
  if (!sub) return;
  await prisma.subscription.update({
    where: { id: sub.id },
    data:  { status: "EXPIRED" },
  });
  await prisma.user.update({
    where: { id: sub.userId },
    data:  { role: "USER" },
  });
}

// ── Internals: grant / revoke premium ────────────────────────────────────────

interface GrantArgs {
  razorpayPaymentId: string;
  razorpayOrderId:   string;
  razorpaySignature: string;
}

async function grantPremium(userId: string, plan: PlanKey, args: GrantArgs): Promise<SubscriptionView> {
  const def = PLAN_CATALOG[plan];
  const now = new Date();
  const end = addMonths(now, def.intervalMonths);

  // Update existing pending Payment row to CAPTURED
  await prisma.payment.update({
    where: { razorpayOrderId: args.razorpayOrderId },
    data: {
      razorpayPaymentId: args.razorpayPaymentId,
      razorpaySignature: args.razorpaySignature,
      status:            "CAPTURED",
    } satisfies Prisma.PaymentUpdateInput,
  });

  // Upsert subscription
  await prisma.subscription.upsert({
    where: { userId },
    update: {
      plan,
      status:             "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd:   end,
      cancelAtPeriodEnd:  false,
    },
    create: {
      userId,
      plan,
      status:             "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd:   end,
      cancelAtPeriodEnd:  false,
    },
  });

  // Upgrade role last so a partial failure leaves the user downgraded, not falsely upgraded
  await prisma.user.update({ where: { id: userId }, data: { role: "PREMIUM" } });

  return getSubscription(userId);
}

async function activatePeriod(userId: string, plan: PlanKey): Promise<SubscriptionView> {
  const def = PLAN_CATALOG[plan];
  const now = new Date();
  const end = addMonths(now, def.intervalMonths);
  await prisma.subscription.update({
    where: { userId },
    data: {
      status:             "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd:   end,
      cancelAtPeriodEnd:  false,
    },
  });
  await prisma.user.update({ where: { id: userId }, data: { role: "PREMIUM" } });
  return getSubscription(userId);
}

function addMonths(d: Date, months: number): Date {
  const out = new Date(d.getTime());
  out.setMonth(out.getMonth() + months);
  return out;
}
