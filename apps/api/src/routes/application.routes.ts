import { Router, type IRouter } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validate, validateQuery } from "../middleware/validate.middleware";
import {
  createApplicationSchema,
  updateApplicationSchema,
  listApplicationsSchema,
} from "../utils/schemas";
import {
  createApplicationHandler,
  listApplicationsHandler,
  getApplicationHandler,
  updateApplicationHandler,
  deleteApplicationHandler,
  getStatsHandler,
} from "../controllers/application.controller";

const router: IRouter = Router();

// Require authentication for all routes
router.use(requireAuth);

router.post("/", validate(createApplicationSchema), createApplicationHandler);
router.get("/", validateQuery(listApplicationsSchema), listApplicationsHandler);
router.get("/stats", getStatsHandler);
router.get("/:id", getApplicationHandler);
router.patch("/:id", validate(updateApplicationSchema), updateApplicationHandler);
router.delete("/:id", deleteApplicationHandler);

export default router;

