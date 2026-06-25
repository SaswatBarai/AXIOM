import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { type Application } from "express";
import { interviewRoutes } from "../routes/interview.routes";
import { errorHandler, AppError } from "../middleware/errorHandler.middleware";

vi.mock("../services/interview.service", () => ({
  generateInterviewQuestions: vi.fn(),
  listSessions:               vi.fn(),
  getSession:                 vi.fn(),
  deleteSession:              vi.fn(),
  listCategories:             vi.fn(),
  saveMarks:                  vi.fn(),
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

import * as interviewService from "../services/interview.service";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;

const MOCK_QUESTIONS = [
  {
    category:             "dsa",
    question:             "Explain BFS vs DFS.",
    expected_answer_hint: "BFS uses queue, DFS uses stack.",
    difficulty:           "easy",
  },
];

const MOCK_RESULT = {
  session:   { id: "session-1" },
  questions: MOCK_QUESTIONS,
  cached:    false,
};

function buildApp(): Application {
  const app = express();
  app.use(express.json());
  app.use("/api/interview", interviewRoutes);
  app.use(errorHandler);
  return app;
}

const app = buildApp();

beforeEach(() => vi.clearAllMocks());

// ── POST /generate ─────────────────────────────────────────────────────────────

describe("POST /api/interview/generate", () => {
  const BODY = {
    jobTitle:       "Backend Engineer",
    jobDescription: "Build scalable REST APIs",
    difficulty:     "medium",
    sections:       ["dsa", "system_design"],
    count:          5,
  };

  it("201 — returns session + questions", async () => {
    vi.mocked(interviewService.generateInterviewQuestions).mockResolvedValue(MOCK_RESULT as never);
    const res = await request(app).post("/api/interview/generate").send(BODY);
    expect(res.status).toBe(201);
    expect(res.body.questions).toHaveLength(1);
    expect(res.body.session.id).toBe("session-1");
    expect(interviewService.generateInterviewQuestions).toHaveBeenCalledWith(
      "user-1", "Backend Engineer", "Build scalable REST APIs", "medium", ["dsa", "system_design"], 5,
    );
  });

  it("422 — missing jobTitle", async () => {
    const res = await request(app).post("/api/interview/generate").send({ difficulty: "medium" });
    expect(res.status).toBe(422);
  });

  it("422 — invalid difficulty", async () => {
    const res = await request(app)
      .post("/api/interview/generate")
      .send({ jobTitle: "SWE", difficulty: "ultra-hard" });
    expect(res.status).toBe(422);
  });

  it("422 — count exceeds 30", async () => {
    const res = await request(app)
      .post("/api/interview/generate")
      .send({ jobTitle: "SWE", count: 50 });
    expect(res.status).toBe(422);
  });

  it("502 — AI service failure propagates", async () => {
    vi.mocked(interviewService.generateInterviewQuestions).mockRejectedValue(
      new AppError(502, "AI service error"),
    );
    const res = await request(app).post("/api/interview/generate").send(BODY);
    expect(res.status).toBe(502);
  });
});

// ── GET /sessions ─────────────────────────────────────────────────────────────

describe("GET /api/interview/sessions", () => {
  it("200 — returns session list", async () => {
    const sessions = [{ id: "session-1", jobTitle: "SWE", difficulty: "medium", createdAt: new Date() }];
    vi.mocked(interviewService.listSessions).mockResolvedValue(sessions as never);
    const res = await request(app).get("/api/interview/sessions");
    expect(res.status).toBe(200);
    expect(res.body.sessions).toHaveLength(1);
  });
});

// ── GET /sessions/:sessionId ───────────────────────────────────────────────────

describe("GET /api/interview/sessions/:sessionId", () => {
  it("200 — returns session detail", async () => {
    vi.mocked(interviewService.getSession).mockResolvedValue({
      id: "session-1", questions: MOCK_QUESTIONS,
    } as never);
    const res = await request(app).get("/api/interview/sessions/session-1");
    expect(res.status).toBe(200);
    expect(res.body.session.id).toBe("session-1");
  });

  it("404 — session not found", async () => {
    vi.mocked(interviewService.getSession).mockRejectedValue(new AppError(404, "Session not found"));
    const res = await request(app).get("/api/interview/sessions/bad-id");
    expect(res.status).toBe(404);
  });
});

// ── DELETE /sessions/:sessionId ───────────────────────────────────────────────

describe("DELETE /api/interview/sessions/:sessionId", () => {
  it("200 — deletes session", async () => {
    vi.mocked(interviewService.deleteSession).mockResolvedValue(undefined);
    const res = await request(app).delete("/api/interview/sessions/session-1");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("404 — session not found", async () => {
    vi.mocked(interviewService.deleteSession).mockRejectedValue(new AppError(404, "Session not found"));
    const res = await request(app).delete("/api/interview/sessions/bad-id");
    expect(res.status).toBe(404);
  });
});

// ── PATCH /sessions/:sessionId/marks ─────────────────────────────────────────

describe("PATCH /api/interview/sessions/:sessionId/marks", () => {
  it("200 — saves marks", async () => {
    vi.mocked(interviewService.saveMarks as AnyFn).mockResolvedValue({
      id: "session-1", marks: { "0": "correct", "2": "review" },
    });
    const res = await request(app)
      .patch("/api/interview/sessions/session-1/marks")
      .send({ marks: { "0": "correct", "2": "review" } });
    expect(res.status).toBe(200);
    expect(res.body.marks["0"]).toBe("correct");
  });

  it("422 — missing marks field", async () => {
    const res = await request(app)
      .patch("/api/interview/sessions/session-1/marks")
      .send({});
    expect(res.status).toBe(422);
  });

  it("404 — session not found", async () => {
    vi.mocked(interviewService.saveMarks as AnyFn).mockRejectedValue(new AppError(404, "Session not found"));
    const res = await request(app)
      .patch("/api/interview/sessions/bad-id/marks")
      .send({ marks: {} });
    expect(res.status).toBe(404);
  });
});

// ── GET /categories ───────────────────────────────────────────────────────────

describe("GET /api/interview/categories", () => {
  it("200 — returns categories list", async () => {
    vi.mocked(interviewService.listCategories).mockResolvedValue({
      categories: [{ id: "dsa", topics: ["Arrays", "Trees"] }],
    } as never);
    const res = await request(app).get("/api/interview/categories");
    expect(res.status).toBe(200);
    expect(res.body.categories).toHaveLength(1);
  });
});
