import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import * as chatService from "../services/chat.service";

export async function streamChatHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await chatService.streamChatToClient(
      req.userId!,
      req.body.sessionId as string | undefined,
      req.body.message as string,
      res,
      req.body.resumeParsed ?? null,
      req.body.savedJobs ?? [],
    );
  } catch (err) { next(err); }
}

export async function listSessionsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const sessions = await chatService.listSessions(req.userId!);
    res.json({ sessions });
  } catch (err) { next(err); }
}

export async function deleteSessionHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await chatService.deleteSession(req.userId!, req.params["sessionId"] as string);
    res.json({ success: true });
  } catch (err) { next(err); }
}

export async function getSessionHistoryHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const messages = await chatService.getSessionHistory(req.userId!, req.params["sessionId"] as string);
    res.json({ messages });
  } catch (err) { next(err); }
}
