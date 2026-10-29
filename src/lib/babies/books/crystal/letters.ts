// Procedural single-stroke alphabet, rendered as felt-strip appliqué letters
// (felt stroke, darker cut edge, running stitch down the middle) or as
// embroidered backstitch labels. Units: x-height = 1, baseline y = 0, y down.

type P = [number, number];
type Stroke = P[];
interface Glyph {
  w: number;
  s: Stroke[];
  d?: P[];
}

function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number): P[] {
  const n = Math.max(4, Math.ceil(Math.abs(a1 - a0) / 10));
  const out: P[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return out;
}
const L = (...p: P[]): Stroke => p;
const cat = (...parts: P[][]): Stroke => parts.flat();
const bowl = (cx: number): Stroke => arc(cx, -0.5, 0.4, 0.5, 0, 360);

const G: Record<string, Glyph> = {
  a: { w: 0.95, s: [bowl(0.45), L([0.85, -1], [0.85, 0])] },
  b: { w: 0.95, s: [L([0.1, -1.42], [0.1, 0]), bowl(0.5)] },
  c: { w: 0.85, s: [arc(0.47, -0.5, 0.4, 0.5, 45, 315)] },
  d: { w: 0.95, s: [bowl(0.45), L([0.85, -1.42], [0.85, 0])] },
  e: { w: 0.9, s: [cat(L([0.07, -0.5], [0.86, -0.5]), arc(0.46, -0.5, 0.4, 0.5, 360, 45))] },
  f: { w: 0.66, s: [cat(L([0.28, 0], [0.28, -1.1]), arc(0.56, -1.1, 0.28, 0.32, 180, 330)), L([0.05, -1], [0.6, -1])] },
  g: { w: 0.95, s: [bowl(0.45), cat(L([0.85, -1], [0.85, 0.12]), arc(0.48, 0.12, 0.37, 0.3, 0, 150))] },
  h: { w: 0.9, s: [L([0.1, -1.42], [0.1, 0]), cat(arc(0.45, -0.6, 0.35, 0.4, 180, 360), L([0.8, -0.6], [0.8, 0]))] },
  i: { w: 0.36, s: [L([0.15, -1], [0.15, 0])], d: [[0.15, -1.36]] },
  j: { w: 0.42, s: [cat(L([0.27, -1], [0.27, 0.15]), arc(0.02, 0.15, 0.25, 0.27, 0, 130))], d: [[0.27, -1.36]] },
  k: { w: 0.82, s: [L([0.1, -1.42], [0.1, 0]), L([0.72, -1], [0.12, -0.38]), L([0.33, -0.6], [0.78, 0])] },
  l: { w: 0.36, s: [L([0.15, -1.42], [0.15, 0])] },
  m: {
    w: 1.36,
    s: [
      L([0.1, -1], [0.1, 0]),
      cat(arc(0.39, -0.6, 0.29, 0.4, 180, 360), L([0.68, -0.6], [0.68, 0])),
      cat(arc(0.97, -0.6, 0.29, 0.4, 180, 360), L([1.26, -0.6], [1.26, 0])),
    ],
  },
  n: { w: 0.9, s: [L([0.1, -1], [0.1, 0]), cat(arc(0.45, -0.6, 0.35, 0.4, 180, 360), L([0.8, -0.6], [0.8, 0]))] },
  o: { w: 0.9, s: [bowl(0.45)] },
  p: { w: 0.95, s: [L([0.1, -1], [0.1, 0.42]), bowl(0.5)] },
  q: { w: 0.95, s: [bowl(0.45), L([0.85, -1], [0.85, 0.42])] },
  r: { w: 0.66, s: [L([0.1, -1], [0.1, 0]), arc(0.45, -0.6, 0.35, 0.4, 180, 300)] },
  s: { w: 0.78, s: [cat(arc(0.39, -0.75, 0.3, 0.25, 330, 90), arc(0.39, -0.25, 0.3, 0.25, 270, 510))] },
  t: { w: 0.68, s: [cat(L([0.28, -1.3], [0.28, -0.18]), arc(0.46, -0.18, 0.18, 0.18, 180, 80)), L([0.05, -1], [0.62, -1])] },
  u: { w: 0.9, s: [cat(L([0.1, -1], [0.1, -0.4]), arc(0.45, -0.4, 0.35, 0.4, 180, 0)), L([0.8, -1], [0.8, 0])] },
  v: { w: 0.86, s: [L([0.05, -1], [0.43, 0], [0.81, -1])] },
  w: { w: 1.22, s: [L([0.05, -1], [0.33, 0], [0.61, -0.72], [0.89, 0], [1.17, -1])] },
  x: { w: 0.84, s: [L([0.08, -1], [0.76, 0]), L([0.76, -1], [0.08, 0])] },
  y: { w: 0.86, s: [L([0.05, -1], [0.45, -0.02]), L([0.81, -1], [0.3, 0.42])] },
  z: { w: 0.84, s: [L([0.08, -1], [0.76, -1], [0.08, 0], [0.78, 0])] },
  A: { w: 1.05, s: [L([0.05, 0], [0.52, -1.42], [0.99, 0]), L([0.22, -0.5], [0.82, -0.5])] },
  C: { w: 1.2, s: [arc(0.66, -0.71, 0.58, 0.71, 45, 315)] },
  I: { w: 0.42, s: [L([0.16, -1.42], [0.16, 0])] },
  L: { w: 0.85, s: [L([0.12, -1.42], [0.12, 0], [0.8, 0])] },
  N: { w: 1.08, s: [L([0.12, 0], [0.12, -1.42], [0.96, 0], [0.96, -1.42])] },
  P: { w: 0.95, s: [cat(L([0.12, 0], [0.12, -1.42], [0.5, -1.42]), arc(0.5, -1.06, 0.36, 0.36, 270, 450), L([0.5, -0.7], [0.12, -0.7]))] },
  S: { w: 0.98, s: [cat(arc(0.48, -1.07, 0.38, 0.35, 330, 90), arc(0.48, -0.36, 0.42, 0.36, 270, 510))] },
  T: { w: 0.96, s: [L([0.04, -1.42], [0.92, -1.42]), L([0.48, -1.42], [0.48, 0])] },
  U: { w: 1.06, s: [cat(L([0.12, -1.42], [0.12, -0.46]), arc(0.53, -0.46, 0.41, 0.46, 180, 0), L([0.94, -0.46], [0.94, -1.42]))] },
  ".": { w: 0.34, s: [], d: [[0.14, -0.04]] },
  ",": { w: 0.34, s: [L([0.17, -0.06], [0.06, 0.24])] },
  ":": { w: 0.36, s: [], d: [[0.15, -0.7], [0.15, -0.04]] },
  "!": { w: 0.42, s: [L([0.17, -1.42], [0.17, -0.42])], d: [[0.17, -0.04]] },
  " ": { w: 0.44, s: [] },
};

const TRACK = 0.13;
const glyph = (ch: string): Glyph => G[ch] ?? G[" "];

export function measure(word: string): number {
  let w = 0;
  for (const ch of word) w += glyph(ch).w + TRACK;
  return Math.max(0, w - TRACK);
}

/** Greedy word wrap; widths in x-height units. */
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

interface Placed {
  strokes: P[][];
  dots: P[];
}

function place(line: string, x0: number, base: number, xh: number): Placed {
  const strokes: P[][] = [];
  const dots: P[] = [];
  let x = x0;
  for (const ch of line) {
    const g = glyph(ch);
    for (const st of g.s) strokes.push(st.map(([u, v]) => [x + u * xh, base + v * xh]));
    for (const [u, v] of g.d ?? []) dots.push([x + u * xh, base + v * xh]);
    x += (g.w + TRACK) * xh;
  }
  return { strokes, dots };
}

function strokeAll(g: CanvasRenderingContext2D, p: Placed, width: number, dx = 0, dy = 0): void {
  g.lineWidth = width;
  g.beginPath();
  for (const st of p.strokes) {
    st.forEach(([x, y], i) => (i ? g.lineTo(x + dx, y + dy) : g.moveTo(x + dx, y + dy)));
  }
  g.stroke();
  for (const [x, y] of p.dots) {
    g.beginPath();
    g.arc(x + dx, y + dy, width * 0.62, 0, Math.PI * 2);
    g.fill();
  }
}

export interface FeltOpts {
  felt: string;
  edge: string;
  stitch: string;
  xh: number;
  maxW: number;
  lineH: number;
}

/** Felt-strip lettering, lines centred on cx, block centred vertically on cy. */
export function feltText(g: CanvasRenderingContext2D, text: string, cx: number, cy: number, o: FeltOpts): void {
  const lines = wrap(text, o.maxW / o.xh);
  const sw = o.xh * 0.3;
  const blockH = (lines.length - 1) * o.lineH + 1.42 * o.xh;
  const placed = lines.map((ln, i) =>
    place(ln, cx - (measure(ln) * o.xh) / 2, cy - blockH / 2 + 1.42 * o.xh + i * o.lineH, o.xh),
  );
  g.save();
  g.lineCap = "round";
  g.lineJoin = "round";
  g.strokeStyle = g.fillStyle = "rgba(40,24,10,0.28)";
  for (const p of placed) strokeAll(g, p, sw + 1, 1.6, 2.2);
  g.strokeStyle = g.fillStyle = o.edge;
  for (const p of placed) strokeAll(g, p, sw + 2);
  g.strokeStyle = g.fillStyle = o.felt;
  for (const p of placed) strokeAll(g, p, sw);
  g.strokeStyle = o.stitch;
  g.fillStyle = o.stitch;
  g.setLineDash([o.xh * 0.11, o.xh * 0.11]);
  for (const p of placed) {
    g.lineWidth = Math.max(1, o.xh * 0.045);
    g.beginPath();
    for (const st of p.strokes) st.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.stroke();
  }
  g.restore();
}

/** Embroidered backstitch label centred at (cx, cy). */
export function threadText(g: CanvasRenderingContext2D, text: string, cx: number, cy: number, xh: number, color: string): void {
  const p = place(text, cx - (measure(text) * xh) / 2, cy + 0.71 * xh, xh);
  g.save();
  g.lineCap = "round";
  g.lineJoin = "round";
  if (xh > 20) g.setLineDash([xh * 0.36, xh * 0.07]);
  g.strokeStyle = g.fillStyle = "rgba(0,0,0,0.35)";
  strokeAll(g, p, xh * 0.3, 0.8, 1.1);
  g.strokeStyle = g.fillStyle = color;
  strokeAll(g, p, xh * 0.27);
  g.restore();
}
