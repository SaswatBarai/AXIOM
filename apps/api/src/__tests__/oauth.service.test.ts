import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { AppError } from "../middleware/errorHandler.middleware";

vi.mock("axios");
vi.mock("../services/redis.service", () => ({
  redis: {
    set: vi.fn().mockResolvedValue("OK"),
    getdel: vi.fn(),
  },
}));

vi.mock("@axiom/database", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("../utils/jwt", () => ({
  signAccessToken: vi.fn(() => "access-token"),
  signRefreshToken: vi.fn(() => "refresh-token"),
}));

import { prisma } from "@axiom/database";
import { redis } from "../services/redis.service";
import {
  createOAuthState,
  consumeOAuthState,
  findOrCreateOAuthUser,
  exchangeGoogleCode,
  getGoogleAuthUrl,
  isOAuthConfigured,
} from "../services/oauth.service";

const profile = {
  providerId: "google-123",
  email: "user@example.com",
  name: "Test User",
  avatarUrl: "https://example.com/avatar.png",
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.GOOGLE_CLIENT_ID = "google-client-id";
  process.env.GOOGLE_CLIENT_SECRET = "google-client-secret";
  process.env.API_PUBLIC_URL = "http://localhost:4000";
});

describe("isOAuthConfigured", () => {
  it("returns true when Google env vars are set", () => {
    expect(isOAuthConfigured("google")).toBe(true);
  });

  it("returns false when Google env vars are missing", () => {
    delete process.env.GOOGLE_CLIENT_ID;
    expect(isOAuthConfigured("google")).toBe(false);
  });
});

describe("createOAuthState / consumeOAuthState", () => {
  it("stores and consumes OAuth state", async () => {
    vi.mocked(redis.getdel).mockResolvedValue(
      JSON.stringify({ provider: "google", returnTo: "/dashboard" }),
    );

    const state = await createOAuthState("google", "/dashboard");
    expect(state).toHaveLength(64);
    expect(redis.set).toHaveBeenCalled();

    const returnTo = await consumeOAuthState(state, "google");
    expect(returnTo).toBe("/dashboard");
  });

  it("throws when state is missing", async () => {
    vi.mocked(redis.getdel).mockResolvedValue(null);
    await expect(consumeOAuthState("bad-state", "google")).rejects.toThrow(AppError);
  });
});

describe("getGoogleAuthUrl", () => {
  it("builds a Google authorization URL", () => {
    const url = getGoogleAuthUrl("state-abc");
    expect(url).toContain("accounts.google.com");
    expect(url).toContain("client_id=google-client-id");
    expect(url).toContain("state=state-abc");
    expect(url).toContain(encodeURIComponent("http://localhost:4000/api/auth/google/callback"));
  });
});

describe("exchangeGoogleCode", () => {
  it("returns normalized profile from Google APIs", async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { access_token: "google-access" } });
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        sub: "google-123",
        email: "user@example.com",
        email_verified: true,
        name: "Test User",
        picture: "https://example.com/avatar.png",
      },
    });

    const result = await exchangeGoogleCode("auth-code");
    expect(result).toEqual(profile);
  });
});

describe("findOrCreateOAuthUser", () => {
  it("syncs avatar and profile when user already exists by provider id", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: "u1",
      email: "user@example.com",
      name: "Old Name",
      role: "USER",
      avatarUrl: null,
      suspendedAt: null,
    } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: "u1",
      email: "user@example.com",
      name: "Test User",
      role: "USER",
      avatarUrl: "https://example.com/avatar.png",
      suspendedAt: null,
    } as never);

    const user = await findOrCreateOAuthUser("google", profile);
    expect(user.id).toBe("u1");
    expect(user.avatarUrl).toBe("https://example.com/avatar.png");
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u1" },
        data: expect.objectContaining({
          avatarUrl: "https://example.com/avatar.png",
          name: "Test User",
          emailVerified: true,
        }),
      }),
    );
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("links provider to existing email account", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u2",
      email: "user@example.com",
      name: "Test User",
      role: "USER",
      avatarUrl: null,
      suspendedAt: null,
      googleId: null,
      githubId: null,
    } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: "u2",
      email: "user@example.com",
      name: "Test User",
      role: "USER",
      avatarUrl: null,
      suspendedAt: null,
    } as never);

    const user = await findOrCreateOAuthUser("google", profile);
    expect(user.id).toBe("u2");
    expect(prisma.user.update).toHaveBeenCalled();
  });

  it("creates a new OAuth user when no match exists", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "u3",
      email: "user@example.com",
      name: "Test User",
      role: "USER",
      avatarUrl: null,
      suspendedAt: null,
    } as never);

    const user = await findOrCreateOAuthUser("google", profile);
    expect(user.id).toBe("u3");
    expect(prisma.user.create).toHaveBeenCalled();
  });
});
