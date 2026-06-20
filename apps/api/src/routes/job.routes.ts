import { Router, type IRouter } from "express";

const router: IRouter = Router();

// TODO: implement job routes in Phase 3+
router.get("/", (_req, res) => res.json({ route: "job", status: "scaffold" }));

export default router;
