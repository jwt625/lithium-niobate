// Leaded wave ribbons: a wave drawn as a strip of glass, one pane per half wave, lit pane by pane as the light arrives.
// Phase is integrated along x with a local wavelength, so a pane lights every half period whatever the speed:
// where crests are closer, the light front advances more slowly (phase velocity = wavelength x frequency).
import { ribbon, pane, type Pane, type Pt } from "./kit";

export interface LaneSpec {
  x0: number;
  x1: number;
  /** Centerline y at x. */
  yc: (x: number) => number;
  /** Local wavelength at x (logical units). */
  lam: (x: number) => number;
  amp: number;
  /** Optional amplitude envelope 0..1 at x. */
  ampAt?: (x: number) => number;
  /** Wiggle direction in the picture plane (unit-ish); (0,-1) = up and down, oblique = side to side in projection. */
  dir: Pt;
  hw: number;
  colors: [string, string];
  phase0?: number;
}
export interface Lane {
  panes: Pane[];
  /** Phase (in half waves) at the start of each pane. */
  start: number[];
  /** Total half waves. */
  total: number;
  /** Point on the centerline at half-wave count h (for the travelling head). */
  at(h: number): Pt;
  /** Glow-only paths, same as panes' paths. */
  paths: Path2D[];
  centers: Pt[];
}

export function makeLane(sp: LaneSpec): Lane {
  const dx = 2;
  const xs: number[] = [];
  const ph: number[] = [];
  let p = sp.phase0 ?? 0;
  for (let x = sp.x0; x <= sp.x1 + 1e-6; x += dx) {
    xs.push(x);
    ph.push(p);
    p += (2 * dx) / sp.lam(x + dx / 2); // half waves
  }
  const pt = (i: number): Pt => {
    const s = Math.sin(ph[i] * Math.PI) * (sp.ampAt ? sp.ampAt(xs[i]) : 1);
    return [xs[i] + sp.dir[0] * sp.amp * s, sp.yc(xs[i]) + sp.dir[1] * sp.amp * s];
  };
  const panes: Pane[] = [];
  const start: number[] = [];
  const centers: Pt[] = [];
  const h0 = Math.floor(ph[0]);
  const total = ph[ph.length - 1];
  for (let h = h0; h < total; h++) {
    const c: Pt[] = [];
    let ci: Pt = [0, 0];
    const n = xs.length;
    for (let i = 0; i < n; i++) if (ph[Math.min(i + 1, n - 1)] >= h && ph[Math.max(i - 1, 0)] <= h + 1) c.push(pt(i));
    if (c.length < 2) continue;
    ci = c[Math.floor(c.length / 2)];
    panes.push(pane(ribbon(c, sp.hw), sp.colors[((h % 2) + 2) % 2], 0.45, 8));
    start.push(Math.max(h, ph[0]));
    centers.push(ci);
  }
  const at = (h: number): Pt => {
    if (h <= ph[0]) return pt(0);
    for (let i = 0; i + 1 < ph.length; i++) if (ph[i + 1] >= h) return pt(i);
    return pt(ph.length - 1);
  };
  return { panes, start, total, at, paths: panes.map((q) => q.path), centers };
}

/** Straight leaded channel split into panes of length `step` along a polyline. */
export function channel(pts: Pt[], hw: number, step: number, colors: string[]): { panes: Pane[]; mid: Pt[]; len: number[] } {
  // resample polyline by arc length
  const acc: number[] = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = acc[acc.length - 1];
  const P = (s: number): Pt => {
    let i = 1;
    while (i < acc.length - 1 && acc[i] < s) i++;
    const k = (s - acc[i - 1]) / (acc[i] - acc[i - 1] || 1);
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
  };
  const n = Math.max(1, Math.round(total / step));
  const panes: Pane[] = [];
  const mid: Pt[] = [];
  const len: number[] = [];
  for (let j = 0; j < n; j++) {
    const a = (total * j) / n;
    const b = (total * (j + 1)) / n;
    const c: Pt[] = [];
    for (let s = a; s < b; s += 4) c.push(P(s));
    c.push(P(b));
    panes.push(pane(ribbon(c, hw), colors[j % colors.length], 0.45, 8));
    mid.push(P((a + b) / 2));
    len.push((a + b) / 2);
  }
  return { panes, mid, len };
}

