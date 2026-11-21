"use client";

import { useMemo, useState } from "react";
import s from "./skill-graph.module.css";

export type GraphNode = { id: string; label: string; kind: "skill" | "project"; line: string };
export type GraphEdge = { from: string; to: string };

const W = 760;
const H = 420;

/** Deterministic PRNG so the layout is identical on every load (and in the static HTML). */
function rng(seed: number) {
  let x = seed;
  return () => (x = (x * 1664525 + 1013904223) >>> 0) / 4294967296;
}

/** A small force layout: repulsion between all nodes, springs on edges, gentle centring. */
function layout(nodes: GraphNode[], edges: GraphEdge[]) {
  const rand = rng(7);
  const pos = new Map(
    nodes.map((n) => [
      n.id,
      {
        x: n.kind === "project" ? W * 0.55 + rand() * 80 : W * 0.2 + rand() * W * 0.6,
        y: rand() * H,
        vx: 0,
        vy: 0,
      },
    ]),
  );
  for (let it = 0; it < 400; it++) {
    const cool = 1 - it / 400;
    for (const a of nodes) {
      const pa = pos.get(a.id)!;
      for (const b of nodes) {
        if (a === b) continue;
        const pb = pos.get(b.id)!;
        const dx = pa.x - pb.x;
        const dy = pa.y - pb.y;
        const d2 = Math.max(dx * dx + dy * dy, 25);
        const f = 9000 / d2;
        pa.vx += (dx / Math.sqrt(d2)) * f;
        pa.vy += (dy / Math.sqrt(d2)) * f;
      }
    }
    for (const e of edges) {
      const p = pos.get(e.from)!;
      const q = pos.get(e.to)!;
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const d = Math.hypot(dx, dy) || 1;
      const f = (d - 165) * 0.02;
      p.vx += (dx / d) * f;
      p.vy += (dy / d) * f;
      q.vx -= (dx / d) * f;
      q.vy -= (dy / d) * f;
    }
    for (const p of pos.values()) {
      p.vx += (W / 2 - p.x) * 0.004;
      p.vy += (H / 2 - p.y) * 0.006;
      p.x = Math.min(W - 70, Math.max(70, p.x + p.vx * cool));
      p.y = Math.min(H - 24, Math.max(24, p.y + p.vy * cool));
      p.vx *= 0.6;
      p.vy *= 0.6;
    }
  }
  return pos;
}

/**
 * Skill graph island (PLAN §7.3): skills ↔ the projects that prove them. Every node is a button,
 * so Tab walks the graph; hovering or focusing a node lights its connections and the live region
 * reads them out. The Skills section's lines above are the plain-text equivalent.
 */
export function SkillGraph({
  nodes,
  edges,
  labels,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  labels: { title: string; hint: string; connects: string; nothing: string };
}) {
  const pos = useMemo(() => layout(nodes, edges), [nodes, edges]);
  const [active, setActive] = useState<string | null>(null);
  const linked = useMemo(() => {
    if (!active) return new Set<string>();
    const set = new Set([active]);
    for (const e of edges) {
      if (e.from === active) set.add(e.to);
      if (e.to === active) set.add(e.from);
    }
    return set;
  }, [active, edges]);
  const activeNode = nodes.find((n) => n.id === active);
  const names = activeNode
    ? nodes.filter((n) => linked.has(n.id) && n.id !== active).map((n) => n.label)
    : [];

  return (
    <figure className={s.figure}>
      <svg
        className={s.svg}
        viewBox={`0 0 ${W} ${H}`}
        role="group"
        aria-label={labels.title}
        data-active={active ? "true" : undefined}
      >
        {edges.map((e) => {
          const p = pos.get(e.from)!;
          const q = pos.get(e.to)!;
          const on = !!active && linked.has(e.from) && linked.has(e.to);
          return (
            <line
              key={`${e.from}-${e.to}`}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              className={s.edge}
              data-on={on}
              data-line={nodes.find((n) => n.id === e.from)?.line}
            />
          );
        })}
        {nodes.map((n) => {
          const p = pos.get(n.id)!;
          return (
            <g
              key={n.id}
              className={s.node}
              data-kind={n.kind}
              data-line={n.line}
              data-on={!active || linked.has(n.id)}
              transform={`translate(${p.x} ${p.y})`}
              tabIndex={0}
              role="button"
              aria-pressed={active === n.id}
              aria-label={n.label}
              onPointerEnter={() => setActive(n.id)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(n.id)}
              onBlur={() => setActive(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActive((cur) => (cur === n.id ? null : n.id));
                }
              }}
            >
              {n.kind === "project" ? <rect x={-9} y={-9} width={18} height={18} rx={5} /> : <circle r={7} />}
              <text x={n.kind === "project" ? 15 : 12} y={4}>
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className={s.caption} aria-live="polite">
        {activeNode
          ? `${activeNode.label} ${labels.connects} ${names.join(", ") || labels.nothing}`
          : labels.hint}
      </figcaption>
    </figure>
  );
}
