import { Router, type IRouter } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import {
  listUsersHandler,
  getUserHandler,
  changeRoleHandler,
  suspendUserHandler,
  unsuspendUserHandler,
  deleteUserHandler,
  getOverviewHandler,
  listAuditLogsHandler,
} from "../controllers/admin.controller";

const router: IRouter = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/users", listUsersHandler);
router.get("/users/:id", getUserHandler);
router.patch("/users/:id/role", changeRoleHandler);
router.patch("/users/:id/suspend", suspendUserHandler);
router.patch("/users/:id/unsuspend", unsuspendUserHandler);
router.delete("/users/:id", deleteUserHandler);
router.get("/analytics/overview", getOverviewHandler);
router.get("/audit", listAuditLogsHandler);

export default router;
