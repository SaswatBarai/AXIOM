import type { Request, Response, NextFunction } from "express";
import multer from "multer";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
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
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Multer errors → 400 with a readable message
  if (err instanceof multer.MulterError) {
    const msg = err.code === "LIMIT_FILE_SIZE"
      ? "File size must be under 5 MB"
      : err.message;
    return res.status(400).json({ error: msg });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}
