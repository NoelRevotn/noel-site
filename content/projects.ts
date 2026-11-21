import type { z } from "zod";
import type { Project } from "./schema";

/**
 * Projects. Facts come from Noel's 2026 CV and his public GitHub profile README.
 * Anything not yet confirmed is a TODO(noel); `pnpm check:content` lists them and a release
 * build fails while any remain (PLAN §0 rule 2, §6.4).
 */
export const projects: z.input<typeof Project>[] = [
  {
    slug: "buddy",
    title: "Buddy",
    summary: { en: "Local-first personal AI agent", es: "Agente personal de IA, local primero" },
    what: {
      en: "A personal AI agent that plans, asks before acting, and keeps personal data on my machine.",
      es: "Un agente personal de IA que planifica, pregunta antes de actuar y mantiene los datos personales en mi computadora.",
    },
    context: { en: "Personal project, in progress.", es: "Proyecto personal, en progreso." },
    period: "2026",
    domains: ["ml", "sys"],
    stack: { ml: ["Ollama (local models)", "pgvector"], sys: ["Python", "PostgreSQL"] },
    status: "in-progress",
    featured: true,
    caseStudy: {
      problem: {
        en: "A personal assistant needs access to personal data, and I want that data to stay on my own machine. TODO(noel): the concrete tasks Buddy handles for you.",
        es: "Un asistente personal necesita acceso a datos personales, y quiero que esos datos se queden en mi propia computadora. TODO(noel): las tareas concretas que Buddy resuelve.",
      },
      approach: {
        en: "Buddy plans its steps and asks before it acts. TODO(noel): how planning and the confirmation step work.",
        es: "Buddy planifica sus pasos y pregunta antes de actuar. TODO(noel): cómo funcionan la planificación y la confirmación.",
      },
      architecture: {
        en: "A Python core, PostgreSQL with pgvector, and local models served by Ollama. TODO(noel): how the pieces connect.",
        es: "Un núcleo en Python, PostgreSQL con pgvector y modelos locales servidos por Ollama. TODO(noel): cómo se conectan las piezas.",
      },
      results: {
        en: "TODO(noel): what works today (real results only).",
        es: "TODO(noel): qué funciona hoy (solo resultados reales).",
      },
      learned: {
        en: "TODO(noel): what you learned so far.",
        es: "TODO(noel): qué has aprendido hasta ahora.",
      },
    },
  },
  {
    slug: "datalizer",
    title: "DataLizer",
    summary: {
      en: "Samsung Innovation Campus team project. TODO(noel): one-line summary.",
      es: "Proyecto en equipo de Samsung Innovation Campus. TODO(noel): resumen de una línea.",
    },
    what: {
      en: "TODO(noel): what DataLizer does, in one or two sentences.",
      es: "TODO(noel): qué hace DataLizer, en una o dos oraciones.",
    },
    context: {
      en: "Team project in the Samsung Innovation Campus AI and Python program, 2026.",
      es: "Proyecto en equipo del programa de IA y Python de Samsung Innovation Campus, 2026.",
    },
    role: { en: "TODO(noel): your part in the team.", es: "TODO(noel): tu parte en el equipo." },
    period: "2026",
    domains: ["ml"],
    stack: { ml: ["Python"] },
    status: "in-progress",
    featured: true,
    caseStudy: {
      problem: {
        en: "TODO(noel): the problem DataLizer tackles.",
        es: "TODO(noel): el problema que aborda DataLizer.",
      },
      approach: {
        en: "TODO(noel): how the team approached it.",
        es: "TODO(noel): cómo lo abordó el equipo.",
      },
      architecture: {
        en: "TODO(noel): data, tools and components.",
        es: "TODO(noel): datos, herramientas y componentes.",
      },
      results: { en: "TODO(noel): real results only.", es: "TODO(noel): solo resultados reales." },
      learned: { en: "TODO(noel): what you learned.", es: "TODO(noel): qué aprendiste." },
    },
  },
  {
    slug: "h2oeste",
    title: "H2Oeste",
    summary: {
      en: "Multi-agent water-tanker coordination system",
      es: "Sistema multiagente para coordinar carros cisterna",
    },
    what: {
      en: "AI agents turn citizens' Telegram reports into optimized water-tanker routes.",
      es: "Agentes de IA convierten los reportes ciudadanos por Telegram en rutas optimizadas de carros cisterna.",
    },
    context: {
      en: "Built in 24 hours by a team of three at the GitHub FISC AI Agents Hackathon, 2026.",
      es: "Construido en 24 horas por un equipo de tres en el GitHub FISC AI Agents Hackathon, 2026.",
    },
    role: {
      en: "I owned the FastAPI backend, the authorization layer, the React operations dashboard and the Telegram bot that receives reports.",
      es: "Me encargué del backend en FastAPI, la capa de autorización, el panel de operaciones en React y el bot de Telegram que recibe los reportes.",
    },
    period: "2026",
    domains: ["ml", "sys", "web"],
    stack: {
      ml: ["Gemini", "OR-Tools"],
      sys: ["Python", "FastAPI", "Supabase"],
      web: ["React", "Telegram Bot API"],
    },
    status: "prototype",
    featured: true,
  },
  {
    slug: "agentequery",
    title: "AgenteQuery",
    summary: {
      en: "Hotel management app with an AI query assistant",
      es: "App de gestión hotelera con un asistente de consultas con IA",
    },
    what: {
      en: "A desktop hotel-management system with a natural-language assistant that answers questions about hotel data using local (Ollama) or cloud (Gemini) LLMs, with persistent chat history.",
      es: "Un sistema de escritorio para gestión hotelera con un asistente en lenguaje natural que responde preguntas sobre los datos del hotel con LLM locales (Ollama) o en la nube (Gemini), con historial de chat persistente.",
    },
    context: { en: "UTP course project.", es: "Proyecto de curso en la UTP." },
    role: {
      en: "I designed the initial architecture and added the AI assistant.",
      es: "Diseñé la arquitectura inicial y agregué el asistente de IA.",
    },
    domains: ["ml", "sys"],
    stack: { ml: ["Ollama", "Gemini API"], sys: ["C#", "WinForms", "SQLite"] },
    status: "prototype",
    featured: false,
  },
  {
    slug: "itinera",
    title: "ITINERA",
    summary: { en: "All-in-one travel itinerary app", es: "App todo en uno para itinerarios de viaje" },
    what: {
      en: "A prototype combining routes, hotel bookings, trip budgets and travel documents in one app, deployed on Netlify.",
      es: "Un prototipo que combina rutas, reservas de hotel, presupuestos y documentos de viaje en una sola app, publicado en Netlify.",
    },
    context: {
      en: "UTP Human-Computer Interaction project, under faculty supervision.",
      es: "Proyecto de Interacción Humano-Computadora en la UTP, con supervisión docente.",
    },
    domains: ["web"],
    stack: { web: ["Netlify"] },
    status: "prototype",
    featured: false,
  },
];
