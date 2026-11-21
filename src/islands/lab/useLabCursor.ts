"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { FINE_POINTER, REDUCED, useLabState, useMedia } from "./store";

export type CursorTarget = { label: string; rect: DOMRect } | null;
const INTERACTIVE = "a[href], button:not(:disabled), [role='slider'], [data-cursor]";

function labelFor(el: Element): string {
  const own = el.getAttribute("data-cursor");
  if (own) return own;
  if (el.hasAttribute("download")) return "Download";
  if (el instanceof HTMLAnchorElement && el.target === "_blank") return "Open";
  if (el.getAttribute("role") === "slider") return "Turn";
  return el.tagName === "BUTTON" ? "Press" : "Go";
}

/**
 * Enhancing cursor (PLAN.md §7.2 rule 2): fine pointers only, off under reduced motion,
 * toggleable, moved with transforms outside React renders. Text fields keep the native cursor
 * (see the `lab-cursor-on` rule in app/lab/lab.css). `onFrame` gets the smoothed position.
 */
export function useLabCursor(
  ref: RefObject<HTMLElement | null>,
  onFrame?: (x: number, y: number, target: CursorTarget) => void,
  ease = 0.28,
) {
  const fine = useMedia(FINE_POINTER);
  const reduced = useMedia(REDUCED);
  const { cursor } = useLabState();
  const enabled = fine && !reduced && cursor;
  const [target, setTarget] = useState<CursorTarget>(null);
  const frameRef = useRef(onFrame);
  useEffect(() => {
    frameRef.current = onFrame;
  });

  useEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    if (!enabled || !el) return;
    root.classList.add("lab-cursor-on");
    let x = -100;
    let y = -100;
    let tx = -100;
    let ty = -100;
    let raf = 0;
    let current: CursorTarget = null;

    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.dataset.visible = "true";
    };
    const over = (e: PointerEvent) => {
      const hit = (e.target as Element | null)?.closest?.(INTERACTIVE);
      current = hit ? { label: labelFor(hit), rect: hit.getBoundingClientRect() } : null;
      setTarget(current);
    };
    const leave = () => {
      el.dataset.visible = "false";
    };
    const loop = () => {
      x += (tx - x) * ease;
      y += (ty - y) * ease;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frameRef.current?.(x, y, current);
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    root.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("lab-cursor-on");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      root.removeEventListener("pointerleave", leave);
    };
  }, [enabled, ref, ease]);

  return { enabled, target };
}
