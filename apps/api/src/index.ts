import "dotenv/config";
import http from "http";
import express, { type Application, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { v4 as uuid } from "uuid";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import resumeRoutes from "./routes/resume.routes";
import jobRoutes from "./routes/job.routes";
import applicationRoutes from "./routes/application.routes";
import skillRoutes from "./routes/skill.routes";
import chatRoutes from "./routes/chat.routes";
import coverLetterRoutes from "./routes/coverLetter.routes";
import { interviewRoutes }       from "./routes/interview.routes";
import { roadmapRoutes }         from "./routes/roadmap.routes";
import { analyticsRoutes }       from "./routes/analytics.routes";
import { notificationRoutes }    from "./routes/notification.routes";
import adminRoutes            from "./routes/admin.routes";
import { refreshMaterializedViews } from "./services/analytics.service";
import { scheduleWeeklyDigest }  from "./services/queue.service";
import { deleteStaleNotifications } from "./services/notification.service";
import { initSocketIO }          from "./lib/socket";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { prisma } from "@axiom/database";
import { redis } from "./services/redis.service";
import { logger } from "./utils/logger";

// ── Startup validation ──────────────────────────────────────
function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

requireEnv("JWT_SECRET_KEY");
requireEnv("AI_SERVICE_SECRET");

const app: Application = express();
const PORT = process.env.API_PORT ?? 4000;

// ── Request ID ──────────────────────────────────────────────
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.id = req.headers["x-request-id"] as string || uuid();
  next();
});

// ── Security ────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })
);

// ── Rate limiting ───────────────────────────────────────────
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "development" ? 1000 : 300,
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ── Compression ─────────────────────────────────────────────
app.use(compression());

// ── Cookie parsing ──────────────────────────────────────────
app.use(cookieParser());

// ── Parsing & sanitization ──────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Health check ────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  const [dbOk, redisOk] = await Promise.all([
    prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
    redis.ping(),
  ]);
  const status = dbOk && redisOk ? "ok" : "degraded";
  res.status(status === "ok" ? 200 : 503).json({
    status,
    uptime: process.uptime(),
    db: dbOk ? "up" : "down",
    redis: redisOk ? "up" : "down",
  });
});

// ── Routes ──────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/cover-letter", coverLetterRoutes);
app.use("/api/interview",    interviewRoutes);
app.use("/api/roadmap",      roadmapRoutes);
app.use("/api/analytics",      analyticsRoutes);
app.use("/api/notifications",  notificationRoutes);
app.use("/api/admin",          adminRoutes);

// ── Error handler ───────────────────────────────────────────
app.use(errorHandler);

function scheduleNightlyRefresh() {
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const msUntilMidnight = nextMidnight.getTime() - now.getTime();

  setTimeout(async function tick() {
    try {
      await refreshMaterializedViews();
      logger.info("Materialized views refreshed");
    } catch (err) {
      logger.error("Failed to refresh materialized views", err);
    }
    try {
      const deleted = await deleteStaleNotifications();
      if (deleted > 0) logger.info(`Cleaned up ${deleted} stale notifications`);
    } catch (err) {
      logger.error("Failed to clean up stale notifications", err);
    }
    setTimeout(tick, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
}

async function verifyPgVector() {
  try {
    const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
      ) as exists;
    `;
    if (!result[0]?.exists) {
      logger.warn("⚠️ Warning: PostgreSQL 'vector' extension is not enabled. Job matching features may fail. Run 'CREATE EXTENSION IF NOT EXISTS vector;' on your database.");
    } else {
      logger.info("✅ PostgreSQL 'vector' extension verified.");
    }
  } catch (err) {
    logger.warn("⚠️ Warning: Failed to query PostgreSQL extension list. pgvector availability could not be verified.", err);
  }
}

async function bootstrap() {
  await redis.connect();
  await verifyPgVector();
  const httpServer = http.createServer(app);
  initSocketIO(httpServer);
  httpServer.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      logger.error(`Port ${PORT} is already in use`);
    } else {
      logger.error("Failed to start server", err);
    }
    process.exit(1);
  });
  httpServer.listen(PORT, () => {
    logger.info(`API running on http://localhost:${PORT}`);
  });
  scheduleNightlyRefresh();
  await scheduleWeeklyDigest();
}

bootstrap().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});

// ── Graceful shutdown ───────────────────────────────────────
async function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`);
  try {
    await redis.disconnect();
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    logger.error("Error during shutdown", err);
    process.exit(1);
  }
}

// ── Crash safety net ─────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "UNHANDLED_REJECTION");
});
process.on("uncaughtException", (err) => {
  logger.error({ err }, "UNCAUGHT_EXCEPTION");
  process.exit(1);
});

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;
