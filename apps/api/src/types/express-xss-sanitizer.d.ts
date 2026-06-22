declare module "express-xss-sanitizer" {
  import type { RequestHandler } from "express";
  export function xss(): RequestHandler;
}

declare namespace Express {
  interface Request {
    id?: string;
  }
}
