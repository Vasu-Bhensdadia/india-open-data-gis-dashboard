import dotenv from "dotenv";

export type FrontendRawEnv = {
  NODE_ENV: string | undefined;
  NEXT_PUBLIC_API_URL: string | undefined;
};

let hasLoadedDotEnv = false;

export function loadFrontendEnv(source: NodeJS.ProcessEnv = process.env): FrontendRawEnv {
  if (!hasLoadedDotEnv) {
    dotenv.config();
    hasLoadedDotEnv = true;
  }

  return {
    NODE_ENV: source.NODE_ENV,
    NEXT_PUBLIC_API_URL: source.NEXT_PUBLIC_API_URL,
  };
}
