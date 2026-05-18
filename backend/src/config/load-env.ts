import dotenv from "dotenv";

export type BackendRawEnv = {
  NODE_ENV: string | undefined;
  HOST: string | undefined;
  PORT: string | undefined;
  LOG_LEVEL: string | undefined;
  API_PREFIX: string | undefined;
  API_VERSION: string | undefined;
  CORS_ORIGINS: string | undefined;
  DATASETS_DIR: string | undefined;
};

let hasLoadedDotEnv = false;

export function loadBackendEnv(source: NodeJS.ProcessEnv = process.env): BackendRawEnv {
  if (!hasLoadedDotEnv) {
    dotenv.config();
    hasLoadedDotEnv = true;
  }

  return {
    NODE_ENV: source.NODE_ENV,
    HOST: source.HOST,
    PORT: source.PORT,
    LOG_LEVEL: source.LOG_LEVEL,
    API_PREFIX: source.API_PREFIX,
    API_VERSION: source.API_VERSION,
    CORS_ORIGINS: source.CORS_ORIGINS,
    DATASETS_DIR: source.DATASETS_DIR,
  };
}
