import { getLocale, getTranslations } from "next-intl/server";
import { LineCode, StationMark, Stop } from "@/components/ui/Stop";
import { Text } from "@/components/ui/Text";
import { Link } from "@/i18n/navigation";
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
      <ol className={s.list}>
        {items.map((p, i) => (
          <li
            key={p.slug}
            id={`project-${p.slug}`}
            className={s.plate}
            data-reveal
            style={{ "--reveal-i": i } as React.CSSProperties}
          >
            <Glyph domains={p.domains} />
            <div className={s.body}>
              <h3 className={s.title}>
                <Link prefetch={false} href={`/projects/${p.slug}`}>
                  {p.title}
                </Link>
              </h3>
              <p className={s.summary}>
                <Text>{p.summary[locale]}</Text>
              </p>
              <p>
                <Text>{p.what[locale]}</Text>
              </p>
              <p className={s.muted}>
                <Text>{p.context[locale]}</Text>
              </p>
              {p.role && (
                <p>
                  <strong>{t("featured.role")}:</strong> <Text>{p.role[locale]}</Text>
                </p>
              )}
              <div className={s.meta}>
                <span className={s.status}>
                  <StationMark built={p.status !== "in-progress"} /> {t(`featured.status.${p.status}`)}
                </span>
                <dl className={s.transfers}>
                  {(Object.keys(p.stack) as Domain[]).map((d) => (
                    <div key={d} data-line={d}>
                      <dt>
                        <LineCode line={d}>{CODE[d]}</LineCode>
                      </dt>
                      <dd>{p.stack[d]?.join(", ")}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Stop>
  );
}
