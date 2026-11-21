import type { Metadata } from "next";
import { Hanken_Grotesk, Instrument_Serif, Martian_Mono } from "next/font/google";
import { SpecSheet, type Spec } from "@/components/lab/SpecSheet";
import { ChartField } from "@/islands/lab/chart/ChartField";
import { SurveyCursor } from "@/islands/lab/chart/SurveyCursor";
import { LabControls } from "@/islands/lab/LabControls";
import { lab } from "@/lib/lab-content";
import s from "./b.module.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
  variable: "--font-instrument",
  display: "swap",
});
const text = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const mono = Martian_Mono({ subsets: ["latin"], variable: "--font-martian", display: "swap" });

export const metadata: Metadata = { title: "Lab B · Sondeo" };

const spec: Spec = {
  name: "Sondeo",
  mood: "A survey chart of a loss landscape off Panama. Depth bands, contours and soundings are computed from one synthetic loss surface, and magenta probes run gradient descent across it. Precise, quiet, scientific; the title cartouche is where the chart says who made it.",
  fonts: [
    {
      role: "Display",
      family: "Instrument Serif italic (hydrographic water lettering)",
      license: "SIL Open Font License",
      href: "https://fonts.google.com/specimen/Instrument+Serif/license",
    },
    {
      role: "Text",
      family: "Hanken Grotesk",
      license: "SIL Open Font License",
      href: "https://fonts.google.com/specimen/Hanken+Grotesk/license",
    },
    {
      role: "Data",
      family: "Martian Mono, only for coordinates and depth figures",
      license: "SIL Open Font License",
      href: "https://fonts.google.com/specimen/Martian+Mono/license",
    },
  ],
  light: [
    { name: "Ground", hex: "#F8FAFB", role: "Deep water, page" },
    { name: "Ink", hex: "#10202C", role: "Text, rules" },
    { name: "Muted", hex: "#4B5D6B", role: "Secondary text, soundings" },
    { name: "Shoal", hex: "#CFE4F1", role: "Shallow band" },
    { name: "Mid", hex: "#E4F0F7", role: "Middle band" },
    { name: "Contour", hex: "#7FA7C2", role: "Contour hairlines" },
    { name: "Magenta", hex: "#B0126B", role: "Action, probes, cautions" },
    { name: "Paper", hex: "#FFFFFF", role: "Cartouche and notes" },
    { name: "Rule", hex: "#C3D3DE", role: "Neatline, hairlines" },
  ],
  dark: [
    { name: "Ground", hex: "#07121C", role: "Night chart, deep water" },
    { name: "Ink", hex: "#DCE6EE", role: "Text, rules" },
    { name: "Muted", hex: "#93A6B5", role: "Secondary text, soundings" },
    { name: "Shoal", hex: "#14354C", role: "Shallow band" },
    { name: "Mid", hex: "#0D2436", role: "Middle band" },
    { name: "Contour", hex: "#2F6286", role: "Contour hairlines" },
    { name: "Magenta", hex: "#E5589F", role: "Action, probes, cautions" },
    { name: "Paper", hex: "#0B1925", role: "Cartouche and notes" },
    { name: "Rule", hex: "#24394B", role: "Neatline, hairlines" },
  ],
  pairs: [
    { fg: "Ink", bg: "Paper", use: "Body text" },
    { fg: "Muted", bg: "Paper", use: "Secondary text" },
    { fg: "Ink", bg: "Shoal", use: "Text over shoal band" },
    { fg: "Muted", bg: "Shoal", use: "Soundings over shoal" },
    { fg: "Paper", bg: "Magenta", use: "Primary action" },
    { fg: "Magenta", bg: "Paper", use: "Magenta text and focus" },
  ],
  ambient:
    "A synthetic loss surface (five slow-drifting minima) drawn as a nautical chart: depth bands, marching-squares contours and printed soundings, all computed from the same field. Magenta probes run gradient descent and leave tracks. Canvas 2D at grid resolution. It pauses off-screen and in background tabs, steps quality down on slow devices, and draws one still chart under reduced motion.",
  cursor:
    "A magenta survey crosshair with a live readout of latitude, longitude and synthetic depth, mapped onto the Bay of Panama. Your pointer raises a shoal that the probes route around. Over a link the crosshair turns into a waypoint ring naming the action.",
  signature:
    "Pointing changes the terrain: the probes' descent paths visibly bend around the shoal your cursor raises.",
  risk: "Topographic lines are familiar in developer portfolios, so this direction depends on the contours being computed and explained, not used as wallpaper. The serif italic display softens the 'engineer' read; the mono data and probes have to carry it.",
};

export default function LabB() {
  const p = lab.project;
  return (
    <div className={`${s.root} ${display.variable} ${text.variable} ${mono.variable}`}>
      <a className={s.skip} href="#main">
        Skip to content
      </a>

      <header className={s.neatline}>
        <nav aria-label="Main">
          <ul className={s.nav}>
            <li>
              <a href="#work">Work</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#cv">CV</a>
            </li>
            <li>
              <a href="#spec">Proposal</a>
            </li>
          </ul>
        </nav>
      </header>

      <main id="main">
        <section className={s.chart} aria-labelledby="name">
          <ChartField className={s.field} />
          <aside className={s.note} aria-label="Chart note">
            <p className={s.noteLong}>
              <strong>Note.</strong> Depths are a synthetic loss surface (depth = 4 + 30 × (1.2 − loss) m).
              Magenta tracks are probes running gradient descent; a ring marks a fix in a minimum.
            </p>
            <p className={s.noteShort}>
              <strong>Note.</strong> Synthetic loss surface; magenta probes descend it.
            </p>
          </aside>
          <a className={s.waypoint} href="#work">
            <span className={s.fix} aria-hidden="true" />
            <span className={s.waypointLabel}>
              H2Oeste
              <span className={s.waypointCoords}>8°57′N 79°29′W</span>
            </span>
          </a>
          <LabControls className={s.controls} buttonClassName={s.toggle} initialTheme="light" />
          <div className={s.cartouche}>
            <h1 id="name" className={s.name}>
              {lab.name}
            </h1>
            <p className={s.headline}>{lab.headline}</p>
            <p className={s.position}>
              <span className={s.coords}>8°59′N 79°31′W</span> {lab.location}
            </p>
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
        </section>

        <div className={s.notes}>
          <section id="work" aria-labelledby="work-title">
            <h2 id="work-title" className={s.sectionTitle}>
              Work
            </h2>
            <article className={s.entry}>
              <svg className={s.mark} viewBox="0 0 40 40" aria-hidden="true">
                <circle cx="20" cy="20" r="15" />
                <circle cx="20" cy="20" r="3.5" />
                <path d="M20 0 V8 M20 32 V40 M0 20 H8 M32 20 H40" />
              </svg>
              <div>
                <h3 className={s.entryTitle}>{p.title}</h3>
                <p className={s.summary}>{p.summary}</p>
                <p>{p.what}</p>
                <p className={s.muted}>{p.context}</p>
                <p>{p.role}</p>
                <p className={s.stack}>{[...p.stack.ml, ...p.stack.sys, ...p.stack.web].join(", ")}</p>
              </div>
            </article>
          </section>

          <section id="about" aria-labelledby="about-title">
            <h2 id="about-title" className={s.sectionTitle}>
              About
            </h2>
            <p className={s.body}>{lab.about}</p>
          </section>

          <section id="cv" aria-labelledby="cv-title">
            <h2 id="cv-title" className={s.sectionTitle}>
              CV
            </h2>
            <p className={s.body}>
              B.S. in Systems and Computer Engineering, {lab.school}, March 2025 to December 2028 (expected).
              The downloadable PDF arrives in Phase 3.
            </p>
          </section>
        </div>
      </main>

      <SpecSheet spec={spec} className={s.spec} />
      <SurveyCursor className={s.cursor} readoutClassName={s.readout} />
    </div>
  );
}
