import { vi } from "vitest";

// Stub env vars before any module imports
process.env.JWT_SECRET_KEY = "test-secret-key-min-32-chars-long!!";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key-min-32-chars-long!!";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.API_PORT = "4001";
process.env.AWS_ACCESS_KEY_ID = "test-access-key";
process.env.AWS_SECRET_ACCESS_KEY = "test-secret-key";
process.env.AI_SERVICE_SECRET = "test-ai-secret";

// Mock @axiom/database globally
vi.mock("@axiom/database", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
  },
}));

// Bypass rate limiting in tests
vi.mock("express-rate-limit", () => ({
  rateLimit: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

// Mock redis service globally
vi.mock("../services/redis.service", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
    getdel: vi.fn(),
    ping: vi.fn().mockResolvedValue(true),
    connect: vi.fn().mockResolvedValue(undefined),
  },
}));
