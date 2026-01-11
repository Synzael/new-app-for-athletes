import { Router } from "express";
import { AuthController } from "../../../controllers/auth.controller";
import { validate } from "../../../middleware/validation.middleware";
import { validUserSchema, loginSchema } from "@abb/common";

const router = Router();

// Register
router.post(
  "/register",
  validate(validUserSchema),
  AuthController.register
);

// Login
router.post("/login", validate(loginSchema), AuthController.login);

// Logout
router.post("/logout", AuthController.logout);

// Get current user
router.get("/me", AuthController.me);

// Forgot password
router.post("/forgot-password", AuthController.forgotPassword);

// Reset password
router.post("/reset-password", AuthController.resetPassword);

export { router as authRoutes };
