import { certifications, cv, profile, projects, skillGroups } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

/** /llms.txt: a plain-text summary for AI-assisted recruiting tools (PLAN §9). Facts only. */
export function GET() {
  const clean = (s: string) => s.replace(/\s*TODO\(noel\):.*$/, "").trim();
  const lines = [
    `# ${profile.name}`,
    "",
    `> ${cv.summary.en}`,
    "",
    `- Location: ${profile.location.en}`,
    `- Status: ${profile.status.en}`,
    ...(profile.email ? [`- Email: ${profile.email}`] : []),
    `- GitHub: ${profile.links.github}`,
    `- LinkedIn: ${profile.links.linkedin}`,
    `- CV: ${absoluteUrl("en", "/cv")}`,
    "",
    "## Education",
    ...cv.education.map((e) => `- ${e.degree.en}, ${e.school} (${e.period.en})`),
    "",
    "## Projects",
    ...projects.map(
      (p) => `- [${p.title}](${absoluteUrl("en", `/projects/${p.slug}`)}): ${clean(p.summary.en)}`,
    ),
    "",
    "## Skills",
    ...skillGroups.map((g) => `- ${g.name.en}: ${g.skills.map((s) => s.name).join(", ")}`),
    "",
    "## Certifications",
    ...certifications.map((c) => `- ${c.issuer}: ${c.name} (${c.year})`),
    "",
    `Languages: ${cv.languages.en}`,
  ];
  return new Response(lines.join("\n") + "\n", { headers: { "content-type": "text/plain; charset=utf-8" } });
}
