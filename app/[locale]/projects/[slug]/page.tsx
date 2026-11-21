import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LineCode, StationMark, Stop, Trunk } from "@/components/ui/Stop";
import { PageTitle, Text } from "@/components/ui/Text";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { projectBySlug, projects } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import s from "./project.module.css";

type Props = { params: Promise<{ locale: string; slug: string }> };
const CODE = { ml: "ML", sys: "SY", web: "WB" } as const;
const SECTIONS = ["problem", "approach", "architecture", "results", "learned"] as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = projectBySlug(slug);
  if (!p) return {};
  const l = locale as "en" | "es";
  return pageMetadata(locale, `/projects/${slug}`, `${p.title} · Noel Echeverría`, p.summary[l]);
}

/** A project page; a case study (Problem → Approach → Architecture → Results → Learned) when one exists. */
export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const p = projectBySlug(slug);
  if (!p) notFound();
  const t = await getTranslations();
  const l = locale as "en" | "es";

  return (
    <main id="main">
      <Trunk>
        <PageTitle lead={p.summary[l]}>{p.title}</PageTitle>

        <div className={s.facts}>
          <p className={s.what}>
            <Text>{p.what[l]}</Text>
          </p>
          <p className={s.muted}>
            <Text>{p.context[l]}</Text>
          </p>
          {p.role && (
            <p>
              <strong>{t("featured.role")}:</strong> <Text>{p.role[l]}</Text>
            </p>
          )}
          <dl className={s.meta}>
            <div>
              <dt>{t("projects.status")}</dt>
              <dd>
                <StationMark built={p.status !== "in-progress"} /> {t(`featured.status.${p.status}`)}
              </dd>
            </div>
            {p.period && (
              <div>
                <dt>{t("projects.period")}</dt>
                <dd className="mono">{p.period}</dd>
              </div>
            )}
            <div>
              <dt>{t("projects.stack")}</dt>
              <dd className={s.stack}>
                {(Object.keys(p.stack) as (keyof typeof CODE)[]).map((d) => (
                  <span key={d} data-line={d}>
                    <LineCode line={d}>{CODE[d]}</LineCode> {p.stack[d]?.join(", ")}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>

        {p.caseStudy &&
          SECTIONS.map((key) => (
            <Stop key={key} id={key} title={t(`projects.${key}`)}>
              <p className={s.body} data-reveal>
                <Text>{p.caseStudy![key][l]}</Text>
              </p>
            </Stop>
          ))}

        <p className={s.back}>
          <Link prefetch={false} href="/projects">
            {t("projects.back")}
          </Link>
        </p>
      </Trunk>
    </main>
  );
}
