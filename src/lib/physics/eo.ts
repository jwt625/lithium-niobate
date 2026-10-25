// EO overlap from an exported FEM field set (F2-05): framework-agnostic port of the computational part of mockup/eo.js.
// Input: the parsed JSON of static/data/eo-overlap-li2026aa.json (eo-modulator-atlas engine export, GPL-3.0-or-later
// engine; li2026aa-d device, 1550 nm, x-cut TE). Grid: node (i, j) at x = x0 + i dx, y = y1 - j dx (um), row-major
// k = j nx + i. Fields: optEx (V/m), esEx, esEy ((V/m)/V), integrand and integrand_r33 (1/(V m^2)); NaN outside the
// engine's arm window.
// Integrals (manuscript C02 eqs. 2.7-2.9):
//   nodal sum       sum f dx^2 over finite nodes                                         (1/V)
//   column trapezoid inside the LN polygons, interface values linearly extrapolated from the two nearest interior nodes,
//                   split into rib, slab under the rib (|x| < rib base half-width) and slab outside
//   Ebar_x          int_LN e_x |E_x|^2 dA / int |E_x|^2 dA (grid window); Gamma_x = Ebar_x g
//   scalar TE       dn_eff/dV = -(n_e^4 r33 / (2 n_eff)) Ebar_x     (eq. 2.8)
//   conventional    dn/dV = -(1/2) n_e^3 r33 Ebar_A                  (engine Ebar)
// Regions: nodes on an interface take the side above (y + 1e-6 um), as in the export (bottom row y = 0 is LN).
// Engine-reported values (globals, surfaceIntegrals, metrics) are passed through with status "engine".

export interface EoGeometry {
  ln_slab: [number, number][];
  ln_rib: [number, number][];
  signal: [number, number][];
  ground: [number, number][];
  r_pm_per_v: { r13: number; r22: number; r33: number; r51: number };
  n_e: number;
  n_o: number;
  lambda_um: number;
  length_mm: number;
  measured: { vpi_l_dc_vcm: number; vpi_dc_v: number; locator?: string };
}
export interface EoExport {
  meta: { grid: { x0: number; y1: number; dx: number; nx: number; ny: number }; exported?: string; [k: string]: unknown };
  metrics: Record<string, number>;
  fields: Record<string, { f32: string; unit?: string }>;
  globals: Record<string, { value: number; unit?: string }>;
  surfaceIntegrals: Record<string, { value: number; unit?: string }>;
  geometry: EoGeometry;
}

export type EoRegion = "Au signal" | "Au ground" | "LN rib" | "LN slab" | "SiO2 cladding" | "SiO2 BOX";

/** Decode a base64 little-endian Float32 array (browser atob or Node Buffer-free path). */
export function decodeF32(b64: string): Float32Array {
  const s = globalThis.atob(b64);
  const u = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
  return new Float32Array(u.buffer);
}

/** Even-odd point-in-polygon test. */
export function pointInPolygon(p: readonly (readonly [number, number])[], x: number, y: number): boolean {
  let c = false;
  for (let a = 0, b = p.length - 1; a < p.length; b = a++) {
    const [xa, ya] = p[a];
    const [xb, yb] = p[b];
    if (ya > y !== yb > y && x < ((xb - xa) * (y - ya)) / (yb - ya) + xa) c = !c;
  }
  return c;
}

/** Region of a point (um); interface points take the side above. */
export function eoRegion(G: EoGeometry, x: number, y: number): EoRegion {
  const yy = y + 1e-6;
  if (pointInPolygon(G.signal, x, yy)) return "Au signal";
  if (pointInPolygon(G.ground, x, yy)) return "Au ground";
  if (pointInPolygon(G.ln_rib, x, yy)) return "LN rib";
  if (pointInPolygon(G.ln_slab, x, yy)) return "LN slab";
  return y >= 0 ? "SiO2 cladding" : "SiO2 BOX";
}

export interface TrapSplit {
  rib: number;
  slabIn: number;
  slabOut: number;
  total: number;
}
export interface EoAnalysis {
  grid: EoExport["meta"]["grid"];
  F: Record<string, Float32Array>;
  /** node coordinates (um) and index */
  X: (i: number) => number;
  Y: (j: number) => number;
  K: (i: number, j: number) => number;
  /** max |E_x|^2 over the grid and its node index */
  eMax: number;
  kMax: number;
  /** int |E_x|^2 dA (V^2) over the grid window, the part inside LN, and int_LN e_x |E_x|^2 dA */
  den: number;
  inLN: number;
  num: number;
  /** nodal sums (1/V), total and r33-only */
  nodal: { t: number; r: number };
  /** column-trapezoid split (1/V), total and r33-only */
  trap: { t: TrapSplit; r: TrapSplit };
  /** grid overlap: Ebar_x ((V/m)/V) and Gamma_x */
  gx: { Ebar: number; Gamma: number };
  /** depth profile: per row, x-integral of the integrand (1/(V um)), total and r33-only */
  prof: { y: number; t: number; r: number }[];
  /** rib-top interface row: nodes inside the rib top and how many return LN (nonzero) integrand values */
  topN: number;
  topLN: number;
}

/** All grid integrals of the export (port of mockup/eo.js analyze()). */
export function eoAnalyze(j: EoExport): EoAnalysis {
  const g = j.meta.grid;
  const { nx, ny, dx, x0, y1 } = g;
  const G = j.geometry;
  const F: Record<string, Float32Array> = {};
  for (const k in j.fields) F[k] = decodeF32(j.fields[k].f32);
  for (const k of ["optEx", "esEx", "esEy", "integrand", "integrand_r33"])
    if (!F[k] || F[k].length !== nx * ny) throw new Error(`eoAnalyze: field ${k} missing or not ${nx} x ${ny}`);
  const X = (i: number): number => x0 + i * dx;
  const Y = (jj: number): number => y1 - jj * dx;
  const K = (i: number, jj: number): number => jj * nx + i;
  const dA = (dx * 1e-6) ** 2;
  const nodal = (f: Float32Array): number => {
    let s = 0;
    for (const v of f) if (Number.isFinite(v)) s += v * dA;
    return s;
  };
  let eMax = 0;
  let kMax = 0;
  F.optEx.forEach((v, k) => {
    if (v * v > eMax) {
      eMax = v * v;
      kMax = k;
    }
  });
  let den = 0;
  let inLN = 0;
  let num = 0;
  for (let jj = 0; jj < ny; jj++)
    for (let i = 0; i < nx; i++) {
      const k = K(i, jj);
      const o = F.optEx[k];
      if (!Number.isFinite(o)) continue;
      const x = X(i);
      const y = Y(jj) + 1e-6;
      const ln = pointInPolygon(G.ln_rib, x, y) || pointInPolygon(G.ln_slab, x, y);
      den += o * o * dA;
      if (ln) {
        inLN += o * o * dA;
        num += F.esEx[k] * o * o * dA;
      }
    }
  const yS = G.ln_slab[2][1];
  const yB = G.ln_slab[0][1];
  const yR = G.ln_rib[2][1];
  const wb = G.ln_rib[1][0];
  const wt = G.ln_rib[2][0];
  const ytop = (x: number): number => {
    const a = Math.abs(x);
    return a <= wt ? yR : a >= wb ? yS : yS + ((yR - yS) * (wb - a)) / (wb - wt);
  };
  const colInt = (f: Float32Array, i: number, ya: number, yb: number): number => {
    const P: [number, number][] = [];
    for (let jj = ny - 1; jj >= 0; jj--) {
      const y = Y(jj);
      if (y > ya + 1e-9 && y < yb - 1e-9) P.push([y, f[K(i, jj)]]);
    }
    if (P.length === 0) return 0;
    if (P.length === 1) return P[0][1] * (yb - ya);
    const ext = (p0: [number, number], p1: [number, number], y: number): number => p0[1] + ((p1[1] - p0[1]) * (y - p0[0])) / (p1[0] - p0[0]);
    const pts: [number, number][] = [[ya, ext(P[0], P[1], ya)], ...P, [yb, ext(P[P.length - 1], P[P.length - 2], yb)]];
    let s = 0;
    for (let q = 1; q < pts.length; q++) s += 0.5 * (pts[q][1] + pts[q - 1][1]) * (pts[q][0] - pts[q - 1][0]);
    return s;
  };
  const jMid = Math.round((y1 - 0.5 * (yB + yS)) / dx);
  const cols: number[] = [];
  for (let i = 0; i < nx; i++) if (Number.isFinite(F.integrand[K(i, jMid)])) cols.push(i);
  const trapSplit = (f: Float32Array): TrapSplit => {
    const out = { rib: 0, slabIn: 0, slabOut: 0, total: 0 };
    cols.forEach((i, c) => {
      const w = (c === 0 || c === cols.length - 1 ? 0.5 : 1) * dx * 1e-12; // um^2 -> m^2
      const x = X(i);
      const s = colInt(f, i, yB, yS) * w;
      const yt = ytop(x);
      if (Math.abs(x) < wb) out.slabIn += s;
      else out.slabOut += s;
      if (yt > yS + 1e-9) out.rib += colInt(f, i, yS, yt) * w;
    });
    out.total = out.rib + out.slabIn + out.slabOut;
    return out;
  };
  const jTop = Math.round((y1 - yR) / dx);
  let topN = 0;
  let topLN = 0;
  for (let i = 0; i < nx; i++) {
    const x = X(i);
    const v = F.integrand[K(i, jTop)];
    if (Math.abs(x) < wt && Number.isFinite(v)) {
      topN++;
      if (v !== 0) topLN++;
    }
  }
  const prof: { y: number; t: number; r: number }[] = [];
  for (let jj = 0; jj < ny; jj++) {
    let s = 0;
    let s33 = 0;
    cols.forEach((i, c) => {
      const w = (c === 0 || c === cols.length - 1 ? 0.5 : 1) * dx;
      const k = K(i, jj);
      if (Number.isFinite(F.integrand[k])) {
        s += F.integrand[k] * w;
        s33 += F.integrand_r33[k] * w;
      }
    });
    prof.push({ y: Y(jj), t: s * 1e-12, r: s33 * 1e-12 });
  }
  const Ebar = num / den;
  return {
    grid: g,
    F,
    X,
    Y,
    K,
    eMax,
    kMax,
    den,
    inLN,
    num,
    nodal: { t: nodal(F.integrand), r: nodal(F.integrand_r33) },
    trap: { t: trapSplit(F.integrand), r: trapSplit(F.integrand_r33) },
    gx: { Ebar, Gamma: Ebar * j.globals.gapA.value },
    prof,
    topN,
    topLN,
  };
}

export interface EoNumbers {
  /** engine dn_eff/dV arm A, r33-only, arm B (1/V) [engine] */
  engine: number;
  engineR33: number;
  engineB: number;
  /** grid nodal and trapezoid totals (1/V) [derived] and their relative deviation from the engine */
  nodal: number;
  nodalDev: number;
  trap: number;
  trapDev: number;
  /** region shares of the trapezoid total */
  share: { rib: number; slabIn: number; slabOut: number };
  /** tensor-entry shares of the engine total (r33, r13, r51, r22) */
  tensorShare: { r33: number; r13: number; r51: number; r22: number };
  /** engine overlap Gamma_A, Ebar_A (V/m per V), gap (m) [engine]; grid Gamma_x [derived] */
  GammaA: number;
  EbarA: number;
  gap_m: number;
  GammaX: number;
  /** n_e (engine material), n_eff, n_g [engine]; ratio n_e/n_eff [derived] */
  ne: number;
  neff: number;
  ng: number;
  neOverNeff: number;
  /** fraction of int |E_x|^2 dA inside LN (grid) */
  fracLN: number;
  /** eq. 2.8 scalar TE and conventional -(1/2) n_e^3 r33 Ebar_A (1/V) [derived] */
  scalarTE: number;
  conventional: number;
  /** VpiL (V cm): engine, textbook (engine), check lambda / (2 |dn_A - dn_B|), measured [reported] */
  vpiLEngine: number;
  vpiLTextbook: number;
  vpiLCheck: number;
  vpiLMeasured: number;
  /** Vpi at the device length (V): engine metric and measured [reported] */
  vpiEngine: number;
  vpiMeasured: number;
}

/** The numbers table of F2-05 (port of mockup/eo.js numbers()). */
export function eoNumbers(j: EoExport, E: EoAnalysis): EoNumbers {
  const gl = j.globals;
  const si = j.surfaceIntegrals;
  const G = j.geometry;
  const eng = gl.dneffA.value;
  const tot = si["eoA.integrand"].value;
  const ne = G.n_e;
  const neff = gl["armA.neff"].value;
  const r33 = G.r_pm_per_v.r33 * 1e-12;
  const lam = G.lambda_um * 1e-6;
  const T = E.trap.t;
  return {
    engine: eng,
    engineR33: si["eoA.integrand_r33"].value,
    engineB: gl.dneffB.value,
    nodal: E.nodal.t,
    nodalDev: E.nodal.t / eng - 1,
    trap: T.total,
    trapDev: T.total / eng - 1,
    share: { rib: T.rib / T.total, slabIn: T.slabIn / T.total, slabOut: T.slabOut / T.total },
    tensorShare: {
      r33: si["eoA.integrand_r33"].value / tot,
      r13: si["eoA.integrand_r13"].value / tot,
      r51: si["eoA.integrand_r51"].value / tot,
      r22: si["eoA.integrand_r22"].value / tot,
    },
    GammaA: gl.GammaA.value,
    EbarA: gl.EbarA.value,
    gap_m: gl.gapA.value,
    GammaX: E.gx.Gamma,
    ne,
    neff,
    ng: gl["armA.ng"].value,
    neOverNeff: ne / neff,
    fracLN: E.inLN / E.den,
    scalarTE: -((ne ** 4 * r33) / (2 * neff)) * E.gx.Ebar,
    conventional: -0.5 * ne ** 3 * r33 * gl.EbarA.value,
    vpiLEngine: gl.VpiL.value * 100,
    vpiLTextbook: gl.VpiLtextbook.value * 100,
    vpiLCheck: (lam / (2 * Math.abs(gl.dneffA.value - gl.dneffB.value))) * 100,
    vpiLMeasured: G.measured.vpi_l_dc_vcm,
    vpiEngine: j.metrics.vpi_dc_v,
    vpiMeasured: G.measured.vpi_dc_v,
  };
}

export interface EoProbe {
  i: number;
  j: number;
  x: number;
  y: number;
  region: EoRegion;
  /** false outside the engine arm window (optical field undefined) */
  finite: boolean;
  /** E_x (V/m), |E_x|^2 / max, e_x and e_y ((V/m)/V), integrand total and r33 (1/(V m^2)) */
  Ex: number;
  ExNorm2: number;
  ex: number;
  ey: number;
  integrand: number;
  integrandR33: number;
}

/** Hover lookup: nearest node to (x, y) in um, clamped to the grid. */
export function eoProbe(j: EoExport, E: EoAnalysis, x: number, y: number): EoProbe {
  const g = E.grid;
  const i = Math.max(0, Math.min(g.nx - 1, Math.round((x - g.x0) / g.dx)));
  const jj = Math.max(0, Math.min(g.ny - 1, Math.round((g.y1 - y) / g.dx)));
  const k = E.K(i, jj);
  const o = E.F.optEx[k];
  const fin = Number.isFinite(o);
  return {
    i,
    j: jj,
    x: E.X(i),
    y: E.Y(jj),
    region: eoRegion(j.geometry, E.X(i), E.Y(jj)),
    finite: fin,
    Ex: o,
    ExNorm2: fin ? (o * o) / E.eMax : Number.NaN,
    ex: E.F.esEx[k],
    ey: E.F.esEy[k],
    integrand: E.F.integrand[k],
    integrandR33: E.F.integrand_r33[k],
  };
}
