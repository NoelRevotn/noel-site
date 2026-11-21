import { getLocale, getTranslations } from "next-intl/server";
import { LineIcon, PROJECT_ICON } from "@/components/icons/LineIcon";
import { Scene } from "@/components/scene/Scene";
import { Text } from "@/components/ui/Text";
import { Link } from "@/i18n/navigation";
import { ProjectSlider } from "@/islands/project-slider/ProjectSlider";
import { projects } from "@/lib/content";
import s from "./featured.module.css";

/** Selected work: one card per project with its icon, its name and one line. */
export async function FeaturedProjects({ limit = 3 }: { limit?: number }) {
  const t = await getTranslations();
  const locale = (await getLocale()) as "en" | "es";
  const items = projects.filter((p) => p.featured).slice(0, limit);
  return (
    <Scene id="work" title={t("home.work")}>
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
            <LineIcon name={PROJECT_ICON[p.slug] ?? "train"} line={p.domains[0]} size="4rem" />
            <h3 className={s.title}>{p.title}</h3>
            <p className={s.summary}>
              <Text>{p.summary[locale]}</Text>
            </p>
            <Link prefetch={false} href={`/projects/${p.slug}`} className={s.open}>
              {t("featured.open")}
              <span className="visually-hidden">: {p.title}</span>
            </Link>
          </article>
        ))}
      </ProjectSlider>
    </Scene>
  );
}
