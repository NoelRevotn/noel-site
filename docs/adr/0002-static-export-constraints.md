# ADR-0002: Static export on GitHub Pages: constraints and consequences

- **Status:** Accepted · 2026-11-20
- **Refs:** PLAN.md §2 R2 (amended), §3, §4. Verified against `node_modules/next/dist/docs/` for Next 16.4.6 and next-intl.dev (v4 docs, npm latest 4.15.3).

## Context

The site is a fully static build (`output: 'export'`) on GitHub Pages. Noel chose to keep the repo `NoelRevotn/noel-site`, so GitHub serves it as a **project site** at `https://noelrevotn.github.io/noel-site/` rather than a user site at the root (R2 amended with Noel's OK on 2026-11-20).

## Decision

`next.config.ts`:

```ts
output: "export", trailingSlash: true, basePath: "/noel-site", images: { unoptimized: true }
```

| Constraint (Next 16.4 static-export docs)                                                 | Consequence for this project                                                                                                                                         |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No proxy/middleware, `redirects`, `rewrites`, `headers`                                   | Locale detection can't happen on the server. `/` is a static page with `<meta http-equiv="refresh">` + visible EN/ES links + `hreflang` alternates (`app/page.tsx`). |
| Dynamic routes need `generateStaticParams`; `dynamicParams: true` unsupported             | `app/[locale]/layout.tsx` exports both `generateStaticParams` and `dynamicParams = false`. The same goes for `projects/[slug]` and `blog/[slug]` later.              |
| Route Handlers: only `GET` with `dynamic = 'force-static'`                                | sitemap, robots, RSS and `llms.txt` must be `force-static`.                                                                                                          |
| Default image loader unsupported                                                          | `images.unoptimized: true` for now; pre-optimized images at build (Phase 3).                                                                                         |
| No Server Actions, cookies or request-time APIs                                           | The contact form posts to a third-party endpoint from a client island (Phase 4).                                                                                     |
| `basePath` is applied by `next/link`/router, **not** to `next/image` `src` or plain `<a>` | `withBase()` helper in `src/lib/paths.ts`, unit-tested.                                                                                                              |
| `trailingSlash: true` emits `/en/index.html`                                              | GitHub Pages serves directories without rewrites; it serves `out/404.html` for unknown URLs.                                                                         |

Other decisions:

- **`cacheComponents` and `partialPrefetching` removed** (create-next-app defaults). Everything is pre-rendered at build time, so they buy nothing here and make next-intl setup harder (Cache Components also requires the Node.js runtime). Revisit only if a server is ever added (Phase 6).
- **Root layout returns `children` only.** `<html lang>` lives in `app/[locale]/layout.tsx` so `lang` follows the locale. `app/page.tsx` (redirect) and `app/not-found.tsx` (→ `404.html`) render their own documents, the pattern next-intl documents. `experimental.globalNotFound` was rejected because it's still experimental in 16.4.
- **No `public/.nojekyll`** (differs from PLAN §3). Jekyll only runs in "deploy from branch" mode. With Pages source = GitHub Actions, the uploaded artifact is served as-is, `_next/` included.

### next-intl findings (applied in Phase 2, not installed yet)

- With static export "a proxy / middleware will not run": omit `proxy.ts`. A locale prefix is required; `localePrefix: 'always'` is the default. `pathnames` (localized slugs) **can't** be used.
- Files: `src/i18n/routing.ts` (`defineRouting`), `src/i18n/navigation.ts` (`createNavigation`), `src/i18n/request.ts` (`getRequestConfig`, locale via `next/root-params`, default since Next 16.3; verify against the local docs when installing).
- `setRequestLocale` is now marked legacy; `next/root-params` makes routes eligible for static rendering. `generateStaticParams` stays in `[locale]/layout.tsx`.
- next-intl's `Link`/navigation pick up `basePath`; `getPathname` returns paths **without** it, so wrap it with `withBase()` for hreflang/canonical URLs.

## Consequences

- Absolute URLs (canonical, OG, sitemap, JSON-LD) are built from `site.origin + basePath`, both in `site.config.ts`.
- Moving to a custom domain (Phase 6) or renaming the repo to `NoelRevotn.github.io` means setting `basePath` to `""`. That's a one-line change, because every path goes through `site.config.ts`.
- `pnpm serve` (zero-dependency `scripts/serve-out.mjs`) reproduces the GitHub Pages layout locally, and the Playwright smoke tests run against it in CI.
