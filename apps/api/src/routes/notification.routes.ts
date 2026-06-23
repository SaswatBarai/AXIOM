import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
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

// Job alerts
notificationRoutes.post("/alerts",            validate(notificationAlertSchema), createAlertHandler);
notificationRoutes.get("/alerts",             listAlertsHandler);
notificationRoutes.patch("/alerts/:alertId",  validate(updateNotificationAlertSchema), updateAlertHandler);
notificationRoutes.delete("/alerts/:alertId", deleteAlertHandler);
