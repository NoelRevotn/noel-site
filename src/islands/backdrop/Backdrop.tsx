"use client";

import { useRef } from "react";
import { useAmbientCanvas, type Engine, type Frame } from "../network-map/useAmbientCanvas";

/**
 * Page-wide ambient layer: faint octilinear schematic track with signal pulses in the three line
 * colours. Fades in once the hero (and its 3D map) scrolls away, so only one hero moment runs.
 * Drawn in the hairline colour, so it never competes with text contrast.
 */

type Pt = { x: number; y: number };
type Track = { pts: Pt[]; seg: number[]; total: number; color: string; pulses: number[]; speed: number };

const GRID = 56;
const DIRS: Pt[] = [
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
  { x: -1, y: 1 },
  { x: -1, y: 0 },
  { x: -1, y: -1 },
  { x: 0, y: -1 },
  { x: 1, y: -1 },
];
const COLORS = ["--line-ml", "--line-sys", "--line-web"];

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function buildTracks(w: number, h: number): Track[] {
  const rand = rng(20261121);
  const count = Math.max(5, Math.round((w * h) / 140000));
  const tracks: Track[] = [];
  for (let n = 0; n < count; n++) {
    let p = { x: Math.round((rand() * w) / GRID) * GRID, y: Math.round((rand() * h) / GRID) * GRID };
    let dir = Math.floor(rand() * 4) * 2; // start on an axis
    const pts = [p];
    for (let k = 0; k < 7; k++) {
      const len = (2 + Math.floor(rand() * 5)) * GRID;
      p = { x: p.x + DIRS[dir]!.x * len, y: p.y + DIRS[dir]!.y * len };
      pts.push(p);
      dir = (dir + (rand() < 0.5 ? 1 : 7)) % 8; // turn 45° left or right
    }
    const seg = [0];
    for (let i = 1; i < pts.length; i++) {
      seg.push(seg[i - 1]! + Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y));
    }
    tracks.push({
      pts,
      seg,
      total: seg[seg.length - 1]!,
      color: COLORS[n % 3]!,
      pulses: [rand(), rand() * 0.5 + 0.5],
      speed: 38 + rand() * 30,
    });
  }
  return tracks;
}

function at(t: Track, s: number): Pt {
  for (let i = 1; i < t.pts.length; i++) {
    if (s <= t.seg[i]! || i === t.pts.length - 1) {
      const a = t.pts[i - 1]!;
      const b = t.pts[i]!;
      const u = (s - t.seg[i - 1]!) / (t.seg[i]! - t.seg[i - 1]! || 1);
      return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
    }
  }
  return t.pts[0]!;
}

function createEngine(): Engine {
  let tracks: Track[] = [];
  return {
    resize(w, h) {
      tracks = buildTracks(w, h);
    },
    draw({ ctx, w, h, dt, vars, still }: Frame) {
      // Fade in after the hero: 0 at the top, full once ~70% of a viewport has scrolled.
      const fade = Math.min(1, Math.max(0, (window.scrollY - h * 0.25) / (h * 0.45)));
      ctx.clearRect(0, 0, w, h);
      if (fade <= 0) return;
      ctx.globalAlpha = fade;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = vars["--rule"] || "#c9d2dd";
      ctx.lineWidth = 2;
      for (const t of tracks) {
        ctx.beginPath();
        ctx.moveTo(t.pts[0]!.x, t.pts[0]!.y);
        for (let i = 1; i < t.pts.length; i++) ctx.lineTo(t.pts[i]!.x, t.pts[i]!.y);
        ctx.stroke();
      }
      if (still) return;
      // Signal pulses: short bright segments travelling along each track.
      ctx.lineWidth = 3;
      for (const t of tracks) {
        ctx.strokeStyle = vars[t.color] || "#0057b8";
        for (let k = 0; k < t.pulses.length; k++) {
          t.pulses[k] = (t.pulses[k]! + (t.speed * dt) / t.total) % 1;
          const head = t.pulses[k]! * t.total;
          ctx.beginPath();
          for (let s = Math.max(0, head - 70), first = true; s <= head; s += 6, first = false) {
            const p = at(t, s);
            if (first) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.globalAlpha = fade * 0.55;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    },
  };
}

const VARS = ["--rule", "--line-ml", "--line-sys", "--line-web"] as const;

export function Backdrop({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useAmbientCanvas(ref, createEngine, VARS);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
