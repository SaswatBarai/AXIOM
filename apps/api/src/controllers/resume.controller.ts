import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import { assertUserId } from "../middleware/auth.middleware";
import { AppError } from "../middleware/errorHandler.middleware";
import * as resumeService from "../services/resume.service";
import { prisma } from "@axiom/database";
import { ensureDiscovery, runJobDiscovery, getDiscoveryStatus } from "../services/discovery.service";
import { jobDiscoveryQueue } from "../services/queue.service";

export async function uploadResumeHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new AppError(400, "No file uploaded — attach a PDF or DOCX as the 'resume' field");
    const resume = await resumeService.uploadResume(assertUserId(req), req.file);
    res.status(201).json({ resume });
  } catch (err) { next(err); }
}

export async function listResumesHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId   = assertUserId(req);
    const resumes  = await resumeService.listResumes(userId);
    const user     = await prisma.user.findUnique({
      where: { id: userId },
      select: { activeResumeId: true },
    });
    res.json({ resumes, activeResumeId: user?.activeResumeId ?? null });
  } catch (err) { next(err); }
}

export async function getResumeHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const resume = await resumeService.getResume(req.params["id"] as string, assertUserId(req));
    res.json({ resume });
  } catch (err) { next(err); }
}

export async function deleteResumeHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await resumeService.deleteResume(req.params["id"] as string, assertUserId(req));
    res.json({ message: result.message, activeResumeId: result.activeResumeId });
  } catch (err) { next(err); }
}

export async function analyzeResumeHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const resume = await resumeService.analyzeResume(
      req.params["id"] as string,
      assertUserId(req),
      req.body.jobDescription as string,
    );
    res.json({ resume });
  } catch (err) { next(err); }
}

export async function setActiveResumeHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId   = assertUserId(req);
    const resumeId = req.params["id"] as string;

    // Verify ownership (simple lookup, not full getResume with presigned URL)
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      select: { id: true, userId: true, status: true, fileName: true },
    });
    if (!resume) throw new AppError(404, "Resume not found");
    if (resume.userId !== userId) throw new AppError(403, "Forbidden");

    // ── 1. Update active resume ─────────────────────────────────────────────
    await prisma.user.update({
      where: { id: userId },
      data:  { activeResumeId: resumeId },
    });

    // ── 2. Check if jobs already exist for this resume ──────────────────────
    const { status: discoveryStatus, existingJobs } = await ensureDiscovery(resumeId);

    // ── 3. If no jobs exist, enqueue background worker ──────────────────────
    if (!existingJobs) {
      await jobDiscoveryQueue.add(
        { resumeId },
        { jobId: `discovery:${resumeId}` }, // Dedup key — prevents duplicate workers
      );
    }

    res.json({
      message: "Active resume updated",
      activeResumeId: resumeId,
      discoveryStatus,
      existingJobs,
    });
  } catch (err) { next(err); }
}

export async function runDiscoveryHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId   = assertUserId(req);
    const resumeId = req.params["id"] as string;

    await resumeService.getResume(resumeId, userId);

    // force=true: user explicitly clicked Refresh — bypass the in-progress guard
    runJobDiscovery(resumeId, { force: true }).catch((err) =>
      console.error("Background job discovery failed", err)
    );

    res.json({ message: "Discovery started" });
  } catch (err) { next(err); }
}

export async function getDiscoveryStatusHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId   = assertUserId(req);
    const resumeId = req.params["id"] as string;

    // Verify ownership
    await resumeService.getResume(resumeId, userId);

    const discovery = await getDiscoveryStatus(resumeId);
    res.json({ discovery });
  } catch (err) { next(err); }
}
