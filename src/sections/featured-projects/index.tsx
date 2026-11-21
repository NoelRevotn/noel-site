import { getLocale, getTranslations } from "next-intl/server";
import { LineCode, StationMark, Stop } from "@/components/ui/Stop";
import { Text } from "@/components/ui/Text";
import { Link } from "@/i18n/navigation";
import { ProjectSlider } from "@/islands/project-slider/ProjectSlider";
import { projects } from "@/lib/content";
import type { Domain } from "../../../content/types";
import s from "./featured.module.css";

const CODE: Record<Domain, string> = { ml: "ML", sys: "SY", web: "WB" };

/** Interchange glyph: one stroke per domain line the project sits on. */
function Glyph({ domains }: { domains: Domain[] }) {
  const paths: Record<Domain, string> = { ml: "M4 18 H24 L32 32", sys: "M4 46 H20 L32 32", web: "M32 4 V32" };
  return (
    <svg className={s.glyph} viewBox="0 0 64 64" aria-hidden="true">
      {domains.map((d) => (
        <path key={d} d={paths[d]} data-line={d} />
      ))}
      <circle cx="32" cy="32" r="9" />
    </svg>
  );
}

export async function FeaturedProjects({ limit = 3 }: { limit?: number }) {
  const t = await getTranslations();
  const locale = (await getLocale()) as "en" | "es";
  const items = projects.filter((p) => p.featured).slice(0, limit);
  return (
    <Stop id="work" title={t("sections.featured")}>
      <ProjectSlider
        names={items.map((p) => p.title)}
        labels={{
          region: t("featured.region"),
          prev: t("featured.prev"),
          next: t("featured.next"),
          slide: t.raw("featured.slide") as string,
          pick: t("featured.pick"),
        }}
      >
        {items.map((p) => (
          <article key={p.slug} id={`project-${p.slug}`} className={s.plate}>
            <Glyph domains={p.domains} />
            <h3 className={s.title}>{p.title}</h3>
            <p className={s.summary}>
              <Text>{p.summary[locale]}</Text>
            </p>
            <div className={s.meta}>
              <span className={s.status}>
                <StationMark built={p.status !== "in-progress"} /> {t(`featured.status.${p.status}`)}
              </span>
              <span className={s.codes}>
                {p.domains.map((d) => (
                  <LineCode key={d} line={d}>
                    {CODE[d]}
                  </LineCode>
                ))}
              </span>
            </div>
            <Link prefetch={false} href={`/projects/${p.slug}`} className={s.open}>
              {t("featured.open")}
              <span className="visually-hidden">: {p.title}</span>
            </Link>
          </article>
        ))}
      </ProjectSlider>
    </Stop>
  );
}
