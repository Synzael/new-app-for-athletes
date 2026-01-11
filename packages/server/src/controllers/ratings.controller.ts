import { Request, Response } from "express";
import { Athlete } from "../entity/Athlete";
import { User, UserRole } from "../entity/User";
import { ratingService } from "../services/rating.service";

export class RatingsController {
  /**
   * Update rating components for an athlete
   * PUT /api/v1/ratings/:athleteId
   */
  static async updateRating(req: Request, res: Response) {
    const { athleteId } = req.params;
    const { userId } = req.session!;

    try {
      const athlete = await Athlete.findOne({ where: { id: athleteId } });

      if (!athlete) {
        return res.status(404).json({
          error: "Athlete not found",
        });
      }

      // Check permissions (owner or admin)
      const user = await User.findOne({ where: { id: userId } });
      const isOwner = athlete.userId === userId;
      const isAdmin = user && user.role === UserRole.ADMIN;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          error: "Insufficient permissions",
        });
      }

      // Update rating components
      if (req.body.performanceScore !== undefined) {
        athlete.performanceScore = req.body.performanceScore;
      }
      if (req.body.physicalScore !== undefined) {
        athlete.physicalScore = req.body.physicalScore;
      }
      if (req.body.academicScore !== undefined) {
        athlete.academicScore = req.body.academicScore;
      }
      if (req.body.socialScore !== undefined) {
        athlete.socialScore = req.body.socialScore;
      }
      if (req.body.evaluationScore !== undefined) {
        athlete.evaluationScore = req.body.evaluationScore;
      }

      await athlete.save();

      // Recalculate star rating
      await ratingService.updateAthleteRating(athlete.id);

      // Reload athlete
      const updatedAthlete = await Athlete.findOne({
        where: { id: athleteId },
      });

      return res.json({
        athlete: updatedAthlete,
        message: "Rating updated successfully",
      });
    } catch (error: any) {
      console.error("Update rating error:", error);
      return res.status(500).json({
        error: "Failed to update rating",
      });
    }
  }

  /**
   * Recalculate star rating for an athlete (admin only)
   * POST /api/v1/ratings/calculate/:athleteId
   */
  static async recalculateRating(req: Request, res: Response) {
    const { athleteId } = req.params;

    try {
      const athlete = await ratingService.updateAthleteRating(athleteId);

      return res.json({
        athlete,
        message: "Rating recalculated successfully",
      });
    } catch (error: any) {
      console.error("Recalculate rating error:", error);

      if (error.message === "Athlete not found") {
        return res.status(404).json({
          error: "Athlete not found",
        });
      }

      return res.status(500).json({
        error: "Failed to recalculate rating",
      });
    }
  }

  /**
   * Get rating breakdown for an athlete
   * GET /api/v1/ratings/:athleteId/breakdown
   */
  static async getRatingBreakdown(req: Request, res: Response) {
    const { athleteId } = req.params;

    try {
      const athlete = await Athlete.findOne({ where: { id: athleteId } });

      if (!athlete) {
        return res.status(404).json({
          error: "Athlete not found",
        });
      }

      // Check if profile is public or user has access
      const { userId } = req.session!;
      const isOwner = userId && athlete.userId === userId;
      const user = userId
        ? await User.findOne({ where: { id: userId } })
        : null;
      const isAdmin = user && user.role === UserRole.ADMIN;

      if (!athlete.isPublic && !isOwner && !isAdmin) {
        return res.status(403).json({
          error: "This profile is private",
        });
      }

      // Get rating breakdown
      const breakdown = ratingService.getRatingBreakdown({
        performanceScore: athlete.performanceScore,
        physicalScore: athlete.physicalScore,
        academicScore: athlete.academicScore,
        socialScore: athlete.socialScore,
        evaluationScore: athlete.evaluationScore,
      });

      return res.json({
        athleteId: athlete.id,
        athleteName: `${athlete.firstName} ${athlete.lastName}`,
        breakdown,
      });
    } catch (error: any) {
      console.error("Get rating breakdown error:", error);
      return res.status(500).json({
        error: "Failed to get rating breakdown",
      });
    }
  }
}
