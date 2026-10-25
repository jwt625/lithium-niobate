// Ring resonators: all-pass and add-drop transmission, FSR, finesse, Q, EO tuning, and the Kerr-free EO comb.
// Notation (Bogaerts et al., Laser Photon. Rev. 6, 47 (2012)): r = self-coupling field coefficient, a = single-pass
// field transmission (a^2 = exp(-alpha L)), phi = round-trip phase = 2 pi n_eff L / lambda.
import { C0 } from "./constants.ts";
import { fft } from "./fft.ts";

/** All-pass power transmission T = (a^2 - 2 r a cos phi + r^2) / (1 - 2 a r cos phi + (r a)^2). */
export function allPass(phi: number, r: number, a: number): number {
  const c = Math.cos(phi);
  return (a * a - 2 * r * a * c + r * r) / (1 - 2 * a * r * c + (r * a) ** 2);
}
/** All-pass complex field transmission t = (r - a e^{i phi}) / (1 - r a e^{i phi}) (same convention). Returns [re, im]. */
export function allPassField(phi: number, r: number, a: number): [number, number] {
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  const nr = r - a * c;
  const ni = -a * s;
  const dr = 1 - r * a * c;
  const di = -r * a * s;
  const den = dr * dr + di * di;
  return [(nr * dr + ni * di) / den, (ni * dr - nr * di) / den];
}
/** Add-drop through and drop power transmissions (Bogaerts 2012): r1, r2 = input and drop self-coupling. */
export function addDrop(phi: number, r1: number, r2: number, a: number): { through: number; drop: number } {
  const c = Math.cos(phi);
  const den = 1 - 2 * r1 * r2 * a * c + (r1 * r2 * a) ** 2;
  return {
    through: (r2 * r2 * a * a - 2 * r1 * r2 * a * c + r1 * r1) / den,
    drop: ((1 - r1 * r1) * (1 - r2 * r2) * a) / den,
  };
}

/** Round-trip phase for effective index, circumference (um) and wavelength (um). */
export const roundTripPhase = (neff: number, L_um: number, lam_um: number): number => (2 * Math.PI * neff * L_um) / lam_um;
/** Single-pass field transmission a from power loss alpha (1/m) and circumference L (m): a = exp(-alpha L / 2). */
export const singlePassA = (alpha_per_m: number, L_m: number): number => Math.exp((-alpha_per_m * L_m) / 2);
/** FSR in wavelength (same unit as lambda^2 / L): lambda^2 / (n_g L). */
export const fsrWavelength = (lam_um: number, ng: number, L_um: number): number => (lam_um * lam_um) / (ng * L_um);
/** FSR in frequency (Hz): c / (n_g L). */
export const fsrFrequency = (ng: number, L_m: number): number => C0 / (ng * L_m);

/** All-pass FWHM in round-trip phase (rad), exact for the Airy form: T = 1 - (1 - a^2)(1 - r^2)/D(phi) and the width is
 *  where D doubles (half depth relative to unity): cos(phi_h) = 1 - (1 - ra)^2 / (2 ra). */
export function fwhmPhase(r: number, a: number): number {
  const ra = r * a;
  return 2 * Math.acos(1 - (1 - ra) ** 2 / (2 * ra));
}
/** Finesse = FSR / FWHM (exact phase form). */
export const finesse = (r: number, a: number): number => (2 * Math.PI) / fwhmPhase(r, a);
/** High-finesse approximation F ~ pi sqrt(ra) / (1 - ra) (Bogaerts 2012). */
export const finesseApprox = (r: number, a: number): number => (Math.PI * Math.sqrt(r * a)) / (1 - r * a);
/** Loaded Q = lambda / FWHM_lambda, with FWHM_lambda = FWHM_phase * lambda^2 / (2 pi n_g L). */
export function loadedQ(lam_um: number, ng: number, L_um: number, r: number, a: number): number {
  return (2 * Math.PI * ng * L_um) / (lam_um * fwhmPhase(r, a));
}
/** Intrinsic Q from single-pass a: Q_i = 2 pi n_g L / (lambda (-2 ln a)) (alpha L = -2 ln a). */
export const intrinsicQ = (lam_um: number, ng: number, L_um: number, a: number): number => (2 * Math.PI * ng * L_um) / (lam_um * -2 * Math.log(a));
/** Coupling (external) Q from r: Q_c = 2 pi n_g L / (lambda (-2 ln r)). In the high-finesse limit 1/Q_L = 1/Q_i + 1/Q_c. */
export const couplingQ = (lam_um: number, ng: number, L_um: number, r: number): number => (2 * Math.PI * ng * L_um) / (lam_um * -2 * Math.log(r));
/** Resonance shift for an effective-index change: d lambda = lambda dn_eff / n_g. */
export const eoShift = (lam_um: number, dneff: number, ng: number): number => (lam_um * dneff) / ng;

// =====================================================================================
// Kerr-free EO comb: ring with a lumped phase modulator driven at exactly one FSR, zero dispersion.
// Each round trip the circulating light sees the same modulation phase, so the steady-state output at fast time t is the
// geometric series  t(t) = (r - a e^{i phi(t)}) / (1 - r a e^{i phi(t)}),  phi(t) = phi0 + beta cos(Omega t)
// (beta = round-trip phase-modulation index). Derived from the round-trip recursion; the same model underlies the
// resonant EO comb generators of Kourogi et al., IEEE JQE 29, 2693 (1993) and Zhang et al., Nature 568, 373 (2019).
// Comb lines are the Fourier coefficients of t(t) over one modulation period.
// =====================================================================================

/** EO comb line powers (through port, normalized to input power) for k = -K..K. Uses an N-point FFT (N power of 2). */
export function eoCombThrough(p: { r: number; a: number; beta: number; phi0?: number; N?: number; K?: number }): { k: Int32Array; P: Float64Array } {
  const N = p.N ?? 4096;
  const K = p.K ?? 64;
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  const phi0 = p.phi0 ?? 0;
  for (let n = 0; n < N; n++) {
    const [tr, ti] = allPassField(phi0 + p.beta * Math.cos((2 * Math.PI * n) / N), p.r, p.a);
    re[n] = tr;
    im[n] = ti;
  }
  fft(re, im);
  const k = new Int32Array(2 * K + 1);
  const P = new Float64Array(2 * K + 1);
  for (let j = -K; j <= K; j++) {
    const idx = (j + N) % N;
    k[j + K] = j;
    P[j + K] = (re[idx] ** 2 + im[idx] ** 2) / (N * N);
  }
  return { k, P };
}

/** Drop-port EO comb (add-drop ring, r1 input, r2 drop): field t_d = -sqrt((1-r1^2)(1-r2^2) a) e^{i phi/2} / (1 - r1 r2 a e^{i phi}). */
export function eoCombDrop(p: { r1: number; r2: number; a: number; beta: number; phi0?: number; N?: number; K?: number }): { k: Int32Array; P: Float64Array } {
  const N = p.N ?? 4096;
  const K = p.K ?? 64;
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  const phi0 = p.phi0 ?? 0;
  const amp = Math.sqrt((1 - p.r1 ** 2) * (1 - p.r2 ** 2) * p.a);
  const q = p.r1 * p.r2 * p.a;
  for (let n = 0; n < N; n++) {
    const phi = phi0 + p.beta * Math.cos((2 * Math.PI * n) / N);
    const nr = -amp * Math.cos(phi / 2);
    const ni = -amp * Math.sin(phi / 2);
    const dr = 1 - q * Math.cos(phi);
    const di = -q * Math.sin(phi);
    const den = dr * dr + di * di;
    re[n] = (nr * dr + ni * di) / den;
    im[n] = (ni * dr - nr * di) / den;
  }
  fft(re, im);
  const k = new Int32Array(2 * K + 1);
  const P = new Float64Array(2 * K + 1);
  for (let j = -K; j <= K; j++) {
    const idx = (j + N) % N;
    k[j + K] = j;
    P[j + K] = (re[idx] ** 2 + im[idx] ** 2) / (N * N);
  }
  return { k, P };
}

/** Steady-state coupled-mode (sideband) EO comb with optional dispersion (Buscaino et al., JLT 38, 1400 (2020) form):
 *  0 = (i Delta_k - kappa/2) a_k + i (beta / (2 T_rt)) (a_{k-1} + a_{k+1}) + delta_k0 sqrt(kappa_ex) s,
 *  Delta_k = Delta_0 - (D2/2) k^2 (rad/s), output line k: delta_k0 s - sqrt(kappa_ex) a_k. Solved as a tridiagonal system
 *  over k = -K..K (Thomas algorithm, complex). Returns line powers normalized to |s|^2.
 *  High-finesse mapping to the round-trip model: kappa_ex = (1 - r^2)/T_rt, kappa_0 = (1 - a^2)/T_rt. */
export function eoCombCMT(p: {
  kappaEx_per_s: number;
  kappa0_per_s: number;
  beta: number;
  Trt_s: number;
  Delta0_rad_per_s?: number;
  D2_rad_per_s?: number;
  K?: number;
}): { k: Int32Array; P: Float64Array } {
  const K = p.K ?? 64;
  const n = 2 * K + 1;
  const kap = p.kappaEx_per_s + p.kappa0_per_s;
  const g = p.beta / (2 * p.Trt_s);
  // diag d_k = -kap/2 + i Delta_k ; off-diagonal = i g ; rhs b_0 = -sqrt(kex)
  const dr = new Float64Array(n);
  const di = new Float64Array(n);
  const br = new Float64Array(n);
  const bi = new Float64Array(n);
  for (let j = 0; j < n; j++) {
    const kk = j - K;
    dr[j] = -kap / 2;
    di[j] = (p.Delta0_rad_per_s ?? 0) - 0.5 * (p.D2_rad_per_s ?? 0) * kk * kk;
  }
  br[K] = -Math.sqrt(p.kappaEx_per_s);
  // Thomas algorithm with constant off-diagonals c = a = i g
  const cr = 0;
  const ci = g;
  const cpr = new Float64Array(n);
  const cpi = new Float64Array(n);
  const dpr = new Float64Array(n);
  const dpi = new Float64Array(n);
  const cdiv = (ar: number, ai: number, xr: number, xi: number): [number, number] => {
    const den = xr * xr + xi * xi;
    return [(ar * xr + ai * xi) / den, (ai * xr - ar * xi) / den];
  };
  let [t0r, t0i] = cdiv(cr, ci, dr[0], di[0]);
  cpr[0] = t0r;
  cpi[0] = t0i;
  [t0r, t0i] = cdiv(br[0], bi[0], dr[0], di[0]);
  dpr[0] = t0r;
  dpi[0] = t0i;
  for (let j = 1; j < n; j++) {
    // m = d_j - a * c'_{j-1}
    const mr = dr[j] - (cr * cpr[j - 1] - ci * cpi[j - 1]);
    const mi = di[j] - (cr * cpi[j - 1] + ci * cpr[j - 1]);
    [t0r, t0i] = cdiv(cr, ci, mr, mi);
    cpr[j] = t0r;
    cpi[j] = t0i;
    const xr = br[j] - (cr * dpr[j - 1] - ci * dpi[j - 1]);
    const xi = bi[j] - (cr * dpi[j - 1] + ci * dpr[j - 1]);
    [t0r, t0i] = cdiv(xr, xi, mr, mi);
    dpr[j] = t0r;
    dpi[j] = t0i;
  }
  const xr = new Float64Array(n);
  const xi = new Float64Array(n);
  xr[n - 1] = dpr[n - 1];
  xi[n - 1] = dpi[n - 1];
  for (let j = n - 2; j >= 0; j--) {
    xr[j] = dpr[j] - (cpr[j] * xr[j + 1] - cpi[j] * xi[j + 1]);
    xi[j] = dpi[j] - (cpr[j] * xi[j + 1] + cpi[j] * xr[j + 1]);
  }
  const sk = Math.sqrt(p.kappaEx_per_s);
  const k = new Int32Array(n);
  const P = new Float64Array(n);
  for (let j = 0; j < n; j++) {
    k[j] = j - K;
    const or = (j === K ? 1 : 0) - sk * xr[j];
    const oi = -sk * xi[j];
    P[j] = or * or + oi * oi;
  }
  return { k, P };
}
