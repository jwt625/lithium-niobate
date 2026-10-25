// Resonator helpers for chapter 2 figures F2-13 (resonant EO comb), F2-14 (coupled-ring frequency shifter), F2-16 (Q and loss).
// Equations as printed in content/chapters/02-light/manuscript.md: eq. 2.18 E(t) = t_c E_in / (1 - r exp(i beta cos(Omega t)));
// asymptotic line slope 8.686 asinh(|ln r| / beta) dB/line and high-finesse form 27.29 / (beta F), F = pi sqrt(r)/(1 - r)
// (2.6 L2, derived in the manuscript); eq. 2.19 shifter transfer; eq. 2.20 alpha = 2 pi n_g / (Q_i lambda), alpha_dB = 4.343 alpha.
// The through-port EO comb with separate loss and coupling is ring.ts eoCombThrough / eoCombDrop / eoCombCMT.
import { fft } from "./fft.ts";

const DB = 10 / Math.LN10; // 4.343
const DB20 = 20 / Math.LN10; // 8.686

// ---------- resonant EO comb ----------
/** Finesse F = pi sqrt(r) / (1 - r) for round-trip amplitude transmission r (manuscript 2.6 L2). */
export const finesseFromR = (r: number): number => (Math.PI * Math.sqrt(r)) / (1 - r);
/** Asymptotic comb-line power slope (dB per line) of eq. 2.18 far from the pump: 20 log10(e) asinh(|ln r| / beta). */
export const eoCombSlopeDB = (r: number, beta: number): number => DB20 * Math.asinh(Math.abs(Math.log(r)) / beta);
/** High-finesse form: 20 log10(e) pi / (beta F) = 27.29 / (beta F) dB per line. */
export const eoCombSlopeDBHighFinesse = (beta: number, F: number): number => (DB20 * Math.PI) / (beta * F);

/** Line powers |c_k|^2 (k = -K..K) of eq. 2.18 with t_c E_in = tc (default 1), sampled on N fast-time points over one
 *  modulation period and Fourier transformed (fft.ts). meanPower = time average of |E(t)|^2 on the same grid (Parseval:
 *  equals the sum over all N lines). */
export function eoCombIntracavity(p: { r: number; beta: number; N?: number; K?: number; tc?: number }): { k: Int32Array; P: Float64Array; meanPower: number; totalLinePower: number } {
  const N = p.N ?? 4096;
  const K = Math.min(p.K ?? 64, N / 2 - 1);
  const tc = p.tc ?? 1;
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  let mean = 0;
  for (let n = 0; n < N; n++) {
    const ph = p.beta * Math.cos((2 * Math.PI * n) / N);
    const dr = 1 - p.r * Math.cos(ph);
    const di = -p.r * Math.sin(ph);
    const den = dr * dr + di * di;
    re[n] = (tc * dr) / den;
    im[n] = (-tc * di) / den;
    mean += re[n] ** 2 + im[n] ** 2;
  }
  mean /= N;
  fft(re, im);
  let total = 0;
  for (let n = 0; n < N; n++) total += (re[n] ** 2 + im[n] ** 2) / (N * N);
  const k = new Int32Array(2 * K + 1);
  const P = new Float64Array(2 * K + 1);
  for (let j = -K; j <= K; j++) {
    const idx = (j + N) % N;
    k[j + K] = j;
    P[j + K] = (re[idx] ** 2 + im[idx] ** 2) / (N * N);
  }
  return { k, P, meanPower: mean, totalLinePower: total };
}

/** Least-squares slope (dB per line, positive for decay) of 10 log10 P_k over line indices k in [kFrom, kTo] (k > 0 side). */
export function fitLineSlopeDB(k: Int32Array, P: Float64Array, kFrom: number, kTo: number): number {
  let n = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (let i = 0; i < k.length; i++) {
    if (k[i] < kFrom || k[i] > kTo) continue;
    const x = k[i];
    const y = 10 * Math.log10(P[i]);
    n++;
    sx += x;
    sy += y;
    sxx += x * x;
    sxy += x * y;
  }
  return -(n * sxy - sx * sy) / (n * sxx - sx * sx);
}

/** Asymptotic-envelope line-count estimate 2 floor(thresholdDb / slope) + 1 (ignores the near-pump excess). */
export const eoCombLineCountAsymptotic = (r: number, beta: number, thresholdDb: number): number => 2 * Math.floor(thresholdDb / eoCombSlopeDB(r, beta)) + 1;

/** Number of lines within thresholdDb of the strongest line. */
export function countLines(P: Float64Array, thresholdDb: number): number {
  let max = 0;
  for (const v of P) max = Math.max(max, v);
  const lim = max * 10 ** (-thresholdDb / 10);
  let c = 0;
  for (const v of P) if (v >= lim) c++;
  return c;
}

// ---------- coupled-ring frequency shifter (eq. 2.19) ----------
export interface ShifterParams {
  /** energy decay rates (rad/s or any consistent unit) of supermodes a and b, and their external parts */
  kappa_a: number;
  kappa_b: number;
  kappa_a_ex: number;
  kappa_b_ex: number;
  /** microwave-induced coupling rate between the supermodes */
  G: number;
  /** detunings of the input light from supermode a, and of the shifted light from supermode b (default 0) */
  delta_a?: number;
  delta_b?: number;
}
/** Steady state of da/dt = (-i delta_a - kappa_a/2) a - i G b + sqrt(kappa_a,ex) s, db/dt = (-i delta_b - kappa_b/2) b - i G a;
 *  output into the shifted bin |sqrt(kappa_b,ex) b / s|^2 and through power |1 - sqrt(kappa_a,ex) a / s|^2. At zero detuning
 *  toShifted = kappa_a,ex kappa_b,ex G^2 / (kappa_a kappa_b / 4 + G^2)^2 (eq. 2.19). */
export function shifterTransfer(p: ShifterParams): { toShifted: number; through: number } {
  // complex: la = kappa_a/2 + i delta_a, lb = kappa_b/2 + i delta_b
  const lar = p.kappa_a / 2, lai = p.delta_a ?? 0;
  const lbr = p.kappa_b / 2, lbi = p.delta_b ?? 0;
  // a = sqrt(kae) s / (la + G^2 / lb), b = -i G a / lb
  const lbm = lbr * lbr + lbi * lbi;
  const G2 = p.G * p.G;
  const dr = lar + (G2 * lbr) / lbm;
  const di = lai - (G2 * lbi) / lbm;
  const dm = dr * dr + di * di;
  const sa = Math.sqrt(p.kappa_a_ex);
  const ar = (sa * dr) / dm;
  const ai = (-sa * di) / dm;
  // b = -i G a / lb
  const nr = p.G * ai;
  const ni = -p.G * ar;
  const br = (nr * lbr + ni * lbi) / lbm;
  const bi = (ni * lbr - nr * lbi) / lbm;
  const toShifted = p.kappa_b_ex * (br * br + bi * bi);
  const tr = 1 - sa * ar;
  const ti = -sa * ai;
  return { toShifted, through: tr * tr + ti * ti };
}

/** Time-domain RK4 of the same two-mode equations with input envelope s(t) (complex, returned as [re, im]); returns sampled
 *  shifted-bin and through powers normalized to |s|^2 = 1 units of the input function. */
export function shifterTimeDomain(p: ShifterParams & { s: (t: number) => [number, number]; t_end: number; steps: number; every?: number }): {
  t: Float64Array;
  Pshift: Float64Array;
  Pthrough: Float64Array;
} {
  const every = p.every ?? 1;
  const M = Math.floor(p.steps / every) + 1;
  const t = new Float64Array(M);
  const Ps = new Float64Array(M);
  const Pt = new Float64Array(M);
  const da = p.delta_a ?? 0, db = p.delta_b ?? 0;
  const sa = Math.sqrt(p.kappa_a_ex);
  const f = (tt: number, y: number[]): number[] => {
    const [ar, ai, br, bi] = y;
    const [sr, si] = p.s(tt);
    return [
      -(p.kappa_a / 2) * ar + da * ai + p.G * bi + sa * sr,
      -(p.kappa_a / 2) * ai - da * ar - p.G * br + sa * si,
      -(p.kappa_b / 2) * br + db * bi + p.G * ai,
      -(p.kappa_b / 2) * bi - db * br - p.G * ar,
    ];
  };
  const rec = (j: number, tt: number, y: number[]) => {
    const [sr, si] = p.s(tt);
    t[j] = tt;
    Ps[j] = p.kappa_b_ex * (y[2] ** 2 + y[3] ** 2);
    Pt[j] = (sr - sa * y[0]) ** 2 + (si - sa * y[1]) ** 2;
  };
  let y = [0, 0, 0, 0];
  const h = p.t_end / p.steps;
  rec(0, 0, y);
  for (let n = 0; n < p.steps; n++) {
    const tt = n * h;
    const k1 = f(tt, y);
    const k2 = f(tt + h / 2, y.map((v, j) => v + (h / 2) * k1[j]));
    const k3 = f(tt + h / 2, y.map((v, j) => v + (h / 2) * k2[j]));
    const k4 = f(tt + h, y.map((v, j) => v + h * k3[j]));
    y = y.map((v, j) => v + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
    if ((n + 1) % every === 0) rec((n + 1) / every, tt + h, y);
  }
  return { t, Pshift: Ps, Pthrough: Pt };
}

// ---------- Q and loss (eq. 2.20) ----------
/** Intrinsic Q to propagation loss: alpha = 2 pi n_g / (Q_i lambda) (power, 1/m), alpha_dB = 4.343 alpha (dB/m). */
export function qToLoss(p: { Q: number; ng: number; lam_um: number }): { alpha_per_m: number; dB_per_m: number } {
  const a = (2 * Math.PI * p.ng) / (p.Q * p.lam_um * 1e-6);
  return { alpha_per_m: a, dB_per_m: DB * a };
}
/** Propagation loss (dB/m) to intrinsic Q (inverse of qToLoss). */
export function lossToQ(p: { dB_per_m: number; ng: number; lam_um: number }): number {
  return (2 * Math.PI * p.ng) / ((p.dB_per_m / DB) * p.lam_um * 1e-6);
}
/** Power attenuation coefficient in 1/cm to dB/m. */
export const perCmToDbPerM = (alpha_per_cm: number): number => DB * alpha_per_cm * 100;
