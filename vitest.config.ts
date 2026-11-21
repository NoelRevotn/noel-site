import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["src/**/*.test.{ts,tsx}"] }, // Playwright owns tests/e2e
});
