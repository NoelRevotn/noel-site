import { expect, test } from "@playwright/test";

test("root redirects to the English home", async ({ page }) => {
  await page.goto("/noel-site/");
  await expect(page).toHaveURL(/\/noel-site\/en\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Noel Echeverría");
});

test("Spanish home is pre-rendered with lang=es", async ({ page }) => {
  await page.goto("/noel-site/es/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("unknown routes get the 404 page", async ({ page }) => {
  const res = await page.goto("/noel-site/does-not-exist/");
  expect(res?.status()).toBe(404);
});
