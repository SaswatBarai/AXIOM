import { Router } from "express";

const router = Router();

// TODO: implement application routes in Phase 3+
router.get("/", (_req, res) => res.json({ route: "application", status: "scaffold" }));

export default router;
