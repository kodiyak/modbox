import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import { config as baseConfig } from "./base.js";

export const config = tseslint.config([
  baseConfig,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended, 
      ...tseslint.configs.recommended
    ]
  }
]).concat(eslintConfigPrettier);
