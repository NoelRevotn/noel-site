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
