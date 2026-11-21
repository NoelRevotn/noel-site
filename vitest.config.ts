import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["src/**/*.test.{ts,tsx}", "tests/content/**/*.test.ts"] }, // Playwright owns tests/e2e
});
