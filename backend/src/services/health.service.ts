import { env } from "@/config/env";
import type { HealthStatus } from "@/types/api";

const startedAt = new Date();

export async function getHealthStatus(): Promise<HealthStatus> {
  return {
    status: "ok",
    environment: env.NODE_ENV,
    version: env.API_VERSION,
    uptimeSeconds: Math.round(process.uptime()),
    startedAt: startedAt.toISOString(),
    timestamp: new Date().toISOString(),
  };
}
