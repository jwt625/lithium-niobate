// Acousto-optics: Bragg geometry and figures of merit.
//   Lambda = v / f; sin(theta_B,int) = lambda0 / (2 n Lambda); external angle by Snell at a face normal to the sound
//   wavefronts' bisector: sin(theta_B,ext) = n sin(theta_B,int) = lambda0 / (2 Lambda); diffracted light shifted by +f
//   for the order moving with the sound (momentum and energy conservation; content/chapters/03-sound/manuscript.md
//   sec. 3.6 L2).
//   Figures of merit (weis1985 Eq. 20; P): M1 = n^7 p^2/(rho v), M2 = n^6 p^2/(rho v^3), M3 = n^7 p^2/(rho v^2),
//   M4 = n^8 p^2 v/rho (SI: m^2 s/kg, s^3/kg, m s^2/kg, m^4/(s kg)).
// Diffraction efficiency is not modelled (no source formula read; C03 open-questions Q6).

export interface BraggResult {
  /** acoustic wavelength (m) */
  Lambda_m: number;
  /** internal and external Bragg angles (rad); NaN when lambda0 > 2 n Lambda (internal) or > 2 Lambda (external) */
  thetaInt_rad: number;
  thetaExt_rad: number;
  /** frequency shift of the +1 order (Hz) */
  shift_Hz: number;
  /** wavevector magnitudes (rad/m): optical inside the crystal and acoustic */
  kOpt: number;
  K: number;
}

export function bragg(lambda0_m: number, n: number, v_mps: number, f_Hz: number): BraggResult {
  const Lambda = v_mps / f_Hz;
  const si = lambda0_m / (2 * n * Lambda);
  const se = lambda0_m / (2 * Lambda);
  return {
    Lambda_m: Lambda,
    thetaInt_rad: si <= 1 ? Math.asin(si) : Number.NaN,
    thetaExt_rad: se <= 1 ? Math.asin(se) : Number.NaN,
    shift_Hz: f_Hz,
    kOpt: (2 * Math.PI * n) / lambda0_m,
    K: (2 * Math.PI) / Lambda,
  };
}

/** RF frequency at which the external Bragg angle equals theta (deflector scan law), Hz. */
export const braggFrequency = (lambda0_m: number, v_mps: number, thetaExt_rad: number): number => (2 * v_mps * Math.sin(thetaExt_rad)) / lambda0_m;

export interface AOFigures {
  M1: number;
  M2: number;
  M3: number;
  M4: number;
}
/** Figures of merit (weis1985 Eq. 20) from index n, effective photoelastic coefficient p, density (kg/m^3), velocity (m/s). */
export function aoFiguresOfMerit(n: number, p: number, rho: number, v: number): AOFigures {
  const p2 = p * p;
  return {
    M1: (n ** 7 * p2) / (rho * v),
    M2: (n ** 6 * p2) / (rho * v ** 3),
    M3: (n ** 7 * p2) / (rho * v ** 2),
    M4: (n ** 8 * p2 * v) / rho,
  };
}
/** Effective p implied by a given M2 (inverse of the M2 definition). */
export const pFromM2 = (M2: number, n: number, rho: number, v: number): number => Math.sqrt((M2 * rho * v ** 3) / n ** 6);
