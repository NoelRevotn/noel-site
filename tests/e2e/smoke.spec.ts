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

test("skip link moves focus to the main content", async ({ page, isMobile, browserName }) => {
  test.skip(isMobile, "no hardware keyboard");
  test.skip(browserName === "webkit", "Safari only tabs to links when the user enables it in settings");
  await page.goto("/noel-site/en/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("command palette opens with Ctrl+K and closes with Escape", async ({ page, isMobile }) => {
  test.skip(isMobile, "no hardware keyboard");
  await page.goto("/noel-site/en/");
  await page.keyboard.press("Control+k");
  const input = page.getByRole("combobox", { name: "Command menu" });
  await expect(input).toBeFocused();
  await input.fill("cv");
  await expect(page.getByRole("option", { name: "CV" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(input).toBeHidden();
});

test("language switch keeps the current page", async ({ page }) => {
  await page.goto("/noel-site/en/projects/");
  await page.getByRole("link", { name: /Español/ }).click();
  await expect(page).toHaveURL(/\/noel-site\/es\/projects\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("selected work slider switches projects", async ({ page }) => {
  await page.goto("/noel-site/en/");
  const work = page.locator("#work");
  await work.scrollIntoViewIfNeeded();
  await work.getByRole("button", { name: "DataLizer" }).click();
  await expect(work.getByRole("button", { name: "DataLizer" })).toHaveAttribute("aria-current", "true");
});

test("skill orb legend reads out a skill's projects", async ({ page }) => {
  await page.goto("/noel-site/en/");
  const skills = page.locator("#skills");
  await skills.scrollIntoViewIfNeeded();
  await skills.getByRole("button", { name: "Python" }).click();
  await expect(skills.locator("figcaption")).toContainText("H2Oeste");
});

test("dark theme survives a language switch", async ({ page }) => {
  await page.goto("/noel-site/es/");
  await page.evaluate(() =>
    localStorage.setItem(
      "noel-site:settings",
      JSON.stringify({ theme: "dark", paused: false, cursor: true }),
    ),
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("link", { name: /English/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/noel-site\/en\/$/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
