// Chapter 2 nonlinear-optics helpers that coupledmode.ts and phasematching.ts do not cover: nonlinear polarization from the
// Voigt d matrix, group-velocity mismatch, QPM temperature tuning rate, resonant SHG efficiency, resonant OPO threshold and
// above-threshold output (with a coupled-mode time-domain check), parametric gain in dB/m, cascaded chi(2) phase (closed form
// and RK4), Kerr gamma.
// Equations as printed in content/chapters/02-light/manuscript.md: eq. 2.11 (P_NL), 2.13 (eta_norm), 2.14 (gain), 2.15 (OPO
// threshold and output), 2.16 (cascaded phase), 2.5 L2 (gamma = 2 pi n2 / (lambda A_eff)); degeneracy factors per
// Boyd, Nonlinear Optics, 3rd ed. (2008) ch. 1; coupled-mode conventions of manuscript 2.3 L3 (fields A exp(i(w t - k z)),
// |A|^2 = power). SI units unless suffixed.
import { HBAR, C0 } from "./constants.ts";
import type { Vec3 } from "./linalg.ts";
import type { Matrix } from "./tensors.ts";
import type { IndexFn } from "./sellmeier.ts";

// ---------- nonlinear polarization ----------
/** Second-order polarization divided by eps0, in the units of d times field squared, from the 3x6 Voigt d (Kleinman form,
 *  e.g. tensors.dShg3m). SHG (E2 omitted): P_i = 2 eps0 sum_l d_il F_l(E, E) with F = [Ex^2, Ey^2, Ez^2, 2EyEz, 2ExEz, 2ExEy]
 *  (eq. 2.11). SFG/DFG (E2 given, distinct frequencies): P_i = 4 eps0 sum_jk d_ijk E1_j E2_k (Boyd 2008 eq. 1.5.x
 *  degeneracy factor 2 times chi = 2 d). Real field amplitudes; for DFG pass the conjugated idler-side field. */
export function nonlinearPolarization(d: Matrix, E1: Vec3, E2?: Vec3): Vec3 {
  const b = E2 ?? E1;
  const F = [
    E1[0] * b[0],
    E1[1] * b[1],
    E1[2] * b[2],
    E1[1] * b[2] + E1[2] * b[1],
    E1[0] * b[2] + E1[2] * b[0],
    E1[0] * b[1] + E1[1] * b[0],
  ];
  const K = E2 ? 4 : 2;
  const P: Vec3 = [0, 0, 0];
  for (let i = 0; i < 3; i++) for (let l = 0; l < 6; l++) P[i] += K * d[i][l] * F[l];
  return P;
}

/** Indices (0-based Voigt columns) of d that a given input field activates (nonzero F_l), for the "active cells" readout. */
export function activeVoigtColumns(E1: Vec3, E2?: Vec3, tol = 1e-12): number[] {
  const b = E2 ?? E1;
  const F = [E1[0] * b[0], E1[1] * b[1], E1[2] * b[2], E1[1] * b[2] + E1[2] * b[1], E1[0] * b[2] + E1[2] * b[0], E1[0] * b[1] + E1[1] * b[0]];
  const s = Math.max(...F.map(Math.abs));
  return F.flatMap((v, l) => (Math.abs(v) > tol * (s || 1) ? [l] : []));
}

// ---------- dispersion-derived quantities ----------
/** Group index n_g = n - lambda dn/dlambda by central difference (step h um). */
export function groupIndexFn(n: IndexFn, lam_um: number, T_C?: number, h = 1e-4): number {
  return n(lam_um, T_C) - (lam_um * (n(lam_um + h, T_C) - n(lam_um - h, T_C))) / (2 * h);
}
/** Group-velocity mismatch 1/v_g2 - 1/v_g1 = (n_g2 - n_g1)/c in fs/mm (wave 2 at lam2 with index n2, wave 1 at lam1). */
export function gvm(lam1_um: number, n1: IndexFn, lam2_um: number, n2: IndexFn, T_C?: number): number {
  return ((groupIndexFn(n2, lam2_um, T_C) - groupIndexFn(n1, lam1_um, T_C)) / C0) * 1e15 * 1e-3;
}

/** QPM SHG (type 0, one index function) temperature tuning rate d lambda/dT at fixed period (nm/K):
 *  -(d Delta k/dT)/(d Delta k/d lambda); the period drops out (no thermal expansion; manuscript 2.3 L3 table). */
export function shgQpmTuningRate(lam_um: number, n: IndexFn, T_C: number): number {
  const dk = (l: number, T: number) => 2 * Math.PI * (n(l / 2, T) / (l / 2) - (2 * n(l, T)) / l);
  const hT = 1e-2;
  const hl = 1e-5;
  const dT = (dk(lam_um, T_C + hT) - dk(lam_um, T_C - hT)) / (2 * hT);
  const dl = (dk(lam_um + hl, T_C) - dk(lam_um - hl, T_C)) / (2 * hl);
  return (-dT / dl) * 1e3;
}

// ---------- waveguide and resonant SHG ----------
/** Waveguide efficiency in %/W for length L (cm) from a normalized efficiency in %/(W cm^2): eta_norm L^2. */
export const percentPerW = (etaNorm_pct_per_W_cm2: number, L_cm: number): number => etaNorm_pct_per_W_cm2 * L_cm * L_cm;

/** Resonant SHG efficiency P_b,out / P_a,in^2 (1/W), undepleted, zero detuning, for H/hbar = g (a^dag^2 b + a^2 b^dag)
 *  (energy decay rates kappa, external kappa_ex, omega_a = fundamental angular frequency, omega_b = 2 omega_a):
 *  eta = 128 g^2 kappa_a,ex^2 kappa_b,ex / (hbar omega_a kappa_a^4 kappa_b^2) [derived from the coupled-mode equations;
 *  reduces to the manuscript form 16 g^2 / (hbar omega kappa_a^2 kappa_b) at kappa_ex = kappa/2 (critical coupling)]. */
export function ringShgEfficiency(p: { g: number; kappa_a: number; kappa_b: number; kappa_a_ex: number; kappa_b_ex: number; omega_a: number }): number {
  return (128 * p.g ** 2 * p.kappa_a_ex ** 2 * p.kappa_b_ex) / (HBAR * p.omega_a * p.kappa_a ** 4 * p.kappa_b ** 2);
}
/** Critical-coupling form 16 g^2 / (hbar omega_a kappa_a^2 kappa_b) (manuscript F2-09 model). */
export const ringShgEfficiencyCritical = (g: number, kappa_a: number, kappa_b: number, omega_a: number): number =>
  (16 * g * g) / (HBAR * omega_a * kappa_a ** 2 * kappa_b);

// ---------- OPO, resonant (eq. 2.15) ----------
export interface ResonantOPO {
  omega_p: number;
  kappa_p: number;
  kappa_p_ex: number;
  kappa_s: number;
  kappa_i: number;
  /** nonlinear coupling (rad/s) for H/hbar = g (a_p^dag a_s a_i + h.c.) */
  g: number;
}
/** Threshold: intracavity pump photons kappa_s kappa_i / (4 g^2) and bus power
 *  P_th = hbar omega_p kappa_p^2 kappa_s kappa_i / (16 g^2 kappa_p,ex) (eq. 2.15). */
export function opoThreshold(p: ResonantOPO): { nPump_th: number; P_th_W: number } {
  return {
    nPump_th: (p.kappa_s * p.kappa_i) / (4 * p.g ** 2),
    P_th_W: (HBAR * p.omega_p * p.kappa_p ** 2 * p.kappa_s * p.kappa_i) / (16 * p.g ** 2 * p.kappa_p_ex),
  };
}
/** Summed signal + idler output above threshold (manuscript 2.4 L2, kappa_s = kappa_i, zero detunings):
 *  P_s+i = P_th (4 kappa_s,ex kappa_p,ex / (kappa_s kappa_p)) (sqrt(P/P_th) - 1); exactly 0 at or below threshold.
 *  Conversion P_s+i / P peaks at P = 4 P_th with value kappa_s,ex kappa_p,ex / (kappa_s kappa_p). */
export function opoOutput(P_W: number, P_th_W: number, c: { kappa_s_ex: number; kappa_s: number; kappa_p_ex: number; kappa_p: number }): number {
  if (P_W <= P_th_W) return 0;
  return P_th_W * ((4 * c.kappa_s_ex * c.kappa_p_ex) / (c.kappa_s * c.kappa_p)) * (Math.sqrt(P_W / P_th_W) - 1);
}

/** Time-domain coupled-mode check of eq. 2.15 (RK4, photon-number amplitudes, all detunings zero):
 *  da_p/dt = -(k_p/2) a_p - i g a_s a_i + sqrt(k_p,ex) s, da_s/dt = -(k_s/2) a_s - i g a_p a_i*,
 *  da_i/dt = -(k_i/2) a_i - i g a_p a_s*; |s|^2 = P / (hbar omega_p). Returns final photon numbers and the summed
 *  signal + idler output power hbar omega_p kappa_s,ex |a_s|^2 (valid for kappa_s = kappa_i, omega_s + omega_i = omega_p). */
export function opoCMT(p: ResonantOPO & { kappa_s_ex: number; P_W: number; t_end: number; steps: number; seed?: number }): { np: number; ns: number; ni: number; Psi_W: number } {
  const s = Math.sqrt(p.P_W / (HBAR * p.omega_p));
  const se = Math.sqrt(p.kappa_p_ex) * s;
  const seed = p.seed ?? 1e-3;
  // y = [pr, pi, sr, si, ir, ii]
  let y = [0, 0, seed, 0, seed, 0];
  const f = (v: number[]): number[] => {
    const [pr, pim, sr, sim, ir, iim] = v;
    // a_s a_i
    const sir = sr * ir - sim * iim;
    const sii = sr * iim + sim * ir;
    // a_p a_i*
    const pir = pr * ir + pim * iim;
    const pii = pim * ir - pr * iim;
    // a_p a_s*
    const psr = pr * sr + pim * sim;
    const psi = pim * sr - pr * sim;
    return [
      -(p.kappa_p / 2) * pr + p.g * sii + se,
      -(p.kappa_p / 2) * pim - p.g * sir,
      -(p.kappa_s / 2) * sr + p.g * pii,
      -(p.kappa_s / 2) * sim - p.g * pir,
      -(p.kappa_i / 2) * ir + p.g * psi,
      -(p.kappa_i / 2) * iim - p.g * psr,
    ];
  };
  const h = p.t_end / p.steps;
  for (let n = 0; n < p.steps; n++) {
    const k1 = f(y);
    const k2 = f(y.map((v, j) => v + (h / 2) * k1[j]));
    const k3 = f(y.map((v, j) => v + (h / 2) * k2[j]));
    const k4 = f(y.map((v, j) => v + h * k3[j]));
    y = y.map((v, j) => v + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
  }
  const ns = y[2] ** 2 + y[3] ** 2;
  return { np: y[0] ** 2 + y[1] ** 2, ns, ni: y[4] ** 2 + y[5] ** 2, Psi_W: HBAR * p.omega_p * p.kappa_s_ex * ns };
}

// ---------- parametric gain (eq. 2.14) ----------
/** Phase-sensitive degenerate gain in dB per metre: 20 log10(e) sqrt(eta_norm P_p) (eta in 1/(W m^2)). */
export const opaGainDbPerM = (eta: number, Pp_W: number): number => (20 / Math.LN10) * Math.sqrt(eta * Pp_W);

// ---------- cascaded chi(2) (eq. 2.16) and Kerr ----------
/** Closed form for |dk| L >> 1: Delta phi_NL = -eta P L / dk (Kerr-sign convention: positive = index increase). */
export const cascadedPhase = (eta: number, P_W: number, L_m: number, dk_per_m: number): number => (-eta * P_W * L_m) / dk_per_m;
/** Effective cascaded nonlinear coefficient gamma_casc = -eta / dk (1/(W m)). */
export const gammaCascaded = (eta: number, dk_per_m: number): number => -eta / dk_per_m;
/** Undepleted SH fraction |A_2w|^2 / P = 4 eta P sin^2(dk z / 2) / dk^2; z-average 2 eta P / dk^2, peak 4 eta P / dk^2. */
export const cascadedShFraction = (eta: number, P_W: number, dk_per_m: number, z_m: number): number =>
  (4 * eta * P_W * Math.sin((dk_per_m * z_m) / 2) ** 2) / dk_per_m ** 2;

/** RK4 of the SHG coupled-mode equations (manuscript 2.3 L3: dA_w/dz = -i k A_2w A_w* e^{-i dk z},
 *  dA_2w/dz = -i k A_w^2 e^{+i dk z}, k^2 = eta) for the cascaded phase. Returns arg(A_w(L)) (= -Delta phi_NL in this
 *  field convention), Delta phi_NL, the z-averaged and peak SH fraction, and the final powers. */
export function cascadedRK4(p: { eta: number; P_W: number; L_m: number; dk_per_m: number; steps?: number }): {
  argAw: number;
  dPhiNL: number;
  shMean: number;
  shPeak: number;
  Pw: number;
  P2w: number;
} {
  const N = p.steps ?? 20000;
  const k = Math.sqrt(p.eta);
  const dk = p.dk_per_m;
  const h = p.L_m / N;
  let y = [Math.sqrt(p.P_W), 0, 0, 0];
  const f = (z: number, v: number[]): number[] => {
    const [x1, y1, x2, y2] = v;
    const c = Math.cos(dk * z);
    const s = Math.sin(dk * z);
    // A2 A1* e^{-i dk z}
    const pr = x2 * x1 + y2 * y1;
    const pi = y2 * x1 - x2 * y1;
    const qr = pr * c + pi * s;
    const qi = pi * c - pr * s;
    // A1^2 e^{+i dk z}
    const ar = x1 * x1 - y1 * y1;
    const ai = 2 * x1 * y1;
    const br = ar * c - ai * s;
    const bi = ai * c + ar * s;
    // -i k (q) = k (qi, -qr)
    return [k * qi, -k * qr, k * bi, -k * br];
  };
  let sum = 0;
  let peak = 0;
  let prev = 0;
  for (let n = 0; n < N; n++) {
    const z = n * h;
    const k1 = f(z, y);
    const k2 = f(z + h / 2, y.map((v, j) => v + (h / 2) * k1[j]));
    const k3 = f(z + h / 2, y.map((v, j) => v + (h / 2) * k2[j]));
    const k4 = f(z + h, y.map((v, j) => v + h * k3[j]));
    y = y.map((v, j) => v + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
    const frac = (y[2] ** 2 + y[3] ** 2) / p.P_W;
    sum += 0.5 * (prev + frac) * h;
    prev = frac;
    if (frac > peak) peak = frac;
  }
  const argAw = Math.atan2(y[1], y[0]);
  return { argAw, dPhiNL: -argAw, shMean: sum / p.L_m, shPeak: peak, Pw: y[0] ** 2 + y[1] ** 2, P2w: y[2] ** 2 + y[3] ** 2 };
}

/** Kerr nonlinear coefficient gamma = 2 pi n2 / (lambda A_eff) in 1/(W m) (manuscript 2.5 L2). */
export const gammaKerr = (n2_m2_per_W: number, lam_um: number, Aeff_um2: number): number => (2 * Math.PI * n2_m2_per_W) / (lam_um * 1e-6 * Aeff_um2 * 1e-12);
