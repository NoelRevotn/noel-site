# ADR-0003: 3D network map with three.js

- **Status:** Accepted · 2026-11-21
- **Refs:** PLAN.md §3 (ambient background row), §7.2, §7.5; CP1 choice in the Decision log

## Context

At CP1 Noel chose Lab A (Línea) and asked for its network map to be 3D. PLAN §3 says the ambient island should start with Canvas 2D or raw WebGL and only move to a 3D library "if the chosen direction truly needs 3D". It now does.

## Options

1. Raw WebGL: smallest bundle, but tubes, curves, lighting and raycasting would all be hand-written.
2. **three.js** (vanilla, inside one client island).
3. react-three-fiber + drei: a React layer over three.js. It's convenient, but adds more dependencies for one island that doesn't need React state.

## Decision

Option 2, three.js 0.187.0, in `src/islands/lab/transit/TransitMap3D.tsx`.

- Each domain is a level: ML/AI on top, systems in the middle, web at ground. H2Oeste is a vertical interchange shaft joining all three.
- three.js is loaded with a dynamic `import()` after first paint, so the text and LCP don't wait for it. The map fades in once it has rendered.
- Station labels are DOM text projected from 3D positions, which keeps them crisp and selectable. The legend strip is the text equivalent of the map.
- Without WebGL, the existing 2D canvas map (`TransitMap.tsx`) renders instead.
- The existing motion rules carry over: DPR is capped at 2; the map pauses off-screen, in hidden tabs and on the pause switch; and it draws one still frame under reduced motion.

## Consequences

- The three.js chunk (about 150–170 KB gzip, lazy-loaded) is the largest item on the home page. Phase 5's performance pass should check it against the §7.5 budget and switch to named imports if tree-shaking helps.
- Lab B, Lab C and the mix are no longer candidates.
