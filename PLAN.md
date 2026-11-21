# PLAN.md — Noel Echeverría · Personal Portfolio & Blog

> **Version:** 2.0 · **Written:** 2026-11-20 · **Owner:** Noel Echeverría (product owner) · **Executor:** Claude Code (Opus 5.5)
> **Replaces:** the Nov 16 Astro + Cloudflare plan. Noel chose to replace it: GitHub Pages is now v1. The AI chat and the custom domain move to a later phase (§11, Phase 6).

---

## 0. How to use this document (read first, Claude Code)

This plan is the **starting point, not a script**. You (Claude Code) are the lead design engineer on this project. You may change anything in it, as long as you follow these rules:

| Layer | Who can change it | How |
|---|---|---|
| **§2 Fixed requirements** | Only Noel | Ask Noel with `AskUserQuestion`. Never change these silently. |
| **§3 Default stack and §4–§10 design/architecture** | You | Write an ADR in `docs/adr/NNNN-title.md` (context → options → decision → consequences), add a line to the **Decision log** (§14), and update this file in the same PR. |
| **§11 Phases and tasks** | You | Split, merge, reorder or add tasks freely. Record changes in the Decision log. Keep the **checkpoints** (CP1–CP4). |

**Other standing rules**

1. **Verify before you commit to specifics.** Versions and APIs change. Since Next.js 16.3, coding agents automatically read the documentation that matches the project's installed Next.js version. Use that, plus each library's official docs. Don't rely on memory for config syntax.
2. **Never invent facts about Noel.** No made-up metrics, titles, employers, dates or results. Anything you don't have becomes a visible placeholder `TODO(noel): …`, and a content check (§6.4) blocks a release while any placeholder remains.
3. **Mentor mode.** Noel is a 2nd-year Systems & Computer Engineering student (strong in Python; HTML/CSS/JS; React beginner-to-intermediate). Every PR description has a short **"Concepts in this PR"** section: 2–5 bullets naming the concept (e.g. "Server vs Client Components", "design tokens", "hydration") and why it was used. Keep each one to a few sentences and link the official docs.
4. **Least machinery.** Every dependency must earn its place (use the `ponytail` skill's ladder: platform feature → existing code → small dependency → big dependency). Never cut accessibility, validation or security to save code.
5. **Stop at checkpoints.** At CP1–CP4, stop, show what changed (screenshots, preview URL), and ask Noel with `AskUserQuestion`. Claude Code merges branches to `main` itself (`--no-ff`, PR description in the merge commit) **only after CI is green on the branch**; a phase's closing merge waits for Noel's checkpoint approval. *(Amended by Noel 2026-11-20.)*

---

## 1. Product brief

**What it is.** A modern, motion-rich personal site that is both a **recruiting tool** and a **proof of skill**. Both the live site and its public repo should show that Noel can design, build and ship production-grade front-end software.

**Positioning.** An engineering student at UTP, Panama, working toward ML engineering, at the meeting point of ML and systems. Technical work comes first. Non-technical jobs appear only for the transferable skills they show.

**Audiences (priority order)**
1. **Recruiters / hiring managers.** Within 30 seconds of landing on the home page, they must know: who Noel is, what he does, proof (2–3 featured projects), and how to contact him or download his CV.
2. **Technical reviewers.** They will read the code, architecture, commit history and Lighthouse scores.
3. **Peers / the Panama and LatAm tech community.** Blog readers, Spanish speakers.

**Success criteria**
- The 30-second test passes with a non-technical reader (Noel runs it at CP3).
- Lighthouse (mobile) ≥ 95 for Accessibility, Best Practices and SEO on every page. Performance ≥ 90 on the home page (the motion-heavy page) and ≥ 95 elsewhere.
- Core Web Vitals targets: LCP < 2.5 s, CLS < 0.1, INP < 200 ms.
- WCAG 2.2 AA. Full keyboard use. `prefers-reduced-motion` fully respected.
- One person can update content by editing typed files and pushing. CI deploys automatically.

---

## 2. Fixed requirements (only Noel can change these)

Each requirement has an ID. §13 maps every ID to where it is satisfied and how it is checked.

| ID | Requirement |
|---|---|
| R1 | Built mainly with **React**, using **Next.js** (Noel chose Next.js static export). |
| R2 | Hosted on **GitHub Pages** at a `.github.io` address: `https://noelrevotn.github.io/noel-site/`, from repo `NoelRevotn/noel-site` (project site, served under `basePath: '/noel-site'`). *Amended by Noel 2026-11-20; ADR-0002.* |
| R3 | **Modular development:** each section of the site can be added, removed, reordered or changed without touching the others. |
| R4 | Feels **modern**, with a **specialized, professional typography**. It must **not** use Anthropic's typefaces (e.g. Styrene, Tiempos, Copernicus) or the Anthropic/Claude visual style, and must not default to generic fonts (Inter, Roboto, Arial, system-ui as the display face). |
| R5 | **Not a static, motionless page:** animated background, interactive islands and a **custom cursor**, while staying professional and reading as an **AI/ML engineer's** site. |
| R6 | **Personal and recruiter-focused:** contains Noel's real information. |
| R7 | Content includes: **CV** (web + downloadable PDF), **social profiles** (LinkedIn, GitHub, others Noel provides), **contact info**, **projects**, **skills**, and **developing areas** (what he is currently learning). |
| R8 | v1 also includes: **Blog / articles in MDX**, **bilingual EN/ES** (English primary), and a **contact form**. |
| R9 | **Visual direction is chosen by Noel** from 3 proposals Claude Code produces (CP1). |
| R10 | **Claude Code can decide further and modify this plan** (under the rules in §0). |

---

## 3. Default technical stack (changeable by ADR)

| Concern | Default | Why / notes to verify |
|---|---|---|
| Framework | **Next.js 16.x, App Router**, `output: 'export'`, `trailingSlash: true` | Static HTML per route, which GitHub Pages can serve. Server Components run at build time. Check the static-export *unsupported features* list in the installed version's docs: no proxy/middleware, no request-time data, Route Handlers only as `force-static` GET. |
| Language | **TypeScript strict** (`strict`, `noUncheckedIndexedAccess`) | |
| Package manager | **pnpm**, Node LTS pinned in `.nvmrc` + `packageManager` field | |
| Styling | **Tailwind CSS v4** with design tokens as CSS custom properties (`@theme`) + a small set of CSS Modules for complex components | Tokens are the single source of truth for both. Decide in ADR-0003 after CP1; plain CSS + tokens is an acceptable alternative. |
| Motion | **Motion** (`motion/react`) for UI, layout, scroll-linked and gesture animation | Use GSAP only if a specific effect needs it (ADR). |
| Ambient background | **One** canvas island: Canvas 2D or raw WebGL/OGL first, react-three-fiber only if the chosen direction truly needs 3D | Lazy-loaded with `next/dynamic` after first paint; see the §7 budgets. |
| i18n | **next-intl** with a `[locale]` segment: `/en/…`, `/es/…` | With static export there is no middleware, so the locale prefix is required. The root `/` is a tiny static page that redirects to `/en/` (meta refresh + JS + visible links), with `hreflang` alternates. |
| Content | Typed data files (`content/*.ts` validated with **Zod**) for profile/CV/projects/skills. **MDX** for blog posts and case studies, via a content layer (evaluate Velite vs content-collections vs `@next/mdx`; pick by maintenance health) | Build fails on schema errors. |
| Fonts | Self-hosted with `next/font/local` (or `next/font/google` when OFL-licensed), subset, `display: swap`, ≤ 3 families | Licenses checked (§8). |
| Images | Pre-optimized AVIF/WebP at build (sharp script or `next-image-export-optimizer`); `next/image` with `unoptimized` or a custom loader | Next's default image optimization doesn't work in a static export. |
| Contact form | Static-friendly form backend (evaluate **Web3Forms** vs **Formspree** free tiers) + honeypot + a challenge (Cloudflare Turnstile or hCaptcha) + client-side Zod validation | Use only keys that are designed to be public. Nothing secret goes in the bundle. |
| Search/command | Built-in command palette (⌘K / Ctrl+K), a small accessible implementation or `cmdk` | Doubles as an interactive island. |
| Quality | ESLint (next + jsx-a11y) + Prettier (or Biome), `tsc --noEmit`, **Vitest** for utils/schemas, **Playwright** smoke tests + **@axe-core/playwright**, **Lighthouse CI** with budgets | |
| CI/CD | GitHub Actions: lint → typecheck → test → build → Lighthouse/axe on the build → deploy with `actions/upload-pages-artifact` + `actions/deploy-pages` | Pages source = "GitHub Actions". It's a *project* site, so `basePath: '/noel-site'` is required; no `.nojekyll` is needed with an Actions artifact (ADR-0002). |
| Analytics | Not in v1 (Phase 6). | Privacy-respecting option later (e.g. GoatCounter or Cloudflare Web Analytics). |

**Explicitly out of v1:** AI chat, CMS/admin panel, custom domain, analytics, server-side anything.

---

## 4. Information architecture

```
/                      → redirect page → /en/
/[locale]/             Home
/[locale]/projects/    Project index (filterable by domain: ML/AI, systems, web, networking…)
/[locale]/projects/[slug]/   Case study (MDX)
/[locale]/cv/          Web CV (print-friendly) + "Download PDF"
/[locale]/blog/        Article index (tags, reading time)
/[locale]/blog/[slug]/ Article (MDX)
/[locale]/contact/     Contact form + direct email + socials
/[locale]/colophon/    How this site is built (stack, design system, Lighthouse) — proof of skill for reviewers
/404                   Custom, on-brand, with links back
```

**Home page sections (each one is a module, §5):**
1. **Hero:** name, a one-line positioning statement in Noel's voice, location (Panama), status (e.g. "Open to ML/AI internships": Noel confirms), primary CTAs: *View projects* · *Download CV* · *Contact*.
2. **Featured projects:** 2–3 cards, each linking to a case study.
3. **Skills:** grouped by domain (ML/Data, Backend, Frontend, Infra/Networking, Tools). **No percentage bars or star ratings.** Show context instead ("used in X project").
4. **Currently developing:** the growth areas (e.g. Docker, RAG, auth: Noel confirms), shown honestly as "in progress", optionally with what he's building to learn each.
5. **Experience & education timeline:** UTP degree, programs, jobs (non-technical ones framed by transferable skills), certifications.
6. **Latest writing:** the 2–3 most recent posts.
7. **Contact strip:** email, LinkedIn, GitHub, CV.

**Global chrome:** header (logo/name, nav, locale switch EN/ES, theme toggle, ⌘K hint), footer (socials, "Built with…" → colophon, source repo link), skip link.

---

## 5. Architecture for modular development (R3)

### 5.1 Repository layout (target)

```
.
├─ app/
│  ├─ [locale]/
│  │  ├─ layout.tsx          # html lang, fonts, theme, providers, chrome
│  │  ├─ page.tsx            # Home: renders the section registry
│  │  ├─ projects/…  blog/…  cv/…  contact/…  colophon/…
│  ├─ page.tsx               # root redirect
│  ├─ sitemap.ts  robots.ts  # force-static
│  └─ not-found.tsx
├─ src/
│  ├─ sections/              # ← one folder per page section (the modularity unit)
│  │  ├─ hero/               #   Hero.tsx · hero.module.css · hero.test.tsx · index.ts
│  │  ├─ featured-projects/
│  │  ├─ skills/
│  │  ├─ developing/
│  │  ├─ timeline/
│  │  ├─ latest-writing/
│  │  └─ contact-strip/
│  ├─ islands/               # ← every "use client" interactive piece lives here
│  │  ├─ ambient-background/  cursor/  command-palette/  project-map/ …
│  ├─ components/ui/         # design-system primitives (Button, Tag, Card, Link, Heading…)
│  ├─ motion/                # motion tokens, variants, <Reveal>, useReducedMotion wrappers
│  ├─ lib/                   # content loaders, i18n helpers, seo, utils
│  └─ styles/                # tokens.css, globals.css, typography.css
├─ content/
│  ├─ profile.ts  experience.ts  education.ts  certifications.ts  skills.ts  developing.ts  socials.ts
│  ├─ projects/<slug>/{en.mdx, es.mdx, cover.(png|jpg)}
│  └─ blog/<slug>/{en.mdx, es.mdx?}
├─ messages/{en.json, es.json}  # UI strings only
├─ public/{cv/, fonts/, og/, .nojekyll}
├─ site.config.ts              # ← section order, toggles, nav, feature flags
├─ docs/{adr/, DESIGN.md, CONTENT-GUIDE.md, SKILLS.md}
├─ CLAUDE.md                   # project memory for Claude Code (conventions, commands, rules from §0)
└─ PLAN.md                     # this file
```

### 5.2 The section registry

`site.config.ts` declares the home page as data:

```ts
export const home = [
  { id: 'hero',              enabled: true },
  { id: 'featured-projects', enabled: true, props: { limit: 3 } },
  { id: 'skills',            enabled: true },
  { id: 'developing',        enabled: true },
  { id: 'timeline',          enabled: true },
  { id: 'latest-writing',    enabled: true, props: { limit: 3 } },
  { id: 'contact-strip',     enabled: true },
] as const satisfies SectionConfig[];
```

- A typed registry maps `id → component`. Adding a section = new folder in `src/sections/` + one registry line + one config line.
- **Section contract:** a section is a Server Component by default, receives `locale` + typed props, reads content only through `src/lib/content`, imports styles only from tokens/its own module, and never imports another section. It may embed islands.
- **Islands contract:** `"use client"` appears only in `src/islands/**` (enforced with an ESLint rule). Each island is lazy-loaded when it is heavy, has a non-JS fallback, and respects reduced motion.

### 5.3 Rendering model (concept for Noel)
Everything is pre-rendered to HTML at build time (Server Components = build-time components here). Islands *hydrate* in the browser only where interactivity is needed. That keeps JS small while the site still feels alive.

---

## 6. Content model and sources (R6, R7)

### 6.1 Known facts (seed these; Noel confirms wording)
- Name: **Noel Alejandro Echeverría Ramírez**, goes by **Noel Echeverría**
- **Licenciatura en Ingeniería de Sistemas y Computación**, Universidad Tecnológica de Panamá (UTP), started 2025, expected graduation ~2028
- Based in **Panama**
- Career goal: **ML engineering**
- GitHub: `https://github.com/NoelRevotn` · LinkedIn: `https://www.linkedin.com/in/noel-echeverría-761623334` (verify the URL encoding of "í")

**Everything else comes from Noel's files.** At the start of Phase 3, ask him for: his CV (PDF/DOCX), project notes/READMEs, a certificates list, his contact email, any other socials, a headshot (yes/no), and a status line. Candidate projects he may want to feature (he decides): AgenteQuery (C# WinForms hotel management app + SQLite + AI natural-language query assistant), DataLizer (Samsung Innovation Campus team project), ITINERA (HCI itinerary-app prototype), H2Oeste hackathon project, Project Buddy (personal AI agent, if it's public). **Do not write case-study claims for these without his notes.**

### 6.2 Schemas (Zod, bilingual where text is user-facing)
- `Profile` { name, shortName, headline{en,es}, location, email, availability{en,es}, cvPdf{en,es?} }
- `Social` { network, url, handle, primary: boolean }
- `Project` (MDX frontmatter) { slug, title, summary, role, period, domain[], stack[], featured, status: 'shipped'|'prototype'|'in-progress', links{repo?, demo?, paper?}, cover, coverAlt } + body sections: **Problem → Approach → Architecture → Results (only real) → What I learned**
- `Skill` { name, group, evidence: projectSlug[] }
- `DevelopingArea` { topic, why, currentlyBuilding?, startedAt }
- `Experience` / `Education` / `Certification` { …, transferableSkills[] for non-technical roles }
- `Post` (MDX frontmatter) { title, description, date, updated?, tags[], lang, translationOf?, draft }

### 6.3 Bilingual policy
- UI strings: full EN/ES parity (enforced by a test that compares `messages/en.json` and `es.json` keys).
- Profile/CV/projects: full parity.
- Blog: English required. Spanish optional per post; the post shows "Disponible solo en inglés" in Spanish when there's no translation (Noel can change this policy).

### 6.4 Content check
`pnpm check:content` validates the schemas, flags any `TODO(noel)`, checks the image alt text is present, and checks that internal links resolve. CI runs it; a `release` build fails while any TODO remains.

---

## 7. Motion and interaction system (R5)

### 7.1 Principles
- **Motion explains, it doesn't decorate.** Every animation either orients (where am I), gives feedback (what happened), or carries the ML/systems identity (ambient layer).
- **One hero moment, many quiet details.** Only one expensive effect runs at a time.
- **Professional restraint:** no bouncing logos, no parallax on body text, no scroll-jacking.

### 7.2 Layers
1. **Ambient background (one island):** a generative, data-inspired field chosen at CP1 (e.g. a vector/flow field, a sparse neural graph, an embedding point cloud). Reacts subtly to the cursor and scroll. Rules: pause when off-screen (`IntersectionObserver`) and when the tab is hidden; cap devicePixelRatio at 2; target 60 fps with automatic quality step-down; static SVG/gradient fallback for reduced motion, no WebGL, or low-power devices; it never sits behind body text at a contrast that fails AA.
2. **Custom cursor (island):** an *enhancing* cursor (e.g. a precise dot + a lagging ring that morphs to contextual labels like "Open", "Copy email", "Drag"). Only on `(hover: hover) and (pointer: fine)`. **The native cursor is still used for text fields and selection.** Disabled under reduced motion. Toggleable in a small settings/⌘K menu. Never hides focus indicators; it's implemented with `transform` only, outside React's render loop (refs + `requestAnimationFrame` or Motion values).
3. **Scroll reveals and section transitions:** `<Reveal>` primitives built on Motion; stagger tokens; content is visible without JS (progressive enhancement — no content hidden behind JS in the SSR HTML).
4. **Micro-interactions:** buttons, links, cards, tags, copy-to-clipboard, theme switch, locale switch.
5. **Page transitions:** subtle; evaluate the View Transitions API (and Next's support for it) against Motion's layout animations. Pick by ADR.

### 7.3 Interactive islands (choose 2–3 for v1 at CP2; the rest go to the backlog)
- **⌘K command palette:** navigate, switch language/theme, copy email, open CV. *(Strongly recommended: useful for recruiters, impressive for reviewers.)*
- **Project map:** projects plotted as points in a 2D "embedding space" by domain/stack; hover to preview, click to open. Gives the ML identity a real job.
- **Skill graph:** skills ↔ projects as a small force-directed graph (the evidence for each skill).
- **Tokenizer toy (easter egg):** type text and see it split into tokens with IDs. Fun ML signal; low priority.
- **Terminal mode (easter egg):** `~` opens a tiny shell (`whoami`, `ls projects`, `cat cv`). Low priority.

### 7.4 Motion tokens (in `src/motion/tokens.ts` and CSS vars)
Durations (e.g. `instant 80ms`, `fast 160ms`, `base 240ms`, `slow 400ms`, `ambient` for loops), easings (standard, emphasized, exit), stagger, distance. Every animation uses tokens.

### 7.5 Performance budgets (enforced in Lighthouse CI)
- First-load JS on the home page ≤ ~180 KB gzip including the background engine (lazy-loaded after LCP); content pages ≤ ~110 KB. Claude Code calibrates the numbers after Phase 2 and records them in an ADR.
- No layout shift from fonts (metric-matched fallbacks) or from islands mounting (reserve space).

---

## 8. Visual design and typography (R4, R9)

### 8.1 Process
**Phase 1 produces three distinct directions** as live routes (`/lab/a`, `/lab/b`, `/lab/c`; excluded from the production build or `noindex`). Each one includes:
- Name + one-line mood (e.g. "Technical-editorial", "Neural/generative", "Systems/telemetry"; Claude Code may propose others)
- Type pairing (display + text + mono), with license
- Light **and** dark palettes with contrast ratios listed
- Ambient background concept (a working prototype, even if rough)
- Cursor concept
- A hero + one project card + one paragraph of body text, rendered with Noel's real name and headline

Noel picks one (or a mix) at **CP1**. Then Claude Code writes `docs/DESIGN.md`: an original design spec covering principles, tokens, type scale, grid, spacing, color roles, elevation, motion, iconography, imagery, and do/don't examples.

### 8.2 Typography rules
- **Specialized and professional.** A characterful display face, a highly readable text face, and a mono for code/data accents (the mono carries the "engineer" signal).
- **Forbidden:** Anthropic typefaces (Styrene, Tiempos, Copernicus, and any lookalike used to imitate them), the Claude/Anthropic look (warm beige + coral), and generic defaults (Inter, Roboto, Arial, plain system-ui) as the display face.
- **Licenses:** OFL or similarly free for web self-hosting, or a font Noel owns. Record the license in `docs/DESIGN.md`.
- **Candidates for the three directions to explore** (non-binding; check the license and quality of each): display faces such as Fraunces, Instrument Serif, Newsreader, Bricolage Grotesque, Familjen Grotesk, Clash Display / Satoshi / General Sans (Fontshare license), Mona Sans / Hubot Sans; mono faces such as JetBrains Mono, IBM Plex Mono, Commit Mono, Martian Mono.
- Fluid type scale with `clamp()`, ≥ 16 px body, 60–75 character measure, Spanish diacritics tested (á é í ó ú ñ ¿ ¡) in every chosen face.

---

## 9. Accessibility, SEO and internationalization

- **a11y:** semantic landmarks, one `h1` per page, visible focus styles (designed, not removed), skip link, keyboard paths for every island (palette, map, graph), `aria-live` for form status, color never the only signal, motion off under `prefers-reduced-motion`, a manual pass with a screen reader (NVDA on Windows) at CP4. Run the `design:accessibility-review` skill at CP2 and CP4.
- **SEO:** per-page metadata via `generateMetadata`; `hreflang` alternates + `x-default`; canonical URLs; `sitemap.xml`, `robots.txt`; Open Graph/Twitter images (static, designed per section; generate them at build if the static export supports it, otherwise pre-render with a script); **JSON-LD** `Person` (+ `BlogPosting` for posts); RSS feed for the blog (`force-static` route); **`/llms.txt`** summarizing Noel for AI-assisted recruiting tools.
- **i18n:** `<html lang>` per locale; localized dates/numbers via `Intl`; the language switcher keeps you on the same page in the other language.

---

## 10. Engineering standards

- Conventional Commits; small PRs, one concern each; branch per task (`feat/…`, `fix/…`, `chore/…`, `docs/…`).
- PR template: Summary · Screenshots (light/dark, mobile/desktop) · **Concepts in this PR** · Checklist (a11y, reduced motion, i18n parity, no TODOs added to released content).
- `main` only receives `--no-ff` merges of branches whose CI is green (§0 rule 5).
- Renovate or Dependabot for updates (grouped weekly). Watch Next.js security releases; they've been coming roughly monthly in 2026.
- No secrets in the repo. Only keys designed to be public (form access key, Turnstile site key) go in `NEXT_PUBLIC_*`, and each is documented.
- `README.md` (what/why/how to run), `docs/CONTENT-GUIDE.md` (how Noel adds a project/post/skill in 5 minutes), ADRs.
- Content license choice (e.g. code MIT, content CC BY-NC 4.0): Noel decides.

---

## 11. Phases, tasks and checkpoints

Effort is in *working sessions* (~2–3 h of Claude Code time, plus Noel's review). Claude Code may re-plan (§0).

### Phase 0 — Bootstrap (1–2 sessions)
1. **Skill and tool inventory** (Noel has skills installed locally that aren't visible from claude.ai): list `~/.claude/skills/`, `.claude/skills/`, and installed plugins (`/plugin`). Write `docs/SKILLS.md` mapping each relevant skill to the phases where it applies (§12). Flag any skill that conflicts with this plan.
2. Create the repo `NoelRevotn/noel-site` (public), the Next.js 16 TypeScript app with pnpm, `output: 'export'`, `trailingSlash: true`, ESLint/Prettier, Vitest, Playwright, `CLAUDE.md`.
3. GitHub Actions: CI + deploy to Pages. Deploy a hello-world `/en/` + root redirect to `https://noelrevotn.github.io/noel-site/` to prove the pipeline end to end.
4. ADR-0001 (stack, citing this plan), ADR-0002 (static export constraints and their consequences).

**Done when:** the live URL serves `/en/`, CI is green, and `docs/SKILLS.md` exists.

### Phase 1 — Design directions → **CP1** (2–3 sessions)
1. Load `frontend-design` (plus any local design-taste skills found in Phase 0). Produce the 3 directions (§8.1) as `/lab/a|b|c`.
2. Run `design:design-critique` on each one; include the critique summary.
3. **CP1 (`AskUserQuestion`):** Noel picks a direction (or a mix), the accent color and the type pairing. Ask about headshot yes/no.
4. Write `docs/DESIGN.md` + ADR-0003 (styling approach).

### Phase 2 — Design system and shell → **CP2** (3–4 sessions)
1. Tokens (`tokens.css`), the type scale, light/dark themes (no flash on load: an inline theme script), the grid.
2. UI primitives; layout chrome (header, footer, nav, locale switch, theme toggle, skip link); 404.
3. next-intl setup with EN/ES; the root redirect; hreflang.
4. Motion primitives + tokens; **ambient background engine**; **custom cursor**; the ⌘K palette skeleton.
5. The section registry with stub sections.
6. Run `design:design-system` (consistency audit) and `design:accessibility-review`.
7. **CP2:** a preview with stubs. Noel approves the look and feel and picks the 2–3 interactive islands for v1 (§7.3).

### Phase 3 — Real content and core pages → **CP3 = v0.1 public** (3–4 sessions)
1. Collect Noel's materials (§6.1). Draft copy **in Noel's voice** with `design:ux-copy`. Noel edits and approves every claim.
2. Content schemas + `check:content`.
3. Home sections, the projects index, 2–3 case studies, the CV page + PDF, the contact info, the colophon.
4. SEO basics (metadata, sitemap, robots, JSON-LD Person, OG images, llms.txt).
5. **CP3:** the 30-second recruiter test; Noel approves going public.

### Phase 4 — Blog, Spanish parity, contact form → **v0.2** (2–3 sessions)
1. MDX pipeline (syntax highlighting with a build-time highlighter such as Shiki, heading anchors, reading time, a table of contents), the blog index with tags, the RSS feed. One real first post from Noel (or a placeholder that doesn't ship).
2. Full ES translation of the UI + profile/CV/projects (Noel reviews the Spanish).
3. Contact form: backend choice ADR, validation, spam protection, success/error states, an `aria-live` region, a privacy note.

### Phase 5 — Interactive islands, polish and hardening → **CP4 = v1.0** (3–4 sessions)
1. Build the islands chosen at CP2; each has a keyboard path, a reduced-motion version and a fallback.
2. Page transitions; motion polish pass.
3. Performance pass (bundle analysis, lazy boundaries, font subsetting, image sizes). Lighthouse CI budgets enforced.
4. a11y pass (axe at 0 violations + a manual NVDA/keyboard pass); cross-browser check (Chrome, Firefox, Safari/WebKit via Playwright); mobile check.
5. Docs: README, CONTENT-GUIDE, final ADRs; the colophon updated with real scores.
6. **CP4:** Noel signs off on v1.0, and the repo is tagged `v1.0.0`.

### Phase 6 — Later (backlog, not v1)
Custom domain (.tech or .me as the canonical one, the other redirecting; DNS + `CNAME`; check renewal dates) · privacy-respecting analytics · git-based CMS (e.g. Sveltia/Decap) · **"Ask about Noel" AI chat**, served from a separate serverless backend (e.g. a Cloudflare Worker with RAG over the site's content, cost caps, rate limits, prompt-injection defenses) and called from a static island · extra islands (tokenizer, terminal) · project demo videos. · **Background music** (Noel, 2026-11-21): optional ambient track, off by default with a visible mute control, never autoplaying with sound · **Verified certifications via Credly** (Noel, 2026-11-21): link or embed Credly badges for certifications that have them (e.g. Cisco courses) so recruiters can verify them; others stay as listed with their PDFs.

---

## 12. Skills and plugins

### 12.1 Installed (visible from claude.ai)
| Skill / plugin | Use it for |
|---|---|
| `frontend-design` | Phase 1 directions; every new UI surface |
| Design plugin: `design-system` | Token/component consistency audits (Phase 2, 5) |
| Design plugin: `accessibility-review` | CP2 and CP4 audits |
| Design plugin: `design-critique` | Critiquing the 3 directions (Phase 1) and the final polish |
| Design plugin: `ux-copy` | Microcopy, CTAs, empty/error states, the form (Phase 3–4) |
| Design plugin: `design-handoff` | Turning the chosen direction into a spec for `DESIGN.md` |
| `ponytail` | Dependency and complexity discipline on every task |
| `interview-me` | Gathering Noel's content and voice at the start of Phase 3 |
| `graphify` | Optional: generating architecture/knowledge graphs for the colophon or the skill graph |
| `canvas-design` | Optional: static OG images / posters |
| `skill-creator` | If a repeated workflow emerges (e.g. "add a project"), make it a project skill in `.claude/skills/` |
| Canva | Optional: social share images, CV visual polish |

### 12.2 Probably installed locally (from the Nov 16 runbook; verify in Phase 0)
`impeccable`, `emil-design-eng`, `design-taste-frontend`: use them in Phases 1, 2 and 5 for design taste and motion craft, if present.

### 12.3 Suggested additions (Noel installs and vets them first)
- **"Skills For Real React/React Native Engineers"** (Anthropic plugin directory, community-published). Relevant parts: `ui-motion`, `ui-typography`, `ui-interactions`, `css-animations`, `gsap-react`, `gsap-scroll-trigger`, `tailwind`, `type-safety`, `component-architecture`, `unslop`, plus the `animation-specialist` agent. Ignore the React Native parts. Community-published, so read the skills before enabling them.
- **A browser-automation tool for visual verification** (Playwright MCP or Chrome DevTools MCP), so Claude Code can screenshot pages, check console errors and record performance traces at each checkpoint.
- **A project skill `add-content`** (create it with `skill-creator` in Phase 4): scaffolds a new project or post with frontmatter, both locales, and image slots, then runs `check:content`.
- **Not needed now:** Remotion / Motion Reel / animation-studio (these make videos, not site motion). Revisit them only for project demo videos.

---

## 13. Validation: requirement traceability

| ID | Satisfied by | Verified by |
|---|---|---|
| R1 | §3 framework | `package.json`; ADR-0001 |
| R2 | §3 CI/CD, Phase 0 | Live URL at `noelrevotn.github.io/noel-site/` serves the build |
| R3 | §5 registry + section/island contracts | Toggling/reordering a section in `site.config.ts` works with no other change (demonstrated at CP2); ESLint `use client` rule |
| R4 | §8 | `DESIGN.md` font list + licenses; CP1 approval; a grep check in CI for forbidden font names |
| R5 | §7 | CP2 demo: background, cursor, ≥ 2 islands; reduced-motion test in Playwright |
| R6 | §6.1, §0 rule 2 | `check:content` zero TODOs at release; Noel approves the copy at CP3 |
| R7 | §4, §6.2 | Pages exist: CV (+ PDF), socials, contact, projects, skills, developing |
| R8 | Phase 4 | Blog renders MDX; `/es/` parity test passes; form submits end to end |
| R9 | Phase 1 / CP1 | 3 directions delivered; Noel's choice recorded in the Decision log |
| R10 | §0 | ADRs + Decision log present and current |
| Quality | §1 success criteria | Lighthouse CI + axe in CI; manual a11y pass at CP4 |

---

## 14. Decision log (append-only)

| Date | Decision | By | Ref |
|---|---|---|---|
| 2026-11-20 | Replace the Astro + Cloudflare plan with Next.js static export on GitHub Pages (`noelrevotn.github.io`) | Noel | — |
| 2026-11-20 | v1 scope: core recruiter content + MDX blog + EN/ES + contact form; AI chat, CMS, analytics, custom domain deferred | Noel | — |
| 2026-11-20 | Visual direction: Claude Code proposes 3; Noel picks at CP1 | Noel | — |
| 2026-11-20 | **R2 amended:** keep repo `NoelRevotn/noel-site`; the site is a project site at `noelrevotn.github.io/noel-site/` with `basePath: '/noel-site'` | Noel | ADR-0002 |
| 2026-11-20 | Base stack: Next 16.4.6, React 19.3, pnpm 12, Node 24; libraries arrive in the phase that first uses them | Claude Code | ADR-0001 |
| 2026-11-20 | Static export config; `cacheComponents`/`partialPrefetching` off; root layout without `<html>`; no `.nojekyll` | Claude Code | ADR-0002 |
| 2026-11-20 | Hackathon skills (`chequeo-pre-commit`, `revisar-diff`, `plan-rapido`) not used on this project | Claude Code | docs/SKILLS.md |
| 2026-11-20 | Phase 0 approved (live at `noelrevotn.github.io/noel-site/`). Merge policy: Claude Code merges after green CI; checkpoints still gate phases. Design work always uses `frontend-design` + `impeccable` + `motion` + `ui-ux-pro-max` | Noel | §0, docs/SKILLS.md |
| 2026-11-21 | ~~CP1 direction: Línea × Sondeo mix at `/lab/mix`~~ Withdrawn by Noel the same day; mix and HTML/SVG approach discarded | Noel | — |
| 2026-11-21 | **CP1 direction: Lab A (Línea)**, with the network map in 3D (levels per domain, H2Oeste as the interchange shaft) using three.js | Noel | ADR-0003 |
| 2026-11-21 | Phase 2 shell: plain CSS tokens + CSS Modules (no Tailwind), next-intl EN/ES, Motion only for layout/inView, light-first theme; labs B, C removed | Claude Code | ADR-0004, docs/DESIGN.md |
| 2026-11-21 | **CP2 approved.** v1 islands: ⌘K palette, skill graph, tokenizer toy (project map and terminal mode stay in the backlog). Headshot: yes, Noel provides the photo. Added motion: train colour-gradient glow on the 3D lines, a page-wide ambient track backdrop (fades in after the hero), and a cursor that stretches with speed and pulls a short train of cars | Noel | — |
| 2026-11-21 | `/lab` routes removed now that CP2 is approved | Claude Code | ADR-0004 |
| 2026-11-21 | Phase 3 content: public email (Noel's OK); CV PDF printed from the web CV page in CI (GPA kept, phone removed, Noel's request); case studies for Buddy and DataLizer (Noel's choice) with TODO(noel) for every unverified part; case studies are typed TS + Zod for now, MDX arrives with the blog in Phase 4 | Noel / Claude Code | — |
| 2026-11-21 | Phase 4: blog on @next/mdx + Shiki (drafts never ship; ES falls back to EN with a notice); contact form on Web3Forms with honeypot + hCaptcha, key as a public repo variable | Claude Code | ADR-0005 |
| 2026-11-21 | Phase 5: Motion removed (WAAPI FLIP + IntersectionObserver instead); 3D map deferred, built in slices, static with 360° drag orbit (Noel); JS budgets and Lighthouse CI enforced; selection colour back to the original cyan (Noel) | Claude Code / Noel | ADR-0006 |
| 2026-11-21 | Readability pass (Noel): content sits on solid panels over the backdrop, Selected work runs as a horizontal row of cards, the CV PDF is one A4 page (CI fails otherwise) | Noel | ADR-0006 |
| 2026-11-21 | Less text on the home page (Noel): Selected work becomes a horizontal slider (velocity tilt with a ripple, project tabs; summary only, detail on the project page); the skill graph becomes a 3D particle orb on canvas with a legend as the keyboard path. Built without Motion (its gallery/orb examples are Motion+ and the budget rules it out) | Noel / Claude Code | ADR-0006 |
| 2026-11-21 | Hero map is the headline's living background (Noel): full bleed with faded edges and a ground-colour wash behind the copy; glowing lines with halos, two-car trains in line colours with headlights, pulsing project stations, drifting motes, floors without hard edges. Language switch is now a full page load so the saved theme survives | Noel | ADR-0006 |
| 2026-11-21 | Light theme less stark (Noel): new `--page` token, a cool steel `#DDE4EC` page under white panels (dark: `#070E1A` under `#0B1424`); muted text stays 5.5:1 on it | Noel | docs/DESIGN.md |
| 2026-11-21 | Airy home (Noel, after jules.google as reference; timetable and three-column layouts rejected): one idea per screen (centred Scene, one short sentence, icon), no panels on home, Línea icon set that draws in, track dividers with a crossing train, chips instead of lists; backdrop on the sides only. Rail becomes a track with a train riding between stations; footer is the terminal (buffer stop, name as last station). Hero map framed closer to centre | Noel | ADR-0006 |

---

## 15. Open questions for Noel (ask at the relevant checkpoint)
1. Contact email to publish (or form-only)? Other socials (X, Kaggle, Hugging Face, ORCID)? — Phase 3
2. Which 2–3 projects are featured, and are their repos public? — Phase 3
3. ~~Headshot: yes or no?~~ Yes, Noel provides it (CP2) — TODO(noel): send the photo
4. Status line ("Open to ML/AI internships, 2027"?) — Phase 3
5. A Spanish CV PDF too, or English only? — Phase 4
6. Content license? — Phase 5
7. When should the .tech/.me domain become canonical, and which one? — Phase 6

---

## 16. Kickoff prompt (paste into Claude Code)

```
Read PLAN.md fully. You are the lead design engineer and mentor described in §0.
Start Phase 0. First, inventory every skill and plugin available to you and write
docs/SKILLS.md (§12). Then bootstrap the repo and deploy the hello-world to GitHub
Pages. Verify Next.js static-export and next-intl details against the docs for the
installed versions before configuring. Open small PRs with a "Concepts in this PR"
section. Stop and use AskUserQuestion at the end of Phase 0 and at every checkpoint.
You may amend PLAN.md via ADRs and the Decision log; never change §2 without asking me.
```
