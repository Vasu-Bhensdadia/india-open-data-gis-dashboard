import type { ErrorRequestHandler } from "express";

import { env } from "@/config/env";
import type { ApiErrorResponse } from "@/types/api";
import { HttpError } from "@/utils/http-error";
import { logger } from "@/utils/logger";

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  const isHttpError = error instanceof HttpError;
  const statusCode = isHttpError ? error.statusCode : 500;
  const message =
    statusCode >= 500 && env.NODE_ENV === "production"
      ? "Internal server error"
      : error instanceof Error
        ? error.message
        : "Unknown error";

  if (statusCode >= 500) {
    logger.error("Request failed", {
      method: request.method,
      path: request.originalUrl,
      error,
    });
  }

  const payload: ApiErrorResponse = {
    error: {
      message,
      statusCode,
      code: isHttpError ? error.code : "INTERNAL_SERVER_ERROR",
    },
  };

  response.status(statusCode).json(payload);
};
