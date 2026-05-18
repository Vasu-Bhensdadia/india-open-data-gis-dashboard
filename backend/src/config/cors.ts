import type { CorsOptions } from "cors";

import { env } from "@/config/env";
import { HttpError } from "@/utils/http-error";

export const corsOptions: CorsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin || env.CORS_ORIGINS.includes("*") || env.CORS_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(
      new HttpError(403, `CORS blocked request from origin: ${origin}`, "CORS_ORIGIN_DENIED"),
    );
  },
};
