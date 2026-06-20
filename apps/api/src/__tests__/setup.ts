import { vi } from "vitest";

// Stub env vars before any module imports
process.env.JWT_SECRET_KEY = "test-secret-key-min-32-chars-long!!";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.API_PORT = "4001";

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

// Mock redis service globally
vi.mock("../services/redis.service", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
    ping: vi.fn().mockResolvedValue(true),
    connect: vi.fn().mockResolvedValue(undefined),
  },
}));
