import type { Domain, L10n } from "./types";

export type Project = {
  slug: string;
  title: string;
  summary: L10n;
  what: L10n;
  context: L10n;
  role?: L10n;
  domains: Domain[];
  stack: Partial<Record<Domain, string[]>>;
  status: "shipped" | "prototype" | "in-progress";
  featured: boolean;
};

// CV facts only. Case-study claims wait for Noel's notes (PLAN §6.1).
export const projects: Project[] = [
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
    featured: true,
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
    featured: true,
  },
];
