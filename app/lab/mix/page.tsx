import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Hanken_Grotesk, Instrument_Serif, Martian_Mono } from "next/font/google";
import { LabControls } from "@/islands/lab/LabControls";
import { SvgMotion } from "@/islands/lab/SvgMotion";
import { StationCursor } from "@/islands/lab/transit/StationCursor";
import { lab } from "@/lib/lab-content";
import s from "./mix.module.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
  variable: "--font-instrument",
  display: "swap",
});
const text = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const mono = Martian_Mono({ subsets: ["latin"], variable: "--font-martian", display: "swap" });

export const metadata: Metadata = { title: "Lab · Línea × Sondeo" };

type Station = { name: string; x: number; y: number; built: boolean; label: "above" | "below" | "right" };
type Line = {
  id: "ml" | "sys" | "web";
  code: string;
  name: string;
  d: string;
  stations: Station[];
  trainDur: number;
};

// Octilinear routes (45° and 90° only). Stations are real work from the CV; hollow = in progress.
const H2O: Station = { name: "H2Oeste", x: 410, y: 270, built: true, label: "right" };
const LINES: Line[] = [
  {
    id: "ml",
    code: "ML",
    name: "ML / AI",
    d: "M 60 90 H 230 L 410 270 L 560 420 H 700",
    trainDur: 14,
    stations: [
      { name: "GCI World program", x: 110, y: 90, built: false, label: "below" },
      { name: "AgenteQuery", x: 230, y: 90, built: true, label: "above" },
      H2O,
      { name: "Samsung AI program", x: 640, y: 420, built: false, label: "below" },
    ],
  },
  {
    id: "sys",
    code: "SY",
    name: "Systems",
    d: "M 70 400 H 140 L 270 270 H 410 L 560 120 H 700",
    trainDur: 11,
    stations: [H2O, { name: "Presidency IT practice", x: 630, y: 120, built: true, label: "above" }],
  },
  {
    id: "web",
    code: "WB",
    name: "Web",
    d: "M 190 540 V 500 H 330 L 410 420 V 40",
    trainDur: 9,
    stations: [
      { name: "ITINERA", x: 260, y: 500, built: true, label: "below" },
      H2O,
      { name: "This site", x: 410, y: 40, built: false, label: "right" },
    ],
  },
];

function TransitSvg() {
  const seen = new Set<string>();
  return (
    <svg className={s.map} viewBox="0 0 720 560" data-smil role="img" aria-labelledby="map-title">
      <title id="map-title">Map of Noel&apos;s work: ML/AI, systems and web lines all meet at H2Oeste.</title>
      {LINES.map((l, i) => (
        <g key={l.id} className={s.line} data-line={l.id} style={{ "--i": i } as CSSProperties}>
          <path id={`route-${l.id}`} className={s.casing} d={l.d} />
          <path className={s.stroke} d={l.d} pathLength={1} />
          {/* Two trains per line, starting at opposite ends and running back and forth. */}
          {["0;1;0", "1;0;1"].map((points) => (
            <g key={points} className={s.train}>
              <rect x="-13" y="-7" width="26" height="14" rx="5" />
              <rect className={s.window} x="-8" y="-1.5" width="16" height="3" />
              <animateMotion
                dur={`${l.trainDur}s`}
                begin="1.6s"
                repeatCount="indefinite"
                rotate="auto"
                keyPoints={points}
                keyTimes="0;0.5;1"
                calcMode="linear"
              >
                <mpath href={`#route-${l.id}`} />
              </animateMotion>
            </g>
          ))}
        </g>
      ))}
      {LINES.flatMap((l, i) =>
        l.stations.map((st, k) => {
          if (seen.has(st.name)) return null;
          seen.add(st.name);
          const big = st.name === "H2Oeste";
          const tx = st.label === "right" ? st.x + (big ? 22 : 16) : st.x;
          const ty = st.label === "above" ? st.y - 18 : st.label === "below" ? st.y + 28 : st.y + 5;
          return (
            <g
              key={st.name}
              className={s.station}
              data-built={st.built}
              data-big={big}
              data-edge={st.x > 600}
              style={{ "--d": `${0.5 + i * 0.35 + k * 0.12}s` } as CSSProperties}
            >
              <circle cx={st.x} cy={st.y} r={big ? 13 : 8} />
              {big && <circle className={s.halo} cx={st.x} cy={st.y} r="18" />}
              <text x={tx} y={ty} textAnchor={st.label === "right" ? "start" : "middle"}>
                {st.name}
              </text>
            </g>
          );
        }),
      )}
    </svg>
  );
}

export default function LabMix() {
  const p = lab.project;
  return (
    <div className={`${s.root} ${display.variable} ${text.variable} ${mono.variable}`}>
      <SvgMotion />
      <a className={s.skip} href="#main">
        Skip to content
      </a>

      <header className={s.rail}>
        <nav aria-label="Main">
          <ol className={s.stations}>
            {[
              ["#main", "Home"],
              ["#work", "Work"],
              ["#about", "About"],
              ["#cv", "CV"],
            ].map(([href, label], i) => (
              <li key={href} style={{ "--i": i } as CSSProperties}>
                <a href={href} aria-current={i === 0 ? "page" : undefined}>
                  <span className={s.dot} aria-hidden="true" />
                  {label}
                </a>
                {i === 0 && (
                  <span className={s.here} aria-hidden="true">
                    You are here
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </header>

      <main id="main">
        <section className={s.hero} aria-labelledby="name">
          <div className={s.copy}>
            <h1 id="name" className={s.name}>
              <span>Noel</span> <span>Echeverría</span>
            </h1>
            <p className={s.headline}>{lab.headline}</p>
            <p className={s.place}>
              <span className={s.mono}>8°59′N 79°31′W</span> {lab.location}
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
          <div className={s.mapWrap}>
            <TransitSvg />
          </div>
        </section>

        <section className={s.legend} aria-label="Map legend">
          <ul className={s.lines}>
            {LINES.map((l) => (
              <li key={l.id} data-iso={l.id}>
                <span className={s.code} data-line={l.id}>
                  {l.code}
                </span>
                {l.name}
              </li>
            ))}
          </ul>
          <p className={s.key}>
            <span className={s.filled} aria-hidden="true" /> Built
            <span className={s.hollow} aria-hidden="true" /> In progress
          </p>
          <LabControls className={s.controls} buttonClassName={s.toggle} initialTheme="light" />
        </section>

        <div className={s.trunk}>
          <section id="work" className={s.stop} aria-labelledby="work-title">
            <h2 id="work-title" className={s.stopTitle}>
              Work
            </h2>
            <article className={s.plate}>
              <h3 className={s.plateTitle}>{p.title}</h3>
              <p className={s.plateSummary}>{p.summary}</p>
              <p>{p.what}</p>
              <p className={s.muted}>{p.context}</p>
              <p>{p.role}</p>
              <dl className={s.transfers}>
                {(
                  [
                    ["ml", "ML", p.stack.ml],
                    ["sys", "SY", p.stack.sys],
                    ["web", "WB", p.stack.web],
                  ] as const
                ).map(([id, code, items]) => (
                  <div key={id} data-line={id}>
                    <dt className={s.code} data-line={id}>
                      {code}
                    </dt>
                    <dd>{items.join(", ")}</dd>
                  </div>
                ))}
              </dl>
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
              <span className={s.mono}>2025-03 to 2028-12</span> <span className={s.muted}>(expected)</span>
            </p>
            <p className={`${s.body} ${s.muted}`}>The downloadable PDF arrives in Phase 3.</p>
          </section>
        </div>
      </main>

      <StationCursor className={s.cursor} plateClassName={s.cursorPlate} />
    </div>
  );
}
