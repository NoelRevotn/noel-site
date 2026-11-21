import type { L10n } from "./types";

export type DevelopingArea = { topic: L10n; via: string; startedAt: string };

// In-progress programs from the CV.
// TODO(noel): confirm other growth areas to show here (e.g. Docker, RAG, auth), PLAN §4.
export const developing: DevelopingArea[] = [
  { topic: { en: "AI and Python", es: "IA y Python" }, via: "Samsung Innovation Campus", startedAt: "2026" },
  {
    topic: { en: "Data science", es: "Ciencia de datos" },
    via: "GCI World, Matsuo-Iwasawa Lab, University of Tokyo",
    startedAt: "2026",
  },
];
