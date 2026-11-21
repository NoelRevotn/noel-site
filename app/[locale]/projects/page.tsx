import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LineCode, StationMark, Trunk } from "@/components/ui/Stop";
import { PageTitle, Text } from "@/components/ui/Text";
import { Link } from "@/i18n/navigation";
import { projects } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import s from "./projects.module.css";

type Props = { params: Promise<{ locale: string }> };
const LINES = [
  { id: "ml", code: "ML" },
  { id: "sys", code: "SY" },
  { id: "web", code: "WB" },
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });
  return pageMetadata(locale, "/projects", t("title"), t("lead"));
}

/** Projects grouped by line (domain). A project on several lines appears on each: an interchange. */
export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const l = locale as "en" | "es";
  return (
    <main id="main">
      <Trunk>
        <PageTitle lead={t("projects.lead")}>{t("projects.title")}</PageTitle>
        {LINES.map((line) => {
          const items = projects.filter((p) => p.domains.includes(line.id));
          return (
            <section key={line.id} className={s.line} data-line={line.id} aria-labelledby={`line-${line.id}`}>
              <h2 id={`line-${line.id}`} className={s.lineTitle}>
                <LineCode line={line.id}>{line.code}</LineCode> {t(`legend.${line.id}`)}
              </h2>
              <ol className={s.stations}>
                {items.map((p, i) => (
                  <li
                    key={p.slug}
                    className={s.station}
                    data-reveal
                    style={{ "--reveal-i": i } as React.CSSProperties}
                  >
                    <StationMark built={p.status !== "in-progress"} />
                    <div>
                      <h3 className={s.name}>
                        <Link href={`/projects/${p.slug}`}>{p.title}</Link>
                        {p.domains.length > 1 && (
                          <span className={s.transfers}>
                            {p.domains
                              .filter((d) => d !== line.id)
                              .map((d) => (
                                <LineCode key={d} line={d}>
                                  {LINES.find((x) => x.id === d)!.code}
                                </LineCode>
                              ))}
                          </span>
                        )}
                      </h3>
                      <p className={s.summary}>
                        <Text>{p.summary[l]}</Text>
                      </p>
                      <p className={s.status}>{t(`featured.status.${p.status}`)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </Trunk>
    </main>
  );
}
