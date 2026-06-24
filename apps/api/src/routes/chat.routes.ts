import { Router } from "express";
import { requireAuth, requireActiveSubscription } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { chatMessageSchema } from "../utils/schemas";
import {
  streamChatHandler,
  listSessionsHandler,
  deleteSessionHandler,
  getSessionHistoryHandler,
} from "../controllers/chat.controller";

const router = Router();

router.use(requireAuth, requireActiveSubscription);

router.post("/",                           validate(chatMessageSchema), streamChatHandler);
router.get("/sessions",                    listSessionsHandler);
router.get("/sessions/:sessionId",         getSessionHistoryHandler);
router.delete("/sessions/:sessionId",      deleteSessionHandler);

export default router;
