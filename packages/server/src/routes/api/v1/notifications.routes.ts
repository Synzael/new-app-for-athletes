import { Router } from "express";
import { NotificationsController } from "../../../controllers/notifications.controller";
import { requireAuth } from "../../../middleware/auth.middleware";

const router = Router();

// All notification routes require authentication
router.use(requireAuth);

// Register a push token
router.post("/register-token", NotificationsController.registerToken);

// Unregister a push token
router.delete("/unregister-token", NotificationsController.unregisterToken);

// Get user's registered tokens
router.get("/tokens", NotificationsController.getTokens);

export default router;
