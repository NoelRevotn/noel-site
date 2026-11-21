import { defineConfig, devices } from "@playwright/test";

// Tests run against the built static export (pnpm build first), served like GitHub Pages.
// Smoke + keyboard tests run in Chromium, Firefox, WebKit and a mobile profile; axe runs in Chromium.
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
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] }, testMatch: /smoke\.spec/ },
    { name: "webkit", use: { ...devices["Desktop Safari"] }, testMatch: /smoke\.spec/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /smoke\.spec/ },
  ],
});
