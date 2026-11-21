import type { Metadata } from "next";
import { withBase } from "@/lib/paths";

// Becomes out/404.html, which GitHub Pages serves for any unknown URL.
// The root layout renders no <html> (see app/layout.tsx), so this page renders the full document.
// Phase 2 replaces it with the on-brand 404 (PLAN.md §4).
export const metadata: Metadata = { title: "404 · Noel Echeverría", robots: { index: false } };

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <main>
          <h1>Page not found</h1>
          <p>
            <a href={withBase("/en/")}>Go to the home page</a> ·{" "}
            <a href={withBase("/es/")} lang="es">
              Ir al inicio
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
