import { Router } from "express";
import { AthletesController } from "../../../controllers/athletes.controller";
import { requireAuth } from "../../../middleware/auth.middleware";
import { validate } from "../../../middleware/validation.middleware";
import { athleteSchema, updateAthleteSchema } from "@abb/common";

const router = Router();

// Public routes
router.get("/", AthletesController.findAll);
router.get("/search", AthletesController.search);

// Protected routes (must come before /:id to match first)
router.get("/me/profile", requireAuth, AthletesController.getMyProfile);

router.post(
  "/",
  requireAuth,
  validate(athleteSchema),
  AthletesController.create
);

// Dynamic routes (must come last)
router.get("/:id", AthletesController.findOne);

router.put(
  "/:id",
  requireAuth,
  validate(updateAthleteSchema),
  AthletesController.update
);

router.delete("/:id", requireAuth, AthletesController.delete);

export { router as athletesRoutes };
