// The 3m paper-cut rosette: LiNbO3 seen down the c axis, holes on the projected atom columns. One 60 deg wedge (angles measured clockwise from "up", wedge = [0, 60] deg) is cut;
// unfolding along the creases at 0, 60, 120 deg reflects it into 6 sectors: point group 3m (C3v), not 6mm,
// because the wedge itself is not symmetric about its bisector (big petal at 0 deg, small petal at 60 deg).
import { circlePts, polyD, type M, type Pt } from "./kit";

const D2R = Math.PI / 180;
export const P = (r: number, deg: number): Pt => [r * Math.sin(deg * D2R), -r * Math.cos(deg * D2R)];

const sharp = (x: number) => (x >= 1 ? 0 : (1 - x) ** 2);
const round = (x: number) => (x >= 1 ? 0 : (Math.cos(Math.PI * x) + 1) / 2);
/** Outer radius of the cut along the wedge (before sawtooth). */
export const R = (deg: number) => 255 + 40 * sharp(deg / 38) + 18 * round((60 - deg) / 20);

// LiNbO3 projected along c. Hexagonal R3c cell a = 5.148 A (ch01:L38); O 18b at x = 0.04751, y = 0.34301 (ch01:L66);
// Li, Nb (6a) and the empty octahedral sites all sit on the 3-fold columns (0,0) + R-centring, so each column is one hole.
// Projection is plane group p31m: mirrors through the cation columns at 0/60/120 deg, which are the fold lines.
const A = 5.148;
const OXY: Pt = [0.04751, 0.34301];
/** Logical units per angstrom. */
export const K = 36;
const OPS: ((x: number, y: number) => Pt)[] = [(x, y) => [x, y], (x, y) => [-y, x - y], (x, y) => [-x + y, -x], (x, y) => [-y, -x], (x, y) => [-x + y, y], (x, y) => [x, x - y]];
const CEN: Pt[] = [[0, 0], [2 / 3, 1 / 3], [1 / 3, 2 / 3]];
/** Fractional (u, v) to screen logical units, origin on a cation column, +b toward up-left (mirrors at 0/60/120 deg). */
const toScreen = (u: number, v: number): Pt => [K * A * (u - v / 2), -K * A * ((Math.sqrt(3) / 2) * v)];
export const C_HOLE = 24;
const O_HOLE = 11;
const BRIDGE = 12;

/** Projected columns within rMax (logical): cation columns and O columns clustered when closer than 0.7 A. */
export function columns(rMax: number): { cat: Pt[]; oxy: Pt[][] } {
  const cat: Pt[] = [];
  const ox: Pt[] = [];
  for (let i = -4; i <= 4; i++)
    for (let j = -4; j <= 4; j++)
      for (const [cu, cv] of CEN) {
        const c = toScreen(cu + i, cv + j);
        if (Math.hypot(c[0], c[1]) < rMax) cat.push(c);
        for (const op of OPS) {
          const [u, v] = op(OXY[0], OXY[1]);
          const p = toScreen(u + cu + i, v + cv + j);
          if (Math.hypot(p[0], p[1]) < rMax && !ox.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.5)) ox.push(p);
        }
      }
  const groups: Pt[][] = [];
  for (const p of ox) {
    const near = groups.filter((g) => g.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.7 * K));
    const merged = near.flat().concat([p]);
    for (const g of near) groups.splice(groups.indexOf(g), 1);
    groups.push(merged);
  }
  return { cat, oxy: groups };
}

/** Union of circles (all containing their centroid) as a star polygon about the centroid. */
function blob(cs: Pt[], r: number, n = 36): Pt[] {
  const cx = cs.reduce((s, p) => s + p[0], 0) / cs.length;
  const cy = cs.reduce((s, p) => s + p[1], 0) / cs.length;
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    let t = 0;
    for (const [x, y] of cs) {
      const ex = x - cx;
      const ey = y - cy;
      const b = dx * ex + dy * ey;
      const disc = b * b - (ex * ex + ey * ey) + r * r;
      if (disc > 0) t = Math.max(t, b + Math.sqrt(disc));
    }
    out.push([cx + t * dx, cy + t * dy]);
  }
  return out;
}
/** Angle folded into the wedge [0, 60] by the 3m symmetry. */
const wedgeAngle = (p: Pt) => {
  let th = ((Math.atan2(p[0], -p[1]) / D2R) % 120 + 120) % 120;
  if (th > 60) th = 120 - th;
  return th;
};
const fits = (poly: Pt[]) => poly.every((p) => Math.hypot(p[0], p[1]) <= R(wedgeAngle(p)) - BRIDGE);
const hexPts = (c: Pt, r: number): Pt[] => [0, 1, 2, 3, 4, 5].map((k) => [c[0] + r * Math.sin(k * 60 * D2R), c[1] - r * Math.cos(k * 60 * D2R)] as Pt);

/** Sutherland-Hodgman clip: keep points with s*(nx*x + ny*y) >= 0. */
function clipHalf(poly: Pt[], nx: number, ny: number, s: number): Pt[] {
  const out: Pt[] = [];
  const f = (p: Pt) => s * (nx * p[0] + ny * p[1]);
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const fa = f(a);
    const fb = f(b);
    if (fa >= 0) out.push(a);
    if (fa >= 0 !== fb >= 0) {
      const k = fa / (fa - fb);
      out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
    }
  }
  return out;
}
const clipWedge = (poly: Pt[]) => clipHalf(clipHalf(poly, 1, 0, 1), Math.cos(60 * D2R), Math.sin(60 * D2R), -1);

/** Crescent moon: outer half circle radius Rr bulging toward dirDeg, inner half ellipse squashed by k. */
export function crescent(c: Pt, Rr: number, k: number, dirDeg: number, n = 20): Pt[] {
  const d: Pt = [Math.sin(dirDeg * D2R), -Math.cos(dirDeg * D2R)];
  const q: Pt = [-d[1], d[0]];
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / n;
    out.push([c[0] + Rr * (Math.cos(a) * d[0] + Math.sin(a) * q[0]), c[1] + Rr * (Math.cos(a) * d[1] + Math.sin(a) * q[1])]);
  }
  for (let i = n - 1; i > 0; i--) {
    const a = -Math.PI / 2 + (Math.PI * i) / n;
    out.push([c[0] + Rr * (k * Math.cos(a) * d[0] + Math.sin(a) * q[0]), c[1] + Rr * (k * Math.cos(a) * d[1] + Math.sin(a) * q[1])]);
  }
  return out;
}

/** Wedge paper path (evenodd: outline + holes) and the crease path along its two fold edges. */
export function wedge(): { paper: string; crease: string; cations: Pt[] } {
  const outline: Pt[] = [[0, 0]];
  for (let i = 0; i <= 40; i++) {
    const deg = i * 1.5;
    const tooth = i % 2 === 1 && deg > 2.5 && deg < 57.5 ? 10 : 0;
    outline.push(P(R(deg) + tooth, deg));
  }
  const { cat, oxy } = columns(320);
  const holes: Pt[][] = [];
  const cations: Pt[] = [];
  for (const c of cat) {
    const h = hexPts(c, C_HOLE);
    if (fits(h)) {
      holes.push(h);
      cations.push(c);
    }
  }
  for (const g of oxy) {
    const h = g.length > 1 ? blob(g, O_HOLE) : circlePts(g[0][0], g[0][1], O_HOLE, 24);
    if (fits(h)) holes.push(h);
  }
  let paper = polyD(outline);
  for (const h of holes) {
    const c = clipWedge(h);
    if (c.length > 2) paper += polyD(c);
  }
  const a = P(R(0), 0);
  const b = P(R(60), 60);
  const crease = `M0 0L${a[0].toFixed(1)} ${a[1].toFixed(1)}M0 0L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  return { paper, crease, cations };
}

/** Flip across the line through the origin at angle phi (deg, clockwise from up): normal component scaled by c. */
export function flip(phi: number, c: number): M {
  const nx = Math.cos(phi * D2R);
  const ny = Math.sin(phi * D2R);
  const k = c - 1;
  return [1 + k * nx * nx, k * nx * ny, k * nx * ny, 1 + k * ny * ny, 0, 0];
}
