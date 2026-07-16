import { defineConfig, globalIgnores } from "eslint/config";
import nextitals from "eslint-config-next/core-web-itals";

const eslintConfig = defineConfig([
  ...nextitals,
  // Oerride default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-en.d.ts",
  ]),
]);

export default eslintConfig;
