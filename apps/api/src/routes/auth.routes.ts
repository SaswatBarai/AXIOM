import { Router } from "express";

const router = Router();

// TODO: implement auth routes in Phase 3+
router.get("/", (_req, res) => res.json({ route: "auth", status: "scaffold" }));

export default router;
