// Bayeux-style embroidery kit: wool stitches on linen, generated as seeded stitch lists and
// drawn as short thick strokes (shadow, body, sheen). Stem stitch for outlines and letters,
// laid work (parallel threads filling a shape) held down by couching bars and tie stitches.
// Logical units: 1000 = stage width. Strip (world) x runs along the whole book.

export type Ctx = CanvasRenderingContext2D;
export type Rng = () => number;
export type Pt = [number, number];

/** Limited wool palette (DevLog-007b, 07 History). */
export const W = {
  linen: "#E8DEC7",
  terra: "#A8432F",
  ochre: "#C8A23C",
  sage: "#6F8B5A",
  teal: "#2F4A4F",
  indigo: "#33456E",
  buff: "#D8C39A",
  brown: "#3B2A20",
  rust: "#8A5A3C",
  olive: "#B9B07A",
  maroon: "#5E2F2A",
};

export const clamp = (x: number, a = 0, b = 1): number => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
export const ease = (x: number): number => 1 - (1 - clamp(x)) ** 3;
export const easeIO = (x: number): number => {
  const k = clamp(x);
  return k * k * (3 - 2 * k);
};

function hex(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(c: string, to: number, k: number): string {
  const [r, g, b] = hex(c);
  const f = (v: number): number => Math.round(v + (to - v) * k);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
const shade = new Map<string, [string, string]>();
function tones(c: string): [string, string] {
  let t = shade.get(c);
  if (!t) {
    t = [mix(c, 0, 0.38), mix(c, 255, 0.3)];
    shade.set(c, t);
  }
  return t;
}

/** Stitch kinds: 0 laid thread, 1 couching (bar and ties), 2 stem / outline. */
export interface Run {
  col: string;
  w: number;
  k: 0 | 1 | 2;
  s: number[]; // x1 y1 x2 y2 per stitch
}

/** One embroidered element: reveal runs outline first, then laid fill, then couching. */
export interface Item {
  runs: Run[];
  /** Overlaps no other item (may be baked out of order). */
  free?: boolean;
  t0: number;
  dur: number;
  n: [number, number, number];
}

export function item(runs: Run[], t0 = 0, dur = 0.8): Item {
  const n: [number, number, number] = [0, 0, 0];
  for (const r of runs) n[r.k] += r.s.length / 4;
  return { runs, t0, dur, n };
}

/** Reveal windows per kind (laid, couching, stem), squeezed to the kinds an item has. */
function phases(n: [number, number, number]): [number, number][] {
  const laid = n[0] > 0, couch = n[1] > 0;
  if (!laid && !couch) return [[0, 1], [0, 1], [0, 1]];
  if (!couch) return [[0.35, 1], [0, 1], [0, 0.5]];
  return [[0.3, 0.85], [0.72, 1], [0, 0.45]];
}

function strokes(g: Ctx, s: number[], a: number, b: number, dx: number, dy: number, trim: number): void {
  g.beginPath();
  for (let i = a; i < b; i++) {
    const j = i * 4;
    let x1 = s[j], y1 = s[j + 1], x2 = s[j + 2], y2 = s[j + 3];
    if (trim) {
      const ex = (x2 - x1) * trim, ey = (y2 - y1) * trim;
      x1 += ex; y1 += ey; x2 -= ex; y2 -= ey;
    }
    g.moveTo(x1 + dx, y1 + dy);
    g.lineTo(x2 + dx, y2 + dy);
  }
  g.stroke();
}

/** Draw the first `cnt` stitches of a run as wool: shadow, body, sheen. */
export function drawRun(g: Ctx, r: Run, cnt = Infinity): void {
  const m = Math.min(r.s.length / 4, cnt);
  if (m <= 0) return;
  const [lo, hi] = tones(r.col);
  const w = r.w;
  g.lineCap = "round";
  g.strokeStyle = lo;
  g.lineWidth = w + (w >= 3 ? 1.4 : 0.3);
  strokes(g, r.s, 0, m, 0.7, 1, 0);
  g.strokeStyle = r.col;
  g.lineWidth = w;
  strokes(g, r.s, 0, m, 0, 0, 0);
  if (w >= 3) {
    g.strokeStyle = hi;
    g.lineWidth = Math.max(1, w * 0.3);
    strokes(g, r.s, 0, m, -w * 0.16, -w * 0.18, 0.22);
  }
}

/** Draw an item revealed to fraction f (0..1). Laid under couching under stem. */
export function drawItem(g: Ctx, it: Item, f: number): void {
  if (f <= 0) return;
  const ph = phases(it.n);
  for (const k of [0, 1, 2] as const) {
    const [a, b] = ph[k];
    const kf = f >= 1 ? 1 : clamp((f - a) / (b - a));
    if (kf <= 0) continue;
    let left = kf >= 1 ? Infinity : Math.floor(it.n[k] * kf);
    for (const r of it.runs) {
      if (r.k !== k) continue;
      const c = r.s.length / 4;
      drawRun(g, r, left);
      left -= c;
      if (left <= 0) break;
    }
  }
}

export function itemAt(it: Item, t: number): number {
  return it.dur <= 0 ? 1 : clamp((t - it.t0) / it.dur);
}

// ---------- geometry ----------

export function ellipse(cx: number, cy: number, rx: number, ry: number, n = 28, a0 = 0): Pt[] {
  const o: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = a0 + (i / n) * Math.PI * 2;
    o.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return o;
}

/** Arc points, angles in degrees, y down (90 = bottom). */
export function arcPts(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, step = 12): Pt[] {
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / step));
  const o: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    o.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return o;
}

/** Quadratic / cubic Bezier sampled to points. */
export function bez(p0: Pt, p1: Pt, p2: Pt, p3?: Pt, n = 14): Pt[] {
  const o: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    if (p3) {
      o.push([
        u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
      ]);
    } else {
      o.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]);
    }
  }
  return o;
}

/** Thick polyline as a closed polygon (limbs, poles, cables). */
export function limb(pts: Pt[], w0: number, w1 = w0): Pt[] {
  const L: Pt[] = [], R: Pt[] = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const d = Math.hypot(dx, dy) || 1;
    dx /= d; dy /= d;
    const hw = lerp(w0, w1, i / Math.max(1, n - 1)) / 2;
    L.push([pts[i][0] - dy * hw, pts[i][1] + dx * hw]);
    R.push([pts[i][0] + dy * hw, pts[i][1] - dx * hw]);
  }
  return [...L, ...R.reverse()];
}

/** Even-odd point-in-polygon test. */
export function inside(q: Pt, poly: Pt[]): boolean {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if (a[1] > q[1] !== b[1] > q[1] && q[0] < ((b[0] - a[0]) * (q[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}

export function shift(p: Pt[], dx: number, dy: number): Pt[] {
  return p.map(([x, y]) => [x + dx, y + dy]);
}

// ---------- stitch generators ----------

export class Emb {
  runs: Run[] = [];
  rng: Rng;
  constructor(rng: Rng) {
    this.rng = rng;
  }

  j(a: number): number {
    return (this.rng() - 0.5) * 2 * a;
  }

  take(): Run[] {
    const r = this.runs;
    this.runs = [];
    return r;
  }

  /** Stem stitch along a polyline: overlapping slanted stitches, a twisted rope line. */
  stem(pts: Pt[], col: string, w = 6, len = 12, closed = false): void {
    const p = closed ? [...pts, pts[0]] : pts;
    const cum: number[] = [0];
    for (let i = 1; i < p.length; i++) cum.push(cum[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
    const total = cum[cum.length - 1];
    const s: number[] = [];
    if (total < 1) {
      this.runs.push({ col, w, k: 2, s: [p[0][0] - 1, p[0][1], p[0][0] + 1, p[0][1]] });
      return;
    }
    let seg = 0;
    const at = (d: number): [number, number, number, number] => {
      d = clamp(d, 0, total);
      while (seg < cum.length - 2 && cum[seg + 1] < d) seg++;
      while (seg > 0 && cum[seg] > d) seg--;
      const a = p[seg], b = p[seg + 1];
      const l = cum[seg + 1] - cum[seg] || 1;
      const k = (d - cum[seg]) / l;
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, (b[0] - a[0]) / l, (b[1] - a[1]) / l];
    };
    const L = Math.min(len, total);
    const n = Math.max(1, Math.ceil((total - L) / (L * 0.5)) + 1);
    const step = n > 1 ? (total - L) / (n - 1) : 0;
    const off = w * 0.24;
    for (let i = 0; i < n; i++) {
      const d0 = i * step;
      const [x1, y1, tx1, ty1] = at(d0);
      const [x2, y2, tx2, ty2] = at(d0 + L);
      s.push(
        x1 - ty1 * off + this.j(0.5), y1 + tx1 * off + this.j(0.5),
        x2 + ty2 * off + this.j(0.5), y2 - tx2 * off + this.j(0.5),
      );
    }
    this.runs.push({ col, w, k: 2, s });
  }

  /** Closed outline in stem stitch. */
  outline(poly: Pt[], col: string, w = 5, len = 11): void {
    this.stem(poly, col, w, len, true);
  }

  /** Laid work: parallel threads across a polygon at `ang` degrees, then couching bars across them. */
  laid(poly: Pt[], col: string, ang = 0, opt: { w?: number; gap?: number; couch?: string | null; cg?: number; cw?: number } = {}): void {
    const w = opt.w ?? 6;
    const gap = opt.gap ?? w * 0.82;
    const a = (ang * Math.PI) / 180;
    const ca = Math.cos(a), sa = Math.sin(a);
    // rotate polygon so threads run along +x
    const rp = poly.map(([x, y]): Pt => [x * ca + y * sa, -x * sa + y * ca]);
    const back = (u: number, v: number): Pt => [u * ca - v * sa, u * sa + v * ca];
    const scan = (rpoly: Pt[], g: number, inset: number, jit: number): [Pt, Pt][] => {
      let y0 = Infinity, y1 = -Infinity;
      for (const q of rpoly) {
        y0 = Math.min(y0, q[1]);
        y1 = Math.max(y1, q[1]);
      }
      const out: [Pt, Pt][] = [];
      const n = rpoly.length;
      for (let v = y0 + g * 0.5; v < y1; v += g) {
        const xs: number[] = [];
        for (let i = 0; i < n; i++) {
          const p = rpoly[i], q = rpoly[(i + 1) % n];
          if ((p[1] <= v && q[1] > v) || (q[1] <= v && p[1] > v)) xs.push(p[0] + ((v - p[1]) / (q[1] - p[1])) * (q[0] - p[0]));
        }
        xs.sort((m, k) => m - k);
        for (let i = 0; i + 1 < xs.length; i += 2) {
          const u0 = xs[i] + inset, u1 = xs[i + 1] - inset;
          if (u1 - u0 < 1.5) continue;
          const vv = v + this.j(jit);
          out.push([back(u0 + this.j(0.8), vv), back(u1 + this.j(0.8), vv)]);
        }
      }
      return out;
    };
    const s: number[] = [];
    for (const [p, q] of scan(rp, gap, w * 0.3, 0.35)) s.push(p[0], p[1], q[0], q[1]);
    this.runs.push({ col, w, k: 0, s });
    if (opt.couch === null) return;
    // couching bars perpendicular to the laid threads, tied down by small stitches
    const cc = opt.couch ?? mix(col, 0, 0.2);
    const cg = opt.cg ?? 30;
    const cw = opt.cw ?? 2.6;
    const bars: number[] = [];
    const ties: number[] = [];
    // perpendicular frame: rotate by ang + 90
    const b = a + Math.PI / 2;
    const cb = Math.cos(b), sb = Math.sin(b);
    const rq = poly.map(([x, y]): Pt => [x * cb + y * sb, -x * sb + y * cb]);
    const backq = (u: number, v: number): Pt => [u * cb - v * sb, u * sb + v * cb];
    let y0 = Infinity, y1 = -Infinity;
    for (const q of rq) {
      y0 = Math.min(y0, q[1]);
      y1 = Math.max(y1, q[1]);
    }
    const ph = this.rng() * cg;
    const n = rq.length;
    for (let v = y0 + ph + cg * 0.4; v < y1 - 4; v += cg) {
      const xs: number[] = [];
      for (let i = 0; i < n; i++) {
        const p = rq[i], q = rq[(i + 1) % n];
        if ((p[1] <= v && q[1] > v) || (q[1] <= v && p[1] > v)) xs.push(p[0] + ((v - p[1]) / (q[1] - p[1])) * (q[0] - p[0]));
      }
      xs.sort((m, k) => m - k);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        const u0 = xs[i] + 3, u1 = xs[i + 1] - 3;
        if (u1 - u0 < 6) continue;
        const vv = v + this.j(1);
        const p0 = backq(u0, vv), p1 = backq(u1, vv);
        bars.push(p0[0], p0[1], p1[0], p1[1]);
        for (let u = u0 + 5; u < u1 - 2; u += 9) {
          const t0 = backq(u, vv - 2.6), t1 = backq(u + 0.6, vv + 2.6);
          ties.push(t0[0], t0[1], t1[0], t1[1]);
        }
      }
    }
    this.runs.push({ col: cc, w: cw, k: 1, s: bars });
    this.runs.push({ col: cc, w: 1.3, k: 1, s: ties });
  }

  /** Laid fill plus stem outline in one call. */
  shape(poly: Pt[], fill: string, line: string, ang = 0, lw = 5, opt: { w?: number; gap?: number; couch?: string | null; cg?: number } = {}): void {
    this.laid(poly, fill, ang, opt);
    this.outline(poly, line, lw);
  }

  /** Tiny knot (eye, dot): two crossing short stitches. */
  knot(x: number, y: number, col: string, r = 3.2): void {
    this.runs.push({ col, w: r * 1.3, k: 2, s: [x - r * 0.6, y - r * 0.5, x + r * 0.6, y + r * 0.5, x - r * 0.6, y + r * 0.5, x + r * 0.6, y - r * 0.5] });
  }
}
