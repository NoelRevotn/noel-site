import { getPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** RSS 2.0 feed of published posts (English, the required language; PLAN §6.3). */
export async function GET() {
  const posts = await getPosts();
  const items = posts
    .map((p) => {
      const url = absoluteUrl("en", `/blog/${p.slug}`);
      return `<item><title>${esc(p.meta.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(p.meta.date).toUTCString()}</pubDate><description>${esc(p.meta.description)}</description>${p.meta.tags.map((t) => `<category>${esc(t)}</category>`).join("")}</item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Noel Echeverría · Writing</title><link>${absoluteUrl("en", "/blog")}</link><description>Notes on what I build and learn: ML, systems and the web.</description><language>en</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
