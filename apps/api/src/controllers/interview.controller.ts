import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import {
  generateInterviewQuestions,
  listSessions,
  getSession,
  deleteSession,
  listCategories,
  saveMarks,
} from "../services/interview.service";

export async function generateHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { jobTitle, jobDescription = "", difficulty = "medium", sections = [], count = 10 } = req.body as {
      jobTitle:        string;
      jobDescription?: string;
      difficulty?:     string;
      sections?:       string[];
      count?:          number;
    };

    const result = await generateInterviewQuestions(
      userId,
      jobTitle,
      jobDescription,
      difficulty as "easy" | "medium" | "hard",
      sections,
      count,
    );

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listSessionsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const sessions = await listSessions(req.userId!);
    res.json({ sessions });
  } catch (err) {
    next(err);
  }
}

export async function getSessionHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const session = await getSession(req.userId!, req.params["sessionId"] as string);
    res.json({ session });
  } catch (err) {
    next(err);
  }
}

export async function deleteSessionHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await deleteSession(req.userId!, req.params["sessionId"] as string);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function saveMarksHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await saveMarks(
      req.userId!,
      req.params["sessionId"] as string,
      req.body.marks as Record<string, "correct" | "review" | null>,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function listCategoriesHandler(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await listCategories();
    res.json(data);
  } catch (err) {
    next(err);
  }
}
