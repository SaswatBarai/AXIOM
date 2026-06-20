import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler.middleware";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new AppError(401, "No token provided");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY!) as {
      userId: string;
      role: string;
    };
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      throw new AppError(403, "Insufficient permissions");
    }
    next();
  };
}
