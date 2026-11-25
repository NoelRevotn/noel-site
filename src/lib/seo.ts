import type { Metadata } from "next";
import { profile } from "../../content/profile";
import { site } from "../../site.config";
import { withBase } from "./paths";

/** Absolute URL for a locale + path, e.g. ("es", "/cv") → https://…/noel-site/es/cv/ */
export function absoluteUrl(locale: string, path = "/") {
  const clean = path === "/" ? "" : path.replace(/\/$/, "");
  return `${site.origin}${withBase(`/${locale}${clean}/`)}`;
}

/** Per-page metadata: title, description, canonical, hreflang alternates, Open Graph (PLAN §9). */
export function pageMetadata(locale: string, path: string, title: string, description: string): Metadata {
  const languages = Object.fromEntries(site.locales.map((l) => [l, absoluteUrl(l, path)]));
  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(locale, path),
      languages: { ...languages, "x-default": absoluteUrl("en", path) },
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(locale, path),
      siteName: "Noel Echeverría",
      locale: locale === "es" ? "es_PA" : "en_US",
      type: "website",
      // Night-platform artwork (ChatGPT, text-free) with the name set in Archivo (PLAN decision log).
      images: [
        {
          url: withBase("/og.jpg"),
          width: 1200,
          height: 630,
          type: "image/jpeg",
          alt: "Noel Echeverría: Systems & Computer Engineering student building AI agents and data tools",
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** JSON-LD Person for search engines and recruiting tools (PLAN §9). Facts from content only. */
export function personJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: profile.fullName,
    url: absoluteUrl(locale),
    ...(profile.email ? { email: `mailto:${profile.email}` } : {}),
    jobTitle:
      locale === "es"
        ? "Estudiante de Ingeniería de Sistemas y Computación"
        : "Systems and Computer Engineering student",
    address: { "@type": "PostalAddress", addressLocality: "Panama City", addressCountry: "PA" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Universidad Tecnológica de Panamá" },
    knowsLanguage: ["es", "en"],
    sameAs: [profile.links.github, profile.links.linkedin],
  };
}
