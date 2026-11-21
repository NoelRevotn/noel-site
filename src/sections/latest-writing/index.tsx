import { getLocale, getTranslations } from "next-intl/server";
import { LineIcon } from "@/components/icons/LineIcon";
import { Scene } from "@/components/scene/Scene";
import { Link } from "@/i18n/navigation";
import { getPosts } from "@/lib/blog";
import s from "./writing.module.css";

/** The latest published posts; an honest empty state until the first one ships. */
export async function LatestWriting({ limit = 3 }: { limit?: number }) {
  const t = await getTranslations();
  const locale = await getLocale();
  const posts = (await getPosts()).slice(0, limit);
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" });
  return (
    <Scene id="writing" title={t("home.writing")} icon={<LineIcon name="write" />}>
      {posts.length === 0 ? (
        <p className={s.empty} data-reveal>
          <span className={s.ring} aria-hidden="true" />
          {t("blog.empty")}
        </p>
      ) : (
        <ol className={s.list}>
          {posts.map((p, i) => (
            <li key={p.slug} data-reveal style={{ "--reveal-i": i } as React.CSSProperties}>
              <time className="mono" dateTime={p.meta.date}>
                {fmt.format(new Date(p.meta.date))}
              </time>
              <Link prefetch={false} href={`/blog/${p.slug}`} className={s.title}>
                {p.meta.title}
              </Link>
              <span className={s.desc}>{p.meta.description}</span>
            </li>
          ))}
        </ol>
      )}
    </Scene>
  );
}
