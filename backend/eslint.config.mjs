import js from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import globals from "globals";
import tseslint from "typescript-eslint";

import { typescriptRules, workspaceIgnores } from "../eslint.shared.mjs";

export default tseslint.config(
  {
    ignores: workspaceIgnores,
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
    rules: typescriptRules,
  },
  prettier,
);
