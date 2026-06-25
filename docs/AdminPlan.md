# AXIOM — Admin System Plan

## Current State

| Already exists | Missing |
|---|---|
| `UserRole.ADMIN` enum in schema | Admin dashboard UI (`/admin/*`) |
| `requireRole("ADMIN")` middleware | Seed script to create first admin |
| `GET /api/users` — list users | Platform-wide analytics API |
| `PATCH /api/users/:id/role` — change role | Admin-specific routes (suspend, delete, impersonate) |
| `POST /api/jobs/scrape` — admin only | Job moderation (approve / reject scraped jobs) |
| | System health endpoint |
| | Admin audit log |

---

## What Admin Can Do

### 1. User Management
- View all users (paginated, searchable, filterable by role/status)
- View any user's full profile + subscription status
- Change user role: USER → PREMIUM → ADMIN (promote / demote)
- Suspend / unsuspend a user (block login without deleting)
- Delete a user account (with cascade)
- Impersonate a user (read-only view of their dashboard)
- Export user data as CSV

### 2. Platform Analytics
- Total users (today, this week, this month, all-time)
- Active users (DAU, WAU, MAU)
- New signups per day/week (chart)
- Role distribution: USER vs PREMIUM vs ADMIN
- Feature usage: which features are most used (chat, roadmap, interview, etc.)
- Top resume ATS scores
- Application funnel across all users (aggregate)
- Job alert trigger counts

### 3. Job Management
- View all scraped jobs (paginated)
- Approve / reject individual jobs (moderation queue)
- Mark job as expired manually
- Trigger scrape job manually
- Bulk delete old jobs (> 30 days, no applications)
- View job application counts per posting

### 4. Content & AI Oversight
- View all AI roadmaps (any user)
- View chat message logs (privacy-respecting — aggregate only, not message content)
- See AI error rates (timeouts, failures from AI service)

### 5. System Health
- API uptime + response times (last 24h)
- Database connection status
- Redis ping status
- S3 bucket stats (object count, total size)
- Queue depth (Bull queue job counts: waiting, active, completed, failed)
- Recent error log (last 50 AppErrors with counts)

### 6. Audit Log
- Every admin action is recorded: who did what to whom and when
- Immutable append-only log (no delete endpoint)
- Filterable by admin, action type, target, date range

---

## Bootstrap: Creating the First Admin User

### Seed script (one-time, run on server)

```typescript
// packages/database/prisma/seed-admin.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email    = process.env.ADMIN_EMAIL    ?? "admin@axiom.careers";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const name     = process.env.ADMIN_NAME     ?? "AXIOM Admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Promote to ADMIN if already exists
    await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
    console.log(`Promoted ${email} to ADMIN`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      name,
      password: await bcrypt.hash(password, 12),
      role: "ADMIN",
      emailVerified: true,   // skip email verification for admin
    },
  });
  console.log(`Admin user created: ${email}`);
}

main().finally(() => prisma.$disconnect());
```

**Run:**
```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=SecurePass123! \
  pnpm --filter @axiom/database tsx prisma/seed-admin.ts
```

After first run: change password immediately via the settings page.

---

## New Database Model: AuditLog

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  adminId    String                       // who performed the action
  action     String                       // e.g. "CHANGE_ROLE", "SUSPEND_USER", "DELETE_JOB"
  targetType String                       // "USER", "JOB", "SYSTEM"
  targetId   String?                      // ID of the affected resource
  before     Json?                        // state before change (for rollback visibility)
  after      Json?                        // state after change
  ipAddress  String?
  userAgent  String?

  admin      User     @relation("AdminAuditLogs", fields: [adminId], references: [id])

  createdAt  DateTime @default(now())

  @@index([adminId])
  @@index([action])
  @@index([targetType, targetId])
  @@map("audit_logs")
}
```

Add to `User` model:
```prisma
auditLogs     AuditLog[] @relation("AdminAuditLogs")
```

### New field on User: `suspendedAt`
```prisma
// Add to User model:
suspendedAt   DateTime?    // null = active, non-null = suspended
```

---

## New API Routes

### Admin router — `/api/admin`

All routes: `requireAuth + requireRole("ADMIN")`

```
── User Management ──────────────────────────────────────────────────────
GET    /api/admin/users                    list all users (paginated, filterable)
GET    /api/admin/users/:id                get full user profile + subscription
PATCH  /api/admin/users/:id/role           promote / demote role
PATCH  /api/admin/users/:id/suspend        suspend user (sets suspendedAt)
PATCH  /api/admin/users/:id/unsuspend      clear suspendedAt
DELETE /api/admin/users/:id               hard delete user + cascade
GET    /api/admin/users/:id/impersonate    generate short-lived read-only token
GET    /api/admin/users/export             CSV export of all users

── Platform Analytics ───────────────────────────────────────────────────
GET    /api/admin/analytics/overview       total users, DAU, signups, role split
GET    /api/admin/analytics/signups        daily signup chart (last 30d)
GET    /api/admin/analytics/feature-usage  which features are used most
GET    /api/admin/analytics/retention      D1/D7/D30 retention cohorts

── Job Management ───────────────────────────────────────────────────────
GET    /api/admin/jobs                     all jobs (status, source, app count)
PATCH  /api/admin/jobs/:id/approve         mark job as approved/visible
PATCH  /api/admin/jobs/:id/reject          hide job from search results
DELETE /api/admin/jobs/:id                delete single job
DELETE /api/admin/jobs/bulk-expired        bulk delete jobs older than N days
POST   /api/admin/jobs/scrape              trigger scrape (already exists)

── System Health ─────────────────────────────────────────────────────────
GET    /api/admin/system/health            DB, Redis, S3, queue status
GET    /api/admin/system/errors            recent AppError log (last 50)
GET    /api/admin/system/queues            Bull queue stats

── Audit Log ────────────────────────────────────────────────────────────
GET    /api/admin/audit                    list audit log (paginated, filterable)
```

---

## Suspend Check Middleware

```typescript
// Add to requireAuth — after JWT verification:
if (payload.role !== "ADMIN") {
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { suspendedAt: true },
  });
  if (user?.suspendedAt) {
    throw new AppError(403, "Your account has been suspended. Contact support.", "ACCOUNT_SUSPENDED");
  }
}
```

> Cache this in Redis (key: `user:suspended:{userId}`, TTL 5 min) to avoid a DB hit on every request.

---

## Admin Dashboard UI — `/admin`

**Route structure (Next.js App Router):**
```
app/
└── (admin)/
    ├── layout.tsx          ← admin shell (sidebar + top bar, checks role === ADMIN)
    ├── admin/
    │   ├── page.tsx        ← /admin  → redirects to /admin/overview
    │   ├── overview/
    │   │   └── page.tsx    ← platform analytics dashboard
    │   ├── users/
    │   │   ├── page.tsx    ← user table (search, filter, paginate)
    │   │   └── [id]/
    │   │       └── page.tsx ← single user detail + actions
    │   ├── jobs/
    │   │   └── page.tsx    ← job moderation table
    │   ├── system/
    │   │   └── page.tsx    ← health + error log + queue stats
    │   └── audit/
    │       └── page.tsx    ← audit log table
```

### Admin Layout (role guard)
```tsx
// app/(admin)/layout.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth"; // or your auth method

export default async function AdminLayout({ children }) {
  const session = await getServerSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard"); // not a 404 — silently redirect
  }
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
```

### Pages summary

#### `/admin/overview` — Platform Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│  Stats row                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 1,284    │ │ 342      │ │ 89       │ │ 26.1%    │          │
│  │ Total    │ │ Premium  │ │ Today    │ │ Premium  │          │
│  │ Users    │ │ Users    │ │ Signups  │ │ Conv.    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
│  ┌─────────────────────────────┐ ┌──────────────────────────┐  │
│  │ Daily Signups (30d)         │ │ Feature Usage            │  │
│  │ [line chart]                │ │ Chat          ████ 412   │  │
│  │                             │ │ Cover Letter  ███  289   │  │
│  │                             │ │ Roadmap       ██   198   │  │
│  └─────────────────────────────┘ └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

#### `/admin/users` — User Management Table
```
┌─────────────────────────────────────────────────────────────────┐
│  [Search by name/email]  [Role: All ▾]  [Status: All ▾]        │
│                                                                 │
│  Name            Email              Role     Joined    Actions  │
│  Alice Johnson   alice@example.com  USER     2d ago    [⋯]     │
│  Bob Smith       bob@example.com    PREMIUM  5d ago    [⋯]     │
│  Carol White     carol@example.com  ADMIN    30d ago   [⋯]     │
│                                                                 │
│  Actions dropdown per row:                                      │
│    • View Profile                                               │
│    • Change Role (USER / PREMIUM / ADMIN)                       │
│    • Suspend Account                                            │
│    • Delete Account                                             │
│    • View as User (impersonate — read-only)                     │
└─────────────────────────────────────────────────────────────────┘
```

#### `/admin/system` — System Health
```
┌─────────────────────────────────────────────────────────────────┐
│  Services                                                       │
│  ✅ PostgreSQL   connected   ping 2ms                           │
│  ✅ Redis        connected   ping 0ms                           │
│  ✅ S3           reachable   bucket: axiom-resumes (1.2 GB)     │
│  ✅ AI Service   reachable   http://axiom-ai:8000               │
│                                                                 │
│  Queue Stats (Bull)                                             │
│  email-queue    waiting: 0  active: 1  completed: 482  failed: 2│
│  job-scraper    waiting: 1  active: 0  completed: 24   failed: 0│
│                                                                 │
│  Recent Errors (last 24h)                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 422 Resume not parsed yet          ×12  last: 2min ago  │   │
│  │ 503 AI service timeout             ×3   last: 1h ago    │   │
│  │ 404 Job not found                  ×1   last: 6h ago    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Impersonation (Read-Only)

Allows admin to see exactly what a user sees — useful for debugging and support.

```
Admin clicks "View as User" on user row
  ↓
POST /api/admin/users/:id/impersonate
  → generates short-lived JWT (5 min TTL) with:
      { userId: targetId, role: targetRole, impersonatedBy: adminId }
  → returns { impersonateToken }
  ↓
Frontend opens new tab: /dashboard?impersonate=<token>
  ↓
Dashboard reads impersonateToken from URL, uses it as the auth token
  → All API calls use the target user's data
  → Banner at top: "Viewing as Alice Johnson (admin session — read only)"
  → Token expires in 5 minutes, cannot make any write operations
```

Server-side: check `impersonatedBy` claim in token → reject all non-GET requests.

---

## Audit Logging Implementation

Every admin action must be logged. Use a wrapper:

```typescript
// services/admin.service.ts
export async function auditLog(
  adminId:    string,
  action:     string,
  targetType: "USER" | "JOB" | "SYSTEM",
  targetId?:  string,
  before?:    unknown,
  after?:     unknown,
  req?:       Request,
) {
  await prisma.auditLog.create({
    data: {
      adminId,
      action,
      targetType,
      targetId,
      before: before as Prisma.InputJsonValue ?? undefined,
      after:  after  as Prisma.InputJsonValue ?? undefined,
      ipAddress: req?.ip,
      userAgent: req?.headers["user-agent"],
    },
  });
}

// Usage in a controller:
await auditLog(req.userId!, "CHANGE_ROLE", "USER", targetId,
  { role: "USER" }, { role: "PREMIUM" }, req);
```

---

## Security Rules

| Rule | Why |
|---|---|
| Admin routes behind `requireRole("ADMIN")` only | No role escalation via API |
| Suspended users get 403 on every request | Checked after JWT verify |
| Impersonate token is short-lived (5 min), read-only | Can't do damage if leaked |
| Every admin write action writes AuditLog | Accountability, forensics |
| Admin dashboard route guard on frontend too | Belt + suspenders — no flicker |
| Admin cannot delete another ADMIN | Prevent lockout; require DB direct access |
| Failed login attempts for admin email → rate limit 3/15min | Tighter than normal 5/15min |
| Admin email must be `@yourdomain.com` (configurable) | Prevent user self-promotion |

---

## File Structure (new files)

```
apps/api/src/
├── routes/
│   └── admin.routes.ts              ← new (all /api/admin/* routes)
├── services/
│   └── admin.service.ts             ← new (platform analytics, audit log, health check)
├── controllers/
│   └── admin.controller.ts          ← new
└── middleware/
    └── auth.middleware.ts            ← add suspend check to requireAuth

packages/database/prisma/
├── schema.prisma                     ← add AuditLog model, suspendedAt to User
└── seed-admin.ts                     ← new

apps/web/src/app/
└── (admin)/
    ├── layout.tsx                    ← new (role guard, admin shell)
    └── admin/
        ├── page.tsx                  ← redirect to /admin/overview
        ├── overview/page.tsx         ← platform analytics
        ├── users/
        │   ├── page.tsx              ← user table
        │   └── [id]/page.tsx         ← user detail + actions
        ├── jobs/page.tsx             ← job moderation
        ├── system/page.tsx           ← health + queues + errors
        └── audit/page.tsx            ← audit log

apps/web/src/components/
└── admin/
    ├── AdminSidebar.tsx              ← new
    ├── StatCard.tsx                  ← new
    ├── UserTable.tsx                 ← new
    ├── UserActions.tsx               ← new (dropdown: role, suspend, delete, impersonate)
    ├── JobModerationTable.tsx        ← new
    ├── SystemHealthCard.tsx          ← new
    └── AuditLogTable.tsx             ← new
```

---

## Implementation Order

```
Phase 1 — Foundation (no UI yet)
  1. schema.prisma — add AuditLog model + suspendedAt to User
  2. pnpm --filter @axiom/database db:migrate
  3. seed-admin.ts — run once to create admin user
  4. auth.middleware.ts — add suspend check after JWT verify

Phase 2 — Admin API
  5. admin.service.ts — platform analytics, health check, audit log helper
  6. admin.controller.ts — all handler functions
  7. admin.routes.ts — wire up all /api/admin/* endpoints
  8. Register router in index.ts: app.use("/api/admin", adminRoutes)
  9. Apply auditLog() to all write operations in admin controller

Phase 3 — Admin Dashboard UI
  10. (admin)/layout.tsx — role guard + admin shell with sidebar
  11. /admin/overview — platform stats + charts
  12. /admin/users — table with search/filter + UserActions dropdown
  13. /admin/users/[id] — full user profile view
  14. /admin/jobs — moderation queue
  15. /admin/system — health dashboard
  16. /admin/audit — audit log viewer

Phase 4 — Impersonation
  17. POST /api/admin/users/:id/impersonate endpoint
  18. Frontend: impersonate banner + read-only enforcement
```

---

## After Admin: Payment Gateway

Once admin is done, the payment system connects cleanly:
- Admin can see all subscriptions: who is FREE vs PREMIUM
- Admin can manually grant PREMIUM to a user (for comps/support)
- Payment analytics show in `/admin/overview`: MRR, churn rate, upgrades
- Admin audit log records manual role grants (so they're not silent)

Tell me which phase to implement first: **"implement Phase 1"**, **"implement Phase 2"**, etc., or **"implement all admin"** to go end-to-end.
