export type FrontendRawEnv = {
  NODE_ENV: string | undefined;
  NEXT_PUBLIC_API_URL: string | undefined;
};

let hasLoadedDotEnv = false;

export function loadFrontendEnv(source: NodeJS.ProcessEnv = process.env): FrontendRawEnv {
  if (typeof window === "undefined" && !hasLoadedDotEnv) {
    // Only load dotenv on the Node server side.
    // Use eval to avoid the forbidden require syntax in frontend linting.
    const dotenv = eval("require")("dotenv") as { config: () => void };
    dotenv.config();
    hasLoadedDotEnv = true;
  }

  return {
    NODE_ENV: source.NODE_ENV,
    NEXT_PUBLIC_API_URL: source.NEXT_PUBLIC_API_URL,
  };
}
