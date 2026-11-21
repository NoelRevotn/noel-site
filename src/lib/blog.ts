import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import GithubSlugger from "github-slugger";
import type { ComponentType } from "react";
import { PostMeta } from "../../content/schema";

/**
 * Blog content: content/blog/<slug>/{en.mdx, es.mdx?}. English is required, Spanish optional
 * (PLAN §6.3). Metadata is validated with Zod; drafts are excluded unless SHOW_DRAFTS=1.
 */
const ROOT = join(process.cwd(), "content", "blog");
const showDrafts = process.env.SHOW_DRAFTS === "1";

export type Heading = { depth: 2 | 3; text: string; id: string };
export type Post = {
  slug: string;
  meta: PostMeta;
  /** Locales that have their own translation. */
  locales: ("en" | "es")[];
  readingMinutes: number;
  toc: Heading[];
};

function source(slug: string, locale: string) {
  return readFileSync(join(ROOT, slug, `${locale}.mdx`), "utf8");
}

/** Prose only: drop the metadata export and fenced code before counting words or headings. */
function prose(mdx: string) {
  return mdx.replace(/^export const metadata[\s\S]*?\n};?\n/m, "").replace(/```[\s\S]*?```/g, "");
}

/** Same slugger rehype-slug uses, so TOC links always match heading ids. */
function tableOfContents(mdx: string): Heading[] {
  const slugger = new GithubSlugger();
  return prose(mdx)
    .split("\n")
    .flatMap((line) => {
      const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
      if (!m) return [];
      const text = m[2]!.replace(/[*_`]/g, "");
      return [{ depth: m[1]!.length as 2 | 3, text, id: slugger.slug(text) }];
    });
}

async function loadMeta(slug: string): Promise<PostMeta> {
  const mod = (await import(`../../content/blog/${slug}/en.mdx`)) as { metadata?: unknown };
  const parsed = PostMeta.safeParse(mod.metadata);
  if (!parsed.success)
    throw new Error(`content/blog/${slug}/en.mdx: invalid metadata\n${parsed.error.message}`);
  return parsed.data;
}

export async function getPosts(): Promise<Post[]> {
  if (!existsSync(ROOT)) return [];
  const slugs = readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(ROOT, d.name, "en.mdx")))
    .map((d) => d.name);
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const en = source(slug, "en");
      const words = prose(en).split(/\s+/).filter(Boolean).length;
      return {
        slug,
        meta: await loadMeta(slug),
        locales: existsSync(join(ROOT, slug, "es.mdx")) ? (["en", "es"] as const) : (["en"] as const),
        readingMinutes: Math.max(1, Math.round(words / 220)),
        toc: tableOfContents(en),
      } as Post;
    }),
  );
  return posts
    .filter((p) => showDrafts || !p.meta.draft)
    .sort((a, b) => b.meta.date.localeCompare(a.meta.date));
}

/** The MDX component for a post in a locale, falling back to English when there's no translation. */
export async function getPostBody(slug: string, locale: string) {
  const lang = locale === "es" && existsSync(join(ROOT, slug, "es.mdx")) ? "es" : "en";
  const mod = (await import(`../../content/blog/${slug}/${lang}.mdx`)) as { default: ComponentType };
  const toc = tableOfContents(source(slug, lang));
  return { Body: mod.default, lang, toc };
}
