"use client";

import { LayoutGroup, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ease } from "@/motion/tokens";
import { PALETTE_EVENT } from "../command-palette/events";
import s from "./rail.module.css";

const STATIONS = [
  { href: "/", key: "home" },
  { href: "/projects", key: "projects" },
  { href: "/cv", key: "cv" },
  { href: "/blog", key: "blog" },
  { href: "/contact", key: "contact" },
] as const;

/** The rail: one line across the top of every page; stations are the navigation. */
export function Rail() {
  const t = useTranslations("nav");
  const tp = useTranslations("palette");
  const ts = useTranslations("settings");
  const locale = useLocale();
  const pathname = usePathname();
  const other = locale === "en" ? "es" : "en";
  const current = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className={s.rail}>
      <nav aria-label={t("label")} className={s.nav}>
        <LayoutGroup>
          <ol className={s.stations}>
            {STATIONS.map(({ href, key }, i) => {
              const here = current(href);
              return (
                <li key={href} style={{ "--i": i } as React.CSSProperties}>
                  <Link href={href} aria-current={here ? "page" : undefined} className={s.station}>
                    <span className={s.dot} data-here={here} aria-hidden="true" />
                    {t(key)}
                  </Link>
                  {here && (
                    <motion.span
                      layoutId="you-are-here"
                      className={s.here}
                      aria-hidden="true"
                      transition={{ duration: 0.4, ease: ease.emphasized }}
                    >
                      {t("here")}
                    </motion.span>
                  )}
                </li>
              );
            })}
          </ol>
        </LayoutGroup>
      </nav>
      <div className={s.end}>
        <Link href={pathname} locale={other} className={s.plate} hrefLang={other} lang={other}>
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
