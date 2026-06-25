import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@axiom/database";
import bcrypt from "bcryptjs";

vi.mock("@axiom/database", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update:     vi.fn(),
      delete:     vi.fn(),
      findMany:   vi.fn(),
      count:      vi.fn(),
    },
    resume: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    userPreferences: {
      findUnique: vi.fn(),
      create:     vi.fn(),
      upsert:     vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash:    vi.fn().mockResolvedValue("$2a$10$newhash"),
  },
}));

import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  exportData,
  getPreferences,
  updatePreferences,
  listUsers,
  changeRole,
} from "../services/user.service";

const MOCK_USER = {
  id: "user-1",
  email: "test@example.com",
  name: "Alice",
  role: "USER" as const,
  avatarUrl: "https://cdn.example.com/avatar.png",
  bio: "Engineer",
  location: "NYC",
  linkedinUrl: null,
  githubUrl: null,
  portfolioUrl: null,
  currentTitle: "Software Engineer",
  yearsOfExp: 3,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => vi.clearAllMocks());

// ── getProfile ────────────────────────────────────────────────────────────────

describe("getProfile", () => {
  it("returns user with profileCompletionPct", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(MOCK_USER as never);

    const result = await getProfile("user-1");

    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "user-1" } })
    );
    expect(result).toHaveProperty("profileCompletionPct");
    expect(typeof result.profileCompletionPct).toBe("number");
  });

  it("returns 0% completion when all optional fields are null", async () => {
    const sparse = {
      ...MOCK_USER,
      name: null, avatarUrl: null, bio: null, location: null,
      currentTitle: null, linkedinUrl: null, yearsOfExp: null,
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(sparse as never);

    const result = await getProfile("user-1");

    expect(result.profileCompletionPct).toBe(0);
  });

  it("returns 100% completion when all profile fields are filled", async () => {
    const full = {
      ...MOCK_USER,
      name: "Alice", avatarUrl: "url", bio: "bio", location: "NYC",
      currentTitle: "SWE", linkedinUrl: "https://li.co/alice", yearsOfExp: 3,
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(full as never);

    const result = await getProfile("user-1");

    expect(result.profileCompletionPct).toBe(100);
  });

  it("throws 404 when user does not exist", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    await expect(getProfile("missing")).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ── updateProfile ─────────────────────────────────────────────────────────────

describe("updateProfile", () => {
  it("updates and returns user with completion percentage", async () => {
    vi.mocked(prisma.user.update).mockResolvedValue({ ...MOCK_USER, bio: "Updated bio" } as never);

    const result = await updateProfile("user-1", { bio: "Updated bio" });

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "user-1" }, data: { bio: "Updated bio" } })
    );
    expect(result).toHaveProperty("profileCompletionPct");
  });
});

// ── changePassword ────────────────────────────────────────────────────────────

describe("changePassword", () => {
  it("changes password when current password is correct", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ password: "$2a$10$oldhash" } as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(prisma.user.update).mockResolvedValue(MOCK_USER as never);

    const result = await changePassword("user-1", {
      currentPassword: "OldPass123!",
      newPassword: "NewPass456!",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("NewPass456!", 10);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { password: "$2a$10$newhash" } })
    );
    expect(result.message).toMatch(/changed/i);
  });

  it("throws 401 when current password is incorrect", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ password: "$2a$10$oldhash" } as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      changePassword("user-1", { currentPassword: "wrong", newPassword: "NewPass456!" })
    ).rejects.toMatchObject({ statusCode: 401 });

    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("throws 400 when account has no password (OAuth-only user)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ password: null } as never);

    await expect(
      changePassword("user-1", { currentPassword: "any", newPassword: "NewPass456!" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

// ── deleteAccount ─────────────────────────────────────────────────────────────

describe("deleteAccount", () => {
  it("deletes user and returns success message", async () => {
    vi.mocked(prisma.user.delete).mockResolvedValue(MOCK_USER as never);

    const result = await deleteAccount("user-1");

    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "user-1" } });
    expect(result.message).toMatch(/deleted/i);
  });
});

// ── exportData ────────────────────────────────────────────────────────────────

describe("exportData", () => {
  it("returns data without sensitive credential fields", async () => {
    const full = {
      ...MOCK_USER,
      password: "$2a$10$hash",
      googleId: "google-id-123",
      preferences: null,
      resumes: [],
      applications: [],
      chatHistory: [],
      roadmaps: [],
    };
    vi.mocked(prisma.user.findUnique).mockResolvedValue(full as never);

    const result = await exportData("user-1");

    expect(result).not.toHaveProperty("password");
    expect(result).not.toHaveProperty("googleId");
    expect(result).not.toHaveProperty("chatHistory");
    expect(result).toHaveProperty("email");
  });

  it("throws 404 when user does not exist", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    await expect(exportData("missing")).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ── getPreferences ────────────────────────────────────────────────────────────

describe("getPreferences", () => {
  const MOCK_PREFS = { id: "pref-1", userId: "user-1", theme: "dark" };

  it("returns existing preferences", async () => {
    vi.mocked(prisma.userPreferences.findUnique).mockResolvedValue(MOCK_PREFS as never);

    const result = await getPreferences("user-1");

    expect(result).toEqual(MOCK_PREFS);
    expect(prisma.userPreferences.create).not.toHaveBeenCalled();
  });

  it("creates default preferences when none exist", async () => {
    vi.mocked(prisma.userPreferences.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.userPreferences.create).mockResolvedValue({ userId: "user-1" } as never);

    await getPreferences("user-1");

    expect(prisma.userPreferences.create).toHaveBeenCalledWith({ data: { userId: "user-1" } });
  });
});

// ── updatePreferences ─────────────────────────────────────────────────────────

describe("updatePreferences", () => {
  it("upserts preferences and returns result", async () => {
    const prefs = { userId: "user-1", emailNotifications: false };
    vi.mocked(prisma.userPreferences.upsert).mockResolvedValue(prefs as never);

    const result = await updatePreferences("user-1", { emailNotifications: false } as never);

    expect(prisma.userPreferences.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        update: { emailNotifications: false },
        create: expect.objectContaining({ userId: "user-1" }),
      })
    );
    expect(result).toEqual(prefs);
  });
});

// ── listUsers ─────────────────────────────────────────────────────────────────

describe("listUsers", () => {
  it("returns paginated users with totalPages", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([MOCK_USER] as never);
    vi.mocked(prisma.user.count).mockResolvedValue(25);

    const result = await listUsers(2, 10);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
    expect(result.total).toBe(25);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(2);
    expect(result.users[0]).toHaveProperty("profileCompletionPct");
  });
});

// ── changeRole ────────────────────────────────────────────────────────────────

describe("changeRole", () => {
  it("updates user role and returns updated record", async () => {
    const updated = { id: "user-1", email: "test@example.com", name: "Alice", role: "ADMIN" };
    vi.mocked(prisma.user.update).mockResolvedValue(updated as never);

    const result = await changeRole("user-1", "ADMIN");

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "user-1" }, data: { role: "ADMIN" } })
    );
    expect(result.role).toBe("ADMIN");
  });
});
