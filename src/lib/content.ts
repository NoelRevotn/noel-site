import { z } from "zod";
import { certifications as rawCerts } from "../../content/cv";
import { developing as rawDeveloping } from "../../content/developing";
import { projects as rawProjects } from "../../content/projects";
import { Certification, DevelopingArea, Project, SkillGroup, TimelineEntry } from "../../content/schema";
import { skillGroups as rawSkills } from "../../content/skills";
import { timeline as rawTimeline } from "../../content/timeline";

/**
 * The only door to content (PLAN §5.2 section contract). Everything is parsed with Zod at
 * import time, so `next build` fails on a schema error instead of shipping broken content.
 */
function parse<T extends z.ZodType>(schema: T, data: unknown, file: string): z.output<T> {
  const result = schema.safeParse(data);
  if (!result.success) throw new Error(`content/${file} is invalid:\n${z.prettifyError(result.error)}`);
  return result.data;
}

export const projects = parse(z.array(Project), rawProjects, "projects.ts");
export const skillGroups = parse(z.array(SkillGroup), rawSkills, "skills.ts");
export const timeline = parse(z.array(TimelineEntry), rawTimeline, "timeline.ts");
export const developing = parse(z.array(DevelopingArea), rawDeveloping, "developing.ts");
export const certifications = parse(z.array(Certification), rawCerts, "cv.ts");

// Evidence links must point at real projects.
const slugs = new Set(projects.map((p) => p.slug));
for (const g of skillGroups) {
  for (const s of g.skills) {
    for (const e of s.evidence) {
      if (!slugs.has(e)) throw new Error(`content/skills.ts: "${s.name}" cites unknown project "${e}"`);
    }
  }
}

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);

export { cv } from "../../content/cv";
export { profile } from "../../content/profile";
