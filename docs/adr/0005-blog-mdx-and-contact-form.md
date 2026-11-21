# ADR-0005: Blog with @next/mdx, contact form with Web3Forms

- **Status:** Accepted · 2026-11-21
- **Refs:** PLAN.md §3 (Content, Contact form rows), §6.3, §11 Phase 4

## Blog: options

PLAN §3 says to pick the content layer by maintenance health. Checked on 2026-11-21:

| Option              | Latest                    | Last release      | Notes                                         |
| ------------------- | ------------------------- | ----------------- | --------------------------------------------- |
| **@next/mdx**       | 16.4.6                    | 2026-11-20        | Ships with Next itself; no extra build step   |
| content-collections | core 0.15.3 / next 0.2.11 | 2026-09 / 2026-02 | Separate content build; Next adapter lags     |
| Velite              | 0.4.0                     | 2026-06           | Separate content build, pre-1.0               |
| next-mdx-remote     | 6.0.0                     | 2026-02           | Compiles at request/render; extra moving part |

## Blog: decision

**@next/mdx**: posts in `content/blog/<slug>/{en.mdx, es.mdx?}`, each exporting a `metadata` object that is validated with Zod (`PostMeta`).

- Plugins are named by string, as Turbopack requires: `remark-gfm`, `rehype-slug`, and `rehype-pretty-code` with **Shiki** (build-time highlighting with a light/dark dual theme).
- `src/lib/blog.ts` computes reading time and the table of contents from the source, using the same `github-slugger` as `rehype-slug` so TOC links always match heading ids.
- Drafts (`draft: true`) never ship. Preview them with `SHOW_DRAFTS=1`.
- Spanish is optional. Without `es.mdx`, the Spanish page shows the English text, marked `lang="en"`, with the notice "Disponible solo en inglés" (PLAN §6.3).
- RSS at `/rss.xml`. `BlogPosting` JSON-LD on each post.
- Static export requires at least one page per dynamic route. Until the first post is published, a `noindex` placeholder `/blog/_empty/` is emitted.

## Contact form: options

|                  | Web3Forms                                                              | Formspree                                                         |
| ---------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Free limit       | Not verified (pricing page returned 403)                               | 50 submissions / month                                            |
| Honeypot on free | `botcheck`                                                             | `_gotcha`                                                         |
| CAPTCHA on free  | hCaptcha, zero-config                                                  | reCAPTCHA; Turnstile availability on free not stated              |
| API              | `POST https://api.web3forms.com/submit`, documented success/error JSON | `POST https://formspree.io/f/{id}`, response shape not documented |

## Contact form: decision

**Web3Forms**, with a honeypot plus hCaptcha (`https://web3forms.com/client/script.js`, loaded only on the contact page). The form validates with Zod before sending, shows errors next to each field (`aria-invalid`, `aria-describedby`, focus on the first error), and announces status through `aria-live`. A privacy note names Web3Forms and hCaptcha.

The access key goes in `NEXT_PUBLIC_WEB3FORMS_KEY` at build time, from the GitHub **repository variable** `WEB3FORMS_KEY`. It is public by design: it only lets the form deliver to Noel's inbox. Until it is set, the contact page shows email only.

## Consequences

- Noel creates the Web3Forms account and sets the repository variable. Claude Code doesn't create accounts.
- If the Web3Forms free limit turns out too low, Formspree is a drop-in replacement: same form, different endpoint.
- Revisit content-collections if posts ever need cross-references or computed collections beyond what `src/lib/blog.ts` does.
