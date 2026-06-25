import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { type Application } from "express";
import chatRoutes from "../routes/chat.routes";
import { errorHandler, AppError } from "../middleware/errorHandler.middleware";

vi.mock("../services/chat.service", () => ({
  streamChatToClient: vi.fn(),
  listSessions: vi.fn(),
  deleteSession: vi.fn(),
  getSessionHistory: vi.fn(),
}));

vi.mock("../middleware/rateLimit.middleware", () => ({
  planRateLimit: () => (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
  rateLimit:     () => (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
}));

vi.mock("../middleware/auth.middleware", () => ({
  requireAuth: (req: express.Request & { userId?: string; userRole?: string }, _res: express.Response, next: express.NextFunction) => {
    req.userId = "user-1";
    req.userRole = "USER";
    next();
  },
  requireActiveSubscription: (
    req: express.Request & { userId?: string; userRole?: string },
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    if ((req as { premiumAllowed?: boolean }).premiumAllowed === false) {
      return next(new AppError(403, "This feature requires an active Premium subscription", "PREMIUM_REQUIRED"));
    }
    next();
  },
  assertUserId: (req: express.Request & { userId?: string }) => req.userId!,
}));

import * as chatService from "../services/chat.service";

const MOCK_SESSIONS = [
  { sessionId: "sess-1", title: "Resume tips", updatedAt: new Date() },
  { sessionId: "sess-2", title: "Interview prep", updatedAt: new Date() },
];

const MOCK_HISTORY = [
  { role: "user",      content: "Help me improve my resume" },
  { role: "assistant", content: "Sure! Let's start with your summary section." },
];

function buildApp(): Application {
  const app = express();
  app.use(express.json());
  app.use("/api/chat", chatRoutes);
  app.use(errorHandler);
  return app;
}

const app = buildApp();

beforeEach(() => vi.clearAllMocks());

// ── POST /api/chat (stream) ────────────────────────────────────────────────────

describe("POST /api/chat", () => {
  it("403 — denied without active subscription", async () => {
    const deniedApp = express();
    deniedApp.use((req, _res, next) => {
      (req as { premiumAllowed?: boolean }).premiumAllowed = false;
      next();
    });
    deniedApp.use(express.json());
    deniedApp.use("/api/chat", chatRoutes);
    deniedApp.use(errorHandler);

    const res = await request(deniedApp).post("/api/chat").send({ message: "hi" });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("PREMIUM_REQUIRED");
    expect(chatService.streamChatToClient).not.toHaveBeenCalled();
  });

  it("200 — streams response", async () => {
    vi.mocked(chatService.streamChatToClient).mockImplementation(
      async (_userId, _sid, _msg, res) => {
        res.setHeader("Content-Type", "text/event-stream");
        res.write('data: {"type":"token","content":"Hello"}\n\n');
        res.write('data: {"type":"done"}\n\n');
        res.end();
      },
    );
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "How do I prep for an interview?" });
    expect(res.status).toBe(200);
    expect(chatService.streamChatToClient).toHaveBeenCalledWith(
      "user-1",
      undefined,
      "How do I prep for an interview?",
      expect.anything(),
      null,
      [],
    );
  });

  it("422 — empty message rejected by Zod", async () => {
    const res = await request(app).post("/api/chat").send({ message: "" });
    expect(res.status).toBe(422);
    expect(chatService.streamChatToClient).not.toHaveBeenCalled();
  });

  it("422 — missing message", async () => {
    const res = await request(app).post("/api/chat").send({});
    expect(res.status).toBe(422);
  });

  it("422 — invalid sessionId (not UUID)", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "hi", sessionId: "not-a-uuid" });
    expect(res.status).toBe(422);
  });

  it("429 — rate limit propagates", async () => {
    vi.mocked(chatService.streamChatToClient).mockRejectedValue(
      new AppError(429, "Rate limit reached"),
    );
    const res = await request(app).post("/api/chat").send({ message: "hi" });
    expect(res.status).toBe(429);
  });
});

// ── GET /api/chat/sessions ────────────────────────────────────────────────────

describe("GET /api/chat/sessions", () => {
  it("200 — returns session list", async () => {
    vi.mocked(chatService.listSessions).mockResolvedValue(MOCK_SESSIONS as never);
    const res = await request(app).get("/api/chat/sessions");
    expect(res.status).toBe(200);
    expect(res.body.sessions).toHaveLength(2);
    expect(res.body.sessions[0].sessionId).toBe("sess-1");
  });
});

// ── GET /api/chat/sessions/:sessionId ────────────────────────────────────────

describe("GET /api/chat/sessions/:sessionId", () => {
  it("200 — returns message history", async () => {
    vi.mocked(chatService.getSessionHistory).mockResolvedValue(MOCK_HISTORY as never);
    const res = await request(app).get("/api/chat/sessions/sess-1");
    expect(res.status).toBe(200);
    expect(res.body.messages).toHaveLength(2);
    expect(res.body.messages[0].role).toBe("user");
    expect(chatService.getSessionHistory).toHaveBeenCalledWith("user-1", "sess-1");
  });
});

// ── DELETE /api/chat/sessions/:sessionId ──────────────────────────────────────

describe("DELETE /api/chat/sessions/:sessionId", () => {
  it("200 — deletes session", async () => {
    vi.mocked(chatService.deleteSession).mockResolvedValue(undefined);
    const res = await request(app).delete("/api/chat/sessions/sess-1");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(chatService.deleteSession).toHaveBeenCalledWith("user-1", "sess-1");
  });
});
