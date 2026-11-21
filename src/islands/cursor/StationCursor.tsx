"use client";

import { useRef } from "react";
import { useCursor } from "./useCursor";

type Props = {
  className?: string;
  plateClassName?: string;
  markClassName?: string;
  carClassName?: string;
};

const CARS = 3;

/**
 * The cursor as a little train: a station mark that stretches along its direction of travel,
 * pulling three cars that ease after it and dock out of sight when it stops. Over a link it
 * settles into an interchange plate naming the action. All transforms, outside React renders.
 */
export function StationCursor({ className, plateClassName, markClassName, carClassName }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLSpanElement>(null);
  const cars = useRef<(HTMLSpanElement | null)[]>([]);
  const trail = useRef(Array.from({ length: CARS }, () => ({ x: -100, y: -100 })));
  const last = useRef({ x: -100, y: -100, speed: 0 });

  const { enabled, target } = useCursor(
    ref,
    (x, y, t) => {
      const prev = last.current;
      const dx = x - prev.x;
      const dy = y - prev.y;
      const speed = prev.speed + (Math.hypot(dx, dy) - prev.speed) * 0.3;
      last.current = { x, y, speed };

      // Stretch along the direction of travel; settle round when still or over a link.
      const stretch = t ? 0 : Math.min(speed / 45, 0.55);
      const angle = Math.atan2(dy, dx);
      if (mark.current) {
        mark.current.style.transform = `translate(-50%, -50%) rotate(${angle}rad) scale(${1 + stretch}, ${1 - stretch * 0.4})`;
      }

      // Cars ease after the one ahead, angled along the coupling.
      let px = x;
      let py = y;
      trail.current.forEach((p, i) => {
        const ax = p.x;
        const ay = p.y;
        p.x += (px - p.x) * 0.38;
        p.y += (py - p.y) * 0.38;
        const el = cars.current[i];
        if (el) {
          const a = Math.atan2(py - ay, px - ax);
          el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) rotate(${a}rad)`;
          el.style.opacity = t ? "0" : String(Math.min(1, speed / 6) * (1 - i * 0.22));
        }
        px = p.x;
        py = p.y;
      });
    },
    0.4,
  );

  if (!enabled) return null;
  return (
    <>
      {Array.from({ length: CARS }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            cars.current[i] = el;
          }}
          className={carClassName}
          aria-hidden="true"
        />
      ))}
      <div ref={ref} className={className} data-state={target ? "link" : "idle"} aria-hidden="true">
        <span ref={mark} className={markClassName} />
        <span className={plateClassName}>{target?.label}</span>
      </div>
    </>
  );
}
