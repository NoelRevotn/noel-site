import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { StationMark, Trunk } from "@/components/ui/Stop";
import { PageTitle } from "@/components/ui/Text";
import { Link } from "@/i18n/navigation";
import { getPosts } from "@/lib/blog";
import { withBase } from "@/lib/paths";
import { pageMetadata } from "@/lib/seo";
import s from "./blog.module.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return {
    ...pageMetadata(locale, "/blog", `${t("title")} · Noel Echeverría`, t("lead")),
    alternates: {
      ...pageMetadata(locale, "/blog", t("title"), t("lead")).alternates,
      types: { "application/rss+xml": withBase("/rss.xml") },
    },
  };
}

/** Writing index: newest first, each post a station on the line. */
export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const posts = await getPosts();
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" });

  return (
    <main id="main">
      <Trunk>
        <PageTitle icon="write" lead={t("lead")}>
          {t("title")}
        </PageTitle>
        <div className={s.index}>
          {posts.length === 0 ? (
            <p className={s.empty}>
              <StationMark built={false} /> {t("empty")}
            </p>
          ) : (
            <ol className={s.posts}>
              {posts.map((p, i) => (
                <li
                  key={p.slug}
                  className={s.post}
                  data-reveal
                  style={{ "--reveal-i": i } as React.CSSProperties}
                >
                  <time className="mono" dateTime={p.meta.date}>
                    {fmt.format(new Date(p.meta.date))}
                  </time>
                  <h2 className={s.title}>
                    <Link prefetch={false} href={`/blog/${p.slug}`}>
                      {p.meta.title}
                    </Link>
                  </h2>
                  <p className={s.desc}>{p.meta.description}</p>
                  <p className={s.meta}>
                    {t("minutes", { n: p.readingMinutes })}
                    {locale === "es" && !p.locales.includes("es") && <> · {t("onlyEnglish")}</>}
                  </p>
                  {p.meta.tags.length > 0 && (
                    <ul className={s.tags} aria-label={t("tags")}>
                      {p.meta.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          )}
          <p className={s.rss}>
            <a href={withBase("/rss.xml")}>{t("rss")}</a>
          </p>
        </div>
      </Trunk>
    </main>
  );
}
