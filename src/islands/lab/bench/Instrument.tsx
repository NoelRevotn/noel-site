"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react";
import { useAmbientCanvas, type Engine, type Frame } from "../useAmbientCanvas";

export type Channel = { id: string; label: string; lines: string[] };

type Props = {
  name: string;
  headline: string;
  channels: Channel[];
  classes: Record<
    | "screen"
    | "name"
    | "headline"
    | "channel"
    | "trace"
    | "readout"
    | "knobWrap"
    | "knob"
    | "detents"
    | "detent",
    string | undefined
  >;
};

/** Training-loss trace for the amber screen. Synthetic: exponential decay, noise, epoch bumps. */
function createTrace(): Engine {
  let w = 0;
  let h = 0;
  let step = 0;
  const N = 240;
  const data = new Float32Array(N);
  let head = 0;
  const loss = (s: number) => {
    const epoch = Math.floor(s / 400);
    const local = s % 400;
    const base = 0.08 + 0.9 * Math.exp(-local / 90) * Math.pow(0.82, epoch % 6);
    return base + (Math.random() - 0.5) * 0.04;
  };
  for (let i = 0; i < N; i++) data[i] = loss(i * 2);
  head = 0;
  step = N * 2;

  return {
    resize(nw, nh) {
      w = nw;
      h = nh;
    },
    draw({ ctx, dt, vars, still }: Frame) {
      if (!still) {
        // ~60 samples per second of running time.
        const n = Math.round(dt * 60);
        for (let i = 0; i < n; i++) {
          data[head] = loss(step);
          head = (head + 1) % N;
          step += 2;
        }
      }
      const amber = vars["--amber"] || "#ffb547";
      const dim = vars["--amber-dim"] || "#5a3d10";
      ctx.clearRect(0, 0, w, h);
      // Graticule.
      ctx.strokeStyle = dim;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= w; x += w / 12) {
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, h);
      }
      for (let y = 0; y <= h; y += h / 4) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(w, Math.round(y) + 0.5);
      }
      ctx.stroke();
      // Trace, drawn twice for a phosphor glow without shadowBlur.
      const path = () => {
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const v = data[(head + i) % N]!;
          const x = (i / (N - 1)) * w;
          const y = h - 6 - Math.min(1, v) * (h - 12);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      };
      ctx.strokeStyle = amber;
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 5;
      path();
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1.75;
      path();
      ctx.stroke();
    },
  };
}

const VARS = ["--amber", "--amber-dim"] as const;
const ANGLES = [-60, 0, 60];

/** Lab C: the amber screen, its live trace and the detented channel knob (role=slider). */
export function Instrument({ name, headline, channels, classes }: Props) {
  const trace = useRef<HTMLCanvasElement>(null);
  useAmbientCanvas(trace, createTrace, VARS);
  const [value, setValue] = useState(0);
  const drag = useRef<{ y: number; x: number; start: number } | null>(null);
  const max = channels.length - 1;
  const clamp = (v: number) => Math.max(0, Math.min(max, v));
  const channel = channels[value]!;

  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = {
      ArrowRight: value + 1,
      ArrowUp: value + 1,
      ArrowLeft: value - 1,
      ArrowDown: value - 1,
      Home: 0,
      End: max,
    };
    if (e.key in map) {
      e.preventDefault();
      setValue(clamp(map[e.key]!));
    }
  };
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, start: value };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const d = e.clientX - drag.current.x - (e.clientY - drag.current.y);
    setValue(clamp(drag.current.start + Math.round(d / 40)));
  };
  const onUp = () => {
    drag.current = null;
  };
  const onWheel = (e: WheelEvent) => {
    setValue(clamp(value + (e.deltaY > 0 ? 1 : -1)));
  };

  return (
    <>
      <div className={classes.screen}>
        <h1 id="name" className={classes.name}>
          {name}
        </h1>
        <p className={classes.headline}>{headline}</p>
        <div className={classes.channel} aria-live="polite">
          <p>
            <strong>{channel.label}</strong>
          </p>
          {channel.lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
        <canvas ref={trace} className={classes.trace} aria-hidden="true" />
        <p className={classes.readout}>Synthetic training loss, live</p>
      </div>

      <div className={classes.knobWrap}>
        <div
          className={classes.knob}
          role="slider"
          tabIndex={0}
          aria-label="Screen channel"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={channel.label}
          style={{ rotate: `${ANGLES[value] ?? 0}deg` }}
          onKeyDown={onKey}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onWheel={onWheel}
        />
        <ul className={classes.detents} aria-hidden="true">
          {channels.map((c, i) => (
            <li key={c.id} className={classes.detent} data-active={i === value}>
              <button type="button" tabIndex={-1} onClick={() => setValue(i)}>
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
