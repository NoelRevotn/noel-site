# ADR-0001: Base stack

- **Status:** Accepted · 2026-11-20
- **Refs:** PLAN.md §2 (R1, R2), §3

## Context

R1 requires React with Next.js static export; R2 requires GitHub Pages. PLAN.md §3 lists default tools. Phase 0 needs only enough to prove the build → deploy pipeline.

## Options

1. Adopt the whole §3 stack on day one (Tailwind, Motion, next-intl, Zod, MDX, Lighthouse CI…).
2. Adopt the base stack now and add each library in the phase that first uses it.

## Decision

Option 2. Phase 0 installs:

| Concern         | Choice (installed version)                                                                  |
| --------------- | ------------------------------------------------------------------------------------------- |
| Framework       | Next.js **16.4.6**, App Router, React **19.3.0**                                            |
| Language        | TypeScript 5.9 (`strict`, `noUncheckedIndexedAccess`)                                       |
| Package manager | pnpm **12.21.0** (`packageManager` field), Node **24** LTS (`.nvmrc`)                       |
| Lint / format   | ESLint 9 + `eslint-config-next` (core-web-vitals + TS; includes jsx-a11y rules), Prettier 3 |
| Tests           | Vitest 5 (units), Playwright 1.65 (smoke tests against the built export)                    |
| CI/CD           | GitHub Actions → `actions/upload-pages-artifact@v5` + `actions/deploy-pages@v5`             |

Deferred to the phase that needs them: Tailwind or plain CSS (ADR-0003 after CP1), Motion and next-intl (Phase 2), Zod and the content layer (Phase 3), MDX (Phase 4), Lighthouse CI + axe (Phase 2, once there's UI to measure).

`create-next-app@16.4.6` enables `cacheComponents` and `partialPrefetching` by default. Both are removed; see ADR-0002.

## Consequences

- The first PR stays small and reviewable, and every later dependency arrives in a PR that explains it.
- `AGENTS.md` (written by Next.js) tells coding agents to read `node_modules/next/dist/docs/` for the installed version. `CLAUDE.md` imports it.
