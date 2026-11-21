# ADR-0006: Performance budget, Motion removal and Phase 5 polish

- **Status:** Accepted · 2026-11-21
- **Refs:** PLAN.md §3, §7, §9, §11 Phase 5; supersedes ADR-0004 decision 3 (Motion)

## Context

Phase 5 set out to ship the islands, polish motion and pass the quality gates (§9). The first Lighthouse run on the home page scored **71** on mobile, below the 90 target. The cost came from three places: the Motion runtime in the initial bundle, the three.js scene building on the main thread during load, and the backdrop canvas animating from the first frame. Noel also asked for a static 3D map you can drag 360°, panels that keep text readable over the backdrop, a horizontal "Selected work" row and a one-page CV.

## Decisions

1. **Motion is removed.** It was used in two places:
   - The rail's "You are here" flag now slides with a FLIP done in the Web Animations API.
   - Scroll reveals use one plain `IntersectionObserver` (`src/islands/reveal/RevealObserver.tsx`).

   Both fit in a few lines, so ~40 KB of initial JS was not worth it (ponytail: platform before dependency).

2. **The 3D map loads last and builds in slices.**
   - It starts after `load` plus idle, through a three.js subset module (`three-subset.ts`).
   - Shaders are compiled with `compileAsync`.
   - `mount` yields to the main thread between lines, so no single task blocks input.
3. **The map is static and orbitable.**
   - The camera no longer drifts.
   - Drag or the arrow keys orbit 360° with momentum.
   - On touch, horizontal drags orbit and vertical swipes still scroll.
4. **The backdrop is quieter.**
   - It runs at 30 fps.
   - It waits for idle before starting.
   - Touch devices get one still frame.
   - Reduced motion and the pause switch freeze it on a still frame.
5. **Budgets are enforced in CI** by `scripts/check-budgets.mjs`, which fails the build when a budget is exceeded:

   | Bundle                      | Budget |
   | --------------------------- | ------ |
   | Initial JS on the home page | 180 KB |
   | Initial JS on content pages | 165 KB |
   | Lazy 3D chunk               | 150 KB |

   Lighthouse CI asserts the scores: performance ≥ 0.9 (warning), and a11y, best practices and SEO ≥ 0.95 (errors). Links use `prefetch={false}`, so pages don't download routes nobody visits.

6. **Content panels.** Every block on the trunk sits on a solid `--ground` panel with a hairline border, so the backdrop never runs behind text. One rule (`.trunk > :not(script)` in `ui.module.css`) owns the spacing. Station dots are offset by `--panel-pad` so they stay on the trunk line.
7. **One-page CV.** The print stylesheet fits A4:
   - Lines run full width.
   - Each project prints as one line (title and summary).
   - Certifications print in two columns.

   `scripts/cv-pdf.mjs` counts the pages and fails if the PDF is longer than one.

8. **Slider and orb without a library.** Noel pointed at Motion's gallery tilt/ripple and particle orb examples. Those are Motion+ (paid) and would bring Motion back. Both are built from the platform instead:
   - `src/islands/project-slider/`: native scroll-snap with per-card springs driven by scroll velocity (the ripple is stiffness falling off with distance), plus tabs, arrows and mouse drag.
   - `src/islands/skill-orb/`: a 2D canvas that projects a Fibonacci-sphere particle shell. The legend buttons are the keyboard and screen-reader path.

   Together they add about 3 KB to the home page's initial JS.

## Results (Lighthouse 13, mobile emulation, local static build)

| Page          | Performance | Accessibility | Best practices | SEO |
| ------------- | ----------- | ------------- | -------------- | --- |
| Home          | 91–92       | 100           | 100            | 100 |
| Content pages | 100         | 100           | 100            | 100 |

| Bundle                    | Size     |
| ------------------------- | -------- |
| Initial JS, home          | 164.7 KB |
| Initial JS, content pages | ~156 KB  |
| Lazy 3D chunk             | 134.6 KB |

## Consequences

- No animation library is installed. A future effect that truly needs springs or layout animation has to justify one against these budgets.
- The 3D map appears a beat after the page. The 2D SVG map is the first paint and stays as the fallback when WebGL is unavailable.
- New pages get panels for free when they put their blocks directly inside `<Trunk>`.
