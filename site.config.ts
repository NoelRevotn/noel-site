/**
 * Site-wide settings and the home page as data (PLAN.md §5.2).
 * Add, remove or reorder a home section here; nothing else needs to change.
 */
export const site = {
  /** GitHub Pages project site: https://noelrevotn.github.io/noel-site/ (ADR-0002). */
  basePath: "/noel-site",
  origin: "https://noelrevotn.github.io",
  locales: ["en", "es"] as const,
  defaultLocale: "en",
} as const;

export type Locale = (typeof site.locales)[number];

export type SectionId =
  "featured-projects" | "skills" | "developing" | "timeline" | "latest-writing" | "contact-strip";

export type SectionConfig = { id: SectionId; enabled: boolean; props?: { limit?: number } };

/** Home page stops, in order, after the hero. */
export const home = [
  { id: "featured-projects", enabled: true, props: { limit: 3 } },
  { id: "skills", enabled: true },
  { id: "developing", enabled: true },
  { id: "timeline", enabled: true },
  { id: "latest-writing", enabled: true, props: { limit: 3 } },
  { id: "contact-strip", enabled: true },
] as const satisfies readonly SectionConfig[];
