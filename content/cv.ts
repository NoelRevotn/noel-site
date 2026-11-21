import type { z } from "zod";
import type { Certification } from "./schema";
import type { L10n } from "./types";

/** CV-only facts from the 2026 CV. The phone number is deliberately left out (Noel, 2026-11-21). */
export const cv = {
  summary: {
    en: "Systems and Computer Engineering student building AI agents and data tools in Python (FastAPI, Pydantic AI, local LLMs). Samsung Innovation Campus AI scholar seeking an ML, AI or software engineering internship.",
    es: "Estudiante de Ingeniería de Sistemas y Computación que construye agentes de IA y herramientas de datos en Python (FastAPI, Pydantic AI, LLM locales). Becario de IA de Samsung Innovation Campus en busca de una pasantía en ML, IA o ingeniería de software.",
  } satisfies L10n,
  education: [
    {
      school: "Universidad Tecnológica de Panamá (UTP)",
      degree: {
        en: "B.S. in Systems and Computer Engineering",
        es: "Licenciatura en Ingeniería de Sistemas y Computación",
      },
      period: { en: "Mar 2025 – expected Dec 2028", es: "mar. 2025 – dic. 2028 (previsto)" },
      // GPA kept public at Noel's request (2026-11-21).
      detail: { en: "GPA 2.93 / 3.00", es: "Índice 2.93 / 3.00" },
      coursework: {
        en: "Probability and Statistics, Numerical Methods, Programming I–II (C#, Java), Discrete Structures",
        es: "Probabilidad y Estadística, Métodos Numéricos, Programación I–II (C#, Java), Estructuras Discretas",
      },
    },
    {
      school: "José Antonio Remón Cantera",
      degree: {
        en: "High School Diploma in Science, Computer Science emphasis",
        es: "Bachiller en Ciencias con énfasis en Informática",
      },
      period: { en: "2019 – 2024", es: "2019 – 2024" },
      detail: { en: "Graduated first on the honor roll", es: "Primer puesto del cuadro de honor" },
    },
  ],
  awards: [
    {
      en: "World Robot Olympiad (WRO) regional competitor, robot programmed in C++, 2023",
      es: "Competidor regional de la World Robot Olympiad (WRO), robot programado en C++, 2023",
    },
  ] satisfies L10n[],
  languages: {
    en: "Spanish (native), English (advanced, C1)",
    es: "Español (nativo), inglés (avanzado, C1)",
  },
};

export const certifications: z.input<typeof Certification>[] = [
  { name: "Introduction to Modern AI", issuer: "Cisco", year: "2026" },
  { name: "Introduction to Data Science", issuer: "Cisco", year: "2026" },
  { name: "Introduction to Cybersecurity", issuer: "Cisco", year: "2026" },
  { name: "Linux Unhatched", issuer: "Cisco", year: "2026" },
  { name: "Claude Code 101", issuer: "Anthropic", year: "2026" },
  { name: "Technical Support Fundamentals", issuer: "Google", year: "2025" },
];
