import type { L10n } from "./types";

export type SkillGroup = { id: string; name: L10n; skills: { name: string; evidence: string[] }[] };

// From the 2026 CV, grouped by domain. `evidence` lists project slugs (PLAN §4: no bars or ratings).
export const skillGroups: SkillGroup[] = [
  {
    id: "ml",
    name: { en: "AI & data", es: "IA y datos" },
    skills: [
      { name: "Gemini API", evidence: ["h2oeste", "agentequery"] },
      { name: "Ollama (local LLMs)", evidence: ["agentequery"] },
      { name: "Pydantic AI", evidence: [] },
      { name: "pandas, NumPy", evidence: [] },
      { name: "Matplotlib, Seaborn, Power BI", evidence: [] },
    ],
  },
  {
    id: "sys",
    name: { en: "Backend & systems", es: "Backend y sistemas" },
    skills: [
      { name: "Python", evidence: ["h2oeste"] },
      { name: "FastAPI", evidence: ["h2oeste"] },
      { name: "C#, Java, C++", evidence: ["agentequery"] },
      { name: "SQL, SQLite, Supabase", evidence: ["h2oeste", "agentequery"] },
      { name: "Linux / WSL, Windows Server", evidence: [] },
    ],
  },
  {
    id: "web",
    name: { en: "Frontend", es: "Frontend" },
    skills: [
      { name: "React", evidence: ["h2oeste"] },
      { name: "HTML, CSS, JavaScript", evidence: ["itinera"] },
      { name: "Bootstrap", evidence: [] },
    ],
  },
  {
    id: "tools",
    name: { en: "Tools", es: "Herramientas" },
    skills: [
      { name: "Git & GitHub", evidence: [] },
      { name: "Bash, PowerShell", evidence: [] },
      { name: "Netlify", evidence: ["itinera"] },
    ],
  },
];
