// Isometric instruction-manual kit for the Making book: SVG helpers, iso projection, solids drawn in painter's order,
// chunky step arrows, numbered step discs, heat squiggles, and the page scaffold with the lettered caption band.
// Recipe (DevLog-007b, 05 Making): uniform 3 px #111 lines on white, top faces #D9D9D9, sides white, one accent
// #E4572E for the active agent (heat, ions, field). Projection x'=(x-y)cos30, y'=(x+y)sin30-z.
import type { SceneHost } from "../../types";
import { lineD, measure, wrap, STROKE } from "./letters";

export const NS = "http://www.w3.org/2000/svg";
export type Attrs = Record<string, string | number | undefined>;
export type Pt = [number, number];
export type V3 = [number, number, number];

export const INK = "#111111";
export const TOP = "#D9D9D9";
export const SIDE = "#FFFFFF";
export const MID = "#B9B9B9";
export const DARK = "#8C8C8C";
export const ACC = "#E4572E";
export const ACC_T = "#F7C9B8";
export const GOLD = "#D9A93B";
export const GLASS = "#E8F1F4";
export const LW = 3;

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
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const easeOut = (x: number) => 1 - (1 - x) ** 3;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
export const easeBack = (x: number) => 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2;
const r1 = (n: number) => Math.round(n * 10) / 10;

export function polyD(pts: Pt[], close = true): string {
  let d = "";
  for (let i = 0; i < pts.length; i++) d += (i ? "L" : "M") + r1(pts[i][0]) + " " + r1(pts[i][1]);
  return close ? d + "Z" : d;
}

/** Filled outlined polygon in manual line weight. */
export function poly(g: Element, pts: Pt[], fill: string, a: Attrs = {}): SVGPathElement {
  return el("path", { d: polyD(pts), fill, stroke: INK, "stroke-width": LW, "stroke-linejoin": "round", ...a }, g);
}
export function line(g: Element, pts: Pt[], a: Attrs = {}): SVGPathElement {
  return el("path", { d: polyD(pts, false), fill: "none", stroke: INK, "stroke-width": LW, "stroke-linejoin": "round", "stroke-linecap": "round", ...a }, g);
}

/** Isometric camera: origin on screen and world scale. Viewer sits toward +x,+y,+z; depth = x+y+z. */
export class Iso {
  ox: number;
  oy: number;
  k: number;
  constructor(ox: number, oy: number, k = 1) {
    this.ox = ox;
    this.oy = oy;
    this.k = k;
  }
  p(x: number, y: number, z: number): Pt {
    return [this.ox + (x - y) * 0.8660254 * this.k, this.oy + ((x + y) * 0.5 - z) * this.k];
  }
  v(q: V3): Pt {
    return this.p(q[0], q[1], q[2]);
  }
}

/** Circle of radius r around centre c, normal along axis, projected. */
export function ring(iso: Iso, c: V3, r: number, axis: "x" | "y" | "z", n = 44): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const u = r * Math.cos(a);
    const w = r * Math.sin(a);
    if (axis === "z") out.push(iso.p(c[0] + u, c[1] + w, c[2]));
    else if (axis === "x") out.push(iso.p(c[0], c[1] + u, c[2] + w));
    else out.push(iso.p(c[0] + u, c[1], c[2] + w));
  }
  return out;
}

/** Convex hull (monotone chain). */
export function hull(pts: Pt[]): Pt[] {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: Pt[] = [];
  for (const q of p) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  const up: Pt[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

/** Axis-aligned box from corner q (min x,y,z) with size s. Visible faces: +x, +y, +z. */
export function box(g: Element, iso: Iso, q: V3, s: V3, fills: { top?: string; x?: string; y?: string } = {}, a: Attrs = {}): void {
  const [x, y, z] = q;
  const [X, Y, Z] = [x + s[0], y + s[1], z + s[2]];
  poly(g, [iso.p(X, y, z), iso.p(X, Y, z), iso.p(X, Y, Z), iso.p(X, y, Z)], fills.x ?? SIDE, a);
  poly(g, [iso.p(x, Y, z), iso.p(X, Y, z), iso.p(X, Y, Z), iso.p(x, Y, Z)], fills.y ?? SIDE, a);
  poly(g, [iso.p(x, y, Z), iso.p(X, y, Z), iso.p(X, Y, Z), iso.p(x, Y, Z)], fills.top ?? TOP, a);
}

/** Cylinder from base centre c along +axis, radius r, length len; the +axis cap is the visible one. */
export function cyl(g: Element, iso: Iso, c: V3, axis: "x" | "z", r: number, len: number, side = SIDE, cap = TOP, a: Attrs = {}): Pt[] {
  const e: V3 = axis === "x" ? [c[0] + len, c[1], c[2]] : [c[0], c[1], c[2] + len];
  const r0 = ring(iso, c, r, axis);
  const r2 = ring(iso, e, r, axis);
  poly(g, hull(r0.concat(r2)), side, a);
  poly(g, r2, cap, a);
  return r2;
}

/** Chunky manual step arrow from a to b (screen), shaft width w. */
export function bigArrow(g: Element, a: Pt, b: Pt, w = 30, fill = INK, at: Attrs = {}): SVGPathElement {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L;
  const uy = dy / L;
  const nx = -uy;
  const ny = ux;
  const hl = Math.min(L * 0.55, w * 1.6);
  const hw = w * 1.05;
  const s = w / 2;
  const m: Pt = [b[0] - ux * hl, b[1] - uy * hl];
  return poly(g, [[a[0] + nx * s, a[1] + ny * s], [m[0] + nx * s, m[1] + ny * s], [m[0] + nx * hw, m[1] + ny * hw], b, [m[0] - nx * hw, m[1] - ny * hw], [m[0] - nx * s, m[1] - ny * s], [a[0] - nx * s, a[1] - ny * s]], fill, at);
}

/** Open stroke along pts with a filled arrowhead at the end. `frac` draws only the first part (0..1). */
export function pathArrow(g: Element, pts: Pt[], color = INK, w = 5, head = 20, frac = 1): void {
  if (frac <= 0 || pts.length < 2) return;
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const T = lens[lens.length - 1] * Math.min(1, frac);
  const cut: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (lens[i] <= T) cut.push(pts[i]);
    else {
      const f = (T - lens[i - 1]) / (lens[i] - lens[i - 1] || 1);
      cut.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]);
      break;
    }
  }
  const b = cut[cut.length - 1];
  let k = cut.length - 2;
  while (k > 0 && Math.hypot(b[0] - cut[k][0], b[1] - cut[k][1]) < head * 0.6) k--;
  const a = cut[k];
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const ux = (b[0] - a[0]) / L;
  const uy = (b[1] - a[1]) / L;
  const base: Pt = [b[0] - ux * head * 0.6, b[1] - uy * head * 0.6];
  const shaft = cut.slice(0, -1).concat([base]);
  el("path", { d: polyD(shaft, false), fill: "none", stroke: color, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
  const tip: Pt = [b[0] + ux * head * 0.4, b[1] + uy * head * 0.4];
  el("path", { d: polyD([tip, [base[0] - uy * head * 0.55, base[1] + ux * head * 0.55], [base[0] + uy * head * 0.55, base[1] - ux * head * 0.55]]), fill: color, stroke: color, "stroke-width": 2, "stroke-linejoin": "round" }, g);
}

/** Numbered step disc (manual style), digit lettered procedurally. */
export function stepDisc(g: Element, x: number, y: number, n: number, r = 32): void {
  el("circle", { cx: x, cy: y, r, fill: "#fff", stroke: INK, "stroke-width": LW + 1 }, g);
  const xh = r * 0.62;
  const s = String(n);
  const w = measure(s, xh);
  el("path", { d: lineD(s, x - w / 2, y + xh * 0.7, xh), fill: "none", stroke: INK, "stroke-width": r1(STROKE * xh * 0.24), "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
}

/** Rising heat squiggle (accent), from (x,y) upward, height h; phase shifts the wiggle. */
export function heat(g: Element, x: number, y: number, h: number, phase = 0, a: Attrs = {}): void {
  const pts: Pt[] = [];
  for (let i = 0; i <= 16; i++) {
    const f = i / 16;
    pts.push([x + Math.sin(f * Math.PI * 3 + phase) * 9, y - f * h]);
  }
  el("path", { d: polyD(pts, false), fill: "none", stroke: ACC, "stroke-width": 6, "stroke-linecap": "round", ...a }, g);
}

/** Magnifier callout: circle with a white face; returns a clipped group to draw the zoomed content in. */
export function callout(g: Element, id: string, cx: number, cy: number, r: number, from?: Pt): SVGGElement {
  if (from) {
    const d = Math.hypot(from[0] - cx, from[1] - cy);
    const ux = (from[0] - cx) / d;
    const uy = (from[1] - cy) / d;
    line(g, [[cx + ux * r, cy + uy * r], from], { "stroke-dasharray": "2 10", "stroke-width": 5 });
  }
  const cp = el("clipPath", { id }, g);
  el("circle", { cx, cy, r }, cp);
  el("circle", { cx, cy, r, fill: "#fff" }, g);
  const inner = el("g", { "clip-path": `url(#${id})` }, g);
  return inner;
}
export function calloutRim(g: Element, cx: number, cy: number, r: number): void {
  el("circle", { cx, cy, r, fill: "none", stroke: INK, "stroke-width": LW + 2 }, g);
}

let uid = 0;

export interface Stage {
  host: SceneHost;
  svg: SVGSVGElement;
  art: SVGGElement;
  id: (n: string) => string;
  /** Pointer position in logical units. */
  pos: (e: PointerEvent) => Pt;
  destroy: () => void;
}

/** Caption band: x-height 32 (>= 30 at a 320 px stage), centred lines, band below y = 770. */
export const CAP = { top: 770, xh: 32, lineH: 66, maxW: 900 };

/** `lines` optionally fixes the line breaks (each must join back to exactly `text`). */
export function makeStage(host: SceneHost, text: string, lines0?: string[]): Stage {
  const pre = `mk${++uid}-`;
  const svg = el("svg", { viewBox: "0 0 1000 1000", width: "100%", height: "100%", style: "display:block;touch-action:none;user-select:none;-webkit-user-select:none" });
  el("rect", { width: 1000, height: 1000, fill: "#FFFFFF" }, svg);
  const art = el("g", { "aria-hidden": "true" }, svg);
  const cap = el("g", { "aria-hidden": "true" }, svg);
  el("path", { d: `M40 ${CAP.top}H960`, stroke: INK, "stroke-width": 2 }, cap);
  const lines = lines0 && lines0.join(" ") === text ? lines0 : wrap(text, CAP.maxW, CAP.xh);
  const block = (lines.length - 1) * CAP.lineH + CAP.xh * 1.4;
  const y0 = CAP.top + (1000 - CAP.top - block) / 2 + CAP.xh * 1.4 + 4;
  let d = "";
  lines.forEach((s, i) => {
    const w = measure(s, CAP.xh);
    d += lineD(s, 500 - w / 2, y0 + i * CAP.lineH, CAP.xh);
  });
  el("path", { d, fill: "none", stroke: INK, "stroke-width": r1((STROKE * CAP.xh) / 5), "stroke-linecap": "round", "stroke-linejoin": "round" }, cap);
  host.el.appendChild(svg);
  return {
    host,
    svg,
    art,
    id: (n) => pre + n,
    pos: (e) => {
      const r = svg.getBoundingClientRect();
      return [((e.clientX - r.left) / (r.width || 1)) * 1000, ((e.clientY - r.top) / (r.height || 1)) * 1000];
    },
    destroy: () => svg.remove(),
  };
}

/** Group whose children are rebuilt every frame. */
export function layer(parent: Element): { g: SVGGElement; clear: () => SVGGElement } {
  const g = el("g", {}, parent);
  return {
    g,
    clear: () => {
      g.replaceChildren();
      return g;
    },
  };
}
