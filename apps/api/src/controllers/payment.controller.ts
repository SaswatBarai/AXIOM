import type { Response, NextFunction } from "express";
import crypto from "crypto";
import { assertUserId, type AuthRequest } from "../middleware/auth.middleware";
import * as paymentService from "../services/payment.service";
import type {
  CreateOrderInput,
  VerifyOrderInput,
  CreateSubscriptionInput,
  VerifySubscriptionInput,
} from "../utils/schemas";
import { PLAN_CATALOG } from "../utils/razorpay";

export async function checkoutConfigHandler(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json(paymentService.getCheckoutConfig());
  } catch (err) { next(err); }
}

export async function pricingHandler(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json({
      plans: Object.entries(PLAN_CATALOG).map(([key, def]) => ({
        plan:           key,
        label:          def.label,
        amountPaise:    def.amountPaise,
        currency:       "INR",
        intervalMonths: def.intervalMonths,
      })),
    });
  } catch (err) { next(err); }
}

export async function createOrderHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { plan } = req.body as CreateOrderInput;
    const result = await paymentService.createOrder(assertUserId(req), plan);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function verifyOrderHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = req.body as VerifyOrderInput;
    const result = await paymentService.verifyOrderPayment({
      userId:    assertUserId(req),
      orderId:   body.razorpay_order_id,
      paymentId: body.razorpay_payment_id,
      signature: body.razorpay_signature,
    });
    res.json(result);
  } catch (err) { next(err); }
}

export async function createSubscriptionHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { plan } = req.body as CreateSubscriptionInput;
    const result = await paymentService.createSubscription(assertUserId(req), plan);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function verifySubscriptionHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = req.body as VerifySubscriptionInput;
    const result = await paymentService.verifySubscriptionPayment({
      userId:         assertUserId(req),
      subscriptionId: body.razorpay_subscription_id,
      paymentId:      body.razorpay_payment_id,
      signature:      body.razorpay_signature,
    });
    res.json(result);
  } catch (err) { next(err); }
}

export async function getSubscriptionHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const subscription = await paymentService.getSubscription(assertUserId(req));
    res.json({ subscription });
  } catch (err) { next(err); }
}

export async function cancelSubscriptionHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const subscription = await paymentService.cancelSubscription(assertUserId(req));
    res.json({ subscription });
  } catch (err) { next(err); }
}

export async function paymentHistoryHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const payments = await paymentService.listPayments(assertUserId(req));
    res.json({ payments });
  } catch (err) { next(err); }
}

/**
 * Webhook handler. No auth — verified via X-Razorpay-Signature header in the
 * service. Mounted with `express.raw({ type: "application/json" })` so the body
 * is a `Buffer` whose bytes are exactly what Razorpay signed.
 */
export async function webhookHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const signature = (req.headers["x-razorpay-signature"] as string) ?? "";
    const rawBody   = req.body as Buffer;
    const eventId   =
      (req.headers["x-razorpay-event-id"] as string) ??
      crypto.createHash("sha256").update(rawBody).digest("hex");

    const result = await paymentService.handleWebhook(rawBody, { signature, eventId });
    res.json(result);
  } catch (err) { next(err); }
}
