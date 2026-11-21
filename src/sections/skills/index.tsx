import { getLocale, getTranslations } from "next-intl/server";
import { Stop } from "@/components/ui/Stop";
import { SkillOrb } from "@/islands/skill-orb/SkillOrb";
import { projects, skillGroups } from "@/lib/content";
import s from "./skills.module.css";

/** Skills as a 3D orb: domain-coloured skills on the shell, the projects that prove them inside. */
export async function Skills() {
  const t = await getTranslations("skills");
  const ts = await getTranslations("sections");
  const locale = (await getLocale()) as "en" | "es";
  const used = new Set(skillGroups.flatMap((g) => g.skills.flatMap((sk) => sk.evidence)));
  return (
    <Stop id="skills" title={ts("skills")}>
      <p className={s.intro}>{t("intro")}</p>
      <SkillOrb
        groups={skillGroups.map((g) => ({ id: g.id, name: g.name[locale], skills: g.skills }))}
        projects={projects.filter((p) => used.has(p.slug)).map((p) => ({ slug: p.slug, title: p.title }))}
        labels={{
          title: t("graphTitle"),
          hint: t("graphHint"),
          usedIn: t("orbUsedIn"),
          uses: t("orbUses"),
          nothing: t("nothing"),
          projects: t("orbProjects"),
        }}
      />
    </Stop>
  );
}
