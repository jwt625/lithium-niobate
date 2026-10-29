// Scraped lettering: a single-stroke hand alphabet scratched through the black coat (each stroke a Scratch).
// Glyph units: x-height = 1, baseline y = 0, y down; ascenders to -1.4, descenders to +0.42.
// Letters get a slight forward slant and a seeded wobble, like a stylus pulled by hand.

import { scratch, type Pt, type Rng, type Scratch } from "./kit";

type Stroke = Pt[];
interface Glyph { w: number; s: Stroke[]; dot?: Pt[] }

function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number): Pt[] {
  const n = Math.max(5, Math.ceil(Math.abs(a1 - a0) / 12));
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return out;
}
const L = (...p: Pt[]): Stroke => p;
const J = (...parts: Pt[][]): Stroke => parts.flat();
const O = (cx: number, rx = 0.4): Stroke => arc(cx, -0.5, rx, 0.5, -90, 270);

const G: Record<string, Glyph> = {
  a: { w: 0.92, s: [arc(0.42, -0.5, 0.38, 0.5, -20, 340), L([0.8, -1], [0.8, 0])] },
  b: { w: 0.92, s: [L([0.1, -1.4], [0.1, 0]), O(0.5, 0.38)] },
  c: { w: 0.8, s: [arc(0.45, -0.5, 0.38, 0.5, -40, -320)] },
  d: { w: 0.92, s: [O(0.42, 0.38), L([0.8, -1.4], [0.8, 0])] },
  e: { w: 0.86, s: [J(L([0.06, -0.52], [0.8, -0.52]), arc(0.43, -0.5, 0.38, 0.5, -3, -315))] },
  f: { w: 0.6, s: [J(L([0.24, 0], [0.24, -1.08]), arc(0.5, -1.08, 0.26, 0.32, 180, 320)), L([0.02, -0.96], [0.54, -0.96])] },
  g: { w: 0.92, s: [O(0.42, 0.38), J(L([0.8, -1], [0.8, 0.1]), arc(0.45, 0.1, 0.35, 0.32, 0, 160))] },
  h: { w: 0.88, s: [L([0.1, -1.4], [0.1, 0]), J(arc(0.44, -0.58, 0.34, 0.42, 180, 360), L([0.78, -0.58], [0.78, 0]))] },
  i: { w: 0.34, s: [L([0.14, -1], [0.14, 0])], dot: [[0.14, -1.34]] },
  j: { w: 0.4, s: [J(L([0.25, -1], [0.25, 0.14]), arc(0.0, 0.14, 0.25, 0.28, 0, 140))], dot: [[0.25, -1.34]] },
  k: { w: 0.8, s: [L([0.1, -1.4], [0.1, 0]), L([0.7, -1], [0.12, -0.4]), L([0.32, -0.58], [0.76, 0])] },
  l: { w: 0.34, s: [L([0.14, -1.4], [0.14, 0])] },
  m: { w: 1.32, s: [L([0.1, -1], [0.1, 0]), J(arc(0.38, -0.6, 0.28, 0.4, 180, 360), L([0.66, -0.6], [0.66, 0])), J(arc(0.94, -0.6, 0.28, 0.4, 180, 360), L([1.22, -0.6], [1.22, 0]))] },
  n: { w: 0.88, s: [L([0.1, -1], [0.1, 0]), J(arc(0.44, -0.58, 0.34, 0.42, 180, 360), L([0.78, -0.58], [0.78, 0]))] },
  o: { w: 0.88, s: [O(0.44)] },
  p: { w: 0.92, s: [L([0.1, -1], [0.1, 0.42]), O(0.5, 0.38)] },
  q: { w: 0.92, s: [O(0.42, 0.38), L([0.8, -1], [0.8, 0.42])] },
  r: { w: 0.62, s: [L([0.1, -1], [0.1, 0]), arc(0.44, -0.6, 0.34, 0.4, 180, 300)] },
  s: { w: 0.76, s: [J(arc(0.38, -0.75, 0.3, 0.25, 320, 90), arc(0.38, -0.25, 0.3, 0.25, 270, 500))] },
  t: { w: 0.62, s: [J(L([0.26, -1.28], [0.26, -0.2]), arc(0.44, -0.2, 0.18, 0.2, 180, 70)), L([0.03, -0.96], [0.56, -0.96])] },
  u: { w: 0.88, s: [J(L([0.1, -1], [0.1, -0.42]), arc(0.44, -0.42, 0.34, 0.42, 180, 0)), L([0.78, -1], [0.78, 0])] },
  v: { w: 0.82, s: [L([0.04, -1], [0.41, 0], [0.78, -1])] },
  w: { w: 1.18, s: [L([0.04, -1], [0.31, 0], [0.59, -0.74], [0.87, 0], [1.14, -1])] },
  x: { w: 0.8, s: [L([0.06, -1], [0.74, 0]), L([0.74, -1], [0.06, 0])] },
  y: { w: 0.82, s: [L([0.04, -1], [0.42, -0.02]), L([0.78, -1], [0.28, 0.42])] },
  z: { w: 0.8, s: [L([0.06, -1], [0.74, -1], [0.06, 0], [0.76, 0])] },
  A: { w: 1.02, s: [L([0.04, 0], [0.51, -1.4], [0.98, 0]), L([0.2, -0.48], [0.82, -0.48])] },
  C: { w: 1.14, s: [arc(0.64, -0.7, 0.56, 0.7, -40, -320)] },
  I: { w: 0.4, s: [L([0.15, -1.4], [0.15, 0])] },
  K: { w: 0.94, s: [L([0.12, -1.4], [0.12, 0]), L([0.86, -1.4], [0.14, -0.52]), L([0.38, -0.82], [0.9, 0])] },
  M: { w: 1.3, s: [L([0.1, 0], [0.16, -1.4], [0.65, -0.3], [1.14, -1.4], [1.2, 0])] },
  N: { w: 1.06, s: [L([0.12, 0], [0.12, -1.4], [0.94, 0], [0.94, -1.4])] },
  S: { w: 0.94, s: [J(arc(0.47, -1.05, 0.36, 0.35, 320, 90), arc(0.47, -0.36, 0.4, 0.36, 270, 500))] },
  T: { w: 0.94, s: [L([0.03, -1.4], [0.91, -1.4]), L([0.47, -1.4], [0.47, 0])] },
  W: { w: 1.5, s: [L([0.04, -1.4], [0.38, 0], [0.75, -1.0], [1.12, 0], [1.46, -1.4])] },
  Z: { w: 0.96, s: [L([0.08, -1.4], [0.9, -1.4], [0.08, 0], [0.92, 0])] },
  ".": { w: 0.32, s: [], dot: [[0.12, -0.05]] },
  "!": { w: 0.4, s: [L([0.16, -1.4], [0.16, -0.42])], dot: [[0.16, -0.05]] },
  ",": { w: 0.32, s: [L([0.15, -0.06], [0.04, 0.24])] },
  "+": { w: 0.9, s: [L([0.08, -0.55], [0.82, -0.55]), L([0.45, -0.92], [0.45, -0.18])] },
  "-": { w: 0.9, s: [L([0.08, -0.55], [0.82, -0.55])] },
  " ": { w: 0.42, s: [] },
};

const TRACK = 0.14;
const SLANT = 0.1;
const glyph = (ch: string): Glyph => G[ch] ?? G[" "];

export function measure(str: string): number {
  let w = 0;
  for (const ch of str) w += glyph(ch).w + TRACK;
  return Math.max(0, w - TRACK);
}

export function wrap(text: string, maxW: number): string[] {
  const lines: string[] = [];
  let cur = "";
  for (const word of text.split(" ")) {
    const next = cur ? `${cur} ${word}` : word;
    if (cur && measure(next) > maxW) {
      lines.push(cur);
      cur = word;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

/** One line of scraped letters, left edge x0, baseline `base`, x-height xh. Stroke width = 0.22 xh. */
export function lineScratches(str: string, x0: number, base: number, xh: number, rng: Rng, wFrac = 0.22): Scratch[] {
  const out: Scratch[] = [];
  const w = xh * wFrac;
  let x = x0;
  for (const ch of str) {
    const g = glyph(ch);
    const rot = (rng() - 0.5) * 0.06, dy = (rng() - 0.5) * xh * 0.06;
    const tf = ([u, v]: Pt): Pt => {
      const uu = u * Math.cos(rot) - v * Math.sin(rot), vv = u * Math.sin(rot) + v * Math.cos(rot);
      return [x + (uu - vv * SLANT) * xh, base + dy + vv * xh];
    };
    for (const st of g.s) out.push(scratch(st.map(tf), w, rng, 0.8));
    for (const d of g.dot ?? []) {
      const [cx, cy] = tf(d);
      out.push(scratch([[cx - w * 0.15, cy - w * 0.1], [cx + w * 0.15, cy + w * 0.1]], w * 1.25, rng, 0.5));
    }
    x += (g.w + TRACK) * xh;
  }
  return out;
}

export interface TextOpts { xh: number; maxW: number; lineH: number }

/** Wrapped, centred block of scraped letters; the block is centred on (cx, cy). */
export function textScratches(text: string, cx: number, cy: number, o: TextOpts, rng: Rng): Scratch[] {
  // balanced wrap: the narrowest measure that keeps the greedy line count
  const n = wrap(text, o.maxW / o.xh).length;
  let lo = 0, hi = o.maxW / o.xh;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (wrap(text, mid).length <= n) hi = mid;
    else lo = mid;
  }
  const lines = wrap(text, hi);
  const blockH = (lines.length - 1) * o.lineH + 1.4 * o.xh;
  const out: Scratch[] = [];
  lines.forEach((ln, i) => {
    const base = cy - blockH / 2 + 1.4 * o.xh + i * o.lineH;
    out.push(...lineScratches(ln, cx - (measure(ln) * o.xh) / 2 + SLANT * o.xh * 0.5, base, o.xh, rng));
  });
  return out;
}

/** Centred single label (x-height xh) around (cx, cy). */
export function labelScratches(str: string, cx: number, cy: number, xh: number, rng: Rng, wFrac = 0.24): Scratch[] {
  return lineScratches(str, cx - (measure(str) * xh) / 2, cy + 0.5 * xh, xh, rng, wFrac);
}
