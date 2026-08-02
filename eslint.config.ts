import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import { defineConfig, globalIgnores } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

// Note: we intentionally avoid `eslint-config-next` here. It pulls in
// eslint-plugin-react@7.37 (peer eslint <=9.7), which throws at runtime
// under ESLint 10 (`context.getFilename is not a function`). We use
// `@next/eslint-plugin-next`'s own flat config directly instead, which
// has no such dependency. See spec section 2 "Risco conhecido".
const eslintConfig = defineConfig([
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  nextPlugin.configs["core-web-vitals"],
  reactHooks.configs.flat["recommended-latest"],
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["postcss.config.mjs"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },
  prettierConfig,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "drizzle/**",
    ".open-next/**",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
