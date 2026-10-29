// Constructivist print kit for the Devices book (after the method of El Lissitzky's 1922 "About Two Squares"):
// flat primitives on diagonals, red / black / cream, letterpress speckle and a slightly misregistered red plate.
import type { SceneHost } from "../../types";

export const NS = "http://www.w3.org/2000/svg";
export type Attrs = Record<string, string | number | undefined>;
export type Pt = [number, number];

/** DevLog-007b sec. 06 palette. */
export const PAL = { red: "#D7262B", black: "#141414", cream: "#F2EBDD", gray: "#8C8C8C" };
/** Red plate offset (letterpress misregistration), logical units (about 1 px on a 600 px stage). */
export const MISREG = "translate(1.9 -1.3)";

export function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs = {}, parent?: Element | null): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) {
    const v = attrs[k];
    if (v !== undefined) e.setAttribute(k, String(v));
  }
  if (parent) parent.appendChild(e);
  return e;
}

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const easeOut = (x: number) => 1 - (1 - x) ** 3;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
export const r1 = (n: number) => Math.round(n * 10) / 10;
export const D2R = Math.PI / 180;

export function polyD(pts: Pt[], close = true): string {
  let d = "";
  for (let i = 0; i < pts.length; i++) d += (i ? "L" : "M") + r1(pts[i][0]) + " " + r1(pts[i][1]);
  return close ? d + "Z" : d;
}

/** Rotate point p about c by deg (SVG sense: positive = clockwise on screen). */
export function rot(p: Pt, c: Pt, deg: number): Pt {
  const a = deg * D2R;
  const x = p[0] - c[0];
  const y = p[1] - c[1];
  return [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)];
}

/** Zigzag (triangle wave) centerline from x0 to x1 at y, period P, amplitude A, phase in periods. */
export function zigzag(x0: number, x1: number, y: number, P: number, A: number, phase = 0): Pt[] {
  const pts: Pt[] = [];
  const f = (x: number) => {
    let u = ((x - x0) / P + phase) % 1;
    if (u < 0) u += 1;
    const tri = u < 0.25 ? u * 4 : u < 0.75 ? 2 - u * 4 : u * 4 - 4;
    return y - A * tri;
  };
  pts.push([x0, f(x0)]);
  // corners of the triangle wave sit at u = 0.25 + 0.5 m
  for (let m = Math.floor((phase - 0.25) / 0.5); ; m++) {
    const x = x0 + (0.25 + 0.5 * m - phase) * P;
    if (x <= x0) continue;
    if (x >= x1) break;
    pts.push([x, f(x)]);
  }
  pts.push([x1, f(x1)]);
  return pts;
}

export interface Stage {
  host: SceneHost;
  svg: SVGSVGElement;
  /** Art group (below the speckle overlay). */
  art: SVGGElement;
  /** Transparent hit layer on top of everything. */
  hit: SVGGElement;
  destroy: () => void;
}

let uid = 0;

/** SVG stage 0..1000 with cream paper, art group, static letterpress speckle on top, and a hit layer above it. */
export function makeStage(host: SceneHost, seed: number): Stage {
  const pre = `dev${++uid}-`;
  const svg = el("svg", { viewBox: "0 0 1000 1000", width: "100%", height: "100%", style: "display:block;touch-action:manipulation;user-select:none;-webkit-user-select:none" });
  const defs = el("defs", {}, svg);
  const r = host.rng(seed);
  // paper fibre: faint darker flecks on the cream
  const S = 170;
  const paper = el("pattern", { id: pre + "pp", width: S, height: S, patternUnits: "userSpaceOnUse" }, defs);
  el("rect", { width: S, height: S, fill: PAL.cream }, paper);
  let fd = "";
  for (let i = 0; i < 70; i++) {
    const x = r1(r() * S);
    const y = r1(r() * S);
    const a = r() * Math.PI;
    const L = 2 + r() * 5;
    fd += `M${x} ${y}l${r1(Math.cos(a) * L)} ${r1(Math.sin(a) * L)}`;
  }
  el("path", { d: fd, stroke: "#6b5a3e", "stroke-width": 0.7, opacity: 0.18, fill: "none" }, paper);
  // ink speckle: cream specks where the type did not take ink (~4 % of the area), plus a few starved streaks
  const ink = el("pattern", { id: pre + "sp", width: S, height: S, patternUnits: "userSpaceOnUse" }, defs);
  let sd = "";
  for (let i = 0; i < 150; i++) {
    const x = r1(r() * (S - 3));
    const y = r1(r() * (S - 3));
    const w = r1(0.7 + r() * 1.6);
    const h = r1(0.6 + r() * 1.3);
    sd += `M${x} ${y}h${w}v${h}h${-w}z`;
  }
  let st = "";
  for (let i = 0; i < 4; i++) {
    const x = r1(r() * S);
    const y = r1(r() * S);
    st += `M${x} ${y}h${r1(8 + r() * 16)}`;
  }
  el("path", { d: sd, fill: PAL.cream, opacity: 0.8 }, ink);
  el("path", { d: st, stroke: PAL.cream, "stroke-width": 0.9, opacity: 0.55, fill: "none" }, ink);
  el("rect", { width: 1000, height: 1000, fill: `url(#${pre}pp)`, "aria-hidden": "true" }, svg);
  const art = el("g", { "aria-hidden": "true" }, svg);
  el("rect", { width: 1000, height: 1000, fill: `url(#${pre}sp)`, "pointer-events": "none", "aria-hidden": "true" }, svg);
  const hit = el("g", {}, svg);
  host.el.appendChild(svg);
  return { host, svg, art, hit, destroy: () => svg.remove() };
}

/** Filled red shape on the misregistered red plate. */
export function red<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs, parent: Element): SVGElementTagNameMap[K] {
  return el(tag, { fill: PAL.red, transform: MISREG, ...attrs }, parent);
}

/** Progress of an event that started at t0 and lasts dur; reduced motion jumps to the end. */
export function prog(host: SceneHost, t: number, t0: number, dur: number): number {
  if (t < t0) return 0;
  if (host.reduced || dur <= 0) return 1;
  return clamp01((t - t0) / dur);
}

/** Fly-in transform: from an offset of `dist` along angle `deg` (screen degrees) to rest, ease-out. */
export function fly(p: number, deg: number, dist: number): string {
  const k = (1 - easeOut(p)) * dist;
  return `translate(${r1(Math.cos(deg * D2R) * k)} ${r1(Math.sin(deg * D2R) * k)})`;
}
