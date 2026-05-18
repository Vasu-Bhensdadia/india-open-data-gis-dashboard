import express, { type Express } from "express";
import cors from "cors";
import morgan from "morgan";

import { corsOptions } from "@/config/cors";
import { env } from "@/config/env";
import { errorHandler } from "@/middleware/error-handler";
import { notFoundHandler } from "@/middleware/not-found-handler";
import { apiRoutes } from "@/routes";
import { logger } from "@/utils/logger";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors(corsOptions));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "tiny", { stream: logger.stream }));

  app.use(env.API_PREFIX, apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
