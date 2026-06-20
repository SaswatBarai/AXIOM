import { Router } from "express";

const router = Router();

// TODO: implement notification routes in Phase 3+
router.get("/", (_req, res) => res.json({ route: "notification", status: "scaffold" }));

export default router;
