"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { PALETTE_EVENT } from "../command-palette/events";
import s from "./rail.module.css";

const STATIONS = [
  { href: "/", key: "home" },
  { href: "/projects", key: "projects" },
  { href: "/cv", key: "cv" },
  { href: "/blog", key: "blog" },
  { href: "/contact", key: "contact" },
] as const;

/**
 * The rail: one line across the top of every page; stations are the navigation. On client-side
 * navigation the "You are here" flag slides from the old station to the new one (a FLIP animation
 * with the Web Animations API: no animation library needed, ADR-0006).
 */
export function Rail() {
  const t = useTranslations("nav");
  const tp = useTranslations("palette");
  const ts = useTranslations("settings");
  const locale = useLocale();
  const pathname = usePathname();
  const flag = useRef<HTMLSpanElement>(null);
  const lastLeft = useRef<number | null>(null);
  const other = locale === "en" ? "es" : "en";
  const current = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  useLayoutEffect(() => {
    const el = flag.current;
    if (!el) {
      lastLeft.current = null;
      return;
    }
    const left = el.getBoundingClientRect().left;
    const from = lastLeft.current;
    lastLeft.current = left;
    if (from === null || from === left) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.animate([{ translate: `calc(-50% + ${from - left}px) 0` }, { translate: "-50% 0" }], {
      duration: 400,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    });
  }, [pathname]);

  return (
    <header className={s.rail}>
      <nav aria-label={t("label")} className={s.nav}>
        <ol className={s.stations}>
          {STATIONS.map(({ href, key }, i) => {
            const here = current(href);
            return (
              <li key={href} style={{ "--i": i } as CSSProperties}>
                <Link
                  prefetch={false}
                  href={href}
                  aria-current={here ? "page" : undefined}
                  className={s.station}
                >
                  <span className={s.dot} data-here={here} aria-hidden="true" />
                  {t(key)}
                </Link>
                {here && (
                  <span ref={flag} className={s.here} aria-hidden="true">
                    {t("here")}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <div className={s.end}>
        <Link
          prefetch={false}
          href={pathname}
          locale={other}
          className={s.plate}
          hrefLang={other}
          lang={other}
        >
          <span className="visually-hidden">{ts("language")}: </span>
          {ts("switchTo")}
        </Link>
        <button
          type="button"
          className={s.plate}
          onClick={() => window.dispatchEvent(new Event(PALETTE_EVENT))}
        >
          <span className="visually-hidden">{tp("open")} </span>
          <kbd>⌘K</kbd>
        </button>
      </div>
    </header>
  );
}
