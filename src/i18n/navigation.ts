import { createNavigation } from "next-intl/navigation";
import { site } from "../../site.config";
import { routing } from "./routing";

export const { Link, usePathname, useRouter, getPathname } = createNavigation(routing);

/**
 * URL of the current page in another language, for a full page load. Switching locale swaps the
 * root layout, and a client-side swap re-renders <html> without the theme the head script set
 * (dark mode was lost on language switch). A real navigation runs that script again.
 */
export function localeHref(pathname: string, locale: (typeof routing.locales)[number]): string {
  const path = getPathname({ href: pathname, locale });
  return `${site.basePath}${path.endsWith("/") ? path : `${path}/`}`;
}
