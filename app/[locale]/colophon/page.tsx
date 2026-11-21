import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Stop, Trunk } from "@/components/ui/Stop";
import { PageTitle } from "@/components/ui/Text";
import { Tokenizer } from "@/islands/tokenizer/Tokenizer";
import { profile } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import s from "./colophon.module.css";

type Props = { params: Promise<{ locale: string }> };

const COPY = {
  en: {
    stackTitle: "Stack",
    stack: [
      ["Framework", "Next.js 16 (App Router), static export, React 19, TypeScript strict"],
      ["Hosting", "GitHub Pages, deployed by GitHub Actions on every merge to main"],
      ["Styling", "Plain CSS: design tokens as custom properties plus CSS Modules"],
      ["Languages", "next-intl, English and Spanish under /en/ and /es/"],
      [
        "3D and motion",
        "three.js for the network map (loaded after first paint), Motion for layout and scroll reveals, CSS for the rest",
      ],
      ["Content", "Typed files validated with Zod at build time"],
      ["Quality", "ESLint, Prettier, Vitest, Playwright with axe accessibility checks in CI"],
    ],
    designTitle: "Design",
    design:
      "The site is a transit network. Domains are lines (ML/AI red, systems green, web blue), work is stations, and the navigation is the line you ride. Filled stations are built; hollow ones are in progress. Type: Archivo, Atkinson Hyperlegible Next and Azeret Mono, all under the SIL Open Font License.",
    a11yTitle: "Accessibility",
    a11y: "Built to WCAG 2.2 AA: full keyboard use, visible focus, a pause switch for all motion, and no motion at all when your system asks for reduced motion.",
    perfTitle: "Performance",
    perf: "Lighthouse scores are measured and published here in Phase 5.",
    source: "Read the source on GitHub",
    tok: {
      title: "Tokenizer toy",
      intro: "Language models read text as tokens, not letters. Type something and watch it split.",
      input: "Text to tokenize",
      placeholder: "Type here…",
      tokens: "tokens",
      chars: "characters",
      note: "An illustration: words and punctuation are split the way GPT-2-style tokenizers pre-split text, long words are cut into toy subword pieces, and the IDs are hashes, not a real model's vocabulary.",
      initial: "Tokenizers split text into pieces like these.",
    },
  },
  es: {
    stackTitle: "Tecnologías",
    stack: [
      ["Framework", "Next.js 16 (App Router), exportación estática, React 19, TypeScript estricto"],
      ["Hosting", "GitHub Pages, desplegado con GitHub Actions en cada merge a main"],
      ["Estilos", "CSS plano: tokens de diseño como propiedades personalizadas y CSS Modules"],
      ["Idiomas", "next-intl, inglés y español en /en/ y /es/"],
      [
        "3D y movimiento",
        "three.js para el mapa de la red (se carga después del primer pintado), Motion para layout y revelados al hacer scroll, CSS para lo demás",
      ],
      ["Contenido", "Archivos tipados validados con Zod al compilar"],
      ["Calidad", "ESLint, Prettier, Vitest, Playwright con pruebas de accesibilidad axe en CI"],
    ],
    designTitle: "Diseño",
    design:
      "El sitio es una red de transporte. Las áreas son líneas (ML/IA rojo, sistemas verde, web azul), el trabajo son estaciones y la navegación es la línea que recorres. Las estaciones llenas están construidas; las huecas están en progreso. Tipografía: Archivo, Atkinson Hyperlegible Next y Azeret Mono, todas con licencia SIL Open Font License.",
    a11yTitle: "Accesibilidad",
    a11y: "Hecho según WCAG 2.2 AA: uso completo con teclado, foco visible, un interruptor para pausar todo el movimiento y nada de movimiento cuando tu sistema pide reducirlo.",
    perfTitle: "Rendimiento",
    perf: "Las puntuaciones de Lighthouse se miden y publican aquí en la fase 5.",
    source: "Ver el código en GitHub",
    tok: {
      title: "Juguete de tokenización",
      intro:
        "Los modelos de lenguaje leen texto como tokens, no como letras. Escribe algo y mira cómo se divide.",
      input: "Texto a tokenizar",
      placeholder: "Escribe aquí…",
      tokens: "tokens",
      chars: "caracteres",
      note: "Una ilustración: palabras y signos se dividen como lo hacen los tokenizadores estilo GPT-2, las palabras largas se cortan en subpalabras de juguete y los IDs son hashes, no el vocabulario de un modelo real.",
      initial: "Los tokenizadores dividen el texto en piezas como estas.",
    },
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "colophon" });
  return pageMetadata(locale, "/colophon", t("title"), t("lead"));
}

export default async function ColophonPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("colophon");
  const c = COPY[locale as "en" | "es"];
  return (
    <main id="main">
      <Trunk>
        <PageTitle lead={t("lead")}>{t("title")}</PageTitle>
        <Stop id="stack" title={c.stackTitle}>
          <dl className={s.stack}>
            {c.stack.map(([k, v]) => (
              <div key={k} data-reveal>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </Stop>
        <Stop id="design" title={c.designTitle}>
          <p className={s.body}>{c.design}</p>
        </Stop>
        <Stop id="a11y" title={c.a11yTitle}>
          <p className={s.body}>{c.a11y}</p>
        </Stop>
        <Stop id="tokenizer" title={c.tok.title}>
          <p className={s.body}>{c.tok.intro}</p>
          <Tokenizer labels={c.tok} initial={c.tok.initial} />
        </Stop>
        <Stop id="perf" title={c.perfTitle}>
          <p className={s.body}>{c.perf}</p>
          <p className={s.body}>
            <a href={profile.links.repo} target="_blank" rel="noreferrer">
              {c.source}
            </a>
          </p>
        </Stop>
      </Trunk>
    </main>
  );
}
