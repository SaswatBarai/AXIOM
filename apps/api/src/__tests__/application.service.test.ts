import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@axiom/database";
import { redis } from "../services/redis.service";

// Inject mock properties on prisma
(prisma as any).job = {
  findUnique: vi.fn(),
};

(prisma as any).application = {
  findUnique: vi.fn(),
  create: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

// Inject mock properties on redis
(redis as any).getJson = vi.fn();
(redis as any).setJson = vi.fn();

import {
  createApplication,
  listApplications,
  getApplication,
  updateApplication,
  deleteApplication,
  getStats,
} from "../services/application.service";

beforeEach(() => {
  vi.clearAllMocks();
});

const MOCK_JOB = {
  id: "job-1",
  title: "Software Engineer",
  company: "Google",
};

const MOCK_APPLICATION = {
  id: "app-1",
  userId: "user-1",
  jobId: "job-1",
  status: "SAVED",
  coverLetter: "My Cover Letter",
  notes: "My Notes",
  appliedAt: null,
  timeline: JSON.stringify([
    { status: "SAVED", at: new Date().toISOString(), note: "Created application" },
  ]),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("createApplication", () => {
  it("creates application successfully", async () => {
    vi.mocked(prisma.job.findUnique).mockResolvedValue(MOCK_JOB as any);
    vi.mocked(prisma.application.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.application.create).mockResolvedValue(MOCK_APPLICATION as any);

    const app = await createApplication("user-1", "job-1", "SAVED", "Test note");

    expect(prisma.job.findUnique).toHaveBeenCalledWith({ where: { id: "job-1" } });
    expect(prisma.application.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        jobId: "job-1",
        status: "SAVED",
        appliedAt: null,
      }),
      include: { job: true },
    });
    expect(redis.del).toHaveBeenCalledWith("applications:stats:user-1");
    expect(app).toEqual(MOCK_APPLICATION);
  });

  it("throws 404 if job not found", async () => {
    vi.mocked(prisma.job.findUnique).mockResolvedValue(null);

    await expect(createApplication("user-1", "job-1")).rejects.toMatchObject({
      statusCode: 404,
      message: "Job not found",
    });
  });

  it("throws 400 if application already exists", async () => {
    vi.mocked(prisma.job.findUnique).mockResolvedValue(MOCK_JOB as any);
    vi.mocked(prisma.application.findUnique).mockResolvedValue(MOCK_APPLICATION as any);

    await expect(createApplication("user-1", "job-1")).rejects.toMatchObject({
      statusCode: 400,
      message: "Application for this job already exists",
    });
  });
});

describe("listApplications", () => {
  it("lists all applications with filters", async () => {
    vi.mocked(prisma.application.findMany).mockResolvedValue([MOCK_APPLICATION] as any);

    const list = await listApplications(
      "user-1",
      "SAVED",
      "2026-01-01T00:00:00.000Z",
      "2026-06-01T00:00:00.000Z"
    );

    expect(prisma.application.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        status: "SAVED",
        createdAt: {
          gte: new Date("2026-01-01T00:00:00.000Z"),
          lte: new Date("2026-06-01T00:00:00.000Z"),
        },
      },
      include: { job: true },
      orderBy: { updatedAt: "desc" },
    });
    expect(list).toHaveLength(1);
  });
});

describe("getApplication", () => {
  it("returns app details if owner", async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue(MOCK_APPLICATION as any);

    const app = await getApplication("app-1", "user-1");

    expect(app).toEqual(MOCK_APPLICATION);
  });

  it("throws 404 if application not found", async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue(null);

    await expect(getApplication("app-1", "user-1")).rejects.toMatchObject({
      statusCode: 404,
      message: "Application not found",
    });
  });

  it("throws 403 if user not owner", async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue(MOCK_APPLICATION as any);

    await expect(getApplication("app-1", "user-2")).rejects.toMatchObject({
      statusCode: 403,
      message: "Forbidden",
    });
  });
});

describe("updateApplication", () => {
  it("updates textual notes/cover letter and status transitions", async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue(MOCK_APPLICATION as any);
    vi.mocked(prisma.application.update).mockResolvedValue({
      ...MOCK_APPLICATION,
      status: "APPLIED",
      notes: "Updated Note",
    } as any);

    const updated = await updateApplication("app-1", "user-1", {
      status: "APPLIED",
      notes: "Updated Note",
      note: "Transition note",
    });

    expect(prisma.application.update).toHaveBeenCalledWith({
      where: { id: "app-1" },
      data: expect.objectContaining({
        notes: "Updated Note",
        status: "APPLIED",
        appliedAt: expect.any(Date),
        timeline: expect.any(String),
      }),
      include: { job: true },
    });
    expect(redis.del).toHaveBeenCalledWith("applications:stats:user-1");
  });

  it("throws 422 on illegal status transition", async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue(MOCK_APPLICATION as any);

    await expect(
      updateApplication("app-1", "user-1", { status: "OFFER_RECEIVED" })
    ).rejects.toMatchObject({
      statusCode: 422,
      message: "Invalid status transition from SAVED to OFFER_RECEIVED",
    });
  });

  it("caps timeline log sizes to 50 transitions", async () => {
    const hugeTimeline = Array.from({ length: 60 }, (_, i) => ({
      status: "SAVED",
      at: new Date().toISOString(),
      note: `Transition ${i}`,
    }));
    const appWithHugeTimeline = { ...MOCK_APPLICATION, timeline: JSON.stringify(hugeTimeline) };

    vi.mocked(prisma.application.findUnique).mockResolvedValue(appWithHugeTimeline as any);
    vi.mocked(prisma.application.update).mockResolvedValue(MOCK_APPLICATION as any);

    await updateApplication("app-1", "user-1", { status: "APPLIED" });

    const updateCall = vi.mocked(prisma.application.update).mock.calls[0]?.[0];
    const parsedTimeline = JSON.parse(updateCall?.data.timeline as string);
    expect(parsedTimeline.length).toBe(50);
  });

  it("handles malformed or invalid JSON timeline gracefully by resetting it", async () => {
    const appWithBadTimeline = { ...MOCK_APPLICATION, timeline: "invalid-json-data{" };
    vi.mocked(prisma.application.findUnique).mockResolvedValue(appWithBadTimeline as any);
    vi.mocked(prisma.application.update).mockResolvedValue(MOCK_APPLICATION as any);

    await updateApplication("app-1", "user-1", { status: "APPLIED" });

    const updateCall = vi.mocked(prisma.application.update).mock.calls[0]?.[0];
    const parsedTimeline = JSON.parse(updateCall?.data.timeline as string);
    expect(Array.isArray(parsedTimeline)).toBe(true);
    expect(parsedTimeline.length).toBe(1);
    expect(parsedTimeline[0].status).toBe("APPLIED");
  });
});

describe("deleteApplication", () => {
  it("deletes application and invalidates cache", async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue(MOCK_APPLICATION as any);
    vi.mocked(prisma.application.delete).mockResolvedValue(MOCK_APPLICATION as any);

    const res = await deleteApplication("app-1", "user-1");

    expect(prisma.application.delete).toHaveBeenCalledWith({ where: { id: "app-1" } });
    expect(redis.del).toHaveBeenCalledWith("applications:stats:user-1");
    expect(res.message).toMatch(/deleted/i);
  });

  it("throws 404 if application to delete is not found", async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue(null);

    await expect(deleteApplication("app-1", "user-1")).rejects.toMatchObject({
      statusCode: 404,
      message: "Application not found",
    });
  });

  it("throws 403 if user tries to delete another user's application", async () => {
    vi.mocked(prisma.application.findUnique).mockResolvedValue(MOCK_APPLICATION as any);

    await expect(deleteApplication("app-1", "user-2")).rejects.toMatchObject({
      statusCode: 403,
      message: "Forbidden",
    });
  });
});

describe("getStats", () => {
  it("returns cached stats if available", async () => {
    const mockCached = { counts: {}, successRate: 0, avgTimeToInterviewDays: 0 };
    vi.mocked((redis as any).getJson).mockResolvedValue(mockCached);

    const stats = await getStats("user-1");

    expect(stats).toEqual(mockCached);
    expect(prisma.application.findMany).not.toHaveBeenCalled();
  });

  it("calculates stats correctly and caches if no cache", async () => {
    vi.mocked((redis as any).getJson).mockResolvedValue(null);

    const mockApp1 = {
      ...MOCK_APPLICATION,
      status: "INTERVIEW_SCHEDULED",
      timeline: JSON.stringify([
        { status: "SAVED", at: "2026-06-01T00:00:00.000Z" },
        { status: "APPLIED", at: "2026-06-02T00:00:00.000Z" },
        { status: "INTERVIEW_SCHEDULED", at: "2026-06-06T00:00:00.000Z" },
      ]),
    };
    const mockApp2 = {
      ...MOCK_APPLICATION,
      status: "OFFER_RECEIVED",
      timeline: JSON.stringify([
        { status: "APPLIED", at: "2026-06-01T00:00:00.000Z" },
        { status: "OFFER_RECEIVED", at: "2026-06-10T00:00:00.000Z" },
      ]),
    };

    vi.mocked(prisma.application.findMany).mockResolvedValue([mockApp1, mockApp2] as any);

    const stats = await getStats("user-1");

    expect(stats.counts.INTERVIEW_SCHEDULED).toBe(1);
    expect(stats.counts.OFFER_RECEIVED).toBe(1);
    // Success rate: percentage of non-saved (2 apps) that reached OFFER_RECEIVED (1 app) = 50%
    expect(stats.successRate).toBe(50);
    // Avg time to interview: only mockApp1 has APPLIED + INTERVIEW_SCHEDULED
    // Delta: 2026-06-06 to 2026-06-02 = 4 days
    expect(stats.avgTimeToInterviewDays).toBe(4);

    expect((redis as any).setJson).toHaveBeenCalledWith(
      "applications:stats:user-1",
      expect.any(Object),
      300
    );
  });

  it("handles malformed timeline JSON in stats calculation gracefully", async () => {
    vi.mocked((redis as any).getJson).mockResolvedValue(null);
    const mockAppBad = {
      ...MOCK_APPLICATION,
      status: "INTERVIEW_SCHEDULED",
      timeline: "bad-json",
    };
    vi.mocked(prisma.application.findMany).mockResolvedValue([mockAppBad] as any);

    const stats = await getStats("user-1");
    expect(stats.counts.INTERVIEW_SCHEDULED).toBe(1);
    expect(stats.avgTimeToInterviewDays).toBe(0);
  });
});

