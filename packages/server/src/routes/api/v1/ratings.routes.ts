import { Router } from "express";
import { RatingsController } from "../../../controllers/ratings.controller";
import { requireAuth } from "../../../middleware/auth.middleware";
import { requireRole } from "../../../middleware/role.middleware";
import { validate } from "../../../middleware/validation.middleware";
import { updateRatingSchema } from "@abb/common";
import { UserRole } from "../../../entity/User";

const router = Router();

// Recalculate rating (admin only) - must come before dynamic routes
router.post(
  "/calculate/:athleteId",
  requireAuth,
  requireRole(UserRole.ADMIN),
  RatingsController.recalculateRating
);

// Get rating breakdown (public if profile is public) - specific path before dynamic
router.get("/:athleteId/breakdown", RatingsController.getRatingBreakdown);

// Update rating components (owner or admin) - dynamic route last
router.put(
  "/:athleteId",
  requireAuth,
  validate(updateRatingSchema),
  RatingsController.updateRating
);

export { router as ratingsRoutes };
