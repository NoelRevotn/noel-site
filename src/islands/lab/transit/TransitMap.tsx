"use client";

import { useRef } from "react";
import { useAmbientCanvas, type Engine, type Frame } from "../useAmbientCanvas";

type Pt = { x: number; y: number };
type Side = "above" | "below" | "right";
type Station = { name: string; at: Pt; built: boolean; side: Side };
type LineDef = { id: "ml" | "sys" | "web"; label: string; color: string; path: Pt[]; stations: Station[] };

// Normalised to the map area. All three lines meet at H2Oeste: its agents (ML), FastAPI backend
// (systems) and React dashboard (web) are each a domain of the same project (CV, 2026).
const H2O: Pt = { x: 0.56, y: 0.47 };
const LINES: LineDef[] = [
  {
    id: "ml",
    label: "ML / AI line",
    color: "--line-ml",
    path: [{ x: 0.02, y: 0.16 }, { x: 0.3, y: 0.16 }, H2O, { x: 0.82, y: 0.73 }, { x: 1.2, y: 0.73 }],
    stations: [
      { name: "Gemini API", at: { x: 0.12, y: 0.16 }, built: true, side: "below" },
      { name: "AgenteQuery", at: { x: 0.3, y: 0.16 }, built: true, side: "above" },
      { name: "H2Oeste", at: H2O, built: true, side: "right" },
      { name: "Samsung AI program", at: { x: 0.92, y: 0.73 }, built: false, side: "below" },
    ],
  },
  {
    id: "sys",
    label: "Systems line",
    color: "--line-sys",
    path: [
      { x: -0.2, y: 0.62 },
      { x: 0.2, y: 0.62 },
      { x: 0.35, y: 0.47 },
      H2O,
      { x: 0.78, y: 0.25 },
      { x: 1.2, y: 0.25 },
    ],
    stations: [
      { name: "Linux / WSL", at: { x: 0.08, y: 0.62 }, built: true, side: "below" },
      { name: "H2Oeste", at: H2O, built: true, side: "right" },
      { name: "FastAPI", at: { x: 0.9, y: 0.25 }, built: true, side: "above" },
    ],
  },
  {
    id: "web",
    label: "Web line",
    color: "--line-web",
    path: [
      { x: 0.18, y: 1.2 },
      { x: 0.18, y: 0.88 },
      { x: 0.47, y: 0.88 },
      { x: 0.56, y: 0.79 },
      H2O,
      { x: 0.56, y: -0.2 },
    ],
    stations: [
      { name: "ITINERA", at: { x: 0.32, y: 0.88 }, built: true, side: "below" },
      { name: "H2Oeste", at: H2O, built: true, side: "right" },
      { name: "React", at: { x: 0.56, y: 0.06 }, built: true, side: "right" },
    ],
  },
];

type Laid = { def: LineDef; pts: Pt[]; seg: number[]; total: number; stopAt: number[]; trains: Train[] };
type Train = { s: number; dir: 1 | -1; dwell: number; lastStop: number };

const DWELL = 1.4;
const SPEED = 70;

function layout(w: number, h: number) {
  const narrow = w < 720;
  // Desktop: the map owns the right ~58% beside the copy. Narrow: the whole block.
  const x0 = narrow ? 0 : w * 0.42;
  const mw = w - x0;
  const pad = 24;
  const map = (p: Pt): Pt => ({ x: x0 + pad + p.x * (mw - pad * 2), y: pad + p.y * (h - pad * 2) });
  return LINES.map<Laid>((def) => {
    const pts = def.path.map(map);
    const seg: number[] = [0];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1]!;
      const b = pts[i]!;
      seg.push(seg[i - 1]! + Math.hypot(b.x - a.x, b.y - a.y));
    }
    const total = seg[seg.length - 1]!;
    const stopAt = def.stations.map((st) => project(pts, seg, map(st.at)));
    const trains: Train[] = [
      { s: total * 0.15, dir: 1, dwell: 0, lastStop: -1 },
      { s: total * 0.7, dir: -1, dwell: 0, lastStop: -1 },
    ];
    return { def, pts, seg, total, stopAt, trains };
  });
}

/** Arc-length position of the point on the polyline closest to p. */
function project(pts: Pt[], seg: number[], p: Pt): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy || 1;
    const u = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
    const d = Math.hypot(a.x + u * dx - p.x, a.y + u * dy - p.y);
    if (d < bestD) {
      bestD = d;
      best = seg[i - 1]! + u * Math.sqrt(len2);
    }
  }
  return best;
}

function pointAt(l: Laid, s: number): { p: Pt; angle: number } {
  for (let i = 1; i < l.pts.length; i++) {
    if (s <= l.seg[i]! || i === l.pts.length - 1) {
      const a = l.pts[i - 1]!;
      const b = l.pts[i]!;
      const len = l.seg[i]! - l.seg[i - 1]! || 1;
      const u = (s - l.seg[i - 1]!) / len;
      return {
        p: { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u },
        angle: Math.atan2(b.y - a.y, b.x - a.x),
      };
    }
  }
  return { p: l.pts[0]!, angle: 0 };
}

function distanceTo(l: Laid, p: Pt): number {
  const s = project(l.pts, l.seg, p);
  const { p: q } = pointAt(l, s);
  return Math.hypot(q.x - p.x, q.y - p.y);
}

function roundedPath(ctx: CanvasRenderingContext2D, pts: Pt[], r: number) {
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length - 1; i++) ctx.arcTo(pts[i]!.x, pts[i]!.y, pts[i + 1]!.x, pts[i + 1]!.y, r);
  ctx.lineTo(pts[pts.length - 1]!.x, pts[pts.length - 1]!.y);
}

function createEngine(): Engine {
  let lines: Laid[] = [];
  let focus: number | null = null;
  let focusMix = 0;

  return {
    resize(w, h) {
      lines = layout(w, h);
    },
    draw({ ctx, w, h, dt, pointer, vars, still }: Frame) {
      ctx.clearRect(0, 0, w, h);
      const ground = vars["--ground"] || "#fff";
      const ink = vars["--ink"] || "#000";
      const font = vars["--font-text"] || "sans-serif";

      // Pointer isolates the nearest line within 44px.
      let near: number | null = null;
      if (pointer.active) {
        let best = 44;
        lines.forEach((l, i) => {
          const d = distanceTo(l, pointer);
          if (d < best) {
            best = d;
            near = i;
          }
        });
      }
      if (near !== null) focus = near;
      focusMix += ((near !== null ? 1 : 0) - focusMix) * Math.min(1, dt * 8 || 1);
      if (still) focusMix = near !== null ? 1 : 0;

      const lw = w < 720 ? 6 : 9;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      lines.forEach((l, i) => {
        const dim = focus !== null && i !== focus ? 1 - 0.75 * focusMix : 1;
        ctx.globalAlpha = dim;
        // Ground casing keeps crossings readable.
        roundedPath(ctx, l.pts, 28);
        ctx.strokeStyle = ground;
        ctx.lineWidth = lw + 6;
        ctx.stroke();
        roundedPath(ctx, l.pts, 28);
        ctx.strokeStyle = vars[l.def.color] || ink;
        ctx.lineWidth = lw;
        ctx.stroke();
      });

      // Trains: advance, dwell at each stop, reverse at the ends.
      lines.forEach((l, i) => {
        const color = vars[l.def.color] || ink;
        ctx.globalAlpha = focus !== null && i !== focus ? 1 - 0.75 * focusMix : 1;
        for (const tr of l.trains) {
          if (!still) {
            if (tr.dwell > 0) tr.dwell -= dt;
            else {
              tr.s += tr.dir * SPEED * dt;
              if (tr.s > l.total - 10 || tr.s < 10) {
                tr.dir = tr.s > l.total / 2 ? -1 : 1;
                tr.lastStop = -1;
              }
              l.stopAt.forEach((at, k) => {
                if (k !== tr.lastStop && Math.abs(tr.s - at) < SPEED * dt + 0.5) {
                  tr.s = at;
                  tr.dwell = DWELL;
                  tr.lastStop = k;
                }
              });
            }
          }
          const { p, angle } = pointAt(l, tr.s);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(angle);
          ctx.fillStyle = ground;
          ctx.beginPath();
          ctx.roundRect(-14, -(lw / 2 + 4), 28, lw + 8, 6);
          ctx.fill();
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.roundRect(-11, -(lw / 2 + 1.5), 22, lw + 3, 4);
          ctx.fill();
          ctx.restore();
        }
      });

      // Stations: built = filled ink, in progress = hollow ring. Interchange drawn once.
      const drawn = new Set<string>();
      ctx.font = `600 13px ${font}`;
      ctx.textBaseline = "middle";
      lines.forEach((l, i) => {
        ctx.globalAlpha = focus !== null && i !== focus ? 1 - 0.75 * focusMix : 1;
        l.def.stations.forEach((st, k) => {
          const { p } = pointAt(l, l.stopAt[k]!);
          if (drawn.has(st.name)) return;
          drawn.add(st.name);
          const interchange = st.name === "H2Oeste";
          const r = interchange ? 13 : 7;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = st.built ? ink : ground;
          ctx.fill();
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = interchange ? ground : ink;
          ctx.stroke();
          if (interchange) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, r + 3.5, 0, Math.PI * 2);
            ctx.strokeStyle = ink;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          const label = st.name;
          const tw = ctx.measureText(label).width;
          // Labels sit beside the line, never across it.
          let x = p.x - tw / 2;
          let y = p.y;
          if (st.side === "above") y = p.y - r - 14;
          else if (st.side === "below") y = p.y + r + 14;
          else {
            x = p.x + r + 10;
            y = p.y - (interchange ? r + 8 : 0);
          }
          x = Math.max(8, Math.min(x, w - tw - 8));
          // A ground-coloured halo keeps the label legible where it passes another line.
          ctx.lineWidth = 5;
          ctx.strokeStyle = ground;
          ctx.strokeText(label, x, y);
          ctx.fillStyle = ink;
          ctx.fillText(label, x, y);
        });
      });

      // Name the isolated line next to the pointer.
      if (focus !== null && focusMix > 0.05) {
        const l = lines[focus]!;
        ctx.globalAlpha = focusMix;
        ctx.font = `700 14px ${font}`;
        const text = l.def.label;
        const tw = ctx.measureText(text).width;
        const x = Math.min(pointer.x + 18, w - tw - 24);
        const y = Math.max(pointer.y - 26, 16);
        ctx.fillStyle = vars[l.def.color] || ink;
        ctx.beginPath();
        ctx.roundRect(x - 10, y - 13, tw + 20, 26, 13);
        ctx.fill();
        ctx.fillStyle = vars["--on-line"] || "#fff";
        ctx.fillText(text, x, y);
      }
      ctx.globalAlpha = 1;
    },
  };
}

const VARS = [
  "--ground",
  "--ink",
  "--line-ml",
  "--line-sys",
  "--line-web",
  "--on-line",
  "--font-text",
] as const;

/** Lab A ambient map. Decorative; the same facts are in the page's text and legend. */
export function TransitMap({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useAmbientCanvas(ref, createEngine, VARS);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
