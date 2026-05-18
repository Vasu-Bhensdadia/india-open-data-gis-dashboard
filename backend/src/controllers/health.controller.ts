import type { Request, Response } from "express";

import { getHealthStatus } from "@/services/health.service";
import { asyncHandler } from "@/utils/async-handler";

export const healthController = {
  check: asyncHandler(async (_request: Request, response: Response) => {
    const healthStatus = await getHealthStatus();

    response.status(200).json({
      data: healthStatus,
    });
  }),
};
