import type { Metadata } from "next";
import { Archivo, Atkinson_Hyperlegible_Next, Azeret_Mono } from "next/font/google";
import { SpecSheet, type Spec } from "@/components/lab/SpecSheet";
import { LabControls } from "@/islands/lab/LabControls";
import { StationCursor } from "@/islands/lab/transit/StationCursor";
import { TransitMap } from "@/islands/lab/transit/TransitMap";
import { lab } from "@/lib/lab-content";
import s from "./a.module.css";

const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const mono = Azeret_Mono({ subsets: ["latin"], variable: "--font-azeret", display: "swap" });
const text = Atkinson_Hyperlegible_Next({ subsets: ["latin"], variable: "--font-atkinson", display: "swap" });

export const metadata: Metadata = { title: "Lab A · Línea" };

const spec: Spec = {
  name: "Línea",
  mood: "Your work as a transit network. Domains are lines, projects are stations, and the site's navigation is the line you ride. Calm, legible, civic: signage you can read at a glance.",
  fonts: [
    {
      role: "Display",
      family: "Archivo, expanded width 112–125, weight 800",
      license: "SIL Open Font License",
      href: "https://fonts.google.com/specimen/Archivo/license",
    },
    {
      role: "Text",
      family: "Atkinson Hyperlegible Next (Braille Institute, built for low-vision legibility)",
      license: "SIL Open Font License",
      href: "https://fonts.google.com/specimen/Atkinson+Hyperlegible+Next/license",
    },
    {
      role: "Mono",
      family: "Azeret Mono, only for line codes (ML, SY, WB) and dates, with tabular figures",
      license: "SIL Open Font License",
      href: "https://fonts.google.com/specimen/Azeret+Mono/license",
    },
  ],
  light: [
    { name: "Ground", hex: "#FFFFFF", role: "Page and plate ground" },
    { name: "Ink", hex: "#0F1E33", role: "Text, stations, primary plate" },
    { name: "Muted", hex: "#4A5A70", role: "Secondary text" },
    { name: "Surface", hex: "#EEF2F6", role: "Platform plates" },
    { name: "Rule", hex: "#C9D2DD", role: "Hairlines" },
    { name: "ML line", hex: "#C8102E", role: "ML / AI domain" },
    { name: "Systems line", hex: "#00843D", role: "Systems domain" },
    { name: "Web line", hex: "#0057B8", role: "Web domain, focus ring" },
    { name: "On line", hex: "#FFFFFF", role: "Text set on a line colour" },
  ],
  dark: [
    { name: "Ground", hex: "#0B1424", role: "Night service ground" },
    { name: "Ink", hex: "#E9EFF7", role: "Text, stations, primary plate" },
    { name: "Muted", hex: "#A6B3C6", role: "Secondary text" },
    { name: "Surface", hex: "#15223A", role: "Platform plates" },
    { name: "Rule", hex: "#2A3A55", role: "Hairlines" },
    { name: "ML line", hex: "#FF7A84", role: "ML / AI domain" },
    { name: "Systems line", hex: "#3AD58D", role: "Systems domain" },
    { name: "Web line", hex: "#79B0FF", role: "Web domain, focus ring" },
    { name: "On line", hex: "#0B1424", role: "Text set on a line colour" },
  ],
  pairs: [
    { fg: "Ink", bg: "Ground", use: "Body text" },
    { fg: "Muted", bg: "Ground", use: "Secondary text" },
    { fg: "Ink", bg: "Surface", use: "Text on plates" },
    { fg: "Ground", bg: "Ink", use: "Primary plate" },
    { fg: "On line", bg: "ML line", use: "Label on ML line" },
    { fg: "On line", bg: "Systems line", use: "Label on Systems line" },
    { fg: "On line", bg: "Web line", use: "Label on Web line" },
    { fg: "Web line", bg: "Ground", use: "Focus ring (3:1 needed)" },
  ],
  ambient:
    "A live network map. Three lines (ML/AI, systems, web) are routed at 45° and 90° angles and all meet at H2Oeste. Stations are only real work: filled ones are built, hollow ones are in progress (GCI World, Samsung AI program, this site). Ink trains run each line and dwell at stations. Canvas 2D. It pauses off-screen and in background tabs, steps quality down on slow devices, and draws one still frame under reduced motion.",
  cursor:
    "A station mark (ground fill, ink ring). Over a link or button it becomes a small ink plate naming the action: Go, Open, Download, Press. Pointing near a map line isolates that line and names its domain. Fine pointers only; off under reduced motion; switchable.",
  signature:
    "The navigation is a rail that crosses the top of every page, with a 'you are here' flag on the current station.",
  risk: "Transit-map portfolios exist, so the line metaphor needs real data behind it (here: actual projects and domains) or it turns into decoration. Three saturated line colours have to be used with discipline.",
};

export default function LabA() {
  const p = lab.project;
  return (
    <div className={`${s.root} ${display.variable} ${text.variable} ${mono.variable}`}>
      <a className={s.skip} href="#main">
        Skip to content
      </a>

      <header className={s.rail}>
        <nav aria-label="Main">
          <ol className={s.stations}>
            <li>
              <a href="#main" aria-current="page">
                <span className={s.dot} aria-hidden="true" />
                Home
              </a>
              <span className={s.here} aria-hidden="true">
                You are here
              </span>
            </li>
            <li>
              <a href="#work">
                <span className={s.dot} aria-hidden="true" />
                Work
              </a>
            </li>
            <li>
              <a href="#about">
                <span className={s.dot} aria-hidden="true" />
                About
              </a>
            </li>
            <li>
              <a href="#cv">
                <span className={s.dot} aria-hidden="true" />
                CV
              </a>
            </li>
            <li>
              <a href="#spec">
                <span className={s.dot} aria-hidden="true" />
                Proposal
              </a>
            </li>
          </ol>
        </nav>
      </header>

      <main id="main">
        <section className={s.hero} aria-labelledby="name">
          <TransitMap className={s.map} />
          <div className={s.copy}>
            <h1 id="name" className={s.name}>
              {lab.name}
            </h1>
            <p className={s.headline}>{lab.headline}</p>
            <p className={s.place}>{lab.location}</p>
            <ul className={s.actions}>
              <li>
                <a className={s.primary} href="#work">
                  View projects
                </a>
              </li>
              <li>
                <a className={s.secondary} href="#cv">
                  View CV
                </a>
              </li>
              <li>
                <a className={s.secondary} href={lab.links.linkedin} target="_blank" rel="noreferrer">
                  Contact on LinkedIn
                </a>
              </li>
            </ul>
          </div>
          <LabControls className={s.controls} buttonClassName={s.toggle} initialTheme="light" />
        </section>

        <section className={s.legend} aria-labelledby="legend-title">
          <h2 id="legend-title" className="visually-hidden">
            Map legend
          </h2>
          <ul className={s.lines}>
            <li data-line="ml">
              <span className={s.code}>ML</span>
              ML / AI: GCI World program (in progress), AgenteQuery, H2Oeste, Samsung AI program (in progress)
            </li>
            <li data-line="sys">
              <span className={s.code}>SY</span>
              Systems: H2Oeste, Presidency IT practice
            </li>
            <li data-line="web">
              <span className={s.code}>WB</span>
              Web: ITINERA, H2Oeste, this site (in progress)
            </li>
          </ul>
          <p className={s.key}>
            <span className={s.filled} aria-hidden="true" /> Built
            <span className={s.hollow} aria-hidden="true" /> In progress
          </p>
        </section>

        <div className={s.trunk}>
          <section id="work" className={s.stop} aria-labelledby="work-title">
            <h2 id="work-title" className={s.stopTitle}>
              Work
            </h2>
            <article className={s.plate}>
              <svg className={s.glyph} viewBox="0 0 64 64" aria-hidden="true">
                <path d="M4 18 H24 L32 32" />
                <path d="M4 46 H20 L32 32" data-line="sys" />
                <path d="M32 4 V32" data-line="web" />
                <circle cx="32" cy="32" r="9" />
              </svg>
              <div>
                <h3 className={s.plateTitle}>{p.title}</h3>
                <p className={s.plateSummary}>{p.summary}</p>
                <p>{p.what}</p>
                <p className={s.muted}>{p.context}</p>
                <p>{p.role}</p>
                <dl className={s.transfers}>
                  <div data-line="ml">
                    <dt>
                      <span className={s.code}>ML</span> ML / AI
                    </dt>
                    <dd>{p.stack.ml.join(", ")}</dd>
                  </div>
                  <div data-line="sys">
                    <dt>
                      <span className={s.code}>SY</span> Systems
                    </dt>
                    <dd>{p.stack.sys.join(", ")}</dd>
                  </div>
                  <div data-line="web">
                    <dt>
                      <span className={s.code}>WB</span> Web
                    </dt>
                    <dd>{p.stack.web.join(", ")}</dd>
                  </div>
                </dl>
              </div>
            </article>
          </section>

          <section id="about" className={s.stop} aria-labelledby="about-title">
            <h2 id="about-title" className={s.stopTitle}>
              About
            </h2>
            <p className={s.body}>{lab.about}</p>
          </section>

          <section id="cv" className={s.stop} aria-labelledby="cv-title">
            <h2 id="cv-title" className={s.stopTitle}>
              CV
            </h2>
            <p className={s.body}>
              B.S. in Systems and Computer Engineering, {lab.school}
              <br />
              <span className={s.date}>2025-03 to 2028-12</span> <span className={s.muted}>(expected)</span>
            </p>
            <p className={`${s.body} ${s.muted}`}>The downloadable PDF arrives in Phase 3.</p>
          </section>
        </div>
      </main>

      <SpecSheet spec={spec} className={s.spec} />
      <StationCursor className={s.cursor} plateClassName={s.cursorPlate} />
    </div>
  );
}
