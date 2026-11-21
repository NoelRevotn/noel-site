# DESIGN.md: Línea

The design system of noel-site, chosen at CP1 (Lab A, with a 3D network map). Tokens live in `src/styles/tokens.css`; this file explains them.

## Principles

1. **The site is a transit network.** Domains are lines, work is stations, and navigation is the line you ride. Every device on the page belongs to that world: the rail, stations, line codes, termini, legend.
2. **Line colours mean domains, nothing else.** ML/AI red, systems green, web blue. Anything decorative or stateful uses ink and ground.
3. **Filled = built, hollow = in progress.** That's the one state vocabulary, used everywhere (map, timeline, developing, status).
4. **Signage legibility first.** White ground, deep-navy ink, a highly legible text face. Dark ("night service") is opt-in.
5. **One authored entrance, quiet details.** Motion orients or gives feedback; the 3D map is the only continuous motion.

## Colour

| Role         | Light     | Dark      | Use                                 |
| ------------ | --------- | --------- | ----------------------------------- |
| `--page`     | `#DDE4EC` | `#070E1A` | Page background (cool steel tone)   |
| `--ground`   | `#FFFFFF` | `#0B1424` | Panels, cards, plate ground         |
| `--ink`      | `#0F1E33` | `#E9EFF7` | Text, stations, rail, primary plate |
| `--muted`    | `#4A5A70` | `#A6B3C6` | Secondary text                      |
| `--surface`  | `#EEF2F6` | `#15223A` | Plates                              |
| `--rule`     | `#C9D2DD` | `#2A3A55` | Hairlines                           |
| `--line-ml`  | `#C8102E` | `#FF7A84` | ML / AI line                        |
| `--line-sys` | `#00843D` | `#3AD58D` | Systems line                        |
| `--line-web` | `#0057B8` | `#79B0FF` | Web line, focus ring                |
| `--on-line`  | `#FFFFFF` | `#0B1424` | Text on a line colour               |

All text pairs meet WCAG AA (most AAA); ratios were verified at CP1 and the axe tests run on every build.

## Type

| Role    | Face                                                                 | Licence |
| ------- | -------------------------------------------------------------------- | ------- |
| Display | **Archivo**, width 100–118, weight 650–800                           | SIL OFL |
| Text    | **Atkinson Hyperlegible Next** (Braille Institute)                   | SIL OFL |
| Mono    | **Azeret Mono**: only line codes (ML, SY, WB), dates and coordinates | SIL OFL |

All three are self-hosted with `next/font/google` (`src/lib/fonts.ts`). The scale is fluid, `--step--1` to `--step-4` (14 → 84 px), with a body measure of 62ch.

## Space, shape, grid

- Spacing uses an 8px base (`--space-1` … `--space-8`). Section rhythm is `--space-8` above each stop.
- Gutter: `--gutter` (16–48 px). Max content width: `--max` (76rem).
- Radii: 4 / 8 / 14 px. Strokes: station ring `--stroke` 3.5px; line `--line-w` 8px.

## Components

- **Rail** (`src/islands/rail`): the line across the top. Stations are the nav, a "You are here" flag slides between them (Motion `layoutId`), and the language and ⌘K plates sit at its end.
- **Trunk / Stop** (`src/components/ui/Stop.tsx`): the line continues down the page; each section is a stop with a station mark beside its heading. It ends in a terminus bar.
- **Plates:** primary (ink) and secondary (surface plus an ink outline) actions; project plates on `--surface`.
- **LineCode, StationMark:** the shared vocabulary.
- **Network map** (`src/islands/network-map`): 3D levels per domain, with H2Oeste as the interchange shaft (ADR-0003). 2D fallback.
- **Command palette** (`src/islands/command-palette`): ⌘K / Ctrl+K, a native `<dialog>`.
- **Cursor** (`src/islands/cursor`): a station mark that becomes an interchange plate naming the action.

## Motion

Tokens: `--dur-*` (80/160/240/400 ms) and `--ease-standard | emphasized | exit`, mirrored in `src/motion/tokens.ts`.

- **Entrance:** the rail draws in, its stations pop in turn, and the hero copy rises in sequence.
- **Scroll:** `[data-reveal]` elements rise in once (Motion `inView`). Content is visible without JS.
- **Feedback:** plates lift 2px; station dots scale on hover; the palette fades and scales in.
- **Ambient:** the 3D map only.
- **Rules:** everything stops under `prefers-reduced-motion`, and the Pause switch (WCAG 2.2.2) stops the map.

## Do / don't

- **Do** use ink for state and emphasis. **Don't** use a line colour on anything that isn't its domain.
- **Do** mark in-progress items hollow. **Don't** invent a third state.
- **Do** keep mono for codes, dates and coordinates. **Don't** use it for labels or body text.
- **Don't** add Inter, Roboto or system-ui as display faces, or anything Anthropic-styled (R4).
