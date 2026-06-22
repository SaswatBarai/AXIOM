import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@axiom/database";
import * as s3 from "../services/s3.service";
import * as aiService from "../services/ai.service";

vi.mock("@axiom/database", () => ({
  prisma: {
    resume: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("../services/s3.service", () => ({
  uploadToS3:    vi.fn().mockResolvedValue("https://s3.amazonaws.com/bucket/resumes/user-1/abc.pdf"),
  deleteFromS3:  vi.fn().mockResolvedValue(undefined),
  getPresignedUrl: vi.fn().mockResolvedValue("https://presigned.url/abc.pdf"),
  keyFromUrl:    vi.fn().mockReturnValue("resumes/user-1/abc.pdf"),
}));

vi.mock("../services/ai.service", () => ({
  parseResume:      vi.fn().mockResolvedValue(null),
  analyzeResumeATS: vi.fn().mockResolvedValue(null),
}));

vi.mock("../utils/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import {
  uploadResume,
  listResumes,
  getResume,
  deleteResume,
  analyzeResume,
} from "../services/resume.service";

const MOCK_RESUME = {
  id: "resume-1",
  userId: "user-1",
  fileName: "cv.pdf",
  fileUrl: "https://s3.amazonaws.com/bucket/resumes/user-1/abc.pdf",
  fileType: "pdf",
  version: 1,
  parsedData: null,
  atsScore: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const makePdfFile = (sizeBytes = 1024): Express.Multer.File =>
  ({
    fieldname: "resume",
    originalname: "cv.pdf",
    mimetype: "application/pdf",
    buffer: Buffer.alloc(sizeBytes),
    size: sizeBytes,
  } as Express.Multer.File);

beforeEach(() => vi.clearAllMocks());

// ── uploadResume ──────────────────────────────────────────────────────────────

describe("uploadResume", () => {
  it("uploads a PDF and creates a resume record", async () => {
    vi.mocked(prisma.resume.count).mockResolvedValue(0);
    vi.mocked(prisma.resume.create).mockResolvedValue(MOCK_RESUME as never);

    const result = await uploadResume("user-1", makePdfFile());

    expect(s3.uploadToS3).toHaveBeenCalledOnce();
    expect(prisma.resume.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user-1", fileType: "pdf", version: 1 }),
      })
    );
    expect(result).toMatchObject({ userId: "user-1", fileType: "pdf" });
  });

  it("increments version based on existing resume count", async () => {
    vi.mocked(prisma.resume.count).mockResolvedValue(3);
    vi.mocked(prisma.resume.create).mockResolvedValue({ ...MOCK_RESUME, version: 4 } as never);

    await uploadResume("user-1", makePdfFile());

    expect(prisma.resume.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ version: 4 }) })
    );
  });

  it("throws 415 for a non-PDF/DOCX MIME type", async () => {
    const file = { ...makePdfFile(), mimetype: "image/png" } as Express.Multer.File;
    await expect(uploadResume("user-1", file)).rejects.toMatchObject({ statusCode: 415 });
    expect(s3.uploadToS3).not.toHaveBeenCalled();
  });

  it("throws 413 when file exceeds 5 MB", async () => {
    const file = makePdfFile(6 * 1024 * 1024);
    await expect(uploadResume("user-1", file)).rejects.toMatchObject({ statusCode: 413 });
    expect(s3.uploadToS3).not.toHaveBeenCalled();
  });

  it("accepts DOCX files and sets correct extension", async () => {
    const docx = {
      ...makePdfFile(),
      mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      originalname: "cv.docx",
    } as Express.Multer.File;
    vi.mocked(prisma.resume.count).mockResolvedValue(0);
    vi.mocked(prisma.resume.create).mockResolvedValue({ ...MOCK_RESUME, fileType: "docx" } as never);

    await uploadResume("user-1", docx);

    expect(prisma.resume.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ fileType: "docx" }) })
    );
  });
});

// ── listResumes ───────────────────────────────────────────────────────────────

describe("listResumes", () => {
  it("returns all resumes with presigned download URLs", async () => {
    vi.mocked(prisma.resume.findMany).mockResolvedValue([MOCK_RESUME] as never);

    const results = await listResumes("user-1");

    expect(prisma.resume.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" }, orderBy: { createdAt: "desc" } })
    );
    expect(s3.getPresignedUrl).toHaveBeenCalledOnce();
    expect(results[0]).toHaveProperty("downloadUrl");
  });

  it("returns empty array when user has no resumes", async () => {
    vi.mocked(prisma.resume.findMany).mockResolvedValue([]);
    const results = await listResumes("user-1");
    expect(results).toHaveLength(0);
  });
});

// ── getResume ─────────────────────────────────────────────────────────────────

describe("getResume", () => {
  it("returns resume with presigned URL for the owner", async () => {
    vi.mocked(prisma.resume.findUnique).mockResolvedValue(MOCK_RESUME as never);

    const result = await getResume("resume-1", "user-1");

    expect(s3.getPresignedUrl).toHaveBeenCalledOnce();
    expect(result).toHaveProperty("downloadUrl");
  });

  it("throws 404 when resume does not exist", async () => {
    vi.mocked(prisma.resume.findUnique).mockResolvedValue(null);
    await expect(getResume("resume-1", "user-1")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("throws 403 when user is not the owner", async () => {
    vi.mocked(prisma.resume.findUnique).mockResolvedValue(MOCK_RESUME as never);
    await expect(getResume("resume-1", "user-99")).rejects.toMatchObject({ statusCode: 403 });
  });
});

// ── deleteResume ──────────────────────────────────────────────────────────────

describe("deleteResume", () => {
  it("deletes from S3 and DB atomically", async () => {
    vi.mocked(prisma.resume.findUnique).mockResolvedValue(MOCK_RESUME as never);
    vi.mocked(prisma.resume.delete).mockResolvedValue(MOCK_RESUME as never);

    const result = await deleteResume("resume-1", "user-1");

    expect(s3.deleteFromS3).toHaveBeenCalledOnce();
    expect(prisma.resume.delete).toHaveBeenCalledWith({ where: { id: "resume-1" } });
    expect(result.message).toMatch(/deleted/i);
  });

  it("throws 404 when resume not found", async () => {
    vi.mocked(prisma.resume.findUnique).mockResolvedValue(null);
    await expect(deleteResume("resume-1", "user-1")).rejects.toMatchObject({ statusCode: 404 });
    expect(s3.deleteFromS3).not.toHaveBeenCalled();
  });

  it("throws 403 when user is not the owner", async () => {
    vi.mocked(prisma.resume.findUnique).mockResolvedValue(MOCK_RESUME as never);
    await expect(deleteResume("resume-1", "user-99")).rejects.toMatchObject({ statusCode: 403 });
    expect(s3.deleteFromS3).not.toHaveBeenCalled();
  });
});

// ── analyzeResume ─────────────────────────────────────────────────────────────

describe("analyzeResume", () => {
  const parsedResume = { skills: ["TypeScript"], experience: [] };
  const mockScore = { overall: 82, keyword: 90, completeness: 75, readability: 80, formatting: 85 };

  it("returns ATS score and persists it", async () => {
    vi.mocked(prisma.resume.findUnique).mockResolvedValue({
      ...MOCK_RESUME,
      parsedData: parsedResume,
    } as never);
    vi.mocked(aiService.analyzeResumeATS).mockResolvedValue(mockScore as never);
    vi.mocked(prisma.resume.update).mockResolvedValue({ ...MOCK_RESUME, atsScore: mockScore } as never);

    const result = await analyzeResume("resume-1", "user-1", "We need a TypeScript engineer");

    expect(aiService.analyzeResumeATS).toHaveBeenCalledOnce();
    expect(prisma.resume.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "resume-1" }, data: { atsScore: mockScore } })
    );
    expect(result).toMatchObject({ atsScore: mockScore });
  });

  it("throws 404 when resume not found", async () => {
    vi.mocked(prisma.resume.findUnique).mockResolvedValue(null);
    await expect(analyzeResume("resume-1", "user-1", "jd")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("throws 403 when user is not the owner", async () => {
    vi.mocked(prisma.resume.findUnique).mockResolvedValue(MOCK_RESUME as never);
    await expect(analyzeResume("resume-1", "user-99", "jd")).rejects.toMatchObject({ statusCode: 403 });
  });

  it("throws 422 when resume has not been parsed yet", async () => {
    vi.mocked(prisma.resume.findUnique).mockResolvedValue({ ...MOCK_RESUME, parsedData: null } as never);
    await expect(analyzeResume("resume-1", "user-1", "jd")).rejects.toMatchObject({ statusCode: 422 });
    expect(aiService.analyzeResumeATS).not.toHaveBeenCalled();
  });

  it("throws 503 when AI service returns null", async () => {
    vi.mocked(prisma.resume.findUnique).mockResolvedValue({
      ...MOCK_RESUME,
      parsedData: parsedResume,
    } as never);
    vi.mocked(aiService.analyzeResumeATS).mockResolvedValue(null);

    await expect(analyzeResume("resume-1", "user-1", "jd")).rejects.toMatchObject({ statusCode: 503 });
    expect(prisma.resume.update).not.toHaveBeenCalled();
  });
});
