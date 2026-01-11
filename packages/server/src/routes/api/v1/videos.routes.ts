import { Router } from "express";
import { VideosController } from "../../../controllers/videos.controller";
import { requireAuth } from "../../../middleware/auth.middleware";

const router = Router();

// Get athlete's videos (public for public profiles)
router.get("/:athleteId", VideosController.getVideos);

// Protected routes
router.post("/:athleteId", requireAuth, VideosController.addVideo);
router.put("/:videoId", requireAuth, VideosController.updateVideo);
router.delete("/:videoId", requireAuth, VideosController.deleteVideo);

export default router;
