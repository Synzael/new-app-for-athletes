import { Request, Response, NextFunction } from "express";

/**
 * Middleware to require authentication
 * Checks if user is logged in via session
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }
  next();
};
