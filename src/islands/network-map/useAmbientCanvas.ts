"use client";

import { useEffect, type RefObject } from "react";
import { DARK, settings, REDUCED } from "../settings/store";

export type Pointer = { x: number; y: number; active: boolean };
export type Frame = {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  /** Seconds of running time. It stops while paused, hidden or off-screen. */
  t: number;
  dt: number;
  pointer: Pointer;
  vars: Record<string, string>;
  /** True when drawing one still frame (reduced motion, paused, resize). */
  still: boolean;
};
export type Engine = { resize(w: number, h: number): void; draw(f: Frame): void };

/**
 * Runs one ambient canvas (PLAN.md §7.2 rule 1): DPR capped at 2, paused off-screen, in hidden
 * tabs and on request, a still frame under reduced motion, and quality steps down on slow devices.
 * `createEngine` and `varNames` must be stable (module-level) values.
 */
export function useAmbientCanvas(
  ref: RefObject<HTMLCanvasElement | null>,
  createEngine: () => Engine,
  varNames: readonly string[],
  options: { fps?: number; deferUntilIdle?: boolean; stillOnTouch?: boolean } = {},
) {
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const engine = createEngine();
    const reduced = window.matchMedia(REDUCED);
    const dark = window.matchMedia(DARK);
    const pointer: Pointer = { x: -1, y: -1, active: false };
    let vars: Record<string, string> = {};
    let w = 0;
    let h = 0;
    let quality = 1;
    let t = 0;
    let last = 0;
    let raf = 0;
    let onScreen = true;
    let slowFrames = 0;
    let started = !options.deferUntilIdle;
    let acc = 0;
    const frameTime = options.fps ? 1 / options.fps : 0;

    const readVars = () => {
      const cs = getComputedStyle(canvas);
      vars = Object.fromEntries(varNames.map((n) => [n, cs.getPropertyValue(n).trim()]));
    };
    // Touch devices can't steer the field and are usually low-power: draw one still frame there.
    const touchStill = !!options.stillOnTouch && window.matchMedia("(pointer: coarse)").matches;
    const running = () =>
      started && !touchStill && onScreen && !document.hidden && !settings.get().paused && !reduced.matches;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * quality;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      engine.resize(w, h);
    };
    const drawStill = () => engine.draw({ ctx, w, h, t, dt: 0, pointer, vars, still: true });

    const tick = (now: number) => {
      let dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      // Optional frame cap: accumulate time and draw only when a frame is due.
      if (frameTime) {
        acc += dt;
        if (acc < frameTime) {
          raf = requestAnimationFrame(tick);
          return;
        }
        dt = Math.min(acc, 0.1);
        acc = 0;
      }
      t += dt;
      // Step quality down when the device can't hold ~40 fps.
      slowFrames = dt > Math.max(0.025, frameTime * 1.5) ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames > 45 && quality > 0.5) {
        quality -= 0.25;
        slowFrames = 0;
        resize();
      }
      engine.draw({ ctx, w, h, t, dt, pointer, vars, still: false });
      raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (running()) raf = requestAnimationFrame(tick);
      else drawStill();
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = e.pointerType === "mouse";
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onTheme = () =>
      requestAnimationFrame(() => {
        readVars();
        if (!running()) drawStill();
      });

    const ro = new ResizeObserver(() => {
      resize();
      if (!running()) drawStill();
    });
    const io = new IntersectionObserver(([e]) => {
      onScreen = !!e?.isIntersecting;
      sync();
    });
    readVars();
    resize();
    ro.observe(canvas);
    io.observe(canvas);
    const unsub = settings.subscribe(() => {
      onTheme();
      sync();
    });
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    dark.addEventListener("change", onTheme);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    if (started) sync();
    else {
      // Wait for load + idle so the ambient layer never competes with first paint (Lighthouse TBT).
      const begin = () => {
        started = true;
        sync();
      };
      const go = () =>
        "requestIdleCallback" in window
          ? window.requestIdleCallback(begin, { timeout: 3000 })
          : setTimeout(begin, 500);
      if (document.readyState === "complete") go();
      else window.addEventListener("load", go, { once: true });
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      unsub();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      dark.removeEventListener("change", onTheme);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- engine factory and vars are module constants
  }, [ref]);
}
