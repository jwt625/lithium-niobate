// Stitched Roman capitals for the strip's inscriptions (procedural, no font file).
// Glyph units: cap height 1, y = 0 top, y = 1 baseline. Rendered in stem stitch.

import { Emb, arcPts, type Pt } from "./stitch";

type S = Pt[];
interface Glyph {
  w: number;
  s: S[];
  d?: Pt[]; // knots (dots)
}

const A = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number): Pt[] => arcPts(cx, cy, rx, ry, a0, a1, 15);
const cat = (...p: Pt[][]): S => p.flat();

const G: Record<string, Glyph> = {
  A: { w: 0.78, s: [[[0, 1], [0.39, 0], [0.78, 1]], [[0.16, 0.64], [0.62, 0.64]]] },
  B: { w: 0.64, s: [[[0, 0], [0, 1]], cat([[0, 0], [0.36, 0]], A(0.36, 0.24, 0.23, 0.24, -90, 90), [[0, 0.48], [0.38, 0.48]], A(0.38, 0.74, 0.26, 0.26, -90, 90), [[0, 1]])] },
  C: { w: 0.74, s: [A(0.42, 0.5, 0.42, 0.5, -42, -318)] },
  D: { w: 0.72, s: [cat([[0, 0], [0, 1], [0.3, 1]], A(0.3, 0.5, 0.42, 0.5, 90, -90), [[0, 0]])] },
  E: { w: 0.58, s: [[[0.58, 0], [0, 0], [0, 1], [0.6, 1]], [[0, 0.49], [0.48, 0.49]]] },
  F: { w: 0.56, s: [[[0.58, 0], [0, 0], [0, 1]], [[0, 0.49], [0.46, 0.49]]] },
  G: { w: 0.78, s: [A(0.42, 0.5, 0.42, 0.5, -42, -338), [[0.5, 0.58], [0.82, 0.58], [0.82, 0.92]]] },
  H: { w: 0.66, s: [[[0, 0], [0, 1]], [[0.66, 0], [0.66, 1]], [[0, 0.5], [0.66, 0.5]]] },
  I: { w: 0, s: [[[0, 0], [0, 1]]] },
  J: { w: 0.46, s: [cat([[0.44, 0], [0.44, 0.72]], A(0.22, 0.72, 0.22, 0.28, 0, 160))] },
  K: { w: 0.64, s: [[[0, 0], [0, 1]], [[0.62, 0], [0.02, 0.58]], [[0.22, 0.4], [0.66, 1]]] },
  L: { w: 0.54, s: [[[0, 0], [0, 1], [0.56, 1]]] },
  M: { w: 0.86, s: [[[0, 1], [0.02, 0], [0.43, 0.74], [0.84, 0], [0.86, 1]]] },
  N: { w: 0.68, s: [[[0, 1], [0, 0], [0.68, 1], [0.68, 0]]] },
  O: { w: 0.9, s: [A(0.45, 0.5, 0.45, 0.5, 0, 360)] },
  P: { w: 0.62, s: [cat([[0, 1], [0, 0], [0.36, 0]], A(0.36, 0.26, 0.26, 0.26, -90, 90), [[0, 0.52]])] },
  Q: { w: 0.9, s: [A(0.45, 0.5, 0.45, 0.5, 0, 360), [[0.56, 0.74], [0.92, 1.04]]] },
  R: { w: 0.64, s: [cat([[0, 1], [0, 0], [0.36, 0]], A(0.36, 0.26, 0.26, 0.26, -90, 90), [[0, 0.52]]), [[0.3, 0.52], [0.66, 1]]] },
  S: { w: 0.62, s: [cat(A(0.31, 0.25, 0.29, 0.25, -25, -270), A(0.31, 0.75, 0.31, 0.25, -90, 155))] },
  T: { w: 0.68, s: [[[0, 0], [0.68, 0]], [[0.34, 0], [0.34, 1]]] },
  U: { w: 0.66, s: [cat([[0, 0], [0, 0.66]], A(0.33, 0.66, 0.33, 0.34, 180, 0), [[0.66, 0]])] },
  V: { w: 0.74, s: [[[0, 0], [0.37, 1], [0.74, 0]]] },
  W: { w: 1.02, s: [[[0, 0], [0.24, 1], [0.51, 0.3], [0.78, 1], [1.02, 0]]] },
  X: { w: 0.66, s: [[[0, 0], [0.66, 1]], [[0.66, 0], [0, 1]]] },
  Y: { w: 0.7, s: [[[0, 0], [0.35, 0.5], [0.7, 0]], [[0.35, 0.5], [0.35, 1]]] },
  Z: { w: 0.62, s: [[[0, 0], [0.62, 0], [0, 1], [0.64, 1]]] },
  "0": { w: 0.6, s: [A(0.3, 0.5, 0.3, 0.5, 0, 360)] },
  "1": { w: 0.44, s: [[[0.02, 0.2], [0.26, 0], [0.26, 1]], [[0.02, 1], [0.46, 1]]] },
  "2": { w: 0.6, s: [cat(A(0.3, 0.29, 0.29, 0.29, -165, 28), [[0, 1], [0.62, 1]])] },
  "3": { w: 0.6, s: [cat(A(0.29, 0.25, 0.27, 0.25, -160, 90), A(0.29, 0.75, 0.31, 0.25, -90, 160))] },
  "4": { w: 0.66, s: [[[0.5, 1], [0.5, 0], [0, 0.7], [0.68, 0.7]]] },
  "5": { w: 0.6, s: [cat([[0.56, 0], [0.08, 0], [0.04, 0.45]], A(0.3, 0.69, 0.3, 0.31, -128, 155))] },
  "6": { w: 0.6, s: [[[0.5, 0.02], [0.06, 0.62]], A(0.31, 0.7, 0.29, 0.3, 0, 360)] },
  "7": { w: 0.6, s: [[[0, 0], [0.62, 0], [0.2, 1]]] },
  "8": { w: 0.6, s: [A(0.3, 0.25, 0.25, 0.25, 0, 360), A(0.3, 0.74, 0.3, 0.26, 0, 360)] },
  "9": { w: 0.6, s: [A(0.3, 0.3, 0.29, 0.3, 0, 360), [[0.58, 0.36], [0.16, 1]]] },
  ".": { w: 0.12, s: [], d: [[0.06, 0.94]] },
  ",": { w: 0.06, s: [[[0.06, 0.92], [-0.04, 1.12]]] },
  "'": { w: 0.06, s: [[[0.04, -0.02], [0.0, 0.24]]] },
  "!": { w: 0.02, s: [[[0.01, 0], [0.01, 0.66]]], d: [[0.01, 0.94]] },
  ":": { w: 0.02, s: [], d: [[0.01, 0.42], [0.01, 0.94]] },
};

const TRACK = 0.2; // letter gap, in cap heights
const SPACE = 0.42;

export function lineWidth(line: string, cap: number): number {
  let x = 0;
  for (const ch of line) {
    if (ch === " ") x += SPACE * cap;
    else x += ((G[ch]?.w ?? 0.6) + TRACK) * cap;
  }
  return x - TRACK * cap;
}

/** True for characters that belong to a year (stitched in terracotta). */
function yearMask(line: string): boolean[] {
  const m = line.split("").map(() => false);
  const re = /\d{4}/g;
  let r: RegExpExecArray | null;
  while ((r = re.exec(line))) for (let i = r.index; i < r.index + 4; i++) m[i] = true;
  return m;
}

/**
 * Stitch an inscription: lines centered on cx, first line top at y0, pitch `lh`.
 * Each letter is pushed as its own run group so the reveal runs letter by letter.
 */
export function inscription(e: Emb, lines: string[], cx: number, y0: number, cap: number, lh: number, ink: string, yearInk: string): void {
  const w = Math.max(5.5, cap * 0.165);
  const len = Math.max(9, cap * 0.27);
  lines.forEach((raw, li) => {
    const line = raw.toUpperCase();
    const mask = yearMask(line);
    let x = cx - lineWidth(line, cap) / 2;
    const top = y0 + li * lh;
    [...line].forEach((ch, i) => {
      if (ch === " ") {
        x += SPACE * cap;
        return;
      }
      const g = G[ch] ?? G["."];
      const col = mask[i] ? yearInk : ink;
      for (const st of g.s) e.stem(st.map(([u, v]): Pt => [x + u * cap, top + v * cap]), col, w, len);
      for (const [u, v] of g.d ?? []) e.knot(x + u * cap, top + v * cap, col, w * 0.62);
      x += (g.w + TRACK) * cap;
    });
  });
}
