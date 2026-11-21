import { getLocale, getTranslations } from "next-intl/server";
import { StationMark, Stop } from "@/components/ui/Stop";
import { timeline } from "@/lib/content";
import s from "./timeline.module.css";

/** Experience and education as a timetable: dates in mono, ongoing entries hollow. */
export async function Timeline() {
  const t = await getTranslations("sections");
  const locale = (await getLocale()) as "en" | "es";
  const now = locale === "es" ? "hoy" : "now";
  return (
    <Stop id="timeline" title={t("timeline")}>
      <ol className={s.list}>
        {timeline.map((e, i) => (
          <li
            key={`${e.org}-${e.start}`}
            className={s.row}
            data-reveal
            style={{ "--reveal-i": i } as React.CSSProperties}
          >
            <span className={`mono ${s.when}`}>
              {e.start} – {e.end ?? now}
            </span>
            <StationMark built={e.end !== null} />
            <span>
              <strong className={s.title}>{e.title[locale]}</strong>
              <span className={s.org}>{e.org}</span>
              {e.note && <span className={s.note}>{e.note[locale]}</span>}
            </span>
          </li>
        ))}
      </ol>
    </Stop>
  );
}
