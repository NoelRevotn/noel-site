/**
 * Site-wide settings. Phase 2 adds the home-page section registry here (PLAN.md §5.2).
 */
export const site = {
  /** GitHub Pages project site: https://noelrevotn.github.io/noel-site/ (ADR-0002). */
  basePath: "/noel-site",
  origin: "https://noelrevotn.github.io",
  locales: ["en", "es"] as const,
  defaultLocale: "en",
} as const;

export type Locale = (typeof site.locales)[number];
