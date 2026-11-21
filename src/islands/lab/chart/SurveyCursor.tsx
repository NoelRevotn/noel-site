"use client";

import { useRef } from "react";
import { useLabCursor } from "../useLabCursor";
import { depthAt } from "./ChartField";

// The viewport maps onto the Bay of Panama (synthetic survey bounds around Panama City).
const LAT_N = 9.06;
const LAT_S = 8.86;
const LON_W = -79.64;
const LON_E = -79.38;

function dm(value: number, pos: string, neg: string) {
  const abs = Math.abs(value);
  const d = Math.floor(abs);
  const m = (abs - d) * 60;
  return `${d}°${m.toFixed(2).padStart(5, "0")}′${value >= 0 ? pos : neg}`;
}

/** Lab B cursor: a survey crosshair with a coordinate and depth readout. */
export function SurveyCursor({
  className,
  readoutClassName,
}: {
  className?: string;
  readoutClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const { enabled, target } = useLabCursor(
    ref,
    (x, y, t) => {
      const el = readout.current;
      if (!el) return;
      if (t) {
        el.textContent = t.label;
        return;
      }
      const lat = LAT_N - (y / window.innerHeight) * (LAT_N - LAT_S);
      const lon = LON_W + (x / window.innerWidth) * (LON_E - LON_W);
      const inHero = window.scrollY + y < window.innerHeight;
      const depth = inHero && depthAt ? `  ${depthAt(x, y + window.scrollY).toFixed(1)} m` : "";
      el.textContent = `${dm(lat, "N", "S")} ${dm(lon, "E", "W")}${depth}`;
    },
    0.5,
  );
  if (!enabled) return null;
  return (
    <div ref={ref} className={className} data-state={target ? "link" : "idle"} aria-hidden="true">
      <span ref={readout} className={readoutClassName} />
    </div>
  );
}
