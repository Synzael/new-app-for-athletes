import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { athletesRoutes } from "./athletes.routes";
import { ratingsRoutes } from "./ratings.routes";

const router = Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/athletes", athletesRoutes);
router.use("/ratings", ratingsRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export { router as apiRouter };
