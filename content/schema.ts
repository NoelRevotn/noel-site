import { z } from "zod";

/** Content schemas (PLAN.md §6.2). `src/lib/content.ts` parses every file at build time. */
export const L10n = z.object({ en: z.string().min(1), es: z.string().min(1) });
export const Domain = z.enum(["ml", "sys", "web"]);

export const CaseStudy = z.object({
  problem: L10n,
  approach: L10n,
  architecture: L10n,
  results: L10n,
  learned: L10n,
});

export const Project = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: L10n,
  what: L10n,
  context: L10n,
  role: L10n.optional(),
  period: z
    .string()
    .regex(/^\d{4}(-\d{2})?$/)
    .optional(),
  domains: z.array(Domain).min(1),
  stack: z.object({ ml: z.array(z.string()), sys: z.array(z.string()), web: z.array(z.string()) }).partial(),
  status: z.enum(["shipped", "prototype", "in-progress"]),
  featured: z.boolean(),
  links: z.object({ repo: z.url().optional(), demo: z.url().optional() }).default({}),
  caseStudy: CaseStudy.optional(),
});

export const SkillGroup = z.object({
  id: z.string(),
  name: L10n,
  skills: z.array(z.object({ name: z.string(), evidence: z.array(z.string()) })),
});

export const TimelineEntry = z.object({
  kind: z.enum(["education", "work", "program"]),
  title: L10n,
  org: z.string(),
  start: z.string(),
  end: z.string().nullable(),
  note: L10n.optional(),
});

export const DevelopingArea = z.object({ topic: L10n, via: z.string(), startedAt: z.string() });

export const Certification = z.object({
  name: z.string(),
  issuer: z.string(),
  year: z.string().regex(/^\d{4}$/),
  /** Public verification link (e.g. Credly), added in Phase 6. */
  verifyUrl: z.url().optional(),
});

export type Project = z.infer<typeof Project>;
export type CaseStudy = z.infer<typeof CaseStudy>;
export type SkillGroup = z.infer<typeof SkillGroup>;
export type TimelineEntry = z.infer<typeof TimelineEntry>;
export type DevelopingArea = z.infer<typeof DevelopingArea>;
export type Certification = z.infer<typeof Certification>;

/** Blog post metadata, exported from each MDX file as `export const metadata = {...}`. */
export const PostMeta = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.iso.date(),
  updated: z.iso.date().optional(),
  tags: z.array(z.string()).default([]),
  /** Drafts never ship; preview them with SHOW_DRAFTS=1. */
  draft: z.boolean().default(false),
});
export type PostMeta = z.infer<typeof PostMeta>;
