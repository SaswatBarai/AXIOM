import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { type Application } from "express";
import { roadmapRoutes } from "../routes/roadmap.routes";
import { errorHandler, AppError } from "../middleware/errorHandler.middleware";

vi.mock("../services/roadmap.service", () => ({
  generateRoadmap: vi.fn(),
  listRoadmaps:    vi.fn(),
  getRoadmap:      vi.fn(),
  markStep:        vi.fn(),
  deleteRoadmap:   vi.fn(),
}));

vi.mock("../middleware/rateLimit.middleware", () => ({
  planRateLimit: () => (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
  rateLimit:     () => (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
}));

vi.mock("../middleware/auth.middleware", () => ({
  requireAuth: (req: express.Request & { userId?: string }, _res: express.Response, next: express.NextFunction) => {
    req.userId = "user-1";
    next();
  },
  requireActiveSubscription: (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
  assertUserId: (req: any) => req.userId,
}));

import * as roadmapService from "../services/roadmap.service";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;

let app: Application;

beforeEach(() => {
  app = express();
  app.use(express.json());
  app.use("/api/roadmap", roadmapRoutes);
  app.use(errorHandler);
  vi.clearAllMocks();
});

// ── POST /generate ─────────────────────────────────────────────────────────────

describe("POST /api/roadmap/generate", () => {
  const VALID_BODY = { targetRole: "Senior Backend Engineer", weeks: 8 };

  it("201 — returns roadmap", async () => {
    vi.mocked(roadmapService.generateRoadmap as AnyFn).mockResolvedValue({
      roadmap: { id: "rm-1", targetRole: "Senior Backend Engineer", weeks: 8, version: 1, content: [] },
      isNew: true,
    });
    const res = await request(app).post("/api/roadmap/generate").send(VALID_BODY);
    expect(res.status).toBe(201);
    expect(res.body.roadmap.id).toBe("rm-1");
  });

  it("422 — missing targetRole", async () => {
    const res = await request(app).post("/api/roadmap/generate").send({ weeks: 8 });
    expect(res.status).toBe(422);
  });

  it("422 — weeks out of range", async () => {
    const res = await request(app).post("/api/roadmap/generate").send({ targetRole: "Dev", weeks: 100 });
    expect(res.status).toBe(422);
  });

  it("502 — AI service failure propagates", async () => {
    vi.mocked(roadmapService.generateRoadmap as AnyFn).mockRejectedValue(new AppError(502, "AI unavailable"));
    const res = await request(app).post("/api/roadmap/generate").send(VALID_BODY);
    expect(res.status).toBe(502);
  });
});

// ── GET / ──────────────────────────────────────────────────────────────────────

describe("GET /api/roadmap", () => {
  it("200 — returns roadmap list", async () => {
    vi.mocked(roadmapService.listRoadmaps as AnyFn).mockResolvedValue([
      { id: "rm-1", targetRole: "SWE", pct: 25 },
    ]);
    const res = await request(app).get("/api/roadmap");
    expect(res.status).toBe(200);
    expect(res.body.roadmaps).toHaveLength(1);
  });
});

// ── GET /:roadmapId ────────────────────────────────────────────────────────────

describe("GET /api/roadmap/:roadmapId", () => {
  it("200 — returns roadmap detail", async () => {
    vi.mocked(roadmapService.getRoadmap as AnyFn).mockResolvedValue({
      id: "rm-1", targetRole: "SWE", content: [], progress: {},
    });
    const res = await request(app).get("/api/roadmap/rm-1");
    expect(res.status).toBe(200);
    expect(res.body.roadmap.id).toBe("rm-1");
  });

  it("404 — not found", async () => {
    vi.mocked(roadmapService.getRoadmap as AnyFn).mockRejectedValue(new AppError(404, "Roadmap not found"));
    const res = await request(app).get("/api/roadmap/bad-id");
    expect(res.status).toBe(404);
  });
});

// ── PATCH /:roadmapId/steps/:week ─────────────────────────────────────────────

describe("PATCH /api/roadmap/:roadmapId/steps/:week", () => {
  it("200 — marks step done", async () => {
    vi.mocked(roadmapService.markStep as AnyFn).mockResolvedValue({
      progress: { "1": true },
      stats: { completedWeeks: 1, totalWeeks: 4, pct: 25, etaWeeks: 3 },
    });
    const res = await request(app).patch("/api/roadmap/rm-1/steps/1").send({ done: true });
    expect(res.status).toBe(200);
    expect(res.body.stats.pct).toBe(25);
  });

  it("422 — missing done field", async () => {
    const res = await request(app).patch("/api/roadmap/rm-1/steps/1").send({});
    expect(res.status).toBe(422);
  });

  it("404 — roadmap not found", async () => {
    vi.mocked(roadmapService.markStep as AnyFn).mockRejectedValue(new AppError(404, "Roadmap not found"));
    const res = await request(app).patch("/api/roadmap/bad/steps/1").send({ done: true });
    expect(res.status).toBe(404);
  });
});

// ── DELETE /:roadmapId ─────────────────────────────────────────────────────────

describe("DELETE /api/roadmap/:roadmapId", () => {
  it("200 — deletes roadmap", async () => {
    vi.mocked(roadmapService.deleteRoadmap as AnyFn).mockResolvedValue(undefined);
    const res = await request(app).delete("/api/roadmap/rm-1");
    expect(res.status).toBe(200);
  });

  it("404 — not found", async () => {
    vi.mocked(roadmapService.deleteRoadmap as AnyFn).mockRejectedValue(new AppError(404, "Roadmap not found"));
    const res = await request(app).delete("/api/roadmap/bad-id");
    expect(res.status).toBe(404);
  });
});
