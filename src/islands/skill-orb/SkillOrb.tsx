"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { DARK, REDUCED, settings } from "../settings/store";
import s from "./skill-orb.module.css";

export type OrbGroup = { id: string; name: string; skills: { name: string; evidence: string[] }[] };
export type OrbProject = { slug: string; title: string };
type Labels = {
  title: string;
  hint: string;
  usedIn: string;
  uses: string;
  nothing: string;
  projects: string;
};

type Node = {
  id: string;
  label: string;
  kind: "skill" | "project";
  line: string;
  /** Position on the unit sphere (skills) or the inner shell (projects). */
  p: [number, number, number];
  links: string[];
};

const PARTICLES = 1100;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const CODE: Record<string, string> = { ml: "ML", sys: "SY", web: "WB", tools: "TL" };

/** Evenly spread points on a sphere (Fibonacci lattice). */
function fib(i: number, n: number, r: number): [number, number, number] {
  const y = 1 - ((i + 0.5) / n) * 2;
  const rad = Math.sqrt(1 - y * y);
  const th = i * GOLDEN;
  return [Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r];
}

/** Deterministic PRNG so the particle haze is the same on every load. */
function rng(seed: number) {
  let x = seed;
  return () => (x = (x * 1664525 + 1013904223) >>> 0) / 4294967296;
}

function build(groups: OrbGroup[], projects: OrbProject[]) {
  const skills = groups.flatMap((g) => g.skills.map((sk) => ({ ...sk, line: g.id })));
  const nodes: Node[] = skills.map((sk, i) => ({
    id: `s:${sk.name}`,
    label: sk.name,
    kind: "skill",
    line: sk.line,
    p: fib(i, skills.length, 1),
    links: sk.evidence.map((slug) => `p:${slug}`),
  }));
  projects.forEach((pr, i) => {
    const id = `p:${pr.slug}`;
    nodes.push({
      id,
      label: pr.title,
      kind: "project",
      line: "tools",
      p: fib(i, projects.length, 0.42),
      links: nodes.filter((n) => n.links.includes(id)).map((n) => n.id),
    });
  });
  const rand = rng(11);
  const haze = Array.from({ length: PARTICLES }, (_, i) => {
    const r = 0.97 + rand() * 0.09;
    const [x, y, z] = fib(i, PARTICLES, r);
    const p: [number, number, number] = [
      x + (rand() - 0.5) * 0.03,
      y + (rand() - 0.5) * 0.03,
      z + (rand() - 0.5) * 0.03,
    ];
    // Each particle takes the colour of its nearest skill, so the shell shows the domains as regions.
    let line = "tools";
    let best = Infinity;
    for (const n of nodes) {
      if (n.kind !== "skill") continue;
      const d = (n.p[0] - x) ** 2 + (n.p[1] - y) ** 2 + (n.p[2] - z) ** 2;
      if (d < best) {
        best = d;
        line = n.line;
      }
    }
    return { p, line, phase: rand() * Math.PI * 2 };
  });
  return { nodes, haze };
}

/**
 * Skills as a 3D particle orb (PLAN §7.3): skills sit on the shell in their domain colour, the
 * projects that prove them float inside, and links run through the sphere. It turns slowly on its
 * own; drag to spin it (with momentum), point at or tap a node to light its links. The legend
 * buttons are the keyboard and screen-reader way in, and the caption reads the links out.
 * Reduced motion or the pause switch stop the drift; dragging still works.
 */
export function SkillOrb({
  groups,
  projects,
  labels,
}: {
  groups: OrbGroup[];
  projects: OrbProject[];
  labels: Labels;
}) {
  const { nodes, haze } = useMemo(() => build(groups, projects), [groups, projects]);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const shown = active ?? pinned;
  const shownRef = useRef<string | null>(null);
  const redraw = useRef<() => void>(() => {});
  /** Turns the orb so a node picked from the legend faces the viewer. */
  const steer = useRef<(id: string) => void>(() => {});

  useEffect(() => {
    shownRef.current = shown;
    redraw.current();
  }, [shown]);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduced = window.matchMedia(REDUCED);
    const dark = window.matchMedia(DARK);
    let w = 0;
    let h = 0;
    let colors: Record<string, string> = {};
    let font = "sans-serif";
    let yaw = 0.6;
    let pitch = -0.25;
    let vYaw = 0;
    let vPitch = 0;
    let raf = 0;
    let last = 0;
    let onScreen = false;
    let hover: string | null = null;
    let time = 0;
    let aim: { yaw: number; pitch: number } | null = null;
    let dragging = false;
    let screen: { id: string; x: number; y: number; z: number }[] = [];

    const readColors = () => {
      const cs = getComputedStyle(el);
      colors = Object.fromEntries(
        ["--line-ml", "--line-sys", "--line-web", "--ink", "--muted", "--ground"].map((n) => [
          n,
          cs.getPropertyValue(n).trim(),
        ]),
      );
      colors["--line-tools"] = colors["--ink"]!;
      font = cs.fontFamily;
    };
    const resize = () => {
      w = el.clientWidth;
      h = el.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const project = (p: readonly [number, number, number]) => {
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const x1 = p[0] * cy + p[2] * sy;
      const z1 = -p[0] * sy + p[2] * cy;
      const y2 = p[1] * cp - z1 * sp;
      const z2 = p[1] * sp + z1 * cp;
      const persp = 3.2 / (3.2 - z2);
      const R = Math.min(w, h) * 0.4;
      return { x: w / 2 + x1 * R * persp, y: h / 2 - y2 * R * persp, z: z2, s: persp };
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const focus = shownRef.current ?? hover;
      const lit = new Set<string>();
      if (focus) {
        lit.add(focus);
        nodes.find((n) => n.id === focus)?.links.forEach((l) => lit.add(l));
      }
      // Particle shell: brighter and larger toward the viewer, shimmering while it drifts.
      for (const pt of haze) {
        const q = project(pt.p);
        const depth = (q.z + 1) / 2;
        const shimmer = 0.75 + 0.25 * Math.sin(time * 1.6 + pt.phase);
        ctx.globalAlpha = (0.08 + depth * 0.62) * shimmer * (focus ? 0.45 : 1);
        ctx.fillStyle = colors[`--line-${pt.line}`]!;
        const r = (0.7 + depth * 1.9) * q.s;
        ctx.fillRect(q.x - r / 2, q.y - r / 2, r, r);
      }
      const pos = new Map(nodes.map((n) => [n.id, project(n.p)]));
      // Links through the sphere.
      for (const n of nodes) {
        if (n.kind !== "skill") continue;
        const a = pos.get(n.id)!;
        for (const l of n.links) {
          const b = pos.get(l)!;
          const on = !!focus && lit.has(n.id) && lit.has(l);
          ctx.globalAlpha = focus ? (on ? 0.95 : 0.05) : 0.18 + ((a.z + 1) / 2) * 0.2;
          ctx.strokeStyle = colors[`--line-${n.line}`]!;
          ctx.lineWidth = on ? 2.5 : 1.25;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      // Nodes back to front, labels on the near half (and always on lit nodes).
      screen = nodes
        .map((n) => ({ n, q: pos.get(n.id)! }))
        .sort((a, b) => a.q.z - b.q.z)
        .map(({ n, q }) => {
          const on = !focus || lit.has(n.id);
          const depth = (q.z + 1) / 2;
          ctx.globalAlpha = on ? 0.35 + depth * 0.65 : 0.12;
          ctx.fillStyle = colors[`--line-${n.line}`]!;
          const r = (n.kind === "project" ? 7 : 5.5) * q.s * (focus === n.id ? 1.4 : 1);
          ctx.beginPath();
          if (n.kind === "project") ctx.roundRect(q.x - r, q.y - r, r * 2, r * 2, 3);
          else ctx.arc(q.x, q.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = colors["--ground"]!;
          ctx.lineWidth = 2;
          ctx.stroke();
          if ((n.kind === "project" && q.z > -0.3 && !focus) || lit.has(n.id)) {
            ctx.globalAlpha = lit.has(n.id) ? 1 : Math.min(1, 0.25 + depth);
            ctx.font = `${n.kind === "project" ? 800 : 700} ${n.kind === "project" ? 14 : 12.5}px ${font}`;
            ctx.lineJoin = "round";
            ctx.lineWidth = 4;
            ctx.strokeStyle = colors["--ground"]!;
            ctx.fillStyle = colors["--ink"]!;
            const tx = q.x + r + 5;
            ctx.strokeText(n.label, tx, q.y + 4);
            ctx.fillText(n.label, tx, q.y + 4);
          }
          return { id: n.id, x: q.x, y: q.y, z: q.z };
        });
      ctx.globalAlpha = 1;
    };

    const drifting = () => !reduced.matches && !settings.get().paused;
    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
      last = now;
      time += dt;
      if (aim && !dragging) {
        const k = reduced.matches ? 1 : Math.min(1, dt * 5);
        const dy = Math.atan2(Math.sin(aim.yaw - yaw), Math.cos(aim.yaw - yaw));
        yaw += dy * k;
        pitch += (aim.pitch - pitch) * k;
        if (Math.abs(dy) < 0.002 && Math.abs(aim.pitch - pitch) < 0.002) aim = null;
      } else if (!dragging) {
        yaw += (vYaw + (drifting() && !hover && !shownRef.current ? 0.12 : 0)) * dt;
        pitch = Math.max(-1.1, Math.min(1.1, pitch + vPitch * dt));
        const decay = Math.exp(-dt * 2.4);
        vYaw *= decay;
        vPitch *= decay;
      }
      draw();
      const moving = !!aim || dragging || Math.abs(vYaw) > 0.01 || Math.abs(vPitch) > 0.01 || drifting();
      raf = onScreen && !document.hidden && moving ? requestAnimationFrame(tick) : 0;
      if (!raf) last = 0;
    };
    const wake = () => {
      if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(tick);
      else if (!raf) draw();
    };
    redraw.current = wake;
    steer.current = (id) => {
      const n = nodes.find((x) => x.id === id);
      if (!n) return;
      const [x, y, z] = n.p;
      const ty = Math.atan2(-x, z);
      const z1 = -x * Math.sin(ty) + z * Math.cos(ty);
      aim = { yaw: ty, pitch: Math.max(-1.1, Math.min(1.1, Math.atan2(y, z1))) };
      vYaw = 0;
      vPitch = 0;
      wake();
    };

    // Drag to spin; a press that doesn't move picks a node (tap on touch).
    let start = { x: 0, y: 0, yaw: 0, pitch: 0, t: 0, moved: false };
    const pick = (x: number, y: number) => {
      let best: string | null = null;
      let bestZ = -Infinity;
      for (const p of screen) {
        if (Math.hypot(p.x - x, p.y - y) < 16 && p.z > bestZ) {
          best = p.id;
          bestZ = p.z;
        }
      }
      return best;
    };
    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const p = local(e);
      start = { ...p, yaw, pitch, t: performance.now(), moved: false };
      dragging = true;
      el.setPointerCapture(e.pointerId);
      wake();
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      if (!dragging) {
        if (e.pointerType !== "mouse") return;
        const id = pick(p.x, p.y);
        if (id !== hover) {
          hover = id;
          el.style.cursor = id ? "pointer" : "";
          setActive(id);
          wake();
        }
        return;
      }
      const dx = p.x - start.x;
      const dy = p.y - start.y;
      if (!start.moved && Math.hypot(dx, dy) > 4) {
        start.moved = true;
        el.dataset.dragging = "true";
      }
      if (!start.moved) return;
      const k = 3 / Math.min(w, h);
      const ny = start.yaw + dx * k;
      const np = Math.max(-1.1, Math.min(1.1, start.pitch + dy * k));
      const dt = Math.max((performance.now() - start.t) / 1000, 0.008);
      if (!reduced.matches) {
        vYaw = (ny - yaw) / dt;
        vPitch = (np - pitch) / dt;
      }
      start.t = performance.now();
      yaw = ny;
      pitch = np;
      start = { ...start, x: p.x, y: p.y, yaw, pitch };
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      delete el.dataset.dragging;
      if (!start.moved) {
        const id = pick(local(e).x, local(e).y);
        setPinned((cur) => (id && cur !== id ? id : null));
      }
      wake();
    };
    const onLeave = () => {
      if (hover) {
        hover = null;
        setActive(null);
        el.style.cursor = "";
        wake();
      }
    };

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    const io = new IntersectionObserver(([e]) => {
      onScreen = !!e?.isIntersecting;
      wake();
    });
    const onTheme = () =>
      requestAnimationFrame(() => {
        readColors();
        wake();
      });
    readColors();
    resize();
    ro.observe(el);
    io.observe(el);
    const unsub = settings.subscribe(onTheme);
    dark.addEventListener("change", onTheme);
    reduced.addEventListener("change", wake);
    document.addEventListener("visibilitychange", wake);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      redraw.current = () => {};
      steer.current = () => {};
      ro.disconnect();
      io.disconnect();
      unsub();
      dark.removeEventListener("change", onTheme);
      reduced.removeEventListener("change", wake);
      document.removeEventListener("visibilitychange", wake);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [nodes, haze]);

  const shownNode = nodes.find((n) => n.id === shown);
  const linkedNodes = shownNode ? nodes.filter((n) => shownNode.links.includes(n.id)) : [];
  const legendButton = (n: Node) => (
    <button
      key={n.id}
      type="button"
      className={s.chip}
      data-line={n.line}
      data-kind={n.kind}
      data-on={!shownNode || n.id === shown || shownNode.links.includes(n.id)}
      aria-pressed={pinned === n.id}
      onPointerEnter={() => setActive(n.id)}
      onPointerLeave={() => setActive(null)}
      onFocus={() => {
        setActive(n.id);
        steer.current(n.id);
      }}
      onBlur={() => setActive(null)}
      onClick={() => {
        setPinned((cur) => (cur === n.id ? null : n.id));
        steer.current(n.id);
      }}
    >
      {n.label}
    </button>
  );

  return (
    <figure className={s.orb}>
      <canvas ref={canvas} className={s.canvas} role="img" aria-label={labels.title} />
      <div className={s.side}>
        <div className={s.legend}>
          {groups.map((g) => (
            <div key={g.id} className={s.group}>
              <span className={s.code} data-line={g.id}>
                {CODE[g.id] ?? g.id}
              </span>
              <span className="visually-hidden">{g.name}</span>
              <div className={s.chips}>
                {nodes.filter((n) => n.kind === "skill" && n.line === g.id).map(legendButton)}
              </div>
            </div>
          ))}
          <div className={s.group}>
            <span className={s.code} data-line="tools">
              {labels.projects}
            </span>
            <div className={s.chips}>{nodes.filter((n) => n.kind === "project").map(legendButton)}</div>
          </div>
        </div>
        <figcaption className={s.caption} aria-live="polite">
          {!shownNode ? (
            labels.hint
          ) : (
            <>
              <strong>{shownNode.label}</strong> {shownNode.kind === "skill" ? labels.usedIn : labels.uses}{" "}
              {linkedNodes.length === 0
                ? labels.nothing
                : linkedNodes.map((n, i) => (
                    <span key={n.id}>
                      {i > 0 && ", "}
                      {n.kind === "project" ? (
                        <Link prefetch={false} href={`/projects/${n.id.slice(2)}`}>
                          {n.label}
                        </Link>
                      ) : (
                        n.label
                      )}
                    </span>
                  ))}
            </>
          )}
        </figcaption>
      </div>
    </figure>
  );
}
