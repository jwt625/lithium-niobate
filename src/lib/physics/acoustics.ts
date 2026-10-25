// Bulk acoustic waves: Christoffel equation with piezoelectric stiffening for any propagation direction.
//   Gamma_il = c^E_ijkl n_j n_k + gamma_i gamma_l / eps_n,  gamma_i = e_kij n_k n_j,  eps_n = n_k eps^S_kl n_l
//   rho v^2 = eigenvalues of Gamma (symmetric 3x3), polarizations = eigenvectors (Auld 1973, vol. 1; R11 S10).
// Inputs are Voigt matrices in GPa (c), C/m^2 (e), relative permittivity (eps^S), density kg/m^3.
import { EPS0, CE_KUSHIBIKI1999, E_KUSHIBIKI1999, EPS_S_KUSHIBIKI1999, DENSITY_KUSHIBIKI1999 } from "./constants.ts";
import { eigSym3, normalize3 } from "./linalg.ts";
import type { Mat3, Vec3 } from "./linalg.ts";
import { c3m, e3m, eps3m, voigtToTensor3, voigtToTensor4 } from "./tensors.ts";
import type { Matrix, Tensor } from "./tensors.ts";

export interface AcousticMaterial {
  /** full tensors (SI): c (Pa), e (C/m^2), eps^S (F/m) */
  c: Tensor;
  e: Tensor;
  eps: Mat3;
  rho: number;
}

/** Build SI full tensors from Voigt inputs: c in GPa (6x6), e in C/m^2 (3x6), eps^S relative (3x3). */
export function acousticMaterial(cV_GPa: Matrix, eV: Matrix, epsRel: Mat3, rho: number): AcousticMaterial {
  const cSI = cV_GPa.map((r) => r.map((v) => v * 1e9));
  return {
    c: voigtToTensor4(cSI, "c"),
    e: voigtToTensor3(eV, "e"),
    eps: epsRel.map((r) => r.map((v) => v * EPS0)) as Mat3,
    rho,
  };
}

/** Default LN material: kushibiki1999 c^E, e, eps^S, density (all P; one self-consistent SAW-grade CLN set). */
export const LN_KUSHIBIKI1999: AcousticMaterial = acousticMaterial(c3m(CE_KUSHIBIKI1999), e3m(E_KUSHIBIKI1999), eps3m(EPS_S_KUSHIBIKI1999), DENSITY_KUSHIBIKI1999.value);

export interface ChristoffelResult {
  /** phase velocities (m/s), descending: [quasi-longitudinal, fast shear, slow shear] */
  v: Vec3;
  /** unit displacement polarizations matching v */
  u: Mat3;
  /** longitudinal character |u . n| per mode */
  lcos: Vec3;
}

/** Solve the Christoffel problem for direction n (any length). piezo = false drops the stiffening term. */
export function christoffel(m: AcousticMaterial, nIn: Vec3, piezo = true): ChristoffelResult {
  const n = normalize3(nIn);
  const G: Mat3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const c = m.c;
  for (let i = 0; i < 3; i++)
    for (let l = i; l < 3; l++) {
      let s = 0;
      for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) s += c[i * 27 + j * 9 + k * 3 + l] * n[j] * n[k];
      G[i][l] = s;
    }
  if (piezo) {
    const g = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      let s = 0;
      for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) s += m.e[k * 9 + i * 3 + j] * n[k] * n[j];
      g[i] = s;
    }
    let en = 0;
    for (let k = 0; k < 3; k++) for (let l = 0; l < 3; l++) en += n[k] * m.eps[k][l] * n[l];
    for (let i = 0; i < 3; i++) for (let l = i; l < 3; l++) G[i][l] += (g[i] * g[l]) / en;
  }
  for (let i = 0; i < 3; i++) for (let l = 0; l < i; l++) G[i][l] = G[l][i];
  const { values, vectors } = eigSym3(G);
  const v: Vec3 = [Math.sqrt(values[2] / m.rho), Math.sqrt(values[1] / m.rho), Math.sqrt(values[0] / m.rho)];
  const u: Mat3 = [vectors[2], vectors[1], vectors[0]];
  const lcos: Vec3 = [0, 1, 2].map((q) => Math.abs(u[q][0] * n[0] + u[q][1] * n[1] + u[q][2] * n[2])) as Vec3;
  return { v, u, lcos };
}

/** Sweep directions in a plane spanned by unit vectors a and b: n(t) = cos t a + sin t b, t = 2 pi i / N. Returns v as
 *  Float64Array of length 3N (three branches per direction, descending). */
export function christoffelSweep(m: AcousticMaterial, a: Vec3, b: Vec3, N: number, piezo = true): Float64Array {
  const out = new Float64Array(3 * N);
  for (let i = 0; i < N; i++) {
    const t = (2 * Math.PI * i) / N;
    const n: Vec3 = [Math.cos(t) * a[0] + Math.sin(t) * b[0], Math.cos(t) * a[1] + Math.sin(t) * b[1], Math.cos(t) * a[2] + Math.sin(t) * b[2]];
    const r = christoffel(m, n, piezo);
    out[3 * i] = r.v[0];
    out[3 * i + 1] = r.v[1];
    out[3 * i + 2] = r.v[2];
  }
  return out;
}

/** Electromechanical coupling estimate for bulk mode q along n: K^2 = (v_stiffened^2 - v_bare^2)/v_stiffened^2 (sorted branches). */
export function bulkCouplingK2(m: AcousticMaterial, n: Vec3): Vec3 {
  const s = christoffel(m, n, true).v;
  const b = christoffel(m, n, false).v;
  return [0, 1, 2].map((q) => (s[q] ** 2 - b[q] ** 2) / s[q] ** 2) as Vec3;
}
