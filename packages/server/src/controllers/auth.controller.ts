import { Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import { User } from "../entity/User";
import { redis } from "../redis";
import {
  userSessionIdPrefix,
  forgotPasswordPrefix,
  redisSessionPrefix,
} from "../constants";
import { sendEmail } from "../utils/sendEmail";
import { createConfirmEmailLink } from "../utils/createConfirmEmailLink";
import { createForgotPasswordLink } from "../utils/createForgotPasswordLink";

export class AuthController {
  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  // Allowed roles for self-registration (admin cannot be self-assigned)
  private static readonly ALLOWED_REGISTRATION_ROLES = ["athlete", "coach", "brand"];

  static async register(req: Request, res: Response) {
    const { email, password, role } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          errors: [{ path: "email", message: "Email already taken" }],
        });
      }

      // Validate and sanitize role - prevent privilege escalation
      const sanitizedRole = AuthController.ALLOWED_REGISTRATION_ROLES.includes(role)
        ? role
        : "athlete";

      // Create user
      const user = User.create({
        email,
        password,
        role: sanitizedRole,
      });

      await user.save();

      // Send confirmation email
      if (process.env.NODE_ENV !== "test") {
        const confirmLink = await createConfirmEmailLink(
          process.env.FRONTEND_HOST!,
          user.id,
          redis
        );
        await sendEmail(email, confirmLink, "confirm");
      }

      return res.status(201).json({
        message: "User registered successfully. Please check your email to confirm.",
        userId: user.id,
      });
    } catch (error: any) {
      console.error("Register error:", error);
      return res.status(500).json({
        error: "Failed to register user",
      });
    }
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(400).json({
          errors: [
            {
              path: "email",
              message: "Invalid email or password",
            },
          ],
        });
      }

      // Check if email is confirmed
      if (!user.confirmed) {
        return res.status(400).json({
          errors: [
            {
              path: "email",
              message: "Please confirm your email before logging in",
            },
          ],
        });
      }

      // Check if account is locked
      if (user.forgotPasswordLocked) {
        return res.status(400).json({
          errors: [
            {
              path: "email",
              message: "Account is locked. Please reset your password.",
            },
          ],
        });
      }

      // Verify password
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(400).json({
          errors: [
            {
              path: "password",
              message: "Invalid email or password",
            },
          ],
        });
      }

      // Set session
      req.session!.userId = user.id;

      // Store session ID in Redis for logout
      await redis.lpush(`${userSessionIdPrefix}${user.id}`, req.sessionID);

      return res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          confirmed: user.confirmed,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      return res.status(500).json({
        error: "Failed to login",
      });
    }
  }

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  static async logout(req: Request, res: Response) {
    const { userId } = req.session!;

    if (!userId) {
      return res.status(400).json({
        error: "Not logged in",
      });
    }

    try {
      // Remove all user sessions from Redis
      const sessionIds = await redis.lrange(
        `${userSessionIdPrefix}${userId}`,
        0,
        -1
      );

      const promises: Promise<any>[] = [];
      sessionIds.forEach((sessionId: string) => {
        promises.push(redis.del(`${redisSessionPrefix}${sessionId}`));
      });

      await Promise.all(promises);

      // Clear the session list
      await redis.del(`${userSessionIdPrefix}${userId}`);

      return res.json({
        message: "Logout successful",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      return res.status(500).json({
        error: "Failed to logout",
      });
    }
  }

  /**
   * Get current user
   * GET /api/v1/auth/me
   */
  static async me(req: Request, res: Response) {
    const { userId } = req.session!;

    if (!userId) {
      return res.status(401).json({
        error: "Not authenticated",
      });
    }

    try {
      const user = await User.findOne({
        where: { id: userId },
        relations: ["athlete"],
      });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          confirmed: user.confirmed,
          athlete: user.athlete,
        },
      });
    } catch (error: any) {
      console.error("Me error:", error);
      return res.status(500).json({
        error: "Failed to get user",
      });
    }
  }

  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   */
  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        // Don't reveal that user doesn't exist
        return res.json({
          message: "If the email exists, a reset link has been sent",
        });
      }

      // Lock the account
      user.forgotPasswordLocked = true;
      await user.save();

      // Create reset link
      const resetLink = await createForgotPasswordLink(
        process.env.FRONTEND_HOST!,
        user.id,
        redis
      );

      // Send email
      if (process.env.NODE_ENV !== "test") {
        await sendEmail(email, resetLink, "forgot-password");
      }

      return res.json({
        message: "If the email exists, a reset link has been sent",
        ...(process.env.NODE_ENV === "test" && { resetLink }),
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      return res.status(500).json({
        error: "Failed to process request",
      });
    }
  }

  /**
   * Reset password with token
   * POST /api/v1/auth/reset-password
   */
  static async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        errors: [{ path: "token", message: "Token and password required" }],
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        errors: [{ path: "newPassword", message: "Password must be at least 8 characters" }],
      });
    }

    try {
      // Get user ID from Redis
      const userId = await redis.get(`${forgotPasswordPrefix}${token}`);

      if (!userId) {
        return res.status(400).json({
          errors: [
            {
              path: "token",
              message: "Invalid or expired reset token",
            },
          ],
        });
      }

      const user = await User.findOne({ where: { id: userId } });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // Delete the token
      await redis.del(`${forgotPasswordPrefix}${token}`);

      // Update password (will be hashed by BeforeInsert hook won't run, so hash manually)
      user.password = await bcrypt.hash(newPassword, 10);
      user.forgotPasswordLocked = false;
      await user.save();

      // Clear all user sessions
      const sessionIds = await redis.lrange(
        `${userSessionIdPrefix}${user.id}`,
        0,
        -1
      );

      const promises: Promise<any>[] = [];
      sessionIds.forEach((sessionId: string) => {
        promises.push(redis.del(`${redisSessionPrefix}${sessionId}`));
      });

      await Promise.all(promises);
      await redis.del(`${userSessionIdPrefix}${user.id}`);

      return res.json({
        message: "Password reset successfully",
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      return res.status(500).json({
        error: "Failed to reset password",
      });
    }
  }
}
