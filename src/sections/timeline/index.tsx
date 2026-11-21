import { getLocale, getTranslations } from "next-intl/server";
import { LineIcon } from "@/components/icons/LineIcon";
import { Scene } from "@/components/scene/Scene";
import { Link } from "@/i18n/navigation";
import { timeline } from "@/lib/content";
import s from "./timeline.module.css";

/** Work as one line per job: role, place, dates. Everything else is on the CV. */
export async function Timeline() {
  const t = await getTranslations();
  const locale = (await getLocale()) as "en" | "es";
  const now = locale === "es" ? "hoy" : "now";
  const jobs = timeline.filter((e) => e.kind === "work");
  return (
    <Scene id="timeline" title={t("home.timeline")} icon={<LineIcon name="work" />}>
      <ol className={s.list}>
        {jobs.map((e, i) => (
          <li
            key={`${e.org}-${e.start}`}
            className={s.row}
            data-reveal
            style={{ "--reveal-i": i } as React.CSSProperties}
          >
            <span className={s.role}>{e.title[locale]}</span>
            <span className={s.org}>{e.org}</span>
            <span className={`mono ${s.when}`}>
              {e.start} – {e.end ?? now}
            </span>
          </li>
        ))}
      </ol>
      <p className={s.more}>
        <Link prefetch={false} href="/cv">
          {t("home.fullCv")}
        </Link>
      </p>
    </Scene>
  );
}
