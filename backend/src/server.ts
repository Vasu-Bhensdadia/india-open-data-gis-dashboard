import { createApp } from "@/app";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

const app = createApp();

const server = app.listen(env.PORT, env.HOST, () => {
  logger.info("Backend service started", {
    environment: env.NODE_ENV,
    host: env.HOST,
    port: env.PORT,
    apiBaseUrl: `${env.API_PREFIX}/${env.API_VERSION}`,
  });
});

function shutdown(signal: NodeJS.Signals): void {
  logger.info(`Received ${signal}. Closing backend service.`);

  server.close((error) => {
    if (error) {
      logger.error("Backend service shutdown failed", { error });
      process.exit(1);
    }

    logger.info("Backend service stopped cleanly.");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { reason });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error });
  process.exit(1);
});
