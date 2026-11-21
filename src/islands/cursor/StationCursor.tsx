"use client";

import { useEffect, useRef } from "react";
import { FINE_POINTER, REDUCED, useMedia, useSettings } from "../settings/store";

type Props = {
  className?: string;
  plateClassName?: string;
  markClassName?: string;
  carClassName?: string;
  dotClassName?: string;
};

const INTERACTIVE =
  "a[href], button:not(:disabled), [role='slider'], [role='option'], summary, [data-cursor]";
const TEXT =
  "input:not([type='checkbox']):not([type='radio']):not([type='submit']), textarea, select, [contenteditable='true']";
const CARS = 3;

/** A critically-damped-ish spring, integrated per frame (semi-implicit Euler). */
function spring(stiffness: number, damping: number) {
  let v = 0;
  let x = 0;
  let initialised = false;
  return {
    set(value: number) {
      x = value;
      v = 0;
      initialised = true;
    },
    step(target: number, dt: number) {
      if (!initialised) this.set(target);
      const a = stiffness * (target - x) - damping * v;
      v += a * dt;
      x += v * dt;
      return x;
    },
    get value() {
      return x;
    },
  };
}

function labelFor(el: Element): string {
  const own = el.getAttribute("data-cursor");
  if (own) return own;
  if (el.hasAttribute("download")) return "Download";
  if (el instanceof HTMLAnchorElement && el.target === "_blank") return "Open";
  if (el.getAttribute("role") === "slider") return "Turn";
  return el.tagName === "BUTTON" ? "Press" : "Go";
}

/**
 * The cursor (PLAN §7.2 rule 2): a precise ink dot at the pointer, and a station ring that follows on
 * a spring, stretches with speed and pulls three cars. Over a link or button the ring springs open
 * into an interchange frame around it, with a plate naming the action. Hidden over text fields (the
 * native caret takes over), off on touch, off under reduced motion, switchable. Transforms only,
 * outside React renders.
 */
export function StationCursor({
  className,
  plateClassName,
  markClassName,
  carClassName,
  dotClassName,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const plate = useRef<HTMLSpanElement>(null);
  const cars = useRef<(HTMLSpanElement | null)[]>([]);
  const fine = useMedia(FINE_POINTER);
  const reduced = useMedia(REDUCED);
  const { cursor } = useSettings();
  const enabled = fine && !reduced && cursor;

  useEffect(() => {
    const el = root.current;
    const r = ring.current;
    const d = dot.current;
    const p = plate.current;
    const html = document.documentElement;
    if (!enabled || !el || !r || !d || !p) return;
    html.classList.add("lab-cursor-on");

    let px = -100;
    let py = -100;
    let visible = false;
    let pressed = false;
    let hovered: Element | null = null;
    let overText = false;
    let lastLabel = "";
    let last = 0;
    let raf = 0;
    // Ring geometry springs: centre x/y, width, height, corner radius.
    const sx = spring(420, 34);
    const sy = spring(420, 34);
    const sw = spring(520, 38);
    const sh = spring(520, 38);
    const sr = spring(520, 38);
    const trail = Array.from({ length: CARS }, () => ({ x: -100, y: -100 }));
    let speed = 0;

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!visible) {
        visible = true;
        sx.set(px);
        sy.set(py);
        trail.forEach((c) => ((c.x = px), (c.y = py)));
      }
      el.dataset.visible = "true";
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      overText = !!t?.closest?.(TEXT);
      hovered = overText ? null : (t?.closest?.(INTERACTIVE) ?? null);
      el.dataset.state = overText ? "text" : hovered ? "link" : "idle";
      if (hovered) {
        const label = labelFor(hovered);
        if (label !== lastLabel) p.textContent = lastLabel = label;
      }
    };
    const onLeave = () => {
      visible = false;
      el.dataset.visible = "false";
    };
    const onDown = () => (pressed = true);
    const onUp = () => (pressed = false);

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;

      // Target geometry: the hovered element's live bounds, or a 18px station ring at the pointer.
      let cx = px;
      let cy = py;
      let w = 18;
      let h = 18;
      let radius = 9;
      if (hovered && hovered.isConnected) {
        const b = hovered.getBoundingClientRect();
        const pad = 6;
        cx = b.left + b.width / 2;
        cy = b.top + b.height / 2;
        w = b.width + pad * 2;
        h = b.height + pad * 2;
        radius = Math.min(14, h / 2);
      }
      if (pressed) {
        w *= 0.92;
        h *= 0.92;
      }
      const x = sx.step(cx, dt);
      const y = sy.step(cy, dt);
      const rw = sw.step(w, dt);
      const rh = sh.step(h, dt);
      const rr = sr.step(radius, dt);

      // Speed stretch only while free-moving, along the direction of travel.
      const vx = px - x;
      const vy = py - y;
      speed += (Math.hypot(vx, vy) - speed) * 0.25;
      const stretch = hovered ? 0 : Math.min(speed / 60, 0.45);
      const angle = Math.atan2(vy, vx);
      r.style.width = `${rw}px`;
      r.style.height = `${rh}px`;
      r.style.borderRadius = `${rr}px`;
      r.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${hovered ? 0 : angle}rad) scale(${1 + stretch}, ${1 - stretch * 0.5})`;
      d.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%)`;
      p.style.transform = `translate3d(${x - rw / 2}px, ${y - rh / 2 - 8}px, 0) translateY(-100%)`;

      // Cars: ease after the ring, docking out of sight when it stops or frames a target.
      let ax = x;
      let ay = y;
      trail.forEach((c, i) => {
        const bx = c.x;
        const by = c.y;
        c.x += (ax - c.x) * 0.32;
        c.y += (ay - c.y) * 0.32;
        const car = cars.current[i];
        if (car) {
          car.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) translate(-50%, -50%) rotate(${Math.atan2(ay - by, ax - bx)}rad)`;
          car.style.opacity = hovered || overText ? "0" : String(Math.min(1, speed / 8) * (1 - i * 0.25));
        }
        ax = c.x;
        ay = c.y;
      });
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    html.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("lab-cursor-on");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      html.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={root} className={className} data-state="idle" data-visible="false" aria-hidden="true">
      {Array.from({ length: CARS }, (_, i) => (
        <span
          key={i}
          ref={(node) => {
            cars.current[i] = node;
          }}
          className={carClassName}
        />
      ))}
      <span ref={ring} className={markClassName} />
      <span ref={dot} className={dotClassName} />
      <span ref={plate} className={plateClassName} />
    </div>
  );
}
