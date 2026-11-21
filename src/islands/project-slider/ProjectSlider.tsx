"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { REDUCED } from "../settings/store";
import s from "./project-slider.module.css";

type Labels = { region: string; prev: string; next: string; slide: string; pick: string };

/**
 * Selected work as a horizontal slider (PLAN §7.3). The track is native scroll-snap, so it swipes,
 * scrolls and works without JS; this island adds the motion and the controls:
 * - cards tilt with the drag/scroll velocity, each on its own spring, softer the further it sits
 *   from the centre, so a fast flick sends a ripple through the row;
 * - the centred card is full size, its neighbours recede;
 * - prev/next buttons, project tabs and arrow keys switch slides; a mouse can drag the track.
 * Reduced motion keeps the slider but drops the tilt and smooth scrolling.
 */
export function ProjectSlider({
  names,
  labels,
  children,
}: {
  names: string[];
  labels: Labels;
  children: ReactNode;
}) {
  const slides = Children.toArray(children);
  const track = useRef<HTMLOListElement>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);

  const goTo = useCallback((i: number) => {
    const el = track.current;
    const item = el?.children[i] as HTMLElement | undefined;
    if (!el || !item) return;
    const reduced = window.matchMedia(REDUCED).matches;
    el.scrollTo({
      left: item.offsetLeft - (el.clientWidth - item.offsetWidth) / 2,
      behavior: reduced ? "auto" : "smooth",
    });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const items = [...el.children] as HTMLElement[];
    const reduced = window.matchMedia(REDUCED);
    const springs = items.map(() => ({ a: 0, v: 0 }));
    let raf = 0;
    let lastX = el.scrollLeft;
    let lastT = 0;
    let vel = 0;

    const step = (now: number) => {
      const dt = lastT ? Math.min((now - lastT) / 1000, 0.05) : 1 / 60;
      lastT = now;
      const x = el.scrollLeft;
      vel += ((x - lastX) / dt - vel) * 0.35;
      lastX = x;
      const mid = x + el.clientWidth / 2;
      const target = reduced.matches ? 0 : Math.max(-18, Math.min(18, -vel * 0.014));
      let moving = Math.abs(vel) > 4;
      let best = 0;
      let bestD = Infinity;
      items.forEach((item, i) => {
        const d = (item.offsetLeft + item.offsetWidth / 2 - mid) / item.offsetWidth;
        if (Math.abs(d) < bestD) {
          bestD = Math.abs(d);
          best = i;
        }
        // Ripple: stiffness falls off with distance from the centre, so outer cards lag behind.
        const k = 190 / (1 + Math.abs(d) * 1.4);
        const sp = springs[i]!;
        sp.v += ((target - sp.a) * k - sp.v * 2 * Math.sqrt(k) * 0.5) * dt;
        sp.a += sp.v * dt;
        if (Math.abs(sp.v) > 0.05 || Math.abs(target - sp.a) > 0.05) moving = true;
        item.style.setProperty("--tilt", `${sp.a.toFixed(2)}deg`);
        item.style.setProperty("--near", (1 - Math.min(Math.abs(d), 1)).toFixed(3));
      });
      if (best !== indexRef.current) {
        indexRef.current = best;
        setIndex(best);
      }
      raf = moving ? requestAnimationFrame(step) : 0;
      if (!raf) lastT = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };

    // Mouse drag scrolls the track (touch and trackpads already scroll natively).
    let drag: { x: number; left: number; moved: boolean; from: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: el.scrollLeft, moved: false, from: indexRef.current };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 6) {
        drag.moved = true;
        el.dataset.dragging = "true";
      }
      if (drag.moved) el.scrollLeft = drag.left - dx;
    };
    const nearest = () => {
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      items.forEach((item, i) => {
        const d = Math.abs(item.offsetLeft + item.offsetWidth / 2 - mid);
        const b = Math.abs(items[best]!.offsetLeft + items[best]!.offsetWidth / 2 - mid);
        if (d < b) best = i;
      });
      return best;
    };
    const onUp = (e: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      if (drag?.moved) {
        // Swallow the click that ends a drag: no link is followed and no slide is picked.
        const swallow = (ev: MouseEvent) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        el.addEventListener("click", swallow, { capture: true, once: true });
        // If the release landed outside the track no click comes; don't eat the next real one.
        setTimeout(() => el.removeEventListener("click", swallow, { capture: true }), 0);
        // Settle on the nearest slide; a short, decided drag still moves one slide that way.
        const dx = e.clientX - drag.x;
        let target = nearest();
        if (target === drag.from && Math.abs(dx) > 60) target += dx < 0 ? 1 : -1;
        goTo(Math.max(0, Math.min(items.length - 1, target)));
        // Snapping comes back once the settle finishes, so it can't yank the track mid-scroll.
        let done = false;
        const restore = () => {
          if (done) return;
          done = true;
          delete el.dataset.dragging;
        };
        el.addEventListener("scrollend", restore, { once: true });
        setTimeout(restore, 900);
      }
      drag = null;
    };

    const ro = new ResizeObserver(kick);
    ro.observe(el);
    el.addEventListener("scroll", kick, { passive: true });
    el.addEventListener("pointerdown", onDown);
    reduced.addEventListener("change", kick);
    kick();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("scroll", kick);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      reduced.removeEventListener("change", kick);
    };
  }, [goTo]);

  const last = slides.length - 1;
  return (
    <div className={s.slider} role="region" aria-roledescription="carousel" aria-label={labels.region}>
      <ol
        ref={track}
        className={s.track}
        tabIndex={0}
        aria-label={labels.region}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") goTo(Math.min(last, index + 1));
          else if (e.key === "ArrowLeft") goTo(Math.max(0, index - 1));
          else return;
          e.preventDefault();
        }}
      >
        {slides.map((slide, i) => (
          <li
            key={i}
            className={s.slide}
            data-active={i === index}
            aria-roledescription="slide"
            aria-label={labels.slide.replace("{n}", String(i + 1)).replace("{total}", String(slides.length))}
            onClick={(e) => {
              // A peeking neighbour comes to the centre instead of following its link.
              if (i === index) return;
              e.preventDefault();
              goTo(i);
            }}
          >
            {slide}
          </li>
        ))}
      </ol>
      <div className={s.controls}>
        <button
          type="button"
          className={s.arrow}
          onClick={() => goTo(Math.max(0, index - 1))}
          disabled={index === 0}
        >
          <span aria-hidden="true">‹</span>
          <span className="visually-hidden">{labels.prev}</span>
        </button>
        <div className={s.tabs} role="group" aria-label={labels.pick}>
          {names.map((name, i) => (
            <button
              key={name}
              type="button"
              className={s.tab}
              aria-current={i === index ? "true" : undefined}
              onClick={() => goTo(i)}
            >
              {name}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={s.arrow}
          onClick={() => goTo(Math.min(last, index + 1))}
          disabled={index === last}
        >
          <span aria-hidden="true">›</span>
          <span className="visually-hidden">{labels.next}</span>
        </button>
      </div>
    </div>
  );
}
