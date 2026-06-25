import { Router, type IRouter } from "express";
import { rateLimit } from "express-rate-limit";
import type { AuthRequest } from "../middleware/auth.middleware";
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

const verifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      process.env.NODE_ENV === "development" ? 60 : 10,
  message:  { error: "Too many payment verification attempts. Try again shortly." },
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator: (req) => (req as AuthRequest).userId ?? req.ip ?? "unknown",
});

const router: IRouter = Router();

// ── Public ───────────────────────────────────────────────────────────────────
router.get("/pricing",         pricingHandler);
router.get("/checkout-config", requireAuth, checkoutConfigHandler);

// ── One-time order flow ──────────────────────────────────────────────────────
router.post("/create-order", requireAuth, validate(createOrderSchema), createOrderHandler);
router.post("/verify",       requireAuth, verifyLimiter, validate(verifyOrderSchema), verifyOrderHandler);

// ── Recurring subscription flow ──────────────────────────────────────────────
router.post("/create-subscription", requireAuth, validate(createSubscriptionSchema), createSubscriptionHandler);
router.post("/verify-subscription", requireAuth, verifyLimiter, validate(verifySubscriptionSchema), verifySubscriptionHandler);

// ── Subscription management ──────────────────────────────────────────────────
router.get("/subscription", requireAuth, getSubscriptionHandler);
router.post("/cancel",      requireAuth, cancelSubscriptionHandler);
router.get("/history",      requireAuth, paymentHistoryHandler);

export default router;
