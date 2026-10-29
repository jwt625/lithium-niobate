// Carved woodcut lettering: a procedural single-stroke skeleton alphabet, each stroke cut as a gouge
// (slightly swelling, chisel-tapered ends, rough wood edge). Units: x-height = 1, baseline y = 0, y down.

import { gouge, blob, roughPoly, type Ctx } from "./kit";

type P = [number, number];
interface Glyph {
  w: number;
  s: P[][];
  d?: P[];
}

function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number): P[] {
  const n = Math.max(5, Math.ceil(Math.abs(a1 - a0) / 9));
  const out: P[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return out;
}
const L = (...p: P[]): P[] => p;
const cat = (...parts: P[][]): P[] => parts.flat();
const ring = (cx: number, cy = -0.5, rx = 0.36, ry = 0.52): P[] => arc(cx, cy, rx, ry, 0, 360);

// Asc 1.45, cap 1.4, desc 0.42. Slightly wide, round-shouldered forms suit a gouge.
const G: Record<string, Glyph> = {
  a: { w: 0.96, s: [ring(0.44), L([0.82, -1.02], [0.82, 0])] },
  b: { w: 0.98, s: [L([0.14, -1.45], [0.14, 0]), ring(0.52)] },
  c: { w: 0.86, s: [arc(0.48, -0.5, 0.36, 0.52, 42, 318)] },
  d: { w: 0.98, s: [ring(0.46), L([0.84, -1.45], [0.84, 0])] },
  e: { w: 0.92, s: [cat(L([0.12, -0.5], [0.83, -0.5]), arc(0.47, -0.5, 0.36, 0.52, 0, -318))] },
  f: { w: 0.68, s: [cat(L([0.3, 0], [0.3, -1.12]), arc(0.56, -1.12, 0.26, 0.3, 180, 315)), L([0.06, -0.98], [0.62, -0.98])] },
  g: { w: 0.98, s: [ring(0.46), cat(L([0.84, -1.02], [0.84, 0.12]), arc(0.48, 0.12, 0.36, 0.3, 0, 150))] },
  h: { w: 0.96, s: [L([0.14, -1.45], [0.14, 0]), cat(arc(0.48, -0.58, 0.34, 0.42, 180, 360), L([0.82, -0.58], [0.82, 0]))] },
  i: { w: 0.38, s: [L([0.17, -1], [0.17, 0])], d: [[0.17, -1.37]] },
  j: { w: 0.44, s: [cat(L([0.29, -1], [0.29, 0.14]), arc(0.03, 0.14, 0.26, 0.28, 0, 130))], d: [[0.29, -1.37]] },
  k: { w: 0.86, s: [L([0.14, -1.45], [0.14, 0]), L([0.74, -1], [0.16, -0.4]), L([0.38, -0.62], [0.8, 0])] },
  l: { w: 0.38, s: [L([0.17, -1.45], [0.17, 0])] },
  m: {
    w: 1.4,
    s: [
      L([0.14, -1], [0.14, 0]),
      cat(arc(0.42, -0.6, 0.28, 0.4, 180, 360), L([0.7, -0.6], [0.7, 0])),
      cat(arc(0.98, -0.6, 0.28, 0.4, 180, 360), L([1.26, -0.6], [1.26, 0])),
    ],
  },
  n: { w: 0.96, s: [L([0.14, -1], [0.14, 0]), cat(arc(0.48, -0.58, 0.34, 0.42, 180, 360), L([0.82, -0.58], [0.82, 0]))] },
  o: { w: 0.96, s: [ring(0.48)] },
  p: { w: 0.98, s: [L([0.14, -1], [0.14, 0.42]), ring(0.52)] },
  q: { w: 0.98, s: [ring(0.46), L([0.84, -1], [0.84, 0.42])] },
  r: { w: 0.7, s: [L([0.14, -1], [0.14, 0]), arc(0.48, -0.62, 0.34, 0.38, 180, 295)] },
  s: { w: 0.8, s: [cat(arc(0.4, -0.75, 0.27, 0.25, -25, -270), arc(0.4, -0.25, 0.29, 0.25, -90, 155))] },
  t: { w: 0.7, s: [cat(L([0.3, -1.3], [0.3, -0.2]), arc(0.5, -0.2, 0.2, 0.2, 180, 60)), L([0.06, -0.98], [0.64, -0.98])] },
  u: { w: 0.96, s: [cat(L([0.14, -1], [0.14, -0.42]), arc(0.48, -0.42, 0.34, 0.42, 180, 0)), L([0.82, -1], [0.82, 0])] },
  v: { w: 0.9, s: [L([0.07, -1], [0.45, 0], [0.83, -1])] },
  w: { w: 1.28, s: [L([0.06, -1], [0.35, 0], [0.64, -0.7], [0.93, 0], [1.22, -1])] },
  x: { w: 0.86, s: [L([0.1, -1], [0.76, 0]), L([0.76, -1], [0.1, 0])] },
  y: { w: 0.9, s: [L([0.07, -1], [0.47, -0.02]), L([0.83, -1], [0.32, 0.42])] },
  z: { w: 0.86, s: [L([0.1, -1], [0.76, -1], [0.1, 0], [0.78, 0])] },
  A: { w: 1.08, s: [L([0.06, 0], [0.54, -1.4], [1.02, 0]), L([0.24, -0.48], [0.84, -0.48])] },
  C: { w: 1.16, s: [arc(0.64, -0.7, 0.52, 0.7, 42, 318)] },
  D: { w: 1.1, s: [cat(L([0.14, 0], [0.14, -1.4], [0.42, -1.4]), arc(0.42, -0.7, 0.54, 0.7, -90, 90), L([0.42, 0], [0.14, 0]))] },
  I: { w: 0.4, s: [L([0.18, -1.4], [0.18, 0])] },
  N: { w: 1.1, s: [L([0.14, 0], [0.14, -1.4], [0.96, 0], [0.96, -1.4])] },
  O: { w: 1.32, s: [ring(0.66, -0.7, 0.54, 0.7)] },
  S: { w: 0.98, s: [cat(arc(0.49, -1.06, 0.36, 0.34, -25, -270), arc(0.49, -0.36, 0.4, 0.36, -90, 155))] },
  T: { w: 0.98, s: [L([0.05, -1.4], [0.93, -1.4]), L([0.49, -1.4], [0.49, 0])] },
  W: { w: 1.5, s: [L([0.06, -1.4], [0.4, 0], [0.75, -1.0], [1.1, 0], [1.44, -1.4])] },
  ".": { w: 0.36, s: [], d: [[0.16, -0.06]] },
  ",": { w: 0.36, s: [L([0.2, -0.1], [0.08, 0.24])] },
  ":": { w: 0.38, s: [], d: [[0.17, -0.72], [0.17, -0.06]] },
  "!": { w: 0.44, s: [L([0.19, -1.4], [0.19, -0.44])], d: [[0.19, -0.06]] },
  "'": { w: 0.32, s: [L([0.16, -1.42], [0.14, -1.0])] },
  " ": { w: 0.46, s: [] },
};

const TRACK = 0.14;
const glyph = (ch: string): Glyph => G[ch] ?? G[" "];

export function measure(word: string): number {
  let w = 0;
  for (const ch of word) w += glyph(ch).w + TRACK;
  return Math.max(0, w - TRACK);
}

/** Greedy word wrap (widths in x-height units), returning word index of each line start too. */
function wrap(words: string[], maxW: number): { line: string; first: number }[] {
  const lines: { line: string; first: number }[] = [];
  let cur = "";
  let first = 0;
  words.forEach((word, i) => {
    const next = cur ? `${cur} ${word}` : word;
    if (cur && measure(next) > maxW) {
      lines.push({ line: cur, first });
      cur = word;
      first = i;
    } else cur = next;
  });
  if (cur) lines.push({ line: cur, first });
  return lines;
}

export interface CarveOpt {
  xh: number;
  maxW: number;
  lineH: number;
  color: string;
  /** Words from this index on are cut in the red block (-1 = none). */
  redFrom?: number;
  red?: string;
  seed?: number;
  /** Stroke weight in x-heights. */
  weight?: number;
}

/** Cuts `text` centred on (cx, cy). Every stroke is a gouge filled with opt.color. */
export function carveText(g: Ctx, text: string, cx: number, cy: number, o: CarveOpt): void {
  const words = text.split(" ");
  // balanced wrap per part; the red part (if any) starts on its own line
  const maxW = o.maxW / o.xh;
  const balanced = (ws: string[], off: number) => {
    const n = wrap(ws, maxW).length;
    let lo = maxW * 0.4;
    let hi = maxW;
    for (let i = 0; i < 16; i++) {
      const mid = (lo + hi) / 2;
      if (wrap(ws, mid).length > n) lo = mid;
      else hi = mid;
    }
    return wrap(ws, hi).map((l) => ({ line: l.line, first: l.first + off }));
  };
  const rf = o.redFrom ?? -1;
  const lines = rf > 0 && rf < words.length ? [...balanced(words.slice(0, rf), 0), ...balanced(words.slice(rf), rf)] : balanced(words, 0);
  const xh = o.xh;
  const sw = xh * (o.weight ?? 0.27);
  const top = cy - ((lines.length - 1) * o.lineH) / 2 + xh * 0.5;
  let seed = o.seed ?? 1;
  lines.forEach(({ line, first }, li) => {
    const base = top + li * o.lineH;
    const lw = measure(line) * xh;
    let x = cx - lw / 2;
    if (rf >= 0 && first >= rf && o.red) {
      // the closing line gets red cut diamonds either side (red letters on black would read too dark)
      g.fillStyle = o.red;
      g.beginPath();
      for (const dx of [-lw / 2 - xh * 0.9, lw / 2 + xh * 0.9]) {
        const yc = base - xh * 0.55;
        const r = xh * 0.42;
        roughPoly(g, [[cx + dx, yc - r], [cx + dx + r * 0.8, yc], [cx + dx, yc + r], [cx + dx - r * 0.8, yc]], seed++, 0.6, 3);
      }
      g.fill();
    }
    for (const ch of line) {
      if (ch === " ") {
        x += (glyph(" ").w + TRACK) * xh;
        continue;
      }
      const gl = glyph(ch);
      g.fillStyle = o.color;
      g.beginPath();
      for (const st of gl.s) {
        const pts = st.map(([px, py]) => [x + px * xh, base + py * xh] as P);
        gouge(g, pts, sw, { taper: 0.38, rough: Math.max(0.5, xh * 0.022), seed: seed++, step: 2.2, wobble: 0.1 });
      }
      for (const [px, py] of gl.d ?? []) blob(g, x + px * xh, base + py * xh, sw * 0.62, seed++, 0.6);
      g.fill();
      x += (gl.w + TRACK) * xh;
    }
  });
}
