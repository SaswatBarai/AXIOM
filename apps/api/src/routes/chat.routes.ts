import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { chatMessageSchema } from "../utils/schemas";
import {
  streamChatHandler,
  listSessionsHandler,
  deleteSessionHandler,
  getSessionHistoryHandler,
} from "../controllers/chat.controller";

const router = Router();

router.post("/",                           requireAuth, validate(chatMessageSchema), streamChatHandler);
router.get("/sessions",                    requireAuth, listSessionsHandler);
router.get("/sessions/:sessionId",         requireAuth, getSessionHistoryHandler);
router.delete("/sessions/:sessionId",      requireAuth, deleteSessionHandler);

export default router;
