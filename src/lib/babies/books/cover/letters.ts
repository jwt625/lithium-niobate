// Procedural cut-paper lettering: angular stroke letters (scissor-straight cuts, chamfered bowls)
// standing on one thin paper strip per line, so each line is a single connected sheet.
// Units: x-height 5, cap 7, ascender 7.4, descender 2.2; y up from the baseline.
import { el, r1, type Attrs, type Paper } from "./kit";

type Glyph = { w: number; p: number[][] };
const oct = (x0: number, y0: number, x1: number, y1: number, c: number) => [x1, y0 + c, x1, y1 - c, x1 - c, y1, x0 + c, y1, x0, y1 - c, x0, y0 + c, x0 + c, y0, x1 - c, y0, x1, y0 + c];
const bowl = oct(0, 0, 3.4, 5, 1.2);

const G: Record<string, Glyph> = {
  a: { w: 3.4, p: [bowl, [3.4, 5, 3.4, 0]] },
  b: { w: 3.4, p: [[0, 7.4, 0, 0], bowl] },
  c: { w: 3.4, p: [[3.4, 3.8, 2.2, 5, 1.2, 5, 0, 3.8, 0, 1.2, 1.2, 0, 2.2, 0, 3.4, 1.2]] },
  d: { w: 3.4, p: [bowl, [3.4, 7.4, 3.4, 0]] },
  e: { w: 3.4, p: [[0, 2.6, 3.4, 2.6, 3.4, 3.8, 2.2, 5, 1.2, 5, 0, 3.8, 0, 1.2, 1.2, 0, 3.3, 0]] },
  f: { w: 2.8, p: [[2.8, 7.4, 1.8, 7.4, 1, 6.6, 1, 0], [0, 5, 2.6, 5]] },
  g: { w: 3.4, p: [bowl, [3.4, 5, 3.4, -1.2, 2.4, -2.2, 0.4, -2.2]] },
  h: { w: 3.4, p: [[0, 7.4, 0, 0], [0, 3.8, 1.2, 5, 2.2, 5, 3.4, 3.8, 3.4, 0]] },
  i: { w: 0, p: [[0, 5, 0, 0], [0, 6.5, 0, 6.85]] },
  k: { w: 3.4, p: [[0, 7.4, 0, 0], [3.2, 5, 0, 1.8], [1.2, 3, 3.4, 0]] },
  l: { w: 1.5, p: [[0, 7.4, 0, 0.9, 0.9, 0, 1.5, 0]] },
  m: { w: 4.8, p: [[0, 5, 0, 0], [0, 3.9, 1.1, 5, 1.5, 5, 2.4, 4.1, 2.4, 0], [2.4, 4.1, 3.3, 5, 3.7, 5, 4.8, 3.9, 4.8, 0]] },
  n: { w: 3.4, p: [[0, 5, 0, 0], [0, 3.8, 1.2, 5, 2.2, 5, 3.4, 3.8, 3.4, 0]] },
  o: { w: 3.6, p: [oct(0, 0, 3.6, 5, 1.3)] },
  p: { w: 3.4, p: [[0, 5, 0, -2.2], bowl] },
  r: { w: 2.6, p: [[0, 5, 0, 0], [0, 3.6, 1.4, 5, 2.6, 5]] },
  s: { w: 3.4, p: [[3.3, 4.2, 2.5, 5, 0.9, 5, 0, 4.1, 0, 3.4, 0.8, 2.6, 2.6, 2.4, 3.4, 1.6, 3.4, 0.9, 2.5, 0, 0.9, 0, 0, 0.8]] },
  t: { w: 2.7, p: [[1, 6.8, 1, 0.9, 1.9, 0, 2.7, 0], [0, 5, 2.6, 5]] },
  u: { w: 3.4, p: [[0, 5, 0, 1.2, 1.2, 0, 2.2, 0, 3.4, 1.2], [3.4, 5, 3.4, 0]] },
  v: { w: 3.4, p: [[0, 5, 1.7, 0, 3.4, 5]] },
  w: { w: 4.8, p: [[0, 5, 1.2, 0, 2.4, 3.6, 3.6, 0, 4.8, 5]] },
  x: { w: 3.4, p: [[0, 5, 3.4, 0], [0, 0, 3.4, 5]] },
  y: { w: 3.4, p: [[0, 5, 1.8, 0.3], [3.4, 5, 1, -2.2]] },
  B: { w: 4, p: [[0, 0, 0, 7, 2.8, 7, 3.7, 6.1, 3.7, 4.5, 2.8, 3.6, 0, 3.6], [2.8, 3.6, 4, 2.6, 4, 1, 3, 0, 0, 0]] },
  C: { w: 4.2, p: [[4.2, 5.4, 2.6, 7, 1.6, 7, 0, 5.4, 0, 1.6, 1.6, 0, 2.6, 0, 4.2, 1.6]] },
  D: { w: 4.2, p: [[0, 0, 0, 7, 2.2, 7, 4.2, 5, 4.2, 2, 2.2, 0, 0, 0]] },
  H: { w: 4, p: [[0, 0, 0, 7], [4, 0, 4, 7], [0, 3.6, 4, 3.6]] },
  I: { w: 2.8, p: [[1.4, 0, 1.4, 7], [0, 7, 2.8, 7], [0, 0, 2.8, 0]] },
  L: { w: 3.4, p: [[0, 7, 0, 0, 3.4, 0]] },
  M: { w: 5, p: [[0, 0, 0, 7, 2.5, 2.6, 5, 7, 5, 0]] },
  N: { w: 4, p: [[0, 0, 0, 7, 4, 0, 4, 7]] },
  O: { w: 4.6, p: [oct(0, 0, 4.6, 7, 1.6)] },
  P: { w: 3.9, p: [[0, 0, 0, 7, 2.8, 7, 3.9, 5.9, 3.9, 4.3, 2.8, 3.2, 0, 3.2]] },
  Q: { w: 4.8, p: [oct(0, 0, 4.6, 7, 1.6), [2.6, 1.8, 4.8, -0.8]] },
  S: { w: 4, p: [[4, 6, 3, 7, 1.1, 7, 0, 5.9, 0, 4.7, 1, 3.7, 3, 3.4, 4, 2.4, 4, 1, 3, 0, 1, 0, 0, 1]] },
  T: { w: 4.4, p: [[0, 7, 4.4, 7], [2.2, 7, 2.2, 0]] },
  ",": { w: 0.5, p: [[0.5, 0.5, 0, -1.3]] },
  ".": { w: 0, p: [[0, 0, 0, 0.3]] },
  "!": { w: 0, p: [[0, 7, 0, 2.4], [0, 0, 0, 0.3]] },
};

export const STROKE = 1.15;
const TRACK = 0.85;
const SPACE = 2.3;

const adv = (ch: string) => (ch === " " ? SPACE : (G[ch]?.w ?? 3) + STROKE + TRACK);

/** Width of a line in units, from the first stroke edge to the last. */
export function measure(s: string): number {
  let w = 0;
  for (const ch of s) w += adv(ch);
  return w - TRACK;
}

/** Path data for one line; x = left ink edge, y = baseline, u = logical units per letter unit. */
export function lineD(s: string, x: number, y: number, u: number, rnd?: () => number): string {
  let d = "";
  const j = () => (rnd ? (rnd() - 0.5) * 0.14 : 0);
  let cx = x + (STROKE / 2) * u;
  for (const ch of s) {
    const g = G[ch];
    if (g) {
      for (const pl of g.p) {
        const n = pl.length;
        const closed = n > 4 && pl[0] === pl[n - 2] && pl[1] === pl[n - 1];
        const m = closed ? n - 2 : n;
        for (let i = 0; i < m; i += 2) d += (i ? "L" : "M") + r1(cx + (pl[i] + j()) * u) + " " + r1(y - (pl[i + 1] + j()) * u);
        if (closed) d += "Z";
      }
    }
    cx += adv(ch) * u;
  }
  return d;
}

/** Greedy word wrap to maxW logical units. */
export function wrap(text: string, maxW: number, u: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (cur && measure(t) * u > maxW) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

export interface BlockOpts {
  cx: number;
  /** Baseline of the first line. */
  base: number;
  xh: number;
  maxW?: number;
  lines?: string[];
  lineH?: number;
  fill?: string;
  strip?: boolean;
  attrs?: Attrs;
}

/** Letters a block of text as cut paper (one lifted sheet per call). Returns the group and the line extents. */
export function letterBlock(parent: Element, p: Paper, text: string, o: BlockOpts) {
  const u = o.xh / 5;
  const lines = o.lines ?? wrap(text, o.maxW ?? 900, u);
  const lh = o.lineH ?? 12 * u;
  const fill = o.fill ?? p.red;
  const g = p.sheet(parent, { "aria-hidden": "true", ...(o.attrs ?? {}) });
  const ext: { x0: number; x1: number; y: number }[] = [];
  const rnd = p.host.rng(7 + text.length);
  let d = "";
  let strip = "";
  lines.forEach((s, i) => {
    const w = measure(s) * u;
    const x0 = o.cx - w / 2;
    const y = o.base + i * lh;
    d += lineD(s, x0, y, u, rnd);
    ext.push({ x0, x1: x0 + w, y });
    if (o.strip !== false) {
      const a = x0 - 1.3 * u;
      const b = x0 + w + 1.3 * u;
      const t = y + 0.05 * u;
      const bt = y + 1.05 * u;
      const m = (t + bt) / 2;
      strip += `M${r1(a)} ${r1(t)}H${r1(b)}L${r1(b - 0.7 * u)} ${r1(m)}L${r1(b)} ${r1(bt)}H${r1(a)}L${r1(a + 0.7 * u)} ${r1(m)}Z`;
    }
  });
  if (strip) el("path", { d: strip, fill }, g);
  el("path", { d, fill: "none", stroke: fill, "stroke-width": r1(STROKE * u), "stroke-linecap": "square", "stroke-linejoin": "miter", "stroke-miterlimit": 2.6 }, g);
  return { g, ext, u, lh };
}
