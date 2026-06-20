import { Router } from "express";

const router = Router();

// TODO: implement user routes in Phase 3+
router.get("/", (_req, res) => res.json({ route: "user", status: "scaffold" }));

export default router;
