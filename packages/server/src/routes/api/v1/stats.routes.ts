import { Router } from "express";
import { StatsController } from "../../../controllers/stats.controller";
import { requireAuth } from "../../../middleware/auth.middleware";

const router = Router();

// Get athlete's stats (public for public profiles)
router.get("/:athleteId", StatsController.getStats);

// Protected routes
router.post("/:athleteId", requireAuth, StatsController.addStat);
router.put("/:statId", requireAuth, StatsController.updateStat);
router.delete("/:statId", requireAuth, StatsController.deleteStat);

export default router;
