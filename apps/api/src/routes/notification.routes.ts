import { Router } from "express";
import { requireAuth, requireActiveSubscription } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { notificationAlertSchema, updateNotificationAlertSchema } from "../utils/schemas";
import {
  listHandler, markReadHandler, markAllReadHandler,
  createAlertHandler, listAlertsHandler, updateAlertHandler, deleteAlertHandler,
} from "../controllers/notification.controller";

export const notificationRoutes = Router();

notificationRoutes.use(requireAuth);

// In-app notifications
notificationRoutes.get("/",                   listHandler);
notificationRoutes.post("/read-all",          markAllReadHandler);
notificationRoutes.post("/:id/read",          markReadHandler);

// Job alerts (premium)
notificationRoutes.post("/alerts",            requireActiveSubscription, validate(notificationAlertSchema), createAlertHandler);
notificationRoutes.get("/alerts",             requireActiveSubscription, listAlertsHandler);
notificationRoutes.patch("/alerts/:alertId",  requireActiveSubscription, validate(updateNotificationAlertSchema), updateAlertHandler);
notificationRoutes.delete("/alerts/:alertId", requireActiveSubscription, deleteAlertHandler);
