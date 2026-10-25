// Thermal effects for chapter 04 (fig-04-04 ring sweep, fig-04-05 QPM detuning, fig-04-09 thermal calculator).
// - dn_e/dT from the Jundt 1997 temperature-dependent Sellmeier (status S coefficients, sellmeier.ts).
// - dn/dT at 632 nm, Moretti 2005 linear fits as quoted in schwesyg2011 Eqs. 2.26-2.27 (S), T in K, 300-515 K:
//     dn_o/dT = (-1.7 + 6.9e-3 T) 1e-5 /K,  dn_e/dT = (-2.6 + 22.4e-3 T) 1e-5 /K.
// - Thermal lens f = pi w^2 K_th / (alpha P L dn/dT), valid for f >> L (schwesyg2011 Eq. 2.28, S).
// - Ring resonance shift d lambda / dT = lambda Gamma (dn/dT) / n_g (manuscript sec. 4.8).
// - Ring sweep (manuscript sec. 4.3 ring model; carmon2004 thermal self-stability; lin2021 opposite-sign photorefraction):
//   adiabatic optical field (cavity lifetime << thermal and sweep times): U = kappa_ex P / (kappa^2/4 + Delta^2),
//   Delta = omega_L - omega_0 [1 - (Gamma/n_g)(dn/dT dT + dn_pr)];
//   thermal: d dT/dt = (R_th P_abs - dT)/tau_th, P_abs = absFrac kappa_i U;
//   photorefractive: dE/dt = (E_target - E)/tau_pr, E_target = prGain I / (sigma_d + kappa_ph I), tau_pr = eps eps0 / (sigma_d + kappa_ph I),
//   I = U v_g / (L A_eff); dn_pr = prSign (1/2) n^3 r33 E (prSign -1: opposite to thermal, lin2021).
//   Thermal step: backward Euler solved by Newton from the previous state (follows the branch: hysteresis), PR step exact
//   exponential for frozen intensity.
import { C0, EPS0, JUNDT_CLN_E, EO_TURNER1966_S } from "./constants.ts";
import type { Provenance } from "./constants.ts";
import { dnDT, indexFn } from "./sellmeier.ts";
import { deltaKQPM, periodAtT } from "./phasematching.ts";

/** dn_e/dT (1/K) for congruent LN from the Jundt 1997 Sellmeier (S; 0.4-5 um, 20-250 C). */
export const dnedT = (lam_um: number, T_C: number): number => dnDT(JUNDT_CLN_E, lam_um, T_C);

export const MORETTI_RANGE_K: readonly [number, number] = [300, 515];
export const MORETTI_PROV: Provenance = { source: "schwesyg2011", status: "S", locator: "Eqs. 2.26-2.27 (quoting moretti2005); 632 nm; 300-515 K" };
/** dn/dT (1/K) at 632 nm, Moretti 2005 fit via schwesyg2011 (S). T in K; RangeError outside 300-515 K. */
export function morettiDnDT(axis: "o" | "e", T_K: number): number {
  if (T_K < MORETTI_RANGE_K[0] || T_K > MORETTI_RANGE_K[1]) throw new RangeError(`morettiDnDT: T ${T_K} K outside 300-515 K`);
  return axis === "o" ? (-1.7 + 6.9e-3 * T_K) * 1e-5 : (-2.6 + 22.4e-3 * T_K) * 1e-5;
}

/** Thermal lens focal length (m) = pi w^2 K_th / (alpha P L dn/dT) (schwesyg2011 Eq. 2.28, valid for f >> L). */
export const thermalLensFocal = (w_m: number, kTh_W_mK: number, alpha_per_m: number, P_W: number, L_m: number, dndT: number): number =>
  (Math.PI * w_m * w_m * kTh_W_mK) / (alpha_per_m * P_W * L_m * dndT);
/** Ring resonance shift per kelvin (m/K) = lambda Gamma dn/dT / n_g. */
export const thermalShiftPerK = (lambda_m: number, Gamma: number, dndT: number, ng: number): number => (lambda_m * Gamma * dndT) / ng;

/** QPM SHG phase mismatch (rad/m) for congruent LN e-e-e (Jundt 1997, S): Delta k = k(2w) - 2 k(w) - 2 pi m / Lambda(T).
 *  alpha_per_K optionally expands the period (no expansion data are paired with Jundt; default 0). */
export function qpmDetuning(lam_um: number, period_um: number, T_C: number, m = 1, alpha_per_K = 0): number {
  const n = indexFn(JUNDT_CLN_E);
  return deltaKQPM(lam_um, lam_um, { n1: n, n2: n, n3: n }, periodAtT(period_um, T_C, alpha_per_K), m, T_C) * 1e6;
}
/** d(Delta k)/dT (rad/m/K) by central difference (h = 0.01 K). */
export const qpmDetuningDT = (lam_um: number, period_um: number, T_C: number): number =>
  (qpmDetuning(lam_um, period_um, T_C + 0.01) - qpmDetuning(lam_um, period_um, T_C - 0.01)) / 0.02;

// ---------------------------------------------------------------------------------------------
// fig-04-04 ring sweep
// ---------------------------------------------------------------------------------------------
export interface RingSweepParams {
  lambda0_m: number;
  ng: number;
  L_m: number;
  /** single-pass field transmission and self-coupling (ring.ts convention) */
  a: number;
  r: number;
  Gamma: number;
  dndT: number;
  /** fraction of intrinsic loss that is absorption (heats the ring) */
  absFrac: number;
  tauTh_s: number;
  /** thermal resistance K/W */
  Rth_K_per_W: number;
  /** photorefraction: sign (-1 opposite to thermal), on/off via prGain = 0 */
  prSign: number;
  /** photovoltaic current per intensity k_G alpha (A/W) */
  prGain_A_per_W: number;
  /** photoconductivity per intensity (S m / W) */
  kappa_S_m_per_W: number;
  sigmaDark_S_m: number;
  epsR: number;
  /** effective mode area (m^2), index and r33 for dn_pr */
  Aeff_m2: number;
  n: number;
  r33_m_per_V: number;
  /** input power (W) */
  P_W: number;
  lambdaStart_m: number;
  lambdaStop_m: number;
  /** |d lambda / dt| (m/s) */
  sweepRate_m_s: number;
  /** time step (s); default min(tau_th/4, linewidth/(20 rate)), capped by maxSteps */
  dt_s?: number;
  maxSteps?: number;
  /** output decimation: at most nOut samples (default 4000) */
  nOut?: number;
}
export interface RingSweepResult {
  t: Float64Array;
  lambda: Float64Array;
  T: Float64Array;
  dTcav: Float64Array;
  Esc: Float64Array;
  /** loaded Q and linewidth (m) of the cold cavity */
  QL: number;
  linewidth_m: number;
  steps: number;
}
/** Energy decay rates (1/s) from ring.ts parameters: kappa_i = -2 ln(a) FSR, kappa_ex = -2 ln(r) FSR, FSR = v_g / L. */
export function ringRates(p: { ng: number; L_m: number; a: number; r: number }): { ki: number; kex: number; k: number; fsr_Hz: number } {
  const fsr = C0 / (p.ng * p.L_m);
  const ki = -2 * Math.log(p.a) * fsr;
  const kex = -2 * Math.log(p.r) * fsr;
  return { ki, kex, k: ki + kex, fsr_Hz: fsr };
}

export function ringSweep(p: RingSweepParams): RingSweepResult {
  const { ki, kex, k } = ringRates(p);
  const w0 = (2 * Math.PI * C0) / p.lambda0_m;
  const QL = w0 / k;
  const lw = p.lambda0_m / QL;
  const span = p.lambdaStop_m - p.lambdaStart_m;
  const dur = Math.abs(span) / p.sweepRate_m_s;
  const maxSteps = p.maxSteps ?? 200000;
  let dt = p.dt_s ?? Math.min(p.tauTh_s / 4, lw / (20 * p.sweepRate_m_s));
  let steps = Math.ceil(dur / dt);
  if (steps > maxSteps) {
    steps = maxSteps;
    dt = dur / steps;
  } else dt = dur / steps;
  const vg = C0 / p.ng;
  const gTh = (p.Gamma / p.ng) * p.dndT;
  const gPr = (p.Gamma / p.ng) * p.prSign * 0.5 * p.n ** 3 * p.r33_m_per_V;
  const e = p.epsR * EPS0;
  const Uof = (wL: number, dT: number, E: number): number => {
    const wr = w0 * (1 - gTh * dT - gPr * E);
    const D = wL - wr;
    return (kex * p.P_W) / ((k * k) / 4 + D * D);
  };
  const dUdT = (wL: number, dT: number, E: number): number => {
    const wr = w0 * (1 - gTh * dT - gPr * E);
    const D = wL - wr;
    const den = (k * k) / 4 + D * D;
    // dD/d(dT) = w0 gTh
    return (-kex * p.P_W * 2 * D * w0 * gTh) / (den * den);
  };
  const nOut = Math.min(p.nOut ?? 4000, steps + 1);
  const stride = steps / (nOut - 1);
  const t = new Float64Array(nOut), lam = new Float64Array(nOut), T = new Float64Array(nOut), dTo = new Float64Array(nOut), Eo = new Float64Array(nOut);
  let dT = 0, E = 0, o = 0, nextOut = 0;
  const record = (s: number, l: number) => {
    const wL = (2 * Math.PI * C0) / l;
    // through transmission |s - sqrt(kex) a|^2 / |s|^2 with a = sqrt(kex) s / (k/2 - i D)
    const wr = w0 * (1 - gTh * dT - gPr * E);
    const D = wL - wr;
    const den = (k * k) / 4 + D * D;
    const re = 1 - (kex * (k / 2)) / den;
    const im = -(kex * D) / den;
    t[o] = s * dt;
    lam[o] = l;
    T[o] = re * re + im * im;
    dTo[o] = dT;
    Eo[o] = E;
    o++;
  };
  const sgn = Math.sign(span);
  for (let s = 0; s <= steps; s++) {
    const l = p.lambdaStart_m + sgn * p.sweepRate_m_s * s * dt;
    if (s >= nextOut - 1e-9 && o < nOut) {
      record(s, l);
      nextOut += stride;
    }
    if (s === steps) break;
    const lN = p.lambdaStart_m + sgn * p.sweepRate_m_s * (s + 1) * dt;
    const wL = (2 * Math.PI * C0) / lN;
    // thermal: backward Euler, Newton from previous dT
    const c = dt / p.tauTh_s;
    const A = p.Rth_K_per_W * p.absFrac * ki;
    let x = dT;
    for (let it = 0; it < 50; it++) {
      const F = x - dT - c * (A * Uof(wL, x, E) - x);
      const Fp = 1 - c * (A * dUdT(wL, x, E) - 1);
      const dx = F / Fp;
      x -= dx;
      if (Math.abs(dx) <= 1e-12 * (1 + Math.abs(x))) break;
    }
    dT = x;
    // photorefraction: exact exponential at frozen intensity
    if (p.prGain_A_per_W !== 0) {
      const I = (Uof(wL, dT, E) * vg) / (p.L_m * p.Aeff_m2);
      const sig = p.sigmaDark_S_m + p.kappa_S_m_per_W * I;
      const Et = (p.prGain_A_per_W * I) / sig;
      E = Et + (E - Et) * Math.exp((-sig * dt) / e);
    }
  }
  if (o < nOut) record(steps, p.lambdaStop_m);
  return { t: t.subarray(0, o), lambda: lam.subarray(0, o), T: T.subarray(0, o), dTcav: dTo.subarray(0, o), Esc: Eo.subarray(0, o), QL, linewidth_m: lw, steps };
}

/** Template ring for fig-04-04: 100 um radius TFLN ring at 1550 nm, intrinsic Q about 1e6, critically coupled.
 *  dn/dT from Jundt (S, 1550 nm, 25 C); r33 Turner 1966 (P-comp, 633 nm); n_e 2.1376 (Zelmon, derived);
 *  every other value is a template chosen to show the qualitative competition, not a fit to a device. */
export const RING_SWEEP_TEMPLATE: { params: RingSweepParams; prov: Record<string, Provenance> } = (() => {
  const L = 2 * Math.PI * 100e-6;
  const ng = 2.3;
  const lam = 1.55e-6;
  // a from Q_i = 1e6: kappa_i = w0 / Qi = -2 ln a FSR
  const w0 = (2 * Math.PI * C0) / lam;
  const fsr = C0 / (ng * L);
  const a = Math.exp(-w0 / 1e6 / (2 * fsr));
  return {
    params: {
      lambda0_m: lam, ng, L_m: L, a, r: a, Gamma: 0.8, dndT: dnedT(1.55, 25),
      absFrac: 0.5, tauTh_s: 1e-6, Rth_K_per_W: 1e3,
      prSign: -1, prGain_A_per_W: 0, kappa_S_m_per_W: 1e-14, sigmaDark_S_m: 1e-14, epsR: 28,
      Aeff_m2: 1e-12, n: 2.1376, r33_m_per_V: EO_TURNER1966_S.r33 * 1e-12,
      P_W: 1e-3, lambdaStart_m: lam - 20e-12, lambdaStop_m: lam + 100e-12, sweepRate_m_s: 1e-9,
    },
    prov: {
      dndT: { source: "jundt1997", status: "S", note: "dn_e/dT at 1550 nm, 25 C" },
      r33: EO_TURNER1966_S.prov,
      n: { source: "zelmon1997", status: "derived", note: "n_e(1550 nm, 21 C) = 2.1376" },
      geometry: { source: "r11", status: "template", note: "R = 100 um, n_g = 2.3, Gamma = 0.8, Q_i = 1e6, critical coupling" },
      thermal: { source: "carmon2004", status: "template", note: "absFrac 0.5, tau_th 1 us, R_th 1e3 K/W" },
      photorefractive: { source: "lin2021", status: "template", note: "sign opposite to thermal (reported); prGain, kappa, sigma_d, A_eff template" },
      sweep: { source: "r11", status: "template" },
    },
  };
})();
