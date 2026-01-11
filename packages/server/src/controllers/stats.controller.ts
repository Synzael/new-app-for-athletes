import { Request, Response } from "express";
import { PerformanceStat } from "../entity/PerformanceStat";
import { Athlete } from "../entity/Athlete";
import { User, UserRole } from "../entity/User";

export class StatsController {
  /**
   * Get stats for an athlete
   * GET /api/v1/stats/:athleteId
   */
  static async getStats(req: Request, res: Response) {
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

      const stats = await PerformanceStat.find({
        where: { athleteId },
        order: { recordedDate: "DESC" },
      });

      return res.json({
        stats,
      });
    } catch (error: any) {
      console.error("Get stats error:", error);
      return res.status(500).json({
        error: "Failed to fetch stats",
      });
    }
  }

  /**
   * Add a stat for an athlete
   * POST /api/v1/stats/:athleteId
   */
  static async addStat(req: Request, res: Response) {
    const { athleteId } = req.params;
    const { userId } = req.session!;
    const { statName, statValue, unit, recordedDate, eventName } = req.body;

    if (!statName || !statValue) {
      return res.status(400).json({
        error: "Stat name and value are required",
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

      const stat = PerformanceStat.create({
        athleteId,
        statName,
        statValue,
        unit: unit || undefined,
        recordedDate: recordedDate ? new Date(recordedDate) : new Date(),
        eventName: eventName || undefined,
      });

      await stat.save();

      return res.status(201).json({
        stat,
      });
    } catch (error: any) {
      console.error("Add stat error:", error);
      return res.status(500).json({
        error: "Failed to add stat",
      });
    }
  }

  /**
   * Update a stat
   * PUT /api/v1/stats/:statId
   */
  static async updateStat(req: Request, res: Response) {
    const { statId } = req.params;
    const { userId } = req.session!;
    const { statName, statValue, unit, recordedDate, eventName } = req.body;

    try {
      const stat = await PerformanceStat.findOne({
        where: { id: statId },
        relations: ["athlete"],
      });

      if (!stat) {
        return res.status(404).json({
          error: "Stat not found",
        });
      }

      // Check permissions
      const user = await User.findOne({ where: { id: userId } });
      const isOwner = stat.athlete.userId === userId;
      const isAdmin = user && user.role === UserRole.ADMIN;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          error: "Insufficient permissions",
        });
      }

      // Update fields
      if (statName !== undefined) stat.statName = statName;
      if (statValue !== undefined) stat.statValue = statValue;
      if (unit !== undefined) stat.unit = unit;
      if (recordedDate !== undefined) stat.recordedDate = new Date(recordedDate);
      if (eventName !== undefined) stat.eventName = eventName;

      await stat.save();

      return res.json({
        stat,
      });
    } catch (error: any) {
      console.error("Update stat error:", error);
      return res.status(500).json({
        error: "Failed to update stat",
      });
    }
  }

  /**
   * Delete a stat
   * DELETE /api/v1/stats/:statId
   */
  static async deleteStat(req: Request, res: Response) {
    const { statId } = req.params;
    const { userId } = req.session!;

    try {
      const stat = await PerformanceStat.findOne({
        where: { id: statId },
        relations: ["athlete"],
      });

      if (!stat) {
        return res.status(404).json({
          error: "Stat not found",
        });
      }

      // Check permissions
      const user = await User.findOne({ where: { id: userId } });
      const isOwner = stat.athlete.userId === userId;
      const isAdmin = user && user.role === UserRole.ADMIN;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          error: "Insufficient permissions",
        });
      }

      await stat.remove();

      return res.json({
        message: "Stat deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete stat error:", error);
      return res.status(500).json({
        error: "Failed to delete stat",
      });
    }
  }
}
