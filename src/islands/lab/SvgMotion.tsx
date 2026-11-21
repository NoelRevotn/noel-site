"use client";

import { useEffect } from "react";
import { labStore, REDUCED } from "./store";

/**
 * Pauses every HTML/SVG animation on the page together: CSS animations via
 * html[data-motion="paused"], SMIL trains via pauseAnimations(). Reduced motion counts as paused.
 */
export function SvgMotion() {
  useEffect(() => {
    const reduced = window.matchMedia(REDUCED);
    const sync = () => {
      const paused = labStore.get().paused || reduced.matches || document.hidden;
      document.documentElement.dataset.motion = paused ? "paused" : "on";
      document.querySelectorAll<SVGSVGElement>("svg[data-smil]").forEach((svg) => {
        if (paused) svg.pauseAnimations();
        else svg.unpauseAnimations();
      });
    };
    sync();
    const unsub = labStore.subscribe(sync);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      unsub();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return null;
}
