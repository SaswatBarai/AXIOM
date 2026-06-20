import { Router, type IRouter } from "express";

const router: IRouter = Router();

// TODO: implement auth routes in Phase 3+
router.get("/", (_req, res) => res.json({ route: "auth", status: "scaffold" }));

export default router;
