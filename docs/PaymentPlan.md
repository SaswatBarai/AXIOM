# AXIOM — Payment Gateway Implementation Plan (Razorpay)

## What We're Building

A full-stack subscription system using Razorpay that:
1. Gates premium features behind a paywall
2. Handles recurring subscriptions (monthly / annual)
3. Verifies payments server-side using HMAC signature
4. Automatically upgrades/downgrades user role in real time
5. Handles webhook events (payment captured, subscription cancelled, etc.)

---

## Pricing Tiers

| Plan | Price | Billing | Savings | Razorpay Plan ID |
|---|---|---|---|---|
| **Free** | ₹0 | — | — | — |
| **Monthly** | ₹499/month | Monthly | — | `plan_monthly` |
| **Quarterly** | ₹1,199/quarter | Every 3 months | 20% | `plan_quarterly` |
| **Annual** | ₹3,999/year | Yearly | 33% | `plan_annual` |

---

## Who Can Access What

### Free (USER role — default)

| Feature | Limit |
|---|---|
| Job search + filtering | ✅ 20 results/day |
| Application tracking | ✅ Up to 10 active applications |
| Resume upload | ✅ 1 resume |
| ATS score | ✅ 1 analysis/month |
| Profile + preferences | ✅ Unlimited |
| Email notifications | ✅ Basic |
| AI Cover Letter | ❌ Locked |
| AI Career Roadmap | ❌ Locked |
| AI Interview Prep | ❌ Locked |
| AI Career Chat | ❌ Locked |
| Skill Gap Analysis | ❌ Locked |
| Analytics Dashboard | ❌ Locked |
| Job Alerts | ❌ Locked |
| Multiple resumes (up to 5) | ❌ Locked |
| Unlimited job results | ❌ Locked |
| Unlimited applications | ❌ Locked |

### Premium (PREMIUM role — after payment)

Everything in Free, plus:

| Feature | Access |
|---|---|
| Unlimited job search results | ✅ |
| Unlimited application tracking | ✅ |
| 5 resume slots + unlimited ATS scoring | ✅ |
| AI Cover Letter generation (unlimited) | ✅ |
| AI Career Roadmap (up to 3 active) | ✅ |
| AI Interview Prep (unlimited sessions) | ✅ |
| AI Career Chat (GPT-powered coach) | ✅ |
| Skill Gap Analysis | ✅ |
| Analytics Dashboard | ✅ |
| Job Alerts (up to 10 alerts) | ✅ |
| Priority email support | ✅ |

### Admin (ADMIN role — internal)

Full access to everything + user management dashboard.

---

## Database Changes

### New Prisma models to add

```prisma
enum PlanType {
  FREE
  MONTHLY    // ₹499/month
  QUARTERLY  // ₹1,199/quarter  
  ANNUAL     // ₹3,999/year
}

enum SubscriptionStatus {
  ACTIVE       // payment current, user has PREMIUM role
  PAST_DUE     // payment failed, grace period (3 days)
  CANCELLED    // cancelled by user, access until period end
  EXPIRED      // period ended, user downgraded to USER
}

enum PaymentStatus {
  PENDING    // order created, awaiting payment
  CAPTURED   // payment successful
  FAILED     // payment failed
  REFUNDED   // payment refunded
}

model Subscription {
  id     String @id @default(cuid())
  userId String @unique

  // Razorpay identifiers
  razorpaySubscriptionId String? @unique  // sub_xxx
  razorpayCustomerId     String?           // cust_xxx (for future use)

  plan               PlanType           @default(FREE)
  status             SubscriptionStatus @default(ACTIVE)
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelAtPeriodEnd  Boolean            @default(false)

  payments Payment[]
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([razorpaySubscriptionId])
  @@map("subscriptions")
}

model Payment {
  id             String @id @default(cuid())
  userId         String
  subscriptionId String?

  // Razorpay identifiers
  razorpayOrderId    String  @unique  // order_xxx
  razorpayPaymentId  String? @unique  // pay_xxx
  razorpaySignature  String?           // HMAC-SHA256 signature

  amount   Int    // in paise (e.g. 49900 = ₹499)
  currency String @default("INR")
  plan     PlanType
  status   PaymentStatus @default(PENDING)

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscription Subscription? @relation(fields: [subscriptionId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([razorpayOrderId])
  @@map("payments")
}
```

### User model addition
```prisma
// Add to User model:
subscription  Subscription?
payments      Payment[]
```

---

## API Endpoints

### Payment routes (`/api/payments`)

```
POST   /api/payments/create-order      → create Razorpay order, return order_id
POST   /api/payments/verify            → verify HMAC signature, capture payment, upgrade role
POST   /api/payments/create-subscription → create Razorpay subscription (recurring)
GET    /api/payments/subscription      → get current subscription status
POST   /api/payments/cancel            → cancel subscription (at period end)
POST   /api/payments/webhook           → Razorpay webhook handler (no auth, HMAC verified)
GET    /api/payments/history           → list all payments for current user
```

---

## Payment Flows

### Flow 1: One-time / Recurring Subscription

```
User clicks "Upgrade"
  ↓
Frontend: POST /api/payments/create-subscription
  → backend creates Razorpay Subscription (sub_xxx)
  → returns: { subscriptionId, key }
  ↓
Frontend: opens Razorpay Checkout modal
  razorpay.open({
    key: RAZORPAY_KEY_ID,
    subscription_id: sub_xxx,
    name: "AXIOM Premium",
    ...
  })
  ↓
User completes payment in modal
  ↓
Razorpay calls success callback with:
  { razorpay_payment_id, razorpay_subscription_id, razorpay_signature }
  ↓
Frontend: POST /api/payments/verify
  → backend verifies signature: HMAC-SHA256(subscription_id + "|" + payment_id, secret)
  → if valid:
      - save Payment record (status: CAPTURED)
      - upsert Subscription record
      - update User.role → PREMIUM
      - send welcome email via SES
  → return: { success: true, plan, expiresAt }
  ↓
Frontend: redirect to /dashboard with success toast
```

### Flow 2: Webhook (for renewals, failures, cancellations)

```
Razorpay → POST /api/payments/webhook
  ↓
Verify X-Razorpay-Signature header
  ↓
Handle event:
  payment.captured   → update Payment status, extend subscription period
  payment.failed     → set status PAST_DUE, send failure email, 3-day grace period
  subscription.cancelled → set cancelAtPeriodEnd=true
  subscription.completed → set status EXPIRED, downgrade role to USER
  subscription.charged   → create new Payment record for renewal
```

### Flow 3: Cancellation

```
User clicks "Cancel Plan"
  ↓
POST /api/payments/cancel
  → Razorpay: cancel subscription (at period end, not immediate)
  → set Subscription.cancelAtPeriodEnd = true
  → do NOT downgrade role yet (user keeps access until period ends)
  ↓
Cron job (runs daily):
  → find subscriptions where currentPeriodEnd < now AND cancelAtPeriodEnd = true
  → set status = EXPIRED
  → downgrade User.role = USER
  → send "Your premium access has ended" email
```

---

## Middleware: `requirePremium`

```typescript
// New middleware — gates premium features
export function requirePremium(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole === "PREMIUM" || req.userRole === "ADMIN") {
    return next();
  }
  throw new AppError(403, "This feature requires a Premium subscription", "PREMIUM_REQUIRED");
}
```

The `AppError` with code `"PREMIUM_REQUIRED"` lets the frontend distinguish "no permission" from "upgrade required" and show the paywall modal instead of a generic error.

---

## Route-level Access Control

```typescript
// Existing routes — add requirePremium guard:

// chat.routes.ts
router.post("/",          requireAuth, requirePremium, sendMessage);
router.get("/history",    requireAuth, requirePremium, getHistory);

// coverLetter.routes.ts
router.post("/generate",  requireAuth, requirePremium, generateCoverLetter);

// roadmap.routes.ts
router.post("/",          requireAuth, requirePremium, createRoadmap);
router.get("/",           requireAuth, requirePremium, listRoadmaps);

// interview.routes.ts
router.post("/",          requireAuth, requirePremium, createSession);
router.get("/",           requireAuth, requirePremium, listSessions);

// skill.routes.ts
router.post("/gap",       requireAuth, requirePremium, analyzeGap);
router.get("/roles",      requireAuth,                 getTargetRoles);  // free (discovery)

// analytics.routes.ts
router.get("/",           requireAuth, requirePremium, getAnalytics);

// notification.routes.ts (alerts = premium)
router.post("/alerts",    requireAuth, requirePremium, createAlert);
router.get("/alerts",     requireAuth, requirePremium, listAlerts);

// resume.routes.ts — partial gating
router.post("/",          requireAuth, requirePremiumForMultiple, uploadResume); // >1 = premium
router.post("/:id/analyze", requireAuth, requirePremiumAnalysis, analyzeResume); // >1/month = premium

// job.routes.ts — results cap for free users (handled in service, not middleware)
```

### Soft limit middleware (for resume and job caps)

```typescript
// For resume: allow 1 free, block 2nd+ upload for USER role
export async function requirePremiumForMultiple(req, res, next) {
  if (req.userRole === "PREMIUM" || req.userRole === "ADMIN") return next();
  const count = await prisma.resume.count({ where: { userId: req.userId } });
  if (count >= 1) throw new AppError(403, "Free plan allows 1 resume. Upgrade to add more.", "PREMIUM_REQUIRED");
  next();
}

// For jobs: inject a limit into the request based on role
export function injectJobLimit(req, _res, next) {
  req.jobLimit = req.userRole === "PREMIUM" || req.userRole === "ADMIN" ? 100 : 20;
  next();
}
```

---

## File Structure (new files)

```
apps/api/src/
├── routes/
│   └── payment.routes.ts          ← new
├── services/
│   └── payment.service.ts         ← new
├── controllers/
│   └── payment.controller.ts      ← new
├── middleware/
│   ├── auth.middleware.ts          ← add requirePremium, requirePremiumForMultiple
│   └── ...
└── utils/
    └── razorpay.ts                ← new (Razorpay client singleton)

apps/web/src/
├── app/
│   ├── pricing/
│   │   └── page.tsx               ← new (pricing page)
│   └── dashboard/
│       └── billing/
│           └── page.tsx           ← new (subscription management)
├── components/
│   ├── payment/
│   │   ├── PricingCard.tsx        ← new
│   │   ├── CheckoutModal.tsx      ← new (loads Razorpay script + opens modal)
│   │   ├── PaywallGate.tsx        ← new (wraps locked features)
│   │   └── SubscriptionStatus.tsx ← new
│   └── ...

packages/
└── shared-types/
    └── payment.ts                 ← new (shared Plan, SubscriptionStatus types)
```

---

## Environment Variables (new)

```bash
# .env / Secrets Manager
RAZORPAY_KEY_ID=rzp_live_xxxx          # from Razorpay dashboard
RAZORPAY_KEY_SECRET=xxxx               # never exposed to frontend
RAZORPAY_WEBHOOK_SECRET=xxxx           # set in Razorpay dashboard → webhooks

# Plan IDs (created once in Razorpay dashboard)
RAZORPAY_PLAN_MONTHLY=plan_xxxx
RAZORPAY_PLAN_QUARTERLY=plan_xxxx
RAZORPAY_PLAN_ANNUAL=plan_xxxx
```

---

## Frontend: PaywallGate Component

```tsx
// Wraps any premium feature — shows the feature blurred with an upgrade CTA
// Usage: <PaywallGate feature="AI Cover Letter"><CoverLetterForm /></PaywallGate>

export function PaywallGate({ feature, children }) {
  const { user } = useAuth();
  if (user?.role === "PREMIUM" || user?.role === "ADMIN") return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-30 blur-sm select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <LockIcon />
        <p>{feature} is a Premium feature</p>
        <Button onClick={() => openPricingModal()}>Upgrade to Premium</Button>
      </div>
    </div>
  );
}
```

---

## Security Considerations

| Risk | Mitigation |
|---|---|
| Forged payment success | Always verify Razorpay HMAC signature server-side before upgrading role |
| Webhook replay attacks | Idempotency: check `razorpayPaymentId` already exists before processing |
| Webhook source forgery | Verify `X-Razorpay-Signature` header on every webhook request |
| Key exposed to client | `RAZORPAY_KEY_SECRET` never sent to frontend — only `KEY_ID` |
| Role tampering via JWT | Role is re-read from DB on sensitive operations, not just trusted from JWT |
| Free tier abuse | Server-side enforcement (DB count checks), not just frontend hiding |

---

## Cron Jobs (for subscription lifecycle)

```typescript
// Runs daily at 2 AM IST — expires cancelled subscriptions
async function expireSubscriptions() {
  const expired = await prisma.subscription.findMany({
    where: {
      status: { in: ["ACTIVE", "CANCELLED"] },
      currentPeriodEnd: { lt: new Date() },
    },
    include: { user: true },
  });
  for (const sub of expired) {
    await prisma.subscription.update({ where: { id: sub.id }, data: { status: "EXPIRED" } });
    await prisma.user.update({ where: { id: sub.userId }, data: { role: "USER" } });
    await sendSubscriptionExpiredEmail(sub.user.email);
  }
}

// Runs daily — send renewal reminder 3 days before expiry
async function sendRenewalReminders() { ... }
```

---

## Implementation Order

```
1. Database
   ├─ Add Subscription + Payment models to schema.prisma
   ├─ Add relations to User model
   └─ pnpm db:migrate

2. Backend
   ├─ utils/razorpay.ts              (Razorpay client)
   ├─ services/payment.service.ts    (create order, verify, subscribe, cancel)
   ├─ controllers/payment.controller.ts
   ├─ routes/payment.routes.ts       (register all endpoints)
   ├─ middleware/auth.middleware.ts   (add requirePremium + soft limit guards)
   └─ Apply requirePremium to: chat, coverLetter, roadmap, interview, skill/gap, analytics, alerts

3. Frontend
   ├─ /pricing page                  (plan cards with Razorpay checkout)
   ├─ CheckoutModal component        (loads Razorpay JS, opens modal)
   ├─ PaywallGate component          (blur + upgrade CTA wrapper)
   ├─ /dashboard/billing page        (subscription status, cancel, invoice history)
   └─ Wire PaywallGate around: ChatPage, CoverLetterPage, RoadmapPage, InterviewPage

4. Webhooks
   ├─ Register webhook URL in Razorpay dashboard
   └─ Implement /api/payments/webhook handler

5. Cron jobs
   └─ expireSubscriptions() + sendRenewalReminders()

6. Testing
   ├─ Use Razorpay test mode (rzp_test_ keys)
   ├─ Test card: 4111 1111 1111 1111, CVV: any, expiry: any future date
   └─ Write payment.service.test.ts
```

---

## Razorpay Test Credentials

```
Test Key ID:     rzp_test_xxxx    (from Razorpay dashboard → Test Mode)
Test Key Secret: xxxx

Test cards:
  Success:  4111 1111 1111 1111
  Failure:  4000 0000 0000 0002
  3D Secure: 5267 3181 8797 5449

UPI (test): success@razorpay
Net banking (test): any bank → success
```

---

## Ready to Implement

Tell me which phase to start:
- **"implement backend"** → schema migration + payment.service + routes + middleware guards
- **"implement frontend"** → pricing page + checkout modal + PaywallGate component
- **"implement webhooks"** → webhook handler + cron jobs
- **"implement all"** → full end-to-end in sequence
