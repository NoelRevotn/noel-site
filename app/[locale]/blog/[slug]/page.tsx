import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Trunk } from "@/components/ui/Stop";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getPostBody, getPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";
import s from "./post.module.css";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

/** Static export needs at least one page per dynamic route; with no published posts yet we emit a
 *  noindex placeholder that points back to the index. It disappears once a real post exists. */
const EMPTY = "_empty";

export async function generateStaticParams() {
  const posts = await getPosts();
  const slugs = posts.length ? posts.map((p) => p.slug) : [EMPTY];
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (slug === EMPTY) return { robots: { index: false, follow: true } };
  const post = (await getPosts()).find((p) => p.slug === slug);
  if (!post) return {};
  const base = pageMetadata(
    locale,
    `/blog/${slug}`,
    `${post.meta.title} · Noel Echeverría`,
    post.meta.description,
  );
  return {
    ...base,
    openGraph: { ...base.openGraph, type: "article", publishedTime: post.meta.date, tags: post.meta.tags },
  };
}

export default async function PostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  if (slug === EMPTY) {
    return (
      <main id="main">
        <Trunk>
          <article className={s.article}>
            <p className={s.lead}>{t("empty")}</p>
            <p className={s.back}>
              <Link prefetch={false} href="/blog">
                {t("back")}
              </Link>
            </p>
          </article>
        </Trunk>
      </main>
    );
  }
  const post = (await getPosts()).find((p) => p.slug === slug);
  if (!post) notFound();
  const { Body, lang, toc } = await getPostBody(slug, locale);
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" });
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.meta.title,
    description: post.meta.description,
    datePublished: post.meta.date,
    ...(post.meta.updated ? { dateModified: post.meta.updated } : {}),
    inLanguage: lang,
    author: { "@type": "Person", name: "Noel Echeverría" },
    keywords: post.meta.tags.join(", "),
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Trunk>
        <article className={s.article} lang={lang}>
          <header className={s.head}>
            <p className={`mono ${s.meta}`}>
              <time dateTime={post.meta.date}>{fmt.format(new Date(post.meta.date))}</time> ·{" "}
              {t("minutes", { n: post.readingMinutes })}
            </p>
            <h1 className={s.title}>{post.meta.title}</h1>
            <p className={s.lead}>{post.meta.description}</p>
            {locale !== lang && (
              <p className={s.notice} lang={locale}>
                {t("onlyEnglish")}
              </p>
            )}
          </header>

          <div className={s.layout}>
            {toc.length > 1 && (
              <nav className={s.toc} aria-label={t("toc")} lang={locale}>
                <p className={s.tocTitle}>{t("toc")}</p>
                <ol>
                  {toc.map((h) => (
                    <li key={h.id} data-depth={h.depth}>
                      <a href={`#${h.id}`}>{h.text}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <div className={s.prose}>
              <Body />
            </div>
          </div>

          <p className={s.back} lang={locale}>
            <Link prefetch={false} href="/blog">
              {t("back")}
            </Link>
          </p>
        </article>
      </Trunk>
    </main>
  );
}
