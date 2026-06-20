import { Router, type IRouter } from "express";

const router: IRouter = Router();

// TODO: implement resume routes in Phase 3+
router.get("/", (_req, res) => res.json({ route: "resume", status: "scaffold" }));

export default router;
