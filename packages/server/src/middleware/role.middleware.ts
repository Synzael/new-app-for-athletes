import { Request, Response, NextFunction } from "express";
import { User, UserRole } from "../entity/User";

/**
 * Middleware to require specific user role(s)
 * Must be used after requireAuth middleware
 */
export const requireRole = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    try {
      const user = await User.findOne({ where: { id: req.session.userId } });

      if (!user) {
        return res.status(401).json({
          error: "User not found",
        });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          error: "Insufficient permissions",
        });
      }

      // Attach user to request for use in controllers
      (req as any).user = user;

      next();
    } catch (error) {
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  };
};
