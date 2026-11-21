# Content guide

How to change what the site says without touching components. Each task below is one file. To see a change, run `pnpm dev` and open http://localhost:3000/noel-site/en/.

Content is typed TypeScript under `content/`, validated by Zod (`content/schema.ts`) when the site builds. A typo in a field name or a missing translation fails the build with a message that names the field.

**Every text field has an English and a Spanish version:** `{ en: "…", es: "…" }`. If you don't have a fact yet, write `TODO(noel): what is missing`. It shows highlighted on the site, `pnpm check:content` lists it, and `RELEASE=1 pnpm check:content` fails while any remain.

## Add a project

Edit `content/projects.ts` and add an object to the array. Copy an existing project as the starting point.

| Field       | What it is                                                                                            |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| `slug`      | URL name, lowercase with dashes: `my-project` → `/projects/my-project/`                               |
| `title`     | Display name                                                                                          |
| `summary`   | One line, under ~70 characters. Shown on cards and in the CV PDF                                      |
| `what`      | Two or three sentences: what it does, for whom                                                        |
| `context`   | Where it came from: course, hackathon, team size, year                                                |
| `role`      | Optional. Your part, when it was a team                                                               |
| `period`    | Optional. `"2026"` or `"2026-03"`                                                                     |
| `domains`   | One or more of `"ml"`, `"sys"`, `"web"`. These decide which lines it sits on                          |
| `stack`     | Tools per domain: `{ ml: ["pandas"], sys: ["FastAPI"] }`                                              |
| `status`    | `"shipped"`, `"prototype"` or `"in-progress"` (hollow station)                                        |
| `featured`  | `true` puts it in Selected work on the home page (up to the `limit` in `site.config.ts`, currently 3) |
| `links`     | Optional `{ repo: "https://…", demo: "https://…" }`                                                   |
| `caseStudy` | Optional. `problem`, `approach`, `architecture`, `results`, `learned`, each `{ en, es }`              |

The order in the array is the order on the site.

## Add or change a skill

Edit `content/skills.ts`. Skills live in groups (`ml`, `sys`, `web`, `tools`). `evidence` lists the project slugs that prove the skill; the skill orb on the home page draws those links. There are no bars or ratings by design.

## Add a job, program or certification

- Jobs, education and programs: `content/timeline.ts` (`kind` is `"work"`, `"education"` or `"program"`; `end: null` means ongoing).
- Certifications: `content/cv.ts`, `certifications`. Add `verifyUrl` when there is a public verification link.
- The CV page and the CV PDF read from these same files.

## Write a blog post

1. Create `content/blog/<slug>/en.mdx`. `es.mdx` is optional; without it the Spanish page shows the English text with a notice.
2. Start the file with its metadata:

   ```mdx
   export const metadata = {
     title: "What a tokenizer actually does",
     description: "One sentence for the index, search results and RSS.",
     date: "2026-12-01",
     tags: ["ml"],
     draft: true,
   };

   Your first paragraph…
   ```

3. Write in Markdown. Use `##` headings; they build the table of contents. Code blocks get highlighting from their language: ` ```python `.
4. `draft: true` never ships. Preview drafts with `SHOW_DRAFTS=1 pnpm build`, then `pnpm serve`.
5. When it's ready, set `draft: false` and merge. RSS, the sitemap and the home page's Latest writing update on their own.

## Change the home page

Edit `home` in `site.config.ts`. Reorder the lines to reorder the sections, set `enabled: false` to hide one, and change `limit` to show more or fewer items.

## Change interface text

Buttons, labels and headings are in `messages/en.json` and `messages/es.json`. Keep the same keys in both files; a test fails when they differ.

## Update the CV PDF

There is nothing to update by hand. CI prints `/en/cv/` and `/es/cv/` to PDF on every build, so the PDF always matches the CV page. It must fit on one A4 page: if new content pushes it to two, `pnpm cv:pdf` fails and says so. Shorten a line, or tell Claude Code which entry to drop from print.

## Before you merge

```sh
pnpm check:content   # lists every TODO(noel)
pnpm build           # validates all content
```
