# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

1. **Recruiters and hiring managers** filling ML/AI or software-engineering internships. They land from a CV, LinkedIn or GitHub link and decide in about 30 seconds who Noel is, what he builds, whether there's proof, and how to contact him or get his CV.
2. **Technical reviewers** (engineers on a hiring loop). They read the code, architecture, commit history and Lighthouse scores in the public repo `NoelRevotn/noel-site`.
3. **The Panama and LatAm tech community.** Blog readers, many reading in Spanish.

## Product Purpose

A personal site that is both a recruiting tool and proof of skill: the live site and its public repo show that Noel can design, build and ship production-grade front-end software. Success: a non-technical reader passes the 30-second test (PLAN.md §1), Lighthouse ≥ 95 for a11y, best practices and SEO, and WCAG 2.2 AA.

## Positioning

A Systems & Computer Engineering student at Universidad Tecnológica de Panamá (UTP, Mar 2025 – expected Dec 2028) who already builds AI agents and data tools in Python (FastAPI, Pydantic AI, local LLMs), working toward ML engineering. Bilingual: Spanish native, English C1.

## Operating Context

- Static site on GitHub Pages at `https://noelrevotn.github.io/noel-site/`, built with Next.js static export (PLAN.md §2–§3).
- Read on recruiters' laptops and on phones opened from LinkedIn; reviewers open the GitHub repo next to it.
- Content is edited by Noel in typed files and pushed; CI deploys automatically.

## Capabilities and Constraints

- Fixed requirements R1–R10 in PLAN.md §2 are binding; only Noel changes them.
- v1 content: CV (web + PDF), socials, contact, projects, skills, developing areas, MDX blog, EN/ES, contact form.
- Not in v1: AI chat, CMS, analytics, custom domain, anything server-side.
- Undecided: status line, which projects are featured, headshot, published email, Spanish CV PDF, content license.

## Brand Commitments

- Name on the site: **Noel Echeverría** (full: Noel Alejandro Echeverría Ramírez).
- Working headline (Noel, 2026-11-20; can be revised in Phase 3): "Systems and Computer Engineering student building AI agents and data tools in Python."
- R4: must not use Anthropic typefaces (Styrene, Tiempos, Copernicus) or the Anthropic/Claude look (warm beige + coral); generic defaults (Inter, Roboto, Arial, system-ui) can't be the display face.
- R5: not static. It needs an animated background, interactive islands and a custom cursor, while staying professional and reading as an AI/ML engineer's site.
- R9: Noel picks the visual direction from three proposals (CP1).

## Evidence on Hand

- `docs/noel/Noel-Echeverria-Resume-2026.pdf` (private, gitignored): education, skills, projects, experience, certifications.
- Projects with CV-backed facts: **H2Oeste** (FISC AI Agents Hackathon 2026, team of 3, 24 h; Python, FastAPI, Gemini, OR-Tools, Supabase, React, Telegram Bot API; AI agents turn citizens' Telegram reports into optimized water-tanker routes; Noel owned the backend, auth layer, React dashboard and Telegram bot), **AgenteQuery**, **ITINERA**.
- `docs/noel/Certificates/` (private).
- None yet: metrics or outcomes for projects, testimonials, headshot, screenshots. Never fabricate them; use `TODO(noel)`.
- Keep private unless Noel says otherwise: phone number, GPA.

## Product Principles

1. Proof over claims: every skill or statement points to a real project or credential.
2. The 30-second answer comes first: who, what he builds, proof, contact/CV.
3. Honest about stage: a student who ships, with growth areas shown as in progress.
4. The site itself is the portfolio piece: craft, performance and accessibility are visible and measurable.
5. Bilingual by design, English primary.

## Accessibility & Inclusion

WCAG 2.2 AA; full keyboard use; `prefers-reduced-motion` fully respected (motion off); manual NVDA pass at CP4.
