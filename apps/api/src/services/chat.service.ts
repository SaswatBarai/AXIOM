import axios from "axios";
import { prisma } from "@axiom/database";
import { redis } from "./redis.service";
import { AppError } from "../middleware/errorHandler.middleware";
import { logger } from "../utils/logger";
import type { IncomingMessage } from "http";
import type { Response } from "express";

const AI_URL    = process.env.AI_SERVICE_URL    ?? "http://localhost:8000";
const AI_SECRET = process.env.AI_SERVICE_SECRET ?? "internal-secret";

// 20 msg/hour free tier; override with env var for pro
const HOURLY_QUOTA = process.env.NODE_ENV === "development"
  ? 1000
  : parseInt(process.env.CHAT_HOURLY_QUOTA ?? "20", 10);
const MAX_HISTORY  = 50;

const aiClient = axios.create({
  baseURL: AI_URL,
  timeout: 60_000,
  headers: { "x-internal-secret": AI_SECRET },
  responseType: "stream",
});

// ── Rate limiting ─────────────────────────────────────────────────────────────

async function checkAndIncrRateLimit(userId: string): Promise<void> {
  const key = `chat:rl:${userId}:${new Date().getUTCHours()}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 3600);
  if (count > HOURLY_QUOTA) {
    throw new AppError(429, `Chat rate limit reached (${HOURLY_QUOTA} messages/hour). Try again later.`);
  }
}

// ── Session history ───────────────────────────────────────────────────────────

export async function getSessionHistory(
  userId: string,
  sessionId: string,
): Promise<Array<{ role: string; content: string }>> {
  const messages = await prisma.chatMessage.findMany({
    where: { userId, sessionId },
    orderBy: { createdAt: "asc" },
    take: MAX_HISTORY,
  });
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

export async function listSessions(userId: string): Promise<Array<{ sessionId: string; title: string; updatedAt: Date }>> {
  const rows = await prisma.chatMessage.groupBy({
    by: ["sessionId"],
    where: { userId },
    _max: { createdAt: true },
    orderBy: { _max: { createdAt: "desc" } },
    take: 20,
  });

  return rows.map((r) => ({
    sessionId: r.sessionId,
    title: r.sessionId, // title stored in Redis cache; fallback to id
    updatedAt: r._max.createdAt ?? new Date(),
  }));
}

export async function deleteSession(userId: string, sessionId: string): Promise<void> {
  await prisma.chatMessage.deleteMany({ where: { userId, sessionId } });
}

// ── Persist message ───────────────────────────────────────────────────────────

async function persistMessage(userId: string, sessionId: string, role: string, content: string) {
  await prisma.chatMessage.create({ data: { userId, sessionId, role, content } });
  // Cap history at MAX_HISTORY by deleting oldest
  const count = await prisma.chatMessage.count({ where: { userId, sessionId } });
  if (count > MAX_HISTORY) {
    const oldest = await prisma.chatMessage.findFirst({
      where: { userId, sessionId },
      orderBy: { createdAt: "asc" },
    });
    if (oldest) await prisma.chatMessage.delete({ where: { id: oldest.id } });
  }
}

// ── Proxy SSE stream to client ────────────────────────────────────────────────

export async function streamChatToClient(
  userId: string,
  sessionId: string | undefined,
  message: string,
  res: Response,
  resumeParsed?: object | null,
  savedJobs?: object[],
): Promise<void> {
  await checkAndIncrRateLimit(userId);

  const history = sessionId ? await getSessionHistory(userId, sessionId) : [];
  const isNewSession = !sessionId;

  // Get resume parsed data if not provided
  let parsedData = resumeParsed ?? null;
  if (!parsedData) {
    const latestResume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    parsedData = (latestResume?.parsedData as object | null) ?? null;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  let aiSessionId = sessionId ?? "";
  let fullReply = "";

  try {
    const aiResponse = await aiClient.post("/api/chat/stream", {
      session_id: sessionId,
      message,
      history,
      resume_parsed: parsedData,
      saved_jobs: savedJobs ?? [],
      is_new_session: isNewSession,
    });

    const stream = aiResponse.data as IncomingMessage;

    await new Promise<void>((resolve, reject) => {
      stream.on("data", (chunk: Buffer) => {
        const raw = chunk.toString();
        for (const line of raw.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.type === "session_id") {
              aiSessionId = payload.session_id;
              res.write(`data: ${JSON.stringify({ type: "session_id", session_id: aiSessionId })}\n\n`);
            } else if (payload.type === "token") {
              fullReply += payload.content;
              res.write(`data: ${JSON.stringify({ type: "token", content: payload.content })}\n\n`);
            } else if (payload.type === "done" || payload.type === "error") {
              res.write(`data: ${JSON.stringify(payload)}\n\n`);
            }
          } catch { /* ignore malformed */ }
        }
      });
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    // Persist both turns after stream completes
    if (aiSessionId && fullReply) {
      await Promise.all([
        persistMessage(userId, aiSessionId, "user", message),
        persistMessage(userId, aiSessionId, "assistant", fullReply),
      ]);
    }
  } catch (err) {
    logger.error(`Chat proxy error: ${(err as Error).message}`);
    res.write(`data: ${JSON.stringify({ type: "error", message: "Chat service unavailable" })}\n\n`);
  } finally {
    res.end();
  }
}

// ── Session title via AI ──────────────────────────────────────────────────────

export async function generateSessionTitle(firstMessage: string): Promise<string> {
  try {
    const { data } = await axios.post(
      `${AI_URL}/api/chat/session-title`,
      { first_message: firstMessage },
      { headers: { "x-internal-secret": AI_SECRET }, timeout: 10_000 },
    );
    return data.title ?? firstMessage.slice(0, 60);
  } catch {
    return firstMessage.slice(0, 60);
  }
}
