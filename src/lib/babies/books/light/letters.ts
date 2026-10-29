// Grisaille lettering: a broad-nib round hand (foundational minuscule, plain Roman capitals) painted in dark vitreous
// paint on pale banner glass. Each glyph is a skeleton; the nib (fixed angle) sweeps it into thick and thin strokes.
// Glyph units: x-height 1, baseline y = 0, y down; ascender/capital -1.45, descender +0.45.
import { G, pane, rectPts, type Ctx, type Pt, type Win } from "./kit";

type Glyph = { w: number; s: Pt[][]; dots?: Pt[] };

const D2R = Math.PI / 180;
function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number): Pt[] {
  const n = Math.max(6, Math.ceil(Math.abs(a1 - a0) / 9));
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (a0 + ((a1 - a0) * i) / n) * D2R;
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return out;
}
const L = (...p: Pt[]): Pt[] => p;
const cat = (...parts: Pt[][]): Pt[] => parts.flat();
const bowlL = arc(0.47, -0.5, 0.43, 0.5, 0, 360); // bowl for a, d, g, q (stem on the right)
const bowlR = arc(0.55, -0.5, 0.43, 0.5, 0, 360); // bowl for b, p (stem on the left)
const arch = (x0: number, x1: number): Pt[] => cat(arc((x0 + x1) / 2, -0.58, (x1 - x0) / 2, 0.42, 180, 360), L([x1, -0.58], [x1, 0]));

const S_UP = arc(0.4, -0.75, 0.3, 0.25, -25, -270);
const S_LO = arc(0.4, -0.25, 0.33, 0.25, -90, 155);

const GL: Record<string, Glyph> = {
  a: { w: 0.98, s: [bowlL, L([0.9, -1], [0.9, -0.08], [0.98, 0])] },
  b: { w: 1.0, s: [L([0.12, -1.45], [0.12, 0]), bowlR] },
  c: { w: 0.88, s: [arc(0.5, -0.5, 0.44, 0.5, -42, -318)] },
  d: { w: 1.0, s: [bowlL, L([0.9, -1.45], [0.9, -0.08], [0.98, 0])] },
  e: { w: 0.92, s: [cat(L([0.08, -0.52], [0.93, -0.52]), arc(0.5, -0.5, 0.43, 0.5, -3, -320))] },
  f: { w: 0.68, s: [cat(L([0.3, 0], [0.3, -1.15]), arc(0.56, -1.15, 0.26, 0.3, 180, 325)), L([0.04, -0.98], [0.62, -0.98])] },
  g: { w: 0.98, s: [bowlL, cat(L([0.9, -1], [0.9, 0.15]), arc(0.5, 0.15, 0.4, 0.3, 0, 160))] },
  h: { w: 0.98, s: [L([0.12, -1.45], [0.12, 0]), cat(L([0.12, -0.58]), arch(0.12, 0.86).slice(1))] },
  i: { w: 0.3, s: [L([0.15, -1], [0.15, 0])], dots: [[0.15, -1.33]] },
  j: { w: 0.4, s: [cat(L([0.28, -1], [0.28, 0.18]), arc(0.04, 0.18, 0.24, 0.27, 0, 135))], dots: [[0.28, -1.33]] },
  k: { w: 0.86, s: [L([0.12, -1.45], [0.12, 0]), L([0.76, -1], [0.14, -0.4]), L([0.36, -0.6], [0.84, 0])] },
  l: { w: 0.42, s: [cat(L([0.14, -1.45], [0.14, -0.18]), arc(0.32, -0.18, 0.18, 0.18, 180, 90))] },
  m: { w: 1.5, s: [L([0.12, -1], [0.12, 0]), arch(0.12, 0.8), arch(0.8, 1.48)] },
  n: { w: 0.98, s: [L([0.12, -1], [0.12, 0]), arch(0.12, 0.86)] },
  o: { w: 1.0, s: [arc(0.5, -0.5, 0.46, 0.5, 0, 360)] },
  p: { w: 1.0, s: [L([0.12, -1], [0.12, 0.45]), bowlR] },
  r: { w: 0.68, s: [L([0.12, -1], [0.12, 0]), arc(0.47, -0.58, 0.35, 0.42, 180, 305)] },
  s: { w: 0.8, s: [cat(S_UP, S_LO)] },
  t: { w: 0.66, s: [cat(L([0.28, -1.3], [0.28, -0.2]), arc(0.48, -0.2, 0.2, 0.2, 180, 70)), L([0.03, -0.98], [0.62, -0.98])] },
  u: { w: 0.98, s: [cat(L([0.12, -1], [0.12, -0.42]), arc(0.49, -0.42, 0.37, 0.42, 180, 0)), L([0.86, -1], [0.86, -0.08], [0.94, 0])] },
  v: { w: 0.9, s: [L([0.04, -1], [0.45, 0], [0.86, -1])] },
  w: { w: 1.32, s: [L([0.04, -1], [0.34, 0], [0.66, -0.75], [0.98, 0], [1.28, -1])] },
  y: { w: 0.9, s: [L([0.04, -1], [0.47, -0.02]), L([0.88, -1], [0.42, 0.12], [0.2, 0.45])] },
  A: { w: 1.22, s: [L([0.04, 0], [0.61, -1.45], [1.18, 0]), L([0.3, -0.5], [0.94, -0.5])] },
  I: { w: 0.32, s: [L([0.16, -1.45], [0.16, 0])] },
  L: { w: 0.92, s: [L([0.14, -1.45], [0.14, 0], [0.9, 0])] },
  N: { w: 1.2, s: [L([0.12, 0], [0.12, -1.45], [1.06, 0], [1.06, -1.45])] },
  S: { w: 0.98, s: [cat(arc(0.48, -1.1, 0.38, 0.35, -25, -270), arc(0.48, -0.37, 0.42, 0.37, -90, 155))] },
  T: { w: 1.1, s: [L([0.02, -1.45], [1.08, -1.45]), L([0.55, -1.45], [0.55, 0])] },
  ".": { w: 0.22, s: [], dots: [[0.11, -0.05]] },
  ",": { w: 0.24, s: [L([0.15, -0.08], [0.02, 0.3])], dots: [[0.13, -0.06]] },
  ":": { w: 0.22, s: [], dots: [[0.11, -0.72], [0.11, -0.05]] },
  "!": { w: 0.26, s: [L([0.13, -1.45], [0.13, -0.42])], dots: [[0.13, -0.05]] },
};

const NIB = 0.23; // nib width in x-heights
const NIB_A = 32 * D2R; // nib edge angle to the writing line
const TRACK = 0.13;
const SPACE = 0.58;

const WIDE = "\u2003"; // a word gap that carries a vertical lead
const adv = (ch: string): number => (ch === " " ? SPACE : ch === WIDE ? SPACE + 0.55 : (GL[ch]?.w ?? 0.8) + TRACK);
const posOf = (s: string, i: number): number => {
  let a = 0;
  for (let j = 0; j < i; j++) a += adv(s[j]);
  return a;
};
export function measure(s: string): number {
  let w = 0;
  for (const ch of s) w += adv(ch);
  return w - TRACK;
}

/** Adds one line of broad-nib strokes to a path (x = left edge, y = baseline, u = logical units per x-height). */
function linePath(p: Path2D, s: string, x: number, y: number, u: number): void {
  const hx = Math.cos(NIB_A) * NIB * 0.5 * u;
  const hy = -Math.sin(NIB_A) * NIB * 0.5 * u;
  const quad = (a: Pt, b: Pt) => {
    // parallelogram swept by the nib from a to b, always wound the same way (nonzero union, no holes)
    const cr = (b[0] - a[0]) * hy - (b[1] - a[1]) * hx;
    const q: Pt[] = [[a[0] + hx, a[1] + hy], [b[0] + hx, b[1] + hy], [b[0] - hx, b[1] - hy], [a[0] - hx, a[1] - hy]];
    if (cr < 0) q.reverse();
    p.moveTo(q[0][0], q[0][1]);
    for (let i = 1; i < 4; i++) p.lineTo(q[i][0], q[i][1]);
    p.closePath();
  };
  let cx = x;
  for (const ch of s) {
    const g = GL[ch];
    if (g) {
      for (const st of g.s) {
        const pts = st.map(([gx, gy]) => [cx + gx * u, y + gy * u] as Pt);
        for (let i = 0; i + 1 < pts.length; i++) quad(pts[i], pts[i + 1]);
      }
      for (const [dx, dy] of g.dots ?? []) {
        const c: Pt = [cx + dx * u, y + dy * u];
        const r = NIB * 0.55 * u;
        p.moveTo(c[0], c[1] - r);
        p.lineTo(c[0] + r, c[1]);
        p.lineTo(c[0], c[1] + r);
        p.lineTo(c[0] - r, c[1]);
        p.closePath();
      }
    }
    cx += adv(ch) * u;
  }
}

/** Paint lines of text centred on cx (first baseline `base`, pitch `lh`) with grisaille paint. */
export function paintLines(g: Ctx, lines: string[], cx: number, base: number, xh: number, lh: number, color = G.paint): void {
  const p = new Path2D();
  lines.forEach((s, i) => linePath(p, s, cx - (measure(s) * xh) / 2, base + i * lh, xh));
  g.save();
  // faint matt halo (glass painters' wash), then the trace line
  g.fillStyle = "rgba(80,50,20,0.18)";
  g.translate(1.6, 1.6);
  g.fill(p);
  g.translate(-1.6, -1.6);
  g.fillStyle = color;
  g.fill(p);
  g.restore();
}

export const BANNER = { y0: 680, y1: 954, x0: 46, x1: 954, xh: 34 };

/**
 * Leaded text banner: one row of warm white glass per line, split by vertical leads in word gaps, painted lettering.
 * The banner box is the same on every page; rows = lines (min 2).
 */
export function banner(w: Win, text: string[]): void {
  const { y0, y1, x0, x1 } = BANNER;
  // a vertical lead goes only at a phrase break inside the line (the word gap after , : . !), widened for clearance;
  // rows without one get short leads in the margins beyond the text instead
  const lines = text.map((s) => {
    let best = -1;
    const mid = measure(s) / 2;
    for (let i = 1; i < s.length - 1; i++)
      if (s[i] === " " && ",:.!".includes(s[i - 1]) && (best < 0 || Math.abs(posOf(s, i) - mid) < Math.abs(posOf(s, best) - mid))) best = i;
    return best < 0 ? s : s.slice(0, best) + WIDE + s.slice(best + 1);
  });
  // one letter size per page: the book size, shrunk only if the longest line would not fit (never below 30)
  const xh = Math.max(30, Math.min(BANNER.xh, (x1 - x0 - 44) / Math.max(...lines.map(measure))));
  const rows = Math.max(2, lines.length);
  const rh = (y1 - y0) / rows;
  const cx = (x0 + x1) / 2;
  const tints = ["#F1E7CB", "#ECE1C2", "#F3EAD2", "#E9DDBB"];
  for (let r = 0; r < rows; r++) {
    const ya = y0 + r * rh;
    const s = lines[r];
    const k = s ? s.indexOf(WIDE) : -1;
    const half = s ? (measure(s) * xh) / 2 : 0;
    const pad = 0.75 * xh; // clearance from the outermost glyph to a margin lead
    let cuts: number[];
    if (k >= 0) cuts = [cx - half + (posOf(s, k) + adv(WIDE) / 2) * xh];
    else if (!s) cuts = [cx];
    else if (cx - half - pad - x0 >= 40) cuts = [cx - half - pad, cx + half + pad];
    else cuts = [];
    const xs = [x0, ...cuts, x1];
    for (let i = 0; i + 1 < xs.length; i++) w.add(pane(rectPts(xs[i], ya, xs[i + 1], ya + rh), tints[(r + i) % tints.length], 0.35, 8));
  }
  paintLines(w.glass, lines, cx, y0 + rh / 2 + xh * 0.5, xh, rh);
}
