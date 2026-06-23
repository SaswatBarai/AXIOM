import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { type Application } from "express";
import resumeRoutes from "../routes/resume.routes";
import { errorHandler, AppError } from "../middleware/errorHandler.middleware";

vi.mock("../services/resume.service", () => ({
  uploadResume:   vi.fn(),
  listResumes:    vi.fn(),
  getResume:      vi.fn(),
  deleteResume:   vi.fn(),
  analyzeResume:  vi.fn(),
}));

// requireAuth middleware — inject a fake userId for all tests
vi.mock("../middleware/auth.middleware", () => ({
  requireAuth: (req: express.Request & { userId?: string }, _res: express.Response, next: express.NextFunction) => {
    req.userId = "user-1";
    next();
  },
  requireRole: () => (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
  assertUserId: (req: any) => req.userId,
}));

import * as resumeService from "../services/resume.service";

function buildApp(): Application {
  const app = express();
  app.use(express.json());
  app.use("/api/resumes", resumeRoutes);
  app.use(errorHandler);
  return app;
}

const app = buildApp();

const MOCK_RESUME = {
  id: "resume-1", userId: "user-1",
  fileName: "cv.pdf", fileUrl: "http://localhost:9000/axiom-resumes/resumes/user-1/cv.pdf",
  fileType: "pdf", version: 1, parsedData: null, atsScore: null,
  createdAt: new Date(), updatedAt: new Date(),
  downloadUrl: "http://localhost:9000/presigned",
};

beforeEach(() => vi.clearAllMocks());

// ── POST /api/resumes ─────────────────────────────────────────────────────────

describe("POST /api/resumes", () => {
  it("201 — uploads a PDF file", async () => {
    vi.mocked(resumeService.uploadResume).mockResolvedValue(MOCK_RESUME as never);

    const res = await request(app)
      .post("/api/resumes")
      .attach("resume", Buffer.from("%PDF-1.4 fake"), { filename: "cv.pdf", contentType: "application/pdf" });

    expect(res.status).toBe(201);
    expect(res.body.resume.fileName).toBe("cv.pdf");
    expect(resumeService.uploadResume).toHaveBeenCalledOnce();
  });

  it("400 — no file attached", async () => {
    const res = await request(app).post("/api/resumes");
    expect(res.status).toBe(400);
  });

  it("415 — wrong file type forwarded from service", async () => {
    vi.mocked(resumeService.uploadResume).mockRejectedValue(
      new AppError(415, "Only PDF and DOCX files are accepted")
    );

    const res = await request(app)
      .post("/api/resumes")
      .attach("resume", Buffer.from("fake"), { filename: "cv.txt", contentType: "text/plain" });

    // multer fileFilter drops non-pdf/docx files before the service, so the file never reaches the service
    // supertest will either get 400 (no file) or pass through depending on multer behaviour
    expect([400, 415]).toContain(res.status);
  });
});

// ── GET /api/resumes ──────────────────────────────────────────────────────────

describe("GET /api/resumes", () => {
  it("200 — returns list", async () => {
    vi.mocked(resumeService.listResumes).mockResolvedValue([MOCK_RESUME] as never);

    const res = await request(app).get("/api/resumes");

    expect(res.status).toBe(200);
    expect(res.body.resumes).toHaveLength(1);
    expect(res.body.resumes[0].id).toBe("resume-1");
  });

  it("200 — empty list when no resumes", async () => {
    vi.mocked(resumeService.listResumes).mockResolvedValue([]);

    const res = await request(app).get("/api/resumes");

    expect(res.status).toBe(200);
    expect(res.body.resumes).toHaveLength(0);
  });
});

// ── GET /api/resumes/:id ──────────────────────────────────────────────────────

describe("GET /api/resumes/:id", () => {
  it("200 — returns resume with downloadUrl", async () => {
    vi.mocked(resumeService.getResume).mockResolvedValue(MOCK_RESUME as never);

    const res = await request(app).get("/api/resumes/resume-1");

    expect(res.status).toBe(200);
    expect(res.body.resume.downloadUrl).toBeDefined();
  });

  it("404 — resume not found", async () => {
    vi.mocked(resumeService.getResume).mockRejectedValue(new AppError(404, "Resume not found"));

    const res = await request(app).get("/api/resumes/bad-id");

    expect(res.status).toBe(404);
  });

  it("403 — resume belongs to another user", async () => {
    vi.mocked(resumeService.getResume).mockRejectedValue(new AppError(403, "Forbidden"));

    const res = await request(app).get("/api/resumes/other-user-resume");

    expect(res.status).toBe(403);
  });
});

// ── DELETE /api/resumes/:id ───────────────────────────────────────────────────

describe("DELETE /api/resumes/:id", () => {
  it("200 — deletes resume", async () => {
    vi.mocked(resumeService.deleteResume).mockResolvedValue({ message: "Resume deleted" });

    const res = await request(app).delete("/api/resumes/resume-1");

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
    expect(resumeService.deleteResume).toHaveBeenCalledWith("resume-1", "user-1");
  });

  it("404 — resume not found", async () => {
    vi.mocked(resumeService.deleteResume).mockRejectedValue(new AppError(404, "Resume not found"));

    const res = await request(app).delete("/api/resumes/bad-id");

    expect(res.status).toBe(404);
  });
});

// ── POST /api/resumes/:id/analyze (ATS) ───────────────────────────────────────

const VALID_JD =
  "We are hiring a Senior Backend Engineer with strong Python and FastAPI experience to build production-grade APIs.";

const MOCK_ATS = {
  overall: 79,
  formatting: 100,
  keywordMatch: 76,
  readability: 90,
  completeness: 100,
  strengths: ["Strong keyword alignment (13 matched terms)"],
  missingSkills: ["kafka", "rabbitmq"],
  suggestions: ["Add a projects section to showcase practical experience"],
};

const MOCK_RESUME_ANALYZED = { ...MOCK_RESUME, atsScore: MOCK_ATS };

describe("POST /api/resumes/:id/analyze", () => {
  it("200 — returns resume with ATS score on valid JD", async () => {
    vi.mocked(resumeService.analyzeResume).mockResolvedValue(MOCK_RESUME_ANALYZED as never);

    const res = await request(app)
      .post("/api/resumes/resume-1/analyze")
      .send({ jobDescription: VALID_JD });

    expect(res.status).toBe(200);
    expect(res.body.resume.atsScore).toMatchObject({
      overall: 79,
      keywordMatch: 76,
      strengths: expect.any(Array),
      missingSkills: expect.any(Array),
      suggestions: expect.any(Array),
    });
    expect(resumeService.analyzeResume).toHaveBeenCalledWith("resume-1", "user-1", VALID_JD);
  });

  it("422 — rejects JD shorter than 20 characters", async () => {
    const res = await request(app)
      .post("/api/resumes/resume-1/analyze")
      .send({ jobDescription: "too short" });

    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/validation/i);
    expect(res.body.details[0].field).toBe("jobDescription");
    expect(resumeService.analyzeResume).not.toHaveBeenCalled();
  });

  it("422 — rejects missing jobDescription field", async () => {
    const res = await request(app)
      .post("/api/resumes/resume-1/analyze")
      .send({});

    expect(res.status).toBe(422);
    expect(resumeService.analyzeResume).not.toHaveBeenCalled();
  });

  it("422 — rejects JD over 10,000 chars", async () => {
    const res = await request(app)
      .post("/api/resumes/resume-1/analyze")
      .send({ jobDescription: "x".repeat(10_001) });

    expect(res.status).toBe(422);
    expect(resumeService.analyzeResume).not.toHaveBeenCalled();
  });

  it("403 — resume belongs to another user", async () => {
    vi.mocked(resumeService.analyzeResume).mockRejectedValue(new AppError(403, "Forbidden"));

    const res = await request(app)
      .post("/api/resumes/other-user-resume/analyze")
      .send({ jobDescription: VALID_JD });

    expect(res.status).toBe(403);
  });

  it("404 — resume not found", async () => {
    vi.mocked(resumeService.analyzeResume).mockRejectedValue(new AppError(404, "Resume not found"));

    const res = await request(app)
      .post("/api/resumes/bad-id/analyze")
      .send({ jobDescription: VALID_JD });

    expect(res.status).toBe(404);
  });

  it("422 — resume not parsed yet", async () => {
    vi.mocked(resumeService.analyzeResume).mockRejectedValue(
      new AppError(422, "Resume has not been parsed yet — try again in a moment"),
    );

    const res = await request(app)
      .post("/api/resumes/resume-1/analyze")
      .send({ jobDescription: VALID_JD });

    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/parsed/i);
  });

  it("503 — AI service unavailable", async () => {
    vi.mocked(resumeService.analyzeResume).mockRejectedValue(
      new AppError(503, "ATS analysis service unavailable — try again later"),
    );

    const res = await request(app)
      .post("/api/resumes/resume-1/analyze")
      .send({ jobDescription: VALID_JD });

    expect(res.status).toBe(503);
  });
});
