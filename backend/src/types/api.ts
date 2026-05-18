import type { NodeEnv } from "@/types/env";

export type HealthStatus = {
  status: "ok";
  environment: NodeEnv;
  version: string;
  uptimeSeconds: number;
  startedAt: string;
  timestamp: string;
};

export type ApiErrorResponse = {
  error: {
    message: string;
    statusCode: number;
    code: string;
  };
};
