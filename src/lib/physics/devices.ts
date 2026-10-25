// Chapter 06 device helpers that modulator.ts, ring.ts and coupledmode.ts do not already provide: push-pull VpiL in
// V cm and the implied overlap, ring parameters from a loaded Q, linewidth and photon lifetime, an S21 curve with the
// first -3 dB crossing, an atlas preset, a PAM-M eye generator, a triply resonant OPO steady state (coupled modes),
// comb line counting, IDT pitch.
// Sources: closed forms stated per function; the OPO steady state is derived here from the standard three-mode
// coupled-mode equations (status: derived; assumptions in the docstring). Atlas preset values are `reported` via the
// eo-modulator-atlas row quoted in content/chapters/06-devices/manuscript.md sec. 6.2.
import { C0, HBAR } from "./constants.ts";
import type { Provenance } from "./constants.ts";
import { fft } from "./fft.ts";
import { createRng } from "./prng.ts";
import { mzmTransmission, s21EOdB, twResponse, vpiLPhase } from "./modulator.ts";
import type { TWParams } from "./modulator.ts";
import { couplingQ, intrinsicQ, loadedQ } from "./ring.ts";

// ---------------------------------------------------------------------------------------------
// VpiL and implied overlap (lateral-gap model)
// ---------------------------------------------------------------------------------------------
/** Push-pull MZM VpiL (V cm) = lambda g / (2 n^3 r Gamma). */
export function vpiLPushPullVcm(p: { lam_um: number; gap_um: number; n: number; r_pm_per_V: number; Gamma: number }): number {
  return (vpiLPhase(p) / 2) * 100;
}
/** Overlap Gamma implied by a reported VpiL (V cm): Gamma = lambda g / (k n^3 r VpiL), k = 2 (push-pull) or 1. */
export function impliedOverlap(p: { lam_um: number; gap_um: number; n: number; r_pm_per_V: number; vpiL_Vcm: number; pushPull?: boolean }): number {
  const k = (p.pushPull ?? true) ? 2 : 1;
  return (p.lam_um * 1e-6 * p.gap_um * 1e-6) / (k * p.n ** 3 * p.r_pm_per_V * 1e-12 * p.vpiL_Vcm * 1e-2);
}

// ---------------------------------------------------------------------------------------------
// Ring modulator helpers
// ---------------------------------------------------------------------------------------------
/** Optical frequency (Hz) of a vacuum wavelength in nm. */
export const nuFromNm = (lam_nm: number): number => C0 / (lam_nm * 1e-9);
/** Loaded linewidth nu0 / Q_L (GHz). */
export const linewidthGHz = (lam_nm: number, QL: number): number => nuFromNm(lam_nm) / QL / 1e9;
/** Photon (energy) lifetime Q_L / (2 pi nu0) (ps). */
export const photonLifetimePs = (lam_nm: number, QL: number): number => (QL / (2 * Math.PI * nuFromNm(lam_nm))) * 1e12;
/** Resonance shift (pm) for a tuning slope (pm/V) and voltage. */
export const resonanceShiftPm = (tuning_pm_per_V: number, V: number): number => tuning_pm_per_V * V;

export type CouplingRegime = "critical" | "under" | "over";
/** Single-pass amplitude a and self-coupling r of an all-pass ring with circumference 2 pi R and loaded Q (exact Airy FWHM,
 *  ring.ts loadedQ). Regime sets Q_i/Q_c = ln r / ln a: 1 (critical), qRatio < 1 (under), > 1 (over); defaults 0.5 and 2
 *  are display templates. Solved by bisection so loadedQ(r, a) equals QL to 1e-10 relative. */
export function ringFromQ(p: { lambda_nm: number; ng: number; R_um: number; QL: number; regime: CouplingRegime; qRatio?: number }): {
  a: number;
  r: number;
  Qi: number;
  Qc: number;
  L_um: number;
} {
  const rho = p.regime === "critical" ? 1 : (p.qRatio ?? (p.regime === "under" ? 0.5 : 2));
  if (p.regime === "under" && !(rho < 1)) throw new RangeError("under-coupled needs qRatio < 1");
  if (p.regime === "over" && !(rho > 1)) throw new RangeError("over-coupled needs qRatio > 1");
  const lam = p.lambda_nm * 1e-3;
  const L = 2 * Math.PI * p.R_um;
  // parametrize by x = -ln a > 0, ln r = rho ln a; loadedQ decreases monotonically with x
  const q = (x: number) => loadedQ(lam, p.ng, L, Math.exp(-rho * x), Math.exp(-x));
  let lo = 1e-14;
  let hi = 1;
  if (q(hi) > p.QL) throw new RangeError("QL too low for this ring");
  for (let i = 0; i < 300 && (hi - lo) / hi > 1e-15; i++) {
    const m = Math.sqrt(lo * hi);
    if (q(m) > p.QL) lo = m;
    else hi = m;
  }
  const x = Math.sqrt(lo * hi);
  const a = Math.exp(-x);
  const r = Math.exp(-rho * x);
  return { a, r, Qi: intrinsicQ(lam, p.ng, L, a), Qc: couplingQ(lam, p.ng, L, r), L_um: L };
}

// ---------------------------------------------------------------------------------------------
// Traveling-wave S21 curve and atlas preset
// ---------------------------------------------------------------------------------------------
/** S21_EO (dB) on a frequency grid and the first -dB crossing by linear interpolation in f (null if none on the grid). */
export function s21Curve(f_Hz: ArrayLike<number>, p: TWParams, dB = 3): { dB: Float64Array; fCross_Hz: number | null } {
  const out = new Float64Array(f_Hz.length);
  let fc: number | null = null;
  for (let i = 0; i < f_Hz.length; i++) {
    out[i] = f_Hz[i] === 0 ? 0 : s21EOdB(f_Hz[i], p);
    if (fc === null && i > 0 && out[i - 1] >= -dB && out[i] < -dB) {
      const t = (-dB - out[i - 1]) / (out[i] - out[i - 1]);
      fc = f_Hz[i - 1] + t * (f_Hz[i] - f_Hz[i - 1]);
    }
  }
  return { dB: out, fCross_Hz: fc };
}

/** Atlas row chen2022-c as quoted in manuscript 6.2 (cl_twe, n_RF 2.35, n_g 2.2, Z0 50.5 ohm, RF loss 2.947 dB/cm at
 *  67 GHz, L = 10 mm). Loss exponent 0.5 is the figure's model choice (template). */
export const PRESET_CHEN2022C: {
  L_m: number;
  nRF: number;
  ng: number;
  Z0: number;
  lossRef_dB_per_cm: number;
  fRef_GHz: number;
  exponent: 0.5;
  prov: Record<string, Provenance>;
} = {
  L_m: 0.01,
  nRF: 2.35,
  ng: 2.2,
  Z0: 50.5,
  lossRef_dB_per_cm: 2.947,
  fRef_GHz: 67,
  exponent: 0.5,
  prov: {
    row: { source: "r11", status: "reported", note: "eo-modulator-atlas row chen2022-c (pinned eb97f96) as quoted in content/chapters/06-devices/manuscript.md sec. 6.2" },
    exponent: { source: "r11", status: "template", note: "sqrt(f) conductor-loss scaling assumed by F6.04" },
  },
};

// ---------------------------------------------------------------------------------------------
// PAM-M eye
// ---------------------------------------------------------------------------------------------
export interface PamEyeOpts {
  /** symbols in 0..M-1 */
  symbols: Uint8Array;
  M: number;
  baud: number;
  samplesPerSymbol: number;
  Vpp: number;
  Vpi: number;
  phi_b?: number;
  /** drive low-pass: first-order RC (|H| = 1/sqrt(1 + (f/f3)^2)) or Gaussian, -3 dB at f3dB_Hz; 0 = none */
  f3dB_Hz?: number;
  filter?: "first-order" | "gaussian";
  tw?: TWParams;
  noiseStd?: number;
  seed?: number;
  W?: number;
  H?: number;
}
/** Equally spaced drive levels in [-Vpp/2, Vpp/2] for PAM-M. */
export const pamLevel = (s: number, M: number, Vpp: number): number => (M === 1 ? 0 : (s / (M - 1) - 0.5) * Vpp);
/** PAM-M symbols from a PRBS bit stream, Gray-free natural mapping of log2(M) bits per symbol (MSB first). */
export function symbolsFromBits(bits: Uint8Array, M: number): Uint8Array {
  const b = Math.round(Math.log2(M));
  if (2 ** b !== M) throw new RangeError("M must be a power of 2");
  const n = Math.floor(bits.length / b);
  const s = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    let v = 0;
    for (let j = 0; j < b; j++) v = (v << 1) | bits[i * b + j];
    s[i] = v;
  }
  return s;
}
/** PAM-M eye: drive levels -> drive filter (first-order or Gaussian) -> optional TW response -> MZM -> noise -> 2-UI
 *  histogram over transmission [-0.1, 1.1]. One circular FFT over the record. */
export function eyeDiagramPAM(o: PamEyeOpts): { T: Float64Array; hist: Uint32Array; W: number; H: number } {
  const sps = o.samplesPerSymbol;
  const ns = o.symbols.length;
  const n0 = ns * sps;
  let N = 1;
  while (N < n0) N <<= 1;
  const dt = 1 / (o.baud * sps);
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  for (let i = 0; i < N; i++) re[i] = pamLevel(o.symbols[Math.floor(i / sps) % ns], o.M, o.Vpp);
  fft(re, im);
  const f3 = o.f3dB_Hz ?? 0;
  for (let k = 0; k < N; k++) {
    const kk = k <= N / 2 ? k : k - N;
    const f = kk / (N * dt);
    let hr = 1;
    let hi = 0;
    if (f3 > 0) {
      if ((o.filter ?? "first-order") === "first-order") {
        const x = f / f3; // H = 1/(1 + j x)
        hr = 1 / (1 + x * x);
        hi = -x / (1 + x * x);
      } else hr = Math.exp(-(Math.LN2 / 2) * (f / f3) ** 2);
    }
    if (o.tw && f !== 0) {
      const [tr, ti0] = twResponse(Math.abs(f), o.tw);
      const ti = f > 0 ? ti0 : -ti0;
      const nr = hr * tr - hi * ti;
      hi = hr * ti + hi * tr;
      hr = nr;
    }
    const xr = re[k] * hr - im[k] * hi;
    const xi = re[k] * hi + im[k] * hr;
    re[k] = xr;
    im[k] = xi;
  }
  fft(re, im, true);
  const T = new Float64Array(n0);
  const phiB = o.phi_b ?? -Math.PI / 2;
  const rng = createRng(o.seed ?? 1);
  for (let i = 0; i < n0; i++) T[i] = mzmTransmission(re[i], o.Vpi, phiB) + ((o.noiseStd ?? 0) > 0 ? (o.noiseStd ?? 0) * rng.normal() : 0);
  const W = o.W ?? 2 * sps;
  const Hh = o.H ?? 128;
  const hist = new Uint32Array(W * Hh);
  for (let i = 0; i < n0; i++) {
    const col = Math.min(W - 1, Math.floor(((i % (2 * sps)) / (2 * sps)) * W));
    const row = Math.floor(((1.1 - T[i]) / 1.2) * Hh);
    if (row >= 0 && row < Hh) hist[row * W + col]++;
  }
  return { T, hist, W, H: Hh };
}
/** Vertical openings of the M-1 eyes at sample j of each symbol: min(level s+1) - max(level s), s = 0..M-2 (ordered by
 *  drive level; with the default quadrature bias T increases with level). Negative = closed. */
export function eyeOpeningsPAM(T: Float64Array, symbols: Uint8Array, M: number, sps: number, j: number, skip = 4): number[] {
  const mn = new Array(M).fill(Infinity);
  const mx = new Array(M).fill(-Infinity);
  for (let s = skip; s < symbols.length; s++) {
    const v = T[s * sps + j];
    mn[symbols[s]] = Math.min(mn[symbols[s]], v);
    mx[symbols[s]] = Math.max(mx[symbols[s]], v);
  }
  const out: number[] = [];
  for (let s = 0; s < M - 1; s++) out.push(mn[s + 1] - mx[s]);
  return out;
}

// ---------------------------------------------------------------------------------------------
// OPO steady state (coupled modes)
// ---------------------------------------------------------------------------------------------
/** Triply resonant OPO, zero detunings, single pump, classical steady state. Model (derived; rates are energy decay
 *  rates kappa, intracavity |a|^2 in photons, |s|^2 = P_in/(hbar w_p)):
 *    da_p/dt = -(kappa_p/2) a_p - i g a_s a_i + sqrt(kappa_p,ex) s
 *    da_s/dt = -(kappa_s/2) a_s - i g a_p a_i*,   da_i/dt = -(kappa_i/2) a_i - i g a_p a_s*
 *  Threshold |a_p|^2 = kappa_s kappa_i/(4 g^2), P_th = hbar w_p kappa_p^2 kappa_s kappa_i/(16 g^2 kappa_p,ex).
 *  Above threshold with x = sqrt(P/P_th): |a_s|^2 = kappa_i kappa_p (x - 1)/(4 g^2), kappa_s |a_s|^2 = kappa_i |a_i|^2;
 *  output signal photon flux kappa_s,ex |a_s|^2; photon conversion efficiency 4 kappa_s,ex kappa_p,ex (x - 1)/(kappa_s
 *  kappa_p x^2), maximum (kappa_s,ex kappa_p,ex)/(kappa_s kappa_p) at P = 4 P_th. Below threshold the output is 0. */
export function opoTriplyResonant(p: {
  lam_p_um: number;
  lam_s_um?: number;
  kappa_p: number;
  kappa_p_ex: number;
  kappa_s: number;
  kappa_s_ex: number;
  kappa_i: number;
  kappa_i_ex?: number;
  g: number;
  Pin_W: number;
}): { Pth_W: number; Psig_W: number; Pidl_W: number; etaPhotonSignal: number; nPump: number; nSignal: number } {
  const lamS = p.lam_s_um ?? 2 * p.lam_p_um;
  const lamI = 1 / (1 / p.lam_p_um - 1 / lamS);
  const wp = (2 * Math.PI * C0) / (p.lam_p_um * 1e-6);
  const ws = (2 * Math.PI * C0) / (lamS * 1e-6);
  const wi = (2 * Math.PI * C0) / (lamI * 1e-6);
  const Pth = (HBAR * wp * p.kappa_p ** 2 * p.kappa_s * p.kappa_i) / (16 * p.g ** 2 * p.kappa_p_ex);
  const sIn2 = p.Pin_W / (HBAR * wp);
  if (p.Pin_W <= Pth) {
    const nP = (4 * p.kappa_p_ex * sIn2) / p.kappa_p ** 2;
    return { Pth_W: Pth, Psig_W: 0, Pidl_W: 0, etaPhotonSignal: 0, nPump: nP, nSignal: 0 };
  }
  const x = Math.sqrt(p.Pin_W / Pth);
  const nS = (p.kappa_i * p.kappa_p * (x - 1)) / (4 * p.g ** 2);
  const nI = (p.kappa_s * nS) / p.kappa_i;
  const Ps = HBAR * ws * p.kappa_s_ex * nS;
  const Pi = HBAR * wi * (p.kappa_i_ex ?? p.kappa_s_ex * (p.kappa_i / p.kappa_s)) * nI;
  return {
    Pth_W: Pth,
    Psig_W: Ps,
    Pidl_W: Pi,
    etaPhotonSignal: (p.kappa_s_ex * nS) / sIn2,
    nPump: (p.kappa_s * p.kappa_i) / (4 * p.g ** 2),
    nSignal: nS,
  };
}
/** Doubly resonant OPO (pump not resonant): parametric amplitude gain rate G sqrt(P) with G^2 in 1/(W s^2) (template);
 *  threshold G^2 P_th = kappa_s kappa_i / 4, i.e. P_th proportional to 1/(Q_s Q_i). */
export const opoThresholdDRO = (kappa_s: number, kappa_i: number, G2_per_W_s2: number): number => (kappa_s * kappa_i) / (4 * G2_per_W_s2);
/** Energy decay rate (1/s) from Q at a wavelength: kappa = omega / Q. */
export const kappaFromQ = (lam_um: number, Q: number): number => (2 * Math.PI * C0) / (lam_um * 1e-6) / Q;

// ---------------------------------------------------------------------------------------------
// Comb and SAW helpers
// ---------------------------------------------------------------------------------------------
/** Number of comb lines with power within thresh_dB (negative) of the strongest line. */
export function combLinesAbove(P: ArrayLike<number>, thresh_dB = -60): number {
  let mx = 0;
  for (let i = 0; i < P.length; i++) mx = Math.max(mx, P[i]);
  const lim = mx * 10 ** (thresh_dB / 10);
  let n = 0;
  for (let i = 0; i < P.length; i++) if (P[i] >= lim && P[i] > 0) n++;
  return n;
}
/** Optical span (nm) of lines k_min..k_max at line spacing f_Hz around lam_nm (exact in frequency). */
export function combSpanNm(kMin: number, kMax: number, spacing_Hz: number, lam_nm: number): number {
  const nu0 = nuFromNm(lam_nm);
  return (C0 / (nu0 + kMin * spacing_Hz) - C0 / (nu0 + kMax * spacing_Hz)) * 1e9;
}
/** Single-electrode IDT: period (pitch of one finger pair) = acoustic wavelength = v / f (m). */
export const idtPeriod = (v_m_per_s: number, f_Hz: number): number => v_m_per_s / f_Hz;
