/**
 * Content shared by the CP1 design labs. Every fact comes from Noel's 2026 CV or answers he
 * confirmed on 2026-11-20 (PRODUCT.md). Phase 3 replaces this with the typed content files.
 */
export const lab = {
  name: "Noel Echeverría",
  headline: "Systems and Computer Engineering student building AI agents and data tools in Python.",
  location: "Panama City, Panama",
  school: "Universidad Tecnológica de Panamá",
  about:
    "I study Systems and Computer Engineering at Universidad Tecnológica de Panamá and build AI agents and data tools in Python, with FastAPI, Pydantic AI and local LLMs. I'm a Samsung Innovation Campus AI scholar, and I'm looking for an ML, AI or software engineering internship.",
  links: {
    github: "https://github.com/NoelRevotn",
    linkedin: "https://www.linkedin.com/in/noel-echeverr%C3%ADa-761623334",
  },
  project: {
    title: "H2Oeste",
    summary: "Multi-agent water-tanker coordination system",
    what: "AI agents turn citizens' Telegram reports into optimized water-tanker routes.",
    context: "Built in 24 hours by a team of three at the GitHub FISC AI Agents Hackathon, 2026.",
    role: "I owned the FastAPI backend, the authorization layer, the React operations dashboard and the Telegram bot that receives reports.",
    stack: {
      ml: ["Gemini", "OR-Tools"],
      sys: ["Python", "FastAPI", "Supabase"],
      web: ["React", "Telegram Bot API"],
    },
  },
} as const;
