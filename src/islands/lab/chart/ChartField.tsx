"use client";

import { useRef } from "react";
import { useAmbientCanvas, type Engine, type Frame } from "../useAmbientCanvas";

/**
 * Lab B ambient chart: a synthetic loss surface drawn as a survey chart. Depth bands and
 * contours come from the same field the probes descend, so the picture is computed, not painted.
 */

type Well = { ax: number; ay: number; fx: number; fy: number; phase: number; depth: number; spread: number };
const WELLS: Well[] = [
  { ax: 0.72, ay: 0.38, fx: 0.031, fy: 0.023, phase: 0, depth: 1, spread: 0.11 },
  { ax: 0.58, ay: 0.72, fx: 0.019, fy: 0.029, phase: 2.1, depth: 0.8, spread: 0.09 },
  { ax: 0.88, ay: 0.7, fx: 0.027, fy: 0.017, phase: 4.2, depth: 0.7, spread: 0.08 },
  { ax: 0.4, ay: 0.22, fx: 0.022, fy: 0.033, phase: 1.3, depth: 0.55, spread: 0.1 },
  { ax: 0.18, ay: 0.5, fx: 0.025, fy: 0.021, phase: 3.3, depth: 0.45, spread: 0.12 },
];

/** Depth in metres (synthetic) at a viewport point; read by the cursor's readout. */
export let depthAt: ((x: number, y: number) => number) | null = null;

type Probe = { x: number; y: number; trail: Float32Array; head: number; len: number; life: number };
const TRAIL = 48;

function createEngine(): Engine {
  let w = 0;
  let h = 0;
  let time = 0;
  let px = -1;
  let py = -1;
  let shoal = 0;
  const cell = 10;
  let gw = 0;
  let gh = 0;
  let grid = new Float32Array(0);
  let band: HTMLCanvasElement | null = null;
  let bandCtx: CanvasRenderingContext2D | null = null;
  let img: ImageData | null = null;
  const probes: Probe[] = [];

  // Field value in [0, ~1.2]: 0 is deep water (low loss), higher is shoal (high loss).
  const field = (x: number, y: number) => {
    const u = x / Math.max(w, 1);
    const v = y / Math.max(h, 1);
    let f = 0.75 + 0.25 * v;
    for (const wl of WELLS) {
      const cx = wl.ax + 0.06 * Math.sin(time * wl.fx * 6.28 + wl.phase);
      const cy = wl.ay + 0.05 * Math.cos(time * wl.fy * 6.28 + wl.phase);
      const dx = (u - cx) * (w / h);
      const dy = v - cy;
      f -= wl.depth * Math.exp(-(dx * dx + dy * dy) / (2 * wl.spread * wl.spread));
    }
    if (shoal > 0.01) {
      const dx = x - px;
      const dy = y - py;
      f += 0.9 * shoal * Math.exp(-(dx * dx + dy * dy) / (2 * 70 * 70));
    }
    return f;
  };

  const spawn = (p?: Probe): Probe => {
    const probe = p ?? { x: 0, y: 0, trail: new Float32Array(TRAIL * 2), head: 0, len: 0, life: 0 };
    probe.x = w * (0.35 + Math.random() * 0.63);
    probe.y = h * (0.05 + Math.random() * 0.9);
    probe.len = 0;
    probe.head = 0;
    probe.life = 6 + Math.random() * 6;
    return probe;
  };

  depthAt = (x, y) => Math.max(0.5, 4 + field(x, y) * 38);

  return {
    resize(nw, nh) {
      w = nw;
      h = nh;
      gw = Math.ceil(w / cell) + 1;
      gh = Math.ceil(h / cell) + 1;
      grid = new Float32Array(gw * gh);
      band = document.createElement("canvas");
      band.width = gw;
      band.height = gh;
      bandCtx = band.getContext("2d");
      img = bandCtx?.createImageData(gw, gh) ?? null;
      probes.length = 0;
      const count = w < 720 ? 6 : 14;
      for (let i = 0; i < count; i++) probes.push(spawn());
    },
    draw({ ctx, dt, pointer, vars, still }: Frame) {
      time += dt;
      // The pointer raises a shoal: probes route around it.
      if (pointer.active) {
        px = pointer.x;
        py = pointer.y;
      }
      shoal += ((pointer.active ? 1 : 0) - shoal) * Math.min(1, dt * 3 || (pointer.active ? 1 : 0));

      for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) grid[j * gw + i] = field(i * cell, j * cell);

      // Depth bands, quantised like a chart, rendered at grid resolution and smoothed up.
      const shallow = hex(vars["--shoal"] || "#cfe4f1");
      const mid = hex(vars["--mid"] || "#e4f0f7");
      const deep = hex(vars["--ground"] || "#f8fafb");
      if (img && bandCtx && band) {
        const d = img.data;
        for (let k = 0; k < gw * gh; k++) {
          const f = grid[k]!;
          const c = f > 0.62 ? shallow : f > 0.42 ? mid : deep;
          d[k * 4] = c[0];
          d[k * 4 + 1] = c[1];
          d[k * 4 + 2] = c[2];
          d[k * 4 + 3] = 255;
        }
        bandCtx.putImageData(img, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(band, 0, 0, gw * cell, gh * cell);
      }

      // Contours by marching squares.
      ctx.strokeStyle = vars["--contour"] || "#7fa7c2";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let level = 0.12; level < 1.2; level += 0.1) {
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
            const seg = (x1: number, y1: number, x2: number, y2: number) => {
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
            };
            switch (idx) {
              case 1:
              case 14:
                seg(x, left, bottom, y + cell);
                break;
              case 2:
              case 13:
                seg(bottom, y + cell, x + cell, right);
                break;
              case 3:
              case 12:
                seg(x, left, x + cell, right);
                break;
              case 4:
              case 11:
                seg(top, y, x + cell, right);
                break;
              case 6:
              case 9:
                seg(top, y, bottom, y + cell);
                break;
              case 7:
              case 8:
                seg(x, left, top, y);
                break;
              case 5:
                seg(x, left, top, y);
                seg(bottom, y + cell, x + cell, right);
                break;
              case 10:
                seg(x, left, bottom, y + cell);
                seg(top, y, x + cell, right);
                break;
            }
          }
        }
      }
      ctx.stroke();

      // Soundings: depth figures at fixed survey points, as charts print them.
      ctx.fillStyle = vars["--sounding"] || "#4b5d6b";
      ctx.font = `400 10px ${vars["--font-mono"] || "monospace"}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const step = w < 720 ? 96 : 132;
      for (let y = step * 0.6; y < h; y += step) {
        for (let x = step * 0.5 + ((y / step) % 2) * step * 0.5; x < w; x += step) {
          if (x < w * 0.42 && y > h * 0.45) continue; // keep the cartouche area quiet
          ctx.fillText(Math.max(1, 4 + field(x, y) * 38).toFixed(0), x, y);
        }
      }

      // Probes: gradient descent with a little momentum; magenta tracks.
      const magenta = vars["--magenta"] || "#b0126b";
      ctx.strokeStyle = magenta;
      ctx.fillStyle = magenta;
      for (const p of probes) {
        if (!still) {
          const e = 2;
          const gx = (field(p.x + e, p.y) - field(p.x - e, p.y)) / (2 * e);
          const gy = (field(p.x, p.y + e) - field(p.x, p.y - e)) / (2 * e);
          const g = Math.hypot(gx, gy) || 1;
          const speed = Math.min(90, 9000 * g) * dt;
          p.x -= (gx / g) * speed;
          p.y -= (gy / g) * speed;
          p.life -= dt;
          p.trail[p.head * 2] = p.x;
          p.trail[p.head * 2 + 1] = p.y;
          p.head = (p.head + 1) % TRAIL;
          p.len = Math.min(TRAIL, p.len + 1);
          if (p.life <= 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) spawn(p);
        }
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let k = 0; k < p.len; k++) {
          const idx = (p.head - p.len + k + TRAIL) % TRAIL;
          const x = p.trail[idx * 2]!;
          const y = p.trail[idx * 2 + 1]!;
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
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

const VARS = ["--ground", "--shoal", "--mid", "--contour", "--sounding", "--magenta", "--font-mono"] as const;

export function ChartField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useAmbientCanvas(ref, createEngine, VARS);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
