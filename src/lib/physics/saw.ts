// Surface acoustic waves on a piezoelectric half-space: partial-wave method (Campbell and Jones 1968, doi
// 10.1109/T-SU.1968.29477; method as described in C03 sec. 3.3 L2-L3 and R11 S10), free (open, vacuum above) and metallized (shorted, phi = 0) surfaces, Rayleigh-type
// (real velocity) and leaky (complex velocity) roots; coupling k^2 = 2 (v_free - v_met)/v_free (Ingebrigtsen 1969).
//
// Frame (same as tensors.ts named cuts): global x1 = propagation, x3 = outward surface normal, substrate at x3 < 0,
// x2 = x3 x x1. A rotation R (crystal -> global, v_g = R v_c) defines the cut; rotatedYCut(theta) gives (YXl) theta.
// Fields ~ exp[i k (x1 + alpha x3 - v t)], k > 0 real; a leaky root has complex v (temporal decay, Im v < 0).
//
// Generalized 4-vector U = (u1, u2, u3, phi). Generalized constitutive blocks for spatial pair (i, k):
//   M^{ik}_{jl} = c_ijkl, M^{ik}_{j4} = e_kij, M^{ik}_{4l} = e_ikl, M^{ik}_{44} = -eps^S_ik
// Equation: [Q + alpha (R + R^T) + alpha^2 T - rho v^2 I'] U = 0, Q = M^{11}, R = M^{13}, T = M^{33}, I' = diag(1,1,1,0).
// Normal "traction" vector (T_31, T_32, T_33, D_3) = i k b, b = (R^T + alpha T) U.
// Boundary conditions at x3 = 0 on sum_m A_m (U_m, b_m): b_1 = b_2 = b_3 = 0 and
//   open:  D3 continuous with the vacuum potential phi e^{-k x3}:  b_4 + i eps0 phi = 0
//   short: phi = 0
// Root selection: complex alpha with Im alpha < 0 (decay into x3 < 0); real alpha (only above the limiting velocity)
// kept when the partial wave carries power into the substrate, P3 ~ Re sum_J b_J conj(U_J) < 0. For complex v the
// four partial waves are the analytic continuation of the set selected at Re v (nearest-root matching).
// Numerics: nondimensional (c / 1e11 Pa, e / sqrt(1e11 eps0), eps / eps0), the octic in alpha from 9 samples of
// det A on the unit circle (exact interpolation), Aberth-Ehrlich roots, eigenvectors as null vectors of A(alpha) by full-pivot elimination (repeated roots, e.g. the
// isotropic limit, get a null space of matching dimension). |det B| with
// unit-norm columns is scanned on the real axis; Rayleigh roots are refined by golden section on the real axis, leaky
// roots by Nelder-Mead in the complex v plane. Windows of `excludeWindow_mps` around the bulk velocities along x1
// (piezo-stiffened Christoffel) are excluded: the determinant has spurious minima there (manuscript C03 sec. 3.3 L3).
import { EPS0 } from "./constants.ts";
import { christoffel, LN_KUSHIBIKI1999 } from "./acoustics.ts";
import type { AcousticMaterial } from "./acoustics.ts";
import { rotatedYCut, rotateTensor3, rotateTensor4, rotateMatrix3 } from "./tensors.ts";
import type { Mat3, Vec3 } from "./linalg.ts";

const C_SCALE = 1e11;

/** Rotated, nondimensional half-space problem. */
export interface SawProblem {
  Q: Float64Array; // 4x4 row-major
  R: Float64Array;
  T: Float64Array;
  /** rho / C_SCALE (s^2/m^2), multiplies v^2 */
  rhoS: number;
  /** bulk velocities along x1 (m/s, descending, piezo-stiffened): thresholds */
  thresholds: Vec3;
  rotation: Mat3;
  material: AcousticMaterial;
}

/** Cut frame helper: (YXl) theta rotated Y cut, X propagation (alias of tensors.rotatedYCut). */
export const sawFrameRotY = (theta_deg: number): Mat3 => rotatedYCut(theta_deg);

export function sawProblem(m: AcousticMaterial, Rot: Mat3): SawProblem {
  const c = rotateTensor4(m.c, Rot);
  const e = rotateTensor3(m.e, Rot);
  const eps = rotateMatrix3(m.eps, Rot);
  const eS = Math.sqrt(C_SCALE * EPS0);
  const blk = (i: number, k: number): Float64Array => {
    const M = new Float64Array(16);
    for (let j = 0; j < 3; j++) {
      for (let l = 0; l < 3; l++) M[j * 4 + l] = c[i * 27 + j * 9 + k * 3 + l] / C_SCALE;
      M[j * 4 + 3] = e[k * 9 + i * 3 + j] / eS;
      M[3 * 4 + j] = e[i * 9 + k * 3 + j] / eS;
    }
    M[15] = -eps[i][k] / EPS0;
    return M;
  };
  // propagation direction in crystal coordinates = first row of Rot (global x1 in crystal coordinates)
  const n: Vec3 = [Rot[0][0], Rot[0][1], Rot[0][2]];
  const thresholds = christoffel(m, n, true).v;
  return { Q: blk(0, 0), R: blk(0, 2), T: blk(2, 2), rhoS: m.rho / C_SCALE, thresholds, rotation: Rot, material: m };
}

// ---------------------------------------------------------------------------------------------
// complex 4x4 helpers (separate re/im arrays)
// ---------------------------------------------------------------------------------------------
function det4c(ar: Float64Array, ai: Float64Array, n = 4): [number, number] {
  const r = Float64Array.from(ar);
  const im = Float64Array.from(ai);
  let dr = 1;
  let di = 0;
  for (let col = 0; col < n; col++) {
    let p = col;
    let best = -1;
    for (let row = col; row < n; row++) {
      const a = Math.hypot(r[row * n + col], im[row * n + col]);
      if (a > best) {
        best = a;
        p = row;
      }
    }
    if (best === 0) return [0, 0];
    if (p !== col) {
      for (let j = 0; j < n; j++) {
        let t = r[p * n + j];
        r[p * n + j] = r[col * n + j];
        r[col * n + j] = t;
        t = im[p * n + j];
        im[p * n + j] = im[col * n + j];
        im[col * n + j] = t;
      }
      dr = -dr;
      di = -di;
    }
    const pr = r[col * n + col];
    const pi = im[col * n + col];
    const t = dr * pr - di * pi;
    di = dr * pi + di * pr;
    dr = t;
    const d = pr * pr + pi * pi;
    for (let row = col + 1; row < n; row++) {
      const xr = r[row * n + col];
      const xi = im[row * n + col];
      const fr = (xr * pr + xi * pi) / d;
      const fi = (xi * pr - xr * pi) / d;
      for (let j = col; j < n; j++) {
        const yr = r[col * n + j];
        const yi = im[col * n + j];
        r[row * n + j] -= fr * yr - fi * yi;
        im[row * n + j] -= fr * yi + fi * yr;
      }
    }
  }
  return [dr, di];
}

/** A(alpha) for complex alpha and complex w = rhoS v^2. */
function buildA(P: SawProblem, alr: number, ali: number, wr: number, wi: number, ar: Float64Array, ai: Float64Array): void {
  const { Q, R, T } = P;
  const a2r = alr * alr - ali * ali;
  const a2i = 2 * alr * ali;
  for (let j = 0; j < 4; j++)
    for (let l = 0; l < 4; l++) {
      const s = R[j * 4 + l] + R[l * 4 + j];
      const t = T[j * 4 + l];
      ar[j * 4 + l] = Q[j * 4 + l] + alr * s + a2r * t;
      ai[j * 4 + l] = ali * s + a2i * t;
    }
  for (let j = 0; j < 3; j++) {
    ar[j * 5] -= wr;
    ai[j * 5] -= wi;
  }
}

// ---------------------------------------------------------------------------------------------
// octic in alpha and its roots
// ---------------------------------------------------------------------------------------------
const NS = 9;
const COS9 = Array.from({ length: NS }, (_, m) => Math.cos((2 * Math.PI * m) / NS));
const SIN9 = Array.from({ length: NS }, (_, m) => Math.sin((2 * Math.PI * m) / NS));

/** Coefficients p_0..p_8 (re, im) of det A(alpha) for fixed w. */
function octic(P: SawProblem, wr: number, wi: number): { re: Float64Array; im: Float64Array } {
  const ar = new Float64Array(16);
  const ai = new Float64Array(16);
  const sr = new Float64Array(NS);
  const si = new Float64Array(NS);
  for (let m = 0; m < NS; m++) {
    buildA(P, COS9[m], SIN9[m], wr, wi, ar, ai);
    [sr[m], si[m]] = det4c(ar, ai);
  }
  const re = new Float64Array(NS);
  const im = new Float64Array(NS);
  for (let k = 0; k < NS; k++) {
    let xr = 0;
    let xi = 0;
    for (let m = 0; m < NS; m++) {
      const idx = (k * m) % NS;
      const c = COS9[idx];
      const s = -SIN9[idx];
      xr += sr[m] * c - si[m] * s;
      xi += sr[m] * s + si[m] * c;
    }
    re[k] = xr / NS;
    im[k] = xi / NS;
  }
  return { re, im };
}

/** All roots of a complex polynomial sum p_k z^k (Aberth-Ehrlich), returned as [re[], im[]]. */
export function polyRoots(pr: ArrayLike<number>, pi: ArrayLike<number>): { re: Float64Array; im: Float64Array } {
  const n = pr.length - 1;
  // monic normalization
  const lr = pr[n];
  const li = pi[n];
  const ld = lr * lr + li * li;
  const cr = new Float64Array(n + 1);
  const ci = new Float64Array(n + 1);
  for (let k = 0; k <= n; k++) {
    cr[k] = (pr[k] * lr + pi[k] * li) / ld;
    ci[k] = (pi[k] * lr - pr[k] * li) / ld;
  }
  let rad = 0;
  for (let k = 0; k < n; k++) rad = Math.max(rad, Math.hypot(cr[k], ci[k]) ** (1 / (n - k)));
  rad = Math.max(rad, 1e-3);
  const zr = new Float64Array(n);
  const zi = new Float64Array(n);
  for (let j = 0; j < n; j++) {
    const t = (2 * Math.PI * j) / n + 0.4;
    zr[j] = rad * Math.cos(t);
    zi[j] = rad * Math.sin(t);
  }
  for (let it = 0; it < 500; it++) {
    let maxStep = 0;
    for (let j = 0; j < n; j++) {
      // Horner: p and p'
      let fr = 1;
      let fi = 0;
      let dr = 0;
      let di = 0;
      for (let k = n - 1; k >= 0; k--) {
        const ndr = dr * zr[j] - di * zi[j] + fr;
        const ndi = dr * zi[j] + di * zr[j] + fi;
        dr = ndr;
        di = ndi;
        const nfr = fr * zr[j] - fi * zi[j] + cr[k];
        const nfi = fr * zi[j] + fi * zr[j] + ci[k];
        fr = nfr;
        fi = nfi;
      }
      if (fr === 0 && fi === 0) continue;
      // ratio N = p/p'
      const dd = dr * dr + di * di;
      const Nr = (fr * dr + fi * di) / dd;
      const Ni = (fi * dr - fr * di) / dd;
      // sum 1/(z_j - z_k)
      let sr = 0;
      let si = 0;
      for (let k = 0; k < n; k++) {
        if (k === j) continue;
        const xr = zr[j] - zr[k];
        const xi = zi[j] - zi[k];
        const xd = xr * xr + xi * xi;
        sr += xr / xd;
        si -= xi / xd;
      }
      // w = N / (1 - N S)
      const der = 1 - (Nr * sr - Ni * si);
      const dei = -(Nr * si + Ni * sr);
      const dden = der * der + dei * dei;
      const wr = (Nr * der + Ni * dei) / dden;
      const wi = (Ni * der - Nr * dei) / dden;
      zr[j] -= wr;
      zi[j] -= wi;
      maxStep = Math.max(maxStep, Math.hypot(wr, wi) / (1 + Math.hypot(zr[j], zi[j])));
    }
    if (maxStep < 1e-15) break;
  }
  return { re: zr, im: zi };
}

/** Partial wave: alpha and normalized generalized vector (U, b), 8 complex components. */
export interface PartialWave {
  ar: number;
  ai: number;
  /** U (4) then b (4): re and im, unit 2-norm over all 8 */
  xr: Float64Array;
  xi: Float64Array;
  /** P3 ~ Re sum b_J conj(U_J) before normalization sign (negative = power into the substrate) */
  p3: number;
}

/** Null vectors of a complex 4x4 matrix by full-pivot elimination: the trailing `count` pivots are treated as zero.
 *  Returns null when a trailing pivot is not small relative to the first (rank too high for the requested nullity). */
function nullVectors(ar0: Float64Array, ai0: Float64Array, count: number, tolRel: number): { r: Float64Array; i: Float64Array }[] | null {
  const n = 4;
  const ar = Float64Array.from(ar0);
  const ai = Float64Array.from(ai0);
  const perm = [0, 1, 2, 3];
  let p0 = 0;
  const rank = n - count;
  for (let k = 0; k < n; k++) {
    let bi = k;
    let bj = k;
    let best = -1;
    for (let i = k; i < n; i++)
      for (let j = k; j < n; j++) {
        const m = Math.hypot(ar[i * n + j], ai[i * n + j]);
        if (m > best) {
          best = m;
          bi = i;
          bj = j;
        }
      }
    if (k === 0) p0 = best;
    if (k >= rank) {
      if (best > tolRel * p0) return null;
      break;
    }
    // swap rows k, bi and columns k, bj
    for (let j = 0; j < n; j++) {
      let t = ar[k * n + j];
      ar[k * n + j] = ar[bi * n + j];
      ar[bi * n + j] = t;
      t = ai[k * n + j];
      ai[k * n + j] = ai[bi * n + j];
      ai[bi * n + j] = t;
    }
    for (let i = 0; i < n; i++) {
      let t = ar[i * n + k];
      ar[i * n + k] = ar[i * n + bj];
      ar[i * n + bj] = t;
      t = ai[i * n + k];
      ai[i * n + k] = ai[i * n + bj];
      ai[i * n + bj] = t;
    }
    const tp = perm[k];
    perm[k] = perm[bj];
    perm[bj] = tp;
    const pr = ar[k * n + k];
    const pi = ai[k * n + k];
    const d = pr * pr + pi * pi;
    for (let i = k + 1; i < n; i++) {
      const fr = (ar[i * n + k] * pr + ai[i * n + k] * pi) / d;
      const fi = (ai[i * n + k] * pr - ar[i * n + k] * pi) / d;
      for (let j = k; j < n; j++) {
        ar[i * n + j] -= fr * ar[k * n + j] - fi * ai[k * n + j];
        ai[i * n + j] -= fr * ai[k * n + j] + fi * ar[k * n + j];
      }
    }
  }
  const out: { r: Float64Array; i: Float64Array }[] = [];
  for (let f = rank; f < n; f++) {
    // free variable f = 1, other free = 0; back-substitute the upper-triangular rank x rank block
    const yr = new Float64Array(n);
    const yi = new Float64Array(n);
    yr[f] = 1;
    for (let k = rank - 1; k >= 0; k--) {
      let sr = 0;
      let si = 0;
      for (let j = k + 1; j < n; j++) {
        sr += ar[k * n + j] * yr[j] - ai[k * n + j] * yi[j];
        si += ar[k * n + j] * yi[j] + ai[k * n + j] * yr[j];
      }
      const pr = ar[k * n + k];
      const pi = ai[k * n + k];
      const d = pr * pr + pi * pi;
      yr[k] = -(sr * pr + si * pi) / d;
      yi[k] = -(si * pr - sr * pi) / d;
    }
    const r = new Float64Array(n);
    const i = new Float64Array(n);
    for (let k = 0; k < n; k++) {
      r[perm[k]] = yr[k];
      i[perm[k]] = yi[k];
    }
    out.push({ r, i });
  }
  return out;
}

/** Partial waves (count = multiplicity of the root) for one alpha. */
function partialWaves(P: SawProblem, alr: number, ali: number, wr: number, wi: number, count: number): PartialWave[] | null {
  const ar = new Float64Array(16);
  const ai = new Float64Array(16);
  buildA(P, alr, ali, wr, wi, ar, ai);
  const nv = nullVectors(ar, ai, count, count === 1 ? 1 : 1e-5);
  if (!nv) return null;
  return nv.map(({ r: ur, i: ui }) => {
    // b = (R^T + alpha T) U
    const br = new Float64Array(4);
    const bi = new Float64Array(4);
    for (let j = 0; j < 4; j++) {
      let sr = 0;
      let si = 0;
      for (let l = 0; l < 4; l++) {
        const mr = P.R[l * 4 + j] + alr * P.T[j * 4 + l];
        const mi = ali * P.T[j * 4 + l];
        sr += mr * ur[l] - mi * ui[l];
        si += mr * ui[l] + mi * ur[l];
      }
      br[j] = sr;
      bi[j] = si;
    }
    let p3 = 0;
    let nrm = 0;
    for (let j = 0; j < 4; j++) {
      p3 += br[j] * ur[j] + bi[j] * ui[j];
      nrm += ur[j] ** 2 + ui[j] ** 2 + br[j] ** 2 + bi[j] ** 2;
    }
    nrm = Math.sqrt(nrm);
    const xr = new Float64Array(8);
    const xi = new Float64Array(8);
    for (let j = 0; j < 4; j++) {
      xr[j] = ur[j] / nrm;
      xi[j] = ui[j] / nrm;
      xr[4 + j] = br[j] / nrm;
      xi[4 + j] = bi[j] / nrm;
    }
    return { ar: alr, ai: ali, xr, xi, p3: p3 / (nrm * nrm) };
  });
}

/** Group selected roots into clusters of (numerically) repeated roots and build their partial waves. */
function wavesFromRoots(P: SawProblem, roots: [number, number][], wr: number, wi: number): PartialWave[] | null {
  const used = new Uint8Array(roots.length);
  const out: PartialWave[] = [];
  for (let a = 0; a < roots.length; a++) {
    if (used[a]) continue;
    used[a] = 1;
    const cl = [roots[a]];
    for (let b = a + 1; b < roots.length; b++) {
      if (used[b]) continue;
      if (Math.hypot(roots[b][0] - roots[a][0], roots[b][1] - roots[a][1]) < 1e-6 * (1 + Math.hypot(roots[a][0], roots[a][1]))) {
        used[b] = 1;
        cl.push(roots[b]);
      }
    }
    const mr = cl.reduce((s, x) => s + x[0], 0) / cl.length;
    const mi = cl.reduce((s, x) => s + x[1], 0) / cl.length;
    const pw = partialWaves(P, mr, mi, wr, wi, cl.length);
    if (!pw) return null;
    out.push(...pw);
  }
  return out;
}

/** Select the 4 partial waves at a real velocity (Im alpha < 0, or real alpha with power into the substrate). */
function selectReal(P: SawProblem, v: number): PartialWave[] | null {
  const w = P.rhoS * v * v;
  const { re, im } = octic(P, w, 0);
  const rts = polyRoots(re, im);
  const cplx: [number, number][] = [];
  const real: [number, number][] = [];
  for (let j = 0; j < 8; j++) {
    const a = rts.re[j];
    const b = rts.im[j];
    if (Math.abs(b) > 1e-7 * (1 + Math.abs(a))) {
      if (b < 0) cplx.push([a, b]);
    } else real.push([a, 0]);
  }
  const out = wavesFromRoots(P, cplx, w, 0);
  if (!out) return null;
  const rw = wavesFromRoots(P, real, w, 0);
  if (!rw) return null;
  for (const pw of rw) if (pw.p3 < 0) out.push(pw);
  return out.length === 4 ? out : null;
}

/** Select the 4 partial waves at complex v by continuation from the set at Re v. */
export function sawPartialWaves(P: SawProblem, vr: number, vi = 0): PartialWave[] | null {
  const ref = selectReal(P, vr);
  if (!ref || vi === 0) return ref;
  const wr = P.rhoS * (vr * vr - vi * vi);
  const wi = P.rhoS * 2 * vr * vi;
  const { re, im } = octic(P, wr, wi);
  const rts = polyRoots(re, im);
  const used = new Uint8Array(8);
  const sel: [number, number][] = [];
  for (const r of ref) {
    let bj = -1;
    let bd = Infinity;
    for (let j = 0; j < 8; j++) {
      if (used[j]) continue;
      const d = Math.hypot(rts.re[j] - r.ar, rts.im[j] - r.ai);
      if (d < bd) {
        bd = d;
        bj = j;
      }
    }
    used[bj] = 1;
    sel.push([rts.re[bj], rts.im[bj]]);
  }
  const out = wavesFromRoots(P, sel, wr, wi);
  return out && out.length === 4 ? out : null;
}

export type SawSurface = "open" | "short";

/** Boundary matrix (4x4: rows b1, b2, b3, electrical condition; columns = partial waves). */
function boundary(pws: PartialWave[], surface: SawSurface): { br: Float64Array; bi: Float64Array } {
  const br = new Float64Array(16);
  const bi = new Float64Array(16);
  for (let m = 0; m < 4; m++) {
    const { xr, xi } = pws[m];
    for (let j = 0; j < 3; j++) {
      br[j * 4 + m] = xr[4 + j];
      bi[j * 4 + m] = xi[4 + j];
    }
    if (surface === "short") {
      br[12 + m] = xr[3];
      bi[12 + m] = xi[3];
    } else {
      // b4 + i phi (nondimensional eps0 = 1)
      br[12 + m] = xr[7] - xi[3];
      bi[12 + m] = xi[7] + xr[3];
    }
  }
  return { br, bi };
}

/** |det B| (unit-norm partial-wave columns) at complex velocity; NaN where the selection fails. */
export function sawDetAbs(P: SawProblem, surface: SawSurface, vr: number, vi = 0): number {
  const pws = sawPartialWaves(P, vr, vi);
  if (!pws) return Number.NaN;
  const { br, bi } = boundary(pws, surface);
  const [dr, di] = det4c(br, bi);
  return Math.hypot(dr, di);
}

/** Real-axis scan of |det B| (for plots and diagnostics). */
export function sawScan(P: SawProblem, surface: SawSurface, v0: number, v1: number, N: number): { v: Float64Array; det: Float64Array } {
  const v = new Float64Array(N);
  const det = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    v[i] = v0 + ((v1 - v0) * i) / (N - 1);
    det[i] = sawDetAbs(P, surface, v[i]);
  }
  return { v, det };
}

function golden(f: (x: number) => number, a: number, b: number, tol: number): number {
  const g = (Math.sqrt(5) - 1) / 2;
  let c = b - g * (b - a);
  let d = a + g * (b - a);
  let fc = f(c);
  let fd = f(d);
  while (b - a > tol) {
    if (fc < fd) {
      b = d;
      d = c;
      fd = fc;
      c = b - g * (b - a);
      fc = f(c);
    } else {
      a = c;
      c = d;
      fc = fd;
      d = a + g * (b - a);
      fd = f(d);
    }
  }
  return 0.5 * (a + b);
}

function nelderMead2(f: (x: number, y: number) => number, x0: number, y0: number, step: number, tol: number, maxIter = 400): [number, number, number] {
  let s: [number, number, number][] = [
    [x0, y0, f(x0, y0)],
    [x0 + step, y0, f(x0 + step, y0)],
    [x0, y0 - step, f(x0, y0 - step)],
  ];
  for (let it = 0; it < maxIter; it++) {
    s.sort((a, b) => a[2] - b[2]);
    const size = Math.max(Math.hypot(s[1][0] - s[0][0], s[1][1] - s[0][1]), Math.hypot(s[2][0] - s[0][0], s[2][1] - s[0][1]));
    if (size < tol) break;
    const cx = 0.5 * (s[0][0] + s[1][0]);
    const cy = 0.5 * (s[0][1] + s[1][1]);
    const rx = 2 * cx - s[2][0];
    const ry = 2 * cy - s[2][1];
    const fr = f(rx, ry);
    if (fr < s[0][2]) {
      const ex = 3 * cx - 2 * s[2][0];
      const ey = 3 * cy - 2 * s[2][1];
      const fe = f(ex, ey);
      s[2] = fe < fr ? [ex, ey, fe] : [rx, ry, fr];
    } else if (fr < s[1][2]) {
      s[2] = [rx, ry, fr];
    } else {
      const kx = 0.5 * (cx + s[2][0]);
      const ky = 0.5 * (cy + s[2][1]);
      const fk = f(kx, ky);
      if (fk < s[2][2]) s[2] = [kx, ky, fk];
      else
        s = [s[0], [0.5 * (s[0][0] + s[1][0]), 0.5 * (s[0][1] + s[1][1]), 0], [0.5 * (s[0][0] + s[2][0]), 0.5 * (s[0][1] + s[2][1]), 0]].map(
          (p, i) => (i === 0 ? p : [p[0], p[1], f(p[0], p[1])]),
        ) as [number, number, number][];
    }
  }
  s.sort((a, b) => a[2] - b[2]);
  return s[0];
}

export type SawBranch = "rayleigh" | "leaky";

export interface SawRoot {
  status: "root" | "threshold-pinned" | "none";
  branch: SawBranch;
  surface: SawSurface;
  /** phase velocity (m/s); for a threshold-pinned result, the edge of the exclusion window next to the threshold */
  v: number;
  /** imaginary part (m/s); < 0 for a leaky wave decaying in time */
  vIm: number;
  /** propagation loss, dB per wavelength = 20 log10(e) 2 pi |Im v| / Re v (exact for the non-dispersive half-space:
   *  Im k / Re k = -Im v / Re v) */
  loss_dB_per_lambda: number;
  /** |det B| at the result relative to the median |det B| on the scan */
  residual: number;
  /** threshold the result is pinned to, if any (m/s) */
  pinnedTo?: number;
  /** distance to the nearest bulk threshold (m/s), set when the root was resolved inside the default window */
  thresholdGap_mps?: number;
}

export interface SawSolveOpts {
  surface: SawSurface;
  branch: SawBranch;
  /** half-width of the excluded window around each bulk threshold along x1 (m/s), default 1 */
  excludeWindow_mps?: number;
  /** fine window used when a minimum sits at a threshold window edge (m/s), default 0.05 */
  fineWindow_mps?: number;
  /** scan step (m/s), default 2 */
  dv_mps?: number;
  /** lower scan bound for the Rayleigh branch as a fraction of the slowest threshold, default 0.75 */
  vMinFrac?: number;
  /** restrict the scan to [vLo, vHi] (m/s), e.g. for continuation in a sweep */
  vLo?: number;
  vHi?: number;
}

/** Solve one branch on one surface. Rayleigh: real root below the slowest bulk threshold along x1. Leaky: complex
 *  root between the slow and the fast shear thresholds; a minimum at a threshold window edge is re-searched with
 *  `fineWindow_mps`; if no isolated zero exists there either it is reported as "threshold-pinned". */
export function sawSolve(P: SawProblem, o: SawSolveOpts): SawRoot {
  const win = o.excludeWindow_mps ?? 1;
  const dv = o.dv_mps ?? 2;
  const [vL, vF, vS] = P.thresholds; // descending: quasi-L, fast shear, slow shear
  const thr = [vS, vF, vL];
  const inWindow = (v: number): boolean => thr.some((t) => Math.abs(v - t) <= win);
  let lo: number;
  let hi: number;
  if (o.branch === "rayleigh") {
    lo = o.vLo ?? (o.vMinFrac ?? 0.75) * vS;
    hi = Math.min(o.vHi ?? Infinity, vS - win);
  } else {
    lo = Math.max(o.vLo ?? -Infinity, vS + win);
    hi = Math.min(o.vHi ?? Infinity, vF - win);
  }
  const none: SawRoot = { status: "none", branch: o.branch, surface: o.surface, v: Number.NaN, vIm: Number.NaN, loss_dB_per_lambda: Number.NaN, residual: Number.NaN };
  if (!(hi > lo)) return none;
  const N = Math.max(8, Math.ceil((hi - lo) / dv) + 1);
  const vs = new Float64Array(N);
  const ds = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    vs[i] = lo + ((hi - lo) * i) / (N - 1);
    ds[i] = inWindow(vs[i]) ? Number.NaN : sawDetAbs(P, o.surface, vs[i]);
  }
  const finite = Array.from(ds).filter(Number.isFinite).sort((a, b) => a - b);
  if (finite.length === 0) return none;
  const median = finite[Math.floor(finite.length / 2)];
  // local minima (edges count when lower than the inner neighbour)
  const cands: number[] = [];
  for (let i = 0; i < N; i++) {
    if (!Number.isFinite(ds[i])) continue;
    const l = i > 0 && Number.isFinite(ds[i - 1]) ? ds[i - 1] : Infinity;
    const r = i < N - 1 && Number.isFinite(ds[i + 1]) ? ds[i + 1] : Infinity;
    if (ds[i] <= l && ds[i] <= r) cands.push(i);
  }
  // interior minima first (minima at a scan edge sit next to a bulk threshold, where the determinant has spurious zeros)
  const interior = (i: number): number => (i > 0 && i < N - 1 ? 0 : 1);
  cands.sort((a, b) => interior(a) - interior(b) || ds[a] - ds[b]);
  const f1 = (v: number): number => {
    const d = sawDetAbs(P, o.surface, v);
    return Number.isFinite(d) ? d : 1e300;
  };
  const results: SawRoot[] = [];
  for (const i of cands.slice(0, 4)) {
    const a = Math.max(lo, vs[Math.max(0, i - 1)]);
    const b = Math.min(hi, vs[Math.min(N - 1, i + 1)]);
    const vr0 = golden(f1, a, b, 1e-9 * vs[i]);
    const d0 = f1(vr0);
    const edge = Math.min(...thr.map((t) => Math.abs(vr0 - t)));
    if (o.branch === "rayleigh") {
      results.push({ status: "root", branch: "rayleigh", surface: o.surface, v: vr0, vIm: 0, loss_dB_per_lambda: 0, residual: d0 / median });
      continue;
    }
    // leaky: refine in the complex plane
    const f2 = (x: number, y: number): number => {
      if (inWindow(x) || x < lo || x > hi || y > 0) return 1e300;
      const d = sawDetAbs(P, o.surface, x, y);
      return Number.isFinite(d) ? d : 1e300;
    };
    const [xr, xi, fx] = nelderMead2(f2, vr0, -0.5, 0.5, 1e-7);
    const pinnedT = thr.find((t) => Math.abs(xr - t) <= win * 1.05 + 1e-6 || Math.abs(vr0 - t) <= win + 2 * dv);
    const isolated = fx / median < 1e-6 && !inWindow(xr) && Math.min(...thr.map((t) => Math.abs(xr - t))) > win + 1e-6;
    if (isolated) {
      results.push({
        status: "root",
        branch: "leaky",
        surface: o.surface,
        v: xr,
        vIm: xi,
        loss_dB_per_lambda: ((20 / Math.LN10) * 2 * Math.PI * Math.abs(xi)) / xr,
        residual: fx / median,
      });
    } else if (pinnedT !== undefined && edge <= win + 2 * dv) {
      // The minimum sits at the window edge. Retry next to the threshold with a fine window before declaring a pin:
      // on 36-41 deg Y-X the free-surface leaky root lies 0.7-0.8 m/s below the fast shear velocity (inside the
      // default 1 m/s window) and is an isolated zero (PHY2 audit 2026-10-25).
      const fw = o.fineWindow_mps ?? 0.05;
      const above = vr0 > pinnedT;
      const lo2 = Math.max(lo - win, above ? pinnedT + fw : pinnedT - 5);
      const hi2 = Math.min(hi + win, above ? pinnedT + 5 : pinnedT - fw);
      const inFine = (x: number): boolean => thr.some((t) => Math.abs(x - t) <= fw);
      let fine: SawRoot | null = null;
      if (hi2 > lo2) {
        const n2 = Math.ceil((hi2 - lo2) / 0.01) + 1;
        let bi = -1;
        let bd = Infinity;
        for (let q = 0; q < n2; q++) {
          const x = lo2 + ((hi2 - lo2) * q) / (n2 - 1);
          const d = inFine(x) ? Number.NaN : sawDetAbs(P, o.surface, x);
          if (Number.isFinite(d) && d < bd) {
            bd = d;
            bi = q;
          }
        }
        if (bi >= 0) {
          const x0 = lo2 + ((hi2 - lo2) * bi) / (n2 - 1);
          const f3 = (x: number, y: number): number => {
            if (inFine(x) || x < lo2 || x > hi2 || y > 0) return 1e300;
            const d = sawDetAbs(P, o.surface, x, y);
            return Number.isFinite(d) ? d : 1e300;
          };
          const [yr, yi, fy] = nelderMead2(f3, x0, -0.01, 0.01, 1e-9);
          const gap = Math.min(...thr.map((t) => Math.abs(yr - t)));
          if (fy / median < 1e-6 && gap > fw + 1e-9)
            fine = {
              status: "root",
              branch: "leaky",
              surface: o.surface,
              v: yr,
              vIm: yi,
              loss_dB_per_lambda: ((20 / Math.LN10) * 2 * Math.PI * Math.abs(yi)) / yr,
              residual: fy / median,
              thresholdGap_mps: gap,
            };
        }
      }
      results.push(fine ?? { status: "threshold-pinned", branch: "leaky", surface: o.surface, v: vr0, vIm: 0, loss_dB_per_lambda: Number.NaN, residual: d0 / median, pinnedTo: pinnedT });
    }
  }
  if (results.length === 0) return none;
  // prefer isolated roots with the smallest residual; pinned results only when no root exists
  const roots = results.filter((r) => r.status === "root");
  if (o.branch === "rayleigh") {
    // first accepted candidate in interior-first order
    const r = roots.find((x) => x.residual < 1e-6) ?? roots[0];
    return r.residual < 1e-6 ? r : { ...none, residual: r.residual };
  }
  if (roots.length > 0) return roots.sort((a, b) => a.residual - b.residual)[0];
  return results.sort((a, b) => a.residual - b.residual)[0];
}

export interface SawCutResult {
  branch: SawBranch;
  free: SawRoot;
  met: SawRoot;
  /** k^2 = 2 (v_free - v_met)/v_free (Ingebrigtsen 1969); NaN without both velocities; flagged indicative if pinned */
  k2: number;
  k2Status: "root" | "indicative (threshold-pinned)" | "none";
  thresholds: Vec3;
}

/** Free and metallized solutions of one branch for a cut, and the coupling. */
export function sawCut(m: AcousticMaterial, Rot: Mat3, branch: SawBranch, opts: Partial<SawSolveOpts> = {}): SawCutResult {
  const P = sawProblem(m, Rot);
  const free = sawSolve(P, { ...opts, surface: "open", branch });
  const met = sawSolve(P, { ...opts, surface: "short", branch });
  const ok = (r: SawRoot) => r.status !== "none";
  // both surfaces pinned to a threshold: no isolated root on either, no coupling (C03 sec. 3.4 "no leaky root resolved")
  const bothPinned = free.status === "threshold-pinned" && met.status === "threshold-pinned";
  const k2 = ok(free) && ok(met) && !bothPinned ? (2 * (free.v - met.v)) / free.v : Number.NaN;
  const k2Status = !Number.isFinite(k2) ? "none" : free.status === "root" && met.status === "root" ? "root" : "indicative (threshold-pinned)";
  return { branch, free, met, k2, k2Status, thresholds: P.thresholds };
}

export interface SawSweepRow {
  theta_deg: number;
  rayleigh: SawCutResult;
  leaky: SawCutResult;
}

/** Rotated Y-X sweep, (YXl) theta, both branches, free and metallized (build-time precompute for F3.4). The Rayleigh
 *  branch continues from the previous free root within [-2.5, +1] x `track_mps` (the metallized root lies below) and falls back to a full scan when no root is found. */
export function sawSweepRotY(m: AcousticMaterial, thetas_deg: ArrayLike<number>, track_mps = 80): SawSweepRow[] {
  const rows: SawSweepRow[] = [];
  let prev = Number.NaN;
  for (let i = 0; i < thetas_deg.length; i++) {
    const R = rotatedYCut(thetas_deg[i]);
    let ray = Number.isFinite(prev) ? sawCut(m, R, "rayleigh", { vLo: prev - 2.5 * track_mps, vHi: prev + track_mps }) : sawCut(m, R, "rayleigh");
    if (ray.free.status !== "root" || ray.met.status !== "root") ray = sawCut(m, R, "rayleigh");
    prev = ray.free.status === "root" ? ray.free.v : Number.NaN;
    rows.push({ theta_deg: thetas_deg[i], rayleigh: ray, leaky: sawCut(m, R, "leaky") });
  }
  return rows;
}

/** Default material for SAW: kushibiki1999 (P) c^E, e, eps^S, rho. */
export const SAW_DEFAULT_MATERIAL: AcousticMaterial = LN_KUSHIBIKI1999;

// ---------------------------------------------------------------------------------------------
// fields of a solution (F3.5)
// ---------------------------------------------------------------------------------------------
export interface SawFields {
  /** depth samples x3 / lambda (<= 0 in the substrate) */
  depth: Float64Array;
  /** complex amplitudes per depth: u1, u2, u3, phi (re, im interleaved per component: [c][2*i], [c][2*i+1]) */
  comp: Float64Array[];
  /** partial-wave amplitudes A_m and alphas */
  amp: { re: number; im: number; alphaRe: number; alphaIm: number }[];
  /** surface particle orbit sense for propagation along +x1 with x3 outward: retrograde or prograde */
  orbit: "retrograde" | "prograde";
  /** traction and electrical boundary residual relative to the largest partial-wave stress term */
  bcResidual: number;
  /** fraction of int |u|^2 dx3 within one wavelength of the surface (integrated to `depthMax` wavelengths) */
  fracWithin1Lambda: number;
}

/** Complex field profiles of a (real-velocity or complex) root at x1 = 0, t = 0; scale is arbitrary (max |u| = 1). */
export function sawFields(P: SawProblem, surface: SawSurface, vr: number, vi = 0, depthMax = 3, nDepth = 301): SawFields {
  const pws = sawPartialWaves(P, vr, vi);
  if (!pws) throw new Error("sawFields: partial-wave selection failed at this velocity");
  const { br, bi } = boundary(pws, surface);
  // null vector of B (rank 3 at a root): adjugate column of largest norm
  let best = -1;
  let Ar = new Float64Array(4);
  let Ai = new Float64Array(4);
  for (let l = 0; l < 4; l++) {
    const cr = new Float64Array(4);
    const ci = new Float64Array(4);
    let nn = 0;
    for (let j = 0; j < 4; j++) {
      const r = new Float64Array(9);
      const im = new Float64Array(9);
      let q = 0;
      for (let a = 0; a < 4; a++) {
        if (a === l) continue;
        for (let b = 0; b < 4; b++) {
          if (b === j) continue;
          r[q] = br[a * 4 + b];
          im[q] = bi[a * 4 + b];
          q++;
        }
      }
      const [dr, di] = det4c(r, im, 3);
      const s = (j + l) % 2 === 0 ? 1 : -1;
      cr[j] = s * dr;
      ci[j] = s * di;
      nn += dr * dr + di * di;
    }
    if (nn > best) {
      best = nn;
      Ar = cr;
      Ai = ci;
    }
  }
  // residual B A
  let res = 0;
  let scale = 0;
  for (let j = 0; j < 4; j++) {
    let sr = 0;
    let si = 0;
    for (let m = 0; m < 4; m++) {
      sr += br[j * 4 + m] * Ar[m] - bi[j * 4 + m] * Ai[m];
      si += br[j * 4 + m] * Ai[m] + bi[j * 4 + m] * Ar[m];
      scale = Math.max(scale, Math.hypot(br[j * 4 + m], bi[j * 4 + m]) * Math.hypot(Ar[m], Ai[m]));
    }
    res = Math.max(res, Math.hypot(sr, si));
  }
  const depth = new Float64Array(nDepth);
  const comp = [0, 1, 2, 3].map(() => new Float64Array(2 * nDepth));
  for (let i = 0; i < nDepth; i++) {
    const x3 = (-depthMax * i) / (nDepth - 1); // in wavelengths
    depth[i] = x3;
    const kx = 2 * Math.PI * x3; // k x3 with k = 2 pi / lambda (real-part wavelength)
    for (let m = 0; m < 4; m++) {
      const { ar, ai, xr, xi } = pws[m];
      // exp(i k alpha x3) = exp(-ai kx) [cos(ar kx) + i sin(ar kx)]
      const mag = Math.exp(-ai * kx);
      const er = mag * Math.cos(ar * kx);
      const ei = mag * Math.sin(ar * kx);
      const cr = Ar[m] * er - Ai[m] * ei;
      const ci = Ar[m] * ei + Ai[m] * er;
      for (let c = 0; c < 4; c++) {
        comp[c][2 * i] += cr * xr[c] - ci * xi[c];
        comp[c][2 * i + 1] += cr * xi[c] + ci * xr[c];
      }
    }
  }
  // normalize to max |u|
  let umax = 0;
  for (let i = 0; i < nDepth; i++)
    for (let c = 0; c < 3; c++) umax = Math.max(umax, Math.hypot(comp[c][2 * i], comp[c][2 * i + 1]));
  for (let c = 0; c < 4; c++) for (let q = 0; q < 2 * nDepth; q++) comp[c][q] /= umax;
  // orbit: retrograde iff Im(U1 conj(U3)) < 0 at the surface (exp(-i w t) phasors, x3 outward)
  const U1r = comp[0][0];
  const U1i = comp[0][1];
  const U3r = comp[2][0];
  const U3i = comp[2][1];
  const cross = U1i * U3r - U1r * U3i;
  // energy fraction within 1 lambda (trapezoid)
  let tot = 0;
  let near = 0;
  for (let i = 0; i < nDepth; i++) {
    let u2 = 0;
    for (let c = 0; c < 3; c++) u2 += comp[c][2 * i] ** 2 + comp[c][2 * i + 1] ** 2;
    const wgt = i === 0 || i === nDepth - 1 ? 0.5 : 1;
    tot += wgt * u2;
    if (-depth[i] <= 1 + 1e-12) near += (i === 0 || -depth[i] >= 1 - 1e-12 ? 0.5 : 1) * u2;
  }
  return {
    depth,
    comp,
    amp: pws.map((p, m) => ({ re: Ar[m], im: Ai[m], alphaRe: p.ar, alphaIm: p.ai })),
    orbit: cross < 0 ? "retrograde" : "prograde",
    bcResidual: res / scale,
    fracWithin1Lambda: near / tot,
  };
}

// ---------------------------------------------------------------------------------------------
// IDT (F3.6): normalized array factor (delta-function model, Smith et al. 1969 form; normalization only)
// ---------------------------------------------------------------------------------------------
/** Normalized IDT array factor H(f) = sin(X) / (N sin(X/N)), X = N pi (f - f0)/f0; H(f0) = 1 (form specified in C03
 *  figures.md F3.6; one source per period, so it repeats at 2 f0: see idtArrayFactorFingers). */
export function idtArrayFactor(f_Hz: number, f0_Hz: number, N: number): number {
  const X = (N * Math.PI * (f_Hz - f0_Hz)) / f0_Hz;
  const sn = Math.sin(X / N);
  // at X/N = m pi the ratio is 0/0: limit cos(X)/cos(X/N) (L'Hopital)
  return Math.abs(sn) < 1e-9 ? Math.cos(X) / Math.cos(X / N) : Math.sin(X) / (N * sn);
}
/** Array factor of a single-electrode IDT with 2N alternating-polarity finger gaps at spacing p/2:
 *  |H| = |sin X / (2N sin(X / 2N))|. Equal to idtArrayFactor near f0 (same nulls at f0 (1 +- 1/N)), but zero at 2 f0,
 *  where the one-source-per-period form above has a grating lobe (|H(2 f0)| = 1). Use this form beyond about 1.5 f0. */
export function idtArrayFactorFingers(f_Hz: number, f0_Hz: number, N: number): number {
  const X = (N * Math.PI * (f_Hz - f0_Hz)) / f0_Hz;
  const sn = Math.sin(X / (2 * N));
  return Math.abs(sn) < 1e-9 ? Math.abs(Math.cos(X) / Math.cos(X / (2 * N))) : Math.abs(Math.sin(X) / (2 * N * sn));
}
/** Radiation-conductance shape G(f)/G(f0) = (sin X / X)^2. */
export function idtConductanceShape(f_Hz: number, f0_Hz: number, N: number): number {
  const X = (N * Math.PI * (f_Hz - f0_Hz)) / f0_Hz;
  return Math.abs(X) < 1e-12 ? 1 : (Math.sin(X) / X) ** 2;
}
/** Synchronous frequency f0 = v / p (p = electrode period, one finger pair), null-to-null bandwidth 2 f0 / N. */
export const idtF0 = (v_mps: number, period_m: number): number => v_mps / period_m;
export const idtNullBandwidth = (f0_Hz: number, N: number): number => (2 * f0_Hz) / N;
