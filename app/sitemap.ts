import type { MetadataRoute } from "next";
import { projects } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";
import { site } from "../site.config";

export const dynamic = "force-static";

const PATHS = ["/", "/projects", "/cv", "/blog", "/contact", "/colophon"];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...PATHS, ...projects.map((p) => `/projects/${p.slug}`)];
  return paths.map((path) => ({
    url: absoluteUrl("en", path),
    alternates: { languages: Object.fromEntries(site.locales.map((l) => [l, absoluteUrl(l, path)])) },
  }));
}
