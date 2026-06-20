import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { type Application } from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import authRoutes from "../routes/auth.routes";
import { errorHandler, AppError } from "../middleware/errorHandler.middleware";

// Mock the entire auth service at the route level
vi.mock("../services/auth.service", () => ({
  register:        vi.fn(),
  verifyEmail:     vi.fn(),
  login:           vi.fn(),
  refresh:         vi.fn(),
  logout:          vi.fn(),
  forgotPassword:  vi.fn(),
  resetPassword:   vi.fn(),
}));

import * as authService from "../services/auth.service";

function buildApp(): Application {
  const app = express();
  app.use(helmet());
  app.use(rateLimit({ windowMs: 60_000, max: 1000 })); // relaxed for tests
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use(errorHandler);
  return app;
}

const app = buildApp();

beforeEach(() => vi.clearAllMocks());

// ── POST /api/auth/register ───────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  it("201 with valid body", async () => {
    vi.mocked(authService.register).mockResolvedValue({
      message: "Account created. Check your email for the verification code.",
      userId: "u1",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "P@ssw0rd!",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/verification code/i);
  });

  it("422 when email is missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test",
      password: "P@ssw0rd!",
    });
    expect(res.status).toBe(422);
  });

  it("422 when password is too short", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test",
      email: "test@example.com",
      password: "short",
    });
    expect(res.status).toBe(422);
  });

  it("409 when email already exists", async () => {
    vi.mocked(authService.register).mockRejectedValue(new AppError(409, "Email already in use"));

    const res = await request(app).post("/api/auth/register").send({
      name: "Test",
      email: "dupe@example.com",
      password: "P@ssw0rd!",
    });
    expect(res.status).toBe(409);
  });
});

// ── POST /api/auth/verify-email ───────────────────────────────────────────────

describe("POST /api/auth/verify-email", () => {
  it("200 with valid OTP", async () => {
    vi.mocked(authService.verifyEmail).mockResolvedValue({ message: "Email verified successfully" });

    const res = await request(app).post("/api/auth/verify-email").send({
      email: "test@example.com",
      otp: "123456",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/verified/i);
  });

  it("422 when OTP is not 6 digits", async () => {
    const res = await request(app).post("/api/auth/verify-email").send({
      email: "test@example.com",
      otp: "12",
    });
    expect(res.status).toBe(422);
  });

  it("400 for wrong OTP", async () => {
    vi.mocked(authService.verifyEmail).mockRejectedValue(new AppError(400, "Invalid or expired OTP"));

    const res = await request(app).post("/api/auth/verify-email").send({
      email: "test@example.com",
      otp: "000000",
    });
    expect(res.status).toBe(400);
  });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  it("200 returns tokens on valid credentials", async () => {
    vi.mocked(authService.login).mockResolvedValue({
      accessToken: "access.token",
      refreshToken: "refresh.token",
      user: { id: "u1", email: "test@example.com", name: "Test", role: "USER", avatarUrl: null },
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "P@ssw0rd!",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
  });

  it("422 when email is invalid", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "not-an-email",
      password: "P@ssw0rd!",
    });
    expect(res.status).toBe(422);
  });

  it("401 for wrong credentials", async () => {
    vi.mocked(authService.login).mockRejectedValue(new AppError(401, "Invalid credentials"));

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });
});

// ── POST /api/auth/refresh ────────────────────────────────────────────────────

describe("POST /api/auth/refresh", () => {
  it("200 returns new tokens", async () => {
    vi.mocked(authService.refresh).mockResolvedValue({
      accessToken: "new.access",
      refreshToken: "new.refresh",
    });

    const res = await request(app).post("/api/auth/refresh").send({
      refreshToken: "some.refresh.token",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
  });

  it("401 for revoked token", async () => {
    vi.mocked(authService.refresh).mockRejectedValue(new AppError(401, "Refresh token revoked"));

    const res = await request(app).post("/api/auth/refresh").send({
      refreshToken: "old.token",
    });
    expect(res.status).toBe(401);
  });
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────────

describe("POST /api/auth/forgot-password", () => {
  it("200 always (enumeration guard)", async () => {
    vi.mocked(authService.forgotPassword).mockResolvedValue({
      message: "If that email exists, a reset code was sent.",
    });

    const res = await request(app).post("/api/auth/forgot-password").send({
      email: "any@example.com",
    });

    expect(res.status).toBe(200);
  });
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────

describe("POST /api/auth/reset-password", () => {
  it("200 on valid OTP + new password", async () => {
    vi.mocked(authService.resetPassword).mockResolvedValue({ message: "Password reset successfully" });

    const res = await request(app).post("/api/auth/reset-password").send({
      email: "test@example.com",
      otp: "654321",
      newPassword: "NewP@ss1!",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reset successfully/i);
  });

  it("422 when newPassword is too short", async () => {
    const res = await request(app).post("/api/auth/reset-password").send({
      email: "test@example.com",
      otp: "654321",
      newPassword: "short",
    });
    expect(res.status).toBe(422);
  });
});
