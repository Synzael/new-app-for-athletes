import { Request, Response } from "express";
import { Video } from "../entity/Video";
import { Athlete } from "../entity/Athlete";
import { User, UserRole } from "../entity/User";

export class VideosController {
  /**
   * Get videos for an athlete
   * GET /api/v1/videos/:athleteId
   */
  static async getVideos(req: Request, res: Response) {
    const { athleteId } = req.params;

    try {
      const athlete = await Athlete.findOne({
        where: { id: athleteId },
      });

      if (!athlete) {
        return res.status(404).json({
          error: "Athlete not found",
        });
      }

      // Check if profile is public or user is owner/admin
      const { userId } = req.session || {};
      const isOwner = userId && athlete.userId === userId;
      const user = userId ? await User.findOne({ where: { id: userId } }) : null;
      const isAdmin = user && user.role === UserRole.ADMIN;

      if (!athlete.isPublic && !isOwner && !isAdmin) {
        return res.status(403).json({
          error: "This profile is private",
        });
      }

      const videos = await Video.find({
        where: { athleteId },
        order: { createdAt: "DESC" },
      });

      return res.json({
        videos,
      });
    } catch (error: any) {
      console.error("Get videos error:", error);
      return res.status(500).json({
        error: "Failed to fetch videos",
      });
    }
  }

  /**
   * Add a video for an athlete
   * POST /api/v1/videos/:athleteId
   */
  static async addVideo(req: Request, res: Response) {
    const { athleteId } = req.params;
    const { userId } = req.session!;
    const { videoUrl, title, description, videoType } = req.body;

    if (!videoUrl || !title) {
      return res.status(400).json({
        error: "Video URL and title are required",
      });
    }

    try {
      const athlete = await Athlete.findOne({
        where: { id: athleteId },
      });

      if (!athlete) {
        return res.status(404).json({
          error: "Athlete not found",
        });
      }

      // Check permissions
      const user = await User.findOne({ where: { id: userId } });
      const isOwner = athlete.userId === userId;
      const isAdmin = user && user.role === UserRole.ADMIN;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          error: "Insufficient permissions",
        });
      }

      const video = Video.create({
        athleteId,
        videoUrl,
        title,
        description: description || undefined,
        videoType: videoType || "highlight",
      });

      await video.save();

      return res.status(201).json({
        video,
      });
    } catch (error: any) {
      console.error("Add video error:", error);
      return res.status(500).json({
        error: "Failed to add video",
      });
    }
  }

  /**
   * Update a video
   * PUT /api/v1/videos/:videoId
   */
  static async updateVideo(req: Request, res: Response) {
    const { videoId } = req.params;
    const { userId } = req.session!;
    const { videoUrl, title, description, videoType } = req.body;

    try {
      const video = await Video.findOne({
        where: { id: videoId },
        relations: ["athlete"],
      });

      if (!video) {
        return res.status(404).json({
          error: "Video not found",
        });
      }

      // Check permissions
      const user = await User.findOne({ where: { id: userId } });
      const isOwner = video.athlete.userId === userId;
      const isAdmin = user && user.role === UserRole.ADMIN;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          error: "Insufficient permissions",
        });
      }

      // Update fields
      if (videoUrl !== undefined) video.videoUrl = videoUrl;
      if (title !== undefined) video.title = title;
      if (description !== undefined) video.description = description;
      if (videoType !== undefined) video.videoType = videoType;

      await video.save();

      return res.json({
        video,
      });
    } catch (error: any) {
      console.error("Update video error:", error);
      return res.status(500).json({
        error: "Failed to update video",
      });
    }
  }

  /**
   * Delete a video
   * DELETE /api/v1/videos/:videoId
   */
  static async deleteVideo(req: Request, res: Response) {
    const { videoId } = req.params;
    const { userId } = req.session!;

    try {
      const video = await Video.findOne({
        where: { id: videoId },
        relations: ["athlete"],
      });

      if (!video) {
        return res.status(404).json({
          error: "Video not found",
        });
      }

      // Check permissions
      const user = await User.findOne({ where: { id: userId } });
      const isOwner = video.athlete.userId === userId;
      const isAdmin = user && user.role === UserRole.ADMIN;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          error: "Insufficient permissions",
        });
      }

      await video.remove();

      return res.json({
        message: "Video deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete video error:", error);
      return res.status(500).json({
        error: "Failed to delete video",
      });
    }
  }
}
