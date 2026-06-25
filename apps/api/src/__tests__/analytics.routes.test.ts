import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { type Application } from "express";
import { analyticsRoutes } from "../routes/analytics.routes";
import { errorHandler } from "../middleware/errorHandler.middleware";

vi.mock("../services/analytics.service", () => ({
  getOverview:              vi.fn(),
  getAtsTrend:              vi.fn(),
  getApplicationsMonthly:   vi.fn(),
  getSkillsDemand:          vi.fn(),
  getApplicationFunnel:     vi.fn(),
  refreshMaterializedViews: vi.fn(),
}));

vi.mock("../middleware/auth.middleware", () => ({
  requireAuth: (req: express.Request & { userId?: string }, _res: express.Response, next: express.NextFunction) => {
    req.userId = "user-1";
    next();
  },
  requireActiveSubscription: (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
  assertUserId: (req: any) => req.userId,
}));

import * as analyticsService from "../services/analytics.service";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;

let app: Application;

beforeEach(() => {
  app = express();
  app.use(express.json());
  app.use("/api/analytics", analyticsRoutes);
  app.use(errorHandler);
  vi.clearAllMocks();
});

// ── GET /overview ─────────────────────────────────────────────────────────────

describe("GET /api/analytics/overview", () => {
  const OVERVIEW = {
    totalApplications: 12, interviews: 4, offers: 1,
    successRate: 8.3, avgAtsScore: 78, savedJobs: 5, roadmaps: 2,
  };

  it("200 — returns overview data", async () => {
    vi.mocked(analyticsService.getOverview as AnyFn).mockResolvedValue(OVERVIEW);
    const res = await request(app).get("/api/analytics/overview");
    expect(res.status).toBe(200);
    expect(res.body.totalApplications).toBe(12);
  });

  it("200 — passes range=30 query param", async () => {
    vi.mocked(analyticsService.getOverview as AnyFn).mockResolvedValue(OVERVIEW);
    await request(app).get("/api/analytics/overview?range=30");
    expect(analyticsService.getOverview).toHaveBeenCalledWith("user-1", 30);
  });

  it("200 — invalid range defaults to 0 (all time)", async () => {
    vi.mocked(analyticsService.getOverview as AnyFn).mockResolvedValue(OVERVIEW);
    await request(app).get("/api/analytics/overview?range=999");
    expect(analyticsService.getOverview).toHaveBeenCalledWith("user-1", 0);
  });
});

// ── GET /ats-trend ────────────────────────────────────────────────────────────

describe("GET /api/analytics/ats-trend", () => {
  it("200 — returns trend array", async () => {
    vi.mocked(analyticsService.getAtsTrend as AnyFn).mockResolvedValue([
      { version: 1, score: 72, date: "2026-01-01" },
      { version: 2, score: 81, date: "2026-02-01" },
    ]);
    const res = await request(app).get("/api/analytics/ats-trend");
    expect(res.status).toBe(200);
    expect(res.body.trend).toHaveLength(2);
    expect(res.body.trend[1].score).toBe(81);
  });

  it("200 — empty trend when no resumes", async () => {
    vi.mocked(analyticsService.getAtsTrend as AnyFn).mockResolvedValue([]);
    const res = await request(app).get("/api/analytics/ats-trend");
    expect(res.body.trend).toHaveLength(0);
  });
});

// ── GET /applications-monthly ─────────────────────────────────────────────────

describe("GET /api/analytics/applications-monthly", () => {
  it("200 — returns monthly data", async () => {
    vi.mocked(analyticsService.getApplicationsMonthly as AnyFn).mockResolvedValue([
      { month: "2026-01", applied: 5, interviewed: 2, offered: 0 },
    ]);
    const res = await request(app).get("/api/analytics/applications-monthly?range=90");
    expect(res.status).toBe(200);
    expect(res.body.monthly[0].month).toBe("2026-01");
  });

  it("200 — passes range param to service", async () => {
    vi.mocked(analyticsService.getApplicationsMonthly as AnyFn).mockResolvedValue([]);
    await request(app).get("/api/analytics/applications-monthly?range=90");
    expect(analyticsService.getApplicationsMonthly).toHaveBeenCalledWith("user-1", 90);
  });
});

// ── GET /skills-demand ────────────────────────────────────────────────────────

describe("GET /api/analytics/skills-demand", () => {
  it("200 — returns skills array", async () => {
    vi.mocked(analyticsService.getSkillsDemand as AnyFn).mockResolvedValue([
      { skill: "TypeScript", count: 18 },
      { skill: "Python",     count: 14 },
    ]);
    const res = await request(app).get("/api/analytics/skills-demand");
    expect(res.status).toBe(200);
    expect(res.body.skills[0].skill).toBe("TypeScript");
  });

  it("200 — empty array when no jobs", async () => {
    vi.mocked(analyticsService.getSkillsDemand as AnyFn).mockResolvedValue([]);
    const res = await request(app).get("/api/analytics/skills-demand");
    expect(res.body.skills).toHaveLength(0);
  });
});

// ── GET /funnel ───────────────────────────────────────────────────────────────

describe("GET /api/analytics/funnel", () => {
  it("200 — returns funnel stages", async () => {
    vi.mocked(analyticsService.getApplicationFunnel as AnyFn).mockResolvedValue([
      { stage: "SAVED",    count: 10 },
      { stage: "APPLIED",  count: 7  },
      { stage: "INTERVIEW_SCHEDULED", count: 3 },
      { stage: "OFFER_RECEIVED",      count: 1 },
    ]);
    const res = await request(app).get("/api/analytics/funnel");
    expect(res.status).toBe(200);
    expect(res.body.funnel).toHaveLength(4);
    expect(res.body.funnel[0].stage).toBe("SAVED");
  });

  it("200 — empty funnel for new user", async () => {
    vi.mocked(analyticsService.getApplicationFunnel as AnyFn).mockResolvedValue([]);
    const res = await request(app).get("/api/analytics/funnel");
    expect(res.body.funnel).toHaveLength(0);
  });
});
