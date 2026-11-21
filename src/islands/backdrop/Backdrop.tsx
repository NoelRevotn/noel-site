"use client";

import { useRef } from "react";
import { useAmbientCanvas, type Engine, type Frame } from "../network-map/useAmbientCanvas";

/**
 * Page-wide ambient layer: a "sleeper field" of short track ties whose angle follows a slowly
 * drifting flow, snapped to the eight octilinear directions and eased between them. Near the
 * pointer the ties swirl around it and spring outward; signals in the three line colours ride the
 * flow with short trails. Faint in the hero, full strength once it scrolls away. Hairline colour,
 * so text contrast is never affected.
 */

const GAP = 30;
const TIE = 10;
const REACH = 170;
const OCTANT = Math.PI / 4;
const COLORS = ["--line-ml", "--line-sys", "--line-web"] as const;

type Tie = { x: number; y: number; a: number; ox: number; oy: number; vx: number; vy: number };
type Signal = {
  x: number;
  y: number;
  life: number;
  color: number;
  trail: Float32Array;
  head: number;
  len: number;
};
const TRAIL = 14;

function flow(x: number, y: number, t: number) {
  return (
    Math.sin(x * 0.0042 + t * 0.12) * Math.cos(y * 0.0051 - t * 0.09) * Math.PI +
    Math.sin((x + y) * 0.0021 + t * 0.05) * Math.PI
  );
}

/** Shortest signed angular difference. */
function delta(from: number, to: number) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function createEngine(): Engine {
  let ties: Tie[] = [];
  let signals: Signal[] = [];
  let time = 0;
  let w = 0;
  let h = 0;

  const spawn = (s?: Signal): Signal => {
    const sig = s ?? { x: 0, y: 0, life: 0, color: 0, trail: new Float32Array(TRAIL * 2), head: 0, len: 0 };
    sig.x = Math.random() * w;
    sig.y = Math.random() * h;
    sig.life = 4 + Math.random() * 5;
    sig.color = Math.floor(Math.random() * 3);
    sig.len = 0;
    sig.head = 0;
    return sig;
  };

  return {
    resize(nw, nh) {
      w = nw;
      h = nh;
      ties = [];
      for (let y = GAP / 2; y < h + GAP; y += GAP) {
        for (let x = GAP / 2; x < w + GAP; x += GAP) {
          ties.push({ x, y, a: Math.round(flow(x, y, 0) / OCTANT) * OCTANT, ox: 0, oy: 0, vx: 0, vy: 0 });
        }
      }
      signals = Array.from({ length: Math.max(8, Math.round((w * h) / 45000)) }, () => spawn());
    },
    draw({ ctx, dt, pointer, vars, still }: Frame) {
      time += dt;
      // Faint behind the hero, full strength once ~60% of a viewport has scrolled.
      const scroll = Math.min(1, Math.max(0, window.scrollY / (h * 0.6)));
      const fade = 0.35 + 0.65 * scroll;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";

      const rule = vars["--rule"] || "#c9d2dd";
      const ink = vars["--ink"] || "#0f1e33";
      const near: Tie[] = [];

      // Ties: target angle from the flow (snapped to an octant), swirled near the pointer.
      ctx.beginPath();
      for (const tie of ties) {
        let target = Math.round(flow(tie.x, tie.y, time) / OCTANT) * OCTANT;
        let pushX = 0;
        let pushY = 0;
        if (pointer.active) {
          const dx = tie.x - pointer.x;
          const dy = tie.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < REACH) {
            const k = (1 - dist / REACH) ** 2;
            const tangent = Math.atan2(dy, dx) + Math.PI / 2;
            target = target + delta(target, tangent) * k;
            pushX = (dx / (dist || 1)) * 9 * k;
            pushY = (dy / (dist || 1)) * 9 * k;
            near.push(tie);
          }
        }
        if (still) {
          tie.a = target;
        } else {
          tie.a += delta(tie.a, target) * Math.min(1, dt * 5);
          // Spring the offset toward the push (stiff, well damped).
          tie.vx += (180 * (pushX - tie.ox) - 18 * tie.vx) * dt;
          tie.vy += (180 * (pushY - tie.oy) - 18 * tie.vy) * dt;
          tie.ox += tie.vx * dt;
          tie.oy += tie.vy * dt;
        }
        const cx = tie.x + tie.ox;
        const cy = tie.y + tie.oy;
        const ux = Math.cos(tie.a) * (TIE / 2);
        const uy = Math.sin(tie.a) * (TIE / 2);
        ctx.moveTo(cx - ux, cy - uy);
        ctx.lineTo(cx + ux, cy + uy);
      }
      ctx.globalAlpha = fade;
      ctx.strokeStyle = rule;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Ties near the pointer darken toward ink.
      if (near.length) {
        ctx.beginPath();
        for (const tie of near) {
          const ux = Math.cos(tie.a) * (TIE / 2);
          const uy = Math.sin(tie.a) * (TIE / 2);
          ctx.moveTo(tie.x + tie.ox - ux, tie.y + tie.oy - uy);
          ctx.lineTo(tie.x + tie.ox + ux, tie.y + tie.oy + uy);
        }
        ctx.globalAlpha = fade * 0.45;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.75;
        ctx.stroke();
      }

      if (still) {
        ctx.globalAlpha = 1;
        return;
      }

      // Signals ride the (snapped) flow and leave a short fading trail.
      for (const s of signals) {
        const a = Math.round(flow(s.x, s.y, time) / OCTANT) * OCTANT;
        s.x += Math.cos(a) * 46 * dt;
        s.y += Math.sin(a) * 46 * dt;
        s.life -= dt;
        s.trail[s.head * 2] = s.x;
        s.trail[s.head * 2 + 1] = s.y;
        s.head = (s.head + 1) % TRAIL;
        s.len = Math.min(TRAIL, s.len + 1);
        if (s.life <= 0 || s.x < -20 || s.x > w + 20 || s.y < -20 || s.y > h + 20) spawn(s);
        const life = Math.min(1, s.life, (9 - s.life) * 2);
        ctx.strokeStyle = vars[COLORS[s.color]!] || ink;
        ctx.lineWidth = 2.5;
        for (let k = 1; k < s.len; k++) {
          const i0 = (s.head - s.len + k - 1 + TRAIL) % TRAIL;
          const i1 = (s.head - s.len + k + TRAIL) % TRAIL;
          ctx.globalAlpha = fade * 0.7 * life * (k / s.len);
          ctx.beginPath();
          ctx.moveTo(s.trail[i0 * 2]!, s.trail[i0 * 2 + 1]!);
          ctx.lineTo(s.trail[i1 * 2]!, s.trail[i1 * 2 + 1]!);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    },
  };
}

const VARS = ["--rule", "--ink", "--line-ml", "--line-sys", "--line-web"] as const;

export function Backdrop({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useAmbientCanvas(ref, createEngine, VARS);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
