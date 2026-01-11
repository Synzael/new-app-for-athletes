import { Request, Response } from "express";
import { PushToken } from "../entity/PushToken";

export class NotificationsController {
  /**
   * Register a push token
   * POST /api/v1/notifications/register-token
   */
  static async registerToken(req: Request, res: Response) {
    const { userId } = req.session!;
    const { token, platform } = req.body;

    if (!token || !platform) {
      return res.status(400).json({
        error: "Token and platform are required",
      });
    }

    if (!["ios", "android", "web"].includes(platform)) {
      return res.status(400).json({
        error: "Platform must be ios, android, or web",
      });
    }

    try {
      // Check if token already exists for this user
      let pushToken = await PushToken.findOne({
        where: { userId, token },
      });

      if (pushToken) {
        // Reactivate if it was deactivated
        pushToken.isActive = true;
        pushToken.platform = platform;
        await pushToken.save();
      } else {
        // Create new token
        pushToken = PushToken.create({
          userId,
          token,
          platform,
          isActive: true,
        });
        await pushToken.save();
      }

      return res.json({
        message: "Push token registered successfully",
        tokenId: pushToken.id,
      });
    } catch (error: any) {
      console.error("Register token error:", error);
      return res.status(500).json({
        error: "Failed to register push token",
      });
    }
  }

  /**
   * Unregister a push token
   * DELETE /api/v1/notifications/unregister-token
   */
  static async unregisterToken(req: Request, res: Response) {
    const { userId } = req.session!;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: "Token is required",
      });
    }

    try {
      const pushToken = await PushToken.findOne({
        where: { userId, token },
      });

      if (pushToken) {
        // Soft delete by deactivating
        pushToken.isActive = false;
        await pushToken.save();
      }

      return res.json({
        message: "Push token unregistered successfully",
      });
    } catch (error: any) {
      console.error("Unregister token error:", error);
      return res.status(500).json({
        error: "Failed to unregister push token",
      });
    }
  }

  /**
   * Get user's registered tokens
   * GET /api/v1/notifications/tokens
   */
  static async getTokens(req: Request, res: Response) {
    const { userId } = req.session!;

    try {
      const tokens = await PushToken.find({
        where: { userId, isActive: true },
        select: ["id", "platform", "createdAt"],
      });

      return res.json({
        tokens,
      });
    } catch (error: any) {
      console.error("Get tokens error:", error);
      return res.status(500).json({
        error: "Failed to get push tokens",
      });
    }
  }
}
