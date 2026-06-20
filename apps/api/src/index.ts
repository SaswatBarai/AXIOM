import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import resumeRoutes from "./routes/resume.routes";
import jobRoutes from "./routes/job.routes";
import applicationRoutes from "./routes/application.routes";
import { errorHandler } from "./middleware/errorHandler.middleware";

const app = express();
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
    max: 100,
    message: { error: "Too many requests, please try again later." },
  })
);

// ── Parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ── Health check ────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

// ── Error handler ───────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.warn(`API running on http://localhost:${PORT}`);
});

export default app;
