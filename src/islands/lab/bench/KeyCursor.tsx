"use client";

import { useRef } from "react";
import { useLabCursor } from "../useLabCursor";

/** Lab C cursor: an orange dot whose ring snaps to the bounds of the key you're over. */
export function KeyCursor({ className, ringClassName }: { className?: string; ringClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const { enabled, target } = useLabCursor(ref, (x, y, t) => {
    const el = ring.current;
    if (!el) return;
    if (t) {
      // Ring frames the key: position relative to the dot, which sits at (x, y).
      const r = t.rect;
      el.style.width = `${r.width + 10}px`;
      el.style.height = `${r.height + 10}px`;
      el.style.transform = `translate(${r.left - 5 - x}px, ${r.top - 5 - y}px)`;
    } else {
      el.style.width = "";
      el.style.height = "";
      el.style.transform = "";
    }
  });
  if (!enabled) return null;
  return (
    <div ref={ref} className={className} data-state={target ? "link" : "idle"} aria-hidden="true">
      <span ref={ring} className={ringClassName} />
    </div>
  );
}
