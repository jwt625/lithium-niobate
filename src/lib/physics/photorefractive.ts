// Photorefractive toy: reduced single-center band-transport model (Kukhtarev et al., Ferroelectrics 22, 949 (1978/79)).
// With the conduction-band density adiabatically eliminated (free-carrier lifetime << dielectric relaxation time) and
// diffusion neglected (photovoltaic-dominated LN, Glass et al. 1974), charge conservation along c reduces to
//   eps0 eps_r dE/dt = J(t) - (sigma_d + sigma_ph(x)) E - j_pv(x),      sigma_ph = k_ph I,   j_pv = k_pv I
// with J(t) uniform in x (1D continuity). Open circuit, uniform illumination: J = 0, so E relaxes to
//   E_ss = -j_pv / (sigma_d + sigma_ph) with tau = eps0 eps_r / (sigma_d + sigma_ph); in the dark it decays with
//   tau_d = eps0 eps_r / sigma_d (dielectric relaxation). Index change Delta n_e = -(1/2) n_e^3 r33 E.
// MgO above threshold raises photoconductivity about 100x while the Glass current is unchanged (Bryan et al. 1984, abstract),
// which collapses E_ss; modelled as k_ph -> k_ph [1 + (F - 1) S(c_Mg)] with a smooth step S (shape and width: template).
// All rate coefficients below are templates unless marked; conductivities span orders of magnitude between samples.
import { EPS0, DARK_CONDUCTIVITY_CLN, MGO_PHOTOCONDUCTIVITY_FACTOR, MGO_THRESHOLD, PHOTOVOLTAIC_FIELD_ORDER, EPS_T_KUSHIBIKI1999 } from "./constants.ts";
import type { Provenance } from "./constants.ts";

export interface PRParams {
  eps_r: number;
  sigmaDark_S_per_m: number;
  /** photoconductivity per intensity, S/m per W/m^2 */
  kPh: number;
  /** photovoltaic current density per intensity, A/m^2 per W/m^2 */
  kPv: number;
  /** MgO content (at.%), threshold (at.%), step width (at.%), photoconductivity factor above threshold */
  cMg?: number;
  cMgThreshold?: number;
  cMgWidth?: number;
  mgoFactor?: number;
}

/** Template parameter set: eps33^T (kushibiki1999, P); sigma_d at the volk2008 range mid (template point in a P-comp range);
 *  kPh and kPv chosen so the photovoltaic field kPv/kPh = 1e7 V/m (glass1974 order) and tau = 1 s at 1e4 W/m^2 (template). */
export const PR_TEMPLATE: { params: PRParams; prov: Record<string, Provenance> } = (() => {
  const eps_r = EPS_T_KUSHIBIKI1999.eps33;
  const tau1 = 1; // s at I = 1e4 W/m^2 (template)
  const kPh = (EPS0 * eps_r) / tau1 / 1e4;
  const kPv = kPh * PHOTOVOLTAIC_FIELD_ORDER.value;
  return {
    params: {
      eps_r,
      sigmaDark_S_per_m: Math.sqrt(DARK_CONDUCTIVITY_CLN.min * DARK_CONDUCTIVITY_CLN.max),
      kPh,
      kPv,
      cMg: 0,
      cMgThreshold: MGO_THRESHOLD.value,
      cMgWidth: 0.2,
      mgoFactor: MGO_PHOTOCONDUCTIVITY_FACTOR.value,
    },
    prov: {
      eps_r: EPS_T_KUSHIBIKI1999.prov,
      sigmaDark: { source: "volk2008", status: "template", note: "geometric mid of the P-comp range 1e-16 to 1e-14 S/m" },
      kPh: { source: "r11", status: "template", note: "tau = 1 s at 1e4 W/m^2" },
      kPv: { source: "glass1974", status: "template", note: "kPv/kPh = 1e7 V/m, glass1974 order of magnitude (reported)" },
      cMgThreshold: MGO_THRESHOLD.prov,
      cMgWidth: { source: "r11", status: "template" },
      mgoFactor: MGO_PHOTOCONDUCTIVITY_FACTOR.prov,
    },
  };
})();

/** Photoconductivity multiplier for MgO content (smooth logistic step at the threshold; shape is a template). */
export function mgoMultiplier(p: PRParams): number {
  const c = p.cMg ?? 0;
  if (c <= 0) return 1;
  const th = p.cMgThreshold ?? MGO_THRESHOLD.value;
  const w = p.cMgWidth ?? 0.2;
  const F = p.mgoFactor ?? MGO_PHOTOCONDUCTIVITY_FACTOR.value;
  const S = 1 / (1 + Math.exp(-(c - th) / w));
  return 1 + (F - 1) * S;
}

export const photoconductivity = (p: PRParams, I_W_per_m2: number): number => p.kPh * I_W_per_m2 * mgoMultiplier(p);
/** Relaxation time (s) at intensity I. */
export const relaxationTime = (p: PRParams, I_W_per_m2: number): number => (EPS0 * p.eps_r) / (p.sigmaDark_S_per_m + photoconductivity(p, I_W_per_m2));
/** Dark (Maxwell) relaxation time (s). */
export const darkRelaxationTime = (p: PRParams): number => (EPS0 * p.eps_r) / p.sigmaDark_S_per_m;
/** Open-circuit uniform-illumination saturation field (V/m), negative along +c for positive kPv. */
export const saturationField = (p: PRParams, I_W_per_m2: number): number => -(p.kPv * I_W_per_m2) / (p.sigmaDark_S_per_m + photoconductivity(p, I_W_per_m2));

/** Open-circuit field after time t at constant intensity I, starting from E0 (exact exponential). */
export function fieldAt(p: PRParams, I_W_per_m2: number, E0_V_per_m: number, t_s: number): number {
  const Es = saturationField(p, I_W_per_m2);
  return Es + (E0_V_per_m - Es) * Math.exp(-t_s / relaxationTime(p, I_W_per_m2));
}

/** Piecewise-constant illumination sequence (open circuit): returns the field at the end of each segment and samples. */
export function fieldSequence(p: PRParams, segments: { I_W_per_m2: number; duration_s: number }[], samplesPerSegment = 50): { t: Float64Array; E: Float64Array } {
  const n = segments.length * samplesPerSegment + 1;
  const t = new Float64Array(n);
  const E = new Float64Array(n);
  let E0 = 0;
  let t0 = 0;
  let k = 1;
  for (const s of segments) {
    for (let j = 1; j <= samplesPerSegment; j++) {
      const dt = (s.duration_s * j) / samplesPerSegment;
      t[k] = t0 + dt;
      E[k] = fieldAt(p, s.I_W_per_m2, E0, dt);
      k++;
    }
    E0 = fieldAt(p, s.I_W_per_m2, E0, s.duration_s);
    t0 += s.duration_s;
  }
  return { t, E };
}

/** Delta n_e (dimensionless) = -(1/2) n_e^3 r33 E. */
export const deltaNe = (ne: number, r33_pm_per_V: number, E_V_per_m: number): number => -0.5 * ne ** 3 * r33_pm_per_V * 1e-12 * E_V_per_m;

/** 1D field along c for an intensity profile I(x) on a periodic window (equivalently short-circuited: mean E = 0).
 *  Exponential integrator per point with the uniform current J = mean(sigma E + j_pv) (enforces d/dt mean(E) = 0).
 *  Returns E(x) after time t_s starting from E0 (default zero). */
export function field1D(p: PRParams, I: Float64Array, t_s: number, steps = 200, E0?: Float64Array): Float64Array {
  const n = I.length;
  const E = E0 ? Float64Array.from(E0) : new Float64Array(n);
  const sig = new Float64Array(n);
  const jpv = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    sig[i] = p.sigmaDark_S_per_m + photoconductivity(p, I[i]);
    jpv[i] = p.kPv * I[i];
  }
  const e = EPS0 * p.eps_r;
  // log-spaced steps resolve both fast (illuminated) and slow (dark) relaxation
  let tPrev = 0;
  for (let s = 1; s <= steps; s++) {
    const tNow = t_s * (s / steps) ** 3;
    const dt = tNow - tPrev;
    tPrev = tNow;
    // J such that sum over x of dE/dt = 0 for the exact per-point update: solve mean(E_new) = 0
    // E_new = Es + (E - Es) a, Es = (J - jpv)/sig, a = exp(-sig dt / e)  -> linear in J
    let A = 0;
    let Bc = 0;
    for (let i = 0; i < n; i++) {
      const a = Math.exp((-sig[i] * dt) / e);
      A += (1 - a) / sig[i];
      Bc += E[i] * a - ((1 - a) * jpv[i]) / sig[i];
    }
    const J = -Bc / A;
    for (let i = 0; i < n; i++) {
      const a = Math.exp((-sig[i] * dt) / e);
      const Es = (J - jpv[i]) / sig[i];
      E[i] = Es + (E[i] - Es) * a;
    }
  }
  return E;
}

/** Steady state of field1D in closed form: E(x) = (J - j_pv(x))/sigma(x), J = (sum j_pv/sigma) / (sum 1/sigma). */
export function field1DSteady(p: PRParams, I: Float64Array): Float64Array {
  const n = I.length;
  let a = 0;
  let b = 0;
  const sig = new Float64Array(n);
  const jpv = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    sig[i] = p.sigmaDark_S_per_m + photoconductivity(p, I[i]);
    jpv[i] = p.kPv * I[i];
    a += jpv[i] / sig[i];
    b += 1 / sig[i];
  }
  const J = a / b;
  return Float64Array.from({ length: n }, (_, i) => (J - jpv[i]) / sig[i]);
}
