import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@axiom/database";
import axios from "axios";

vi.mock("@axiom/database", () => ({
  prisma: {
    resume: { findUnique: vi.fn() },
    user:   { update:     vi.fn() },
  },
}));

vi.mock("axios", () => {
  const instance = {
    get:  vi.fn(),
    post: vi.fn(),
  };
  return {
    default: {
      create: vi.fn().mockReturnValue(instance),
    },
    _instance: instance,
  };
});

vi.mock("../utils/logger", () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

// Grab the axios instance after module mock is set
import * as axiosMod from "axios";
// The mock sets up a singleton returned by axios.create()
const axiosInstance = (axiosMod.default as any).create() as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };

import { getTargetRoles, analyzeSkillGap } from "../services/skill.service";

const MOCK_ROLES = [
  { id: "swe", label: "Software Engineer", description: "Build software" },
  { id: "ml",  label: "ML Engineer",       description: "Build models"  },
];

const MOCK_RESUME = {
  id: "resume-1",
  userId: "user-1",
  parsedData: { skills: ["Python", "TypeScript"], experience: [] },
};

const MOCK_GAP_REPORT = {
  roleId: "swe",
  roleLabel: "Software Engineer",
  version: "1.0",
  matched: { must_have: ["TypeScript"] },
  missing: { must_have: ["Go"] },
  recommendations: [{ skill: "Go", tier: "must_have", tierLabel: "Must Have", priority: 1 }],
  summary: {
    total: 5, matchedCount: 1, missingCount: 4,
    readinessPct: 20, mustHaveGap: 4, skillsAway: 4,
  },
};

beforeEach(() => vi.clearAllMocks());

// ── getTargetRoles ────────────────────────────────────────────────────────────

describe("getTargetRoles", () => {
  it("returns target roles from AI service", async () => {
    axiosInstance.get.mockResolvedValue({ data: { roles: MOCK_ROLES } });

    const result = await getTargetRoles();

    expect(axiosInstance.get).toHaveBeenCalledWith("/api/skills/target-roles");
    expect(result).toEqual(MOCK_ROLES);
  });

  it("propagates AI service errors", async () => {
    axiosInstance.get.mockRejectedValue(new Error("Connection refused"));
    await expect(getTargetRoles()).rejects.toThrow("Connection refused");
  });
});

// ── analyzeSkillGap ───────────────────────────────────────────────────────────

describe("analyzeSkillGap", () => {
  it("calls AI with parsed resume data and persists the report", async () => {
    vi.mocked(prisma.resume.findUnique).mockResolvedValue(MOCK_RESUME as never);
    axiosInstance.post.mockResolvedValue({ data: { success: true, data: MOCK_GAP_REPORT } });
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);

    const result = await analyzeSkillGap("user-1", "resume-1", "swe");

    expect(axiosInstance.post).toHaveBeenCalledWith(
      "/api/skills/gap",
      expect.objectContaining({
        parsed_data: MOCK_RESUME.parsedData,
        role_id: "swe",
      })
    );
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: { latestGapReport: MOCK_GAP_REPORT },
      })
    );
    expect(result).toEqual(MOCK_GAP_REPORT);
  });

  it("throws 404 when resume does not exist", async () => {
    vi.mocked(prisma.resume.findUnique).mockResolvedValue(null);
    await expect(analyzeSkillGap("user-1", "resume-1", "swe")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("throws 403 when user is not the resume owner", async () => {
    vi.mocked(prisma.resume.findUnique).mockResolvedValue(MOCK_RESUME as never);
    await expect(analyzeSkillGap("user-99", "resume-1", "swe")).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("throws 422 when resume has not been parsed yet", async () => {
    vi.mocked(prisma.resume.findUnique).mockResolvedValue({ ...MOCK_RESUME, parsedData: null } as never);
    await expect(analyzeSkillGap("user-1", "resume-1", "swe")).rejects.toMatchObject({
      statusCode: 422,
    });
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it("throws 503 when the AI service call fails", async () => {
    vi.mocked(prisma.resume.findUnique).mockResolvedValue(MOCK_RESUME as never);
    axiosInstance.post.mockRejectedValue(new Error("Timeout"));

    await expect(analyzeSkillGap("user-1", "resume-1", "swe")).rejects.toMatchObject({
      statusCode: 503,
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
