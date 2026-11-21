@AGENTS.md

# noel-site: project memory for Claude Code

The source of truth is `PLAN.md`. Read §0 before any work. Short version:

- **§2 fixed requirements change only with Noel's explicit OK** (ask with AskUserQuestion). Anything else changes through an ADR in `docs/adr/` + a line in the PLAN.md §14 Decision log, in the same PR.
- **Never invent facts about Noel.** A missing fact becomes `TODO(noel): …`.
- **Mentor mode:** every PR description has a "Concepts in this PR" section (template in `.github/pull_request_template.md`).
- **Least machinery:** apply the `ponytail` ladder before adding a dependency. Never cut a11y, validation or security.
- **Stop at checkpoints** (end of each phase, CP1–CP4). Only Noel merges to `main`.
- Skills to use per phase: `docs/SKILLS.md`.

## Commands (pnpm, Node 24 from `.nvmrc`)

|                                                      |                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------- |
| `pnpm dev`                                           | dev server at http://localhost:3000/noel-site/en/                   |
| `pnpm build`                                         | static export to `out/`                                             |
| `pnpm serve`                                         | serves `out/` like GitHub Pages at http://localhost:4173/noel-site/ |
| `pnpm lint` · `pnpm typecheck` · `pnpm format:check` | static checks                                                       |
| `pnpm test`                                          | Vitest unit tests (`src/**/*.test.ts`)                              |
| `pnpm test:e2e`                                      | Playwright smoke tests against `out/` (build first)                 |

## Conventions

- Static export: no proxy/middleware, redirects, headers, Server Actions or request-time APIs. Dynamic routes need `generateStaticParams` + `dynamicParams = false`. Details: `docs/adr/0002-static-export-constraints.md`.
- The site is served under the basePath `/noel-site` (`site.config.ts`). `next/link` adds it automatically; plain `<a>`, meta refresh and `next/image` `src` need `withBase()` from `src/lib/paths.ts`.
- Branches `feat/… fix/… chore/… docs/…`; Conventional Commits; small PRs, one concern each.
- `"use client"` only under `src/islands/**` (enforced by ESLint).
- Design system: `docs/DESIGN.md`; tokens in `src/styles/tokens.css`. Line colours mean domains only.
- Home page = data: add/remove/reorder sections in `site.config.ts` (`home`), components in `src/sections/<id>/`, map in `src/sections/registry.tsx`.
- UI strings in `messages/{en,es}.json` (keep keys in parity); content in `content/*.ts` (CV facts only; unknowns are `TODO(noel)`).
