import { Router, type IRouter } from "express";
import { rateLimit } from "express-rate-limit";
import { validate } from "../middleware/validate.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import {
  registerHandler,
  verifyEmailHandler,
  resendVerificationHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  meHandler,
} from "../controllers/auth.controller";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../utils/schemas";
import { RATE_LIMIT } from "../utils/constants";

const router: IRouter = Router();

function mkLimiter(max: number, msg: string, keyFn?: (req: any) => string) {
  return rateLimit({
    windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
    max: process.env.NODE_ENV === "development" ? 1000 : max,
    message: { error: msg },
    standardHeaders: true,
    legacyHeaders: false,
    ...(keyFn ? { keyGenerator: keyFn } : {}),
  });
}

const authLimiter = mkLimiter(RATE_LIMIT.AUTH_MAX, "Too many attempts, please try again in 15 minutes.");
const loginLimiter = mkLimiter(
  RATE_LIMIT.AUTH_MAX,
  "Too many login attempts for this account.",
  (req) => req.body?.email ?? req.ip,
);
const emailLimiter = mkLimiter(
  RATE_LIMIT.AUTH_MAX,
  "Too many attempts for this account. Please try again later.",
  (req) => req.body?.email ?? req.ip,
);

router.post("/register",        authLimiter, validate(registerSchema),       registerHandler);
router.post("/verify-email",    emailLimiter, validate(verifyEmailSchema),     verifyEmailHandler);
router.post("/resend-verification", emailLimiter, validate(forgotPasswordSchema), resendVerificationHandler);
router.post("/login",           loginLimiter, validate(loginSchema),           loginHandler);
// No body validation — token is read from the HttpOnly cookie (req.cookies.refreshToken).
// The controller returns 401 when neither cookie nor body provides a token.
router.post("/refresh",        authLimiter,                                    refreshHandler);
router.post("/logout",         authLimiter,  requireAuth,                      logoutHandler);
router.post("/forgot-password", emailLimiter, validate(forgotPasswordSchema),  forgotPasswordHandler);
router.post("/reset-password",  emailLimiter, validate(resetPasswordSchema),   resetPasswordHandler);
router.get( "/me",             authLimiter,  requireAuth,                      meHandler);

export default router;
