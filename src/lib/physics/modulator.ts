// EO modulators: closed-form MZM, traveling-wave EO response (velocity mismatch, RF loss, impedance mismatch),
// small-signal S21_EO, PRBS generator and eye-diagram generator.
// References: Alferness, IEEE TMTT 30, 1121 (1982) (traveling-wave response); Zhu et al., Adv. Opt. Photon. 13, 242 (2021)
// (TFLN modulator review); ITU-T O.150 (PRBS polynomials). Phasor convention exp(+j w t).
import { C0 } from "./constants.ts";
import { fft } from "./fft.ts";
import { createRng } from "./prng.ts";

// ---------- closed-form MZM ----------
/** Single-arm phase-modulator VpiL (V m) = lambda g / (n^3 r Gamma) for a lumped field V/g with overlap Gamma. */
export function vpiLPhase(p: { lam_um: number; gap_um: number; n: number; r_pm_per_V: number; Gamma: number }): number {
  return (p.lam_um * 1e-6 * p.gap_um * 1e-6) / (p.n ** 3 * p.r_pm_per_V * 1e-12 * p.Gamma);
}
/** MZM VpiL (V m): equal to the phase VpiL for single-arm drive; half of it for push-pull (both arms, opposite fields). */
export const vpiLMZM = (vpiLPhase_Vm: number, pushPull: boolean): number => (pushPull ? vpiLPhase_Vm / 2 : vpiLPhase_Vm);
/** Vpi (V) from VpiL (V cm) and electrode length (cm). The VpiL must already refer to the drive configuration. */
export const vpiFromVpiL = (vpiL_Vcm: number, L_cm: number): number => vpiL_Vcm / L_cm;
/** MZM intensity transmission T = cos^2(pi V / (2 Vpi) + phi_b / 2), phi_b = static bias phase (rad); chirp-free push-pull. */
export const mzmTransmission = (V: number, Vpi: number, phi_b = 0): number => Math.cos((Math.PI * V) / (2 * Vpi) + phi_b / 2) ** 2;

// ---------- traveling-wave response ----------
export interface TWParams {
  L_m: number;
  /** RF effective index and optical group index */
  nRF: number;
  ng: number;
  /** RF field loss alpha(f) = alpha0 sqrt(f / 1 GHz) + alphaD f / 1 GHz, in Np/m (field) */
  alpha0_Np_per_m_sqrtGHz?: number;
  alphaD_Np_per_m_GHz?: number;
  /** line, source and load impedances (ohm); defaults: all equal (matched) */
  Z0?: number;
  Zs?: number;
  ZL?: number;
}
/** Complex EO response H(f) = Phi(f) / Phi(0), Phi = int_0^L V(z) exp(j w n_g z / c) dz, with forward and reflected waves
 *  V(z) = V+ (e^{-gz} + G_L e^{-2gL} e^{gz}), V+ = Vs Z0/(Z0+Zs) / (1 - G_S G_L e^{-2gL}), g = alpha + j w nRF / c.
 *  Normalized to the DC divider Vs ZL/(ZL+Zs) times L, so H(0) = 1. Matched case: H = (1 - e^{-uL})/(uL),
 *  u = alpha + j w (nRF - ng)/c (Alferness 1982). Returns [re, im]. */
export function twResponse(f_Hz: number, p: TWParams): [number, number] {
  const L = p.L_m;
  if (f_Hz === 0) return [1, 0];
  const w = 2 * Math.PI * f_Hz;
  const fG = f_Hz / 1e9;
  const alpha = (p.alpha0_Np_per_m_sqrtGHz ?? 0) * Math.sqrt(fG) + (p.alphaD_Np_per_m_GHz ?? 0) * fG;
  const Z0 = p.Z0 ?? 50;
  const Zs = p.Zs ?? Z0;
  const ZL = p.ZL ?? Z0;
  const GL = (ZL - Z0) / (ZL + Z0);
  const GS = (Zs - Z0) / (Zs + Z0);
  const bo = (w * p.ng) / C0;
  const gr = alpha;
  const gi = (w * p.nRF) / C0;
  // complex helpers
  const cexp = (r: number, i: number): [number, number] => [Math.exp(r) * Math.cos(i), Math.exp(r) * Math.sin(i)];
  const cmul = (a: [number, number], b: [number, number]): [number, number] => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const cdiv = (a: [number, number], b: [number, number]): [number, number] => {
    const d = b[0] * b[0] + b[1] * b[1];
    return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
  };
  // forward integral F = (1 - e^{-(g - j bo)L}) / (g - j bo)
  const u: [number, number] = [gr, gi - bo];
  let F: [number, number];
  if (Math.hypot(u[0], u[1]) * L < 1e-4) {
    // series L (1 - x/2 + x^2/6 - x^3/24), x = uL (truncation < 1e-17 at |x| < 1e-4): the velocity-matched lossless
    // line (nRF = ng, alpha = 0) gives exactly L instead of 0/0
    const xr = u[0] * L;
    const xi = u[1] * L;
    const x2r = xr * xr - xi * xi;
    const x2i = 2 * xr * xi;
    const x3r = x2r * xr - x2i * xi;
    const x3i = x2r * xi + x2i * xr;
    F = [L * (1 - xr / 2 + x2r / 6 - x3r / 24), L * (-xi / 2 + x2i / 6 - x3i / 24)];
  } else {
    const eu = cexp(-u[0] * L, -u[1] * L);
    F = cdiv([1 - eu[0], -eu[1]], u);
  }
  // backward integral Bk = (e^{(g + j bo)L} - 1) / (g + j bo)
  const v: [number, number] = [gr, gi + bo];
  const ev = cexp(v[0] * L, v[1] * L);
  const Bk = cdiv([ev[0] - 1, ev[1]], v);
  const e2 = cexp(-2 * gr * L, -2 * gi * L);
  const GLe2: [number, number] = [GL * e2[0], GL * e2[1]];
  const sum = [F[0] + GLe2[0] * Bk[0] - GLe2[1] * Bk[1], F[1] + GLe2[0] * Bk[1] + GLe2[1] * Bk[0]] as [number, number];
  // V+ / Vs = Z0/(Z0+Zs) / (1 - GS GL e^{-2gL})
  const den: [number, number] = [1 - GS * GLe2[0], -GS * GLe2[1]];
  const Vp = cdiv([Z0 / (Z0 + Zs), 0], den);
  const Phi = cmul(Vp, sum);
  const norm = (L * ZL) / (ZL + Zs);
  return [Phi[0] / norm, Phi[1] / norm];
}
/** |H(f)|. */
export const twResponseMag = (f_Hz: number, p: TWParams): number => Math.hypot(...twResponse(f_Hz, p));
/** Small-signal EO S21 in dB (electrical convention, photodiode RF power): 20 log10 |H(f)|. */
export const s21EOdB = (f_Hz: number, p: TWParams): number => 20 * Math.log10(twResponseMag(f_Hz, p));
/** 3 dB electrical bandwidth for pure velocity mismatch: |sin u / u| = 1/sqrt(2) at u = 1.39156, u = pi f L |nRF - ng| / c. */
export const f3dBVelocityMismatch = (L_m: number, dn: number): number => (1.3915573782515103 * C0) / (Math.PI * L_m * Math.abs(dn));

/** Bandwidth search: first frequency where 20 log10 |H| drops below -dB (bisection on a log grid up to fmax). NaN if none. */
export function bandwidth(p: TWParams, dB = 3, fmax_Hz = 1e12): number {
  const target = -dB;
  let lo = 1e6;
  if (s21EOdB(lo, p) < target) return Number.NaN;
  let hi = lo;
  while (hi < fmax_Hz) {
    const next = hi * 1.05;
    if (s21EOdB(next, p) < target) {
      lo = hi;
      hi = next;
      for (let i = 0; i < 80; i++) {
        const m = 0.5 * (lo + hi);
        if (s21EOdB(m, p) < target) hi = m;
        else lo = m;
      }
      return 0.5 * (lo + hi);
    }
    hi = next;
  }
  return Number.NaN;
}

// ---------- PRBS (ITU-T O.150 polynomials), Fibonacci LFSR ----------
export const PRBS_TAPS: Readonly<Record<number, readonly [number, number]>> = {
  7: [7, 6],
  9: [9, 5],
  11: [11, 9],
  15: [15, 14],
  23: [23, 18],
  31: [31, 28],
};
/** PRBS-n bit sequence of the given length (period 2^n - 1); seed is the nonzero initial register (default all ones). */
export function prbs(order: number, length: number, seed?: number): Uint8Array {
  const taps = PRBS_TAPS[order];
  if (!taps) throw new RangeError(`prbs: order ${order} not one of 7, 9, 11, 15, 23, 31`);
  const [a, b] = taps;
  const mask = order === 31 ? 0x7fffffff : (1 << order) - 1;
  let reg = (seed ?? mask) & mask;
  if (reg === 0) throw new RangeError("prbs: seed must be nonzero");
  const out = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    const bit = ((reg >>> (a - 1)) ^ (reg >>> (b - 1))) & 1;
    reg = ((reg << 1) | bit) & mask;
    out[i] = bit;
  }
  return out;
}

// ---------- eye diagram ----------
export interface EyeOpts {
  bits: Uint8Array;
  baud: number;
  samplesPerBit: number;
  /** drive swing peak-to-peak (V) and Vpi (V); MZM biased at quadrature unless phi_b given */
  Vpp: number;
  Vpi: number;
  phi_b?: number;
  /** driver rise: Gaussian low-pass with this -3 dB bandwidth (Hz); 0 = ideal NRZ */
  driverBW_Hz?: number;
  /** traveling-wave electrode; omit for a lumped ideal response */
  tw?: TWParams;
  /** receiver: Gaussian low-pass -3 dB bandwidth (Hz) applied to intensity; 0 = none */
  rxBW_Hz?: number;
  /** additive Gaussian intensity noise (std, in transmission units) and PRNG seed */
  noiseStd?: number;
  seed?: number;
  /** eye histogram size: 2 unit intervals across W columns, H rows over transmission [-0.1, 1.1] */
  W?: number;
  H?: number;
}
/** Eye diagram: NRZ drive -> driver filter -> H(f) -> push-pull MZM cos^2 -> receiver filter -> noise -> 2-UI histogram.
 *  Uses one FFT over the full record (length padded to a power of two, circular). Deterministic for a given seed. */
export function eyeDiagram(o: EyeOpts): { T: Float64Array; hist: Uint32Array; W: number; H: number; dt: number } {
  const spb = o.samplesPerBit;
  const nb = o.bits.length;
  const n0 = nb * spb;
  let N = 1;
  while (N < n0) N <<= 1;
  const dt = 1 / (o.baud * spb);
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const bi = Math.floor(i / spb) % nb;
    re[i] = (o.bits[bi] ? 0.5 : -0.5) * o.Vpp;
  }
  fft(re, im);
  const gauss = (f: number, bw: number) => (bw > 0 ? Math.exp(-(Math.LN2 / 2) * (f / bw) ** 2) : 1); // |G| = 1/sqrt(2) at bw
  for (let k = 0; k < N; k++) {
    const kk = k <= N / 2 ? k : k - N;
    const f = kk / (N * dt);
    let gr = gauss(Math.abs(f), o.driverBW_Hz ?? 0);
    let gi = 0;
    if (o.tw && f !== 0) {
      const [hr, hi] = twResponse(Math.abs(f), o.tw);
      // negative frequencies take the conjugate response (real time signal)
      const hiS = f > 0 ? hi : -hi;
      const nr = gr * hr;
      gi = gr * hiS;
      gr = nr;
    }
    const xr = re[k] * gr - im[k] * gi;
    const xi = re[k] * gi + im[k] * gr;
    re[k] = xr;
    im[k] = xi;
  }
  fft(re, im, true);
  const T = new Float64Array(n0);
  const phiB = o.phi_b ?? -Math.PI / 2; // quadrature: T = cos^2(pi V/(2Vpi) - pi/4)
  for (let i = 0; i < n0; i++) T[i] = mzmTransmission(re[i], o.Vpi, phiB);
  if ((o.rxBW_Hz ?? 0) > 0) {
    const r2 = new Float64Array(N);
    const i2 = new Float64Array(N);
    for (let i = 0; i < N; i++) r2[i] = T[i % n0];
    fft(r2, i2);
    for (let k = 0; k < N; k++) {
      const kk = k <= N / 2 ? k : k - N;
      const g = gauss(Math.abs(kk / (N * dt)), o.rxBW_Hz ?? 0);
      r2[k] *= g;
      i2[k] *= g;
    }
    fft(r2, i2, true);
    for (let i = 0; i < n0; i++) T[i] = r2[i];
  }
  if ((o.noiseStd ?? 0) > 0) {
    const rng = createRng(o.seed ?? 1);
    for (let i = 0; i < n0; i++) T[i] += (o.noiseStd ?? 0) * rng.normal();
  }
  const W = o.W ?? 2 * spb;
  const Hh = o.H ?? 128;
  const hist = new Uint32Array(W * Hh);
  const lo = -0.1;
  const hi = 1.1;
  for (let i = 0; i < n0; i++) {
    const ph = (i % (2 * spb)) / (2 * spb);
    const col = Math.min(W - 1, Math.floor(ph * W));
    const row = Math.floor(((hi - T[i]) / (hi - lo)) * Hh);
    if (row >= 0 && row < Hh) hist[row * W + col]++;
  }
  return { T, hist, W, H: Hh, dt };
}

/** Vertical eye opening at sample offset j within the bit (min of ones minus max of zeros), from a transmission record. */
export function eyeOpening(T: Float64Array, bits: Uint8Array, spb: number, j: number, skipBits = 4): number {
  let minOne = Infinity;
  let maxZero = -Infinity;
  for (let b = skipBits; b < bits.length; b++) {
    const v = T[b * spb + j];
    if (bits[b]) minOne = Math.min(minOne, v);
    else maxZero = Math.max(maxZero, v);
  }
  return minOne - maxZero;
}
