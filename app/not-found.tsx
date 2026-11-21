import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { withBase } from "@/lib/paths";
import { HEAD_SCRIPT } from "@/lib/theme-script";
import "@/styles/globals.css";
import s from "./not-found.module.css";

// Becomes out/404.html, which GitHub Pages serves for every unknown URL in either language,
// so it speaks both. The root layout renders no <html>, so this page renders the full document.
export const metadata: Metadata = { title: "404 · Noel Echeverría", robots: { index: false } };

export default function NotFound() {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
      </head>
      <body>
        <main className={s.page}>
          <div className={s.line} aria-hidden="true">
            <span className={s.end} />
            <span className={s.gap} />
            <span className={s.end} />
          </div>
          <p className={`mono ${s.code}`}>404</p>
          <h1 className={s.title}>Wrong line</h1>
          <p className={s.text}>This stop doesn&apos;t exist. Head back to a station that does.</p>
          <p className={s.text} lang="es">
            <strong>Línea equivocada.</strong> Esta parada no existe.
          </p>
          <p className={s.actions}>
            <a className={s.primary} href={withBase("/en/")}>
              Go home
            </a>
            <a className={s.secondary} href={withBase("/es/")} lang="es">
              Ir al inicio
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
