import "reflect-metadata";
// tslint:disable-next-line:no-var-requires
require("dotenv-safe").config();
import * as express from "express";
import { Express } from "express";
import * as session from "express-session";
import * as connectRedis from "connect-redis";
import * as RateLimit from "express-rate-limit";
import * as RateLimitRedisStore from "rate-limit-redis";
import * as cors from "cors";

import { redis } from "./redis";
import { createTypeormConn } from "./utils/createTypeormConn";
import { confirmEmail } from "./routes/confirmEmail";
import { redisSessionPrefix } from "./constants";
import { createTestConn } from "./testUtils/createTestConn";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { apiRouter } from "./routes/api/v1";

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET && process.env.NODE_ENV !== "test") {
  throw new Error("SESSION_SECRET environment variable is required");
}
const RedisStore = connectRedis(session as any);

export const startServer = async (): Promise<Express> => {
  if (process.env.NODE_ENV === "test") {
    await redis.flushall();
  }

  const app = express();

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  app.use(
    new RateLimit({
      store: new RateLimitRedisStore({
        client: redis,
      }),
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      delayMs: 0, // disable delaying - full speed until the max limit is reached
    })
  );

  // Session management
  app.use(
    session({
      store: new RedisStore({
        client: redis as any,
        prefix: redisSessionPrefix,
      }),
      name: "qid",
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    } as any)
  );

  // CORS
  app.use(
    cors({
      credentials: true,
      origin:
        process.env.NODE_ENV === "test"
          ? "*"
          : (process.env.FRONTEND_HOST as string) || "http://localhost:3000",
    })
  );

  // Static files
  app.use("/images", express.static("images"));

  // Email confirmation route
  app.get("/confirm/:id", confirmEmail);

  // Mount REST API routes
  app.use("/api/v1", apiRouter);

  // Global error handler (must be last)
  app.use(errorHandler);

  // Database connection
  if (process.env.NODE_ENV === "test") {
    await createTestConn(true);
  } else {
    await createTypeormConn();
  }

  const port = process.env.NODE_ENV === "test" ? 0 : process.env.PORT || 4000;

  const server = app.listen(port, () => {
    if (process.env.NODE_ENV !== "test") {
      console.log(`Server is running on localhost:${port}`);
    }
  });

  // For testing: attach the server instance
  (app as any).server = server;

  return app;
};
