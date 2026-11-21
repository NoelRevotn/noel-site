import type { Metadata } from "next";
import { site } from "../site.config";
import { withBase } from "@/lib/paths";

// GitHub Pages has no server, so it can't send a redirect: we use a static page
// (meta refresh + a visible link) instead. PLAN.md §3 i18n; ADR-0002.
const target = withBase(`/${site.defaultLocale}/`);

export const metadata: Metadata = {
  title: "Noel Echeverría",
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${site.origin}${target}`,
    languages: Object.fromEntries([
      ...site.locales.map((l) => [l, `${site.origin}${withBase(`/${l}/`)}`]),
      ["x-default", `${site.origin}${target}`],
    ]),
  },
};

export default function RootRedirect() {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="refresh" content={`0; url=${target}`} />
      </head>
      <body>
        <main>
          <p>
            <a href={target}>Continue to the English site</a> ·{" "}
            <a href={withBase("/es/")} lang="es">
              Ir al sitio en español
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
