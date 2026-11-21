"use client";

import { useRef } from "react";
import { useAmbientCanvas, type Engine, type Frame } from "../useAmbientCanvas";

/**
 * Lab B ambient chart: a synthetic loss surface drawn as a survey chart. Depth bands, contours,
 * soundings and probes all come from one field, so the picture is computed, not painted.
 * Depth = 4 + (1.2 - loss) × 30 metres: low loss is deep water.
 */

type Well = {
  ax: number;
  ay: number;
  fx: number;
  fy: number;
  phase: number;
  depth: number;
  sx: number;
  sy: number;
  rot: number;
};
// Anisotropic, rotated wells: a real loss surface has valleys, not target rings.
const WELLS: Well[] = [
  { ax: 0.72, ay: 0.38, fx: 0.031, fy: 0.023, phase: 0, depth: 1, sx: 0.16, sy: 0.08, rot: 0.5 },
  { ax: 0.58, ay: 0.74, fx: 0.019, fy: 0.029, phase: 2.1, depth: 0.8, sx: 0.07, sy: 0.12, rot: -0.3 },
  { ax: 0.9, ay: 0.68, fx: 0.027, fy: 0.017, phase: 4.2, depth: 0.7, sx: 0.12, sy: 0.06, rot: 1.1 },
  { ax: 0.42, ay: 0.2, fx: 0.022, fy: 0.033, phase: 1.3, depth: 0.55, sx: 0.14, sy: 0.07, rot: -0.8 },
  { ax: 0.16, ay: 0.46, fx: 0.025, fy: 0.021, phase: 3.3, depth: 0.45, sx: 0.1, sy: 0.16, rot: 0.2 },
];

const toDepth = (loss: number) => Math.max(0.5, 4 + (1.2 - loss) * 30);

/** Depth in metres (synthetic) at a point in the chart; read by the cursor's readout. */
export let depthAt: ((x: number, y: number) => number) | null = null;

type Probe = {
  x: number;
  y: number;
  trail: Float32Array;
  head: number;
  len: number;
  life: number;
  sample: number;
  settled: number;
};
const TRAIL = 40;
const SAMPLE = 0.12; // seconds between track points: ~5 s of visible course

function createEngine(): Engine {
  let w = 0;
  let h = 0;
  let time = 0;
  let px = -1;
  let py = -1;
  let shoal = 0;
  const cell = 10;
  const sub = 3; // band image resolution: 3 samples per grid cell
  let gw = 0;
  let gh = 0;
  let grid = new Float32Array(0);
  let band: HTMLCanvasElement | null = null;
  let bandCtx: CanvasRenderingContext2D | null = null;
  let img: ImageData | null = null;
  let soundings: { x: number; y: number }[] = [];
  const probes: Probe[] = [];

  // Loss in roughly [0, 1.2]: 0 is the deepest water.
  const field = (x: number, y: number) => {
    const u = x / Math.max(w, 1);
    const v = y / Math.max(h, 1);
    const aspect = w / Math.max(h, 1);
    let f = 0.75 + 0.25 * v;
    // Low-frequency relief so the open water isn't flat.
    f +=
      0.06 * Math.sin(u * 7.3 + time * 0.05) * Math.cos(v * 5.1 - time * 0.04) +
      0.04 * Math.sin((u + v) * 11);
    for (const wl of WELLS) {
      const cx = wl.ax + 0.05 * Math.sin(time * wl.fx * 6.28 + wl.phase);
      const cy = wl.ay + 0.04 * Math.cos(time * wl.fy * 6.28 + wl.phase);
      const dx = (u - cx) * aspect;
      const dy = v - cy;
      const c = Math.cos(wl.rot);
      const s = Math.sin(wl.rot);
      const rx = (dx * c + dy * s) / wl.sx;
      const ry = (-dx * s + dy * c) / wl.sy;
      f -= wl.depth * Math.exp(-(rx * rx + ry * ry) / 2);
    }
    if (shoal > 0.01) {
      const dx = x - px;
      const dy = y - py;
      f += 0.9 * shoal * Math.exp(-(dx * dx + dy * dy) / (2 * 70 * 70));
    }
    return f;
  };

  const spawn = (p?: Probe): Probe => {
    const probe = p ?? {
      x: 0,
      y: 0,
      trail: new Float32Array(TRAIL * 2),
      head: 0,
      len: 0,
      life: 0,
      sample: 0,
      settled: 0,
    };
    probe.x = w * (0.4 + Math.random() * 0.58);
    probe.y = h * (0.05 + Math.random() * 0.9);
    probe.len = 0;
    probe.head = 0;
    probe.life = 9 + Math.random() * 6;
    probe.sample = 0;
    probe.settled = 0;
    return probe;
  };

  // Seeded jitter so soundings sit on irregular survey lines and stay put between frames.
  const rand = (n: number) => {
    const s = Math.sin(n * 127.1) * 43758.5453;
    return s - Math.floor(s);
  };

  depthAt = (x, y) => toDepth(field(x, y));

  return {
    resize(nw, nh) {
      w = nw;
      h = nh;
      gw = Math.ceil(w / cell) + 1;
      gh = Math.ceil(h / cell) + 1;
      grid = new Float32Array(gw * gh);
      band = document.createElement("canvas");
      band.width = (gw - 1) * sub;
      band.height = (gh - 1) * sub;
      bandCtx = band.getContext("2d");
      img = bandCtx?.createImageData(band.width, band.height) ?? null;
      // Survey lines: slanted tracks with uneven spacing, as a launch would run them.
      soundings = [];
      const lineGap = w < 720 ? 90 : 120;
      for (let k = 0, line = -h; line < w + h; line += lineGap * (0.8 + rand(k) * 0.4), k++) {
        for (let t = 0; t < h; t += 70 + rand(k * 7 + t) * 60) {
          const x = line + t * 0.35 + (rand(k + t) - 0.5) * 18;
          const y = t + (rand(t - k) - 0.5) * 14;
          if (x < 8 || x > w - 8 || y < 70 || y > h - 12) continue;
          if (x < w * 0.46 && y > h * 0.42) continue; // keep the cartouche area quiet
          soundings.push({ x, y });
        }
      }
      probes.length = 0;
      const count = w < 720 ? 6 : 12;
      for (let i = 0; i < count; i++) probes.push(spawn());
    },
    draw({ ctx, dt, pointer, vars, still }: Frame) {
      time += dt;
      if (pointer.active) {
        px = pointer.x;
        py = pointer.y;
      }
      shoal += ((pointer.active ? 1 : 0) - shoal) * Math.min(1, dt * 3 || (pointer.active ? 1 : 0));

      for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) grid[j * gw + i] = field(i * cell, j * cell);

      // Depth bands at 3× grid resolution by bilinear interpolation, drawn without smoothing:
      // crisp quantised edges like a printed chart, at no extra field evaluations.
      const shallow = hex(vars["--shoal"] || "#cfe4f1");
      const mid = hex(vars["--mid"] || "#e4f0f7");
      const deep = hex(vars["--ground"] || "#f8fafb");
      if (img && bandCtx && band) {
        const d = img.data;
        const bw = band.width;
        const bh = band.height;
        for (let y = 0; y < bh; y++) {
          const gy = y / sub;
          const j = Math.floor(gy);
          const fy = gy - j;
          for (let x = 0; x < bw; x++) {
            const gx = x / sub;
            const i = Math.floor(gx);
            const fx = gx - i;
            const a = grid[j * gw + i]!;
            const b = grid[j * gw + i + 1]!;
            const c = grid[(j + 1) * gw + i]!;
            const e = grid[(j + 1) * gw + i + 1]!;
            const f = (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + e * fx) * fy;
            const col = f > 0.62 ? shallow : f > 0.38 ? mid : deep;
            const k = (y * bw + x) * 4;
            d[k] = col[0];
            d[k + 1] = col[1];
            d[k + 2] = col[2];
            d[k + 3] = 255;
          }
        }
        bandCtx.putImageData(img, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(band, 0, 0, bw * (cell / sub), bh * (cell / sub));
      }

      // Contours by marching squares; the band edges (0.38, 0.62) are among the levels.
      ctx.strokeStyle = vars["--contour"] || "#7fa7c2";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const level of [0.14, 0.26, 0.38, 0.5, 0.62, 0.74, 0.86, 0.98, 1.1]) {
        for (let j = 0; j < gh - 1; j++) {
          for (let i = 0; i < gw - 1; i++) {
            const a = grid[j * gw + i]!;
            const b = grid[j * gw + i + 1]!;
            const c = grid[(j + 1) * gw + i + 1]!;
            const e = grid[(j + 1) * gw + i]!;
            const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (e > level ? 1 : 0);
            if (idx === 0 || idx === 15) continue;
            const x = i * cell;
            const y = j * cell;
            const top = x + cell * ((level - a) / (b - a));
            const right = y + cell * ((level - b) / (c - b));
            const bottom = x + cell * ((level - e) / (c - e));
            const left = y + cell * ((level - a) / (e - a));
            switch (idx) {
              case 1:
              case 14:
                ctx.moveTo(x, left);
                ctx.lineTo(bottom, y + cell);
                break;
              case 2:
              case 13:
                ctx.moveTo(bottom, y + cell);
                ctx.lineTo(x + cell, right);
                break;
              case 3:
              case 12:
                ctx.moveTo(x, left);
                ctx.lineTo(x + cell, right);
                break;
              case 4:
              case 11:
                ctx.moveTo(top, y);
                ctx.lineTo(x + cell, right);
                break;
              case 6:
              case 9:
                ctx.moveTo(top, y);
                ctx.lineTo(bottom, y + cell);
                break;
              case 7:
              case 8:
                ctx.moveTo(x, left);
                ctx.lineTo(top, y);
                break;
              case 5:
                ctx.moveTo(x, left);
                ctx.lineTo(top, y);
                ctx.moveTo(bottom, y + cell);
                ctx.lineTo(x + cell, right);
                break;
              case 10:
                ctx.moveTo(x, left);
                ctx.lineTo(bottom, y + cell);
                ctx.moveTo(top, y);
                ctx.lineTo(x + cell, right);
                break;
            }
          }
        }
      }
      ctx.stroke();

      // Soundings along the survey lines; deeper water prints bigger numbers.
      ctx.fillStyle = vars["--muted"] || "#4b5d6b";
      ctx.font = `400 10px ${vars["--font-mono"] || "monospace"}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const s of soundings) ctx.fillText(toDepth(field(s.x, s.y)).toFixed(0), s.x, s.y);

      // Probes: gradient descent with a floor speed so the course is legible; magenta tracks.
      const magenta = vars["--magenta"] || "#b0126b";
      ctx.strokeStyle = magenta;
      ctx.fillStyle = magenta;
      for (const p of probes) {
        if (!still) {
          const e = 2;
          const gx = (field(p.x + e, p.y) - field(p.x - e, p.y)) / (2 * e);
          const gy = (field(p.x, p.y + e) - field(p.x, p.y - e)) / (2 * e);
          const g = Math.hypot(gx, gy);
          if (g < 0.0004) p.settled += dt;
          else {
            const speed = Math.min(80, Math.max(22, 12000 * g)) * dt;
            p.x -= (gx / g) * speed;
            p.y -= (gy / g) * speed;
          }
          p.life -= dt;
          p.sample -= dt;
          if (p.sample <= 0) {
            p.sample = SAMPLE;
            p.trail[p.head * 2] = p.x;
            p.trail[p.head * 2 + 1] = p.y;
            p.head = (p.head + 1) % TRAIL;
            p.len = Math.min(TRAIL, p.len + 1);
          }
          if (p.life <= 0 || p.settled > 3 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) spawn(p);
        }
        // Course line: dashed, like a plotted track.
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        for (let k = 0; k < p.len; k++) {
          const idx = (p.head - p.len + k + TRAIL) % TRAIL;
          const x = p.trail[idx * 2]!;
          const y = p.trail[idx * 2 + 1]!;
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        // Settled in a minimum: draw a fix (circle around the position).
        if (p.settled > 0.3) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    },
  };
}

const cache = new Map<string, [number, number, number]>();
function hex(value: string): [number, number, number] {
  const hit = cache.get(value);
  if (hit) return hit;
  const m = /^#?([0-9a-f]{6})$/i.exec(value);
  const n = m?.[1] ? parseInt(m[1], 16) : 0xffffff;
  const rgb: [number, number, number] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  cache.set(value, rgb);
  return rgb;
}

const VARS = ["--ground", "--shoal", "--mid", "--contour", "--muted", "--magenta", "--font-mono"] as const;

export function ChartField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useAmbientCanvas(ref, createEngine, VARS);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
