import type { ComponentType } from "react";
import type { SectionId } from "../../site.config";
import { ContactStrip } from "./contact-strip";
import { Developing } from "./developing";
import { FeaturedProjects } from "./featured-projects";
import { LatestWriting } from "./latest-writing";
import { Skills } from "./skills";
import { Timeline } from "./timeline";

/** id → section. Adding a section = a folder here, one line below, one line in site.config.ts. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- each section types its own props
export const registry: Record<SectionId, ComponentType<any>> = {
  "featured-projects": FeaturedProjects,
  skills: Skills,
  developing: Developing,
  timeline: Timeline,
  "latest-writing": LatestWriting,
  "contact-strip": ContactStrip,
};
