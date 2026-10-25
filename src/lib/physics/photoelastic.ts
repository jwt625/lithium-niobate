// Photoelastic (strain-optic) tensor: full-rank form of the asymmetric 3m p_IJ, longitudinal coefficient along an
// in-plane unit vector, in-plane sweeps for X-, Y- and Z-cut films, and the p14/p41 sign flip.
//   Delta(1/n^2)_ij = p_ijkl S_kl (weis1985 Eq. 18); p_IJ = p_ijkl, no Voigt factors, p_IJ != p_JI (weis1985 Eq. 19).
//   Longitudinal coefficient p'_bbbb = p_ijkl b_i b_j b_k b_l (content/chapters/03-sound/manuscript.md sec. 3.6 L3).
// In-plane angle convention (site convention, C03 open-questions Q7):
//   X-cut: b = (0, cos phi, sin phi), phi from +Y toward +Z;  Y-cut: b = (cos phi, 0, sin phi), from +X toward +Z;
//   Z-cut: b = (cos phi, sin phi, 0), from +X toward +Y.
// Flip: a 180 deg rotation about Z negates p14 and p41 and nothing else in p (tensors.ts ROT180_Z note; R06 pitfall 2).
import { p3m, voigtToTensor4, rotateTensor4, ROT180_Z } from "./tensors.ts";
import type { Matrix, Tensor } from "./tensors.ts";
import type { Vec3 } from "./linalg.ts";

export interface P3m {
  p11: number;
  p12: number;
  p13: number;
  p14: number;
  p31: number;
  p33: number;
  p41: number;
  p44: number;
}

/** Full rank-4 tensor (81) from a 6x6 photoelastic Voigt matrix (asymmetric allowed, no factors). */
export const voigtToFull = (pIJ: Matrix): Tensor => voigtToTensor4(pIJ, "p");
/** Full tensor from the eight independent 3m components. */
export const fullFrom3m = (p: P3m): Tensor => voigtToFull(p3m(p));
/** Same set with p14 and p41 negated (180 deg rotation about Z). */
export const flipP14P41 = (p: P3m): P3m => ({ ...p, p14: -p.p14, p41: -p.p41 });
/** Rotate a full tensor by 180 deg about Z (equivalent to flipP14P41 on a 3m tensor). */
export const rot180Z = (pFull: Tensor): Tensor => rotateTensor4(pFull, ROT180_Z);

/** p'_bbbb = p_ijkl b_i b_j b_k b_l for a unit vector b. */
export function longitudinal(pFull: Tensor, b: Vec3): number {
  let s = 0;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      const bij = b[i] * b[j];
      if (bij === 0) continue;
      for (let k = 0; k < 3; k++)
        for (let l = 0; l < 3; l++) s += pFull[i * 27 + j * 9 + k * 3 + l] * bij * b[k] * b[l];
    }
  return s;
}
/** Shear-to-index coefficient p'_bbab = p_ijkl b_i b_j a_k b_l (optional F3.8 output). */
export function shearCoefficient(pFull: Tensor, b: Vec3, a: Vec3): number {
  let s = 0;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) for (let l = 0; l < 3; l++) s += pFull[i * 27 + j * 9 + k * 3 + l] * b[i] * b[j] * a[k] * b[l];
  return s;
}

export type FilmCut = "X" | "Y" | "Z";
/** In-plane unit vector for a film cut at angle phi (rad), site convention above. */
export function inPlaneDir(cut: FilmCut, phi: number): Vec3 {
  const c = Math.cos(phi);
  const s = Math.sin(phi);
  if (cut === "X") return [0, c, s];
  if (cut === "Y") return [c, 0, s];
  return [c, s, 0];
}

/** p'_bbbb over phi in [0, 180) deg at N points (step 180/N deg). */
export function inPlaneSweep(pFull: Tensor, cut: FilmCut, N = 360): { phi_deg: Float64Array; p: Float64Array } {
  const phi = new Float64Array(N);
  const p = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    phi[i] = (180 * i) / N;
    p[i] = longitudinal(pFull, inPlaneDir(cut, (phi[i] * Math.PI) / 180));
  }
  return { phi_deg: phi, p };
}

/** Maxima of p'_bbbb over phi in [0, 180) deg: all local maxima within tol of the global maximum, refined by
 *  golden-section search to 1e-9 deg. */
export function inPlaneMaxima(pFull: Tensor, cut: FilmCut, tol = 1e-9): { value: number; phi_deg: number[] } {
  const f = (d: number) => longitudinal(pFull, inPlaneDir(cut, (d * Math.PI) / 180));
  const N = 720;
  const vals: number[] = [];
  for (let i = 0; i < N; i++) vals.push(f((180 * i) / N));
  const cands: { v: number; d: number }[] = [];
  for (let i = 0; i < N; i++) {
    const a = vals[(i - 1 + N) % N];
    const c = vals[(i + 1) % N];
    if (vals[i] >= a && vals[i] >= c) {
      let lo = (180 * (i - 1)) / N;
      let hi = (180 * (i + 1)) / N;
      const g = (Math.sqrt(5) - 1) / 2;
      for (let it = 0; it < 80; it++) {
        const x1 = hi - g * (hi - lo);
        const x2 = lo + g * (hi - lo);
        if (f(x1) > f(x2)) hi = x2;
        else lo = x1;
      }
      const d = (((lo + hi) / 2) % 180 + 180) % 180;
      cands.push({ v: f(d), d });
    }
  }
  const vmax = Math.max(...cands.map((c) => c.v));
  const keep: number[] = [];
  for (const c of cands) if (vmax - c.v <= Math.max(tol, 1e-12) * Math.max(1, Math.abs(vmax)) + 1e-12 && !keep.some((k) => Math.abs(k - c.d) < 1e-3 || Math.abs(Math.abs(k - c.d) - 180) < 1e-3)) keep.push(c.d);
  keep.sort((a, b) => a - b);
  return { value: vmax, phi_deg: keep };
}
