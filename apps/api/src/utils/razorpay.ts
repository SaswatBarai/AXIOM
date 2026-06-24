/**
 * Razorpay client singleton + plan mapping + signature verification.
 *
 * Secrets are read at module load. KEY_SECRET never leaves the server.
 * WEBHOOK_SECRET is required — startup fails if missing (fail-closed).
 */
import crypto from "crypto";
import Razorpay from "razorpay";
import { logger } from "./logger";

function requireEnv(name: string): string {
  const val = process.env[name]?.trim();
  if (!val) {
    throw new Error(`${name} must be set — payment webhooks cannot be secured without it`);
  }
  return val;
}

const KEY_ID         = process.env.RAZORPAY_KEY_ID?.trim() ?? "";
const KEY_SECRET     = process.env.RAZORPAY_KEY_SECRET?.trim() ?? "";
const WEBHOOK_SECRET = process.env.NODE_ENV === "test"
  ? (process.env.RAZORPAY_WEBHOOK_SECRET?.trim() ?? "")
  : requireEnv("RAZORPAY_WEBHOOK_SECRET");

/** True iff real API credentials are configured (not empty / placeholder). */
export const RAZORPAY_IS_CONFIGURED =
  KEY_ID.length > 0 &&
  !KEY_ID.endsWith("placeholder") &&
  KEY_SECRET.length > 0 &&
  KEY_SECRET !== "placeholder_secret";

if (!RAZORPAY_IS_CONFIGURED && process.env.NODE_ENV === "production") {
  throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET must be set in production");
}

if (process.env.NODE_ENV !== "test" && !WEBHOOK_SECRET) {
  throw new Error("RAZORPAY_WEBHOOK_SECRET must be set");
}

if (!RAZORPAY_IS_CONFIGURED) {
  logger.warn(
    "[razorpay] running with placeholder API credentials — set RAZORPAY_KEY_ID, " +
    "RAZORPAY_KEY_SECRET, RAZORPAY_PLAN_* in apps/api/.env to enable checkout.",
  );
}

export const razorpay = new Razorpay({
  key_id:     KEY_ID || "rzp_test_placeholder",
  key_secret: KEY_SECRET || "placeholder_secret",
});

export const RAZORPAY_KEY_ID = KEY_ID || "rzp_test_placeholder";

// ── Plan catalog (single source of truth) ─────────────────────────────────────

export type PlanKey = "MONTHLY" | "QUARTERLY" | "ANNUAL";

export interface PlanDef {
  razorpayPlanId: string;
  label: string;
  amountPaise: number;
  intervalMonths: number;
}

export const PLAN_CATALOG: Record<PlanKey, PlanDef> = {
  MONTHLY: {
    razorpayPlanId: process.env.RAZORPAY_PLAN_MONTHLY   ?? "plan_test_monthly",
    label:          "Monthly",
    amountPaise:    49_900,
    intervalMonths: 1,
  },
  QUARTERLY: {
    razorpayPlanId: process.env.RAZORPAY_PLAN_QUARTERLY ?? "plan_test_quarterly",
    label:          "Quarterly",
    amountPaise:    119_900,
    intervalMonths: 3,
  },
  ANNUAL: {
    razorpayPlanId: process.env.RAZORPAY_PLAN_ANNUAL    ?? "plan_test_annual",
    label:          "Annual",
    amountPaise:    399_900,
    intervalMonths: 12,
  },
};

// ── Signature verification ────────────────────────────────────────────────────

export function verifyOrderSignature(
  orderId: string,
  paymentId: string,
  signatureHex: string,
): boolean {
  const payload = `${orderId}|${paymentId}`;
  return safeEqualHex(signatureHex, hmacHex(KEY_SECRET || "placeholder_secret", payload));
}

export function verifySubscriptionSignature(
  subscriptionId: string,
  paymentId: string,
  signatureHex: string,
): boolean {
  const payload = `${paymentId}|${subscriptionId}`;
  return safeEqualHex(signatureHex, hmacHex(KEY_SECRET || "placeholder_secret", payload));
}

export function verifyWebhookSignature(rawBody: Buffer | string, signatureHex: string): boolean {
  if (!WEBHOOK_SECRET) return false;
  const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, "utf8");
  return safeEqualHex(signatureHex, hmacHex(WEBHOOK_SECRET, body));
}

// ── Razorpay API payment validation ───────────────────────────────────────────

export interface PaymentExpectation {
  amountPaise: number;
  currency:    string;
  orderId?:    string;
}

export interface RazorpayPaymentEntity {
  id:              string;
  status:          string;
  amount:          number;
  currency:        string;
  order_id?:       string | null;
  invoice_id?:     string | null;
  error_code?:     string | null;
  error_description?: string | null;
}

/** Fetch payment from Razorpay and validate amount/currency/order linkage. */
export async function fetchAndValidatePayment(
  paymentId: string,
  expected: PaymentExpectation,
): Promise<RazorpayPaymentEntity> {
  const pay = (await razorpay.payments.fetch(paymentId)) as RazorpayPaymentEntity;

  if (pay.status !== "captured") {
    throw new PaymentValidationError(`Payment status is ${pay.status}, expected captured`);
  }
  if (pay.amount !== expected.amountPaise) {
    throw new PaymentValidationError("Payment amount does not match plan price");
  }
  if (pay.currency !== expected.currency) {
    throw new PaymentValidationError("Payment currency mismatch");
  }
  if (expected.orderId && pay.order_id !== expected.orderId) {
    throw new PaymentValidationError("Payment is not linked to this order");
  }

  return pay;
}

export class PaymentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentValidationError";
  }
}

// ── Internals ────────────────────────────────────────────────────────────────

function hmacHex(secret: string, payload: string | Buffer): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch (err) {
    logger.warn(`signature compare failed: ${(err as Error).message}`);
    return false;
  }
}
