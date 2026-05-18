import { z } from "zod";

import { loadFrontendEnv } from "./load-env";

const DEFAULT_API_URL = "http://localhost:4000/api/v1";
const nodeEnvValues = ["development", "test", "production"] as const;

function emptyStringToUndefined(value: unknown): unknown {
  return typeof value === "string" && value.trim().length === 0 ? undefined : value;
}

function normalizeUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

function formatEnvError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`)
    .join("; ");
}

const frontendEnvSchema = z
  .object({
    NODE_ENV: z.preprocess(emptyStringToUndefined, z.enum(nodeEnvValues).default("development")),
    NEXT_PUBLIC_API_URL: z.preprocess(emptyStringToUndefined, z.string().trim().url().optional()),
  })
  .refine((values) => values.NODE_ENV !== "production" || Boolean(values.NEXT_PUBLIC_API_URL), {
    message: "NEXT_PUBLIC_API_URL is required in production.",
    path: ["NEXT_PUBLIC_API_URL"],
  })
  .transform(({ NEXT_PUBLIC_API_URL }) => ({
    NEXT_PUBLIC_API_URL: normalizeUrl(NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL),
  }));

const parsedEnv = frontendEnvSchema.safeParse(loadFrontendEnv());

if (!parsedEnv.success) {
  throw new Error(`Invalid frontend environment configuration: ${formatEnvError(parsedEnv.error)}`);
}

export type FrontendEnv = Readonly<z.infer<typeof frontendEnvSchema>>;

export const env: FrontendEnv = Object.freeze(parsedEnv.data);
