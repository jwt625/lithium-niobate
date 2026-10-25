// Ferroelectric switching toys and closed forms (FIG-01-02 energy inset, FIG-01-08 hysteresis, FIG-01-09 poling bench,
// FIG-01-10 domain-wall bound charge; C01 manuscript Secs. 2, 8, 9, 10).
//
// Sourced closed forms (derived from sourced inputs):
//   switched charge Q = 2 Ps A; wafer voltage V = Ec t; bound charge on a wall tilted by theta from c: sigma_b = 2 Ps sin(theta);
//   unscreened depolarizing field E = Ps / (eps0 eps33).
// Loop construction (C01 figures.md FIG-01-08, derived): with the virgin polarization along +z and an internal field Eint along it,
// forward switching (+ to -) needs E = -Ec_fwd and back switching (- to +) needs E = Ec_fwd - 2 Eint; loop centre at -Eint.
// Everything with "template" in its provenance is a display choice (loop shape, well shape, automaton rates): no LN source.
//
// Poling automaton (template kinetics, sourced geometry): z-cut top view on a triangular lattice in the odd-q column layout,
// site (col, row) at x = col sqrt(3)/2 a, y = (row + (col odd) / 2) a, nearest-neighbour directions at 30 + 60 k deg from x, so
// straight facets run parallel to y and +-60 deg from y, i.e. parallel to the yz mirror planes (volk2008 p. 186; C01 Sec. 8).
// Rates: nucleation at the electrode edges of the +z face (volk2008 p. 199), wall motion by step nucleation (sites touching 1 or 2
// switched neighbours, slow) and kink propagation (3 or more, fast) (volk2008 pp. 186-190, shur2006, as stated in C01 Sec. 9 L3).
// Field dependence of every rate follows the activation form of volk2008 Eq. (7.32), t_s ~ exp(delta / (E -+ Eint)), written as
// rate = nu exp(-alpha (Ec / E_eff - 1)) for E_eff = E - Eint > 0 (so rate = nu at E_eff = Ec); nu, alpha are template.
// Backswitching: sites switched less than tauStab ago revert at rate nuBack while the field is below holdFraction Ec; holding at
// Ec/2 suppresses it (practice reported in volk2008 pp. 179-180). Synchronous update, fixed visiting order, seeded RNG.
import { EPS0, QE } from "./constants.ts";
import type { Provenance } from "./constants.ts";
import { createRng } from "./prng.ts";

// ---------- closed forms ----------
/** Switched charge (C) for area A (m^2): Q = 2 Ps A. */
export const switchedCharge = (Ps_C_per_m2: number, A_m2: number): number => 2 * Ps_C_per_m2 * A_m2;
/** Voltage (V) to reach the coercive field across thickness t: V = Ec t. */
export const coerciveVoltage = (Ec_V_per_m: number, t_m: number): number => Ec_V_per_m * t_m;
/** Bound charge density (C/m^2) on a 180 deg wall inclined by theta (rad) to c: 2 Ps sin(theta). */
export const boundCharge = (Ps_C_per_m2: number, theta_rad: number): number => 2 * Ps_C_per_m2 * Math.sin(theta_rad);
/** Equivalent sheet density of elementary charges (1/m^2). Divide by 1e4 for 1/cm^2. */
export const sheetDensity = (sigma_C_per_m2: number): number => Math.abs(sigma_C_per_m2) / QE;
/** Unscreened depolarizing field of a uniformly polarized plate (V/m): Ps / (eps0 eps33). */
export const depolarizingField = (Ps_C_per_m2: number, eps33: number): number => Ps_C_per_m2 / (EPS0 * eps33);

// ---------- double well (template shape, sourced depth) ----------
/** inbar1996 Sec. III, Fig. 2b (P): coupled Li + O soft-mode double well 18.3 mRy = 2858 K per 10-atom cell (LAPW, LDA).
 *  Note: 18.3 mRy converts to 2889 K (1 Ry = 157887.5 K, CODATA); the 2858 K value is as carried by C01 and needs a
 *  check against the paper before both numbers are printed together. */
export const INBAR1996_WELL = {
  depth_mRy: 18.3,
  depth_K: 2858,
  per: "10-atom cell",
  prov: { source: "inbar1996", status: "reported", locator: "Sec. III, Fig. 2b" } as Provenance,
} as const;
/** Quartic template U(s) = U0 (s^2 - 1)^2 - tilt s; minima at s = +-1 for tilt = 0, barrier U0 at s = 0 (template shape). */
export const quarticWell = (s: number, U0: number, tilt = 0): number => U0 * (s * s - 1) ** 2 - tilt * s;
/** Barrier remaining under a tilt: U(s_max) - U(s_min) on the side the tilt disfavours; 0 once the tilt removes the barrier
 *  (tilt >= 8 U0 / (3 sqrt 3)). Found from the cubic dU/ds = 4 U0 s (s^2 - 1) - tilt = 0. */
export function quarticBarrier(U0: number, tilt: number): number {
  const t = Math.abs(tilt);
  const crit = (8 * U0) / (3 * Math.sqrt(3));
  if (t >= crit) return 0;
  // roots of 4 U0 s^3 - 4 U0 s - t = 0 (trigonometric form; three real roots for t < crit)
  const p = -1;
  const q = -t / (4 * U0);
  const r = 2 * Math.sqrt(-p / 3);
  const phi = Math.acos(((3 * q) / (2 * p)) * Math.sqrt(-3 / p)) / 3;
  const roots = [0, 1, 2].map((k) => r * Math.cos(phi - (2 * Math.PI * k) / 3)).sort((a, b) => a - b);
  // for tilt > 0 the disfavoured minimum is the negative one: roots[0] (min), roots[1] (max)
  const U = (s: number) => quarticWell(s, U0, t);
  return U(roots[1]) - U(roots[0]);
}

// ---------- hysteresis (template shape on sourced anchors) ----------
/** Switching fields from the forward coercive field and the internal field (virgin Ps along +z). */
export function loopFields(EcForward: number, Eint: number): { Edown: number; Eup: number; center: number; halfWidth: number } {
  const Edown = -EcForward;
  const Eup = EcForward - 2 * Eint;
  return { Edown, Eup, center: (Edown + Eup) / 2, halfWidth: (Eup - Edown) / 2 };
}
/** Template tanh loop branch: field increasing ('up', switching - to + at Eup) or decreasing ('down', + to - at Edown).
 *  width sets the steepness (display choice, template). */
export function loopBranch(E: number, Ps: number, Eup: number, Edown: number, width: number, branch: "up" | "down"): number {
  return Ps * Math.tanh((E - (branch === "up" ? Eup : Edown)) / width);
}
export const HYSTERESIS_TEMPLATE: Record<string, Provenance> = {
  shape: { source: "r11", status: "template", note: "tanh branch shape chosen for display; only Ps, Ec, Eint are sourced (C01 FIG-01-08)" },
  width: { source: "r11", status: "template", note: "steepness chosen so the loop corners read at 1:1 aspect; no LN source" },
};

// ---------- poling automaton ----------
export interface PolingParams {
  nx: number; // columns (x, across the fingers); must be even (periodic odd-q layout)
  ny: number; // rows (y, along the fingers)
  spacing_m: number;
  thickness_m: number;
  Ps: number; // C/m^2
  Ec: number; // forward coercive field, V/m
  Eint: number; // internal field, V/m (subtracts from forward drive)
  period_cols: number; // electrode period in columns
  duty: number; // electrode width / period
  fringe: number; // field outside the electrodes as a fraction of the applied field
  nuNuc: number; // 1/s per edge site at E_eff = Ec
  interiorNuc: number; // nucleation factor for non-edge electrode sites (relative)
  alphaNuc: number;
  nuStep1: number; // 1/s, site with exactly 1 switched neighbour
  nuStep2: number; // 1/s, site with exactly 2 switched neighbours (step nucleation on a facet)
  nuKink: number; // 1/s, 3 or more switched neighbours
  alphaWall: number;
  tauStab_s: number;
  nuBack: number;
  holdFraction: number;
  C_F: number; // electrode capacitance for the displacement-current term
}
/** Template defaults (all rates and geometry scale are display choices; Ps, Ec, Eint, hold fraction are sourced anchors). */
export const POLING_TEMPLATE: { params: PolingParams; prov: Record<string, Provenance> } = {
  params: {
    nx: 128, ny: 64, spacing_m: 0.25e-6, thickness_m: 0.5e-3,
    Ps: 0.71, Ec: 21e6, Eint: 2.5e6,
    period_cols: 32, duty: 0.4, fringe: 0.7,
    nuNuc: 2e2, interiorNuc: 0.02, alphaNuc: 10,
    nuStep1: 20, nuStep2: 1e2, nuKink: 2e4, alphaWall: 6,
    tauStab_s: 50e-3, nuBack: 2e2, holdFraction: 0.5,
    C_F: 20e-12,
  },
  prov: {
    Ps: { source: "volk2008", status: "P-comp", locator: "Table 1.1 p. 3", note: "0.71 C/m^2 chosen from the 0.71-0.80 range (C01 open question A1)" },
    Ec: { source: "volk2008", status: "P-comp", locator: "Table 7.1 p. 185 (congruent, 21 kV/mm)" },
    Eint: { source: "gopalan1998", status: "P(abs)", note: "about 2.5 kV/mm, congruent" },
    holdFraction: { source: "volk2008", status: "reported", locator: "pp. 179-180", note: "hold at about Ec/2 after the pulse suppresses backswitching" },
    tauStab_s: { source: "volk2008", status: "template", locator: "pp. 179-180", note: "critical time >= 50 ms at 25 kV/mm reported for bulk; used as the template stabilization age" },
    rates: { source: "r11", status: "template", note: "nuNuc, interiorNuc, alphaNuc, nuStep1, nuStep2, nuKink, alphaWall, nuBack: no LN parameters sourced; chosen so a 0.5 mm wafer at about 22-24 kV/mm switches in ms and domains facet" },
    geometry: { source: "r11", status: "template", note: "spacing, grid, electrode period/duty, fringe factor, C_F are display choices" },
  },
};

export interface PolingState {
  p: PolingParams;
  /** 1 = reversed */
  s: Uint8Array;
  /** time at which each site switched (s), NaN if never */
  tSw: Float64Array;
  t: number;
  electrode: Uint8Array;
  edge: Uint8Array;
  nbr: Int32Array; // 6 neighbours per site
}

export function createPolingState(p: PolingParams): PolingState {
  if (p.nx % 2 !== 0) throw new RangeError("nx must be even (periodic odd-q layout)");
  const N = p.nx * p.ny;
  const electrode = new Uint8Array(N);
  const edge = new Uint8Array(N);
  const wCols = Math.max(1, Math.round(p.duty * p.period_cols));
  const onE = (c: number) => ((c % p.period_cols) + p.period_cols) % p.period_cols < wCols;
  for (let c = 0; c < p.nx; c++)
    for (let r = 0; r < p.ny; r++) {
      const i = c * p.ny + r;
      electrode[i] = onE(c) ? 1 : 0;
      edge[i] = onE(c) && (!onE(c - 1) || !onE(c + 1)) ? 1 : 0;
    }
  const nbr = new Int32Array(6 * N);
  const idx = (c: number, r: number) => (((c % p.nx) + p.nx) % p.nx) * p.ny + (((r % p.ny) + p.ny) % p.ny);
  for (let c = 0; c < p.nx; c++)
    for (let r = 0; r < p.ny; r++) {
      const i = c * p.ny + r;
      const odd = c & 1;
      const list = odd
        ? [idx(c, r - 1), idx(c, r + 1), idx(c - 1, r), idx(c - 1, r + 1), idx(c + 1, r), idx(c + 1, r + 1)]
        : [idx(c, r - 1), idx(c, r + 1), idx(c - 1, r - 1), idx(c - 1, r), idx(c + 1, r - 1), idx(c + 1, r)];
      for (let k = 0; k < 6; k++) nbr[6 * i + k] = list[k];
    }
  return { p, s: new Uint8Array(N), tSw: new Float64Array(N).fill(Number.NaN), t: 0, electrode, edge, nbr };
}

/** Site centre (units of the lattice spacing). */
export function siteXY(p: PolingParams, i: number): [number, number] {
  const c = Math.floor(i / p.ny);
  const r = i - c * p.ny;
  return [(c * Math.sqrt(3)) / 2, r + 0.5 * (c & 1)];
}
export const siteArea = (p: PolingParams): number => (Math.sqrt(3) / 2) * p.spacing_m * p.spacing_m;

const act = (nu: number, alpha: number, Ec: number, Eeff: number): number => (Eeff > 0 ? nu * Math.exp(-alpha * (Ec / Eeff - 1)) : 0);
const prob = (rate: number, dt: number): number => (rate > 0 ? 1 - Math.exp(-rate * dt) : 0);

/** One synchronous step of the automaton under applied field E (V/m, positive = switching direction). Mutates st. */
export function polingStep(st: PolingState, E: number, dt: number, rng: { next(): number }): void {
  const p = st.p;
  const N = st.s.length;
  const prev = st.s.slice();
  const fields = [E * p.fringe, E]; // [outside, under electrode]
  // Ec is the measured forward coercive field, which already contains the internal-field shift; the activation uses
  // E - Eint against Ec - Eint so that the characteristic rate is reached at E = Ec (fixed after the PHY2 audit).
  const EcEff = p.Ec - p.Eint;
  const P: number[][] = fields.map((Ef) => {
    const Eeff = Ef - p.Eint;
    return [
      prob(act(p.nuNuc * p.interiorNuc, p.alphaNuc, EcEff, Eeff), dt),
      prob(act(p.nuNuc, p.alphaNuc, EcEff, Eeff), dt),
      prob(act(p.nuStep1, p.alphaWall, EcEff, Eeff), dt),
      prob(act(p.nuStep2, p.alphaWall, EcEff, Eeff), dt),
      prob(act(p.nuKink, p.alphaWall, EcEff, Eeff), dt),
    ];
  });
  const back = E < p.holdFraction * p.Ec ? prob(p.nuBack, dt) : 0;
  const tNew = st.t + dt;
  for (let i = 0; i < N; i++) {
    if (prev[i]) {
      if (back > 0 && st.t - st.tSw[i] < p.tauStab_s) {
        let n = 0;
        for (let k = 0; k < 6; k++) n += prev[st.nbr[6 * i + k]];
        // reversion starts at domain boundaries (sites with an unswitched neighbour)
        if (n < 6 && rng.next() < back) {
          st.s[i] = 0;
          st.tSw[i] = Number.NaN;
        }
      }
      continue;
    }
    const pe = P[st.electrode[i]];
    let n = 0;
    for (let k = 0; k < 6; k++) n += prev[st.nbr[6 * i + k]];
    let pr: number;
    if (n === 0) pr = st.electrode[i] ? (st.edge[i] ? pe[1] : pe[0]) : 0;
    else pr = n === 1 ? pe[2] : n === 2 ? pe[3] : pe[4];
    if (pr > 0 && rng.next() < pr) {
      st.s[i] = 1;
      st.tSw[i] = tNew;
    }
  }
  st.t = tNew;
}

export interface PolingRun {
  t: Float64Array;
  V: Float64Array;
  area_m2: Float64Array;
  X: Float64Array; // switched fraction of the whole grid
  state: PolingState;
  snapshots: Uint8Array[];
}
/** Run the automaton for nSteps of dt under the voltage waveform V(t) across thickness_m. Snapshot every `snapEvery` steps (0 = none). */
export function runPoling(p: PolingParams, V: (t_s: number) => number, dt: number, nSteps: number, seed: number, snapEvery = 0): PolingRun {
  const st = createPolingState(p);
  const rng = createRng(seed);
  const N = st.s.length;
  const a0 = siteArea(p);
  const t = new Float64Array(nSteps + 1);
  const Vv = new Float64Array(nSteps + 1);
  const A = new Float64Array(nSteps + 1);
  const X = new Float64Array(nSteps + 1);
  const snaps: Uint8Array[] = [];
  Vv[0] = V(0);
  for (let k = 1; k <= nSteps; k++) {
    const tk = k * dt;
    const Vk = V(tk - dt / 2);
    polingStep(st, Vk / p.thickness_m, dt, rng);
    let cnt = 0;
    for (let i = 0; i < N; i++) cnt += st.s[i];
    t[k] = tk;
    Vv[k] = V(tk);
    A[k] = cnt * a0;
    X[k] = cnt / N;
    if (snapEvery > 0 && k % snapEvery === 0) snaps.push(st.s.slice());
  }
  return { t, V: Vv, area_m2: A, X, state: st, snapshots: snaps };
}

/** Central-difference derivative on a sampled series (one-sided at the ends); its trapezoid integral telescopes to f_end - f_0. */
export function gradient(t: ArrayLike<number>, f: ArrayLike<number>): Float64Array {
  const n = f.length;
  const g = new Float64Array(n);
  if (n < 2) return g;
  g[0] = (f[1] - f[0]) / (t[1] - t[0]);
  g[n - 1] = (f[n - 1] - f[n - 2]) / (t[n - 1] - t[n - 2]);
  for (let i = 1; i < n - 1; i++) g[i] = (f[i + 1] - f[i - 1]) / (t[i + 1] - t[i - 1]);
  return g;
}
export function trapz(t: ArrayLike<number>, f: ArrayLike<number>): number {
  let s = 0;
  for (let i = 1; i < f.length; i++) s += 0.5 * (f[i] + f[i - 1]) * (t[i] - t[i - 1]);
  return s;
}
/** Switching current I(t) = 2 Ps dA/dt + C dV/dt (A). */
export function switchingCurrent(t: ArrayLike<number>, A_m2: ArrayLike<number>, Ps: number, C_F: number, V: ArrayLike<number>): Float64Array {
  const dA = gradient(t, A_m2);
  const dV = gradient(t, V);
  const I = new Float64Array(dA.length);
  for (let i = 0; i < I.length; i++) I[i] = 2 * Ps * dA[i] + C_F * dV[i];
  return I;
}
/** Charge from the switching current with the capacitive part removed: int (I - C dV/dt) dt. */
export function switchingChargeFromCurrent(t: ArrayLike<number>, I: ArrayLike<number>, C_F: number, V: ArrayLike<number>): number {
  const dV = gradient(t, V);
  const f = new Float64Array(I.length);
  for (let i = 0; i < f.length; i++) f[i] = I[i] - C_F * dV[i];
  return trapz(t, f);
}
/** Duty cycle of the final pattern: switched fraction over whole electrode periods. */
export function dutyCycle(st: PolingState): number {
  let s = 0;
  for (const v of st.s) s += v;
  return s / st.s.length;
}
/** Support function h(theta) = max over switched sites of (x cos theta + y sin theta) about the centroid (lattice units). */
export function supportFunction(st: PolingState, theta: number): number {
  let cx = 0;
  let cy = 0;
  let n = 0;
  for (let i = 0; i < st.s.length; i++)
    if (st.s[i]) {
      const [x, y] = siteXY(st.p, i);
      cx += x;
      cy += y;
      n++;
    }
  if (n === 0) return 0;
  cx /= n;
  cy /= n;
  let h = -Infinity;
  for (let i = 0; i < st.s.length; i++)
    if (st.s[i]) {
      const [x, y] = siteXY(st.p, i);
      h = Math.max(h, (x - cx) * Math.cos(theta) + (y - cy) * Math.sin(theta));
    }
  return h;
}

// ---------- KAI fit ----------
/** Least-squares fit of X(t) = 1 - exp(-(t/t0)^n) on ln(-ln(1 - X)) = n ln t - n ln t0, using points with Xmin < X < Xmax, t > 0. */
export function kaiFit(t: ArrayLike<number>, X: ArrayLike<number>, Xmin = 0.02, Xmax = 0.98): { n: number; t0: number; r2: number; used: number } {
  let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0, m = 0;
  for (let i = 0; i < X.length; i++) {
    if (!(t[i] > 0) || !(X[i] > Xmin && X[i] < Xmax)) continue;
    const x = Math.log(t[i]);
    const y = Math.log(-Math.log(1 - X[i]));
    sx += x; sy += y; sxx += x * x; sxy += x * y; syy += y * y; m++;
  }
  if (m < 2) return { n: Number.NaN, t0: Number.NaN, r2: Number.NaN, used: m };
  const n = (m * sxy - sx * sy) / (m * sxx - sx * sx);
  const b = (sy - n * sx) / m;
  const t0 = Math.exp(-b / n);
  const r = (m * sxy - sx * sy) / Math.sqrt((m * sxx - sx * sx) * (m * syy - sy * sy));
  return { n, t0, r2: r * r, used: m };
}
export const kaiModel = (t: number, n: number, t0: number): number => (t <= 0 ? 0 : 1 - Math.exp(-((t / t0) ** n)));
