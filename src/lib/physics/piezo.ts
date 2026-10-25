// Piezoelectric constitutive forms, Voigt factor bookkeeping, longitudinal response, and bulk-wave group velocity.
//
// Forms and relations: IEEE Std 176-1987 Eqs. 37-43 (compressed matrix notation, engineering shear strain):
//   c^E s^E = 1, d = e s^E, eps^T = eps^S + d e^t, beta = eps^-1, g = beta^T d, h = beta^S e,
//   c^D = c^E + e^t h, s^D = s^E - d^t g.
// Voigt factors (ieee176 Eqs. 22, 25, 44-45; content/chapters/03-sound/manuscript.md sec. 3.1 L3):
//   c, e, h, p (strain-optic), r carry none; s carries f_p f_q; d and g carry f_q; pi carries f_q (tensors.ts),
//   with f = 1 for Voigt index 0..2 and 2 for 3..5.
// Group velocity: Hellmann-Feynman derivative of rho v^2 = u . Gamma(n) . u with the piezoelectrically stiffened
//   Christoffel matrix (ieee176 Eq. 47), Gamma homogeneous of degree 2 in n, so v_g = grad_n(u Gamma u) / (2 rho v).
// Inputs: c in GPa (Voigt 6x6), e in C/m^2 (3x6), eps^S relative (3x3). Outputs in SI (Pa, 1/Pa, C/N, V m/N, V/m)
// and relative permittivity.
import { EPS0 } from "./constants.ts";
import { invert } from "./linalg.ts";
import type { Mat3, Vec3 } from "./linalg.ts";
import { christoffel } from "./acoustics.ts";
import type { AcousticMaterial } from "./acoustics.ts";
import { VOIGT_PAIRS } from "./tensors.ts";
import type { Matrix, Tensor } from "./tensors.ts";

const matMul = (A: Matrix, B: Matrix): Matrix => A.map((r) => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
const transpose = (A: Matrix): Matrix => A[0].map((_, j) => A.map((r) => r[j]));
const add = (A: Matrix, B: Matrix, sB = 1): Matrix => A.map((r, i) => r.map((v, j) => v + sB * B[i][j]));
const scale = (A: Matrix, s: number): Matrix => A.map((r) => r.map((v) => v * s));

export interface PiezoForms {
  /** Voigt 6x6, Pa */
  cE: Matrix;
  cD: Matrix;
  /** Voigt 6x6, 1/Pa (factors 1, 2, 4) */
  sE: Matrix;
  sD: Matrix;
  /** 3x6: e (C/m^2), d (C/N, factor 2 on shear columns), g (V m/N, factor 2 on shear columns), h (V/m) */
  e: Matrix;
  d: Matrix;
  g: Matrix;
  h: Matrix;
  /** relative permittivities (3x3) and impermeabilities beta in units of 1/eps0 (3x3) */
  epsS: Matrix;
  epsT: Matrix;
  betaS: Matrix;
  betaT: Matrix;
}

/** All four piezoelectric forms from the stress-charge set (IEEE 176 Eq. 43). */
export function convertForms(p: { cE_GPa: Matrix; e_Cm2: Matrix; epsS_rel: Matrix }): PiezoForms {
  const cE = scale(p.cE_GPa, 1e9);
  const e = p.e_Cm2.map((r) => r.slice());
  const epsS = p.epsS_rel.map((r) => r.slice());
  const sE = invert(cE);
  const d = matMul(e, sE);
  const epsT = add(epsS, scale(matMul(d, transpose(e)), 1 / EPS0));
  const betaS = invert(epsS);
  const betaT = invert(epsT);
  const g = scale(matMul(betaT, d), 1 / EPS0);
  const h = scale(matMul(betaS, e), 1 / EPS0);
  const cD = add(cE, matMul(transpose(e), h));
  const sD = add(sE, matMul(transpose(d), g), -1);
  return { cE, cD, sE, sD, e, d, g, h, epsS, epsT, betaS, betaT };
}

/** Hydrostatic strain coefficient d_h = d31 + d32 + d33 (C/N), = 2 d31 + d33 for 3m. */
export const hydrostaticD = (d: Matrix): number => d[2][0] + d[2][1] + d[2][2];

export type VoigtKind = "c" | "s" | "e" | "d" | "g" | "h" | "p" | "pi" | "r";
const fJ = (J: number): number => (J < 3 ? 1 : 2);

/** Factor between a Voigt cell and the full-tensor component it stands for (0-based indices).
 *  Rank 4 (c, s, p, pi): p, q are Voigt rows and columns. Rank 3 (e, d, g, h): p = field index i (0..2), q = Voigt column.
 *  r: p = Voigt row, q = field index. Returns M_pq / T_full. */
export function voigtFactor(kind: VoigtKind, p: number, q: number): number {
  switch (kind) {
    case "s":
      return fJ(p) * fJ(q);
    case "d":
    case "g":
    case "pi":
      return fJ(q);
    default:
      return 1;
  }
}

/** Full-tensor index tuples (0-based) represented by one Voigt cell, for the expansion view in F3.2. */
export function voigtCellComponents(kind: VoigtKind, p: number, q: number): number[][] {
  const pairsOf = (J: number): number[][] => {
    const [a, b] = VOIGT_PAIRS[J];
    return a === b ? [[a, b]] : [
      [a, b],
      [b, a],
    ];
  };
  if (kind === "e" || kind === "d" || kind === "g" || kind === "h") return pairsOf(q).map(([j, k]) => [p, j, k]);
  if (kind === "r") return pairsOf(p).map(([i, j]) => [i, j, q]);
  const out: number[][] = [];
  for (const [i, j] of pairsOf(p)) for (const [k, l] of pairsOf(q)) out.push([i, j, k, l]);
  return out;
}

/** Longitudinal coefficient along unit direction n: T_ijk n_i n_j n_k (full rank-3 tensor, e.g. strain-charge d). */
export function longitudinal(dFull: Tensor, nIn: Vec3): number {
  const m = Math.hypot(nIn[0], nIn[1], nIn[2]);
  const n = [nIn[0] / m, nIn[1] / m, nIn[2] / m];
  let s = 0;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) s += dFull[i * 9 + j * 3 + k] * n[i] * n[j] * n[k];
  return s;
}

/** Unit vector from polar angle theta (from +Z) and azimuth phi (from +X toward +Y), radians. */
export const dirFromAngles = (theta: number, phi: number): Vec3 => [Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta)];

/** Extremum of |T_ijk n_i n_j n_k| over the sphere: grid search (step deg) then golden-free local refinement by
 *  shrinking pattern search to 1e-6 rad. Returns the signed value and angles (rad). */
export function longitudinalMaxAbs(dFull: Tensor, step_deg = 1): { value: number; theta: number; phi: number } {
  const f = (t: number, p: number) => Math.abs(longitudinal(dFull, dirFromAngles(t, p)));
  let best = { v: -1, t: 0, p: 0 };
  const h = (step_deg * Math.PI) / 180;
  for (let t = 0; t <= Math.PI + 1e-12; t += h)
    for (let p = 0; p < 2 * Math.PI; p += h) {
      const v = f(t, p);
      if (v > best.v) best = { v, t, p };
    }
  let s = h;
  while (s > 1e-7) {
    let moved = false;
    for (const [dt, dp] of [
      [s, 0],
      [-s, 0],
      [0, s],
      [0, -s],
    ]) {
      const t = best.t + dt;
      const p = best.p + dp;
      const v = f(t, p);
      if (v > best.v) {
        best = { v, t, p };
        moved = true;
      }
    }
    if (!moved) s /= 2;
  }
  let theta = best.t;
  let phi = best.p;
  if (theta < 0) {
    theta = -theta;
    phi += Math.PI;
  }
  // T_ijk n_i n_j n_k is odd in n: the extremum sits at n and -n with opposite signs; return the negative one.
  if (longitudinal(dFull, dirFromAngles(theta, phi)) > 0) {
    theta = Math.PI - theta;
    phi += Math.PI;
  }
  phi = ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return { value: longitudinal(dFull, dirFromAngles(theta, phi)), theta, phi };
}

export interface GroupVelocityResult {
  /** phase velocities (m/s), descending, as christoffel() */
  v: Vec3;
  /** group (energy) velocity vectors (m/s) per mode */
  vg: [Vec3, Vec3, Vec3];
  /** power-flow angle between v_g and n (rad) per mode */
  pfa: Vec3;
  /** polarizations as christoffel() */
  u: Mat3;
}

/** Group velocity and power-flow angle of the three bulk modes along n (stiffened if piezo = true).
 *  Exact Hellmann-Feynman gradient; degenerate directions (e.g. shear along Z) return the gradient for the
 *  eigenvector the solver picked and are not unique there. */
export function groupVelocity(m: AcousticMaterial, nIn: Vec3, piezo = true): GroupVelocityResult {
  const nn = Math.hypot(nIn[0], nIn[1], nIn[2]);
  const n: Vec3 = [nIn[0] / nn, nIn[1] / nn, nIn[2] / nn];
  const sol = christoffel(m, n, piezo);
  const c = m.c;
  const e = m.e;
  const vg: Vec3[] = [];
  const pfa: number[] = [];
  for (let q = 0; q < 3; q++) {
    const u = sol.u[q];
    const grad = [0, 0, 0];
    // elastic part: d/dn_m (u_i c_ijkl n_j n_k u_l) = u_i u_l (c_imkl n_k + c_ijml n_j)
    for (let mm = 0; mm < 3; mm++) {
      let s = 0;
      for (let i = 0; i < 3; i++)
        for (let l = 0; l < 3; l++) {
          const uu = u[i] * u[l];
          for (let k = 0; k < 3; k++) s += uu * (c[i * 27 + mm * 9 + k * 3 + l] + c[i * 27 + k * 9 + mm * 3 + l]) * n[k];
        }
      grad[mm] = s;
    }
    if (piezo) {
      // a = u_i e_kij n_k n_j, b = n eps n, term a^2/b
      let a = 0;
      for (let i = 0; i < 3; i++) for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) a += u[i] * e[k * 9 + i * 3 + j] * n[k] * n[j];
      let b = 0;
      for (let k = 0; k < 3; k++) for (let l = 0; l < 3; l++) b += n[k] * m.eps[k][l] * n[l];
      for (let mm = 0; mm < 3; mm++) {
        let da = 0;
        for (let i = 0; i < 3; i++)
          for (let j = 0; j < 3; j++) da += u[i] * (e[mm * 9 + i * 3 + j] * n[j] + e[j * 9 + i * 3 + mm] * n[j]);
        let db = 0;
        for (let l = 0; l < 3; l++) db += 2 * m.eps[mm][l] * n[l];
        grad[mm] += (2 * a * da) / b - (a * a * db) / (b * b);
      }
    }
    const v = sol.v[q];
    const g: Vec3 = [grad[0] / (2 * m.rho * v), grad[1] / (2 * m.rho * v), grad[2] / (2 * m.rho * v)];
    vg.push(g);
    const gm = Math.hypot(g[0], g[1], g[2]);
    pfa.push(Math.acos(Math.max(-1, Math.min(1, (g[0] * n[0] + g[1] * n[1] + g[2] * n[2]) / gm))));
  }
  return { v: sol.v, vg: vg as [Vec3, Vec3, Vec3], pfa: pfa as Vec3, u: sol.u };
}

/** Quasistatic material coupling factors (IEEE 176 Eqs. 124-125, Table 10): k_t = e33/sqrt(c33^D eps33^S),
 *  k15 = e15/sqrt(c55^D eps11^S), k33 = d33/sqrt(s33^E eps33^T), k31 = d31/sqrt(s11^E eps33^T), and the longitudinal
 *  factor along Y, d22/sqrt(s22^E eps22^T) (content/chapters/03-sound/manuscript.md sec. 3.1). */
export function couplingFactors(f: PiezoForms): { kt: number; k15: number; k33: number; k31: number; kY: number } {
  const e0 = EPS0;
  return {
    kt: f.e[2][2] / Math.sqrt(f.cD[2][2] * f.epsS[2][2] * e0),
    k15: f.e[0][4] / Math.sqrt(f.cD[4][4] * f.epsS[0][0] * e0),
    k33: f.d[2][2] / Math.sqrt(f.sE[2][2] * f.epsT[2][2] * e0),
    k31: f.d[2][0] / Math.sqrt(f.sE[0][0] * f.epsT[2][2] * e0),
    kY: f.d[1][1] / Math.sqrt(f.sE[1][1] * f.epsT[1][1] * e0),
  };
}
