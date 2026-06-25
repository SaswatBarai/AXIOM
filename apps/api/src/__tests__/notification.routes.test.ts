import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { type Application } from "express";
import { notificationRoutes } from "../routes/notification.routes";
import { errorHandler, AppError } from "../middleware/errorHandler.middleware";
import { renderTemplate } from "../services/email.service";

vi.mock("../services/notification.service", () => ({
  listNotifications: vi.fn(),
  unreadCount:       vi.fn(),
  markRead:          vi.fn(),
  markAllRead:       vi.fn(),
  createAlert:       vi.fn(),
  listAlerts:        vi.fn(),
  updateAlert:       vi.fn(),
  deleteAlert:       vi.fn(),
}));

vi.mock("../middleware/auth.middleware", () => ({
  requireAuth: (req: express.Request & { userId?: string }, _res: express.Response, next: express.NextFunction) => {
    req.userId = "user-1";
    next();
  },
  requireActiveSubscription: (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
  assertUserId: (req: any) => req.userId,
}));

import * as notifService from "../services/notification.service";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;

let app: Application;

beforeEach(() => {
  app = express();
  app.use(express.json());
  app.use("/api/notifications", notificationRoutes);
  app.use(errorHandler);
  vi.clearAllMocks();
});

// ── GET / ──────────────────────────────────────────────────────────────────────

describe("GET /api/notifications", () => {
  it("200 — returns notifications + unread count", async () => {
    vi.mocked(notifService.listNotifications as AnyFn).mockResolvedValue([
      { id: "n-1", type: "JOB_ALERT", payload: {}, readAt: null },
    ]);
    vi.mocked(notifService.unreadCount as AnyFn).mockResolvedValue(1);
    const res = await request(app).get("/api/notifications");
    expect(res.status).toBe(200);
    expect(res.body.notifications).toHaveLength(1);
    expect(res.body.unreadCount).toBe(1);
  });

  it("200 — empty list for new user", async () => {
    vi.mocked(notifService.listNotifications as AnyFn).mockResolvedValue([]);
    vi.mocked(notifService.unreadCount as AnyFn).mockResolvedValue(0);
    const res = await request(app).get("/api/notifications");
    expect(res.body.unreadCount).toBe(0);
  });
});

// ── POST /:id/read ─────────────────────────────────────────────────────────────

describe("POST /api/notifications/:id/read", () => {
  it("200 — marks notification as read", async () => {
    vi.mocked(notifService.markRead as AnyFn).mockResolvedValue({
      id: "n-1", readAt: new Date().toISOString(),
    });
    const res = await request(app).post("/api/notifications/n-1/read");
    expect(res.status).toBe(200);
    expect(res.body.notification.readAt).toBeTruthy();
  });

  it("404 — notification not found", async () => {
    vi.mocked(notifService.markRead as AnyFn).mockRejectedValue(new AppError(404, "Notification not found"));
    const res = await request(app).post("/api/notifications/bad-id/read");
    expect(res.status).toBe(404);
  });
});

// ── POST /read-all ─────────────────────────────────────────────────────────────

describe("POST /api/notifications/read-all", () => {
  it("200 — marks all as read", async () => {
    vi.mocked(notifService.markAllRead as AnyFn).mockResolvedValue(undefined);
    const res = await request(app).post("/api/notifications/read-all");
    expect(res.status).toBe(200);
  });
});

// ── POST /alerts ───────────────────────────────────────────────────────────────

describe("POST /api/notifications/alerts", () => {
  const VALID = { name: "Remote React jobs", filters: { keywords: "React" }, frequency: "daily" };

  it("201 — creates alert", async () => {
    vi.mocked(notifService.createAlert as AnyFn).mockResolvedValue({ id: "a-1", ...VALID });
    const res = await request(app).post("/api/notifications/alerts").send(VALID);
    expect(res.status).toBe(201);
    expect(res.body.alert.id).toBe("a-1");
  });

  it("422 — missing name", async () => {
    const res = await request(app).post("/api/notifications/alerts").send({ frequency: "daily" });
    expect(res.status).toBe(422);
  });

  it("422 — invalid frequency", async () => {
    const res = await request(app).post("/api/notifications/alerts").send({ name: "Test", frequency: "hourly" });
    expect(res.status).toBe(422);
  });
});

// ── GET /alerts ────────────────────────────────────────────────────────────────

describe("GET /api/notifications/alerts", () => {
  it("200 — returns alert list", async () => {
    vi.mocked(notifService.listAlerts as AnyFn).mockResolvedValue([
      { id: "a-1", name: "React jobs", frequency: "daily", active: true },
    ]);
    const res = await request(app).get("/api/notifications/alerts");
    expect(res.status).toBe(200);
    expect(res.body.alerts).toHaveLength(1);
  });
});

// ── PATCH /alerts/:alertId ─────────────────────────────────────────────────────

describe("PATCH /api/notifications/alerts/:alertId", () => {
  it("200 — updates alert active state", async () => {
    vi.mocked(notifService.updateAlert as AnyFn).mockResolvedValue({ id: "a-1", active: false });
    const res = await request(app).patch("/api/notifications/alerts/a-1").send({ active: false });
    expect(res.status).toBe(200);
    expect(res.body.alert.active).toBe(false);
  });

  it("404 — alert not found", async () => {
    vi.mocked(notifService.updateAlert as AnyFn).mockRejectedValue(new AppError(404, "Alert not found"));
    const res = await request(app).patch("/api/notifications/alerts/bad").send({ active: false });
    expect(res.status).toBe(404);
  });
});

// ── DELETE /alerts/:alertId ────────────────────────────────────────────────────

describe("DELETE /api/notifications/alerts/:alertId", () => {
  it("200 — deletes alert", async () => {
    vi.mocked(notifService.deleteAlert as AnyFn).mockResolvedValue(undefined);
    const res = await request(app).delete("/api/notifications/alerts/a-1");
    expect(res.status).toBe(200);
  });

  it("404 — alert not found", async () => {
    vi.mocked(notifService.deleteAlert as AnyFn).mockRejectedValue(new AppError(404, "Alert not found"));
    const res = await request(app).delete("/api/notifications/alerts/bad");
    expect(res.status).toBe(404);
  });
});

// ── Email queue / retry (unit-level) ──────────────────────────────────────────

describe("Email service — renderTemplate", () => {
  it("renders welcome template", () => {
    const { subject, html } = renderTemplate("welcome", { name: "Ada", url: "https://axiom.dev" });
    expect(subject).toContain("Ada");
    expect(html).toContain("Dashboard");
  });

  it("renders job-alert template with count", () => {
    const { subject } = renderTemplate("job-alert", {
      name: "Bob", alertName: "React jobs", count: 5,
      url: "https://axiom.dev", unsubscribeUrl: "https://axiom.dev/unsub",
    });
    expect(subject).toContain("5");
    expect(subject).toContain("React jobs");
  });

  it("renders weekly-digest template", () => {
    const { html } = renderTemplate("weekly-digest", {
      name: "Ada", week: "Jun 21", applications: 3, interviews: 1, newJobs: 8,
      url: "https://axiom.dev", unsubscribeUrl: "https://axiom.dev/unsub",
    });
    expect(html).toContain("3");
    expect(html).toContain("8");
  });

  it("throws on unknown template", () => {
    expect(() => renderTemplate("nonexistent", {})).toThrow("Unknown email template");
  });
});
