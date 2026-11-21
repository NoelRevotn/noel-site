import { getLocale, getTranslations } from "next-intl/server";
import { Stop } from "@/components/ui/Stop";
import { projects } from "../../../content/projects";
import { skillGroups } from "../../../content/skills";
import s from "./skills.module.css";

/** Each domain is a line; its skills are stations. Evidence links jump to the project that used it. */
export async function Skills() {
  const t = await getTranslations("skills");
  const ts = await getTranslations("sections");
  const locale = (await getLocale()) as "en" | "es";
  const title = (slug: string) => projects.find((p) => p.slug === slug)?.title ?? slug;
  return (
    <Stop id="skills" title={ts("skills")}>
      <p className={s.intro}>{t("intro")}</p>
      <div className={s.groups}>
        {skillGroups.map((g, i) => (
          <section
            key={g.id}
            className={s.group}
            data-line={g.id}
            data-reveal
            style={{ "--reveal-i": i } as React.CSSProperties}
          >
            <h3 className={s.name}>{g.name[locale]}</h3>
            <ol className={s.line}>
              {g.skills.map((sk) => (
                <li key={sk.name} className={s.station} data-built={sk.evidence.length > 0}>
                  <span className={s.skill}>{sk.name}</span>
                  {sk.evidence.length > 0 && (
                    <span className={s.evidence}>
                      {t("usedIn")}{" "}
                      {sk.evidence.map((slug, k) => (
                        <span key={slug}>
                          {k > 0 && ", "}
                          <a href={`#project-${slug}`}>{title(slug)}</a>
                        </span>
                      ))}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </Stop>
  );
}
