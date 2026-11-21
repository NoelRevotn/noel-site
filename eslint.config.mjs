import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // PLAN §5.2 islands contract: "use client" lives only in src/islands/**.
  {
    files: ["app/**/*.{ts,tsx}", "src/**/*.{ts,tsx}"],
    ignores: ["src/islands/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Program > ExpressionStatement[directive='use client']",
          message: "Client components belong in src/islands/** (PLAN.md §5.2).",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
