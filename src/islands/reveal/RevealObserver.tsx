"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Reveals [data-reveal] elements the first time they enter the viewport (PLAN §7.2 rule 3), with a
 * plain IntersectionObserver (ADR-0006). Content is visible in the static HTML; only `html.js`
 * hides it, so no-JS readers lose nothing. Sections stay Server Components: they just add the
 * attribute.
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.shown = "true";
          io.unobserve(e.target);
        }
      },
      { threshold: 0.15 },
    );
    document.querySelectorAll("[data-reveal]:not([data-shown])").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
