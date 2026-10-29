// Procedural geometric sans for Isotype-style lettering: monoline strokes built from straight lines and
// circle / ellipse arcs (true-circle bowls, flat butt terminals), like interwar chart lettering.
// Glyph units: x-height 1, cap height 1.4, ascender 1.45, descender -0.45; y up from the baseline.
import { el, r1, PAL, type Attrs } from "./kit";

export const W = 0.19; // stroke width in x-heights
const R = 0.5 - W / 2; // bowl radius (centre line)
const S = W / 2; // stem centre
const A = 1.45; // ascender
const H = 1.4; // cap height
const HT = H - W / 2; // cap top centre line

type Pt = [number, number];
type Stroke = Pt[];
type Glyph = { w: number; s: Stroke[] };

function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number): Pt[] {
  const n = Math.max(4, Math.ceil(Math.abs(a1 - a0) / 9));
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return out;
}
const L = (...p: number[]): Stroke => {
  const o: Stroke = [];
  for (let i = 0; i < p.length; i += 2) o.push([p[i], p[i + 1]]);
  return o;
};
const ring = (cx = 0.5, cy = 0.5, rx = R, ry = R): Stroke => arc(cx, cy, rx, ry, 0, 360);
const dot = (x: number, y: number): Stroke => L(x, y, x, y + W);

const G: Record<string, Glyph> = {
  a: { w: 1, s: [ring(), L(1 - S, 0, 1 - S, 1)] },
  b: { w: 1, s: [L(S, 0, S, A), ring()] },
  c: { w: 0.9, s: [arc(0.5, 0.5, R, R, 48, 312)] },
  d: { w: 1, s: [ring(), L(1 - S, 0, 1 - S, A)] },
  e: { w: 1, s: [[[S, 0.5], [1 - S, 0.5], ...arc(0.5, 0.5, R, R, 0, 318)]] },
  f: { w: 0.66, s: [[[0.26, 0], ...arc(0.5, 1.12, 0.24, 0.235, 180, 50)], L(0, 1 - S, 0.6, 1 - S)] },
  g: { w: 1, s: [ring(), [[1 - S, 1], ...arc(0.5, 0.02, R, 0.335, 0, -165)]] },
  h: { w: 1, s: [L(S, 0, S, A), [...arc(0.5, 0.5, R, R, 180, 0), [1 - S, 0]]] },
  i: { w: W, s: [L(S, 0, S, 1), dot(S, 1.2)] },
  k: { w: 0.82, s: [L(S, 0, S, A), L(0.8, 1, S, 0.34), L(0.34, 0.58, 0.84, 0)] },
  l: { w: W, s: [L(S, 0, S, A)] },
  m: {
    w: 1.4,
    s: [L(S, 0, S, 1), [...arc(0.3975, 0.6, 0.3025, 0.305, 180, 0), [0.7, 0]], [...arc(1.0025, 0.6, 0.3025, 0.305, 180, 0), [1.305, 0]]],
  },
  n: { w: 1, s: [L(S, 0, S, 1), [...arc(0.5, 0.5, R, R, 180, 0), [1 - S, 0]]] },
  o: { w: 1, s: [ring()] },
  p: { w: 1, s: [L(S, 1, S, -0.45), ring()] },
  r: { w: 0.66, s: [L(S, 0, S, 1), arc(0.5, 0.5, R, R, 180, 62)] },
  s: { w: 0.8, s: [[...arc(0.43, 0.7025, 0.31, 0.2025, 25, 270), ...arc(0.43, 0.2975, 0.33, 0.2025, 90, -152)]] },
  t: { w: 0.6, s: [L(0.27, 0, 0.27, 1.3), L(0, 1 - S, 0.6, 1 - S)] },
  u: { w: 1, s: [[[S, 1], ...arc(0.5, 0.5, R, R, 180, 360)], L(1 - S, 1, 1 - S, 0)] },
  w: { w: 1.16, s: [L(0.02, 1, 0.3, 0.02, 0.58, 0.98, 0.86, 0.02, 1.14, 1)] },
  y: { w: 0.88, s: [L(0.02, 1, 0.44, 0.04), L(0.86, 1, 0.24, -0.45)] },
  z: { w: 0.82, s: [L(0.06, 1 - S, 0.78, 1 - S, 0.06, S, 0.8, S)] },
  A: { w: 1.2, s: [L(0.02, 0, 0.6, H, 1.18, 0), L(0.24, 0.44, 0.96, 0.44)] },
  E: { w: 0.92, s: [L(0.92, HT, S, HT, S, S, 0.92, S), L(S, 0.72, 0.82, 0.72)] },
  H: { w: 1.06, s: [L(S, 0, S, H), L(1.06 - S, 0, 1.06 - S, H), L(S, 0.72, 1.06 - S, 0.72)] },
  I: { w: W, s: [L(S, 0, S, H)] },
  L: { w: 0.8, s: [L(S, H, S, S, 0.8, S)] },
  O: { w: 1.44, s: [ring(0.72, 0.7, 0.625, 0.605)] },
  S: { w: 0.92, s: [[...arc(0.48, 1.0025, 0.37, 0.3025, 28, 270), ...arc(0.48, 0.3975, 0.4, 0.3025, 90, -150)]] },
  V: { w: 1.2, s: [L(0.02, H, 0.6, 0.02, 1.18, H)] },
  Y: { w: 1.1, s: [L(0.02, H, 0.55, 0.66), L(1.08, H, 0.55, 0.66, 0.55, 0)] },
  Z: { w: 1.06, s: [L(0.06, HT, 1.0, HT, 0.06, S, 1.04, S)] },
  B: { w: 0.96, s: [L(S, 0, S, H), [[S, HT], [0.5, HT], ...arc(0.5, (HT + 0.72) / 2, 0.29, (HT - 0.72) / 2, 90, -90), [S, 0.72]], [[S, 0.72], [0.55, 0.72], ...arc(0.55, (0.72 + S) / 2, 0.315, (0.72 - S) / 2, 90, -90), [S, S]]] },
  C: { w: 1.3, s: [arc(0.7, 0.7, 0.605, 0.605, 46, 314)] },
  M: { w: 1.5, s: [L(S, 0, S, H, 0.75, 0.3, 1.5 - S, H, 1.5 - S, 0)] },
  N: { w: 1.1, s: [L(S, 0, S, H, 1.1 - S, 0, 1.1 - S, H)] },
  P: { w: 0.88, s: [L(S, 0, S, H), [[S, HT], [0.45, HT], ...arc(0.45, (HT + 0.66) / 2, 0.33, (HT - 0.66) / 2, 90, -90), [S, 0.66]]] },
  R: { w: 0.9, s: [L(S, 0, S, H), [[S, HT], [0.45, HT], ...arc(0.45, (HT + 0.66) / 2, 0.33, (HT - 0.66) / 2, 90, -90), [S, 0.66]], L(0.42, 0.66, 0.88, 0)] },
  T: { w: 1, s: [L(0, HT, 1, HT), L(0.5, HT, 0.5, 0)] },
  W: { w: 1.7, s: [L(0.02, H, 0.44, 0.02, 0.85, H - 0.1, 1.26, 0.02, 1.68, H)] },
  ".": { w: W, s: [dot(S, 0)] },
  "!": { w: W, s: [L(S, H, S, 0.42), dot(S, 0)] },
  "0": { w: 0.9, s: [ring(0.45, 0.7, 0.355, 0.605)] },
  "1": { w: 0.62, s: [L(0.1, 1.08, 0.48, HT, 0.48, 0)] },
  "2": { w: 0.9, s: [[...arc(0.45, 1.0, 0.355, 0.305, 168, -32), [0.07, S], [0.88, S]]] },
  "3": { w: 0.86, s: [[...arc(0.42, 1.04, 0.33, 0.265, 150, -90), ...arc(0.42, 0.42, 0.37, 0.355, 90, -150)]] },
  "4": { w: 0.92, s: [L(0.68, 0, 0.68, H, 0.04, 0.42, 0.92, 0.42)] },
  "5": { w: 0.86, s: [[[0.8, HT], [0.2, HT], [0.13, 0.8], ...arc(0.43, 0.43, 0.37, 0.36, 125, -150)]] },
  "6": { w: 0.88, s: [ring(0.44, 0.44, 0.37, 0.36), L(0.1, 0.55, 0.62, H)] },
  "7": { w: 0.86, s: [L(0.02, HT, 0.84, HT, 0.3, 0)] },
  "8": { w: 0.86, s: [ring(0.43, 1.05, 0.29, 0.265), ring(0.43, 0.42, 0.36, 0.33)] },
  "9": { w: 0.88, s: [ring(0.44, 0.96, 0.37, 0.36), L(0.78, 0.85, 0.3, 0)] },
};

const TRACK = 0.17;
const SPACE = 0.42;

const adv = (ch: string) => (ch === " " ? SPACE : (G[ch]?.w ?? 0.8) + TRACK);

/** Width of a line in x-heights. */
export function measure(s: string): number {
  let w = 0;
  for (const ch of s) w += adv(ch);
  return w - TRACK;
}

/** Path data for one line: x = left ink edge, y = baseline, u = logical units per x-height. */
export function lineD(s: string, x: number, y: number, u: number): string {
  let d = "";
  let cx = x;
  for (const ch of s) {
    const g = G[ch];
    if (g) for (const st of g.s) for (let i = 0; i < st.length; i++) d += (i ? "L" : "M") + r1(cx + st[i][0] * u) + " " + r1(y - st[i][1] * u);
    cx += adv(ch) * u;
  }
  return d;
}

export interface TextOpts {
  /** Centre x, or left x when align = "left". */
  x: number;
  /** Baseline of the first line. */
  base: number;
  xh: number;
  lines: string[];
  lineH?: number;
  fill?: string;
  align?: "center" | "left" | "right";
  attrs?: Attrs;
}

/** Letters lines of text as one stroked path. Returns the path and each line's extent. */
export function letter(parent: Element, o: TextOpts) {
  const u = o.xh;
  const lh = o.lineH ?? 2 * u;
  let d = "";
  const ext: { x0: number; x1: number; y: number }[] = [];
  o.lines.forEach((s, i) => {
    const w = measure(s) * u;
    const x0 = o.align === "left" ? o.x : o.align === "right" ? o.x - w : o.x - w / 2;
    const y = o.base + i * lh;
    d += lineD(s, x0, y, u);
    ext.push({ x0, x1: x0 + w, y });
  });
  const p = el("path", { d, fill: "none", stroke: o.fill ?? PAL.ink, "stroke-width": r1(W * u * 10) / 10, "stroke-linecap": "butt", "stroke-linejoin": "miter", "stroke-miterlimit": 2.2, ...(o.attrs ?? {}) }, parent);
  return { p, ext };
}

/** Checks that every character of `s` has a glyph (dev aid; returns the missing ones). */
export function missing(s: string): string {
  let m = "";
  for (const ch of s) if (ch !== " " && !G[ch] && !m.includes(ch)) m += ch;
  return m;
}
