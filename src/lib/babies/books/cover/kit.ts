// Paper-cut kit for the cover book: SVG helpers, palette, seeded paper textures, lift shadow, timing helpers.
import type { SceneHost } from "../../types";

export const NS = "http://www.w3.org/2000/svg";
export type Attrs = Record<string, string | number | undefined>;
export type Pt = [number, number];

export function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs = {}, parent?: Element | null): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) {
    const v = attrs[k];
    if (v !== undefined) e.setAttribute(k, String(v));
  }
  if (parent) parent.appendChild(e);
  return e;
}

/** Red paper, gold accent sheet, cream ground (DevLog-007b cover recipe). */
export const PAL = { red: "#C0262D", redDeep: "#97161D", gold: "#D9A23A", goldDeep: "#A8741A", cream: "#F3ECDD", shadow: "#3a1206" };

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeOut = (x: number) => 1 - (1 - x) ** 3;
export const easeIn = (x: number) => x * x;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const r1 = (n: number) => Math.round(n * 10) / 10;

export function polyD(pts: Pt[], close = true): string {
  let d = "";
  for (let i = 0; i < pts.length; i++) d += (i ? "L" : "M") + r1(pts[i][0]) + " " + r1(pts[i][1]);
  return close ? d + "Z" : d;
}

export function circlePts(cx: number, cy: number, r: number, n = 40): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

/** 2D affine matrix [a b c d e f] as in SVG matrix(). */
export type M = [number, number, number, number, number, number];
export const I: M = [1, 0, 0, 1, 0, 0];
export function mul(A: M, B: M): M {
  return [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
}
export const mstr = (m: M) => `matrix(${m.map((v) => Math.round(v * 1e4) / 1e4).join(" ")})`;

let uid = 0;

export interface Paper {
  host: SceneHost;
  svg: SVGSVGElement;
  defs: SVGDefsElement;
  id: (n: string) => string;
  url: (n: string) => string;
  red: string;
  gold: string;
  /** A group lifted off the ground by a soft drop shadow (one cut sheet). */
  sheet: (parent: Element, attrs?: Attrs) => SVGGElement;
  destroy: () => void;
}

function texture(p: Paper, host: SceneHost, name: string, base: string, dark: string, light: string, seed: number, n: number): string {
  const S = 150;
  const pat = el("pattern", { id: p.id(name), width: S, height: S, patternUnits: "userSpaceOnUse" }, p.defs);
  el("rect", { width: S, height: S, fill: base }, pat);
  const r = host.rng(seed);
  let d1 = "";
  let d2 = "";
  let d3 = "";
  for (let i = 0; i < n; i++) {
    const x = r1(r() * (S - 3));
    const y = r1(r() * (S - 3));
    const s = r1(0.7 + r() * 1.6);
    const q = `M${x} ${y}h${s}v${r1(s * 0.8)}h${-s}z`;
    if (r() < 0.5) d1 += q;
    else d2 += q;
  }
  for (let i = 0; i < n / 8; i++) {
    const x = 8 + r() * (S - 16);
    const y = 8 + r() * (S - 16);
    const a = r() * Math.PI * 2;
    const L = 4 + r() * 7;
    d3 += `M${r1(x)} ${r1(y)}q${r1(Math.cos(a) * L * 0.5 + 1.5)} ${r1(Math.sin(a) * L * 0.5 - 1.5)} ${r1(Math.cos(a) * L)} ${r1(Math.sin(a) * L)}`;
  }
  el("path", { d: d1, fill: dark, opacity: 0.2 }, pat);
  el("path", { d: d2, fill: light, opacity: 0.22 }, pat);
  el("path", { d: d3, fill: "none", stroke: dark, "stroke-width": 0.6, opacity: 0.22 }, pat);
  return `url(#${p.id(name)})`;
}

/** Creates the SVG stage (viewBox 0..1000), defs, textures, shadow filter and the cream ground. */
export function makePaper(host: SceneHost, seed: number): Paper {
  const pre = `cvr${++uid}-`;
  const svg = el("svg", { viewBox: "0 0 1000 1000", width: "100%", height: "100%", style: "display:block;touch-action:manipulation;user-select:none" });
  const defs = el("defs", {}, svg);
  const p: Paper = {
    host,
    svg,
    defs,
    id: (n) => pre + n,
    url: (n) => `url(#${pre}${n})`,
    red: "",
    gold: "",
    sheet: (parent, attrs = {}) => el("g", { filter: p.url("lift"), ...attrs }, parent),
    destroy: () => svg.remove(),
  };
  const f = el("filter", { id: p.id("lift"), x: "-15%", y: "-15%", width: "135%", height: "135%", "color-interpolation-filters": "sRGB" }, defs);
  el("feDropShadow", { dx: 3, dy: 5, stdDeviation: 2.6, "flood-color": PAL.shadow, "flood-opacity": 0.34 }, f);
  p.red = texture(p, host, "tr", PAL.red, "#6e0d12", "#f06a62", seed, 420);
  p.gold = texture(p, host, "tg", PAL.gold, "#7a5210", "#fbe3a0", seed + 1, 420);
  const cream = texture(p, host, "tc", PAL.cream, "#8a6a3c", "#ffffff", seed + 2, 360);
  const vg = el("radialGradient", { id: p.id("vig"), cx: "50%", cy: "45%", r: "75%" }, defs);
  el("stop", { offset: "0.55", "stop-color": "#7a5530", "stop-opacity": 0 }, vg);
  el("stop", { offset: "1", "stop-color": "#7a5530", "stop-opacity": 0.16 }, vg);
  const ground = el("g", { "aria-hidden": "true" }, svg);
  el("rect", { width: 1000, height: 1000, fill: cream }, ground);
  el("rect", { width: 1000, height: 1000, fill: p.url("vig") }, ground);
  host.el.appendChild(svg);
  return p;
}
