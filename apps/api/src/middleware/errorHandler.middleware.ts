import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { logger } from "../utils/logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    const body: { error: string; code?: string } = { error: err.message };
    if (err.code) body.code = err.code;
    return res.status(err.statusCode).json(body);
  }

  // Multer errors → 400 with a readable message
  if (err instanceof multer.MulterError) {
    const msg = err.code === "LIMIT_FILE_SIZE"
      ? "File size must be under 5 MB"
      : "File upload error";
    return res.status(400).json({ error: msg });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
}
