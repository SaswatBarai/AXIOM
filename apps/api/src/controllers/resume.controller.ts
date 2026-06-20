import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/errorHandler.middleware";
import * as resumeService from "../services/resume.service";

export async function uploadResumeHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new AppError(400, "No file uploaded — attach a PDF or DOCX as the 'resume' field");
    const resume = await resumeService.uploadResume(req.userId!, req.file);
    res.status(201).json({ resume });
  } catch (err) { next(err); }
}

export async function listResumesHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const resumes = await resumeService.listResumes(req.userId!);
    res.json({ resumes });
  } catch (err) { next(err); }
}

export async function getResumeHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const resume = await resumeService.getResume(req.params["id"] as string, req.userId!);
    res.json({ resume });
  } catch (err) { next(err); }
}

export async function deleteResumeHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await resumeService.deleteResume(req.params["id"] as string, req.userId!);
    res.json(result);
  } catch (err) { next(err); }
}

export async function analyzeResumeHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const resume = await resumeService.analyzeResume(
      req.params["id"] as string,
      req.userId!,
      req.body.jobDescription as string,
    );
    res.json({ resume });
  } catch (err) { next(err); }
}
