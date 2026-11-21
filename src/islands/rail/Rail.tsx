"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, localeHref, usePathname } from "@/i18n/navigation";
import { PALETTE_EVENT } from "../command-palette/events";
import s from "./rail.module.css";

const STATIONS = [
  { href: "/", key: "home" },
  { href: "/projects", key: "projects" },
  { href: "/cv", key: "cv" },
  { href: "/blog", key: "blog" },
  { href: "/contact", key: "contact" },
] as const;

/** Each station's train runs in a line colour, so the trip reads as a ride on the network. */
const TRAIN = ["--line-ml", "--line-sys", "--line-web", "--line-ml", "--line-sys"] as const;

/**
 * The rail: a track across the top of every page; stations are the navigation. On client-side
 * navigation a short train runs along the track from the old station to the new one, then the
 * "You are here" flag appears (Web Animations API, no library: ADR-0006). Reduced motion skips
 * the ride.
 */
export function Rail() {
  const t = useTranslations("nav");
  const tp = useTranslations("palette");
  const ts = useTranslations("settings");
  const locale = useLocale();
  const pathname = usePathname();
  const flag = useRef<HTMLSpanElement>(null);
  const nav = useRef<HTMLElement>(null);
  const train = useRef<HTMLSpanElement>(null);
  const lastX = useRef<number | null>(null);
  const other = locale === "en" ? "es" : "en";
  const current = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  useLayoutEffect(() => {
    const el = flag.current;
    const box = nav.current;
    const car = train.current;
    if (!el || !box || !car) {
      lastX.current = null;
      return;
    }
    // Station centres in the nav's own coordinates.
    const navLeft = box.getBoundingClientRect().left;
    const dot = el.parentElement?.querySelector("[data-here]");
    const r = (dot ?? el).getBoundingClientRect();
    const x = r.left + r.width / 2 - navLeft;
    const from = lastX.current;
    lastX.current = x;
    if (from === null || Math.abs(from - x) < 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (document.documentElement.dataset.motion === "paused") return;
    const index = STATIONS.findIndex(({ href }) => current(href));
    car.style.setProperty("--c", `var(${TRAIN[Math.max(0, index)]})`);
    const dir = x > from ? 1 : -1;
    const ride = Math.min(900, 380 + Math.abs(x - from) * 0.9);
    car.animate(
      [
        { translate: `${from}px 0`, scale: `${dir} 1`, opacity: 0 },
        { opacity: 1, offset: 0.12 },
        { opacity: 1, offset: 0.85 },
        { translate: `${x}px 0`, scale: `${dir} 1`, opacity: 0 },
      ],
      { duration: ride, easing: "cubic-bezier(0.45, 0, 0.2, 1)" },
    );
    el.animate(
      [
        { opacity: 0, translate: "-50% -4px" },
        { opacity: 1, translate: "-50% 0" },
      ],
      {
        duration: 260,
        delay: ride * 0.8,
        fill: "backwards",
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `current` is derived from pathname
  }, [pathname]);

  return (
    <header className={s.rail}>
      <nav ref={nav} aria-label={t("label")} className={s.nav}>
        <span ref={train} className={s.train} aria-hidden="true" />
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
        {/* A plain link on purpose: a full load keeps the saved theme (see localeHref). */}
        <a href={localeHref(pathname, other)} className={s.plate} hrefLang={other} lang={other}>
          <span className="visually-hidden">{ts("language")}: </span>
          {ts("switchTo")}
        </a>
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
