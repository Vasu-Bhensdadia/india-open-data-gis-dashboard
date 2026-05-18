import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

import { typescriptRules, workspaceIgnores } from "../eslint.shared.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{ts,tsx}"],
    rules: typescriptRules,
  },
  prettier,
  globalIgnores([...workspaceIgnores, "next-env.d.ts"]),
]);

export default eslintConfig;
