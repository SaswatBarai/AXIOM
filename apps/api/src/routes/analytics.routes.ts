import { Router } from "express";
import { requireAuth, requireActiveSubscription } from "../middleware/auth.middleware";
import {
  overviewHandler,
  atsTrendHandler,
  applicationsMonthlyHandler,
  skillsDemandHandler,
  funnelHandler,
} from "../controllers/analytics.controller";

export const analyticsRoutes = Router();

analyticsRoutes.use(requireAuth, requireActiveSubscription);

analyticsRoutes.get("/overview",               overviewHandler);
analyticsRoutes.get("/ats-trend",              atsTrendHandler);
analyticsRoutes.get("/applications-monthly",   applicationsMonthlyHandler);
analyticsRoutes.get("/skills-demand",          skillsDemandHandler);
analyticsRoutes.get("/funnel",                 funnelHandler);
