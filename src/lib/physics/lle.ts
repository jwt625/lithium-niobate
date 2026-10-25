// Lugiato-Lefever equation (manuscript 02-light eq. 2.17), normalized:
//   d psi/dt = -(1 + i zeta) psi + i |psi|^2 psi + i (d2/2) d^2 psi/d theta^2 + f
// t in units of 2/kappa, zeta = 2 (omega_0 - omega_p)/kappa, d2 = 2 D2/kappa (D2 from omega_mu = omega_0 + D1 mu + D2 mu^2/2),
// psi = sqrt(2 g0 / kappa) a (|a|^2 = intracavity photons), f = sqrt(8 g0 kappa_ex P_in / (kappa^3 hbar omega_0)).
// Normalization as in Herr et al., Nat. Photon. 8, 145 (2014) (Methods) and Chembo and Menyuk, PRA 87, 053852 (2013);
// g0 from the waveguide gamma: g0 = hbar omega_0 gamma v_g FSR (Kerr shift per photon; derived: per-round-trip phase
// gamma P L over T_R = 1/FSR, with N = P / (hbar omega_0 FSR)).
// Solver: Strang split-step Fourier on N points (fft.ts); linear part and pump integrated exactly in the mode basis,
// Kerr part as the exact phase rotation exp(i |psi|^2 dt). All physical defaults are template (figures.md F2-12).
import { HBAR, C0 } from "./constants.ts";
import { fft } from "./fft.ts";
import { createRng } from "./prng.ts";

export interface LLEParams {
  zeta: number;
  f: number;
  d2: number;
}

/** Physical -> normalized parameters. Q is the loaded Q, etaC = kappa_ex / kappa, D2 in rad/s, gamma in 1/(W m),
 *  detuning (omega_0 - omega_p)/(2 pi) in Hz (optional). */
export function lleNormalize(p: { lam_um: number; ng: number; FSR_Hz: number; Q: number; etaC: number; D2_rad_per_s: number; gamma_per_W_m: number; Pin_W: number; detuning_Hz?: number }): {
  kappa: number;
  kappa_ex: number;
  g0: number;
  f: number;
  d2: number;
  zeta: number;
  timeUnit_s: number;
  /** |psi|^2 = photonsPerPsi2^-1 |a|^2: intracavity photons for |psi|^2 = 1 */
  photonsPerPsi2: number;
  /** pump power (W) for f = 1 */
  Pin_f1_W: number;
} {
  const w0 = (2 * Math.PI * C0) / (p.lam_um * 1e-6);
  const kappa = w0 / p.Q;
  const kex = p.etaC * kappa;
  const g0 = HBAR * w0 * p.gamma_per_W_m * (C0 / p.ng) * p.FSR_Hz;
  const f = Math.sqrt((8 * g0 * kex * p.Pin_W) / (kappa ** 3 * HBAR * w0));
  return {
    kappa,
    kappa_ex: kex,
    g0,
    f,
    d2: (2 * p.D2_rad_per_s) / kappa,
    zeta: p.detuning_Hz === undefined ? Number.NaN : (2 * 2 * Math.PI * p.detuning_Hz) / kappa,
    timeUnit_s: 2 / kappa,
    photonsPerPsi2: kappa / (2 * g0),
    Pin_f1_W: (kappa ** 3 * HBAR * w0) / (8 * g0 * kex),
  };
}

/** Homogeneous steady states: real roots rho = |psi|^2 (ascending) of f^2 = rho ((zeta - rho)^2 + 1). One or three roots. */
export function lleHomogeneous(zeta: number, f: number): number[] {
  // rho^3 - 2 zeta rho^2 + (zeta^2 + 1) rho - f^2 = 0, Cardano / trigonometric
  const a = -2 * zeta, b = zeta * zeta + 1, c = -f * f;
  const Q = (a * a - 3 * b) / 9;
  const R = (2 * a ** 3 - 9 * a * b + 27 * c) / 54;
  const out: number[] = [];
  if (R * R < Q ** 3) {
    const th = Math.acos(R / Math.sqrt(Q ** 3));
    for (const k of [0, 1, 2]) out.push(-2 * Math.sqrt(Q) * Math.cos((th + 2 * Math.PI * k) / 3) - a / 3);
  } else {
    const A = -Math.sign(R) * Math.cbrt(Math.abs(R) + Math.sqrt(R * R - Q ** 3));
    const B = A === 0 ? 0 : Q / A;
    out.push(A + B - a / 3);
  }
  // polish with Newton and sort
  return out
    .map((r) => {
      let x = r;
      for (let i = 0; i < 3; i++) {
        const F = x * ((zeta - x) ** 2 + 1) - f * f;
        const dF = 3 * x * x - 4 * zeta * x + zeta * zeta + 1;
        if (dF !== 0) x -= F / dF;
      }
      return x;
    })
    .sort((u, v) => u - v);
}
/** Homogeneous field psi = f / (1 + i (zeta - rho)) for a root rho. */
export function lleHomogeneousField(zeta: number, f: number, rho: number): [number, number] {
  const d = 1 + (zeta - rho) ** 2;
  return [f / d, (-f * (zeta - rho)) / d];
}
/** Bistability: for zeta > sqrt(3) the homogeneous response is three-valued for f^2 between the turning points
 *  rho_pm = (2 zeta -+ sqrt(zeta^2 - 3)) / 3. Returns [f_lo, f_hi] (pump amplitudes) or null for zeta <= sqrt(3). */
export function lleBistableRange(zeta: number): [number, number] | null {
  if (zeta <= Math.sqrt(3)) return null;
  const s = Math.sqrt(zeta * zeta - 3);
  const rhoUp = (2 * zeta + s) / 3; // upper turning point -> lower f
  const rhoDn = (2 * zeta - s) / 3;
  const F = (r: number) => Math.sqrt(r * ((zeta - r) ** 2 + 1));
  return [F(rhoUp), F(rhoDn)];
}

export interface LLEState {
  N: number;
  re: Float64Array;
  im: Float64Array;
  t: number;
  /** scratch */
  sr: Float64Array;
  si: Float64Array;
}

/** New state on N points (power of two) over theta in [-pi, pi), filled with a constant psi0 plus seeded complex noise. */
export function lleCreate(N: number, psi0: [number, number] = [0, 0], noise = 0, seed = 1): LLEState {
  const rng = createRng(seed);
  const re = new Float64Array(N).fill(psi0[0]);
  const im = new Float64Array(N).fill(psi0[1]);
  if (noise > 0)
    for (let n = 0; n < N; n++) {
      re[n] += noise * rng.normal();
      im[n] += noise * rng.normal();
    }
  return { N, re, im, t: 0, sr: new Float64Array(N), si: new Float64Array(N) };
}

/** Theta grid value at index n: theta_n = -pi + 2 pi n / N. */
export const lleTheta = (N: number, n: number): number => -Math.PI + (2 * Math.PI * n) / N;

/** Single-soliton ansatz (Herr 2014): psi = psi_cw + sqrt(2 zeta) e^{i phi0} sech(sqrt(2 zeta / d2) theta), cos phi0 =
 *  sqrt(8 zeta) / (pi f), psi_cw the lower homogeneous root. Throws when sqrt(8 zeta) > pi f (no soliton branch). */
export function lleSolitonAnsatz(N: number, p: LLEParams): LLEState {
  const c = Math.sqrt(8 * p.zeta) / (Math.PI * p.f);
  if (!(c <= 1)) throw new RangeError("lleSolitonAnsatz: sqrt(8 zeta) > pi f, outside the soliton branch");
  const phi0 = Math.acos(c);
  const rho = lleHomogeneous(p.zeta, p.f)[0];
  const [cr, ci] = lleHomogeneousField(p.zeta, p.f, rho);
  const A = Math.sqrt(2 * p.zeta);
  const k = Math.sqrt((2 * p.zeta) / p.d2);
  const s = lleCreate(N, [0, 0]);
  for (let n = 0; n < N; n++) {
    const sech = 1 / Math.cosh(k * lleTheta(N, n));
    s.re[n] = cr + A * Math.cos(phi0) * sech;
    s.im[n] = ci + A * Math.sin(phi0) * sech;
  }
  return s;
}

/** Advance nSteps of size dt (Strang: Kerr dt/2, linear + pump dt, Kerr dt/2). In place. */
export function lleStep(s: LLEState, p: LLEParams, dt: number, nSteps = 1): void {
  const { N, re, im, sr, si } = s;
  // precompute linear factors per mode index m (FFT order): L_mu = -(1 + i zeta) - i (d2/2) mu^2
  for (let step = 0; step < nSteps; step++) {
    kerr(re, im, dt / 2);
    sr.set(re);
    si.set(im);
    fft(sr, si);
    for (let m = 0; m < N; m++) {
      const mu = m < N / 2 ? m : m - N;
      const Lr = -1;
      const Li = -p.zeta - 0.5 * p.d2 * mu * mu;
      const e = Math.exp(Lr * dt);
      const er = e * Math.cos(Li * dt);
      const ei = e * Math.sin(Li * dt);
      const xr = sr[m] * er - si[m] * ei;
      const xi = sr[m] * ei + si[m] * er;
      sr[m] = xr;
      si[m] = xi;
      if (m === 0) {
        // pump: d psi_0/dt = L psi_0 + f  ->  + f (e^{L dt} - 1)/L, in FFT units (sum over N points) the pump mode is N f
        const nr = er - 1;
        const ni = ei;
        const den = Lr * Lr + Li * Li;
        const qr = (nr * Lr + ni * Li) / den;
        const qi = (ni * Lr - nr * Li) / den;
        sr[0] += N * p.f * qr;
        si[0] += N * p.f * qi;
      }
    }
    fft(sr, si, true);
    re.set(sr);
    im.set(si);
    kerr(re, im, dt / 2);
    s.t += dt;
  }
}
function kerr(re: Float64Array, im: Float64Array, h: number): void {
  for (let n = 0; n < re.length; n++) {
    const ph = (re[n] * re[n] + im[n] * im[n]) * h;
    const c = Math.cos(ph);
    const sn = Math.sin(ph);
    const x = re[n] * c - im[n] * sn;
    im[n] = re[n] * sn + im[n] * c;
    re[n] = x;
  }
}

/** Mean intracavity power <|psi|^2> and mean field <psi>. */
export function lleMeans(s: LLEState): { power: number; mre: number; mim: number } {
  let p = 0, a = 0, b = 0;
  for (let n = 0; n < s.N; n++) {
    p += s.re[n] ** 2 + s.im[n] ** 2;
    a += s.re[n];
    b += s.im[n];
  }
  return { power: p / s.N, mre: a / s.N, mim: b / s.N };
}

/** Mode powers |psi_mu|^2 (mu = -N/2 .. N/2 - 1), normalized so that sum = <|psi|^2>. */
export function lleSpectrum(s: LLEState): { mu: Int32Array; P: Float64Array } {
  const sr = Float64Array.from(s.re);
  const si = Float64Array.from(s.im);
  fft(sr, si);
  const N = s.N;
  const mu = new Int32Array(N);
  const P = new Float64Array(N);
  for (let j = 0; j < N; j++) {
    const m = j - N / 2;
    const idx = (m + N) % N;
    mu[j] = m;
    P[j] = (sr[idx] ** 2 + si[idx] ** 2) / (N * N);
  }
  return { mu, P };
}

/** Number of pulses: local maxima of |psi|^2 above floor + 0.5 (max - floor), floor = median |psi|^2 (periodic grid). */
export function lleCountSolitons(s: LLEState): number {
  const N = s.N;
  const I = new Float64Array(N);
  for (let n = 0; n < N; n++) I[n] = s.re[n] ** 2 + s.im[n] ** 2;
  const sorted = Float64Array.from(I).sort();
  const floor = sorted[N >> 1];
  const max = sorted[N - 1];
  if (max < 2 * floor + 1) return 0;
  const thr = floor + 0.5 * (max - floor);
  let c = 0;
  for (let n = 0; n < N; n++) {
    const a = I[(n - 1 + N) % N], b = I[(n + 1) % N];
    if (I[n] > thr && I[n] >= a && I[n] > b) c++;
  }
  return c;
}

/** Linear detuning scan from zeta0 to zeta1 over nSteps steps of dt; records <|psi|^2> every `every` steps. In place. */
export function lleScan(s: LLEState, p: { f: number; d2: number }, zeta0: number, zeta1: number, nSteps: number, dt: number, every = 10): { zeta: Float64Array; power: Float64Array } {
  const M = Math.floor(nSteps / every);
  const z = new Float64Array(M);
  const pw = new Float64Array(M);
  for (let j = 0; j < M; j++) {
    const zeta = zeta0 + ((zeta1 - zeta0) * (j + 0.5)) / M;
    lleStep(s, { zeta, f: p.f, d2: p.d2 }, dt, every);
    z[j] = zeta;
    pw[j] = lleMeans(s).power;
  }
  return { zeta: z, power: pw };
}

/** Energy balance d<|psi|^2>/dt = -2 <|psi|^2> + 2 f Re<psi> (dispersion and Kerr conserve energy). Returns the relative
 *  residual (relative to the loss term 2 <|psi|^2> dt) of one step of size dt, trapezoid rule (diagnostic for the per-step check). */
export function lleEnergyResidual(s: LLEState, p: LLEParams, dt: number): number {
  const a = lleMeans(s);
  lleStep(s, p, dt, 1);
  const b = lleMeans(s);
  const rate = 0.5 * (-2 * a.power + 2 * p.f * a.mre + (-2 * b.power + 2 * p.f * b.mre));
  const dE = b.power - a.power;
  return Math.abs(dE - rate * dt) / (2 * a.power * dt);
}
