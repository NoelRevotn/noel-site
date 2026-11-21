# noel-site

Personal portfolio and blog of **Noel Echeverría**, a Systems & Computer Engineering student at UTP, Panama, working toward ML engineering.

**Live:** https://noelrevotn.github.io/noel-site/

Built with Next.js (App Router, static export) and deployed to GitHub Pages by GitHub Actions. The plan and every design decision are in [`PLAN.md`](PLAN.md) and [`docs/adr/`](docs/adr/).

## Run it

Requires Node 24 (`.nvmrc`) and pnpm (`corepack enable` or `npm i -g pnpm`).

```sh
pnpm install
pnpm dev          # http://localhost:3000/noel-site/en/
pnpm build        # static export to out/
pnpm serve        # serve out/ like GitHub Pages: http://localhost:4173/noel-site/
pnpm test         # unit tests
pnpm test:e2e     # Playwright smoke tests (after build)
```

## Change the content

Projects, skills, the timeline, the CV and blog posts are typed files under `content/`. [`docs/CONTENT-GUIDE.md`](docs/CONTENT-GUIDE.md) explains each one in a few steps.

## How it is built

| Area          | Choice                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework     | Next.js 16 App Router, static export under `/noel-site` ([ADR-0002](docs/adr/0002-static-export-constraints.md))                                  |
| Styling       | CSS tokens (`src/styles/tokens.css`) and CSS Modules; design system in [`docs/DESIGN.md`](docs/DESIGN.md)                                         |
| Languages     | next-intl, `/en/` and `/es/`                                                                                                                      |
| Interactivity | Client islands only under `src/islands/` (ESLint enforces it)                                                                                     |
| 3D map        | three.js, loaded after the page is idle ([ADR-0003](docs/adr/0003-3d-network-map.md), [ADR-0006](docs/adr/0006-performance-motion-and-polish.md)) |
| Blog          | `@next/mdx` with Shiki ([ADR-0005](docs/adr/0005-blog-mdx-and-contact-form.md))                                                                   |
| Contact form  | Web3Forms; set the repo variable `WEB3FORMS_KEY` to turn it on                                                                                    |

## Quality gates (CI)

Every push runs lint, typecheck, format, unit and content tests, the build, JS budgets, the CV PDF (must be one page), Playwright with axe in Chromium, Firefox and WebKit, and Lighthouse CI. Only `main` deploys to GitHub Pages.
