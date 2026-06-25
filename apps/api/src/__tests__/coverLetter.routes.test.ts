import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { type Application } from "express";
import coverLetterRoutes from "../routes/coverLetter.routes";
import { errorHandler, AppError } from "../middleware/errorHandler.middleware";

vi.mock("../services/coverLetter.service", () => ({
  generateCoverLetter: vi.fn(),
  exportPdf:           vi.fn(),
  exportDocx:          vi.fn(),
  getSavedLetter:      vi.fn(),
  saveLetter:          vi.fn(),
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

import * as clService from "../services/coverLetter.service";

const MOCK_LETTER = "I am excited to apply for the Senior Backend Engineer role at Stripe.\n\nDuring my three years at Acme, I reduced API latency by 40%.";

function buildApp(): Application {
  const app = express();
  app.use(express.json());
  app.use("/api/cover-letter", coverLetterRoutes);
  app.use(errorHandler);
  return app;
}

const app = buildApp();

beforeEach(() => vi.clearAllMocks());

// ── POST /:applicationId/generate ─────────────────────────────────────────────

describe("POST /api/cover-letter/:applicationId/generate", () => {
  const BODY = {
    resumeId:       "resume-1",
    jobDescription: "We need a backend engineer with Python and Postgres experience.",
    companyName:    "Stripe",
    jobTitle:       "Senior Backend Engineer",
    tone:           "formal",
  };

  it("200 — returns generated letter", async () => {
    vi.mocked(clService.generateCoverLetter).mockResolvedValue({
      letter: MOCK_LETTER, tone: "formal", cached: false,
    } as never);
    const res = await request(app).post("/api/cover-letter/app-1/generate").send(BODY);
    expect(res.status).toBe(200);
    expect(res.body.letter).toBe(MOCK_LETTER);
    expect(res.body.cached).toBe(false);
    expect(clService.generateCoverLetter).toHaveBeenCalledWith(
      "user-1", "resume-1", "app-1",
      BODY.jobDescription, "Stripe", "Senior Backend Engineer", "formal",
    );
  });

  it("200 — cache hit returns cached: true", async () => {
    vi.mocked(clService.generateCoverLetter).mockResolvedValue({
      letter: MOCK_LETTER, tone: "formal", cached: true,
    } as never);
    const res = await request(app).post("/api/cover-letter/app-1/generate").send(BODY);
    expect(res.status).toBe(200);
    expect(res.body.cached).toBe(true);
  });

  it("422 — missing jobDescription", async () => {
    const res = await request(app).post("/api/cover-letter/app-1/generate").send({
      resumeId: "r-1", companyName: "Co", jobTitle: "Eng",
    });
    expect(res.status).toBe(422);
    expect(clService.generateCoverLetter).not.toHaveBeenCalled();
  });

  it("422 — jobDescription too short", async () => {
    const res = await request(app).post("/api/cover-letter/app-1/generate").send({
      ...BODY, jobDescription: "short",
    });
    expect(res.status).toBe(422);
  });

  it("404 — resume not found", async () => {
    vi.mocked(clService.generateCoverLetter).mockRejectedValue(new AppError(404, "Resume not found"));
    const res = await request(app).post("/api/cover-letter/app-1/generate").send(BODY);
    expect(res.status).toBe(404);
  });

  it("503 — AI service down", async () => {
    vi.mocked(clService.generateCoverLetter).mockRejectedValue(new AppError(503, "Service unavailable"));
    const res = await request(app).post("/api/cover-letter/app-1/generate").send(BODY);
    expect(res.status).toBe(503);
  });
});

// ── GET /:applicationId ───────────────────────────────────────────────────────

describe("GET /api/cover-letter/:applicationId", () => {
  it("200 — returns saved letter", async () => {
    vi.mocked(clService.getSavedLetter).mockResolvedValue(MOCK_LETTER as never);
    const res = await request(app).get("/api/cover-letter/app-1");
    expect(res.status).toBe(200);
    expect(res.body.letter).toBe(MOCK_LETTER);
  });

  it("200 — returns null when no letter saved", async () => {
    vi.mocked(clService.getSavedLetter).mockResolvedValue(null as never);
    const res = await request(app).get("/api/cover-letter/app-1");
    expect(res.status).toBe(200);
    expect(res.body.letter).toBeNull();
  });
});

// ── PUT /:applicationId ───────────────────────────────────────────────────────

describe("PUT /api/cover-letter/:applicationId", () => {
  it("200 — saves edited letter", async () => {
    vi.mocked(clService.saveLetter).mockResolvedValue(undefined);
    const res = await request(app).put("/api/cover-letter/app-1").send({ letter: MOCK_LETTER });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(clService.saveLetter).toHaveBeenCalledWith("user-1", "app-1", MOCK_LETTER);
  });

  it("422 — empty letter rejected", async () => {
    const res = await request(app).put("/api/cover-letter/app-1").send({ letter: "" });
    expect(res.status).toBe(422);
  });
});

// ── POST /export/pdf ──────────────────────────────────────────────────────────

describe("POST /api/cover-letter/export/pdf", () => {
  it("200 — returns PDF bytes", async () => {
    const fakeBytes = Buffer.from("%PDF-1.4 fake");
    vi.mocked(clService.exportPdf).mockResolvedValue(fakeBytes as never);
    const res = await request(app).post("/api/cover-letter/export/pdf").send({
      letterBody: MOCK_LETTER, candidateName: "Jane Doe",
    });
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/pdf");
  });

  it("422 — missing letterBody", async () => {
    const res = await request(app).post("/api/cover-letter/export/pdf").send({});
    expect(res.status).toBe(422);
  });
});

// ── POST /export/docx ─────────────────────────────────────────────────────────

describe("POST /api/cover-letter/export/docx", () => {
  it("200 — returns DOCX bytes", async () => {
    const fakeBytes = Buffer.from("PK fake docx");
    vi.mocked(clService.exportDocx).mockResolvedValue(fakeBytes as never);
    const res = await request(app).post("/api/cover-letter/export/docx").send({
      letterBody: MOCK_LETTER,
    });
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("wordprocessingml");
  });
});
