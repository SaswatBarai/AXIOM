import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { type Application } from "express";
import applicationRoutes from "../routes/application.routes";
import { errorHandler, AppError } from "../middleware/errorHandler.middleware";

vi.mock("../services/application.service", () => ({
  createApplication: vi.fn(),
  listApplications: vi.fn(),
  getApplication: vi.fn(),
  updateApplication: vi.fn(),
  deleteApplication: vi.fn(),
  getStats: vi.fn(),
}));

vi.mock("../middleware/auth.middleware", () => ({
  requireAuth: (
    req: express.Request & { userId?: string },
    _res: express.Response,
    next: express.NextFunction
  ) => {
    req.userId = "user-1";
    next();
  },
}));

import * as applicationService from "../services/application.service";

function buildApp(): Application {
  const app = express();
  app.use(express.json());
  app.use("/api/applications", applicationRoutes);
  app.use(errorHandler);
  return app;
}

const app = buildApp();

const MOCK_APPLICATION = {
  id: "app-1",
  userId: "user-1",
  jobId: "job-1",
  status: "SAVED",
  coverLetter: "Cover letter text",
  notes: "Some notes",
  appliedAt: null,
  timeline: JSON.stringify([
    { status: "SAVED", at: new Date().toISOString(), note: "Application created" },
  ]),
  createdAt: new Date(),
  updatedAt: new Date(),
  job: {
    id: "job-1",
    title: "Software Engineer",
    company: "Google",
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/applications", () => {
  it("201 — creates application", async () => {
    vi.mocked(applicationService.createApplication).mockResolvedValue(MOCK_APPLICATION as any);

    const res = await request(app)
      .post("/api/applications")
      .send({ jobId: "job-1", status: "SAVED", note: "Created application" });

    expect(res.status).toBe(201);
    expect(res.body.application.id).toBe("app-1");
    expect(applicationService.createApplication).toHaveBeenCalledWith(
      "user-1",
      "job-1",
      "SAVED",
      "Created application"
    );
  });

  it("422 — missing jobId", async () => {
    const res = await request(app)
      .post("/api/applications")
      .send({ status: "SAVED" });

    expect(res.status).toBe(422);
    expect(applicationService.createApplication).not.toHaveBeenCalled();
  });

  it("422 — invalid status", async () => {
    const res = await request(app)
      .post("/api/applications")
      .send({ jobId: "job-1", status: "BOGUS" });

    expect(res.status).toBe(422);
    expect(applicationService.createApplication).not.toHaveBeenCalled();
  });
});

describe("GET /api/applications", () => {
  it("200 — returns applications list", async () => {
    vi.mocked(applicationService.listApplications).mockResolvedValue([MOCK_APPLICATION] as any);

    const res = await request(app).get("/api/applications");

    expect(res.status).toBe(200);
    expect(res.body.applications).toHaveLength(1);
    expect(applicationService.listApplications).toHaveBeenCalledWith(
      "user-1",
      undefined,
      undefined,
      undefined
    );
  });

  it("200 — forwards filters", async () => {
    vi.mocked(applicationService.listApplications).mockResolvedValue([]);

    const res = await request(app)
      .get("/api/applications")
      .query({ status: "APPLIED", dateFrom: "2026-01-01", dateTo: "2026-06-01" });

    expect(res.status).toBe(200);
    expect(applicationService.listApplications).toHaveBeenCalledWith(
      "user-1",
      "APPLIED",
      "2026-01-01",
      "2026-06-01"
    );
  });

  it("422 — invalid status filter", async () => {
    const res = await request(app)
      .get("/api/applications")
      .query({ status: "INVALID" });

    expect(res.status).toBe(422);
  });
});

describe("GET /api/applications/stats", () => {
  it("200 — returns application statistics", async () => {
    const mockStats = {
      counts: {
        SAVED: 1,
        APPLIED: 0,
        OA_RECEIVED: 0,
        INTERVIEW_SCHEDULED: 0,
        OFFER_RECEIVED: 0,
        REJECTED: 0,
        WITHDRAWN: 0,
      },
      successRate: 0,
      avgTimeToInterviewDays: 0,
    };

    vi.mocked(applicationService.getStats).mockResolvedValue(mockStats);

    const res = await request(app).get("/api/applications/stats");

    expect(res.status).toBe(200);
    expect(res.body.stats).toEqual(mockStats);
    expect(applicationService.getStats).toHaveBeenCalledWith("user-1");
  });
});

describe("GET /api/applications/:id", () => {
  it("200 — returns application detail", async () => {
    vi.mocked(applicationService.getApplication).mockResolvedValue(MOCK_APPLICATION as any);

    const res = await request(app).get("/api/applications/app-1");

    expect(res.status).toBe(200);
    expect(res.body.application.id).toBe("app-1");
    expect(applicationService.getApplication).toHaveBeenCalledWith("app-1", "user-1");
  });

  it("404 — application not found", async () => {
    vi.mocked(applicationService.getApplication).mockRejectedValue(
      new AppError(404, "Application not found")
    );

    const res = await request(app).get("/api/applications/bogus");

    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/applications/:id", () => {
  it("200 — updates application status and text fields", async () => {
    const updatedMock = { ...MOCK_APPLICATION, status: "APPLIED", notes: "Updated note" };
    vi.mocked(applicationService.updateApplication).mockResolvedValue(updatedMock as any);

    const res = await request(app)
      .patch("/api/applications/app-1")
      .send({ status: "APPLIED", notes: "Updated note", note: "Transition note" });

    expect(res.status).toBe(200);
    expect(res.body.application.status).toBe("APPLIED");
    expect(applicationService.updateApplication).toHaveBeenCalledWith("app-1", "user-1", {
      status: "APPLIED",
      notes: "Updated note",
      note: "Transition note",
    });
  });

  it("422 — status transition error forwarded", async () => {
    vi.mocked(applicationService.updateApplication).mockRejectedValue(
      new AppError(422, "Invalid status transition from SAVED to OFFER_RECEIVED")
    );

    const res = await request(app)
      .patch("/api/applications/app-1")
      .send({ status: "OFFER_RECEIVED" });

    expect(res.status).toBe(422);
  });
});

describe("DELETE /api/applications/:id", () => {
  it("200 — deletes application successfully", async () => {
    vi.mocked(applicationService.deleteApplication).mockResolvedValue({
      message: "Application deleted successfully",
      id: "app-1",
    });

    const res = await request(app).delete("/api/applications/app-1");

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
    expect(applicationService.deleteApplication).toHaveBeenCalledWith("app-1", "user-1");
  });
});
