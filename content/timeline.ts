import type { L10n } from "./types";

export type TimelineEntry = {
  kind: "education" | "work" | "program";
  title: L10n;
  org: string;
  start: string;
  end: string | null; // null = ongoing
  note?: L10n;
};

// From the 2026 CV. Non-technical roles are framed by transferable skills (PLAN §4).
export const timeline: TimelineEntry[] = [
  {
    kind: "education",
    title: {
      en: "B.S. in Systems and Computer Engineering",
      es: "Licenciatura en Ingeniería de Sistemas y Computación",
    },
    org: "Universidad Tecnológica de Panamá",
    start: "2025-03",
    end: null,
    note: { en: "Expected December 2028.", es: "Graduación prevista: diciembre de 2028." },
  },
  {
    kind: "program",
    title: { en: "AI and Python scholarship", es: "Beca de IA y Python" },
    org: "Samsung Innovation Campus",
    start: "2026",
    end: null,
  },
  {
    kind: "work",
    title: {
      en: "Customer Service Representative, Verizon account",
      es: "Representante de servicio al cliente, cuenta Verizon",
    },
    org: "Alorica",
    start: "2026-01",
    end: "2026-04",
    note: {
      en: "Troubleshot home and mobile network issues and met every customer-satisfaction target.",
      es: "Resolví problemas de red domésticos y móviles y cumplí todas las metas de satisfacción del cliente.",
    },
  },
  {
    kind: "work",
    title: {
      en: "Technical Support Specialist (professional practice)",
      es: "Especialista de soporte técnico (práctica profesional)",
    },
    org: "Ministry of the Presidency of Panama",
    start: "2024-10",
    end: "2025-01",
    note: {
      en: "Deployed Windows 11 on about 50 workstations with scripts and analyzed the IT inventory in Power BI.",
      es: "Desplegué Windows 11 en unas 50 estaciones con scripts y analicé el inventario de TI en Power BI.",
    },
  },
];
