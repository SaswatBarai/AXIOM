import { Router, type IRouter } from "express";
import { rateLimit } from "express-rate-limit";
import { validate } from "../middleware/validate.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import {
  registerHandler,
  verifyEmailHandler,
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
  refreshSchema,
} from "../utils/schemas";

const router: IRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many attempts, please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register",        authLimiter, validate(registerSchema),       registerHandler);
router.post("/verify-email",    authLimiter, validate(verifyEmailSchema),     verifyEmailHandler);
router.post("/login",           authLimiter, validate(loginSchema),           loginHandler);
router.post("/refresh",                      validate(refreshSchema),          refreshHandler);
router.post("/logout",                       requireAuth,                      logoutHandler);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema),  forgotPasswordHandler);
router.post("/reset-password",  authLimiter, validate(resetPasswordSchema),   resetPasswordHandler);
router.get( "/me",                           requireAuth,                      meHandler);

export default router;
