import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/noel-site/en/");
  await expect(page.getByRole("button", { name: "Motion off" })).toBeDisabled();
  await expect(page.locator("html")).not.toHaveClass(/lab-cursor-on/);
});

test("home pause control stops motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/noel-site/en/");
  const pause = page.getByRole("button", { name: "Pause motion" });
  await expect(pause).toHaveAttribute("aria-pressed", "false");
  await pause.click();
  await expect(pause).toHaveAttribute("aria-pressed", "true");
});

for (const locale of ["en", "es"] as const) {
  test(`home (${locale}) has no WCAG A/AA violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/noel-site/${locale}/`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`)).toEqual([]);
  });
}
