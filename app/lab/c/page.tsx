import type { Metadata } from "next";
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
      role: "Display and text",
      family: "Bricolage Grotesque (optical size and width axes, silkscreen character)",
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
    { name: "Panel", hex: "#DDE0E2", role: "Raised panels, notes" },
    { name: "Ink", hex: "#1C2024", role: "Silkscreen text" },
    { name: "Muted", hex: "#454C53", role: "Secondary silkscreen" },
    { name: "Keycap", hex: "#F1F1EC", role: "Keys" },
    { name: "Orange", hex: "#E8590C", role: "The commit key" },
    { name: "Screen", hex: "#16100A", role: "Display glass" },
    { name: "Amber", hex: "#FFB547", role: "Display phosphor" },
    { name: "Rule", hex: "#A9AFB4", role: "Panel seams" },
  ],
  dark: [
    { name: "Chassis", hex: "#1D2124", role: "Gunmetal page" },
    { name: "Panel", hex: "#272C30", role: "Raised panels, notes" },
    { name: "Ink", hex: "#E7EAEC", role: "Silkscreen text" },
    { name: "Muted", hex: "#A8B0B7", role: "Secondary silkscreen" },
    { name: "Keycap", hex: "#3A4046", role: "Keys" },
    { name: "Orange", hex: "#FF6A1F", role: "The commit key" },
    { name: "Screen", hex: "#100B06", role: "Display glass" },
    { name: "Amber", hex: "#FFB547", role: "Display phosphor" },
    { name: "Rule", hex: "#3B4247", role: "Panel seams" },
  ],
  pairs: [
    { fg: "Ink", bg: "Chassis", use: "Body text" },
    { fg: "Muted", bg: "Chassis", use: "Secondary text" },
    { fg: "Ink", bg: "Panel", use: "Text on panels" },
    { fg: "Ink", bg: "Keycap", use: "Key legends" },
    { fg: "Screen", bg: "Orange", use: "Orange key legend" },
    { fg: "Amber", bg: "Screen", use: "Screen text" },
  ],
  ambient:
    "The amber screen runs a live, synthetic training-loss trace with a phosphor glow: decaying loss, noise, and a bump at each new epoch. Only the screen moves; the chassis stays still, so text never sits on top of motion. It pauses off-screen and in background tabs, and shows a still trace under reduced motion.",
  cursor:
    "A small orange dot with a ring. Over a key, the ring snaps to that key's outline; pressing gives real key travel. Fine pointers only; off under reduced motion; switchable.",
  signature:
    "A detented knob (drag, scroll wheel, or arrow keys, as an accessible slider) changes the screen's channel: about, project, stack.",
  risk: "The strongest identity of the three and the easiest to overdo. Skeuomorphic keys can read as a product page for hardware, not a person. The 'animated background' lives inside the screen rather than behind the page, which bends R5. Recruiters may need a beat to see it's a portfolio.",
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
          <span className={s.screw} data-pos="tl" aria-hidden="true" />
          <span className={s.screw} data-pos="tr" aria-hidden="true" />
          <span className={s.screw} data-pos="bl" aria-hidden="true" />
          <span className={s.screw} data-pos="br" aria-hidden="true" />

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

          <nav className={s.keys} aria-label="Main">
            <a className={`${s.key} ${s.commit}`} href="#work">
              View projects
            </a>
            <a className={s.key} href="#cv">
              View CV
            </a>
            <a className={s.key} href="#about">
              About
            </a>
            <a className={s.key} href={lab.links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a className={s.key} href={lab.links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className={`${s.key} ${s.wide}`} href="#spec">
              Proposal
            </a>
          </nav>
          <LabControls className={s.controls} buttonClassName={s.switch} />
        </section>

        <div className={s.modules}>
          <section id="work" className={s.module} aria-labelledby="work-title">
            <h2 id="work-title" className={s.sectionTitle}>
              Work
            </h2>
            <article>
              <h3 className={s.moduleTitle}>
                <span className={s.led} aria-hidden="true" />
                {p.title}
              </h3>
              <p className={s.summary}>{p.summary}</p>
              <p>{p.what}</p>
              <p className={s.muted}>{p.context}</p>
              <p>{p.role}</p>
              <ul className={s.legends}>
                {[...p.stack.ml, ...p.stack.sys, ...p.stack.web].map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
          </section>

          <section id="about" className={s.module} aria-labelledby="about-title">
            <h2 id="about-title" className={s.sectionTitle}>
              About
            </h2>
            <p className={s.body}>{lab.about}</p>
          </section>

          <section id="cv" className={s.module} aria-labelledby="cv-title">
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
      <KeyCursor className={s.cursor} ringClassName={s.ring} />
    </div>
  );
}
