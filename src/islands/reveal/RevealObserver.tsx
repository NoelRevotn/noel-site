"use client";

import { inView } from "motion";
import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Reveals [data-reveal] elements the first time they enter the viewport (PLAN §7.2 rule 3).
 * Content is visible in the static HTML; only `html.js` hides it, so no-JS readers lose nothing.
 * Sections stay Server Components: they just add the attribute.
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const stops: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown])").forEach((el) => {
      stops.push(
        inView(
          el,
          () => {
            el.dataset.shown = "true";
          },
          { amount: 0.15 },
        ),
      );
    });
    return () => stops.forEach((stop) => stop());
  }, [pathname]);
  return null;
}
