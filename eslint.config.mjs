import { defineConfig, globalIgnores } from "eslint/config";
import regrasDesempenhoNext from "eslint-config-next/core-web-vitals";
import regrasTypeScriptNext from "eslint-config-next/typescript";

const configuracaoEslint = defineConfig([
  ...regrasDesempenhoNext,
  ...regrasTypeScriptNext,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default configuracaoEslint;
