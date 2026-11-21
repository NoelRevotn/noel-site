"use client";

import { useEffect, useRef, useState } from "react";
import type * as Three from "three";
import { DARK, settings, REDUCED } from "../settings/store";
import { withBase } from "@/lib/paths";
import { NetworkMap2D } from "./NetworkMap2D";

/**
 * Lab A's network in 3D. Each domain is a level (ML/AI on top, systems in the middle, web at
 * ground); H2Oeste is the interchange shaft joining all three. three.js loads after first paint;
 * without WebGL the 2D map renders instead. Labels are DOM text projected from 3D positions.
 */

type P = { x: number; y: number };
type Station = { name: string; at: P; built: boolean; href?: string };
type LineDef = { id: "ml" | "sys" | "web"; colorVar: string; level: number; path: P[]; stations: Station[] };

const H2O: P = { x: 0.56, y: 0.47 };
const LEVELS = { ml: 1.7, sys: 0.85, web: 0 } as const;
const LINES: LineDef[] = [
  {
    id: "ml",
    colorVar: "--line-ml",
    level: LEVELS.ml,
    path: [{ x: 0.1, y: 0.12 }, { x: 0.3, y: 0.12 }, H2O, { x: 0.82, y: 0.73 }, { x: 1.05, y: 0.73 }],
    stations: [
      { name: "GCI World", at: { x: 0.17, y: 0.12 }, built: false },
      { name: "AgenteQuery", at: { x: 0.3, y: 0.12 }, built: true, href: "/projects/agentequery" },
      { name: "DataLizer", at: { x: 0.69, y: 0.6 }, built: false, href: "/projects/datalizer" },
      { name: "Samsung AI program", at: { x: 0.94, y: 0.73 }, built: false },
    ],
  },
  {
    id: "sys",
    colorVar: "--line-sys",
    level: LEVELS.sys,
    path: [
      { x: 0.0, y: 0.7 },
      { x: 0.12, y: 0.7 },
      { x: 0.35, y: 0.47 },
      H2O,
      { x: 0.78, y: 0.25 },
      { x: 1.05, y: 0.25 },
    ],
    stations: [
      { name: "Buddy", at: { x: 0.06, y: 0.7 }, built: false, href: "/projects/buddy" },
      { name: "Presidency IT practice", at: { x: 0.94, y: 0.25 }, built: true },
    ],
  },
  {
    id: "web",
    colorVar: "--line-web",
    level: LEVELS.web,
    path: [
      { x: 0.18, y: 1.0 },
      { x: 0.18, y: 0.88 },
      { x: 0.47, y: 0.88 },
      { x: 0.56, y: 0.79 },
      H2O,
      { x: 0.56, y: 0.02 },
    ],
    stations: [
      { name: "ITINERA", at: { x: 0.32, y: 0.88 }, built: true, href: "/projects/itinera" },
      { name: "This site", at: { x: 0.56, y: 0.06 }, built: false, href: "/colophon" },
    ],
  },
];

const SPAN_X = 8;
const SPAN_Z = 5.6;
const DWELL = 0.8;
const SPEED = 0.95;
const DUST = 260;
const SEGMENTS = 180;
const RADIAL = 8;

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Give the browser a turn between build slices so no single task blocks input (Lighthouse TBT). */
const yieldToMain = () => new Promise<void>((r) => setTimeout(r, 0));

async function mount(
  THREE: typeof import("./three-subset"),
  host: HTMLElement,
  labelClass: string,
  onReady: () => void,
  isCancelled: () => boolean,
): Promise<(() => void) | null> {
  const reduced = window.matchMedia(REDUCED);
  const dark = window.matchMedia(DARK);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa6b6, 1.15));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(3, 9, 6);
  scene.add(sun);

  // One soft round sprite for every glow: train headlights, data flow, drifting dust, floors.
  const soft = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.3, "rgba(255,255,255,0.6)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();

  const css = () => getComputedStyle(host);
  const color = (name: string) => new THREE.Color(css().getPropertyValue(name).trim() || "#000");
  const toWorld = (p: P, y: number) => new THREE.Vector3((p.x - 0.5) * SPAN_X, y, (p.y - 0.5) * SPAN_Z);

  // Shared materials, recoloured on theme change.
  const mats = {
    // Ink and ground stay flat (unlit) so they read as true signage colours.
    ink: new THREE.MeshBasicMaterial(),
    ground: new THREE.MeshBasicMaterial(),
    // Floors fade out from the middle (soft sprite as the map): no hard rectangle edges.
    platform: new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      side: THREE.DoubleSide,
      map: soft,
    }),
  };
  const lineMats = LINES.map(
    () => new THREE.MeshStandardMaterial({ roughness: 0.4, transparent: true, vertexColors: true }),
  );
  // Per-line base colour and the brighter glow a passing train leaves on the track.
  const baseColors = LINES.map(() => new THREE.Color());
  const glowColors = LINES.map(() => new THREE.Color());
  const white = new THREE.Color(0xffffff);
  const windowMats = LINES.map(() => new THREE.MeshBasicMaterial());
  const carMats = LINES.map(() => new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.15 }));
  // A wide, faint tube around each line: the halo that makes the track read as lit.
  const haloMats = LINES.map(
    () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.16, depthWrite: false }),
  );
  const sprite = (size: number, opacity: number, vertexColors = false) =>
    new THREE.PointsMaterial({
      size,
      map: soft,
      transparent: true,
      opacity,
      depthWrite: false,
      vertexColors,
    });
  const lampMats = LINES.map(() => sprite(0.95, 0.95));
  const dustMat = sprite(0.11, 0.6, true);
  const pulseMats: { mat: Three.MeshBasicMaterial; line: number }[] = [];
  const flowMats: Three.PointsMaterial[] = [];
  let dustColors: Float32Array | null = null;
  let dustLine: Uint8Array | null = null;
  const applyColors = () => {
    mats.ink.color.copy(color("--ink"));
    mats.ground.color.copy(color("--ground"));
    scene.fog = new THREE.Fog(color("--ground"), 11, 26);
    mats.platform.color.copy(color("--surface"));
    // Light adds up to white on the dark theme; on the light ground glows are plain tints.
    const night = settings.get().theme === "dark";
    const blending = night ? THREE.AdditiveBlending : THREE.NormalBlending;
    LINES.forEach((l, i) => {
      const c = color(l.colorVar);
      lineMats[i]!.color.set(0xffffff); // vertex colours carry the line colour
      lineMats[i]!.emissive.copy(c).multiplyScalar(night ? 0.6 : 0.3);
      baseColors[i]!.copy(c);
      glowColors[i]!.copy(c).lerp(white, 0.7);
      flowMats[i]?.color.copy(c).lerp(white, night ? 0.45 : 0.1);
      windowMats[i]!.color.copy(c).lerp(white, 0.75);
      carMats[i]!.color.copy(c);
      carMats[i]!.emissive.copy(c).multiplyScalar(night ? 0.5 : 0.15);
      haloMats[i]!.color.copy(c);
      haloMats[i]!.opacity = night ? 0.2 : 0.12;
      lampMats[i]!.color.copy(c).lerp(white, night ? 0.5 : 0);
    });
    for (const pm of pulseMats) pm.mat.color.copy(color(LINES[pm.line]!.colorVar));
    for (const m of [...haloMats, ...lampMats, ...flowMats, dustMat]) {
      m.blending = blending;
      m.needsUpdate = true;
    }
    dustMat.opacity = night ? 0.7 : 0.45;
    if (dustColors && dustLine) {
      const cols = LINES.map((l) => color(l.colorVar));
      for (let k = 0; k < dustLine.length; k++) {
        const c = cols[dustLine[k]!]!;
        dustColors[k * 3] = c.r;
        dustColors[k * 3 + 1] = c.g;
        dustColors[k * 3 + 2] = c.b;
      }
    }
  };
  applyColors();

  const disposables: { dispose(): void }[] = [
    ...Object.values(mats),
    ...lineMats,
    ...windowMats,
    ...carMats,
    ...haloMats,
    ...lampMats,
    dustMat,
    soft,
  ];
  const track = <T extends { dispose(): void }>(g: T) => (disposables.push(g), g);

  // Level platforms: soft pools of light under each level, fading out with no edge.
  const floorGeo = track(new THREE.PlaneGeometry(SPAN_X * 1.5, SPAN_Z * 1.5));
  for (const y of Object.values(LEVELS)) {
    const floor = new THREE.Mesh(floorGeo, mats.platform);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = y - 0.08;
    scene.add(floor);
  }

  // Dust: faint motes in the line colours drifting up through the levels, so the scene breathes.
  const dustGeo = track(new THREE.BufferGeometry());
  const dustPos = new Float32Array(DUST * 3);
  const dustSpeed = new Float32Array(DUST);
  dustColors = new Float32Array(DUST * 3);
  dustLine = new Uint8Array(DUST);
  for (let k = 0; k < DUST; k++) {
    dustPos[k * 3] = (Math.random() - 0.5) * SPAN_X * 1.4;
    dustPos[k * 3 + 1] = -0.4 + Math.random() * 3.2;
    dustPos[k * 3 + 2] = (Math.random() - 0.5) * SPAN_Z * 1.4;
    dustSpeed[k] = 0.05 + Math.random() * 0.14;
    dustLine[k] = k % LINES.length;
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute("color", new THREE.BufferAttribute(dustColors, 3));
  scene.add(new THREE.Points(dustGeo, dustMat));

  // Interchange shaft through all three levels, with a platform ring at each.
  const h2o = toWorld(H2O, 0);
  const shaft = new THREE.Mesh(track(new THREE.CylinderGeometry(0.13, 0.13, LEVELS.ml, 32)), mats.ink);
  shaft.position.set(h2o.x, LEVELS.ml / 2, h2o.z);
  scene.add(shaft);
  const ringGeo = track(new THREE.TorusGeometry(0.28, 0.045, 12, 48));
  const discGeo = track(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 48));
  for (const y of Object.values(LEVELS)) {
    const disc = new THREE.Mesh(discGeo, mats.ground);
    disc.position.set(h2o.x, y, h2o.z);
    const ring = new THREE.Mesh(ringGeo, mats.ink);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(h2o.x, y + 0.03, h2o.z);
    scene.add(disc, ring);
  }

  const elevator = new THREE.Mesh(track(new THREE.TorusGeometry(0.2, 0.04, 10, 40)), mats.ink);
  elevator.rotation.x = Math.PI / 2;
  elevator.position.set(h2o.x, 0, h2o.z);
  scene.add(elevator);

  // Lines as tubes along octilinear routes with rounded corners.
  const roundedCurve = (pts: Three.Vector3[], radius = 0.45) => {
    const path = new THREE.CurvePath<Three.Vector3>();
    let prev = pts[0]!;
    for (let i = 1; i < pts.length - 1; i++) {
      const a = pts[i - 1]!;
      const b = pts[i]!;
      const c = pts[i + 1]!;
      const r = Math.min(radius, a.distanceTo(b) / 2, b.distanceTo(c) / 2);
      const p1 = b.clone().addScaledVector(b.clone().sub(a).normalize(), -r);
      const p2 = b.clone().addScaledVector(c.clone().sub(b).normalize(), r);
      path.add(new THREE.LineCurve3(prev, p1));
      path.add(new THREE.QuadraticBezierCurve3(p1, b, p2));
      prev = p2;
    }
    path.add(new THREE.LineCurve3(prev, pts[pts.length - 1]!));
    return path;
  };

  const stationGeo = track(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 32));
  const hitGeo = track(new THREE.CylinderGeometry(0.35, 0.35, 0.4, 12));
  const hollowRing = track(new THREE.TorusGeometry(0.12, 0.035, 10, 32));
  const carGeo = track(new THREE.BoxGeometry(0.15, 0.13, 0.34));
  const winGeo = track(new THREE.BoxGeometry(0.155, 0.035, 0.24));
  const pulseGeo = track(new THREE.TorusGeometry(0.16, 0.018, 8, 40));
  const pulses: { mesh: Three.Mesh; mat: Three.MeshBasicMaterial; phase: number }[] = [];

  type Train = { mesh: Three.Group; u: number; dir: 1 | -1; dwell: number; last: number };
  type StationNode = { group: Three.Group; disc: Three.Mesh; href?: string; name: string; scale: number };
  const stationNodes: StationNode[] = [];
  const buildLine = (l: LineDef, i: number) => {
    const curve = roundedCurve(l.path.map((p) => toWorld(p, l.level)));
    const tubeGeo = track(new THREE.TubeGeometry(curve, SEGMENTS, 0.06, RADIAL, false));
    tubeGeo.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(tubeGeo.attributes.position!.count * 3), 3),
    );
    const tube = new THREE.Mesh(tubeGeo, lineMats[i]);
    tube.userData.line = i;
    scene.add(tube);
    scene.add(new THREE.Mesh(track(new THREE.TubeGeometry(curve, 90, 0.17, 8, false)), haloMats[i]));
    const length = curve.getLength();
    // Arc-length positions of the stations (H2Oeste included) for dwelling.
    const samples = 120;
    const stopU = [...l.stations.map((s) => s.at), H2O].map((at) => {
      const target = toWorld(at, l.level);
      let best = 0;
      let bestD = Infinity;
      for (let k = 0; k <= samples; k++) {
        const d = curve.getPointAt(k / samples).distanceTo(target);
        if (d < bestD) {
          bestD = d;
          best = k / samples;
        }
      }
      return best;
    });
    for (const st of l.stations) {
      const pos = toWorld(st.at, l.level);
      const group = new THREE.Group();
      group.position.copy(pos);
      const disc = new THREE.Mesh(stationGeo, st.built ? mats.ink : mats.ground);
      group.add(disc);
      if (!st.built) {
        const ring = new THREE.Mesh(hollowRing, mats.ink);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.05;
        group.add(ring);
      }
      // Invisible, generous hit area: the disc itself is only a few pixels on screen.
      const hit = new THREE.Mesh(hitGeo, mats.ink);
      hit.visible = false;
      hit.userData.station = stationNodes.length;
      group.add(hit);
      stationNodes.push({ group, disc: hit, href: st.href, name: st.name, scale: 1 });
      scene.add(group);
      // Project stations send out a slow ring, like a live signal.
      if (st.href) {
        const mat = track(new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }));
        pulseMats.push({ mat, line: i });
        const ring = new THREE.Mesh(pulseGeo, mat);
        ring.rotation.x = Math.PI / 2;
        ring.position.copy(pos).setY(pos.y + 0.02);
        scene.add(ring);
        pulses.push({ mesh: ring, mat, phase: pulses.length * 0.37 });
      }
    }
    // Two-car trains in the line colour with lit windows; a headlight glow rides in front.
    const trains: Train[] = [0.15, 0.7].map((u, k) => {
      const g = new THREE.Group();
      for (const z of [0, -0.38]) {
        const car = new THREE.Mesh(carGeo, carMats[i]);
        car.position.z = z;
        const win = new THREE.Mesh(winGeo, windowMats[i]);
        win.position.set(0, 0.02, z);
        g.add(car, win);
      }
      scene.add(g);
      return { mesh: g, u, dir: k ? -1 : 1, dwell: 0, last: -1 };
    });
    const lampGeo = track(new THREE.BufferGeometry());
    lampGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(trains.length * 3), 3));
    scene.add(new THREE.Points(lampGeo, lampMats[i]));
    const flowCount = 30;
    const flowGeo = track(new THREE.BufferGeometry());
    flowGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(flowCount * 3), 3));
    const flowMat = track(
      new THREE.PointsMaterial({ size: 0.2, map: soft, transparent: true, opacity: 0.9, depthWrite: false }),
    );
    flowMats.push(flowMat);
    scene.add(new THREE.Points(flowGeo, flowMat));
    const flowU = Array.from({ length: flowCount }, (_, k) => k / flowCount);
    return { curve, tube, tubeGeo, length, stopU, trains, index: i, flowGeo, flowU, lampGeo };
  };
  const lines: ReturnType<typeof buildLine>[] = [];
  for (const [i, l] of LINES.entries()) {
    await yieldToMain();
    if (isCancelled()) {
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      return null;
    }
    lines.push(buildLine(l, i));
  }
  await yieldToMain();

  applyColors(); // again, now that the per-line flow materials exist

  // DOM labels, projected every frame.
  const labelLayer = document.createElement("div");
  labelLayer.style.cssText = "position:absolute;inset:0;pointer-events:none";
  host.appendChild(labelLayer);
  const labels: { el: HTMLSpanElement; pos: Three.Vector3; name: string }[] = [];
  const go = (href: string) => {
    const lang = document.documentElement.lang || "en";
    window.location.href = withBase(`/${lang}${href}/`);
  };
  const addLabel = (text: string, pos: Three.Vector3, big = false, href?: string) => {
    const el = document.createElement("span");
    el.className = labelClass;
    if (big) el.dataset.big = "true";
    if (href) {
      el.dataset.link = "true";
      el.addEventListener("click", () => go(href));
    }
    el.textContent = text;
    labelLayer.appendChild(el);
    labels.push({ el, pos, name: text });
  };
  LINES.forEach((l) =>
    l.stations.forEach((s) => addLabel(s.name, toWorld(s.at, l.level + 0.22), false, s.href)),
  );
  addLabel("H2Oeste", toWorld(H2O, LEVELS.ml + 0.5), true, "/projects/h2oeste");

  // Camera rig: slow idle drift plus pointer tilt; pointer near a tube isolates that line.
  const target = new THREE.Vector3(0.55, 0.7, 0.1);
  const ndc = new THREE.Vector2(9, 9);
  let pointerIn = false;
  const ray = new THREE.Raycaster();
  ray.params.Mesh = {};
  let focus = -1;
  let focusMix = 0;
  let w = 1;
  let h = 1;
  let t = 0;
  const orbit = { az: THREE.MathUtils.degToRad(-32), pol: THREE.MathUtils.degToRad(54), vAz: 0, vPol: 0 };
  const POL_MIN = THREE.MathUtils.degToRad(8);
  const POL_MAX = THREE.MathUtils.degToRad(165);
  let drag: { x: number; y: number; moved: number; id: number } | null = null;
  let last = 0;
  let raf = 0;
  let onScreen = true;
  const tmp = new THREE.Vector3();
  let hovered: StationNode | null = null;

  const placeCamera = () => {
    const narrow = w / h < 1.1;
    // Static unless the visitor drags: azimuth wraps a full 360°, elevation stays above/below the deck.
    const radius = narrow ? 15 : 11.6;
    const az = orbit.az;
    const pol = orbit.pol;
    camera.position.set(
      target.x + radius * Math.sin(pol) * Math.sin(az),
      target.y + radius * Math.cos(pol),
      target.z + radius * Math.sin(pol) * Math.cos(az),
    );
    camera.lookAt(target);
  };

  const step = (dt: number) => {
    lines.forEach((ln) => {
      for (const tr of ln.trains) {
        if (dt > 0) {
          if (tr.dwell > 0) tr.dwell -= dt;
          else {
            tr.u += (tr.dir * SPEED * dt) / ln.length;
            if (tr.u > 0.97 || tr.u < 0.03) {
              tr.dir = tr.u > 0.5 ? -1 : 1;
              tr.u = Math.min(0.97, Math.max(0.03, tr.u));
              tr.last = -1;
            }
            ln.stopU.forEach((su, k) => {
              if (k !== tr.last && Math.abs(tr.u - su) < (SPEED * dt) / ln.length + 0.001) {
                tr.u = su;
                tr.dwell = DWELL;
                tr.last = k;
              }
            });
          }
        }
        const pos = ln.curve.getPointAt(tr.u);
        const tan = ln.curve.getTangentAt(tr.u);
        tr.mesh.position.copy(pos).setY(pos.y + 0.12);
        tr.mesh.lookAt(tmp.copy(tr.mesh.position).addScaledVector(tan, tr.dir));
      }
      // Headlights: a glow just ahead of the lead car of each train.
      const lamp = ln.lampGeo.attributes.position!.array as Float32Array;
      ln.trains.forEach((tr, k) => {
        const ahead = Math.min(0.999, Math.max(0, tr.u + (tr.dir * 0.22) / ln.length));
        ln.curve.getPointAt(ahead, tmp);
        lamp[k * 3] = tmp.x;
        lamp[k * 3 + 1] = tmp.y + 0.12;
        lamp[k * 3 + 2] = tmp.z;
      });
      ln.lampGeo.attributes.position!.needsUpdate = true;
    });

    // Drifting dust, wrapping back to the floor.
    if (dt > 0) {
      for (let k = 0; k < DUST; k++) {
        const y = dustPos[k * 3 + 1]! + dustSpeed[k]! * dt;
        dustPos[k * 3 + 1] = y > 2.9 ? -0.4 : y;
        dustPos[k * 3] = dustPos[k * 3]! + Math.sin(t * 0.3 + k) * 0.04 * dt;
      }
      dustGeo.attributes.position!.needsUpdate = true;
    }
    dustGeo.attributes.color!.needsUpdate = true;

    // Station signals: rings that grow and fade every few seconds.
    for (const pu of pulses) {
      const f = (t * 0.42 + pu.phase) % 1;
      pu.mesh.scale.setScalar(1 + f * 2.2);
      pu.mat.opacity = 0.7 * (1 - f) * (1 - f);
    }

    // Train glow: a colour gradient along the track, brightest just behind each train.
    for (const ln of lines) {
      const attr = ln.tubeGeo.attributes.color as Three.BufferAttribute;
      const arr = attr.array as Float32Array;
      const base = baseColors[ln.index]!;
      const glow = glowColors[ln.index]!;
      for (let r = 0; r <= SEGMENTS; r++) {
        const u = r / SEGMENTS;
        let k = 0;
        for (const tr of ln.trains) {
          // Signed distance along the line, positive behind the train's direction of travel.
          const d = (tr.u - u) * ln.length * tr.dir;
          const v = d >= 0 ? Math.exp(-d / 0.9) * (d < 2.6 ? 1 : 0) : Math.exp(d / 0.22);
          if (v > k) k = v;
        }
        const cr = base.r + (glow.r - base.r) * k;
        const cg = base.g + (glow.g - base.g) * k;
        const cb = base.b + (glow.b - base.b) * k;
        for (let j = 0; j <= RADIAL; j++) {
          const o = (r * (RADIAL + 1) + j) * 3;
          arr[o] = cr;
          arr[o + 1] = cg;
          arr[o + 2] = cb;
        }
      }
      attr.needsUpdate = true;
    }

    // Data flow along each line.
    for (const ln of lines) {
      const arr = ln.flowGeo.attributes.position!.array as Float32Array;
      for (let k = 0; k < ln.flowU.length; k++) {
        if (dt > 0) ln.flowU[k] = (ln.flowU[k]! + (0.9 * dt) / ln.length) % 1;
        ln.curve.getPointAt(ln.flowU[k]!, tmp);
        arr[k * 3] = tmp.x;
        arr[k * 3 + 1] = tmp.y + 0.075;
        arr[k * 3 + 2] = tmp.z;
      }
      ln.flowGeo.attributes.position!.needsUpdate = true;
    }

    // Elevator between the three levels of the interchange.
    elevator.position.y = (0.5 - 0.5 * Math.cos(t * 0.55)) * LEVELS.ml;

    // Station hover: grow on a spring-like ease; project stations open their page on click.
    let hoverStation = -1;
    if (pointerIn) {
      ray.setFromCamera(ndc, camera);
      const s = ray.intersectObjects(
        stationNodes.map((n) => n.disc),
        false,
      )[0];
      if (s) hoverStation = s.object.userData.station as number;
    }
    hovered = hoverStation >= 0 ? stationNodes[hoverStation]! : null;
    for (const [k, n] of stationNodes.entries()) {
      const goal = k === hoverStation ? 1.6 : 1;
      n.scale += (goal - n.scale) * (dt > 0 ? Math.min(1, dt * 12) : 1);
      n.group.scale.setScalar(n.scale);
    }
    for (const l of labels) l.el.dataset.active = String(!!hovered && l.name === hovered.name);

    // Isolation by raycast against the tubes.
    let hit = -1;
    if (pointerIn) {
      ray.setFromCamera(ndc, camera);
      ray.params.Line = { threshold: 0.1 };
      const found = ray.intersectObjects(
        lines.map((l) => l.tube),
        false,
      )[0];
      if (found) hit = found.object.userData.line as number;
    }
    if (hit >= 0) focus = hit;
    focusMix += ((hit >= 0 ? 1 : 0) - focusMix) * (dt > 0 ? Math.min(1, dt * 8) : 1);
    lineMats.forEach((m, i) => {
      m.opacity = focus >= 0 && i !== focus ? 1 - 0.8 * focusMix : 1;
    });
    host.dataset.overStation = String(!!hovered?.href);
  };

  const render = () => {
    placeCamera();
    renderer.render(scene, camera);
    for (const { el, pos } of labels) {
      tmp.copy(pos).project(camera);
      const visible = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1;
      el.style.opacity = visible ? "1" : "0";
      el.style.transform = `translate(${((tmp.x + 1) / 2) * w}px, ${((1 - tmp.y) / 2) * h}px) translate(-50%, -100%)`;
    }
  };

  const running = () => onScreen && !document.hidden && !settings.get().paused && !reduced.matches;
  const tick = (now: number) => {
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    t += dt;
    // Momentum after a drag (skipped under reduced motion).
    if (!drag && (orbit.vAz || orbit.vPol)) {
      orbit.az += orbit.vAz * dt;
      orbit.pol = Math.min(POL_MAX, Math.max(POL_MIN, orbit.pol + orbit.vPol * dt));
      const decay = Math.exp(-dt * 4);
      orbit.vAz = Math.abs(orbit.vAz * decay) < 0.01 ? 0 : orbit.vAz * decay;
      orbit.vPol = Math.abs(orbit.vPol * decay) < 0.01 ? 0 : orbit.vPol * decay;
    }
    step(dt);
    render();
    raf = requestAnimationFrame(tick);
  };
  const sync = () => {
    cancelAnimationFrame(raf);
    last = 0;
    if (running()) raf = requestAnimationFrame(tick);
    else {
      step(0);
      render();
    }
  };

  const resize = () => {
    w = host.clientWidth || 1;
    h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    // Wide screens: render the left part of a wider frame, so the network sits right of centre
    // and the headline keeps the left side.
    const shift = w / h >= 1.1 ? 1.4 : 1;
    camera.aspect = (w * shift) / h;
    if (shift > 1) camera.setViewOffset(w * shift, h, 0, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    if (!running()) render();
  };
  const redraw = () => {
    if (!running()) {
      step(0);
      render();
    }
  };
  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    pointerIn = e.pointerType === "mouse" && x >= 0 && x <= 1 && y >= 0 && y <= 1;
    ndc.set(x * 2 - 1, -(y * 2 - 1));
    if (drag && e.pointerId === drag.id) {
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      const k = (Math.PI * 1.6) / Math.max(w, 1); // ~a full turn across 1.25 map widths
      orbit.az -= dx * k;
      orbit.pol = Math.min(POL_MAX, Math.max(POL_MIN, orbit.pol - dy * k));
      orbit.vAz = reduced.matches ? 0 : (-dx * k) / 0.016;
      orbit.vPol = reduced.matches ? 0 : (-dy * k) / 0.016;
      host.dataset.dragging = "true";
    }
    redraw();
  };
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, moved: 0, id: e.pointerId };
    orbit.vAz = 0;
    orbit.vPol = 0;
    host.setPointerCapture(e.pointerId);
  };
  const onUp = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    const wasClick = drag.moved < 6;
    drag = null;
    delete host.dataset.dragging;
    host.dataset.explored = "true";
    if (wasClick && hovered?.href) go(hovered.href);
    if (!running()) sync();
  };
  // Keyboard parity: arrow keys orbit; Home resets the view.
  const onKey = (e: KeyboardEvent) => {
    const turn = THREE.MathUtils.degToRad(e.shiftKey ? 30 : 10);
    if (e.key === "ArrowLeft") orbit.az += turn;
    else if (e.key === "ArrowRight") orbit.az -= turn;
    else if (e.key === "ArrowUp") orbit.pol = Math.max(POL_MIN, orbit.pol - turn);
    else if (e.key === "ArrowDown") orbit.pol = Math.min(POL_MAX, orbit.pol + turn);
    else if (e.key === "Home") {
      orbit.az = THREE.MathUtils.degToRad(-32);
      orbit.pol = THREE.MathUtils.degToRad(54);
    } else return;
    e.preventDefault();
    host.dataset.explored = "true";
    redraw();
  };
  const onTheme = () =>
    requestAnimationFrame(() => {
      applyColors();
      if (!running()) render();
    });

  // Compile shaders asynchronously before the first visible frame (avoids one long main-thread task).
  try {
    await renderer.compileAsync(scene, camera);
  } catch {
    // Older drivers: fall back to compiling on first render.
  }
  if (isCancelled()) {
    disposables.forEach((d) => d.dispose());
    renderer.dispose();
    renderer.domElement.remove();
    labelLayer.remove();
    return null;
  }
  const ro = new ResizeObserver(resize);
  const io = new IntersectionObserver(([e]) => {
    onScreen = !!e?.isIntersecting;
    sync();
  });
  ro.observe(host);
  io.observe(host);
  const unsub = settings.subscribe(() => {
    onTheme();
    sync();
  });
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  dark.addEventListener("change", onTheme);
  host.addEventListener("pointerdown", onDown);
  host.addEventListener("pointerup", onUp);
  host.addEventListener("pointercancel", onUp);
  host.addEventListener("keydown", onKey);
  window.addEventListener("pointermove", onMove, { passive: true });
  resize();
  sync();
  onReady();

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    unsub();
    document.removeEventListener("visibilitychange", sync);
    reduced.removeEventListener("change", sync);
    dark.removeEventListener("change", onTheme);
    window.removeEventListener("pointermove", onMove);
    host.removeEventListener("pointerdown", onDown);
    host.removeEventListener("pointerup", onUp);
    host.removeEventListener("pointercancel", onUp);
    host.removeEventListener("keydown", onKey);
    disposables.forEach((d) => d.dispose());
    renderer.dispose();
    renderer.domElement.remove();
    labelLayer.remove();
  };
}

export function NetworkMap3D({
  className,
  labelClassName,
  fallbackClassName,
  hintClassName,
  labels = {
    role: "interactive 3D map",
    label:
      "Map of my work: ML/AI, systems and web lines meeting at H2Oeste. Drag or use the arrow keys to rotate.",
    hint: "Drag to explore",
  },
}: {
  className?: string;
  labelClassName?: string;
  fallbackClassName?: string;
  hintClassName?: string;
  labels?: { role: string; label: string; hint: string };
}) {
  const host = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"loading" | "3d" | "2d">("loading");

  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;
    if (!webglAvailable()) {
      Promise.resolve().then(() => !cancelled && setMode("2d"));
      return () => {
        cancelled = true;
      };
    }
    // Start only after the page has loaded and the browser is idle, so the 3D map never competes
    // with first paint or input readiness (Lighthouse TBT); the text is usable immediately.
    const idle = new Promise<void>((resolve) => {
      const go = () =>
        "requestIdleCallback" in window
          ? window.requestIdleCallback(() => resolve(), { timeout: 2500 })
          : setTimeout(resolve, 300);
      if (document.readyState === "complete") go();
      else window.addEventListener("load", go, { once: true });
    });
    idle
      .then(() => import("./three-subset"))
      .then(async (THREE) => {
        if (cancelled || !host.current) return;
        const dispose = await mount(
          THREE,
          host.current,
          labelClassName ?? "",
          () => setMode("3d"),
          () => cancelled,
        );
        if (dispose) {
          if (cancelled) dispose();
          else cleanup = dispose;
        }
      });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [labelClassName]);

  if (mode === "2d") return <NetworkMap2D className={fallbackClassName} />;
  return (
    <div
      ref={host}
      className={className}
      data-ready={mode === "3d"}
      role="img"
      tabIndex={0}
      aria-roledescription={labels.role}
      aria-label={labels.label}
      data-cursor={labels.hint.split(" ")[0]}
      data-cursor-frame="none"
    >
      <span className={hintClassName} aria-hidden="true">
        {labels.hint}
      </span>
    </div>
  );
}
