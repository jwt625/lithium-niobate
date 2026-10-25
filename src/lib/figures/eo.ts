// Chapter 2.2 interactives (port of mockup/eo.js): L1 bulk calculator and MZM transfer (TECH), L2 3m r-tensor explorer
// (TECH), L3 FEM overlap figures (a)-(d) and numbers table (both modes; color maps switch with the mode).
// Constants carry their sources; every L3 number is read from /data/eo-overlap-li2026aa.json or computed from it here.
import { EO_TURNER1966_S } from "$lib/physics/constants.ts";
import { mzmTransmission } from "$lib/physics/modulator.ts";
import { mzm as MS } from "$lib/stores/figstate";
import { nCLN } from "./optics.ts";
import { DASH, MINUS as M, fix, pct, sci, sgn3, sgnPct } from "./fmt.ts";
import { FORM, SETS, coef, jacobi, onRt, rtChanged, st } from "./rtensor.ts";
import type { Mat3 } from "$lib/physics/linalg.ts";
const AXI = ["x", "y", "z"];
import { Disposer, cssVar, isDark, isVisual, need, onUi, q, qa } from "./dom.ts";

// ---------- formatting ----------
const badge = (cls: string, txt: string, pop?: string): string => `<span class="b ${cls}"${pop ? ` data-pop="${pop}" tabindex="0"` : ""}>${txt}</span>`;
// Fixed-layout key/value tables: column widths come from <colgroup>, never from the values, so live updates cannot move anything.
type Row4 = [string, string, string?, string?];
export const kv = (rows: Row4[]): string => '<colgroup><col><col class="cv"><col class="cu"><col class="cs"></colgroup><tbody>' + rows.map(([k, v, u, s]) => `<tr><td>${k}</td><td class="v num">${v}</td><td class="u">${u || ""}</td><td class="s">${s || ""}</td></tr>`).join("") + "</tbody>";
const kv3 = (head: string, rows: [string, string, string?][]): string => `<colgroup><col><col class="cv"><col class="cn"></colgroup><tbody><tr><th colspan="3" class="kh">${head}</th></tr>` + rows.map(([k, v, n]) => `<tr><td>${k}</td><td class="v num">${v}</td><td class="n">${n || ""}</td></tr>`).join("") + "</tbody>";
const fv = (h: string, cls = ""): string => `<span class="fv${cls ? ` ${cls}` : ""}">${h}</span>`; // fixed-width value slot

// ---------- constants (sources in comments) ----------
// r33 clamped, Turner 1966, 633 nm, via Weis & Gaylord 1985 (P-comp). Also the engine library value (json geometry.r_pm_per_v).
const R33 = EO_TURNER1966_S.r33 * 1e-12;
// Li et al. 2026 device d, measured, 1550 nm (reported): Vpi 2.90 V, L = 9 mm (eo-modulator-atlas devices.csv; paper p.5 Fig. 3(b)).
export const VPI_MEAS = 2.9;
const L_MZM = 9e-3, LAM_MZM = 1.55e-6;
const Z0 = 376.730313668; // vacuum impedance, ohm (CODATA 2018)

// =====================================================================================
// L1: bulk calculator
// =====================================================================================
export function calcRows(lam: number, Evum: number): Row4[] {
  const E = Evum * 1e6, ne = nCLN("e", lam), dn = -0.5 * ne ** 3 * R33 * E;
  const EL = (lam * 1e-6) / (ne ** 3 * R33), dphi = ((2 * Math.PI) / (lam * 1e-6)) * dn * 1e-3;
  return [
    [`n<sub>e</sub>(${lam.toFixed(2)} µm)`, ne.toFixed(4), "", badge("pc", "P-db", "zelmon")],
    ["r<sub>33</sub>", "30.8", "pm/V", badge("pc", "P-comp", "wg85")],
    ["&Delta;n<sub>e</sub>", sci(dn, 3), "", badge("d", "derived")],
    ["&Delta;&phi; / L", sci(dphi, 3), "rad/mm", badge("d", "derived")],
    ["E&middot;L for &Delta;&phi; = &pi;", (EL / 1e3).toFixed(3), "kV", badge("d", "derived")],
  ];
}

// MZM plot geometry (TECH)
const MZ = { W: 520, H: 210, l: 40, r: 12, t: 10, b: 30, v0: -6, v1: 6 };
const mx = (v: number): number => MZ.l + ((v - MZ.v0) / (MZ.v1 - MZ.v0)) * (MZ.W - MZ.l - MZ.r);
const my = (T: number): number => MZ.t + (1 - T) * (MZ.H - MZ.t - MZ.b);
export const mzmCurve = (vpi: number): string => { let d = ""; for (let k = 0; k <= 480; k++) { const v = MZ.v0 + ((MZ.v1 - MZ.v0) * k) / 480; d += `${k ? "L" : "M"}${mx(v).toFixed(1)} ${my(mzmTransmission(v, vpi)).toFixed(1)}`; } return d; };
/** Static T(V) frame with the measured curve and the cursor at V (rendered at build time; the engine curve fills on load). */
export function mzmFrameSVG(V = 0, vpiEng: number | null = null): string {
  let g = "";
  for (let v = -6; v <= 6; v += 2) g += `<line x1="${mx(v)}" x2="${mx(v)}" y1="${MZ.t}" y2="${MZ.H - MZ.b}" class="gl"/><text x="${mx(v)}" y="${MZ.H - MZ.b + 14}" text-anchor="middle" class="tk">${v < 0 ? M : ""}${Math.abs(v)}</text>`;
  for (const T of [0, 0.5, 1]) g += `<line x1="${MZ.l}" x2="${MZ.W - MZ.r}" y1="${my(T)}" y2="${my(T)}" class="gl"/><text x="${MZ.l - 6}" y="${my(T) + 3.5}" text-anchor="end" class="tk">${T}</text>`;
  for (const s of [-2, -1, 1, 2]) { const v = s * VPI_MEAS; g += `<line x1="${mx(v)}" x2="${mx(v)}" y1="${MZ.t}" y2="${MZ.H - MZ.b}" class="vpi"/>`; }
  g += `<text x="${MZ.W - MZ.r}" y="${MZ.H - 4}" text-anchor="end" class="tk">V (V)</text><text x="${MZ.l - 6}" y="${MZ.t + 2}" text-anchor="end" class="tk" dy="-2"></text>`;
  g += `<text x="6" y="${MZ.t + 8}" class="tk">T</text>`;
  g += `<path id="mzm-eng" class="eng" d="${vpiEng === null ? "" : mzmCurve(vpiEng)}"/><path class="meas" d="${mzmCurve(VPI_MEAS)}"/>`;
  const T = mzmTransmission(V, VPI_MEAS), px = mx(V), py = my(T);
  g += `<line id="mzm-cur" class="cur" y1="${MZ.t}" y2="${MZ.H - MZ.b}" x1="${px}" x2="${px}"/><path id="mzm-pt" class="pt" d="M${px} ${py - 5}L${px + 5} ${py}L${px} ${py + 5}L${px - 5} ${py}Z"/>`;
  g += `<rect x="${MZ.l}" y="${MZ.t}" width="${MZ.W - MZ.l - MZ.r}" height="${MZ.H - MZ.t - MZ.b}" class="hit"/>`;
  return g;
}
export function mzmRows(V: number, dneffA: number | null): Row4[] {
  const dphi = (Math.PI * V) / VPI_MEAS, T = Math.cos(dphi / 2) ** 2, dnArm = (LAM_MZM * Math.abs(dphi)) / (4 * Math.PI * L_MZM);
  return [
    ["T", T.toFixed(4), "", ""],
    ["T (dB)", T > 1e-6 ? fix(10 * Math.log10(T), 2) : `&lt; ${M}60`, "dB", ""],
    ["&Delta;&phi; = &pi;V / V<sub>&pi;</sub>", fix(dphi / Math.PI, 3), "&pi; rad", badge("d", "derived")],
    ["|&Delta;n<sub>eff</sub>| per arm = &lambda;|&Delta;&phi;| / 4&pi;L", sci(dnArm, 3), "", badge("d", "derived")],
    ["|&Delta;n<sub>eff</sub>| per arm, engine |dn<sub>A</sub>/dV|&middot;|V|", dneffA !== null ? sci(Math.abs(dneffA * V), 3) : "n/a", "", badge("d", "engine", "engine")],
  ];
}

// =====================================================================================
// L2: r tensor (TECH tables)
// =====================================================================================
const IL = ["xx", "yy", "zz", "yz", "xz", "xy"];
const OFF: Record<number, [number, number]> = { 3: [1, 2], 4: [0, 2], 5: [0, 1] }; // contracted I (0-based) -> tensor pair
export interface RtHTML { mx: string; vec: string; dn: string; rot: string; set: string }
export function rtHTML(): RtHTML {
  const S = SETS[st.s], lam = 1.55, E = 1e6; // V/m (= 1 V/um)
  const no = nCLN("o", lam), ne = nCLN("e", lam), n = [no, no, ne];
  let h = `<thead><tr><th></th>${AXI.map((a, j) => `<th class="${j === st.e ? "col" : ""}">E<sub>${a}</sub></th>`).join("")}</tr></thead><tbody>`;
  FORM.forEach((row, I) => {
    h += `<tr><th class="ri">${I + 1} <span class="dim">${IL[I]}</span></th>`;
    row.forEach((c, j) => {
      let cls = c ? "nz" : "z";
      if (j === st.e) cls += " col";
      if (j === st.e && c) cls += I === st.p ? " on" : I >= 3 ? " rot" : " oth";
      const txt = c ? `${c[1] < 0 ? M : ""}r<sub>${c[0].slice(1)}</sub>` : "0";
      h += `<td class="${cls}" title="${c ? `${c[1] < 0 ? M : ""}${c[0]} = ${fix(coef(S, c), 2)} pm/V` : "0"}">${txt}</td>`;
    });
    h += "</tr>";
  });
  const mxH = h + "</tbody>";
  const dB = FORM.map((row) => coef(S, row[st.e]) * 1e-12 * E);
  const vec = kv3(`&Delta;(1/n<sup>2</sup>)<sub>I</sub> = r<sub>I${"xyz"[st.e]}</sub>E`,
    dB.map((v, I) => [`${I + 1} ${IL[I]}`, v ? sci(v, 2) : "0", I === st.p ? '<span class="etag">diag k</span>' : I >= 3 && v ? '<span class="etag">rotates</span>' : ""]));
  const k = st.p, dnk = -0.5 * n[k] ** 3 * dB[k];
  const B: Mat3 = [[1 / no ** 2 + dB[0], dB[5], dB[4]], [dB[5], 1 / no ** 2 + dB[1], dB[3]], [dB[4], dB[3], 1 / ne ** 2 + dB[2]]];
  const B0 = [1 / no ** 2, 1 / no ** 2, 1 / ne ** 2];
  const eg = jacobi(B);
  const prin = eg.vec.map((v, i) => {
    const n0 = 1 / Math.sqrt(v[0] ** 2 * B0[0] + v[1] ** 2 * B0[1] + v[2] ** 2 * B0[2]), np = 1 / Math.sqrt(eg.val[i]);
    const a = v.map(Math.abs), m = a.indexOf(Math.max(...a));
    return { v, d: np - n0, ax: m, tilt: (Math.acos(Math.min(1, a[m])) * 180) / Math.PI };
  }).sort((p, q2) => p.ax - q2.ax || q2.d - p.d);
  const rows: [string, string, string?][] = [
    [`n<sub>${AXI[k]}</sub> (${AXI[k] === "z" ? "n<sub>e</sub>" : "n<sub>o</sub>"}, 1.55 µm)`, n[k].toFixed(4), badge("pc", "P-db", "zelmon")],
    [`&delta;n<sub>${AXI[k]}</sub> first order`, dnk ? sci(dnk, 3) : "0", badge("d", "derived")],
  ];
  prin.forEach((p) => rows.push([`&delta;n along <span class="vec">(${p.v.map((c) => sgn3(c * Math.sign(p.v[p.ax]))).join(", ")})</span>`, Math.abs(p.d) < 1e-12 ? "0" : sci(p.d, 3), p.tilt > 1e-6 ? `<span class="etag">${p.tilt < 1 ? p.tilt.toFixed(3) : p.tilt.toFixed(2)}&deg; from ${AXI[p.ax]}</span>` : `<span class="etag">along ${AXI[p.ax]}</span>`]));
  const dn = kv3(`polarization ${AXI[k]}; exact principal axes, crystal frame`, rows);
  const rrows: [string, string, string?][] = [3, 4, 5].map((I) => {
    const [p, q2] = OFF[I];
    if (!dB[I]) return [`${I + 1} ${IL[I]}`, "0", "no rotation"];
    const diff = B[p][p] - B[q2][q2], deg = Math.abs(diff) < 1e-15;
    const th = deg ? 45 : (0.5 * Math.atan((2 * dB[I]) / diff) * 180) / Math.PI;
    return [`${I + 1} ${IL[I]}`, sci(dB[I], 2), `<span class="etag">${AXI[p]}${AXI[q2]} axes ${deg ? "45&deg;, degenerate n<sub>o</sub>" : `${fix(th, 4)}&deg;`}</span>`];
  });
  const nS = eg.val.map((v) => 1 / Math.sqrt(v)).sort((a, b) => a - b);
  const biax = Math.abs(nS[0] - nS[1]) > 1e-12 && Math.abs(nS[1] - nS[2]) > 1e-12;
  rrows.push(["principal indices", biax ? "3 distinct" : "2 equal", `<span class="etag">${biax ? "biaxial" : "uniaxial"}</span>`]);
  return { mx: mxH, vec, dn, rot: kv3("off-diagonal terms rotate the principal axes", rrows), set: S.label };
}

// =====================================================================================
// L3: FEM overlap
// =====================================================================================
type RGB = [number, number, number];
const INFERNO = ["#000004", "#160b39", "#420a68", "#6a176e", "#932667", "#bc3754", "#dd513a", "#f37819", "#fca50a", "#f6d746", "#fcffa4"];
const RDBU_LIGHT = ["#053061", "#2166ac", "#4393c3", "#92c5de", "#d1e5f0", "#f7f7f7", "#fddbc7", "#f4a582", "#d6604d", "#b2182b", "#67001f"];
const RDBU_DARK = ["#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#163a63", "#141416", "#5c1a1f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7"];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const ramp = (stops: string[]): ((t: number) => RGB) => { const c = stops.map(hex); return (t) => { t = Math.max(0, Math.min(1, t)) * (c.length - 1); const i = Math.min(c.length - 2, Math.floor(t)), f = t - i; return [0, 1, 2].map((k) => c[i][k] + (c[i + 1][k] - c[i][k]) * f) as RGB; }; };
function cmap(kind: "seq" | "div"): (t: number) => RGB { // t in [0,1] -> rgb
  if (isVisual()) return kind === "seq" ? ramp(INFERNO) : ramp(isDark() ? RDBU_DARK : RDBU_LIGHT);
  if (kind === "seq") return isDark() ? (t) => [t * 240, t * 240, t * 238] : (t) => [255 - t * 245, 255 - t * 245, 253 - t * 243];
  return (t) => [t * 245, t * 245, t * 242]; // gray diverging: negative dark, zero mid gray, positive light
}
function decode(b64: string): Float32Array { const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return new Float32Array(u.buffer); }
type Poly = [number, number][];
const pip = (p: Poly, x: number, y: number): boolean => { let c = false; for (let a = 0, b = p.length - 1; a < p.length; b = a++) { const [xa, ya] = p[a], [xb, yb] = p[b]; if ((ya > y) !== (yb > y) && x < ((xb - xa) * (y - ya)) / (yb - ya) + xa) c = !c; } return c; };

interface Val { value: number }
export interface EOJson {
  meta: { exported: string; grid: { nx: number; ny: number; dx: number; x0: number; y1: number } };
  fields: Record<string, { f32: string }>;
  geometry: { signal: Poly; ground: Poly; ln_rib: Poly; ln_slab: Poly; n_e: number; r_pm_per_v: { r33: number }; lambda_um: number; length_mm: number; measured: { vpi_dc_v: number; vpi_l_dc_vcm: number } };
  globals: Record<string, Val>;
  surfaceIntegrals: Record<string, Val>;
  metrics: { vpi_dc_v: number };
}
interface Split { rib: number; slabIn: number; slabOut: number; total: number }
export interface EOA {
  j: EOJson; g: EOJson["meta"]["grid"]; F: Record<string, Float32Array>; X: (i: number) => number; Y: (j: number) => number; K: (i: number, j: number) => number;
  geo: EOJson["geometry"]; glob: Record<string, Val>; si: Record<string, Val>; eMax: number; kMax: number; den: number; inLN: number; num: number;
  topN: number; topLN: number; prof: { y: number; t: number; r: number }[]; gTop: number; nodal: { t: number; r: number }; trap: { t: Split; r: Split }; gx: { Ebar: number; Gamma: number };
}

export function analyze(j: EOJson): EOA {
  const g = j.meta.grid, { nx, ny, dx, x0, y1 } = g, G = j.geometry;
  const F: Record<string, Float32Array> = {};
  for (const k in j.fields) F[k] = decode(j.fields[k].f32);
  const X = (i: number): number => x0 + i * dx, Y = (jj: number): number => y1 - jj * dx, K = (i: number, jj: number): number => jj * nx + i;
  const dA = (dx * 1e-6) ** 2; // m^2
  const nodal = (f: Float32Array): number => { let s = 0; for (const v of f) if (Number.isFinite(v)) s += v * dA; return s; };
  let eMax = 0, kMax = 0;
  F.optEx.forEach((v, k) => { if (v * v > eMax) { eMax = v * v; kMax = k; } });
  let den = 0, inLN = 0, num = 0;
  for (let jj = 0; jj < ny; jj++) for (let i = 0; i < nx; i++) {
    const k = K(i, jj), o = F.optEx[k];
    if (!Number.isFinite(o)) continue;
    const x = X(i), y = Y(jj) + 1e-6, ln = pip(G.ln_rib, x, y) || pip(G.ln_slab, x, y);
    den += o * o * dA;
    if (ln) { inLN += o * o * dA; num += F.esEx[k] * o * o * dA; }
  }
  // column trapezoid inside the LN polygons; interface values extrapolated from the two nearest interior nodes
  const yS = G.ln_slab[2][1], yB = G.ln_slab[0][1], yR = G.ln_rib[2][1], wb = G.ln_rib[1][0], wt = G.ln_rib[2][0];
  const ytop = (x: number): number => { const a = Math.abs(x); return a <= wt ? yR : a >= wb ? yS : yS + ((yR - yS) * (wb - a)) / (wb - wt); };
  function colInt(f: Float32Array, i: number, ya: number, yb: number): number {
    const P: [number, number][] = [];
    for (let jj = ny - 1; jj >= 0; jj--) { const y = Y(jj); if (y > ya + 1e-9 && y < yb - 1e-9) P.push([y, f[K(i, jj)]]); }
    if (P.length === 0) return 0;
    if (P.length === 1) return P[0][1] * (yb - ya);
    const ext = (p0: [number, number], p1: [number, number], y: number): number => p0[1] + ((p1[1] - p0[1]) * (y - p0[0])) / (p1[0] - p0[0]);
    const pts: [number, number][] = [[ya, ext(P[0], P[1], ya)], ...P, [yb, ext(P[P.length - 1], P[P.length - 2], yb)]];
    let s = 0;
    for (let k = 1; k < pts.length; k++) s += 0.5 * (pts[k][1] + pts[k - 1][1]) * (pts[k][0] - pts[k - 1][0]);
    return s;
  }
  const jMid = Math.round((y1 - 0.5 * (yB + yS)) / dx);
  const cols: number[] = [];
  for (let i = 0; i < nx; i++) if (Number.isFinite(F.integrand[K(i, jMid)])) cols.push(i);
  function trapSplit(f: Float32Array): Split {
    const out = { rib: 0, slabIn: 0, slabOut: 0, total: 0 };
    cols.forEach((i, c) => {
      const w = (c === 0 || c === cols.length - 1 ? 0.5 : 1) * dx * 1e-12; // um^2 -> m^2 with f in 1/(V m^2)
      const x = X(i), s = colInt(f, i, yB, yS) * w, yt = ytop(x);
      if (Math.abs(x) < wb) out.slabIn += s; else out.slabOut += s;
      if (yt > yS + 1e-9) out.rib += colInt(f, i, yS, yt) * w;
    });
    out.total = out.rib + out.slabIn + out.slabOut;
    return out;
  }
  // interface row y = yR inside the rib top: how many nodes return LN values
  const jTop = Math.round((y1 - yR) / dx);
  let topN = 0, topLN = 0;
  for (let i = 0; i < nx; i++) { const x = X(i); if (Math.abs(x) < wt && Number.isFinite(F.integrand[K(i, jTop)])) { topN++; if (F.integrand[K(i, jTop)] !== 0) topLN++; } }
  // depth profile: integral over x (trapezoid over finite nodes) per row, 1/(V um)
  const prof: { y: number; t: number; r: number }[] = [];
  for (let jj = 0; jj < ny; jj++) {
    let s = 0, s33 = 0;
    cols.forEach((i, c) => { const w = (c === 0 || c === cols.length - 1 ? 0.5 : 1) * dx; const k = K(i, jj); if (Number.isFinite(F.integrand[k])) { s += F.integrand[k] * w; s33 += F.integrand_r33[k] * w; } });
    prof.push({ y: Y(jj), t: s * 1e-12, r: s33 * 1e-12 });
  }
  const glob = j.globals, si = j.surfaceIntegrals;
  return {
    j, g, F, X, Y, K, geo: G, glob, si, eMax, kMax, den, inLN, num, topN, topLN, prof, gTop: yR,
    nodal: { t: nodal(F.integrand), r: nodal(F.integrand_r33) },
    trap: { t: trapSplit(F.integrand), r: trapSplit(F.integrand_r33) },
    gx: { Ebar: num / den, Gamma: (num / den) * glob.gapA.value },
  };
}

// ---------- heatmap layout (shared with the reserved layout before the data arrives) ----------
const FIG_M = { ml: 36, mr: 10, mt: 24, mb: 30 }; // canvas margins, px
const FC_RANGE = { xr: [-3.0, 3.0], yr: [-0.15, 0.45] }; // panel (c) window, um
// The export grid (json.meta.grid, asserted on load) fixes the figure aspect ratios, so the canvases get their final height up front.
const GRID0 = { x0: -3.6, y1: 1.5, dx: 0.03, nx: 241, ny: 81 };
const FULL0 = { xr: [GRID0.x0 - GRID0.dx / 2, GRID0.x0 + (GRID0.nx - 1) * GRID0.dx + GRID0.dx / 2], yr: [GRID0.y1 - (GRID0.ny - 1) * GRID0.dx - GRID0.dx / 2, GRID0.y1 + GRID0.dx / 2] };
const niceStep = (span: number, n: number): number => { const r = span / n, p = 10 ** Math.floor(Math.log10(r)), m = r / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; };
const ps = (str: string, w: number): string => `<span class="ps" style="min-width:${w}ch">${str}</span>`; // fixed-width mono slot inside text

// Hover readout: the same nine fixed slots before and after the data loads (placeholders until then).
interface Probe { x: number; y: number; o: number; fin: boolean; ex: number; ey: number; it: number; i33: number }
export function roHTML(r: Probe | null, EO: EOA | null = null, region: (x: number, y: number) => string = () => DASH): string {
  const v = (x: () => string): string => (r ? x() : DASH);
  const R = r as Probe, eMax = EO?.eMax ?? 1;
  const parts = [
    `x ${fv(v(() => fix(R.x, 2)), "w6")} µm`, `y ${fv(v(() => fix(R.y, 2)), "w6")} µm`, fv(v(() => region(R.x, R.y)), "w14 l"),
    `|E<sub>x</sub>|<sup>2</sup>/max ${fv(v(() => (R.fin ? ((R.o * R.o) / eMax).toFixed(4) : "n/a")), "w7")}`,
    `|E<sub>x</sub>| ${fv(v(() => (R.fin ? sci(Math.abs(R.o), 3) : "n/a")))} V/m`,
    `e<sub>x</sub> ${fv(v(() => sci(R.ex * 1e-6, 3)))}`, `e<sub>y</sub> ${fv(v(() => sci(R.ey * 1e-6, 3)))} (V/µm)/V`,
    `integrand ${fv(v(() => (R.fin ? sci(R.it * 1e-12, 3) : "n/a")))}`, `r<sub>33</sub> ${fv(v(() => (R.fin ? sci(R.i33 * 1e-12, 3) : "n/a")))} 1/(V µm<sup>2</sup>)`,
  ];
  return parts.map((p) => `<span>${p}</span>`).join("");
}
export const fdRowHTML = (p: { y: number; t: number; r: number } | null, itf: boolean): string => `y ${fv(p ? fix(p.y, 2) : DASH, "w6")} µm total ${fv(p ? sci(p.t, 3) : DASH)} r<sub>33</sub> ${fv(p ? sci(p.r, 3) : DASH)} 1/(V µm) ${fv(itf ? "interface" : "", "w9 l")}`;
export const fdSumHTML = (v: number | null): string => `&sum; rows &times; &Delta;y = ${fv(v === null ? DASH : sci(v, 4))} 1/V (nodal grid sum). Hover or tap a bar.`;
export const faPkHTML = (v: number | null): string => `peak |E<sub>x</sub>| ${fv(v === null ? DASH : sci(v, 3))} V/m`;
export const fbPkHTML = (v: number | null, signed = false): string => `${signed ? "min &lt; 0" : "min 0"}, max ${fv(v === null ? DASH : sci(v, 3))} (V/µm)/V`;

/** Numbers table, explanatory sentence and grid note. Called with E = null before the data arrives: same rows, same
 *  fixed slots, placeholders in place of values (layout-shift-safe on data load). */
export function numbersHTML(E: EOA | null): { ntab: string; why: string; note: string; mapR33: string; date: string } {
  const ok = !!E, D = DASH;
  const gl = E?.glob as Record<string, Val>, si = E?.si as Record<string, Val>, G = E?.geo as EOJson["geometry"];
  const c = E ? (() => {
    const eng = gl.dneffA.value, eng33 = si["eoA.integrand_r33"].value, ne = G.n_e, r33 = G.r_pm_per_v.r33 * 1e-12, neff = gl["armA.neff"].value, lam = G.lambda_um * 1e-6;
    return {
      eng, eng33, ne, neff, tot: si["eoA.integrand"].value, T: E.trap.t,
      scalarTE: -((ne ** 4 * r33) / (2 * neff)) * E.gx.Ebar, conv: -0.5 * ne ** 3 * r33 * gl.EbarA.value,
      vpilEng: gl.VpiL.value * 100, vpilTb: gl.VpiLtextbook.value * 100, vpilMeas: G.measured.vpi_l_dc_vcm,
      vpilChk: (lam / (2 * Math.abs(gl.dneffA.value - gl.dneffB.value))) * 100,
    };
  })() : null;
  const C = c as NonNullable<typeof c>, EE = E as EOA;
  const v = (f: () => string): string => (ok ? f() : D);
  const l = (f: () => string, w: number): string => ps(ok ? f() : D, w);
  const ENG = badge("d", "engine", "engine"), DER = badge("d", "derived"), REP = badge("r", "reported", "li2026aa");
  const grp = (t: string): string => `<tr class="grp"><th colspan="4">${t}</th></tr>`;
  const row = (qq: string, val: string, u: string, src: string): string => `<tr><td>${qq}</td><td class="r num">${val}</td><td>${u}</td><td class="r">${src}</td></tr>`;
  let h = "";
  h += grp("d n<sub>eff</sub>/dV, arm A");
  h += row("engine, FEM quadrature", v(() => sci(C.eng, 4)), "1/V", ENG);
  h += row(`grid, nodal sum &sum; f &Delta;x<sup>2</sup> <span class="dim">${l(() => sgnPct(EE.nodal.t / C.eng - 1), 6)}</span>`, v(() => sci(EE.nodal.t, 4)), "1/V", DER);
  h += row(`grid, column trapezoid in LN <span class="dim">${l(() => sgnPct(C.T.total / C.eng - 1), 6)}</span>`, v(() => sci(C.T.total, 4)), "1/V", DER);
  h += row("r<sub>33</sub> only: engine", v(() => sci(C.eng33, 4)), "1/V", ENG);
  h += row(`r<sub>33</sub> only: grid nodal <span class="dim">${l(() => sgnPct(EE.nodal.r / C.eng33 - 1), 6)}</span>`, v(() => sci(EE.nodal.r, 4)), "1/V", DER);
  h += grp("by region (grid, column trapezoid)");
  h += row(`rib, y ${l(() => String(G.ln_slab[2][1]), 4)} to ${l(() => String(G.ln_rib[2][1]), 3)} µm <span class="dim">${l(() => pct(C.T.rib / C.T.total, 1), 5)}</span>`, v(() => sci(C.T.rib, 3)), "1/V", DER);
  h += row(`slab under the rib, |x| &lt; ${l(() => G.ln_rib[1][0].toFixed(3), 5)} µm <span class="dim">${l(() => pct(C.T.slabIn / C.T.total, 1), 5)}</span>`, v(() => sci(C.T.slabIn, 3)), "1/V", DER);
  h += row(`slab outside the rib <span class="dim">${l(() => pct(C.T.slabOut / C.T.total, 1), 5)}</span>`, v(() => sci(C.T.slabOut, 3)), "1/V", DER);
  h += grp("by tensor entry (engine surface integrals)");
  for (const k of ["r33", "r13", "r51", "r22"]) { const val = (): number => si[`eoA.integrand_${k}`].value; h += row(`r<sub>${k.slice(1)}</sub> <span class="dim">${l(() => pct(val() / C.tot, 2), 6)}</span>`, v(() => (val() ? sci(val(), 3) : "0")), "1/V", ENG); }
  h += grp("push-pull");
  h += row("d n<sub>eff</sub>/dV, arm B", v(() => sci(gl.dneffB.value, 4)), "1/V", ENG);
  h += row("balance d n<sub>B</sub> / d n<sub>A</sub>", v(() => gl.balance.value.toFixed(4)), "", ENG);
  h += grp("overlap");
  h += row("&Gamma;<sub>A</sub>, vector |<b>E</b>|<sup>2</sup>", v(() => gl.GammaA.value.toFixed(4)), "", ENG);
  h += row("&Gamma;<sub>x</sub>, grid |E<sub>x</sub>|<sup>2</sup>, grid window", v(() => EE.gx.Gamma.toFixed(4)), "", DER);
  h += row("&#274;<sub>A</sub> = &Gamma;V/g", v(() => sci(gl.EbarA.value * 1e-6, 4)), "(V/µm)/V", ENG);
  h += row("gap g", v(() => (gl.gapA.value * 1e6).toFixed(1)), "µm", ENG);
  h += grp("indices and power");
  h += row("n<sub>e</sub>, engine material", v(() => C.ne.toFixed(3)), "", ENG);
  h += row("n<sub>eff</sub>, TE<sub>0</sub>", v(() => C.neff.toFixed(4)), "", ENG);
  h += row("n<sub>g</sub>", v(() => gl["armA.ng"].value.toFixed(3)), "", ENG);
  h += row("n<sub>e</sub> / n<sub>eff</sub>", v(() => (C.ne / C.neff).toFixed(4)), "", DER);
  h += row("&int;<sub>LN</sub>|E<sub>x</sub>|<sup>2</sup> / &int;|E<sub>x</sub>|<sup>2</sup>, grid", v(() => pct(EE.inLN / EE.den, 1)), "", DER);
  h += row(`&int;|E<sub>x</sub>|<sup>2</sup>dA, grid <span class="dim">vs 2Z<sub>0</sub>P/n<sub>eff</sub> = ${l(() => ((2 * Z0) / C.neff).toFixed(1), 5)}</span>`, v(() => EE.den.toFixed(1)), "V<sup>2</sup>", DER);
  h += grp("d n/dV and V<sub>&pi;</sub>L");
  h += row("eq. (4) scalar TE, grid fields", v(() => sci(C.scalarTE, 4)), "1/V", DER);
  h += row(`eq. (5) ${M}&frac12;n<sub>e</sub><sup>3</sup>r<sub>33</sub>&#274;<sub>A</sub>`, v(() => sci(C.conv, 4)), "1/V", DER);
  h += row(`V<sub>&pi;</sub>L engine <span class="dim">check &lambda;/2|dn<sub>A</sub>${M}dn<sub>B</sub>| = ${l(() => C.vpilChk.toFixed(3), 5)}</span>`, v(() => C.vpilEng.toFixed(3)), "V cm", ENG);
  h += row("V<sub>&pi;</sub>L conventional, eq. (5)", v(() => C.vpilTb.toFixed(3)), "V cm", ENG);
  h += row("V<sub>&pi;</sub>L measured", v(() => C.vpilMeas.toFixed(2)), "V cm", REP);
  h += row("ratio conventional / engine", v(() => (C.vpilTb / C.vpilEng).toFixed(4)), "", DER);
  h += row(`V<sub>&pi;</sub> at ${l(() => String(G.length_mm), 1)} mm: engine / measured`, v(() => `${EE.j.metrics.vpi_dc_v.toFixed(3)} / ${G.measured.vpi_dc_v.toFixed(2)}`), "V", `${ENG} ${REP}`);
  const r = l;
  return {
    ntab: h,
    why: `Eq. (4) carries n<sub>e</sub><sup>4</sup>/n<sub>eff</sub> where eq. (5) carries n<sub>e</sub><sup>3</sup>; the two agree only for n<sub>eff</sub> = n<sub>e</sub>. Here n<sub>eff</sub> = ${r(() => C.neff.toFixed(3), 5)} against n<sub>e</sub> = ${r(() => C.ne.toFixed(3), 5)} because only ${r(() => pct(EE.inLN / EE.den, 0), 3)} of &int;|E<sub>x</sub>|<sup>2</sup>dA (the TE power density) lies in LN and the rest in SiO<sub>2</sub>, so eq. (5) underestimates d n<sub>eff</sub>/dV by n<sub>e</sub>/n<sub>eff</sub> = ${r(() => (C.ne / C.neff).toFixed(3), 5)} and overestimates V<sub>&pi;</sub>L: ${r(() => C.vpilTb.toFixed(2), 4)} vs ${r(() => C.vpilEng.toFixed(2), 4)} V cm, measured ${r(() => C.vpilMeas.toFixed(2), 4)} V cm. The engine ratio ${r(() => (C.vpilTb / C.vpilEng).toFixed(3), 5)} differs from ${r(() => (C.ne / C.neff).toFixed(3), 5)} through the E<sub>y</sub> and E<sub>z</sub> terms the vector solver keeps.`,
    note: `Grid ${r(() => String(EE.g.nx), 3)} &times; ${r(() => String(EE.g.ny), 2)} nodes, &Delta;x = ${r(() => String(EE.g.dx), 4)} µm; optical field and integrand are undefined outside the engine's arm window |x| &le; 2.9 µm (blank). Interface nodes take whichever side the engine's point locator returns: ${r(() => String(EE.topLN), 3)} of ${r(() => String(EE.topN), 3)} nodes on the rib top y = ${r(() => String(EE.gTop), 3)} µm return LN values. The column trapezoid replaces interface values by linear extrapolation from the two nearest interior nodes and changes the sum by ${r(() => sgnPct(C.T.total / EE.nodal.t - 1), 6)}; both grid estimates exceed the engine quadrature by about ${r(() => Math.abs((EE.nodal.t / C.eng - 1) * 100).toFixed(1), 3)}%, a residual not isolated here (the engine integrates on its own triangles; its accuracy note quotes 1.4e-3 to 3.5e-3 relative against independent references on its test cases). &Gamma;<sub>x</sub> and eq. (4) use |E<sub>x</sub>|<sup>2</sup> integrated over the grid window y ${r(() => fix(EE.Y(EE.g.ny - 1), 2), 5)} to ${r(() => String(EE.g.y1), 3)} µm; the engine window extends to y ${M}1.5 to 2.0 µm.`,
    mapR33: `(${r(() => pct(si["eoA.integrand_r33"].value / C.tot, 2), 7)} of d n<sub>eff</sub>/dV)`,
    date: r(() => EE.j.meta.exported, 11), // 11ch: the .meta line adds 0.04em tracking per glyph
  };
}

/** Height (px) reserved for a heatmap canvas of CSS width W (same formula before and after the data arrives). */
const figHeight = (W: number, o: { xr: number[]; yr: number[] }): number => Math.round(((W - FIG_M.ml - FIG_M.mr) * (o.yr[1] - o.yr[0])) / (o.xr[1] - o.xr[0])) + FIG_M.mt + FIG_M.mb;

// =====================================================================================
// mount
// =====================================================================================
/** Mount the chapter 2.2 interactives inside `root` (the page main). Returns the teardown. */
export function mountEO(root: HTMLElement): () => void {
  const dis = new Disposer();
  let EO: EOA | null = null, alive = true;

  // ---------- L1 calculator ----------
  const cLam = need<HTMLInputElement>(root, "#c-lam"), cE = need<HTMLInputElement>(root, "#c-e");
  const calc = (): void => {
    const lam = +cLam.value, Evum = +cE.value;
    need(root, "#c-lam-o").textContent = `${lam.toFixed(2)} µm`;
    need(root, "#c-e-o").innerHTML = `${fix(Evum, 1)} V/µm`;
    need(root, "#calc-out").innerHTML = kv(calcRows(lam, Evum));
  };
  dis.on(cLam, "input", calc); dis.on(cE, "input", calc); calc();

  // ---------- L1 MZM (TECH) ----------
  const mzmV = need<HTMLInputElement>(root, "#mzm-v"), svg = need<SVGSVGElement>(root, "#mzm-svg");
  svg.innerHTML = mzmFrameSVG(MS.V);
  const mzm = (): void => {
    const V = +mzmV.value; MS.V = V;
    const T = mzmTransmission(V, VPI_MEAS), px = mx(V), py = my(T);
    need(root, "#mzm-v-o").textContent = `${fix(V, 2)} V`;
    const cur = need<SVGLineElement>(svg, "#mzm-cur"); cur.setAttribute("x1", String(px)); cur.setAttribute("x2", String(px));
    need<SVGPathElement>(svg, "#mzm-pt").setAttribute("d", `M${px} ${py - 5}L${px + 5} ${py}L${px} ${py + 5}L${px - 5} ${py}Z`);
    need(root, "#mzm-out").innerHTML = kv(mzmRows(V, EO ? EO.glob.dneffA.value : null));
    mzmV.setAttribute("aria-valuetext", `${V.toFixed(2)} volts, transmission ${T.toFixed(3)}`);
  };
  dis.on(mzmV, "input", mzm);
  const svgV = (e: PointerEvent): number => { const r = svg.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * MZ.W; return Math.max(-6, Math.min(6, MZ.v0 + ((x - MZ.l) / (MZ.W - MZ.l - MZ.r)) * (MZ.v1 - MZ.v0))); };
  let drag = false;
  dis.on(svg, "pointerdown", (e: PointerEvent) => { drag = true; svg.setPointerCapture(e.pointerId); mzmV.value = svgV(e).toFixed(2); mzm(); });
  dis.on(svg, "pointermove", (e: PointerEvent) => { if (drag) { mzmV.value = svgV(e).toFixed(2); mzm(); } });
  dis.on(svg, "pointerup", () => { drag = false; });
  mzmV.value = String(MS.V);
  mzm();
  dis.add(onUi(() => { if (+mzmV.value !== MS.V) mzmV.value = String(MS.V); mzm(); }));

  // ---------- L2 r tensor (TECH) ----------
  const rtensor = (): void => {
    const h = rtHTML();
    need(root, "#rt-mx").innerHTML = h.mx; need(root, "#rt-vec").innerHTML = h.vec; need(root, "#rt-dn").innerHTML = h.dn; need(root, "#rt-rot").innerHTML = h.rot;
    need(root, "#rt-set-h").textContent = h.set;
    qa<HTMLTableRowElement>(root, "#coef tbody tr").forEach((tr) => tr.classList.toggle("sel", tr.dataset.set === st.s));
    ([["#rt-e", "e"], ["#rt-p", "p"], ["#rt-s", "s"]] as const).forEach(([id, key]) => qa<HTMLButtonElement>(root, `${id} button`).forEach((b) => b.classList.toggle("on", String(st[key]) === b.dataset.v)));
  };
  ([["#rt-e", "e"], ["#rt-p", "p"], ["#rt-s", "s"]] as const).forEach(([id, key]) => qa<HTMLButtonElement>(root, `${id} button`).forEach((b) => dis.on(b, "click", () => {
    const v = b.dataset.v ?? "";
    if (key === "s") st.s = v as typeof st.s; else st[key] = +v as 0 | 1 | 2;
    rtChanged();
  })));
  qa<HTMLTableRowElement>(root, "#coef tbody tr[data-set]").forEach((tr) => {
    tr.classList.add("go"); tr.tabIndex = 0;
    const pick = (): void => { st.s = tr.dataset.set as typeof st.s; rtChanged(); };
    dis.on(tr, "click", (e: MouseEvent) => { if (!(e.target as Element).closest("[data-pop]")) pick(); });
    dis.on(tr, "keydown", (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
  });
  dis.add(onRt(rtensor));
  rtensor();

  // ---------- L3 figures ----------
  interface Fig { el: HTMLElement; cv: HTMLCanvasElement; cb: HTMLElement; opt: () => FigOpt; base: HTMLCanvasElement; px: (x: number) => number; py: (y: number) => number; inv: ((cx: number, cy: number) => [number, number] | null) | null; W: number; H: number; dpr: number; o: FigOpt }
  interface FigOpt { xr: number[]; yr: number[]; xt: number; yt: number; kind: "seq" | "div"; lo?: number; hi: number; val: (k: number) => number; unit: string }
  const FIG: Record<string, Fig> = {};
  const probe = { i: 0, j: 0 };
  const region = (x: number, y: number): string => { // nodes on an interface take the side above (y + 1e-6 um), as the bottom row y = 0 is LN in the export
    const G = (EO as EOA).geo, yy = y + 1e-6;
    if (pip(G.signal, x, yy)) return "Au signal";
    if (pip(G.ground, x, yy)) return "Au ground";
    if (pip(G.ln_rib, x, yy)) return "LN rib";
    if (pip(G.ln_slab, x, yy)) return "LN slab";
    return y >= 0 ? "SiO₂ cladding" : "SiO₂ BOX";
  };
  function setupFig(id: string, opt: () => FigOpt): void {
    const el = need(root, `#${id}`), cv = el.querySelector<HTMLCanvasElement>(":scope > canvas") as HTMLCanvasElement, cb = need(el, ".cb");
    FIG[id] = { el, cv, cb, opt, base: document.createElement("canvas"), px: (x) => x, py: (y) => y, inv: null, W: 0, H: 0, dpr: 1, o: opt() };
    const fromEvt = (e: PointerEvent): [number, number] | null => { const f = FIG[id], r = cv.getBoundingClientRect(); return f.inv ? f.inv(e.clientX - r.left, e.clientY - r.top) : null; };
    dis.on(cv, "pointermove", (e: PointerEvent) => { const p = fromEvt(e); if (p) probeAt(p[0], p[1]); });
    dis.on(cv, "pointerdown", (e: PointerEvent) => { const p = fromEvt(e); if (p) probeAt(p[0], p[1]); });
    dis.on(cv, "keydown", (e: KeyboardEvent) => {
      const d = e.shiftKey ? 5 : 1, m = ({ ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] } as Record<string, number[]>)[e.key];
      if (!m || !EO) return;
      e.preventDefault(); probe.i = Math.max(0, Math.min(EO.g.nx - 1, probe.i + m[0])); probe.j = Math.max(0, Math.min(EO.g.ny - 1, probe.j + m[1])); drawProbe();
    });
  }
  function probeAt(x: number, y: number): void { const g = (EO as EOA).g; probe.i = Math.max(0, Math.min(g.nx - 1, Math.round((x - g.x0) / g.dx))); probe.j = Math.max(0, Math.min(g.ny - 1, Math.round((g.y1 - y) / g.dx))); drawProbe(); }

  function renderFig(id: string): void {
    const E = EO as EOA, f = FIG[id], o = f.opt(), g = E.g, d = Math.min(2, devicePixelRatio || 1);
    const W = f.cv.clientWidth || f.el.clientWidth, { ml, mr, mt, mb } = FIG_M;
    const pw = W - ml - mr, ph = Math.round((pw * (o.yr[1] - o.yr[0])) / (o.xr[1] - o.xr[0])), H = ph + mt + mb;
    const c = f.base; c.width = W * d; c.height = H * d;
    f.cv.width = W * d; f.cv.height = H * d; f.cv.style.height = `${H}px`;
    const ctx = c.getContext("2d") as CanvasRenderingContext2D; ctx.setTransform(d, 0, 0, d, 0, 0);
    const px = (x: number): number => ml + ((x - o.xr[0]) / (o.xr[1] - o.xr[0])) * pw, py = (y: number): number => mt + ((o.yr[1] - y) / (o.yr[1] - o.yr[0])) * ph;
    f.px = px; f.py = py; f.W = W; f.H = H; f.dpr = d; f.o = o;
    f.inv = (cx, cy) => (cx < ml || cx > ml + pw || cy < mt || cy > mt + ph ? null : [o.xr[0] + ((cx - ml) / pw) * (o.xr[1] - o.xr[0]), o.yr[1] - ((cy - mt) / ph) * (o.yr[1] - o.yr[0])]);
    ctx.fillStyle = cssVar("--bg"); ctx.fillRect(0, 0, W, H);
    // image of the cropped node range (node-centred cells)
    const ia = Math.max(0, Math.floor((o.xr[0] - g.x0) / g.dx)), ib = Math.min(g.nx - 1, Math.ceil((o.xr[1] - g.x0) / g.dx));
    const ja = Math.max(0, Math.floor((g.y1 - o.yr[1]) / g.dx)), jb = Math.min(g.ny - 1, Math.ceil((g.y1 - o.yr[0]) / g.dx));
    const ni = ib - ia + 1, nj = jb - ja + 1, off = document.createElement("canvas"); off.width = ni; off.height = nj;
    const octx = off.getContext("2d") as CanvasRenderingContext2D, img = octx.createImageData(ni, nj), cm = cmap(o.kind), b3 = cssVar("--bg3"), nan = hex(b3.length === 7 ? b3 : "#18191b");
    for (let jj = 0; jj < nj; jj++) for (let i = 0; i < ni; i++) {
      const v = o.val(E.K(ia + i, ja + jj)), qq = 4 * (jj * ni + i);
      const rgb = Number.isFinite(v) ? cm(o.kind === "seq" ? (v - (o.lo ?? 0)) / (o.hi - (o.lo ?? 0)) : 0.5 + (0.5 * v) / o.hi) : nan;
      img.data[qq] = rgb[0]; img.data[qq + 1] = rgb[1]; img.data[qq + 2] = rgb[2]; img.data[qq + 3] = 255;
    }
    octx.putImageData(img, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.rect(ml, mt, pw, ph); ctx.clip();
    ctx.imageSmoothingEnabled = false;
    const x0p = px(E.X(ia) - g.dx / 2), x1p = px(E.X(ib) + g.dx / 2), y0p = py(E.Y(ja) + g.dx / 2), y1p = py(E.Y(jb) - g.dx / 2);
    ctx.drawImage(off, x0p, y0p, x1p - x0p, y1p - y0p);
    // geometry outlines
    const G = E.geo, line = cssVar("--fg");
    const poly = (p: Poly): void => { ctx.beginPath(); p.forEach(([x, y], k) => (k ? ctx.lineTo(px(x), py(y)) : ctx.moveTo(px(x), py(y)))); ctx.closePath(); };
    for (const e of [G.signal, G.ground]) { poly(e); ctx.fillStyle = isVisual() ? cssVar("--gold") : cssVar("--bg3"); ctx.globalAlpha = isVisual() ? 0.55 : 1; ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.globalAlpha = 0.85; ctx.strokeStyle = line; ctx.lineWidth = 1;
    poly(G.ln_rib); ctx.stroke(); poly(G.ln_slab); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.restore();
    ctx.font = "10px 'IBM Plex Mono', ui-monospace, monospace"; ctx.fillStyle = cssVar("--fg3");
    ctx.textAlign = "center";
    for (const [e, t] of [[G.signal, "S"], [G.ground, "G"]] as [Poly, string][]) { const cx = px((e[0][0] + e[1][0]) / 2), cy = py((e[0][1] + e[2][1]) / 2) + 3; if (cx > ml && cx < ml + pw && cy > mt + 8 && cy < mt + ph) { ctx.fillStyle = isVisual() ? "#1a1306" : cssVar("--fg2"); ctx.fillText(t, cx, cy); } }
    ctx.strokeStyle = cssVar("--rule2"); ctx.strokeRect(ml + 0.5, mt + 0.5, pw - 1, ph - 1);
    ctx.fillStyle = cssVar("--fg3"); ctx.textAlign = "center"; ctx.textBaseline = "top";
    const sx = pw < 640 ? Math.max(o.xt, 1) : o.xt;
    for (let x = Math.ceil(o.xr[0] / sx - 1e-9) * sx; x <= o.xr[1] + 1e-9; x += sx) { const Xp = px(x); ctx.fillRect(Xp, mt + ph, 1, 3); ctx.fillText(fix(+x.toFixed(3), sx < 1 ? 1 : 0), Xp, mt + ph + 5); }
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    const sy = ph < 90 ? Math.max(o.yt, 0.2) : o.yt;
    for (let y = Math.ceil(o.yr[0] / sy - 1e-9) * sy; y <= o.yr[1] + 1e-9; y += sy) { const Yp = py(y); ctx.fillRect(ml - 3, Yp, 3, 1); ctx.fillText(fix(+y.toFixed(3), 1), ml - 5, Yp); }
    ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText("x (µm)", ml + pw / 2, mt + ph + 17); ctx.textAlign = "left"; ctx.fillText("y (µm)", 2, 3);
    // colorbar
    const bc = f.cb.querySelector("canvas") as HTMLCanvasElement, bw = Math.max(60, bc.clientWidth || 120);
    bc.width = bw; bc.height = 8;
    const bctx = bc.getContext("2d") as CanvasRenderingContext2D, bimg = bctx.createImageData(bw, 8);
    for (let x = 0; x < bw; x++) { const rgb = cm(x / (bw - 1)); for (let y = 0; y < 8; y++) { const qq = 4 * (y * bw + x); bimg.data[qq] = rgb[0]; bimg.data[qq + 1] = rgb[1]; bimg.data[qq + 2] = rgb[2]; bimg.data[qq + 3] = 255; } }
    bctx.putImageData(bimg, 0, 0);
    need(f.cb, ".lo").innerHTML = o.kind === "seq" ? sci(o.lo ?? 0, 2) : sci(-o.hi, 2);
    need(f.cb, ".hi").innerHTML = sci(o.hi, 2);
    need(f.cb, ".u").innerHTML = o.unit;
    blit(id);
  }
  function blit(id: string): void {
    const E = EO as EOA, f = FIG[id], ctx = f.cv.getContext("2d") as CanvasRenderingContext2D;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(f.base, 0, 0);
    ctx.setTransform(f.dpr, 0, 0, f.dpr, 0, 0);
    const x = E.X(probe.i), y = E.Y(probe.j), o = f.o;
    if (x < o.xr[0] || x > o.xr[1] || y < o.yr[0] || y > o.yr[1]) return;
    const Xp = Math.round(f.px(x)) + 0.5, Yp = Math.round(f.py(y)) + 0.5;
    ctx.strokeStyle = isVisual() ? cssVar("--acc") : cssVar("--fg"); ctx.lineWidth = 1; ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.moveTo(Xp, f.py(o.yr[1])); ctx.lineTo(Xp, f.py(o.yr[0])); ctx.moveTo(f.px(o.xr[0]), Yp); ctx.lineTo(f.px(o.xr[1]), Yp); ctx.stroke();
    ctx.globalAlpha = 1; ctx.strokeRect(Xp - 3, Yp - 3, 6, 6);
  }
  function drawProbe(): void {
    const E = EO as EOA;
    Object.keys(FIG).forEach(blit);
    const k = E.K(probe.i, probe.j), F = E.F, o = F.optEx[k];
    need(root, "#ro").innerHTML = roHTML({ x: E.X(probe.i), y: E.Y(probe.j), o, fin: Number.isFinite(o), ex: F.esEx[k], ey: F.esEy[k], it: F.integrand[k], i33: F.integrand_r33[k] }, E, region);
  }
  let fcField = "integrand";
  const paintFcSeg = (): void => qa<HTMLButtonElement>(root, "#fc-t button").forEach((b) => b.classList.toggle("on", b.dataset.v === fcField));
  function figs(): void {
    const E = EO as EOA, g = E.g, F = E.F, full = { xr: [g.x0 - g.dx / 2, g.x0 + (g.nx - 1) * g.dx + g.dx / 2], yr: [g.y1 - (g.ny - 1) * g.dx - g.dx / 2, g.y1 + g.dx / 2] };
    let esMax = 0, esMin = 0;
    for (const v of F.esEx) { esMax = Math.max(esMax, v); esMin = Math.min(esMin, v); }
    const esSigned = esMin < -1e-6 * esMax;
    setupFig("fa", () => ({ ...full, xt: 1, yt: 0.5, kind: "seq", lo: 0, hi: 1, val: (k) => F.optEx[k] ** 2 / E.eMax, unit: "|E<sub>x</sub>|<sup>2</sup> / |E<sub>x</sub>|<sup>2</sup><sub>max</sub>" }));
    setupFig("fb", () => (esSigned
      ? { ...full, xt: 1, yt: 0.5, kind: "div", hi: Math.max(esMax, -esMin) * 1e-6, val: (k) => F.esEx[k] * 1e-6, unit: "(V/µm)/V" }
      : { ...full, xt: 1, yt: 0.5, kind: "seq", lo: 0, hi: esMax * 1e-6, val: (k) => F.esEx[k] * 1e-6, unit: "(V/µm)/V" }));
    setupFig("fc", () => {
      const f = F[fcField];
      let a = 0;
      for (const v of f) if (Number.isFinite(v)) a = Math.max(a, Math.abs(v));
      return { ...FC_RANGE, xt: 0.5, yt: 0.1, kind: "div", hi: a * 1e-12, val: (k) => f[k] * 1e-12, unit: "1/(V µm<sup>2</sup>)" };
    });
    need(root, "#fa-pk").innerHTML = faPkHTML(Math.sqrt(E.eMax));
    need(root, "#fb-pk").innerHTML = fbPkHTML(esMax * 1e-6, esSigned);
    qa<HTMLButtonElement>(root, "#fc-t button").forEach((b) => dis.on(b, "click", () => { fcField = b.dataset.v ?? "integrand"; paintFcSeg(); renderFig("fc"); }));
    paintFcSeg();
  }

  // ---------- (d) depth profile ----------
  function depth(): void {
    const E = EO as EOA, s = need<SVGSVGElement>(root, "#fd-svg"), W = Math.max(260, s.clientWidth || 360), H = 260, l = 44, r = 64, t = 20, b = 30;
    s.setAttribute("viewBox", `0 0 ${W} ${H}`); s.style.height = `${H}px`;
    const y0 = -0.075, y1 = 0.375, rows = E.prof.filter((p) => p.y > y0 && p.y < y1);
    let mn = 0;
    rows.forEach((p) => { mn = Math.min(mn, p.t, p.r); });
    const step = niceStep(-mn, 4), xmin = -Math.ceil(-mn / step) * step;
    const X = (v: number): number => l + ((v - xmin) / (0 - xmin)) * (W - l - r), Y = (y: number): number => t + ((y1 - y) / (y1 - y0)) * (H - t - b), dy = E.g.dx;
    const G = E.geo, yS = G.ln_slab[2][1], yR = G.ln_rib[2][1];
    let o = `<rect x="${l}" y="${Y(yS)}" width="${W - l - r}" height="${Y(0) - Y(yS)}" class="dpb"/><rect x="${l}" y="${Y(yR)}" width="${W - l - r}" height="${Y(yS) - Y(yR)}" class="dpb b2"/>`;
    o += `<text x="${W - r + 6}" y="${(Y(yS) + Y(0)) / 2 + 3}" class="tk">slab</text><text x="${W - r + 6}" y="${(Y(yR) + Y(yS)) / 2 + 3}" class="tk">rib</text>`;
    for (let v = xmin; v <= 1e-12; v += step) o += `<line x1="${X(v)}" x2="${X(v)}" y1="${t}" y2="${H - b}" class="gl"/><text x="${X(v)}" y="${H - b + 13}" text-anchor="middle" class="tk">${Math.abs(v) < 1e-12 ? "0" : fix(v * 1e5, 0)}</text>`;
    o += `<text x="${l}" y="${H - 3}" class="tk">&#215;10&#8315;&#8309; 1/(V µm)</text>`;
    for (let y = -0.05; y <= 0.35 + 1e-9; y += 0.05) o += `<text x="${l - 5}" y="${Y(y) + 3}" text-anchor="end" class="tk">${fix(+y.toFixed(2), 2)}</text>`;
    o += `<text x="2" y="11" class="tk">y (µm)</text>`;
    rows.forEach((p) => { const k = E.prof.indexOf(p); o += `<rect class="dpbar${p.t ? "" : " zero"}" data-k="${k}" x="${X(p.t)}" y="${Y(p.y + dy / 2) + 0.5}" width="${Math.max(0.5, X(0) - X(p.t))}" height="${Math.max(1, Y(p.y - dy / 2) - Y(p.y + dy / 2) - 1)}"/>`; });
    let dd = "";
    rows.forEach((p, i) => { dd += `${i ? "L" : "M"}${X(p.r).toFixed(1)} ${Y(p.y + dy / 2).toFixed(1)}L${X(p.r).toFixed(1)} ${Y(p.y - dy / 2).toFixed(1)}`; });
    o += `<path d="${dd}" class="r33"/><line x1="${X(0)}" x2="${X(0)}" y1="${t}" y2="${H - b}" class="ax"/>`;
    o += `<rect x="${l}" y="${t}" width="${W - l - r}" height="${H - t - b}" class="frame"/>`;
    s.innerHTML = o;
    const ro = need(root, "#fd-ro");
    const showRow = (k: number): void => { const p = E.prof[k], itf = Math.abs(p.y) < 1e-9 || Math.abs(p.y - yS) < 1e-9 || Math.abs(p.y - yR) < 1e-9; ro.innerHTML = fdRowHTML(p, itf); };
    s.querySelectorAll<SVGRectElement>(".dpbar").forEach((bEl) => bEl.addEventListener("pointerenter", () => showRow(+(bEl.dataset.k ?? 0))));
    s.onpointerdown = (e) => { const bEl = (e.target as Element).closest<SVGRectElement>(".dpbar"); if (bEl) showRow(+(bEl.dataset.k ?? 0)); };
    const sumRows = E.prof.reduce((a, p) => a + p.t * dy, 0);
    need(root, "#fd-sum").innerHTML = fdSumHTML(sumRows);
    showRow(E.prof.reduce((bi, p, i) => (p.t < E.prof[bi].t ? i : bi), 0));
  }

  // ---------- reserved layout before the data arrives ----------
  function reserve(): void {
    for (const [id, o] of [["fa", FULL0], ["fb", FULL0], ["fc", FC_RANGE]] as const) {
      const cv = q<HTMLCanvasElement>(root, `#${id} > canvas`);
      if (cv) cv.style.height = `${figHeight(cv.clientWidth, o)}px`;
    }
    need<SVGSVGElement>(root, "#fd-svg").style.height = "260px";
  }
  reserve();
  const renderAll = (): void => { if (!alive) return; if (!EO) { reserve(); return; } Object.keys(FIG).forEach(renderFig); drawProbe(); depth(); };

  fetch("/data/eo-overlap-li2026aa.json").then((r) => r.json() as Promise<EOJson>).then((j) => {
    if (!alive) return;
    EO = analyze(j);
    if (Math.abs(j.geometry.measured.vpi_dc_v - VPI_MEAS) > 1e-9) console.warn("eo: measured Vpi differs from json");
    need<SVGPathElement>(svg, "#mzm-eng").setAttribute("d", mzmCurve(j.metrics.vpi_dc_v));
    mzm();
    if ((["x0", "y1", "dx", "nx", "ny"] as const).some((k) => Math.abs(j.meta.grid[k] - GRID0[k]) > 1e-9)) console.warn("eo: json grid differs from the reserved layout grid");
    figs();
    const n = numbersHTML(EO);
    need(root, "#ntab tbody").innerHTML = n.ntab; need(root, "#l3-why").innerHTML = n.why; need(root, "#l3-grid-note").innerHTML = n.note; need(root, "#map-r33").innerHTML = n.mapR33; need(root, "#l3-date").innerHTML = n.date;
    probe.i = EO.kMax % EO.g.nx; probe.j = Math.floor(EO.kMax / EO.g.nx);
    renderAll();
  }).catch((e: unknown) => { const tb = q(root, "#ntab tbody"); if (tb) tb.innerHTML = `<tr><td colspan="4">FEM data not loaded (${String((e as Error).message || e)}).</td></tr>`; });

  dis.add(onUi(renderAll));
  let rt = 0;
  const onResize = (): void => { clearTimeout(rt); rt = window.setTimeout(renderAll, 120); };
  dis.on(window, "resize", onResize);
  dis.add(() => { alive = false; clearTimeout(rt); });
  return dis.run;
}
