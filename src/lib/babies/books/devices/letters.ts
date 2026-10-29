// Procedural constructivist block capitals: heavy monoline strokes, flat-topped A, flat-bottomed V,
// elliptical bowls. Glyph centerlines on a cap height of 7.7 units; the 2.3-unit stroke makes the ink
// exactly 10 units tall, so `cap` (logical units) = ink cap height. y is up from the baseline.
import { el, r1, type Attrs, type Pt } from "./kit";

const SW = 2.3;
const C = SW / 2;
const H = 7.7;
const M = H / 2;

/** Elliptical arc points (y up, degrees counterclockwise). */
function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number): Pt[] {
  const n = Math.max(4, Math.ceil(Math.abs(a1 - a0) / 12));
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return out;
}

type Glyph = { w: number; p: Pt[][]; dots?: Pt[] };
const P = (...a: (Pt | Pt[])[]): Pt[] => a.flatMap((x) => (typeof x[0] === "number" ? [x as Pt] : (x as Pt[])));

const G: Record<string, Glyph> = {
  A: { w: 5.8, p: [[[0, 0], [2.1, H], [3.7, H], [5.8, 0]], [[1, 2.5], [4.8, 2.5]]] },
  B: { w: 5.4, p: [P([0, 0], [0, H], [3.1, H], arc(3.1, 5.8, 2.0, 1.9, 90, -90), [0, 3.9]), P([3.1, 3.9], arc(3.2, 1.95, 2.2, 1.95, 90, -90), [0, 0])] },
  C: { w: 5.5, p: [arc(2.9, M, 2.9, M, 42, 318)] },
  D: { w: 5.6, p: [P([0, 0], [0, H], [1.9, H], arc(1.9, M, 3.7, M, 90, -90), [0, 0])] },
  E: { w: 4.9, p: [[[4.9, H], [0, H], [0, 0], [4.9, 0]], [[0, 3.9], [4.2, 3.9]]] },
  F: { w: 4.9, p: [[[4.9, H], [0, H], [0, 0]], [[0, 3.9], [4.2, 3.9]]] },
  G: { w: 5.8, p: [P(arc(2.9, M, 2.9, M, 40, 360), [3.1, M])] },
  H: { w: 5.4, p: [[[0, 0], [0, H]], [[5.4, 0], [5.4, H]], [[0, 3.9], [5.4, 3.9]]] },
  I: { w: 0, p: [[[0, 0], [0, H]]] },
  J: { w: 4.6, p: [P([4.6, H], [4.6, 2.3], arc(2.3, 2.3, 2.3, 2.3, 360, 195))] },
  K: { w: 5.4, p: [[[0, 0], [0, H]], [[5.2, H], [0, 2.7]], [[1.9, 4.7], [5.5, 0]]] },
  L: { w: 4.7, p: [[[0, H], [0, 0], [4.7, 0]]] },
  M: { w: 6.8, p: [[[0, 0], [0, H], [3.4, 2.0], [6.8, H], [6.8, 0]]] },
  N: { w: 5.4, p: [[[0, 0], [0, H], [5.4, 0], [5.4, H]]] },
  O: { w: 6.0, p: [arc(3, M, 3, M, 0, 360)] },
  P: { w: 5.2, p: [P([0, 0], [0, H], [2.9, H], arc(2.9, 5.65, 2.3, 2.05, 90, -90), [0, 3.6])] },
  R: { w: 5.4, p: [P([0, 0], [0, H], [2.9, H], arc(2.9, 5.65, 2.3, 2.05, 90, -90), [0, 3.6]), [[2.5, 3.6], [5.4, 0]]] },
  S: { w: 5.4, p: [P(arc(2.7, 5.775, 2.6, 1.925, 28, 270), arc(2.7, 1.925, 2.75, 1.925, 90, -152))] },
  T: { w: 5.8, p: [[[0, H], [5.8, H]], [[2.9, H], [2.9, 0]]] },
  U: { w: 5.5, p: [P([0, H], [0, 2.4], arc(2.75, 2.4, 2.75, 2.4, 180, 360), [5.5, H])] },
  V: { w: 5.8, p: [[[0, H], [2.15, 0], [3.65, 0], [5.8, H]]] },
  W: { w: 7.8, p: [[[0, H], [1.7, 0], [3.9, 5.6], [6.1, 0], [7.8, H]]] },
  Y: { w: 5.8, p: [[[0, H], [2.9, 3.7], [5.8, H]], [[2.9, 3.7], [2.9, 0]]] },
  ":": { w: 0, p: [], dots: [[0, 0], [0, 4.2]] },
  ".": { w: 0, p: [], dots: [[0, 0]] },
  ",": { w: 0.6, p: [[[0.5, 0.9], [-0.7, -2.6]]] },
  "!": { w: 0, p: [[[0, H], [0, 3.2]]], dots: [[0, 0]] },
  "0": { w: 5.4, p: [arc(2.7, M, 2.7, M, 0, 360)] },
  "1": { w: 3, p: [[[0, 5.6], [2.6, H], [2.6, 0]]] },
};

const TRACK = 1.3;
const SPACE = 3.4;
/** Optical kerning for open diagonal pairs (glyph units). */
const KERN: Record<string, number> = { LA: -1.2, LT: -1.6, LY: -1.4, LV: -1.2, AT: -0.9, TA: -0.9, AV: -0.9, VA: -0.9, AY: -0.9, YA: -0.9, AW: -0.6, WA: -0.6, "T.": -1, LO: -1.3, LU: -0.8, ES: -0.8, RS: -0.5, "Y ": -0.4, "T,": -1, "Y.": -0.8, "Y,": -0.8 };
const adv = (ch: string, nx = "") => (ch === " " ? SPACE : (G[ch]?.w ?? 5) + SW + TRACK + (KERN[ch + nx] ?? 0));

/** Ink width of a line in glyph units. */
export function measure(s: string): number {
  let w = 0;
  const u = s.toUpperCase();
  for (let i = 0; i < u.length; i++) w += adv(u[i], u[i + 1]);
  return w - TRACK;
}

/** Path data (stroked centerlines + dot squares as subpaths) for one line, origin at the left ink edge on the baseline. */
function lineD(s: string, u: number): string {
  let d = "";
  let cx = C;
  const up = s.toUpperCase();
  for (let i = 0; i < up.length; i++) {
    const ch = up[i];
    const g = G[ch];
    if (g) {
      for (const pl of g.p) for (let i = 0; i < pl.length; i++) d += (i ? "L" : "M") + r1((cx + pl[i][0]) * u) + " " + r1(-(C + pl[i][1]) * u);
      // a dot is a stroke segment one stroke-width long (butt caps): an exact square
      for (const q of g.dots ?? []) d += `M${r1((cx + q[0]) * u)} ${r1(-q[1] * u)}V${r1(-(q[1] + SW) * u)}`;
    }
    cx += adv(ch, up[i + 1]);
  }
  return d;
}

export interface LineOpts {
  x: number;
  /** Baseline y. */
  y: number;
  /** Ink cap height in logical units. */
  cap: number;
  /** Rotation in degrees about (x, y) (negative = rising to the right). */
  rot?: number;
  anchor?: "start" | "middle" | "end";
  fill?: string;
  attrs?: Attrs;
}

/** Letters one line of capitals. Returns the path and its ink width. */
export function letterLine(parent: Element, text: string, o: LineOpts) {
  const u = o.cap / 10;
  const w = measure(text) * u;
  const dx = o.anchor === "middle" ? -w / 2 : o.anchor === "end" ? -w : 0;
  const tf = `translate(${r1(o.x)} ${r1(o.y)}) rotate(${o.rot ?? 0}) translate(${r1(dx)} 0)`;
  const path = el("path", {
    d: lineD(text, u),
    fill: "none",
    stroke: o.fill ?? "#141414",
    "stroke-width": r1(SW * u),
    "stroke-linecap": "butt",
    "stroke-linejoin": "miter",
    "stroke-miterlimit": 2.2,
    transform: tf,
    ...(o.attrs ?? {}),
  }, parent);
  return { path, w };
}

/** Width in logical units of `text` at ink cap height `cap`. */
export const widthAt = (text: string, cap: number) => (measure(text) * cap) / 10;
