import type { z } from "zod";
import type { Project } from "./schema";

/**
 * Projects. Facts come from Noel's 2026 CV, his public GitHub profile README, and his own
 * planning documents (Buddy Master Plan v1.3, DataLizer implementation doc v2.0), shared 2026-11-21.
 * Anything not yet confirmed is a TODO(noel); `pnpm check:content` lists them and a release
 * build fails while any remain (PLAN §0 rule 2, §6.4).
 */
export const projects: z.input<typeof Project>[] = [
  {
    slug: "buddy",
    title: "Buddy",
    summary: {
      en: "Local-first, approval-gated personal AI orchestrator",
      es: "Orquestador personal de IA, local primero y con aprobación",
    },
    what: {
      en: "A headless core service that plans work, asks me to approve it, executes it durably and records everything. It runs local models first and keeps personal data on my machine by default.",
      es: "Un servicio central sin interfaz que planifica el trabajo, me pide aprobarlo, lo ejecuta de forma durable y lo registra todo. Usa modelos locales primero y mantiene los datos personales en mi computadora por defecto.",
    },
    context: {
      en: "Personal project. The master plan (v1.3, November 2026) is done; implementation starts at Stage 0.",
      es: "Proyecto personal. El plan maestro (v1.3, noviembre de 2026) está listo; la implementación empieza en la etapa 0.",
    },
    period: "2026",
    domains: ["ml", "sys"],
    stack: {
      ml: ["Ollama (local models)", "pgvector", "Pydantic AI or LangGraph"],
      sys: ["Python", "PostgreSQL", "DBOS", "Tailscale"],
    },
    status: "in-progress",
    featured: true,
    caseStudy: {
      problem: {
        en: "Frontier assistants are powerful, but they don't know my life and work, and they can't act on my own machines and accounts. An assistant that can do both needs deep personal context and real permissions, which makes privacy and control the core problem, not a feature.",
        es: "Los asistentes de frontera son potentes, pero no conocen mi vida ni mi trabajo, y no pueden actuar en mis propias máquinas y cuentas. Un asistente que haga ambas cosas necesita contexto personal profundo y permisos reales, así que la privacidad y el control son el problema central, no una función más.",
      },
      approach: {
        en: "Buddy is an orchestrator, not a competitor to frontier models. It plans, asks for approval and only then acts. Every email, document and web page it reads is treated as untrusted data, never as instructions. Cloud models are pluggable for non-personal work. The agent framework is chosen by evidence: a scored Stage 0 comparison of Pydantic AI and LangGraph on the same task.",
        es: "Buddy es un orquestador, no un competidor de los modelos de frontera. Planifica, pide aprobación y solo entonces actúa. Todo correo, documento o página web que lee se trata como datos no confiables, nunca como instrucciones. Los modelos en la nube se conectan para trabajo no personal. El framework de agentes se elige con evidencia: una comparación puntuada de Pydantic AI y LangGraph en la misma tarea, en la etapa 0.",
      },
      architecture: {
        en: "A headless core service with an API; every interface (terminal first, later desktop, web and Android) is a client. Local models run on Ollama on a desktop GPU. PostgreSQL with pgvector holds relational data, full-text search, vectors and workflow state, next to a human-readable Markdown vault. DBOS gives durable execution. Security rules (plan-level approvals, a quarantined reader for untrusted content, an append-only audit log) are enforced in code, outside the model. Remote access goes through a private Tailscale mesh with nothing exposed to the internet.",
        es: "Un servicio central sin interfaz con una API; cada interfaz (primero la terminal, después escritorio, web y Android) es un cliente. Los modelos locales corren en Ollama sobre una GPU de escritorio. PostgreSQL con pgvector guarda datos relacionales, búsqueda de texto completo, vectores y el estado de los flujos, junto a una bóveda Markdown legible por personas. DBOS da ejecución durable. Las reglas de seguridad (aprobaciones por plan, un lector en cuarentena para contenido no confiable, un registro de auditoría de solo agregado) se aplican en código, fuera del modelo. El acceso remoto pasa por una red privada Tailscale, sin nada expuesto a internet.",
      },
      results: {
        en: "So far: a 20-chapter master plan built from a 200-question discovery interview, covering requirements, architecture, the security model, a ten-stage roadmap with exit criteria, and a learning path. Implementation starts with Stage 0. The first milestone (Stage 1) is Buddy running in the background and proactively telling me about a real deadline.",
        es: "Hasta ahora: un plan maestro de 20 capítulos construido a partir de una entrevista de descubrimiento de 200 preguntas, con requisitos, arquitectura, modelo de seguridad, una hoja de ruta de diez etapas con criterios de salida y una ruta de aprendizaje. La implementación empieza con la etapa 0. El primer hito (etapa 1) es que Buddy corra en segundo plano y me avise de forma proactiva de una fecha límite real.",
      },
      learned: {
        en: "Planning before building paid off: my own review moved storage from SQLite to PostgreSQL with pgvector from Stage 1, removing a migration I would have hit mid-project. I also learned to decide on evidence instead of familiarity, and to treat prompt injection as the top threat by putting the rules in code, where the model can't forget them.",
        es: "Planificar antes de construir valió la pena: mi propia revisión cambió el almacenamiento de SQLite a PostgreSQL con pgvector desde la etapa 1, lo que eliminó una migración que habría llegado a mitad del proyecto. También aprendí a decidir con evidencia y no por familiaridad, y a tratar la inyección de prompts como la amenaza principal poniendo las reglas en código, donde el modelo no puede olvidarlas.",
      },
    },
  },
  {
    slug: "datalizer",
    // Repository shared by Noel; still empty while the project is in development.
    links: { repo: "https://github.com/profesor003-fundesteam/pyzero" },
    title: "DataLizer",
    summary: {
      en: "Dataset preparation and analysis assistant with domain profiles and AI",
      es: "Asistente de preparación y análisis de datasets con perfiles de dominio e IA",
    },
    what: {
      en: "A Streamlit web app that takes a tabular dataset end to end: it diagnoses it, cleans it with safe, logged rules, filters and exports it, and analyzes it with a domain profile (generic, time series or commercial), with charts and a PDF report.",
      es: "Una aplicación web en Streamlit que lleva un dataset tabular de principio a fin: lo diagnostica, lo limpia con reglas seguras y registradas, lo filtra y lo exporta, y lo analiza con un perfil de dominio (genérico, temporal o comercial), con gráficos y un informe PDF.",
    },
    context: {
      en: "Team project (five members) in the Samsung Innovation Campus AI and Python program, 2026. Delivery planned for the end of November 2026.",
      es: "Proyecto en equipo (cinco integrantes) del programa de IA y Python de Samsung Innovation Campus, 2026. Entrega prevista para finales de noviembre de 2026.",
    },
    role: {
      en: "I own data, core and repository: the uv environment, the shared data contracts every role codes against, loading, profiling and cleaning, the API that ties the core together, the demo datasets, a script that injects reproducible errors for the demo, and the automated tests.",
      es: "Me encargo de los datos, el núcleo y el repositorio: el entorno con uv, los contratos de datos compartidos con los que programa cada rol, la carga, el perfilado y la limpieza, la API que une el núcleo, los datasets de demostración, un script que introduce errores reproducibles para la demo y las pruebas automáticas.",
    },
    period: "2026",
    domains: ["ml", "web"],
    stack: {
      ml: ["pandas", "NumPy", "Matplotlib", "Gemini API", "Pydantic"],
      web: ["Streamlit"],
    },
    status: "in-progress",
    featured: true,
    caseStudy: {
      problem: {
        en: "Preparing and analyzing a dataset takes many manual steps, and an AI model can't be trusted to compute numbers. We wanted a tool that guides the whole path, from a raw file to a report, while keeping every calculation verifiable.",
        es: "Preparar y analizar un dataset exige muchos pasos manuales, y no se puede confiar en que un modelo de IA calcule cifras. Queríamos una herramienta que guíe todo el camino, de un archivo crudo a un informe, manteniendo cada cálculo verificable.",
      },
      approach: {
        en: "One principle: Python calculates; the AI proposes and explains. Gemini suggests the analysis profile, turns chart requests written in plain language into chart specs, suggests explorations and explains the metrics. It never writes or runs code, never computes figures and never receives the full dataset, and every response is JSON validated with Pydantic. The whole app also works without AI.",
        es: "Un principio: Python calcula; la IA propone y explica. Gemini sugiere el perfil de análisis, convierte pedidos de gráficos en lenguaje natural en especificaciones, sugiere exploraciones y explica las métricas. Nunca escribe ni ejecuta código, nunca calcula cifras y nunca recibe el dataset completo, y cada respuesta es JSON validado con Pydantic. Toda la app funciona también sin IA.",
      },
      architecture: {
        en: "Three Streamlit pages (Home, Preparation, Analysis) sit on a core package that knows nothing about Streamlit: it takes DataFrames and returns DataFrames, numbers, figures or bytes. Shared data contracts are defined on day one, so five people can work in parallel against stable signatures. The environment is pinned with uv on Python 3.13, and the app deploys to Streamlit Community Cloud.",
        es: "Tres páginas en Streamlit (Inicio, Preparación y Análisis) se apoyan en un paquete central que no sabe que Streamlit existe: recibe DataFrames y devuelve DataFrames, números, figuras o bytes. Los contratos de datos compartidos se definen el primer día, para que cinco personas trabajen en paralelo sobre firmas estables. El entorno se fija con uv en Python 3.13 y la app se despliega en Streamlit Community Cloud.",
      },
      results: {
        en: "In progress: the implementation plan (v2.0) is closed and the team is building toward delivery at the end of November 2026.",
        es: "En progreso: el plan de implementación (v2.0) está cerrado y el equipo construye hacia la entrega a finales de noviembre de 2026.",
      },
      learned: {
        en: "Contracts first: publishing typed signatures with placeholder values on day one let the whole team run the app from the start and replace their parts without breaking anyone else's. And keeping AI in the proposing role, with Python doing the math, makes the results trustworthy.",
        es: "Contratos primero: publicar firmas tipadas con valores de ejemplo el primer día permitió que todo el equipo ejecutara la app desde el inicio y reemplazara sus partes sin romper las de los demás. Y dejar a la IA en el rol de proponer, con Python haciendo las cuentas, hace que los resultados sean confiables.",
      },
    },
  },
  {
    slug: "h2oeste",
    links: { repo: "https://github.com/HackathonFISC/equipo-03" },
    // Taken from the repo's own panel with its built-in example data (labelled as such on screen).
    screens: [
      {
        src: "/projects/h2oeste/reportes.webp",
        alt: {
          en: "H2Oeste coordination panel, Reports page: messages from the community, shown with example data",
          es: "Panel de coordinación de H2Oeste, página Reportes: mensajes de la comunidad, con datos de ejemplo",
        },
        width: 1200,
        height: 750,
      },
      {
        src: "/projects/h2oeste/necesidades.webp",
        alt: {
          en: "H2Oeste Needs page: water points ranked by urgency with the reasons for each score, example data",
          es: "Página Necesidades de H2Oeste: puntos ordenados por urgencia con el porqué de cada puntaje, datos de ejemplo",
        },
        width: 1200,
        height: 750,
      },
      {
        src: "/projects/h2oeste/plan.webp",
        alt: {
          en: "H2Oeste distribution plan: routes for two water tankers and the constraint check, example data",
          es: "Plan de distribución de H2Oeste: rutas para dos cisternas y la verificación de restricciones, datos de ejemplo",
        },
        width: 1200,
        height: 750,
      },
    ],
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
    links: { demo: "https://viaje-seguro-itinera.netlify.app/" },
    screens: [
      {
        src: "/projects/itinera/inicio.webp",
        alt: {
          en: "ITINERA on a phone: the start screen, where you create an account to plan a trip",
          es: "ITINERA en un teléfono: la pantalla de inicio, donde creas una cuenta para planear un viaje",
        },
        width: 780,
        height: 1688,
      },
    ],
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
