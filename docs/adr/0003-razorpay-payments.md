# ADR 0003 — Razorpay payments + Premium gating

**Status:** Accepted (backend foundation)
**Date:** 2026-06-24
**Phase:** Payments

## Context

AXIOM needs a paid Premium tier to gate the AI features (Cover Letter, Career
Roadmap, Interview Prep, Career Chat, Skill Gap Analysis, Analytics, Job Alerts)
and to lift soft limits on resume slots, job results, and applications. India is
the primary market, the catalog is small (3 plans), and we don't need
multi-currency or tax invoicing yet.

## Decision

Use **Razorpay** as the payment gateway. Two flows are supported:

- **One-time order** — `createOrder` → user pays in modal → `verify` → grant.
- **Recurring subscription** — `createSubscription` → user pays first cycle →
  `verify-subscription` → grant; later cycles arrive as webhook events.

### Plan catalog (single source of truth in `apps/api/src/utils/razorpay.ts`)

| Plan       | Price (₹) | Interval | Razorpay env var       |
|------------|-----------|----------|------------------------|
| MONTHLY    | 499       | 1 month  | `RAZORPAY_PLAN_MONTHLY`  |
| QUARTERLY  | 1,199     | 3 months | `RAZORPAY_PLAN_QUARTERLY`|
| ANNUAL     | 3,999     | 12 months| `RAZORPAY_PLAN_ANNUAL`   |

Amounts live in code as paise (49,900 / 119,900 / 399,900). Razorpay plan ids
are configured per environment so test mode and prod can swap freely.

### Pipeline

```
[Web /pricing]
   │
   │ POST /api/payments/create-order        (auth)
   ▼
[payment.service.createOrder]
   │ razorpay.orders.create + persist Payment(status=PENDING)
   │ → return { orderId, amount, keyId }
   ▼
[Web opens Razorpay modal with key_id + order_id]
   │
   │ user pays
   ▼
[Web: POST /api/payments/verify]
   │ { razorpay_order_id, razorpay_payment_id, razorpay_signature }
   ▼
[payment.service.verifyOrderPayment]
   │ verifyOrderSignature() — HMAC-SHA256(orderId|paymentId, KEY_SECRET)
   │ + ownership check (order.userId === req.userId)
   │ + idempotency (re-verify same paymentId = no-op)
   ▼
[grantPremium]
   │ Payment.status → CAPTURED
   │ Subscription upserted (status=ACTIVE, currentPeriodEnd computed)
   │ User.role → PREMIUM
   ▼
[Web: redirect to /dashboard with success toast]
```

The recurring subscription flow is identical except the signature payload is
`HMAC-SHA256(paymentId|subscriptionId, KEY_SECRET)` and renewals arrive as
webhook events.

### Webhook architecture

The webhook route is mounted **directly in `index.ts` before the global
`express.json()` middleware**, with `express.raw({ type: "application/json" })`,
because:

1. Razorpay signs the **raw bytes** of the request body.
2. If `express.json()` runs first it parses the body and the raw stream is
   gone — re-stringifying a parsed object reorders keys and breaks the HMAC.
3. Trying to apply `raw()` at the router level is too late; global middleware
   has already consumed the body.

This is **not just a test artifact**; the bug exists in production unless the
webhook is mounted before the JSON parser. See `index.ts` for the wiring.

Events handled:

| Event                    | Action                                                 |
|--------------------------|--------------------------------------------------------|
| `payment.captured`       | Update Payment.status → CAPTURED (idempotent)          |
| `payment.failed`         | Update Payment.status → FAILED; subscription → PAST_DUE |
| `subscription.charged`   | Renewal — extend `currentPeriodEnd`; ensure ACTIVE     |
| `subscription.cancelled` | Set `cancelAtPeriodEnd = true`                         |
| `subscription.completed` | Set EXPIRED + downgrade `User.role = USER`             |

### Premium gating

```ts
export function requirePremium(req, res, next) {
  if (req.userRole === "PREMIUM" || req.userRole === "ADMIN") return next();
  next(new AppError(403, "This feature requires a Premium subscription", "PREMIUM_REQUIRED"));
}
```

Note the **third `code` argument** on `AppError` — the frontend distinguishes
`PREMIUM_REQUIRED` from a generic 403 and shows the paywall modal instead of
an error toast. This is the only piece of code outside payments that touches
the error shape, and it's worth it.

Soft caps (e.g. "free plan allows 1 resume") use
`requirePremiumIfResumeCountAtLeast(N)` — same status code, same `code`.

## Consequences

### Positive

- **Server-side enforcement.** All role flips happen via `grantPremium` after
  HMAC verification — frontend can never lie its way to PREMIUM.
- **Idempotent.** Both verify endpoints and every webhook handler are safe to
  re-run with the same payment id. Replay attacks fail closed.
- **Timing-safe signature comparison** via `crypto.timingSafeEqual` over the
  hex bytes — no length-leak.
- **Test-friendly.** All signature math lives in `utils/razorpay.ts` as pure
  functions; the 11-case `razorpay.test.ts` covers happy path, tampered
  payloads, wrong secrets, non-hex garbage, and webhook-vs-order key mixups.
- **Single source of truth** for plan amounts in code — the Razorpay
  dashboard hosts the plan ids; everything else is local.

### Negative / trade-offs

- **Razorpay-only for v1.** No Stripe / PayPal fallback. The plan catalog is
  abstracted but the modal integration is gateway-specific.
- **Webhook routing is fragile.** The webhook must be mounted before global
  JSON parsing. This is documented inline in `index.ts` but is easy to break
  during a refactor — a comment alone isn't enough; we should add a smoke
  test in CI that hits `/api/payments/webhook` with a known signature.
- **No cron yet.** Cancelled subscriptions are not automatically downgraded
  at period end; until the daily expiry cron lands in Phase 17, downgrades
  only happen when Razorpay fires `subscription.completed`.

## Alternatives considered

1. **Stripe.** Better global support but: paying out in India needs RazorpayX
   or a US entity, KYC is heavier, and the test card UPI flow is missing.
   Rejected for v1; revisit when expanding outside India.
2. **PayPal subscriptions.** Reasonable for global subs but the modal flow is
   clunkier and PayPal's webhook signature scheme is less straightforward.
3. **Roll our own.** Hard no — PCI scope alone makes this a six-month
   project, plus we don't store card data, plus we'd reinvent every dispute
   tool Razorpay already provides.

## Follow-ups (out of scope for this commit)

- **Frontend** — pricing page, `CheckoutModal` (loads Razorpay JS), `PaywallGate`
  component, billing page.
- **Cron** — daily job to set `EXPIRED` + downgrade for subscriptions where
  `currentPeriodEnd < now AND cancelAtPeriodEnd = true`.
- **Apply `requirePremium`** to the AI feature routes (Chat, CoverLetter,
  Roadmap, Interview, Skill Gap, Analytics, Alerts). Currently scoped only
  to the middleware existing — apply where needed in a follow-up.
- **CI signature smoke test** — POST a known-signed payload to a staging
  webhook endpoint as part of the deploy gate, so the JSON-parser ordering
  bug can't sneak back in.

## References

- Implementation: [apps/api/src/utils/razorpay.ts](../../apps/api/src/utils/razorpay.ts) · [services/payment.service.ts](../../apps/api/src/services/payment.service.ts)
- Routes: [routes/payment.routes.ts](../../apps/api/src/routes/payment.routes.ts) (+ webhook in [`index.ts`](../../apps/api/src/index.ts))
- Middleware: [middleware/auth.middleware.ts](../../apps/api/src/middleware/auth.middleware.ts)
- Tests: [`__tests__/razorpay.test.ts`](../../apps/api/src/__tests__/razorpay.test.ts) · [`__tests__/payment.routes.test.ts`](../../apps/api/src/__tests__/payment.routes.test.ts)
- Plan doc: [docs/PaymentPlan.md](../PaymentPlan.md)
