import { Router } from "express";

const router = Router();

// TODO: implement job routes in Phase 3+
router.get("/", (_req, res) => res.json({ route: "job", status: "scaffold" }));

export default router;
