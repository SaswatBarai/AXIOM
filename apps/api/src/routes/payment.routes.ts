import { Router, type IRouter } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createOrderSchema,
  verifyOrderSchema,
  createSubscriptionSchema,
  verifySubscriptionSchema,
} from "../utils/schemas";
import {
  checkoutConfigHandler,
  pricingHandler,
  createOrderHandler,
  verifyOrderHandler,
  createSubscriptionHandler,
  verifySubscriptionHandler,
  getSubscriptionHandler,
  cancelSubscriptionHandler,
  paymentHistoryHandler,
} from "../controllers/payment.controller";

/**
 * The webhook route is **not** in this router — it must be mounted in
 * `index.ts` before the global `express.json()` middleware so the raw body
 * is preserved for HMAC verification. See `index.ts` for the wiring.
 */
const router: IRouter = Router();

// ── Public (no body or trivial) ──────────────────────────────────────────────
router.get(  "/pricing",         pricingHandler);
router.get(  "/checkout-config", requireAuth, checkoutConfigHandler);

// ── One-time order flow ──────────────────────────────────────────────────────
router.post( "/create-order",  requireAuth, validate(createOrderSchema),  createOrderHandler);
router.post( "/verify",        requireAuth, validate(verifyOrderSchema),  verifyOrderHandler);

// ── Recurring subscription flow ──────────────────────────────────────────────
router.post( "/create-subscription", requireAuth, validate(createSubscriptionSchema), createSubscriptionHandler);
router.post( "/verify-subscription", requireAuth, validate(verifySubscriptionSchema), verifySubscriptionHandler);

// ── Subscription management ──────────────────────────────────────────────────
router.get(  "/subscription", requireAuth, getSubscriptionHandler);
router.post( "/cancel",       requireAuth, cancelSubscriptionHandler);
router.get(  "/history",      requireAuth, paymentHistoryHandler);

export default router;
