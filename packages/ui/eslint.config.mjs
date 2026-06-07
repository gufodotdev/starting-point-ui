import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { ignores: ["dist/", "tests/.tmp/"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Node build/server scripts and the Playwright config.
    files: ["**/*.mjs", "playwright.config.ts"],
    languageOptions: {
      globals: { process: "readonly", console: "readonly" },
    },
  },
  {
    // Playwright specs run in the browser and reach the window.sp global.
    files: ["tests/**/*.spec.ts"],
    languageOptions: {
      globals: { document: "readonly", window: "readonly" },
    },
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
];
