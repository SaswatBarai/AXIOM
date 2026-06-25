import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@axiom/database";

vi.mock("@axiom/database", () => ({
  prisma: {
    notification: {
      create:     vi.fn(),
      findMany:   vi.fn(),
      findUnique: vi.fn(),
      update:     vi.fn(),
      updateMany: vi.fn(),
      count:      vi.fn(),
    },
    jobAlert: {
      create:     vi.fn(),
      findMany:   vi.fn(),
      findUnique: vi.fn(),
      update:     vi.fn(),
      delete:     vi.fn(),
      count:      vi.fn(),
    },
    subscription: { findUnique: vi.fn() },
    payment:      { count: vi.fn() },
  },
  Prisma: {},
}));

import {
  createNotification,
  listNotifications,
  markRead,
  markAllRead,
  unreadCount,
  createAlert,
  listAlerts,
  updateAlert,
  deleteAlert,
  setSocketServer,
} from "../services/notification.service";

const MOCK_NOTIF = {
  id: "notif-1",
  userId: "user-1",
  type: "APPLICATION_UPDATE",
  payload: { status: "INTERVIEW" },
  readAt: null,
  createdAt: new Date(),
};

const MOCK_ALERT = {
  id: "alert-1",
  userId: "user-1",
  name: "Remote TypeScript jobs",
  filters: { keywords: "TypeScript", remote: true },
  frequency: "daily",
  active: true,
  createdAt: new Date(),
};

beforeEach(() => vi.clearAllMocks());

// ── createNotification ────────────────────────────────────────────────────────

describe("createNotification", () => {
  it("creates a notification record", async () => {
    vi.mocked(prisma.notification.create).mockResolvedValue(MOCK_NOTIF as never);

    const result = await createNotification("user-1", "APPLICATION_UPDATE", { status: "INTERVIEW" });

    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: { userId: "user-1", type: "APPLICATION_UPDATE", payload: { status: "INTERVIEW" } },
    });
    expect(result).toEqual(MOCK_NOTIF);
  });

  it("creates notification without socket emit when no server is set", async () => {
    vi.mocked(prisma.notification.create).mockResolvedValue(MOCK_NOTIF as never);
    // No setSocketServer called — io is null by default
    const result = await createNotification("user-1", "JOB_MATCH");
    expect(result).toEqual(MOCK_NOTIF);
  });

  it("emits to socket room when socket server is set", async () => {
    const emit = vi.fn();
    const to = vi.fn().mockReturnValue({ emit });
    setSocketServer({ to } as never);
    vi.mocked(prisma.notification.create).mockResolvedValue(MOCK_NOTIF as never);

    await createNotification("user-1", "JOB_MATCH", { jobId: "job-1" });

    expect(to).toHaveBeenCalledWith("user:user-1");
    expect(emit).toHaveBeenCalledWith("notification", MOCK_NOTIF);
    // Reset socket server after test
    setSocketServer(null as never);
  });
});

// ── listNotifications ─────────────────────────────────────────────────────────

describe("listNotifications", () => {
  it("returns notifications ordered unread-first, latest first, max 50", async () => {
    vi.mocked(prisma.notification.findMany).mockResolvedValue([MOCK_NOTIF] as never);

    const result = await listNotifications("user-1");

    expect(prisma.notification.findMany).toHaveBeenCalledWith({
      where:   { userId: "user-1" },
      orderBy: [{ readAt: "asc" }, { createdAt: "desc" }],
      take:    50,
    });
    expect(result).toEqual([MOCK_NOTIF]);
  });
});

// ── markRead ──────────────────────────────────────────────────────────────────

describe("markRead", () => {
  it("marks notification as read", async () => {
    vi.mocked(prisma.notification.findUnique).mockResolvedValue(MOCK_NOTIF as never);
    const updated = { ...MOCK_NOTIF, readAt: new Date() };
    vi.mocked(prisma.notification.update).mockResolvedValue(updated as never);

    const result = await markRead("user-1", "notif-1");

    expect(prisma.notification.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "notif-1" }, data: expect.objectContaining({ readAt: expect.any(Date) }) })
    );
    expect(result.readAt).not.toBeNull();
  });

  it("throws 404 when notification not found", async () => {
    vi.mocked(prisma.notification.findUnique).mockResolvedValue(null);
    await expect(markRead("user-1", "notif-1")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("throws 404 when notification belongs to another user", async () => {
    vi.mocked(prisma.notification.findUnique).mockResolvedValue(MOCK_NOTIF as never);
    await expect(markRead("user-99", "notif-1")).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ── markAllRead ───────────────────────────────────────────────────────────────

describe("markAllRead", () => {
  it("marks all unread notifications for the user as read", async () => {
    vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 5 } as never);

    await markAllRead("user-1");

    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: "user-1", readAt: null },
      data:  { readAt: expect.any(Date) },
    });
  });
});

// ── unreadCount ───────────────────────────────────────────────────────────────

describe("unreadCount", () => {
  it("returns the count of unread notifications", async () => {
    vi.mocked(prisma.notification.count).mockResolvedValue(7);

    const result = await unreadCount("user-1");

    expect(prisma.notification.count).toHaveBeenCalledWith({
      where: { userId: "user-1", readAt: null },
    });
    expect(result).toBe(7);
  });
});

// ── createAlert ───────────────────────────────────────────────────────────────

const future = new Date(Date.now() + 30 * 86_400_000);

function mockMonthlyPlan() {
  vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
    plan: "MONTHLY", status: "ACTIVE", currentPeriodEnd: future,
  } as never);
  vi.mocked(prisma.payment.count).mockResolvedValue(1);
  vi.mocked(prisma.jobAlert.count).mockResolvedValue(0); // under cap
}

describe("createAlert", () => {
  it("creates a job alert with default daily frequency", async () => {
    mockMonthlyPlan();
    vi.mocked(prisma.jobAlert.create).mockResolvedValue(MOCK_ALERT as never);

    const result = await createAlert("user-1", "Remote TypeScript jobs", { keywords: "TypeScript", remote: true });

    expect(prisma.jobAlert.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        name: "Remote TypeScript jobs",
        filters: { keywords: "TypeScript", remote: true },
        frequency: "daily",
      },
    });
    expect(result).toEqual(MOCK_ALERT);
  });

  it("respects explicit frequency override", async () => {
    mockMonthlyPlan();
    vi.mocked(prisma.jobAlert.create).mockResolvedValue({ ...MOCK_ALERT, frequency: "weekly" } as never);

    await createAlert("user-1", "Weekly jobs", {}, "weekly");

    expect(prisma.jobAlert.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ frequency: "weekly" }) })
    );
  });
});

// ── listAlerts ────────────────────────────────────────────────────────────────

describe("listAlerts", () => {
  it("returns all alerts for the user ordered by creation date desc", async () => {
    vi.mocked(prisma.jobAlert.findMany).mockResolvedValue([MOCK_ALERT] as never);

    const result = await listAlerts("user-1");

    expect(prisma.jobAlert.findMany).toHaveBeenCalledWith({
      where:   { userId: "user-1" },
      orderBy: { createdAt: "desc" },
    });
    expect(result).toEqual([MOCK_ALERT]);
  });
});

// ── updateAlert ───────────────────────────────────────────────────────────────

describe("updateAlert", () => {
  it("updates alert name and filters", async () => {
    vi.mocked(prisma.jobAlert.findUnique).mockResolvedValue(MOCK_ALERT as never);
    const updated = { ...MOCK_ALERT, name: "New name" };
    vi.mocked(prisma.jobAlert.update).mockResolvedValue(updated as never);

    const result = await updateAlert("user-1", "alert-1", { name: "New name", filters: { keywords: "Go" } });

    expect(prisma.jobAlert.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "alert-1" } })
    );
    expect(result.name).toBe("New name");
  });

  it("updates alert without filters patch", async () => {
    vi.mocked(prisma.jobAlert.findUnique).mockResolvedValue(MOCK_ALERT as never);
    vi.mocked(prisma.jobAlert.update).mockResolvedValue({ ...MOCK_ALERT, active: false } as never);

    await updateAlert("user-1", "alert-1", { active: false });

    expect(prisma.jobAlert.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { active: false } })
    );
  });

  it("throws 404 when alert not found", async () => {
    vi.mocked(prisma.jobAlert.findUnique).mockResolvedValue(null);
    await expect(updateAlert("user-1", "alert-1", {})).rejects.toMatchObject({ statusCode: 404 });
  });

  it("throws 404 when alert belongs to another user", async () => {
    vi.mocked(prisma.jobAlert.findUnique).mockResolvedValue(MOCK_ALERT as never);
    await expect(updateAlert("user-99", "alert-1", {})).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ── deleteAlert ───────────────────────────────────────────────────────────────

describe("deleteAlert", () => {
  it("deletes the alert", async () => {
    vi.mocked(prisma.jobAlert.findUnique).mockResolvedValue(MOCK_ALERT as never);
    vi.mocked(prisma.jobAlert.delete).mockResolvedValue(MOCK_ALERT as never);

    await deleteAlert("user-1", "alert-1");

    expect(prisma.jobAlert.delete).toHaveBeenCalledWith({ where: { id: "alert-1" } });
  });

  it("throws 404 when alert not found", async () => {
    vi.mocked(prisma.jobAlert.findUnique).mockResolvedValue(null);
    await expect(deleteAlert("user-1", "alert-1")).rejects.toMatchObject({ statusCode: 404 });
    expect(prisma.jobAlert.delete).not.toHaveBeenCalled();
  });

  it("throws 404 when alert belongs to another user", async () => {
    vi.mocked(prisma.jobAlert.findUnique).mockResolvedValue(MOCK_ALERT as never);
    await expect(deleteAlert("user-99", "alert-1")).rejects.toMatchObject({ statusCode: 404 });
    expect(prisma.jobAlert.delete).not.toHaveBeenCalled();
  });
});
