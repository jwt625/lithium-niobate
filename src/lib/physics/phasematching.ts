// Phase matching for three-wave mixing: birefringent (type I / II) and quasi-phase matching (QPM).
// Convention: waves 1 and 2 (lambda1, lambda2) mix to wave 3, 1/lambda3 = 1/lambda1 + 1/lambda2 (SFG; SHG has 1 = 2;
// DFG and OPO use the same relation with 3 as the pump).
//   Delta k = 2 pi (n3/lambda3 - n1/lambda1 - n2/lambda2) - 2 pi m / Lambda     (rad/um; Fejer et al. 1992)
//   First-order (m = 1) and odd-order QPM; d_eff = (2/(m pi)) sin(m pi D) d33 for duty cycle D.
//   Acceptance: sinc^2(Delta k L / 2) is 1/2 at Delta k L / 2 = +-1.39156, so the full width at half maximum is
//   FWHM_x = 2 * 2.78311 / (L |d Delta k / dx|) = 0.8859 * 2 pi / (L |d Delta k / dx|).
// Lambda in um, T in C, lengths L in um unless the name says otherwise.
import { bisect } from "./linalg.ts";
import type { IndexFn } from "./sellmeier.ts";
import { extraordinaryIndex } from "./crystaloptics.ts";

export const sumWavelength = (l1_um: number, l2_um: number): number => 1 / (1 / l1_um + 1 / l2_um);
/** Idler wavelength for pump l3 and signal l1 (DFG / OPO energy conservation). */
export const differenceWavelength = (l3_um: number, l1_um: number): number => 1 / (1 / l3_um - 1 / l1_um);

/** sinc(x) = sin(x)/x. */
export const sinc = (x: number): number => (Math.abs(x) < 1e-8 ? 1 - (x * x) / 6 : Math.sin(x) / x);
export const sinc2 = (x: number): number => sinc(x) ** 2;

/** Half-maximum argument of sinc^2: sinc^2(x) = 1/2 at x = 1.3915573782515103 (Newton, computed at load). */
export const SINC2_HALF_X: number = (() => {
  let x = 1.4;
  for (let i = 0; i < 50; i++) {
    const f = Math.sin(x) / x - Math.SQRT1_2;
    const fp = Math.cos(x) / x - Math.sin(x) / (x * x);
    x -= f / fp;
  }
  return x;
})();

export interface WaveIndices {
  n1: IndexFn;
  n2: IndexFn;
  n3: IndexFn;
}

/** Material phase mismatch k3 - k1 - k2 (rad/um), no grating. */
export function deltaKMaterial(l1_um: number, l2_um: number, w: WaveIndices, T_C?: number): number {
  const l3 = sumWavelength(l1_um, l2_um);
  return 2 * Math.PI * (w.n3(l3, T_C) / l3 - w.n1(l1_um, T_C) / l1_um - w.n2(l2_um, T_C) / l2_um);
}

/** Thermal scaling of a poling period: Lambda(T) = Lambda0 (1 + alpha (T - T0)). alpha = 0 unless supplied
 *  (expansion data should come from the same primary as the Sellmeier set; R11 S3). */
export const periodAtT = (period0_um: number, T_C: number, alpha_per_K = 0, T0_C = 25): number => period0_um * (1 + alpha_per_K * (T_C - T0_C));

/** QPM phase mismatch (rad/um) including the grating vector of order m. */
export function deltaKQPM(l1_um: number, l2_um: number, w: WaveIndices, period_um: number, m = 1, T_C?: number): number {
  return deltaKMaterial(l1_um, l2_um, w, T_C) - (2 * Math.PI * m) / period_um;
}

/** Poling period (um) that phase matches order m: Lambda = m / (n3/l3 - n1/l1 - n2/l2). */
export function qpmPeriod(l1_um: number, l2_um: number, w: WaveIndices, m = 1, T_C?: number): number {
  if (!Number.isInteger(m) || m < 1) throw new RangeError("qpmPeriod: order m must be a positive integer");
  return (2 * Math.PI * m) / deltaKMaterial(l1_um, l2_um, w, T_C);
}

/** First-order (or order m) SHG period for lambda -> lambda/2 with one index function (type 0, e.g. e-e-e). */
export function qpmPeriodSHG(lam_um: number, n: IndexFn, m = 1, T_C?: number): number {
  return qpmPeriod(lam_um, lam_um, { n1: n, n2: n, n3: n }, m, T_C);
}

/** d_eff / d for QPM order m and duty cycle D (Fejer 1992): (2/(m pi)) sin(m pi D). Even orders vanish at D = 0.5. */
export const qpmDeffFactor = (m: number, duty = 0.5): number => (2 / (m * Math.PI)) * Math.sin(m * Math.PI * duty);

/** Phase-matching temperature for a fixed period (bisection on Delta k(T) in [T_lo, T_hi]); NaN if not bracketed. */
export function qpmTemperature(
  l1_um: number,
  l2_um: number,
  w: WaveIndices,
  period0_um: number,
  T_lo: number,
  T_hi: number,
  opts: { m?: number; alpha_per_K?: number; T0_C?: number } = {},
): number {
  const m = opts.m ?? 1;
  const f = (T: number) => deltaKQPM(l1_um, l2_um, w, periodAtT(period0_um, T, opts.alpha_per_K ?? 0, opts.T0_C ?? 25), m, T);
  return bisect(f, T_lo, T_hi, 1e-9);
}

/** OPO / DFG signal wavelength for pump lp and a period: solves Delta k = 0 for the signal on (l_lo, 2 lp] by scanning and
 *  bisection; returns { signal, idler } (signal <= idler) or NaN fields when no root exists in the window. */
export function opoSignalIdler(
  lp_um: number,
  period_um: number,
  w: { ns: IndexFn; ni: IndexFn; np: IndexFn },
  ls_lo_um: number,
  T_C?: number,
  m = 1,
): { signal: number; idler: number } {
  const f = (ls: number) => {
    const li = differenceWavelength(lp_um, ls);
    return 2 * Math.PI * (w.np(lp_um, T_C) / lp_um - w.ns(ls, T_C) / ls - w.ni(li, T_C) / li) - (2 * Math.PI * m) / period_um;
  };
  const hi = 2 * lp_um;
  const N = 400;
  let prevX = hi;
  let prevF = f(hi);
  for (let k = 1; k <= N; k++) {
    const x = hi - ((hi - ls_lo_um) * k) / N;
    let fx: number;
    try {
      fx = f(x);
    } catch {
      break; // idler left the model window
    }
    if (prevF === 0) return { signal: prevX, idler: differenceWavelength(lp_um, prevX) };
    if (prevF * fx < 0) {
      const s = bisect(f, x, prevX, 1e-12);
      return { signal: s, idler: differenceWavelength(lp_um, s) };
    }
    prevX = x;
    prevF = fx;
  }
  return { signal: Number.NaN, idler: Number.NaN };
}

// ---------- birefringent phase matching (uniaxial) ----------
export type BirefringentType = "ooe" | "oee" | "eoe" | "eeo" | "oeo" | "eoo";
/** Phase-matching angle theta (rad, from the optic axis) for waves 1 + 2 -> 3 with polarizations given by type
 *  (letters for waves 1, 2, 3; e-waves use n_e(theta)). Negative uniaxial LN uses "ooe" (type I) and "oee"/"eoe" (type II).
 *  Returns NaN when Delta k(theta) does not change sign on [0, pi/2]. */
export function birefringentAngle(
  type: BirefringentType,
  l1_um: number,
  l2_um: number,
  no: IndexFn,
  ne: IndexFn,
  T_C?: number,
): number {
  const l3 = sumWavelength(l1_um, l2_um);
  const ls = [l1_um, l2_um, l3];
  const nO = ls.map((l) => no(l, T_C));
  const nE = ls.map((l) => ne(l, T_C));
  const nOf = (i: number, th: number) => (type[i] === "o" ? nO[i] : extraordinaryIndex(th, nO[i], nE[i]));
  const f = (th: number) => 2 * Math.PI * (nOf(2, th) / l3 - nOf(0, th) / l1_um - nOf(1, th) / l2_um);
  return bisect(f, 0, Math.PI / 2, 1e-13);
}

// ---------- acceptance bandwidths ----------
/** FWHM of sinc^2(Delta k L/2) in a parameter x, from the local slope d(Delta k)/dx (rad/um per unit x) and L (um). */
export const acceptanceFWHM = (dDkDx: number, L_um: number): number => (2 * 2 * SINC2_HALF_X) / (L_um * Math.abs(dDkDx));

/** Central-difference derivative helper. */
export const derivative = (f: (x: number) => number, x: number, h: number): number => (f(x + h) - f(x - h)) / (2 * h);

/** SHG fundamental-wavelength acceptance FWHM (um) for crystal length L (mm), type-0 index n. */
export function shgWavelengthAcceptance(lam_um: number, n: IndexFn, L_mm: number, T_C?: number): number {
  const dk = (l: number) => 2 * Math.PI * (n(l / 2, T_C) / (l / 2) - (2 * n(l, T_C)) / l);
  return acceptanceFWHM(derivative(dk, lam_um, 1e-5), L_mm * 1e3);
}

/** QPM temperature acceptance FWHM (C) for SHG with a temperature-dependent index n, period expansion alpha optional. */
export function shgTemperatureAcceptance(lam_um: number, n: IndexFn, period_um: number, L_mm: number, T_C: number, alpha_per_K = 0): number {
  const dk = (T: number) => qpmDk(lam_um, n, periodAtT(period_um, T, alpha_per_K), T);
  return acceptanceFWHM(derivative(dk, T_C, 1e-3), L_mm * 1e3);
}
const qpmDk = (lam: number, n: IndexFn, period: number, T?: number) => deltaKQPM(lam, lam, { n1: n, n2: n, n3: n }, period, 1, T);

/** Normalized SHG tuning curve sinc^2(Delta k L / 2) over fundamental wavelengths, fixed period (type 0). */
export function shgTuningCurve(lams_um: ArrayLike<number>, n: IndexFn, period_um: number, L_mm: number, T_C?: number): Float64Array {
  const out = new Float64Array(lams_um.length);
  const L = L_mm * 1e3;
  for (let i = 0; i < lams_um.length; i++) out[i] = sinc2((qpmDk(lams_um[i], n, period_um, T_C) * L) / 2);
  return out;
}
