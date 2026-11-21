import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Stop, Trunk } from "@/components/ui/Stop";
import { PageTitle, Text } from "@/components/ui/Text";
import { Link } from "@/i18n/navigation";
import { certifications, cv, profile, projects, skillGroups, timeline } from "@/lib/content";
import { withBase } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";
import s from "./cv.module.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cvPage" });
  return pageMetadata(locale, "/cv", `${t("title")} · Noel Echeverría`, cv.summary[locale as "en" | "es"]);
}

/** Web CV. Print-ready: CI prints this page to /cv/noel-echeverria-cv-{locale}.pdf (no phone number). */
export default async function CvPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const l = locale as "en" | "es";
  const work = timeline.filter((e) => e.kind === "work");
  const programs = timeline.filter((e) => e.kind === "program");

  return (
    <main id="main" className={s.cv}>
      <Trunk>
        <PageTitle
          extra={
            <div className={s.head}>
              <p className={s.contact}>
                {profile.location[l]}
                {profile.email && (
                  <>
                    {" · "}
                    <a href={`mailto:${profile.email}`}>{profile.email}</a>
                  </>
                )}
                {" · "}
                <a href={profile.links.linkedin}>LinkedIn</a>
                {" · "}
                <a href={profile.links.github}>github.com/NoelRevotn</a>
              </p>
              <a className={s.download} href={withBase(`/cv/noel-echeverria-cv-${locale}.pdf`)} download>
                {t("cvPage.download")}
              </a>
            </div>
          }
        >
          {profile.name}
        </PageTitle>

        <Stop id="summary" title={t("cvPage.summary")}>
          <p className={s.lead}>{cv.summary[l]}</p>
        </Stop>

        <Stop id="education" title={t("cvPage.education")}>
          {cv.education.map((e) => (
            <article key={e.school} className={s.entry}>
              <h3>{e.school}</h3>
              <p className={s.sub}>
                {e.degree[l]} <span className="mono">{e.period[l]}</span>
              </p>
              <p>{e.detail[l]}</p>
              {"coursework" in e && e.coursework && <p className={s.muted}>{e.coursework[l]}</p>}
            </article>
          ))}
        </Stop>

        <Stop id="experience" title={t("cvPage.experience")}>
          {work.map((e) => (
            <article key={`${e.org}-${e.start}`} className={s.entry}>
              <h3>{e.org}</h3>
              <p className={s.sub}>
                {e.title[l]}{" "}
                <span className="mono">
                  {e.start} – {e.end ?? "…"}
                </span>
              </p>
              {e.note && <p>{e.note[l]}</p>}
            </article>
          ))}
        </Stop>

        <Stop id="cv-projects" title={t("cvPage.projects")}>
          {projects.map((p) => (
            <article key={p.slug} className={s.entry}>
              <h3>
                <Link prefetch={false} href={`/projects/${p.slug}`}>
                  {p.title}
                </Link>
              </h3>
              <p className={s.sub}>
                <Text>{p.summary[l]}</Text>
              </p>
              <p className={s.what}>
                <Text>{p.what[l]}</Text>
              </p>
            </article>
          ))}
        </Stop>

        <Stop id="cv-skills" title={t("cvPage.skills")}>
          <dl className={s.skills}>
            {skillGroups.map((g) => (
              <div key={g.id}>
                <dt>{g.name[l]}</dt>
                <dd>{g.skills.map((sk) => sk.name).join(", ")}</dd>
              </div>
            ))}
          </dl>
        </Stop>

        <Stop id="certs" title={t("cvPage.certs")}>
          <ul className={s.list}>
            {programs.map((e) => (
              <li key={e.org}>
                <strong>{e.org}</strong>: {e.title[l]} <span className="mono">{e.start}</span>
              </li>
            ))}
            {certifications.map((c) => (
              <li key={c.name}>
                <strong>{c.issuer}</strong>: {c.name} <span className="mono">{c.year}</span>
              </li>
            ))}
          </ul>
        </Stop>

        <Stop id="awards" title={t("cvPage.awards")}>
          <ul className={s.list}>
            {cv.awards.map((a) => (
              <li key={a.en}>{a[l]}</li>
            ))}
            <li>{cv.languages[l]}</li>
          </ul>
        </Stop>
      </Trunk>
    </main>
  );
}
