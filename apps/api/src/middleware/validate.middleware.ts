import type { Request, Response, NextFunction } from "express";
import { type ZodSchema, ZodError } from "zod";

function asValidationError(err: ZodError) {
  return {
    error: "Validation failed",
    details: err.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
  };
}

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) return res.status(422).json(asValidationError(err));
      next(err);
    }
  };
}

/**
 * Parse + coerce `req.query` through a Zod schema, attaching the result at
 * `res.locals.validatedQuery` (Express 5 makes `req.query` read-only).
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      res.locals["validatedQuery"] = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) return res.status(422).json(asValidationError(err));
      next(err);
    }
  };
}
