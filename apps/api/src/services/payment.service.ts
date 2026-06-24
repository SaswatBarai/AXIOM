/**
 * Razorpay payment + subscription service (production-hardened).
 *
 * Security guarantees:
 *  - Amount/currency always from server catalog
 *  - HMAC signature + Razorpay API fetch before granting access
 *  - DB transactions for grant paths (no duplicate premium)
 *  - Webhook deduplication, timestamp checks, signature verification
 *  - One-time orders grant premium via verify OR payment.captured webhook
 */
import { prisma, type Prisma } from "@axiom/database";
import type { Orders } from "razorpay/dist/types/orders";
import type { Subscriptions } from "razorpay/dist/types/subscriptions";
import { AppError } from "../middleware/errorHandler.middleware";
import { logger } from "../utils/logger";
import {
  razorpay,
  RAZORPAY_KEY_ID,
  RAZORPAY_IS_CONFIGURED,
  PLAN_CATALOG,
  type PlanKey,
  verifyOrderSignature,
  verifySubscriptionSignature,
  verifyWebhookSignature,
  fetchAndValidatePayment,
  PaymentValidationError,
} from "../utils/razorpay";
import {
  addMonths,
  assertCanCreateSubscription,
  grantPremiumRole,
  revokePremiumRole,
  WEBHOOK_MAX_AGE_MS,
} from "./subscription.service";

type Tx = Prisma.TransactionClient;

// ── Razorpay error normalization ────────────────────────────────────────────

interface RazorpayErrorShape {
  statusCode?: number;
  error?: { code?: string; description?: string; reason?: string };
}

function razorpayErrorMessage(err: unknown): string {
  const e = err as RazorpayErrorShape;
  if (e?.error?.description) return e.error.description;
  if (err instanceof Error)  return err.message;
  return "Razorpay request failed";
}

function wrapRazorpayError(err: unknown): AppError {
  if (err instanceof PaymentValidationError) {
    return new AppError(400, err.message, "PAYMENT_VALIDATION_FAILED");
  }
  if (!RAZORPAY_IS_CONFIGURED) {
    return new AppError(
      503,
      "Razorpay is not configured on this server.",
      "RAZORPAY_NOT_CONFIGURED",
    );
  }
  const desc = razorpayErrorMessage(err);
  const status = (err as RazorpayErrorShape)?.statusCode;
  if (status && status >= 400 && status < 500) {
    return new AppError(400, `Payment gateway: ${desc}`);
  }
  logger.error(`razorpay upstream error: ${desc}`);
  return new AppError(502, "Payment gateway is currently unavailable. Please try again in a moment.");
}

// ── Public DTOs ──────────────────────────────────────────────────────────────

export interface CheckoutConfig { keyId: string; }

export interface CreateOrderResult {
  orderId:  string;
  amount:   number;
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

export interface VerifyResult {
  alreadyCaptured: boolean;
  subscription:    SubscriptionView;
}

// ── Read helpers ─────────────────────────────────────────────────────────────

export function getCheckoutConfig(): CheckoutConfig {
  return { keyId: RAZORPAY_KEY_ID };
}

export async function getSubscription(userId: string): Promise<SubscriptionView> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) {
    return {
      plan: "FREE", status: "ACTIVE",
      currentPeriodStart: null, currentPeriodEnd: null, cancelAtPeriodEnd: false,
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
    where:   { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, razorpayOrderId: true, razorpayPaymentId: true,
      amount: true, currency: true, plan: true, status: true, createdAt: true,
    },
  });
}

// ── One-time order flow ──────────────────────────────────────────────────────

export async function createOrder(userId: string, plan: PlanKey): Promise<CreateOrderResult> {
  const def = PLAN_CATALOG[plan];
  if (!def) throw new AppError(400, `Unknown plan: ${plan}`);

  let order: Orders.RazorpayOrder;
  try {
    order = await razorpay.orders.create({
      amount:          def.amountPaise,
      currency:        "INR",
      receipt:         `axiom_${userId}_${Date.now()}`,
      notes:           { userId, plan },
      partial_payment: false,
    });
  } catch (err) {
    throw wrapRazorpayError(err);
  }

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

  logger.info(`payment order created: user=${userId} order=${order.id} plan=${plan}`);
  return { orderId: order.id, amount: def.amountPaise, currency: "INR", plan, keyId: RAZORPAY_KEY_ID };
}

interface VerifyOrderInput {
  userId: string; orderId: string; paymentId: string; signature: string;
}

export async function verifyOrderPayment(input: VerifyOrderInput): Promise<VerifyResult> {
  if (!verifyOrderSignature(input.orderId, input.paymentId, input.signature)) {
    logger.warn(`payment verify: bad signature for order ${input.orderId}`);
    throw new AppError(400, "Invalid payment signature");
  }

  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: input.orderId } });
  if (!payment) throw new AppError(404, "Order not found");
  if (payment.userId !== input.userId) throw new AppError(403, "Order belongs to another user");

  if (payment.status === "CAPTURED" && payment.razorpayPaymentId === input.paymentId) {
    return { alreadyCaptured: true, subscription: await getSubscription(input.userId) };
  }
  if (payment.status === "CAPTURED") {
    throw new AppError(409, "Order already paid with a different payment", "ORDER_ALREADY_PAID");
  }

  try {
    await fetchAndValidatePayment(input.paymentId, {
      amountPaise: payment.amount,
      currency:    payment.currency,
      orderId:     input.orderId,
    });
  } catch (err) {
    throw wrapRazorpayError(err);
  }

  const plan = payment.plan as PlanKey;
  const subscription = await grantPremiumTransactional(input.userId, plan, {
    razorpayPaymentId: input.paymentId,
    razorpayOrderId:   input.orderId,
    razorpaySignature: input.signature,
  });

  logger.info(`payment verified: user=${input.userId} order=${input.orderId} payment=${input.paymentId}`);
  return { alreadyCaptured: false, subscription };
}

// ── Recurring subscription flow ──────────────────────────────────────────────

export async function createSubscription(userId: string, plan: PlanKey): Promise<CreateSubscriptionResult> {
  const def = PLAN_CATALOG[plan];
  if (!def) throw new AppError(400, `Unknown plan: ${plan}`);

  await assertCanCreateSubscription(userId);

  const existing = await prisma.subscription.findUnique({ where: { userId } });
  if (existing?.razorpaySubscriptionId && existing.status === "PAST_DUE") {
    try {
      await razorpay.subscriptions.cancel(existing.razorpaySubscriptionId, false);
    } catch (err) {
      logger.warn(`cancel stale razorpay sub ${existing.razorpaySubscriptionId}: ${(err as Error).message}`);
    }
  }

  let sub: Subscriptions.RazorpaySubscription;
  try {
    sub = await razorpay.subscriptions.create({
      plan_id:         def.razorpayPlanId,
      customer_notify: 1,
      total_count:     60,
      notes:           { userId, plan },
    });
  } catch (err) {
    throw wrapRazorpayError(err);
  }

  await prisma.subscription.upsert({
    where:  { userId },
    update: {
      razorpaySubscriptionId: sub.id,
      plan,
      status:             "PAST_DUE",
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

  logger.info(`subscription created: user=${userId} sub=${sub.id} plan=${plan}`);
  return { subscriptionId: sub.id, plan, keyId: RAZORPAY_KEY_ID };
}

interface VerifySubscriptionInput {
  userId: string; subscriptionId: string; paymentId: string; signature: string;
}

export async function verifySubscriptionPayment(input: VerifySubscriptionInput): Promise<VerifyResult> {
  if (!verifySubscriptionSignature(input.subscriptionId, input.paymentId, input.signature)) {
    logger.warn(`subscription verify: bad signature for ${input.subscriptionId}`);
    throw new AppError(400, "Invalid payment signature");
  }

  const sub = await prisma.subscription.findUnique({
    where: { razorpaySubscriptionId: input.subscriptionId },
  });
  if (!sub) throw new AppError(404, "Subscription not found");
  if (sub.userId !== input.userId) throw new AppError(403, "Subscription belongs to another user");

  const existingPayment = await prisma.payment.findUnique({
    where: { razorpayPaymentId: input.paymentId },
  });
  if (existingPayment) {
    return { alreadyCaptured: true, subscription: await getSubscription(input.userId) };
  }

  const plan = sub.plan as PlanKey;
  const def  = PLAN_CATALOG[plan];

  try {
    await fetchAndValidatePayment(input.paymentId, {
      amountPaise: def.amountPaise,
      currency:    "INR",
    });
  } catch (err) {
    throw wrapRazorpayError(err);
  }

  const subscription = await prisma.$transaction(async (tx) => {
    const dup = await tx.payment.findUnique({ where: { razorpayPaymentId: input.paymentId } });
    if (dup) return getSubscriptionInTx(tx, input.userId);

    await tx.payment.create({
      data: {
        userId:            input.userId,
        subscriptionId:    sub.id,
        razorpayOrderId:   `sub_${input.subscriptionId}_${input.paymentId}`,
        razorpayPaymentId: input.paymentId,
        razorpaySignature: input.signature,
        amount:            def.amountPaise,
        currency:          "INR",
        plan,
        status:            "CAPTURED",
      },
    });

    return activatePeriodInTx(tx, input.userId, plan);
  });

  logger.info(`subscription verified: user=${input.userId} sub=${input.subscriptionId}`);
  return { alreadyCaptured: false, subscription };
}

// ── Cancellation ─────────────────────────────────────────────────────────────

export async function cancelSubscription(userId: string): Promise<SubscriptionView> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub || sub.plan === "FREE") throw new AppError(404, "No active subscription to cancel");

  if (sub.razorpaySubscriptionId) {
    try {
      await razorpay.subscriptions.cancel(sub.razorpaySubscriptionId, true);
    } catch (err) {
      logger.warn(`razorpay cancel failed for ${sub.razorpaySubscriptionId}: ${(err as Error).message}`);
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
  event:       string;
  created_at?: number;
  payload:     Record<string, { entity: Record<string, unknown> }>;
}

export interface WebhookMeta {
  eventId:   string;
  signature: string;
}

export async function handleWebhook(
  rawBody: Buffer | string,
  meta: WebhookMeta,
): Promise<{ ok: boolean; event: string; duplicate?: boolean }> {
  if (!verifyWebhookSignature(rawBody, meta.signature)) {
    logger.warn("webhook: signature verification failed");
    throw new AppError(401, "Invalid webhook signature");
  }

  const body = typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
  const parsed = JSON.parse(body) as WebhookPayload;

  if (parsed.created_at) {
    const ageMs = Date.now() - parsed.created_at * 1000;
    if (ageMs > WEBHOOK_MAX_AGE_MS) {
      logger.warn(`webhook: stale event ${meta.eventId} age=${ageMs}ms`);
      throw new AppError(400, "Webhook event too old", "WEBHOOK_STALE");
    }
  }

  const duplicate = await recordWebhookEvent(meta.eventId, parsed.event);
  if (duplicate) {
    logger.info(`webhook: duplicate event ${meta.eventId}`);
    return { ok: true, event: parsed.event, duplicate: true };
  }

  logger.info(`webhook received: event=${parsed.event} id=${meta.eventId}`);

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

/** Returns true if this event was already processed (idempotent). */
async function recordWebhookEvent(eventId: string, eventType: string): Promise<boolean> {
  try {
    await prisma.webhookEvent.create({ data: { eventId, eventType } });
    return false;
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") return true;
    throw err;
  }
}

async function onPaymentCaptured(p: WebhookPayload) {
  const pay = p.payload.payment?.entity as {
    id: string; order_id?: string; amount?: number; currency?: string; status?: string;
  } | undefined;
  if (!pay?.order_id) return;

  const existing = await prisma.payment.findUnique({ where: { razorpayOrderId: pay.order_id } });
  if (!existing) return;

  if (existing.status === "CAPTURED" && existing.razorpayPaymentId === pay.id) return;

  try {
    await fetchAndValidatePayment(pay.id, {
      amountPaise: existing.amount,
      currency:    existing.currency,
      orderId:     pay.order_id,
    });
  } catch (err) {
    logger.warn(`webhook payment.captured validation failed: ${(err as Error).message}`);
    return;
  }

  const plan = existing.plan as PlanKey;
  await grantPremiumTransactional(existing.userId, plan, {
    razorpayPaymentId: pay.id,
    razorpayOrderId:   pay.order_id,
    razorpaySignature: "webhook",
  });

  logger.info(`webhook payment.captured granted premium: user=${existing.userId} order=${pay.order_id}`);
}

async function onPaymentFailed(p: WebhookPayload) {
  const pay = p.payload.payment?.entity as { id: string; order_id?: string } | undefined;
  if (!pay?.order_id) return;

  await prisma.$transaction(async (tx) => {
    const existing = await tx.payment.findUnique({ where: { razorpayOrderId: pay.order_id! } });
    if (!existing) return;
    await tx.payment.update({
      where: { id: existing.id },
      data:  { status: "FAILED", razorpayPaymentId: pay.id },
    });
    if (existing.subscriptionId) {
      await tx.subscription.update({
        where: { id: existing.subscriptionId },
        data:  { status: "PAST_DUE" },
      });
    }
  });
}

async function onSubscriptionCharged(p: WebhookPayload) {
  const subEntity = p.payload.subscription?.entity as
    | { id: string; current_start?: number; current_end?: number }
    | undefined;
  const payEntity = p.payload.payment?.entity as
    | { id: string; amount?: number; currency?: string; status?: string }
    | undefined;

  if (!subEntity) return;

  const sub = await prisma.subscription.findUnique({
    where: { razorpaySubscriptionId: subEntity.id },
  });
  if (!sub) return;

  const plan = sub.plan as PlanKey;
  const def  = PLAN_CATALOG[plan];

  if (payEntity?.id) {
    try {
      await fetchAndValidatePayment(payEntity.id, {
        amountPaise: def.amountPaise,
        currency:    "INR",
      });
    } catch (err) {
      logger.warn(`webhook subscription.charged payment validation failed: ${(err as Error).message}`);
      return;
    }
  }

  await prisma.$transaction(async (tx) => {
    if (payEntity?.id) {
      const syntheticOrderId = `sub_${subEntity.id}_${payEntity.id}`;
      const exists = await tx.payment.findUnique({ where: { razorpayPaymentId: payEntity.id } });
      if (!exists) {
        await tx.payment.create({
          data: {
            userId:            sub.userId,
            subscriptionId:    sub.id,
            razorpayOrderId:   syntheticOrderId,
            razorpayPaymentId: payEntity.id,
            razorpaySignature: "webhook",
            amount:            def.amountPaise,
            currency:          "INR",
            plan,
            status:            "CAPTURED",
          },
        });
      }
    }

    await tx.subscription.update({
      where: { id: sub.id },
      data: {
        status:             "ACTIVE",
        currentPeriodStart: subEntity.current_start
          ? new Date(subEntity.current_start * 1000)
          : sub.currentPeriodStart,
        currentPeriodEnd: subEntity.current_end
          ? new Date(subEntity.current_end * 1000)
          : addMonths(new Date(), def.intervalMonths),
        cancelAtPeriodEnd: false,
      },
    });
    await grantPremiumRole(tx, sub.userId);
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

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { id: sub.id },
      data:  { status: "EXPIRED" },
    });
    await revokePremiumRole(tx, sub.userId);
  });
}

// ── Transactional grant / activate ─────────────────────────────────────────────

interface GrantArgs {
  razorpayPaymentId: string;
  razorpayOrderId:   string;
  razorpaySignature: string;
}

async function grantPremiumTransactional(
  userId: string,
  plan: PlanKey,
  args: GrantArgs,
): Promise<SubscriptionView> {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { razorpayOrderId: args.razorpayOrderId } });
    if (!payment) throw new AppError(404, "Order not found");

    if (payment.status === "CAPTURED" && payment.razorpayPaymentId === args.razorpayPaymentId) {
      return getSubscriptionInTx(tx, userId);
    }
    if (payment.status === "CAPTURED") {
      throw new AppError(409, "Order already paid", "ORDER_ALREADY_PAID");
    }

    const def = PLAN_CATALOG[plan];
    const now = new Date();
    const end = addMonths(now, def.intervalMonths);

    await tx.payment.update({
      where: { razorpayOrderId: args.razorpayOrderId },
      data: {
        razorpayPaymentId: args.razorpayPaymentId,
        razorpaySignature: args.razorpaySignature,
        status:            "CAPTURED",
      },
    });

    await tx.subscription.upsert({
      where:  { userId },
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

    await grantPremiumRole(tx, userId);
    return getSubscriptionInTx(tx, userId);
  });
}

async function activatePeriodInTx(tx: Tx, userId: string, plan: PlanKey): Promise<SubscriptionView> {
  const def = PLAN_CATALOG[plan];
  const now = new Date();
  const end = addMonths(now, def.intervalMonths);

  await tx.subscription.update({
    where: { userId },
    data: {
      status:             "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd:   end,
      cancelAtPeriodEnd:  false,
    },
  });
  await grantPremiumRole(tx, userId);
  return getSubscriptionInTx(tx, userId);
}

async function getSubscriptionInTx(tx: Tx, userId: string): Promise<SubscriptionView> {
  const sub = await tx.subscription.findUnique({ where: { userId } });
  if (!sub) {
    return {
      plan: "FREE", status: "ACTIVE",
      currentPeriodStart: null, currentPeriodEnd: null, cancelAtPeriodEnd: false,
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

// Re-export for cron wiring
export { reconcileExpiredSubscriptions } from "./subscription.service";
