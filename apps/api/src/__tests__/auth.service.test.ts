import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { prisma } from "@axiom/database";
import { redis } from "../services/redis.service";
import * as jwt from "../utils/jwt";

// Import after mocks are registered via setup.ts
import {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
} from "../services/auth.service";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  password: "$2b$10$hashedpassword",
  role: "USER",
  emailVerified: true,
  avatarUrl: null,
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── register ──────────────────────────────────────────────────────────────────

describe("register", () => {
  it("creates a new user and stores OTP in redis", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser as never);

    const result = await register({ name: "Test", email: "test@example.com", password: "P@ssw0rd!" });

    expect(prisma.user.create).toHaveBeenCalledOnce();
    expect(redis.set).toHaveBeenCalledOnce();
    expect(result.message).toMatch(/verification code/i);
  });

  it("throws 409 if email already in use", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

    await expect(
      register({ name: "Test", email: "test@example.com", password: "P@ssw0rd!" })
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});

// ── verifyEmail ───────────────────────────────────────────────────────────────

describe("verifyEmail", () => {
  it("verifies email and removes OTP from redis", async () => {
    vi.mocked(redis.get).mockResolvedValue("123456");
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser as never);

    const result = await verifyEmail({ email: "test@example.com", otp: "123456" });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      data: { emailVerified: true },
    });
    expect(redis.del).toHaveBeenCalledOnce();
    expect(result.message).toMatch(/verified/i);
  });

  it("throws 400 for invalid OTP", async () => {
    vi.mocked(redis.get).mockResolvedValue("123456");

    await expect(
      verifyEmail({ email: "test@example.com", otp: "000000" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("throws 400 when OTP has expired (null in redis)", async () => {
    vi.mocked(redis.get).mockResolvedValue(null);

    await expect(
      verifyEmail({ email: "test@example.com", otp: "123456" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

// ── login ─────────────────────────────────────────────────────────────────────

describe("login", () => {
  it("returns tokens for valid credentials", async () => {
    const hashed = await bcrypt.hash("P@ssw0rd!", 10);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...mockUser,
      password: hashed,
      emailVerified: true,
    } as never);

    const result = await login({ email: "test@example.com", password: "P@ssw0rd!" });

    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
    expect(result.user.email).toBe("test@example.com");
    expect(redis.set).toHaveBeenCalledOnce();
  });

  it("throws 401 for wrong password", async () => {
    const hashed = await bcrypt.hash("P@ssw0rd!", 10);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...mockUser,
      password: hashed,
      emailVerified: true,
    } as never);

    await expect(
      login({ email: "test@example.com", password: "WrongPassword!" })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("throws 401 when user does not exist", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(
      login({ email: "nobody@example.com", password: "P@ssw0rd!" })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("throws 403 when email not verified", async () => {
    const hashed = await bcrypt.hash("P@ssw0rd!", 10);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...mockUser,
      password: hashed,
      emailVerified: false,
    } as never);

    await expect(
      login({ email: "test@example.com", password: "P@ssw0rd!" })
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});

// ── refresh ───────────────────────────────────────────────────────────────────

describe("refresh", () => {
  it("rotates refresh token and returns new tokens", async () => {
    const token = jwt.signRefreshToken("user-1");
    vi.mocked(redis.get).mockResolvedValue(token);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user-1", role: "USER" } as never);

    const result = await refresh(token);

    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
    expect(redis.set).toHaveBeenCalledOnce();
  });

  it("throws 401 for revoked token (not in redis)", async () => {
    const token = jwt.signRefreshToken("user-1");
    vi.mocked(redis.get).mockResolvedValue(null);

    await expect(refresh(token)).rejects.toMatchObject({ statusCode: 401 });
  });

  it("throws 401 for malformed token", async () => {
    await expect(refresh("bad.token.here")).rejects.toMatchObject({ statusCode: 401 });
  });
});

// ── logout ────────────────────────────────────────────────────────────────────

describe("logout", () => {
  it("deletes refresh token and blacklists access token", async () => {
    const accessToken = jwt.signAccessToken("user-1", "USER");

    const result = await logout("user-1", accessToken);

    expect(redis.del).toHaveBeenCalledOnce();
    expect(redis.set).toHaveBeenCalledOnce(); // blacklist
    expect(result.message).toMatch(/logged out/i);
  });
});

// ── forgotPassword ────────────────────────────────────────────────────────────

describe("forgotPassword", () => {
  it("stores OTP when user exists", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

    const result = await forgotPassword({ email: "test@example.com" });

    expect(redis.set).toHaveBeenCalledOnce();
    expect(result.message).toMatch(/reset code/i);
  });

  it("returns same message when user does not exist (prevents enumeration)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const result = await forgotPassword({ email: "ghost@example.com" });

    expect(redis.set).not.toHaveBeenCalled();
    expect(result.message).toMatch(/reset code/i);
  });
});

// ── resetPassword ─────────────────────────────────────────────────────────────

describe("resetPassword", () => {
  it("resets password and clears OTP", async () => {
    vi.mocked(redis.get).mockResolvedValue("654321");
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser as never);

    const result = await resetPassword({
      email: "test@example.com",
      otp: "654321",
      newPassword: "NewP@ss1!",
    });

    expect(prisma.user.update).toHaveBeenCalledOnce();
    expect(redis.del).toHaveBeenCalledOnce();
    expect(result.message).toMatch(/reset successfully/i);
  });

  it("throws 400 for invalid OTP", async () => {
    vi.mocked(redis.get).mockResolvedValue("654321");

    await expect(
      resetPassword({ email: "test@example.com", otp: "000000", newPassword: "NewP@ss1!" })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
