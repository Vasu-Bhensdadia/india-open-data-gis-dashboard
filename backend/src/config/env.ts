import { z } from "zod";

import { loadBackendEnv } from "@/config/load-env";

const DEFAULT_PORT = 4000;
const logLevelValues = ["debug", "info", "warn", "error"] as const;
const nodeEnvValues = ["development", "test", "production"] as const;

function emptyStringToUndefined(value: unknown): unknown {
  return typeof value === "string" && value.trim().length === 0 ? undefined : value;
}

function stringWithDefault(fallback: string) {
  return z.preprocess(emptyStringToUndefined, z.string().trim().min(1).default(fallback));
}

function normalizePathSegment(value: string): string {
  return value.startsWith("/") ? value : `/${value}`;
}

function normalizeVersion(value: string): string {
  return value.replace(/^\/+/, "");
}

function formatEnvError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`)
    .join("; ");
}

const portSchema = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().int().min(1).max(65535).default(DEFAULT_PORT),
);

const corsOriginsSchema = stringWithDefault("http://localhost:3000")
  .transform((value) =>
    value
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.union([z.literal("*"), z.string().url()])).min(1));

const backendEnvSchema = z.object({
  NODE_ENV: z.preprocess(emptyStringToUndefined, z.enum(nodeEnvValues).default("development")),
  HOST: stringWithDefault("0.0.0.0"),
  PORT: portSchema,
  LOG_LEVEL: z.preprocess(emptyStringToUndefined, z.enum(logLevelValues).default("info")),
  API_PREFIX: stringWithDefault("/api").transform(normalizePathSegment),
  API_VERSION: stringWithDefault("v1").transform(normalizeVersion),
  CORS_ORIGINS: corsOriginsSchema,
  DATASETS_DIR: stringWithDefault("../datasets"),
});

const parsedEnv = backendEnvSchema.safeParse(loadBackendEnv());

if (!parsedEnv.success) {
  throw new Error(`Invalid backend environment configuration: ${formatEnvError(parsedEnv.error)}`);
}

export type BackendEnv = Readonly<z.infer<typeof backendEnvSchema>>;
export type LogLevel = BackendEnv["LOG_LEVEL"];
export type NodeEnv = BackendEnv["NODE_ENV"];

export const env: BackendEnv = Object.freeze(parsedEnv.data);
