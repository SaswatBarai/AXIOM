import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { type Application } from "express";
import jobRoutes from "../routes/job.routes";
import { errorHandler, AppError } from "../middleware/errorHandler.middleware";

vi.mock("../services/job.service", () => ({
  searchJobs:         vi.fn(),
  getJob:             vi.fn(),
  saveJob:            vi.fn(),
  unsaveJob:          vi.fn(),
  listSavedJobs:      vi.fn(),
  runScrape:          vi.fn(),
  getRecommendedJobs: vi.fn(),
  matchSingleJob:     vi.fn(),
}));

// requireAuth → inject userId "user-1"; default role to USER for save/search tests
let currentRole: "USER" | "ADMIN" = "USER";
vi.mock("../middleware/auth.middleware", () => ({
  requireAuth: (req: express.Request & { userId?: string; userRole?: string }, _res: express.Response, next: express.NextFunction) => {
    req.userId = "user-1";
    req.userRole = currentRole;
    next();
  },
  requireRole: (...roles: string[]) => (req: express.Request & { userRole?: string }, res: express.Response, next: express.NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  },
}));

import * as jobService from "../services/job.service";

function buildApp(): Application {
  const app = express();
  app.use(express.json());
  app.use("/api/jobs", jobRoutes);
  app.use(errorHandler);
  return app;
}

const app = buildApp();

const MOCK_JOB = {
  id: "job-1",
  title: "Senior Backend Engineer",
  company: "Bluefox Systems",
  companyLogoUrl: null,
  location: "Bengaluru",
  remote: false,
  jobType: "FULL_TIME",
  experienceLevel: "SENIOR",
  salaryMin: 2_500_000,
  salaryMax: 4_000_000,
  currency: "INR",
  description: "Senior Backend Engineer with Python and FastAPI.",
  requiredSkills: ["python", "fastapi", "postgresql"],
  niceToHaveSkills: ["kafka"],
  source: "naukri",
  sourceUrl: "https://naukri.com/job-1",
  postedAt: new Date(),
  expiresAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  currentRole = "USER";
});

// ── GET /api/jobs ─────────────────────────────────────────────────────────────

describe("GET /api/jobs", () => {
  it("200 — returns paginated results", async () => {
    vi.mocked(jobService.searchJobs).mockResolvedValue({
      jobs: [MOCK_JOB] as never,
      total: 1,
      page: 1,
      pageSize: 20,
    });

    const res = await request(app).get("/api/jobs");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.jobs).toHaveLength(1);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(20);
  });

  it("200 — forwards filters to service", async () => {
    vi.mocked(jobService.searchJobs).mockResolvedValue({ jobs: [], total: 0, page: 1, pageSize: 20 });

    await request(app).get("/api/jobs").query({
      q: "backend",
      remote: "true",
      jobType: "FULL_TIME",
      experienceLevel: "SENIOR",
      source: "naukri",
      salaryMin: "1000000",
      skills: "python,fastapi",
      page: "2",
      pageSize: "10",
    });

    expect(jobService.searchJobs).toHaveBeenCalledWith(
      expect.objectContaining({
        q: "backend",
        remote: true,
        jobType: "FULL_TIME",
        experienceLevel: "SENIOR",
        source: "naukri",
        salaryMin: 1_000_000,
        skills: ["python", "fastapi"],
        page: 2,
        pageSize: 10,
        sortBy: "match",
      }),
      "user-1",
    );
  });

  it("422 — rejects invalid jobType", async () => {
    const res = await request(app).get("/api/jobs").query({ jobType: "BOGUS" });
    expect(res.status).toBe(422);
    expect(jobService.searchJobs).not.toHaveBeenCalled();
  });

  it("422 — rejects invalid source", async () => {
    const res = await request(app).get("/api/jobs").query({ source: "linkedin" });
    expect(res.status).toBe(422);
  });

  it("422 — rejects pageSize > 50", async () => {
    const res = await request(app).get("/api/jobs").query({ pageSize: "100" });
    expect(res.status).toBe(422);
  });

  it("200 — splits comma-separated skills into array", async () => {
    vi.mocked(jobService.searchJobs).mockResolvedValue({ jobs: [], total: 0, page: 1, pageSize: 20 });
    await request(app).get("/api/jobs").query({ skills: "react,typescript,nextjs" });
    expect(jobService.searchJobs).toHaveBeenCalledWith(
      expect.objectContaining({ skills: ["react", "typescript", "nextjs"] }),
      "user-1",
    );
  });
});

// ── GET /api/jobs/:id ─────────────────────────────────────────────────────────

describe("GET /api/jobs/:id", () => {
  it("200 — returns job", async () => {
    vi.mocked(jobService.getJob).mockResolvedValue(MOCK_JOB as never);
    const res = await request(app).get("/api/jobs/job-1");
    expect(res.status).toBe(200);
    expect(res.body.job.id).toBe("job-1");
  });

  it("404 — job not found", async () => {
    vi.mocked(jobService.getJob).mockRejectedValue(new AppError(404, "Job not found"));
    const res = await request(app).get("/api/jobs/bogus");
    expect(res.status).toBe(404);
  });
});

// ── POST /api/jobs/:id/save ───────────────────────────────────────────────────

describe("POST /api/jobs/:id/save", () => {
  it("201 — saves a job", async () => {
    vi.mocked(jobService.saveJob).mockResolvedValue({ message: "Job saved", jobId: "job-1" } as never);
    const res = await request(app).post("/api/jobs/job-1/save");
    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/saved/i);
    expect(jobService.saveJob).toHaveBeenCalledWith("user-1", "job-1");
  });

  it("404 — job not found", async () => {
    vi.mocked(jobService.saveJob).mockRejectedValue(new AppError(404, "Job not found"));
    const res = await request(app).post("/api/jobs/bogus/save");
    expect(res.status).toBe(404);
  });
});

// ── DELETE /api/jobs/:id/save ─────────────────────────────────────────────────

describe("DELETE /api/jobs/:id/save", () => {
  it("200 — unsaves a job", async () => {
    vi.mocked(jobService.unsaveJob).mockResolvedValue({ message: "Job unsaved", jobId: "job-1" } as never);
    const res = await request(app).delete("/api/jobs/job-1/save");
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/unsaved/i);
  });

  it("200 — idempotent (no error if not saved)", async () => {
    vi.mocked(jobService.unsaveJob).mockResolvedValue({ message: "Job unsaved", jobId: "job-1" } as never);
    const res = await request(app).delete("/api/jobs/job-1/save");
    expect(res.status).toBe(200);
  });
});

// ── GET /api/jobs/saved ───────────────────────────────────────────────────────

describe("GET /api/jobs/saved", () => {
  it("200 — returns saved jobs list", async () => {
    vi.mocked(jobService.listSavedJobs).mockResolvedValue({
      jobs: [MOCK_JOB] as never,
      total: 1,
      page: 1,
      pageSize: 20,
    });

    const res = await request(app).get("/api/jobs/saved");
    expect(res.status).toBe(200);
    expect(res.body.jobs).toHaveLength(1);
    expect(jobService.listSavedJobs).toHaveBeenCalledWith("user-1", 1, 20);
  });
});

// ── POST /api/jobs/scrape (admin-only) ────────────────────────────────────────

describe("POST /api/jobs/scrape", () => {
  it("403 — non-admin forbidden", async () => {
    currentRole = "USER";
    const res = await request(app)
      .post("/api/jobs/scrape")
      .send({ source: "internshala" });
    expect(res.status).toBe(403);
    expect(jobService.runScrape).not.toHaveBeenCalled();
  });

  it("200 — admin can trigger scrape", async () => {
    currentRole = "ADMIN";
    vi.mocked(jobService.runScrape).mockResolvedValue({
      source: "internshala",
      fetched: 18,
      inserted: 16,
      updated: 2,
      skipped: 0,
      errors: 0,
      durationMs: 4321,
    });

    const res = await request(app)
      .post("/api/jobs/scrape")
      .send({ source: "internshala", query: "backend", maxPages: 2, maxJobs: 50 });

    expect(res.status).toBe(200);
    expect(res.body.summary).toMatchObject({
      source: "internshala",
      fetched: 18,
      inserted: 16,
      updated: 2,
    });
  });

  it("422 — invalid source rejected", async () => {
    currentRole = "ADMIN";
    const res = await request(app)
      .post("/api/jobs/scrape")
      .send({ source: "linkedin" });
    expect(res.status).toBe(422);
  });

  it("422 — maxPages out of range", async () => {
    currentRole = "ADMIN";
    const res = await request(app)
      .post("/api/jobs/scrape")
      .send({ source: "internshala", maxPages: 99 });
    expect(res.status).toBe(422);
  });
});

// ── GET /api/jobs/recommended ──────────────────────────────────────────────────

describe("GET /api/jobs/recommended", () => {
  it("200 — returns recommended jobs", async () => {
    vi.mocked(jobService.getRecommendedJobs).mockResolvedValue([
      { ...MOCK_JOB, matchScore: 85.5, matchedSkills: ["python"], missingSkills: ["fastapi"] }
    ] as any);

    const res = await request(app).get("/api/jobs/recommended");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].matchScore).toBe(85.5);
    expect(jobService.getRecommendedJobs).toHaveBeenCalledWith("user-1", 20);
  });
});

// ── GET /api/jobs/:id/match ──────────────────────────────────────────────────

describe("GET /api/jobs/:id/match", () => {
  it("200 — returns match score for single job", async () => {
    vi.mocked(jobService.matchSingleJob).mockResolvedValue({
      ...MOCK_JOB,
      matchScore: 92.0,
      matchedSkills: ["python", "fastapi"],
      missingSkills: []
    } as any);

    const res = await request(app).get("/api/jobs/job-1/match");
    expect(res.status).toBe(200);
    expect(res.body.matchScore).toBe(92.0);
    expect(jobService.matchSingleJob).toHaveBeenCalledWith("user-1", "job-1");
  });
});
