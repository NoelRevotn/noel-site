import { defineRouting } from "next-intl/routing";
import { site } from "../../site.config";

// Static export: no proxy, so every URL carries its locale prefix (ADR-0002).
export const routing = defineRouting({
  locales: site.locales,
  defaultLocale: site.defaultLocale,
  localePrefix: "always",
});
