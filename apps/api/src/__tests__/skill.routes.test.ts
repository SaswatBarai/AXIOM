import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { type Application } from "express";
import skillRoutes from "../routes/skill.routes";
import { errorHandler, AppError } from "../middleware/errorHandler.middleware";

vi.mock("../services/skill.service", () => ({
  getTargetRoles: vi.fn(),
  analyzeSkillGap: vi.fn(),
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

import * as skillService from "../services/skill.service";

const MOCK_ROLES = [
  { id: "frontend_engineer", label: "Frontend Engineer", description: "Builds UIs" },
  { id: "backend_engineer",  label: "Backend Engineer",  description: "Builds APIs" },
];

const MOCK_REPORT = {
  roleId: "backend_engineer",
  roleLabel: "Backend Engineer",
  version: "v1",
  matched:  { must_have: ["python"], should_have: [], nice_to_have: [] },
  missing:  { must_have: ["docker"], should_have: ["redis"], nice_to_have: [] },
  recommendations: [
    { skill: "docker", tier: "must_have", tierLabel: "Must Have", priority: 1 },
  ],
  summary: { total: 15, matchedCount: 6, missingCount: 9, readinessPct: 55, mustHaveGap: 1, skillsAway: 9 },
};

function buildApp(): Application {
  const app = express();
  app.use(express.json());
  app.use("/api/skills", skillRoutes);
  app.use(errorHandler);
  return app;
}

const app = buildApp();

beforeEach(() => vi.clearAllMocks());

// ── GET /api/skills/target-roles ──────────────────────────────────────────────

describe("GET /api/skills/target-roles", () => {
  it("200 — returns role list", async () => {
    vi.mocked(skillService.getTargetRoles).mockResolvedValue(MOCK_ROLES as never);
    const res = await request(app).get("/api/skills/target-roles");
    expect(res.status).toBe(200);
    expect(res.body.roles).toHaveLength(2);
    expect(res.body.roles[0].id).toBe("frontend_engineer");
  });

  it("503 — AI service down propagates as 500", async () => {
    vi.mocked(skillService.getTargetRoles).mockRejectedValue(new AppError(503, "Service unavailable"));
    const res = await request(app).get("/api/skills/target-roles");
    expect(res.status).toBe(503);
  });
});

// ── POST /api/skills/gap/:resumeId ────────────────────────────────────────────

describe("POST /api/skills/gap/:resumeId", () => {
  it("200 — returns gap report", async () => {
    vi.mocked(skillService.analyzeSkillGap).mockResolvedValue(MOCK_REPORT as never);
    const res = await request(app)
      .post("/api/skills/gap/resume-1")
      .send({ roleId: "backend_engineer" });
    expect(res.status).toBe(200);
    expect(res.body.report.roleId).toBe("backend_engineer");
    expect(res.body.report.summary.readinessPct).toBe(55);
    expect(skillService.analyzeSkillGap).toHaveBeenCalledWith("user-1", "resume-1", "backend_engineer");
  });

  it("422 — missing roleId rejected by Zod", async () => {
    const res = await request(app).post("/api/skills/gap/resume-1").send({});
    expect(res.status).toBe(422);
    expect(skillService.analyzeSkillGap).not.toHaveBeenCalled();
  });

  it("404 — resume not found", async () => {
    vi.mocked(skillService.analyzeSkillGap).mockRejectedValue(new AppError(404, "Resume not found"));
    const res = await request(app)
      .post("/api/skills/gap/bogus")
      .send({ roleId: "frontend_engineer" });
    expect(res.status).toBe(404);
  });

  it("403 — wrong owner", async () => {
    vi.mocked(skillService.analyzeSkillGap).mockRejectedValue(new AppError(403, "Forbidden"));
    const res = await request(app)
      .post("/api/skills/gap/other-resume")
      .send({ roleId: "frontend_engineer" });
    expect(res.status).toBe(403);
  });

  it("422 — resume not parsed yet", async () => {
    vi.mocked(skillService.analyzeSkillGap).mockRejectedValue(
      new AppError(422, "Resume has not been parsed yet"),
    );
    const res = await request(app)
      .post("/api/skills/gap/resume-1")
      .send({ roleId: "frontend_engineer" });
    expect(res.status).toBe(422);
  });

  it("503 — AI service unavailable", async () => {
    vi.mocked(skillService.analyzeSkillGap).mockRejectedValue(
      new AppError(503, "Skill gap service unavailable"),
    );
    const res = await request(app)
      .post("/api/skills/gap/resume-1")
      .send({ roleId: "frontend_engineer" });
    expect(res.status).toBe(503);
  });
});
