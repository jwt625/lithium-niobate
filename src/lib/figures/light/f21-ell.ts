// F2-03 Index ellipsoid at E = 0, chapter 2.1 L2: section normal to the wave vector k (polar angle theta from c, azimuth
// phi), the two eigen-indices n_o and n_e(theta) (crystaloptics.eigenIndices on B0, checked against extraordinaryIndex),
// and the extraordinary walk-off rho (crystaloptics.walkoffAngle; maximum from ellipsoid.maxWalkoff).
// Drawing (both variants): semi-axes 1 + G (n_i / nbar - 1), G = 10, nbar = (2 n_o + n_e)/3, so the 3% birefringence is
// visible; the drawn Poynting vector is the normal of the drawn surface (walk-off of the drawn ellipsoid). Numbers exact.
// TECH: ASCII z-buffer render (fixed 64 x 27 characters) with the section ellipse in line characters, plus rho(theta) plot.
import { eigenIndices, extraordinaryIndex, impermeability, walkoffAngle } from "$lib/physics/crystaloptics.ts";
import { maxWalkoff } from "$lib/physics/ellipsoid.ts";
import { nCLN } from "../optics.ts";
import { FS } from "../fmt.ts";
import { axes, frame, path, c, type Frame } from "./plot.ts";
import { fw } from "./f21-common.ts";

const DEG = Math.PI / 180;
export const G_DRAW = 10;
export interface Ell21 { th: number; ph: number; lam: number }
/** theta and phi in degrees, lambda in um. */
export const e21: Ell21 = { th: 40, ph: 30, lam: 1.55 };
export const LAM0 = 0.4, LAM1 = 5.0;
export const lamOf = (s: number): number => LAM0 * (LAM1 / LAM0) ** (s / 1000);
export const sOfLam = (l: number): number => Math.round((Math.log(l / LAM0) / Math.log(LAM1 / LAM0)) * 1000);

export function ell21Numbers(st: Ell21) {
  const no = nCLN("o", st.lam), ne = nCLN("e", st.lam), th = st.th * DEG, ph = st.ph * DEG;
  const k: [number, number, number] = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)];
  const s = eigenIndices(impermeability(no, ne), k);
  const nth = extraordinaryIndex(th, no, ne);
  const rho = walkoffAngle(th, no, ne) / DEG;
  const mx = maxWalkoff(no, ne);
  return { no, ne, nLo: s.nLo, nHi: s.nHi, nth, rho, mx };
}
export interface Ell21Ro { lam: string; no: string; nth: string; dn: string; rho: string; mx: string }
export function ell21Readout(st: Ell21): Ell21Ro {
  const n = ell21Numbers(st);
  return {
    lam: `${String(Math.round(st.lam * 1000)).padStart(4, FS)} nm`,
    no: n.nHi.toFixed(5),
    nth: n.nLo.toFixed(5),
    dn: fw(n.nLo - n.nHi, 5, 8),
    rho: `${fw(n.rho, 3, 5)}°`,
    mx: `${n.mx.rho_deg.toFixed(3)}° at ${n.mx.theta_deg.toFixed(2)}°`,
  };
}

/** Drawn semi-axes (a for x, y; c for z). */
export function drawnAxes(lam: number): { a: number; cz: number } {
  const no = nCLN("o", lam), ne = nCLN("e", lam), nb = (2 * no + ne) / 3;
  return { a: 1 + G_DRAW * (no / nb - 1), cz: 1 + G_DRAW * (ne / nb - 1) };
}
/** Drawn walk-off (deg) of the exaggerated ellipsoid, i.e. the angle between k and the drawn surface normal. */
export const drawnRho = (st: Ell21): number => { const { a, cz } = drawnAxes(st.lam); return walkoffAngle(st.th * DEG, a, cz) / DEG; };

// ---------- TECH ASCII render ----------
export const COLS = 64, ROWS = 27;
const YAW = 38 * DEG, PITCH = 18 * DEG;
type V3 = [number, number, number];
// world -> view: rotate about z by -YAW, then about x by PITCH; view x = right, view z = up, view y = depth (into screen)
function toView(p: V3): V3 {
  const cy = Math.cos(YAW), sy = Math.sin(YAW), cp = Math.cos(PITCH), sp = Math.sin(PITCH);
  const x1 = cy * p[0] + sy * p[1], y1 = -sy * p[0] + cy * p[1], z1 = p[2];
  return [x1, cp * y1 - sp * z1, sp * y1 + cp * z1];
}
function fromView(v: V3): V3 {
  const cy = Math.cos(YAW), sy = Math.sin(YAW), cp = Math.cos(PITCH), sp = Math.sin(PITCH);
  const y1 = cp * v[1] + sp * v[2], z1 = -sp * v[1] + cp * v[2], x1 = v[0];
  return [cy * x1 - sy * y1, sy * x1 + cy * y1, z1];
}
const SCY = 8.6, SCX = SCY * 2.05;
const scr = (v: V3): [number, number] => [COLS / 2 + v[0] * SCX, ROWS / 2 - v[2] * SCY];

export function ell21Ascii(st: Ell21): string {
  const { a, cz } = drawnAxes(st.lam);
  const g: string[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(" "));
  const depth: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(Infinity));
  const ramp = " .,:;=";
  const L = (() => { const l: V3 = [-0.45, -0.6, 0.66]; const m = Math.hypot(...l); return l.map((x) => x / m) as V3; })();
  for (let r = 0; r < ROWS; r++) for (let col = 0; col < COLS; col++) {
    const vx = (col + 0.5 - COLS / 2) / SCX, vz = (ROWS / 2 - r - 0.5) / SCY;
    // ray along view +y (into the screen) through (vx, ., vz): world o + t d
    const o = fromView([vx, -5, vz]), d = fromView([0, 1, 0]);
    const A = (d[0] ** 2 + d[1] ** 2) / a ** 2 + d[2] ** 2 / cz ** 2;
    const B = 2 * ((o[0] * d[0] + o[1] * d[1]) / a ** 2 + (o[2] * d[2]) / cz ** 2);
    const C = (o[0] ** 2 + o[1] ** 2) / a ** 2 + o[2] ** 2 / cz ** 2 - 1;
    const D = B * B - 4 * A * C;
    if (D < 0) continue;
    const t = (-B - Math.sqrt(D)) / (2 * A);
    const p: V3 = [o[0] + t * d[0], o[1] + t * d[1], o[2] + t * d[2]];
    const n: V3 = [p[0] / a ** 2, p[1] / a ** 2, p[2] / cz ** 2], nm = Math.hypot(...n);
    const lam = Math.max(0, (n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / nm);
    g[r][col] = ramp[Math.min(ramp.length - 1, 1 + Math.floor(lam * (ramp.length - 1)))];
    depth[r][col] = toView(p)[1];
  }
  // mode "top": always drawn; "dot": hidden parts as a dot; "hide": hidden parts omitted
  const put = (p: V3, ch: string, mode: "top" | "dot" | "hide" = "top"): void => {
    const v = toView(p), [x, y] = scr(v), col = Math.floor(x), r = Math.floor(y);
    if (r < 0 || r >= ROWS || col < 0 || col >= COLS) return;
    const hidden = v[1] > depth[r][col] + 1e-3;
    if (mode !== "top" && hidden) { if (mode === "dot" && ramp.includes(g[r][col])) g[r][col] = "·"; return; }
    g[r][col] = ch;
  };
  const slope = (p: V3, q: V3): string => {
    const [x0, y0] = scr(toView(p)), [x1, y1] = scr(toView(q));
    const dx = x1 - x0, dy = y1 - y0, ang = Math.atan2(-dy, dx * 0.5) / DEG;
    const A2 = ((ang % 180) + 180) % 180;
    return A2 < 22.5 || A2 >= 157.5 ? "-" : A2 < 67.5 ? "/" : A2 < 112.5 ? "|" : "\\";
  };
  const line = (p: V3, q: V3, n: number, ch?: string, mode: "top" | "dot" | "hide" = "top"): void => {
    const s = ch ?? slope(p, q);
    for (let i = 0; i <= n; i++) { const t = i / n; put([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1]), p[2] + t * (q[2] - p[2])], s, mode); }
  };
  // crystal axes (hidden parts dotted)
  line([-1.5, 0, 0], [1.5, 0, 0], 80, undefined, "hide");
  line([0, -1.5, 0], [0, 1.5, 0], 80, undefined, "hide");
  line([0, 0, -1.5], [0, 0, 1.5], 60, "|", "hide");
  // section ellipse normal to k: o axis along phi-hat (drawn a), e axis in the k-c plane (drawn n_e(theta))
  const th = st.th * DEG, ph = st.ph * DEG;
  const uo: V3 = [-Math.sin(ph), Math.cos(ph), 0], ue: V3 = [Math.cos(th) * Math.cos(ph), Math.cos(th) * Math.sin(ph), -Math.sin(th)];
  const nedr = extraordinaryIndex(th, a, cz);
  for (let i = 0; i < 360; i++) {
    const t = (i * Math.PI) / 180, t2 = ((i + 1) * Math.PI) / 180;
    const P = (tt: number): V3 => [0, 1, 2].map((j) => Math.cos(tt) * a * uo[j] + Math.sin(tt) * nedr * ue[j]) as V3;
    put(P(t), slope(P(t), P(t2)), "dot");
  }
  // k and S (drawn walk-off), on top
  const k: V3 = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)];
  const ts = th + drawnRho(st) * DEG;
  const S: V3 = [Math.sin(ts) * Math.cos(ph), Math.sin(ts) * Math.sin(ph), Math.cos(ts)];
  line([0, 0, 0], k.map((x) => x * 1.55) as V3, 60, "*");
  line([0, 0, 0], S.map((x) => x * 1.55) as V3, 60, "+");
  const label = (p: V3, s: string): void => { const [x, y] = scr(toView(p)); const r = Math.floor(y), c0 = Math.floor(x); for (let i = 0; i < s.length; i++) if (r >= 0 && r < ROWS && c0 + i >= 0 && c0 + i < COLS) g[r][c0 + i] = s[i]; };
  label(k.map((x) => x * 1.68) as V3, "k");
  label(S.map((x) => x * 1.68) as V3, "S");
  label([0, 0, 1.58], "c");
  label([1.6, 0, 0], "x");
  label([0, 1.6, 0], "y");
  return g.map((row) => row.join("")).join("\n");
}

// ---------- TECH rho(theta) and n(theta) plot ----------
const BOX = { w: 560, h: 210, l: 52, r: 56, t: 24, b: 30 };
export function ell21PlotSVG(st: Ell21): string {
  const no = nCLN("o", st.lam), ne = nCLN("e", st.lam), mx = maxWalkoff(no, ne);
  const ymax = Math.ceil((mx.rho_deg * 1.15) * 2) / 2;
  const fr: Frame = frame(BOX, { d: [0, 90] }, { d: [0, ymax] });
  const xs = Array.from({ length: 181 }, (_, i) => i / 2);
  const rho = xs.map((t) => walkoffAngle(t * DEG, no, ne) / DEG);
  // n(theta) on a right axis mapped into the same box
  const nlo = ne - 0.004, nhi = no + 0.004, yN = (n: number): number => BOX.h - BOX.b - ((n - nlo) / (nhi - nlo)) * (BOX.h - BOX.b - BOX.t);
  const nPath = xs.map((t, i) => `${i ? "L" : "M"}${c(fr.x.f(t))} ${c(yN(extraordinaryIndex(t * DEG, no, ne)))}`).join("");
  let s = axes(fr, { xlab: "θ from c (deg)", ylab: "ρ (deg)", xt: [0, 15, 30, 45, 60, 75, 90].map((v) => ({ v, label: String(v), major: true })) });
  for (const n of [ne, no]) s += `<text class="tk" x="${BOX.w - BOX.r + 6}" y="${c(yN(n) + 4)}">${n.toFixed(4)}</text>`;
  s += `<text class="al" x="${BOX.w - BOX.r + 6}" y="${BOX.t - 8}">n(θ)</text>`;
  s += `<path class="s1" d="${path(fr, xs, rho)}"/><path class="s2" d="${nPath}"/>`;
  s += `<line class="cur" x1="${c(fr.x.f(mx.theta_deg))}" x2="${c(fr.x.f(mx.theta_deg))}" y1="${BOX.t}" y2="${BOX.h - BOX.b}" stroke-dasharray="1 3"/>`;
  const x = fr.x.f(st.th), r0 = walkoffAngle(st.th * DEG, no, ne) / DEG;
  s += `<line class="cur" x1="${c(x)}" x2="${c(x)}" y1="${BOX.t}" y2="${BOX.h - BOX.b}"/><circle class="mk" cx="${c(x)}" cy="${c(fr.y.f(r0))}" r="3"/><circle class="mko" cx="${c(x)}" cy="${c(yN(extraordinaryIndex(st.th * DEG, no, ne)))}" r="3"/>`;
  return s;
}
