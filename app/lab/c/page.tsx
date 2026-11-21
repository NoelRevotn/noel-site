import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Bricolage_Grotesque, Fragment_Mono } from "next/font/google";
import { SpecSheet, type Spec } from "@/components/lab/SpecSheet";
import { Instrument, type Channel } from "@/islands/lab/bench/Instrument";
import { KeyCursor } from "@/islands/lab/bench/KeyCursor";
import { LabControls } from "@/islands/lab/LabControls";
import { lab } from "@/lib/lab-content";
import s from "./c.module.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
  display: "swap",
});
const mono = Fragment_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-fragment",
  display: "swap",
});

export const metadata: Metadata = { title: "Lab C · Banco" };

const spec: Spec = {
  name: "Banco",
  mood: "The portfolio as a bench instrument a builder operates: an amber readout, a grid of keycaps and one orange key that matters. Tactile, hands-on, a little playful; you operate the page instead of scrolling past cards.",
  fonts: [
    {
      role: "Display, text and silkscreen",
      family: "Bricolage Grotesque (optical size and width axes)",
      license: "SIL Open Font License",
      href: "https://fonts.google.com/specimen/Bricolage+Grotesque/license",
    },
    {
      role: "Legends and readouts",
      family: "Fragment Mono, only on keys and the screen",
      license: "SIL Open Font License",
      href: "https://fonts.google.com/specimen/Fragment+Mono/license",
    },
  ],
  light: [
    { name: "Chassis", hex: "#CDD1D4", role: "Anodised aluminium page" },
    { name: "Plate", hex: "#DDE0E2", role: "Instrument plate, modules" },
    { name: "Ink", hex: "#1C2024", role: "Silkscreen text" },
    { name: "Muted", hex: "#454C53", role: "Secondary silkscreen" },
    { name: "Keycap", hex: "#F1F1EC", role: "Bone keys" },
    { name: "Legend", hex: "#1C2024", role: "Key legends" },
    { name: "Orange", hex: "#E8590C", role: "The commit key" },
    { name: "Screen", hex: "#16100A", role: "Display glass" },
    { name: "Amber", hex: "#FFB547", role: "Display phosphor" },
  ],
  dark: [
    { name: "Chassis", hex: "#1D2124", role: "Charcoal page" },
    { name: "Plate", hex: "#3D4248", role: "Gunmetal plate, modules" },
    { name: "Ink", hex: "#ECEEF0", role: "Silkscreen text" },
    { name: "Muted", hex: "#BFC5CA", role: "Secondary silkscreen" },
    { name: "Keycap", hex: "#E6E2D9", role: "Bone keys" },
    { name: "Legend", hex: "#1C2024", role: "Key legends" },
    { name: "Orange", hex: "#FF6A1F", role: "The commit key" },
    { name: "Screen", hex: "#100B06", role: "Display glass" },
    { name: "Amber", hex: "#FFB547", role: "Display phosphor" },
  ],
  pairs: [
    { fg: "Ink", bg: "Chassis", use: "Text on the page" },
    { fg: "Ink", bg: "Plate", use: "Text on the plate" },
    { fg: "Muted", bg: "Plate", use: "Silkscreen labels" },
    { fg: "Legend", bg: "Keycap", use: "Key legends" },
    { fg: "Screen", bg: "Orange", use: "Orange key legend" },
    { fg: "Amber", bg: "Screen", use: "Screen text" },
  ],
  ambient:
    "The amber screen runs a live, synthetic training-loss trace with a phosphor glow: decaying loss, noise and a bump at each new epoch. Its light spills onto the plate around the bezel, breathing with the trace. That is the page's animated background, kept on the instrument rather than behind the text. Everything pauses off-screen, in background tabs and on request; under reduced motion the trace is still and the spill is off.",
  cursor:
    "A small orange dot with a ring. Over a key, the ring snaps to that key's outline; pressing gives real key travel. Fine pointers only; off under reduced motion; switchable.",
  signature:
    "A detented, knurled knob (drag, scroll wheel, or arrow keys, as an accessible slider) changes the screen's channel: about, project, stack.",
  risk: "The strongest identity of the three and the easiest to overdo. Skeuomorphic keys can read as a product page for hardware, not a person, and recruiters may need a beat to see it's a portfolio. Its animated background is the screen's light, not a full-page field, which is a looser reading of R5.",
};

const icon = (d: ReactNode) => (
  <svg className={s.icon} viewBox="0 0 16 16" aria-hidden="true">
    {d}
  </svg>
);
const icons = {
  cv: icon(
    <>
      <path d="M4 1.5h5.5L12 4v10.5H4z" />
      <path d="M9.5 1.5V4H12M6 8h4M6 10.5h4" />
    </>,
  ),
  projects: icon(
    <>
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </>,
  ),
  about: icon(
    <>
      <circle cx="8" cy="5.5" r="2.75" />
      <path d="M2.75 14c.75-2.75 2.75-4 5.25-4s4.5 1.25 5.25 4" />
    </>,
  ),
  external: icon(
    <>
      <path d="M9 2.5h4.5V7M13.5 2.5 7 9" />
      <path d="M11.5 9.5v4h-9v-9h4" />
    </>,
  ),
  spec: icon(
    <>
      <path d="M1.5 10.5 10.5 1.5l4 4-9 9z" />
      <path d="M5 7l1.5 1.5M7 5l1.5 1.5M9 3l1.5 1.5" />
    </>,
  ),
};

export default function LabC() {
  const p = lab.project;
  const channels: Channel[] = [
    { id: "about", label: "About", lines: [lab.location, "Samsung Innovation Campus AI scholar, 2026"] },
    { id: "project", label: "Project", lines: [`${p.title}: ${p.summary}`, p.context] },
    {
      id: "stack",
      label: "Stack",
      lines: ["Python, FastAPI, Pydantic AI, Ollama", "React, Supabase, SQLite, C#"],
    },
  ];
  return (
    <div className={`${s.root} ${display.variable} ${mono.variable}`}>
      <a className={s.skip} href="#main">
        Skip to content
      </a>
      <main id="main">
        <section className={s.instrument} aria-labelledby="name">
          <p className={s.model} aria-hidden="true">
            Banco
          </p>

          <Instrument
            name={lab.name}
            headline={lab.headline}
            channels={channels}
            classes={{
              screen: s.screen,
              name: s.name,
              headline: s.headline,
              channel: s.channel,
              trace: s.trace,
              readout: s.readout,
              knobWrap: s.knobWrap,
              knob: s.knob,
              detents: s.detents,
              detent: s.detent,
            }}
          />

          <div className={s.bank}>
            <p className={s.silk} aria-hidden="true">
              Navigate
            </p>
            <nav className={s.keys} aria-label="Main">
              <a className={`${s.key} ${s.commit}`} href="#cv">
                {icons.cv}
                <span className={s.legend}>Download CV</span>
                <span className={s.sub}>PDF in Phase 3</span>
              </a>
              <a className={s.key} href="#work">
                {icons.projects}
                <span className={s.legend}>View projects</span>
              </a>
              <a className={s.key} href="#about">
                {icons.about}
                <span className={s.legend}>About</span>
              </a>
              <a className={s.key} href={lab.links.linkedin} target="_blank" rel="noreferrer">
                {icons.external}
                <span className={s.legend}>LinkedIn</span>
              </a>
              <a className={s.key} href={lab.links.github} target="_blank" rel="noreferrer">
                {icons.external}
                <span className={s.legend}>GitHub</span>
              </a>
              <a className={`${s.key} ${s.wide}`} href="#spec">
                {icons.spec}
                <span className={s.legend}>Proposal</span>
              </a>
            </nav>
            <p className={s.silk} aria-hidden="true">
              Channel
            </p>
          </div>

          <div className={s.display}>
            <p className={s.silk} aria-hidden="true">
              Display
            </p>
            <LabControls className={s.controls} buttonClassName={s.switch} initialTheme="light" />
          </div>
        </section>

        <div className={s.strip}>
          <section id="work" className={s.bay} aria-labelledby="work-title">
            <h2 id="work-title" className={s.bayTitle}>
              <span className={s.led} aria-hidden="true" />
              {p.title}
            </h2>
            <p className={s.summary}>{p.summary}</p>
            <p>{p.what}</p>
            <p className={s.muted}>{p.context}</p>
            <p>{p.role}</p>
            <ul className={s.legends}>
              {[...p.stack.ml, ...p.stack.sys, ...p.stack.web].map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>

          <section id="about" className={s.bay} aria-labelledby="about-title">
            <h2 id="about-title" className={s.bayTitle}>
              About
            </h2>
            <p className={s.body}>{lab.about}</p>
          </section>

          <section id="cv" className={s.bay} aria-labelledby="cv-title">
            <h2 id="cv-title" className={s.bayTitle}>
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
      <KeyCursor className={s.cursor} ringClassName={s.ring} />
    </div>
  );
}
