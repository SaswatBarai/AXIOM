/**
 * Razorpay client singleton + plan mapping.
 *
 * Reads RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET at module load. In dev these
 * are test-mode keys (rzp_test_*); in prod they come from AWS Secrets
 * Manager via the env. The secret is **never** sent to the frontend — only
 * `RAZORPAY_KEY_ID` is exposed via `/api/payments/checkout-config`.
 */
import crypto from "crypto";
import Razorpay from "razorpay";
import { logger } from "./logger";

const KEY_ID         = process.env.RAZORPAY_KEY_ID         ?? "rzp_test_placeholder";
const KEY_SECRET     = process.env.RAZORPAY_KEY_SECRET     ?? "placeholder_secret";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? "placeholder_webhook_secret";

if (KEY_ID.endsWith("placeholder") && process.env.NODE_ENV === "production") {
  // Loud fail in prod — silent fall-through in dev/test
  throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET must be set in production");
}

export const razorpay = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });

export const RAZORPAY_KEY_ID = KEY_ID;

// ── Plan catalog (single source of truth) ─────────────────────────────────────

export type PlanKey = "MONTHLY" | "QUARTERLY" | "ANNUAL";

export interface PlanDef {
  /** Razorpay plan id (`plan_xxx`) — created once via dashboard / one-off script. */
  razorpayPlanId: string;
  /** Display label */
  label: string;
  /** Amount in paise (49900 = ₹499.00) */
  amountPaise: number;
  /** Number of months covered per billing cycle. */
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

/**
 * Verify a checkout-flow signature:
 *   HMAC-SHA256(`${orderId}|${paymentId}`, KEY_SECRET)
 *
 * Used after the user completes the Razorpay modal — the frontend posts back
 * the three fields and we re-derive the expected signature.
 */
export function verifyOrderSignature(
  orderId: string,
  paymentId: string,
  signatureHex: string,
): boolean {
  const payload = `${orderId}|${paymentId}`;
  return safeEqualHex(signatureHex, hmacHex(KEY_SECRET, payload));
}

/**
 * Verify a subscription-flow signature:
 *   HMAC-SHA256(`${paymentId}|${subscriptionId}`, KEY_SECRET)
 *
 * Razorpay sends `razorpay_subscription_id` instead of `razorpay_order_id`
 * when the modal was opened with `subscription_id`.
 */
export function verifySubscriptionSignature(
  subscriptionId: string,
  paymentId: string,
  signatureHex: string,
): boolean {
  const payload = `${paymentId}|${subscriptionId}`;
  return safeEqualHex(signatureHex, hmacHex(KEY_SECRET, payload));
}

/**
 * Verify the X-Razorpay-Signature header on a webhook delivery:
 *   HMAC-SHA256(raw_body, WEBHOOK_SECRET)
 *
 * `rawBody` MUST be the raw bytes received over the wire — do not JSON.stringify
 * a parsed body, that would re-order keys and break the signature.
 */
export function verifyWebhookSignature(rawBody: Buffer | string, signatureHex: string): boolean {
  const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody, "utf8");
  return safeEqualHex(signatureHex, hmacHex(WEBHOOK_SECRET, body));
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
