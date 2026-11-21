import type { L10n } from "./types";

export type DevelopingArea = { topic: L10n; via: string; startedAt: string };

// In-progress programs (CV) and tools marked "learning" on Noel's GitHub profile README.
export const developing: DevelopingArea[] = [
  { topic: { en: "AI and Python", es: "IA y Python" }, via: "Samsung Innovation Campus", startedAt: "2026" },
  {
    topic: { en: "Data science", es: "Ciencia de datos" },
    via: "GCI World, Matsuo-Iwasawa Lab, University of Tokyo",
    startedAt: "2026",
  },
  { topic: { en: "scikit-learn", es: "scikit-learn" }, via: "Self-study", startedAt: "2026" },
  { topic: { en: "Docker", es: "Docker" }, via: "Self-study", startedAt: "2026" },
];
