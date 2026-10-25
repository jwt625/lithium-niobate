// TFLN rib-waveguide mode lattice (figure F2-15): multilinear interpolation of a precomputed full-vector FEM lattice
// and the symmetric anisotropic slab solver used for the lateral-leakage flag.
// Lattice: static/data/tfln-modes/lattice.json, written by scripts/precompute_tfln_modes.mjs with the
//   eo-modulator-atlas engine (GPL-3.0-or-later; full-vector Nedelec/Lagrange order-2 FEM, src/vector-mode.mjs).
//   Every lattice value is status `derived` (engine output); the stack, material models, window rule, mode tracking and
//   held-out interpolation error are recorded in lattice.meta.
// Axes: film thickness t (nm), etch fraction (etch depth / t; 1 = fully etched, no slab), rib top width w (um),
//   sidewall angle from horizontal (deg; bottom width = w + 2 t etch / tan(angle)), wavelength (um), cut (x | z).
//   Interpolation is multilinear in (t, etch, w, sidewall, lambda) within one cut; lambda has three nodes, so values
//   between them carry validity.lambdaOnGrid = false.
// Modes: TE0, TM0, TE1 labelled by dominant polarization (TE fraction > 0.5: TE family) and n_eff order within a family;
//   width tracking only orders near-degenerate neighbours (scripts/precompute_tfln_modes.mjs relabelRecords).
// Slab solver: symmetric three-layer slab (cladding index on both sides), core permittivity diagonal in the lab frame
//   (x lateral, y film normal, z propagation). TE (E along x): tan(kd/2) = g/k, k^2 = k0^2 eps_xx - b^2.
//   TM (H along x): k^2 = (eps_zz/eps_yy)(k0^2 eps_yy - b^2), tan(kd/2) = eps_zz g / (n_c^2 k); g^2 = b^2 - k0^2 n_c^2.
//   Fundamental (even) branch, bisection on n_eff (derivation: Maxwell curl equations for diagonal eps; continuity of
//   H_x and (1/eps_zz) dH_x/dy).

export type Cut = "x" | "z";
export type ModeLabel = "TE0" | "TM0" | "TE1";
export const MODE_LABELS: readonly ModeLabel[] = ["TE0", "TM0", "TE1"];
export const MODE_QUANTITIES = ["n_eff", "n_g", "a_eff_um2", "ln_fraction", "te_fraction"] as const;
export type ModeQuantity = (typeof MODE_QUANTITIES)[number];

/** Per-point flag bits written by the precompute script (lattice.meta.flags repeats this legend). */
export const FLAG = {
  NOT_FOUND: 1, // no mode of this label identified; values null
  NOT_CONVERGED: 2, // eigen solve residual above tolerance
  WINDOW_EDGE: 4, // power fraction within 10 % of the window edge > 1e-2
  LEAKY: 8, // n_eff below the outer-slab fundamental index of its own dominant polarization (or the cladding): not bound
  TRACK_LOW: 16, // overlap with the previous width's mode < 0.9
  REIDENTIFIED: 32, // overlap < 0.5: track lost, label re-assigned by symmetry class and TE fraction
  CROSS_LEAKY: 64, // bound for its own polarization but below the other polarization's slab index: lateral-leakage risk
  POL_RELABELED: 128, // label moved to a different mode than the solve-time overlap tracking (provenance)
  POL_HYBRID: 256, // 0.3 < TE fraction < 0.7: strongly hybrid, TE / TM label ambiguous
} as const;

export interface LatticeAxes {
  t_nm: number[];
  etch: number[];
  w_um: number[];
  sidewall_deg: number[];
  lambda_um: number[];
  cut: Cut[];
}

export interface LatticeData {
  meta: Record<string, unknown>;
  axes: LatticeAxes;
  /** Row-major order of the flattened arrays, slowest first; w is fastest. */
  order: ["cut", "lambda_um", "sidewall_deg", "t_nm", "etch", "w_um"];
  modes: Record<ModeLabel, Record<ModeQuantity, (number | null)[]> & { flags: number[] }>;
}

export interface ModeQuery {
  t: number; // nm
  etch: number; // fraction 0-1
  w: number; // um, top width
  sidewall: number; // deg from horizontal
  lambda: number; // um
  cut: Cut;
  /** TE0 | TM0 | TE1; TE and TM are aliases of TE0 and TM0. */
  pol: ModeLabel | "TE" | "TM";
}

export interface ModeValidity {
  valid: boolean; // inRange && converged && guided && finite values
  inRange: boolean;
  outOfRange: string[]; // axes clamped to the grid
  lambdaOnGrid: boolean;
  converged: boolean; // no NOT_FOUND / NOT_CONVERGED / WINDOW_EDGE at any contributing node
  guided: boolean; // no LEAKY at any contributing node
  lateralLeakage: boolean; // CROSS_LEAKY at any contributing node (values valid; leakage by polarization conversion possible)
  tracked: boolean; // no TRACK_LOW / REIDENTIFIED at any contributing node
  hybrid: boolean; // 0.1 <= interpolated TE fraction <= 0.9, or POL_HYBRID at any contributing node
  flagsOr: number; // OR of the contributing nodes' flags
}

export interface ModeResult {
  mode: ModeLabel;
  n_eff: number;
  n_g: number;
  a_eff_um2: number;
  ln_fraction: number;
  te_fraction: number;
  validity: ModeValidity;
}

/** Bracket of x in a sorted axis: lower index i and weight f of node i + 1 (clamped). */
function bracket(axis: number[], x: number): { i: number; f: number; clamped: boolean } {
  const n = axis.length;
  if (n === 1) return { i: 0, f: 0, clamped: x !== axis[0] };
  const tol = 1e-9 * Math.max(1, Math.abs(axis[n - 1]));
  if (x <= axis[0] + tol) return { i: 0, f: 0, clamped: x < axis[0] - tol };
  if (x >= axis[n - 1] - tol) return { i: n - 2, f: 1, clamped: x > axis[n - 1] + tol };
  let i = 0;
  while (i < n - 2 && axis[i + 1] <= x) i++;
  return { i, f: (x - axis[i]) / (axis[i + 1] - axis[i]), clamped: false };
}

export interface ModeLattice {
  axes: LatticeAxes;
  meta: Record<string, unknown>;
  query(q: ModeQuery): ModeResult;
  /** Flat index of a grid node (w fastest). */
  index(cut: Cut, il: number, isw: number, it: number, ie: number, iw: number): number;
}

export function createModeLattice(data: LatticeData): ModeLattice {
  const A = data.axes;
  const dims = [A.cut.length, A.lambda_um.length, A.sidewall_deg.length, A.t_nm.length, A.etch.length, A.w_um.length];
  const N = dims.reduce((a, b) => a * b, 1);
  for (const m of MODE_LABELS) {
    for (const q of MODE_QUANTITIES) if (data.modes[m][q].length !== N) throw new Error(`lattice ${m}.${q}: expected ${N} values`);
    if (data.modes[m].flags.length !== N) throw new Error(`lattice ${m}.flags: expected ${N} values`);
  }
  const index = (cut: Cut, il: number, isw: number, it: number, ie: number, iw: number): number => {
    const ic = A.cut.indexOf(cut);
    if (ic < 0) throw new Error(`unknown cut ${cut}`);
    return ((((ic * dims[1] + il) * dims[2] + isw) * dims[3] + it) * dims[4] + ie) * dims[5] + iw;
  };
  const query = (q: ModeQuery): ModeResult => {
    const mode: ModeLabel = q.pol === "TE" ? "TE0" : q.pol === "TM" ? "TM0" : q.pol;
    if (!MODE_LABELS.includes(mode)) throw new Error(`unknown mode ${q.pol}`);
    if (!A.cut.includes(q.cut)) throw new Error(`unknown cut ${q.cut}`);
    const b = {
      lambda_um: bracket(A.lambda_um, q.lambda),
      sidewall_deg: bracket(A.sidewall_deg, q.sidewall),
      t_nm: bracket(A.t_nm, q.t),
      etch: bracket(A.etch, q.etch),
      w_um: bracket(A.w_um, q.w),
    };
    const outOfRange = Object.entries(b).filter(([, v]) => v.clamped).map(([k]) => k);
    const lambdaOnGrid = A.lambda_um.some((l) => Math.abs(l - q.lambda) < 1e-9);
    const D = data.modes[mode];
    const acc: Record<ModeQuantity, number> = { n_eff: 0, n_g: 0, a_eff_um2: 0, ln_fraction: 0, te_fraction: 0 };
    let flagsOr = 0;
    let finite = true;
    const bl = [b.lambda_um, b.sidewall_deg, b.t_nm, b.etch, b.w_um];
    for (let c = 0; c < 32; c++) {
      let wgt = 1;
      const ix: number[] = [];
      for (let a = 0; a < 5; a++) {
        const hi = (c >> a) & 1;
        const { i, f } = bl[a];
        wgt *= hi ? f : 1 - f;
        ix.push(i + hi);
      }
      if (wgt === 0) continue;
      const k = index(q.cut, ix[0], ix[1], ix[2], ix[3], ix[4]);
      flagsOr |= D.flags[k];
      for (const qq of MODE_QUANTITIES) {
        const v = D[qq][k];
        if (v === null || !Number.isFinite(v)) finite = false;
        else acc[qq] += wgt * v;
      }
    }
    if (!finite) for (const qq of MODE_QUANTITIES) acc[qq] = Number.NaN;
    const converged = (flagsOr & (FLAG.NOT_FOUND | FLAG.NOT_CONVERGED | FLAG.WINDOW_EDGE)) === 0;
    const guided = (flagsOr & FLAG.LEAKY) === 0;
    const tracked = (flagsOr & (FLAG.TRACK_LOW | FLAG.REIDENTIFIED)) === 0;
    const inRange = outOfRange.length === 0;
    return {
      mode,
      ...acc,
      validity: {
        valid: inRange && converged && guided && finite,
        inRange,
        outOfRange,
        lambdaOnGrid,
        converged,
        guided,
        lateralLeakage: (flagsOr & FLAG.CROSS_LEAKY) !== 0,
        tracked,
        hybrid: (finite && acc.te_fraction >= 0.1 && acc.te_fraction <= 0.9) || (flagsOr & FLAG.POL_HYBRID) !== 0,
        flagsOr,
      },
    };
  };
  return { axes: A, meta: data.meta, query, index };
}

export interface SlabInput {
  d_um: number; // core thickness
  lambda_um: number;
  /** Diagonal core permittivity in the lab frame [eps_xx, eps_yy, eps_zz] (x lateral, y normal, z propagation). */
  eps: [number, number, number];
  n_clad: number;
  pol: "TE" | "TM";
}

/** Fundamental mode index of a symmetric anisotropic slab (n_clad when d = 0). */
export function slabIndex(p: SlabInput): number {
  const { d_um: d, lambda_um: lam, eps, n_clad: nc, pol } = p;
  if (!(d >= 0) || !(lam > 0) || !(nc > 0)) throw new RangeError("slabIndex: d >= 0, lambda > 0, n_clad > 0");
  if (d === 0) return nc;
  const k0 = (2 * Math.PI) / lam;
  const nMax = Math.sqrt(pol === "TE" ? eps[0] : eps[1]);
  if (!(nMax > nc)) return Number.NaN;
  // f(n) = k d / 2 - atan(rhs) decreases from > 0 near n_clad to < 0 near nMax on the fundamental branch
  const f = (n: number): number => {
    const g = k0 * Math.sqrt(Math.max(0, n * n - nc * nc));
    if (pol === "TE") {
      const k = k0 * Math.sqrt(Math.max(0, eps[0] - n * n));
      return (k * d) / 2 - Math.atan2(g, k);
    }
    const k = k0 * Math.sqrt((eps[2] / eps[1]) * Math.max(0, eps[1] - n * n));
    return (k * d) / 2 - Math.atan2(eps[2] * g, nc * nc * k);
  };
  let lo = nc + 1e-12, hi = nMax - 1e-12;
  if (f(lo) <= 0) return nc;
  for (let it = 0; it < 200 && hi - lo > 1e-14; it++) {
    const mid = 0.5 * (lo + hi);
    if (f(mid) > 0) lo = mid;
    else hi = mid;
  }
  return 0.5 * (lo + hi);
}

/**
 * Lab-frame diagonal permittivity of LN for a cut: x-cut with propagation along crystal y (lab x = crystal z, n_e
 * lateral); z-cut with propagation along crystal x (lab y = crystal z, n_e normal). Matches the engine's
 * labFromCrystal(cut, propagation) for these two orientations.
 */
export function lnLabEps(cut: Cut, n_o: number, n_e: number): [number, number, number] {
  const o = n_o * n_o, e = n_e * n_e;
  return cut === "x" ? [e, o, o] : [o, e, o];
}
