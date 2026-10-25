// Coupled-mode three-wave mixing: SHG (undepleted, depleted tanh, RK4 with detuning and loss), SFG/DFG/OPA (RK4,
// photon-flux normalization), OPA gain, OPO threshold (singly and doubly resonant).
// References: Armstrong et al., Phys. Rev. 127, 1918 (1962); Boyd, Nonlinear Optics, 3rd ed. (2008), ch. 2;
// Yariv, Quantum Electronics, 3rd ed. (1989), parametric oscillation. SI units: W, m, 1/(W m^2).
import { EPS0, C0, HBAR } from "./constants.ts";
import { sinc } from "./phasematching.ts";

// ---------- SHG, power-normalized amplitudes |A|^2 = P ----------
// dA1/dz = -i kappa A2 A1* exp(-i dk z) - (alpha1/2) A1
// dA2/dz = -i kappa A1^2 exp(+i dk z) - (alpha2/2) A2,     kappa^2 = eta (normalized efficiency)
// Without loss, P1 + P2 is conserved (Manley-Rowe for SHG).

/** Normalized SHG efficiency eta = 8 pi^2 d_eff^2 / (eps0 c n1^2 n2 lambda1^2 A_eff) in 1/(W m^2)
 *  (Boyd ch. 2; TFLN form in Wang et al., Optica 5, 1438 (2018); R11 S4). Divide by 1e4 x 100 for %/(W cm^2). */
export function etaNormSHG(p: { deff_pm_per_V: number; n1: number; n2: number; lam1_um: number; Aeff_um2: number }): number {
  const d = p.deff_pm_per_V * 1e-12;
  const lam = p.lam1_um * 1e-6;
  const A = p.Aeff_um2 * 1e-12;
  return (8 * Math.PI ** 2 * d * d) / (EPS0 * C0 * p.n1 * p.n1 * p.n2 * lam * lam * A);
}
/** 1/(W m^2) to %/(W cm^2). */
export const etaToPercentPerWcm2 = (eta: number): number => eta * 1e-4 * 100;

/** Undepleted SHG: P2 = eta P1^2 L^2 sinc^2(dk L / 2). L in m, dk in rad/m. */
export const shgUndepleted = (eta: number, P1_W: number, L_m: number, dk_per_m = 0): number => eta * P1_W ** 2 * L_m ** 2 * sinc((dk_per_m * L_m) / 2) ** 2;

/** Depleted SHG at dk = 0, no loss: P2 = P0 tanh^2(sqrt(eta P0) L). */
export const shgDepleted = (eta: number, P0_W: number, L_m: number): number => P0_W * Math.tanh(Math.sqrt(eta * P0_W) * L_m) ** 2;

export interface ShgRK4Opts {
  eta: number;
  P0_W: number;
  L_m: number;
  dk_per_m?: number;
  alpha1_per_m?: number;
  alpha2_per_m?: number;
  steps?: number;
  /** initial SH power (seed) and relative phase of the SH seed (rad) */
  P2_0_W?: number;
  phase2_0?: number;
}
/** RK4 integration of the SHG equations. Returns sampled z (m), P1, P2 (W) at steps+1 points. */
export function shgRK4(o: ShgRK4Opts): { z: Float64Array; P1: Float64Array; P2: Float64Array } {
  const N = o.steps ?? 1000;
  const k = Math.sqrt(o.eta);
  const dk = o.dk_per_m ?? 0;
  const a1 = (o.alpha1_per_m ?? 0) / 2;
  const a2 = (o.alpha2_per_m ?? 0) / 2;
  const h = o.L_m / N;
  // state: [Re A1, Im A1, Re A2, Im A2]
  const s = [Math.sqrt(o.P0_W), 0, 0, 0];
  if (o.P2_0_W) {
    const ph = o.phase2_0 ?? 0;
    s[2] = Math.sqrt(o.P2_0_W) * Math.cos(ph);
    s[3] = Math.sqrt(o.P2_0_W) * Math.sin(ph);
  }
  const f = (z: number, y: number[]): number[] => {
    const [x1, y1, x2, y2] = y;
    const c = Math.cos(dk * z);
    const sn = Math.sin(dk * z);
    // A2 A1* e^{-i dk z}
    const pr = x2 * x1 + y2 * y1;
    const pi = y2 * x1 - x2 * y1;
    const qr = pr * c + pi * sn;
    const qi = pi * c - pr * sn;
    // A1^2 e^{+i dk z}
    const sr = x1 * x1 - y1 * y1;
    const si = 2 * x1 * y1;
    const tr = sr * c - si * sn;
    const ti = si * c + sr * sn;
    // -i k q = k*(qi) + i*(-k qr)
    return [k * qi - a1 * x1, -k * qr - a1 * y1, k * ti - a2 * x2, -k * tr - a2 * y2];
  };
  const z = new Float64Array(N + 1);
  const P1 = new Float64Array(N + 1);
  const P2 = new Float64Array(N + 1);
  let y = s;
  P1[0] = y[0] ** 2 + y[1] ** 2;
  P2[0] = y[2] ** 2 + y[3] ** 2;
  for (let i = 0; i < N; i++) {
    const zi = i * h;
    y = rk4Step(f, zi, y, h);
    z[i + 1] = zi + h;
    P1[i + 1] = y[0] ** 2 + y[1] ** 2;
    P2[i + 1] = y[2] ** 2 + y[3] ** 2;
  }
  return { z, P1, P2 };
}

function rk4Step(f: (z: number, y: number[]) => number[], z: number, y: number[], h: number): number[] {
  const n = y.length;
  const k1 = f(z, y);
  const y2 = new Array<number>(n);
  for (let i = 0; i < n; i++) y2[i] = y[i] + 0.5 * h * k1[i];
  const k2 = f(z + 0.5 * h, y2);
  for (let i = 0; i < n; i++) y2[i] = y[i] + 0.5 * h * k2[i];
  const k3 = f(z + 0.5 * h, y2);
  for (let i = 0; i < n; i++) y2[i] = y[i] + h * k3[i];
  const k4 = f(z + h, y2);
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = y[i] + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
  return out;
}

// ---------- non-degenerate three-wave mixing, photon-flux amplitudes |a_j|^2 = P_j / (hbar w_j) ----------
// da1/dz = -i g a3 a2* exp(-i dk z),  da2/dz = -i g a3 a1* exp(-i dk z),  da3/dz = -i g a1 a2 exp(+i dk z)
// dk = k3 - k1 - k2 (- grating). Manley-Rowe: N1 + N3 and N2 + N3 are conserved without loss.

/** Coupling g (1/(m sqrt(photons/s))) from the SFG normalized efficiency eta_SFG (P3 = eta_SFG P1 P2 L^2, undepleted, dk = 0):
 *  g^2 = eta_SFG hbar w1 w2 / w3 (follows from the equations above). */
export function gFromEtaSFG(etaSFG: number, l1_um: number, l2_um: number): number {
  const w1 = (2 * Math.PI * C0) / (l1_um * 1e-6);
  const w2 = (2 * Math.PI * C0) / (l2_um * 1e-6);
  return Math.sqrt((etaSFG * HBAR * w1 * w2) / (w1 + w2));
}

export interface ThreeWaveOpts {
  g: number;
  l1_um: number;
  l2_um: number;
  P1_W: number;
  P2_W: number;
  P3_W: number;
  L_m: number;
  dk_per_m?: number;
  /** initial phases (rad) of waves 1, 2, 3 */
  phases?: [number, number, number];
  steps?: number;
}
/** RK4 integration of the three-wave equations. Returns z (m) and P1, P2, P3 (W). */
export function threeWaveRK4(o: ThreeWaveOpts): { z: Float64Array; P1: Float64Array; P2: Float64Array; P3: Float64Array } {
  const N = o.steps ?? 1000;
  const w1 = (2 * Math.PI * C0) / (o.l1_um * 1e-6);
  const w2 = (2 * Math.PI * C0) / (o.l2_um * 1e-6);
  const w3 = w1 + w2;
  const ph = o.phases ?? [0, 0, 0];
  const amp = (P: number, w: number) => Math.sqrt(P / (HBAR * w));
  let y = [
    amp(o.P1_W, w1) * Math.cos(ph[0]), amp(o.P1_W, w1) * Math.sin(ph[0]),
    amp(o.P2_W, w2) * Math.cos(ph[1]), amp(o.P2_W, w2) * Math.sin(ph[1]),
    amp(o.P3_W, w3) * Math.cos(ph[2]), amp(o.P3_W, w3) * Math.sin(ph[2]),
  ];
  const g = o.g;
  const dk = o.dk_per_m ?? 0;
  const f = (z: number, s: number[]): number[] => {
    const [x1, y1, x2, y2, x3, y3] = s;
    const c = Math.cos(dk * z);
    const sn = Math.sin(dk * z);
    // a3 a2* e^{-i dk z}
    let pr = x3 * x2 + y3 * y2;
    let pi = y3 * x2 - x3 * y2;
    const u1r = pr * c + pi * sn;
    const u1i = pi * c - pr * sn;
    // a3 a1* e^{-i dk z}
    pr = x3 * x1 + y3 * y1;
    pi = y3 * x1 - x3 * y1;
    const u2r = pr * c + pi * sn;
    const u2i = pi * c - pr * sn;
    // a1 a2 e^{+i dk z}
    pr = x1 * x2 - y1 * y2;
    pi = x1 * y2 + y1 * x2;
    const u3r = pr * c - pi * sn;
    const u3i = pi * c + pr * sn;
    return [g * u1i, -g * u1r, g * u2i, -g * u2r, g * u3i, -g * u3r];
  };
  const h = o.L_m / N;
  const z = new Float64Array(N + 1);
  const P1 = new Float64Array(N + 1);
  const P2 = new Float64Array(N + 1);
  const P3 = new Float64Array(N + 1);
  const rec = (i: number) => {
    P1[i] = (y[0] ** 2 + y[1] ** 2) * HBAR * w1;
    P2[i] = (y[2] ** 2 + y[3] ** 2) * HBAR * w2;
    P3[i] = (y[4] ** 2 + y[5] ** 2) * HBAR * w3;
  };
  rec(0);
  for (let i = 0; i < N; i++) {
    y = rk4Step(f, i * h, y, h);
    z[i + 1] = (i + 1) * h;
    rec(i + 1);
  }
  return { z, P1, P2, P3 };
}

// ---------- OPA ----------
/** Parametric gain coefficient Gamma (1/m) for an undepleted pump of power P3 (W): Gamma^2 = g^2 P3 / (hbar w3). */
export function opaGamma(g: number, P3_W: number, l3_um: number): number {
  const w3 = (2 * Math.PI * C0) / (l3_um * 1e-6);
  return g * Math.sqrt(P3_W / (HBAR * w3));
}

/** Phase-insensitive OPA signal power gain with no initial idler (Boyd ch. 2):
 *  G = 1 + (Gamma/gk)^2 sinh^2(gk L), gk^2 = Gamma^2 - (dk/2)^2; for gk^2 < 0 sinh -> sin. At dk = 0, G = cosh^2(Gamma L). */
export function opaGain(Gamma_per_m: number, L_m: number, dk_per_m = 0): number {
  const g2 = Gamma_per_m ** 2 - (dk_per_m / 2) ** 2;
  if (g2 > 0) {
    const gk = Math.sqrt(g2);
    return 1 + (Gamma_per_m / gk) ** 2 * Math.sinh(gk * L_m) ** 2;
  }
  if (g2 === 0) return 1 + (Gamma_per_m * L_m) ** 2;
  const gk = Math.sqrt(-g2);
  return 1 + (Gamma_per_m / gk) ** 2 * Math.sin(gk * L_m) ** 2;
}

/** Degenerate (type 0) phase-sensitive amplification of a weak fundamental by an undepleted SH pump, SHG normalization:
 *  quadrature gains exp(+-2 sqrt(eta P_pump) L) at dk = 0 (follows from the SHG equations with A2 fixed). */
export function degenerateOpaGains(eta: number, Ppump_W: number, L_m: number): { amplified: number; deamplified: number } {
  const x = 2 * Math.sqrt(eta * Ppump_W) * L_m;
  return { amplified: Math.exp(x), deamplified: Math.exp(-x) };
}

// ---------- OPO threshold (Yariv 1989; single-pass gain, undepleted pump, dk = 0, resonance conditions met) ----------
// Round trip: (a_s, a_i*) -> diag(r_s, r_i) [[C, -iS], [iS, C]] (a_s, a_i*), C = cosh(Gamma L), S = sinh(Gamma L),
// r = field round-trip amplitude factor (sqrt of the power fraction surviving one round trip, gain excluded).
// Non-trivial steady state requires (1 - r_s C)(1 - r_i C) = r_s r_i S^2  ->  cosh(Gamma L) = (1 + r_s r_i)/(r_s + r_i).

/** Doubly resonant threshold Gamma L (R_s, R_i = round-trip power survival fractions of signal and idler). */
export function opoThresholdGammaL_DRO(Rs: number, Ri: number): number {
  const rs = Math.sqrt(Rs);
  const ri = Math.sqrt(Ri);
  return Math.acosh((1 + rs * ri) / (rs + ri));
}
/** Singly resonant threshold Gamma L (idler single pass, r_i = 0): cosh^2(Gamma L) = 1/R_s. */
export function opoThresholdGammaL_SRO(Rs: number): number {
  return Math.acosh(1 / Math.sqrt(Rs));
}
/** Pump threshold power (W) from a threshold Gamma L and the gain coefficient per watt, Gamma^2 = k_P P_pump. */
export const opoThresholdPower = (GammaL: number, L_m: number, gammaSqPerW: number): number => (GammaL / L_m) ** 2 / gammaSqPerW;
