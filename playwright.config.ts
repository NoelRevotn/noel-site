import { defineConfig, devices } from "@playwright/test";

// Smoke tests run against the built static export (pnpm build first), served like GitHub Pages.
export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:4173" },
  webServer: {
    command: "node scripts/serve-out.mjs",
    url: "http://localhost:4173/noel-site/",
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
