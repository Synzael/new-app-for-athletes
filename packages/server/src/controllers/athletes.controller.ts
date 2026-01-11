import { Request, Response } from "express";
import { Athlete } from "../entity/Athlete";
import { User, UserRole } from "../entity/User";
import { ratingService } from "../services/rating.service";
import { Like, Between } from "typeorm";

export class AthletesController {
  // Whitelist of fields that can be set by users (excludes rating scores and starRating)
  private static readonly ALLOWED_PROFILE_FIELDS = [
    "firstName",
    "lastName",
    "dateOfBirth",
    "bio",
    "profilePictureUrl",
    "hometown",
    "highSchool",
    "college",
    "graduationYear",
    "primarySport",
    "positions",
    "heightFeet",
    "weight",
    "phoneNumber",
    "socialMediaLinks",
    "isPublic",
  ];

  // Helper to sanitize input - only allow whitelisted fields
  private static sanitizeInput(body: any, allowRatingScores = false): any {
    const allowedFields = allowRatingScores
      ? [
          ...AthletesController.ALLOWED_PROFILE_FIELDS,
          "performanceScore",
          "physicalScore",
          "academicScore",
          "socialScore",
          "evaluationScore",
        ]
      : AthletesController.ALLOWED_PROFILE_FIELDS;

    const sanitized: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        sanitized[field] = body[field];
      }
    }
    return sanitized;
  }

  /**
   * Create athlete profile
   * POST /api/v1/athletes
   */
  static async create(req: Request, res: Response) {
    const { userId } = req.session!;

    try {
      // Check if user already has an athlete profile
      const existingAthlete = await Athlete.findOne({ where: { userId } });
      if (existingAthlete) {
        return res.status(400).json({
          error: "User already has an athlete profile",
        });
      }

      // Sanitize input - prevent mass assignment of protected fields
      const sanitizedData = AthletesController.sanitizeInput(req.body);

      // Create athlete profile
      const athlete = Athlete.create({
        userId,
        ...sanitizedData,
      });

      await athlete.save();

      // Calculate initial rating
      await ratingService.updateAthleteRating(athlete.id);

      // Reload to get updated star rating
      const savedAthlete = await Athlete.findOne({
        where: { id: athlete.id },
        relations: ["user"],
      });

      return res.status(201).json({
        athlete: savedAthlete,
      });
    } catch (error: any) {
      console.error("Create athlete error:", error);
      return res.status(500).json({
        error: "Failed to create athlete profile",
      });
    }
  }

  /**
   * Get all athletes (public, with filters)
   * GET /api/v1/athletes?sport=Football&minStars=4&maxStars=5&location=Texas
   */
  static async findAll(req: Request, res: Response) {
    try {
      const {
        sport,
        minStars,
        maxStars,
        location,
        graduationYear,
        limit = "20",
        offset = "0",
      } = req.query;

      const where: any = { isPublic: true };

      // Filter by sport
      if (sport) {
        where.primarySport = Like(`%${sport}%`);
      }

      // Filter by star rating range
      if (minStars || maxStars) {
        where.starRating = Between(
          parseFloat(minStars as string) || 0,
          parseFloat(maxStars as string) || 5
        );
      }

      // Filter by location (hometown, highSchool, or college)
      if (location) {
        // This would need a more complex query with OR conditions
        // For simplicity, we'll filter by hometown
        where.hometown = Like(`%${location}%`);
      }

      // Filter by graduation year
      if (graduationYear) {
        where.graduationYear = parseInt(graduationYear as string);
      }

      const [athletes, total] = await Athlete.findAndCount({
        where,
        relations: ["user"],
        order: {
          starRating: "DESC",
          createdAt: "DESC",
        },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      });

      return res.json({
        athletes,
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
    } catch (error: any) {
      console.error("Find athletes error:", error);
      return res.status(500).json({
        error: "Failed to fetch athletes",
      });
    }
  }

  /**
   * Search athletes
   * GET /api/v1/athletes/search?q=John&sport=Football
   */
  static async search(req: Request, res: Response) {
    try {
      const { q, sport, minStars, maxStars, limit = "20", offset = "0" } = req.query;

      const where: any = { isPublic: true };

      // Search by name
      if (q) {
        // This is a simplified search - in production you'd want full-text search
        where.firstName = Like(`%${q}%`);
      }

      // Filter by sport
      if (sport) {
        where.primarySport = sport;
      }

      // Filter by star rating
      if (minStars || maxStars) {
        where.starRating = Between(
          parseFloat(minStars as string) || 0,
          parseFloat(maxStars as string) || 5
        );
      }

      const [athletes, total] = await Athlete.findAndCount({
        where,
        relations: ["user", "performanceStats", "videos"],
        order: {
          starRating: "DESC",
        },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      });

      return res.json({
        athletes,
        total,
      });
    } catch (error: any) {
      console.error("Search athletes error:", error);
      return res.status(500).json({
        error: "Failed to search athletes",
      });
    }
  }

  /**
   * Get single athlete by ID
   * GET /api/v1/athletes/:id
   */
  static async findOne(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const athlete = await Athlete.findOne({
        where: { id },
        relations: ["user", "performanceStats", "videos"],
      });

      if (!athlete) {
        return res.status(404).json({
          error: "Athlete not found",
        });
      }

      // Check if profile is public or user is owner/admin
      const { userId } = req.session!;
      const isOwner = userId && athlete.userId === userId;
      const user = userId ? await User.findOne({ where: { id: userId } }) : null;
      const isAdmin = user && user.role === UserRole.ADMIN;

      if (!athlete.isPublic && !isOwner && !isAdmin) {
        return res.status(403).json({
          error: "This profile is private",
        });
      }

      return res.json({
        athlete,
      });
    } catch (error: any) {
      console.error("Find athlete error:", error);
      return res.status(500).json({
        error: "Failed to fetch athlete",
      });
    }
  }

  /**
   * Get current user's athlete profile
   * GET /api/v1/athletes/me
   */
  static async getMyProfile(req: Request, res: Response) {
    const { userId } = req.session!;

    try {
      const athlete = await Athlete.findOne({
        where: { userId },
        relations: ["user", "performanceStats", "videos"],
      });

      if (!athlete) {
        return res.status(404).json({
          error: "Athlete profile not found",
        });
      }

      return res.json({
        athlete,
      });
    } catch (error: any) {
      console.error("Get my profile error:", error);
      return res.status(500).json({
        error: "Failed to fetch profile",
      });
    }
  }

  /**
   * Update athlete profile
   * PUT /api/v1/athletes/:id
   */
  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { userId } = req.session!;

    try {
      const athlete = await Athlete.findOne({ where: { id } });

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

      // Sanitize input - only admins can update rating scores
      const sanitizedData = AthletesController.sanitizeInput(req.body, isAdmin);

      // Update athlete with sanitized data only
      Object.assign(athlete, sanitizedData);
      await athlete.save();

      // Recalculate rating if score components changed (admin only)
      if (
        isAdmin &&
        (req.body.performanceScore !== undefined ||
          req.body.physicalScore !== undefined ||
          req.body.academicScore !== undefined ||
          req.body.socialScore !== undefined ||
          req.body.evaluationScore !== undefined)
      ) {
        await ratingService.updateAthleteRating(athlete.id);
      }

      // Reload with relations
      const updatedAthlete = await Athlete.findOne({
        where: { id },
        relations: ["user", "performanceStats", "videos"],
      });

      return res.json({
        athlete: updatedAthlete,
      });
    } catch (error: any) {
      console.error("Update athlete error:", error);
      return res.status(500).json({
        error: "Failed to update athlete",
      });
    }
  }

  /**
   * Delete athlete profile
   * DELETE /api/v1/athletes/:id
   */
  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    const { userId } = req.session!;

    try {
      const athlete = await Athlete.findOne({ where: { id } });

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

      await athlete.remove();

      return res.json({
        message: "Athlete profile deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete athlete error:", error);
      return res.status(500).json({
        error: "Failed to delete athlete",
      });
    }
  }
}
