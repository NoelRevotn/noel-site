# ADR-0004: Styling, i18n and motion tooling for the shell

- **Status:** Accepted · 2026-11-21
- **Refs:** PLAN.md §3, §5, §7; docs/DESIGN.md

## Context

Phase 2 builds the design system and the site shell around the CP1 direction (Línea). PLAN §3 left open the styling approach (Tailwind v4 or plain CSS plus tokens) and named next-intl and Motion as defaults.

## Decisions

1. **Plain CSS: custom-property tokens plus CSS Modules, no Tailwind.** The tokens in `src/styles/tokens.css` are the single source of truth, and each section and island has its own module. The look depends on a few bespoke devices (rail, trunk, stations), not on utility combinations, so Tailwind would add a build step and a second vocabulary for little gain.
2. **next-intl 4.15** for `/en/` and `/es/`. Static export means no proxy and `localePrefix: "always"`. `setRequestLocale` is called in every layout and page, with messages in `messages/{en,es}.json`. The language switch keeps the current path.
3. ~~**Motion 14** only where JS adds something CSS can't: the "You are here" flag's shared-layout slide (`layoutId`) and scroll reveals (`inView`, ~2 KB). Everything else (rail draw-in, hovers, palette open/close via `@starting-style`) is CSS.~~ Superseded by ADR-0006: Motion was removed to meet the performance budget.
4. **Theme:** light by default. A dark choice persists in `localStorage` and a tiny inline head script applies it before first paint (no flash).
5. **Islands contract enforced:** an ESLint `no-restricted-syntax` rule rejects `"use client"` outside `src/islands/**`.

## Consequences

- Labs B and C and the mix are removed. `/lab/a` stays as the CP1 reference until CP2.
- Content is typed TypeScript in `content/`, from CV facts only. Phase 3 adds Zod schemas and `check:content`.
- Sections are added by a folder plus one registry line plus one `site.config.ts` line (R3).
