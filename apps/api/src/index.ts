import "dotenv/config";
import http from "http";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { xss } from "express-xss-sanitizer";

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
import { refreshMaterializedViews } from "./services/analytics.service";
import { scheduleWeeklyDigest }  from "./services/queue.service";
import { initSocketIO }          from "./lib/socket";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { prisma } from "@axiom/database";
import { redis } from "./services/redis.service";
import { logger } from "./utils/logger";

const app: Application = express();
const PORT = process.env.API_PORT ?? 4000;

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
    max: process.env.NODE_ENV === "development" ? 10000 : 100,
    message: { error: "Too many requests, please try again later." },
  })
);


// ── Parsing & sanitization ──────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(xss()); // strip XSS payloads from req.body / req.query / req.params
app.use(morgan("dev"));

// ── Health check ────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  const [dbOk, redisOk] = await Promise.all([
    prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
    redis.ping(),
  ]);
  const status = dbOk && redisOk ? "ok" : "degraded";
  res.status(status === "ok" ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    services: { db: dbOk ? "up" : "down", redis: redisOk ? "up" : "down" },
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
    setTimeout(tick, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
}

async function bootstrap() {
  await redis.connect();
  const httpServer = http.createServer(app);
  initSocketIO(httpServer);
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

export default app;
