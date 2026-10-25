// 2D electrostatics of coplanar electrodes on a layered, uniaxial dielectric stack (finite volume, node-centred potential,
// cell-centred permittivity), solved by conjugate gradients preconditioned with a modified incomplete Cholesky (MIC) factorization.
//   d/dx (eps_x dphi/dx) + d/dz (eps_z dphi/dz) = 0
// Geometry: z = 0 is the electrode plane, z > 0 the cover (air by default), z < 0 the stack (layers listed top to bottom).
// Electrodes are zero-thickness Dirichlet strips on z = 0. Lateral boundary: periodic or Neumann (symmetry plane / far
// field); bottom: grounded (phi = 0) or Neumann; top: Neumann or grounded. Grids are tensor-product, graded towards
// electrode edges and layer interfaces. Per-unit-length energy W = (eps0/2) sum_edges c_e (dphi_e)^2; for a two-level
// drive (electrodes at V and 0) the capacitance per unit length is C = 2 W / V^2.
// Validation (electrostatics.test.ts): conformal-mapping CPW and CPS capacitances (rf.ts; Qucs Eqs. 12.2-12.9), exact
// parallel-plate series capacitance, anisotropic scaling equivalence. Status of results: derived (numerical).
import { EPS0 } from "./constants.ts";

export interface StackLayer {
  name?: string;
  thickness_m: number;
  epsX: number;
  epsZ: number;
}
export interface StripElectrode {
  x0_m: number;
  x1_m: number;
  V: number;
}
export interface Stack2DOpts {
  layers: StackLayer[];
  cover?: { epsX: number; epsZ: number };
  coverHeight_m: number;
  xMin_m: number;
  xMax_m: number;
  electrodes: StripElectrode[];
  lateral?: "periodic" | "neumann";
  bottom?: "ground" | "neumann";
  top?: "neumann" | "ground";
  /** finest spacing (at electrode edges and interfaces), coarsest spacing, geometric growth ratio */
  hMin_m: number;
  hMax_m: number;
  growth?: number;
  /** extra x or z coordinates to include as grid lines */
  xExtra_m?: number[];
  zExtra_m?: number[];
  tol?: number;
  maxIter?: number;
  /** modified-IC compensation factor in [0, 1) (0 = D-ILU / IC(0)); default 0.95 */
  mic?: number;
}
export interface Stack2DResult {
  x: Float64Array;
  z: Float64Array;
  nx: number;
  nz: number;
  /** potential, row-major phi[j * nx + i] at (x[i], z[j]) */
  phi: Float64Array;
  iterations: number;
  relResidual: number;
  /** stored energy per unit length (J/m) */
  energy_J_per_m: number;
  periodic: boolean;
  /** lateral period (periodic) or domain width (neumann), m */
  period_m: number;
}

/** Graded 1D axis on [lo, hi] containing every key point, spacing ~ hMin + (growth - 1) d up to hMax (d = distance to the
 *  nearest key point). */
export function gradedAxis(lo: number, hi: number, keys: number[], hMin: number, hMax: number, growth = 1.2): Float64Array {
  const K = Array.from(new Set([lo, hi, ...keys.filter((k) => k >= lo && k <= hi)])).sort((a, b) => a - b);
  const spacing = (x: number) => {
    let d = Infinity;
    for (const k of K) d = Math.min(d, Math.abs(x - k));
    return Math.min(hMax, hMin + (growth - 1) * d);
  };
  const pts: number[] = [lo];
  for (let s = 0; s + 1 < K.length; s++) {
    const a = K[s];
    const b = K[s + 1];
    if (b - a < 1e-15 * Math.max(1, Math.abs(b))) continue;
    let x = a;
    for (;;) {
      const h = spacing(x + 0.5 * spacing(x));
      if (x + 1.5 * h >= b) {
        if (b - x > 1.0 * h) pts.push(0.5 * (x + b));
        pts.push(b);
        break;
      }
      x += h;
      pts.push(x);
    }
  }
  return Float64Array.from(pts);
}

interface Assembled {
  nUnk: number;
  idx: Int32Array; // node -> unknown index or -1 (Dirichlet)
  nodeOf: Int32Array; // unknown -> node
  diag: Float64Array;
  nbr: Int32Array; // 4 per unknown: unknown index or -1
  coef: Float64Array; // 4 per unknown (positive)
  b: Float64Array;
  edges: { a: Int32Array; bnode: Int32Array; c: Float64Array };
}

function layerAt(o: Stack2DOpts, zMid: number): { epsX: number; epsZ: number } {
  if (zMid > 0) return o.cover ?? { epsX: 1, epsZ: 1 };
  let top = 0;
  for (const l of o.layers) {
    const bot = top - l.thickness_m;
    if (zMid >= bot) return l;
    top = bot;
  }
  return o.layers[o.layers.length - 1];
}

/** Solve the 2D problem. Throws if CG does not reach tol within maxIter. */
export function solveStack2D(o: Stack2DOpts): Stack2DResult {
  const periodic = (o.lateral ?? "neumann") === "periodic";
  const g = o.growth ?? 1.2;
  const xKeys = [...o.electrodes.flatMap((e) => [e.x0_m, e.x1_m]), ...(o.xExtra_m ?? [])];
  let depth = 0;
  const zKeys = [0, ...(o.zExtra_m ?? [])];
  for (const l of o.layers) {
    depth += l.thickness_m;
    zKeys.push(-depth);
  }
  const xFull = gradedAxis(o.xMin_m, o.xMax_m, xKeys, o.hMin_m, o.hMax_m, g);
  const z = gradedAxis(-depth, o.coverHeight_m, zKeys, o.hMin_m, o.hMax_m, g);
  const period = o.xMax_m - o.xMin_m;
  const x = periodic ? xFull.slice(0, xFull.length - 1) : xFull;
  const nx = x.length;
  const nz = z.length;
  const N = nx * nz;
  const j0 = z.findIndex((v) => Math.abs(v) < 1e-18 * Math.max(1, depth));
  if (j0 < 0) throw new Error("z = 0 not on the grid");
  // Dirichlet values
  const fixed = new Float64Array(N).fill(Number.NaN);
  for (let i = 0; i < nx; i++)
    for (const e of o.electrodes) if (x[i] >= e.x0_m - 1e-15 && x[i] <= e.x1_m + 1e-15) fixed[j0 * nx + i] = e.V;
  if ((o.bottom ?? "ground") === "ground") for (let i = 0; i < nx; i++) fixed[i] = 0;
  if ((o.top ?? "neumann") === "ground") for (let i = 0; i < nx; i++) fixed[(nz - 1) * nx + i] = 0;
  // cell materials per row of cells (between z[j] and z[j+1])
  const cex = new Float64Array(nz - 1);
  const cez = new Float64Array(nz - 1);
  for (let j = 0; j < nz - 1; j++) {
    const m = layerAt(o, 0.5 * (z[j] + z[j + 1]));
    cex[j] = m.epsX;
    cez[j] = m.epsZ;
  }
  const dxE = (i: number) => (i + 1 < nx ? x[i + 1] - x[i] : periodic ? x[0] + period - x[i] : 0);
  const dxW = (i: number) => (i > 0 ? x[i] - x[i - 1] : periodic ? x[0] + period - x[nx - 1] : 0);
  // edges: horizontal (i -> i+1) and vertical (j -> j+1), each with its coefficient
  const ea: number[] = [];
  const eb: number[] = [];
  const ec: number[] = [];
  for (let j = 0; j < nz; j++) {
    const dzn = j + 1 < nz ? z[j + 1] - z[j] : 0;
    const dzs = j > 0 ? z[j] - z[j - 1] : 0;
    const exn = j + 1 < nz ? cex[j] : 0;
    const exs = j > 0 ? cex[j - 1] : 0;
    const vert = 0.5 * (exn * dzn + exs * dzs);
    for (let i = 0; i < nx; i++) {
      const de = dxE(i);
      if (de > 0) {
        ea.push(j * nx + i);
        eb.push(j * nx + ((i + 1) % nx));
        ec.push(vert / de);
      }
      if (j + 1 < nz) {
        const w = 0.5 * (dxE(i) + dxW(i));
        ea.push(j * nx + i);
        eb.push((j + 1) * nx + i);
        ec.push((cez[j] * w) / dzn);
      }
    }
  }
  const nE = ec.length;
  const edges = { a: Int32Array.from(ea), bnode: Int32Array.from(eb), c: Float64Array.from(ec) };
  // unknown numbering
  const idx = new Int32Array(N).fill(-1);
  const nodeList: number[] = [];
  for (let n = 0; n < N; n++) if (Number.isNaN(fixed[n])) idx[n] = nodeList.push(n) - 1;
  const nUnk = nodeList.length;
  const diag = new Float64Array(nUnk);
  const nbr = new Int32Array(4 * nUnk).fill(-1);
  const coef = new Float64Array(4 * nUnk);
  const fill = new Uint8Array(nUnk);
  const b = new Float64Array(nUnk);
  for (let e = 0; e < nE; e++) {
    const A = edges.a[e];
    const B = edges.bnode[e];
    const c = edges.c[e];
    const ua = idx[A];
    const ub = idx[B];
    if (ua >= 0) {
      diag[ua] += c;
      if (ub >= 0) {
        nbr[4 * ua + fill[ua]] = ub;
        coef[4 * ua + fill[ua]++] = c;
      } else b[ua] += c * fixed[B];
    }
    if (ub >= 0) {
      diag[ub] += c;
      if (ua >= 0) {
        nbr[4 * ub + fill[ub]] = ua;
        coef[4 * ub + fill[ub]++] = c;
      } else b[ub] += c * fixed[A];
    }
  }
  const asm: Assembled = { nUnk, idx, nodeOf: Int32Array.from(nodeList), diag, nbr, coef, b, edges };
  const { u, iterations, relResidual } = pcgMIC(asm, o.tol ?? 1e-10, o.maxIter ?? 20000, o.mic ?? 0.95);
  const phi = new Float64Array(N);
  for (let n = 0; n < N; n++) phi[n] = idx[n] >= 0 ? u[idx[n]] : fixed[n];
  let W = 0;
  for (let e = 0; e < nE; e++) W += edges.c[e] * (phi[edges.a[e]] - phi[edges.bnode[e]]) ** 2;
  return { x, z, nx, nz, phi, iterations, relResidual, energy_J_per_m: 0.5 * EPS0 * W, periodic, period_m: period };
}

function applyA(a: Assembled, v: Float64Array, out: Float64Array): void {
  const { nUnk, diag, nbr, coef } = a;
  for (let k = 0; k < nUnk; k++) {
    let s = diag[k] * v[k];
    for (let m = 0; m < 4; m++) {
      const l = nbr[4 * k + m];
      if (l >= 0) s -= coef[4 * k + m] * v[l];
    }
    out[k] = s;
  }
}
/** Diagonal of the (modified) incomplete factorization M = (Dt + L) Dt^-1 (Dt + U), natural ordering, sparsity of A:
 *  Dt_k = A_kk - sum_{l<k, l~k} (A_kl / Dt_l) (A_lk + c sum_{m>l, m~l, m!=k} A_lm). c = 0: D-ILU (equal to IC(0) for the
 *  5-point stencil); c -> 1: modified IC (row sums preserved), here c = 0.95 by default. */
function micDiagonal(a: Assembled, c: number): Float64Array {
  const { nUnk, diag, nbr, coef } = a;
  const d = new Float64Array(nUnk);
  const upSum = new Float64Array(nUnk); // sum_{m>l} A_lm = -sum coef over upper neighbours
  for (let l = 0; l < nUnk; l++) {
    let s = 0;
    for (let m = 0; m < 4; m++) {
      const q = nbr[4 * l + m];
      if (q > l) s -= coef[4 * l + m];
    }
    upSum[l] = s;
  }
  for (let k = 0; k < nUnk; k++) {
    let v = diag[k];
    for (let m = 0; m < 4; m++) {
      const l = nbr[4 * k + m];
      if (l >= 0 && l < k) {
        const akl = -coef[4 * k + m]; // symmetric: A_lk = A_kl
        v -= (akl / d[l]) * (akl + c * (upSum[l] - akl));
      }
    }
    d[k] = v > 1e-12 * diag[k] ? v : diag[k];
  }
  return d;
}
function precond(a: Assembled, d: Float64Array, r: Float64Array, z: Float64Array): void {
  const { nUnk, nbr, coef } = a;
  for (let k = 0; k < nUnk; k++) {
    let s = r[k];
    for (let m = 0; m < 4; m++) {
      const l = nbr[4 * k + m];
      if (l >= 0 && l < k) s += coef[4 * k + m] * z[l];
    }
    z[k] = s / d[k];
  }
  for (let k = 0; k < nUnk; k++) z[k] *= d[k];
  for (let k = nUnk - 1; k >= 0; k--) {
    let s = z[k];
    for (let m = 0; m < 4; m++) {
      const l = nbr[4 * k + m];
      if (l > k) s += coef[4 * k + m] * z[l];
    }
    z[k] = s / d[k];
  }
}
function pcgMIC(a: Assembled, tol: number, maxIter: number, c: number): { u: Float64Array; iterations: number; relResidual: number } {
  const n = a.nUnk;
  const u = new Float64Array(n);
  const r = Float64Array.from(a.b);
  const zv = new Float64Array(n);
  const p = new Float64Array(n);
  const q = new Float64Array(n);
  let bnorm = 0;
  for (let k = 0; k < n; k++) bnorm += a.b[k] * a.b[k];
  bnorm = Math.sqrt(bnorm) || 1;
  const d = micDiagonal(a, c);
  precond(a, d, r, zv);
  p.set(zv);
  let rz = 0;
  for (let k = 0; k < n; k++) rz += r[k] * zv[k];
  let it = 0;
  let rn = bnorm;
  for (; it < maxIter; it++) {
    applyA(a, p, q);
    let pq = 0;
    for (let k = 0; k < n; k++) pq += p[k] * q[k];
    const al = rz / pq;
    rn = 0;
    for (let k = 0; k < n; k++) {
      u[k] += al * p[k];
      r[k] -= al * q[k];
      rn += r[k] * r[k];
    }
    rn = Math.sqrt(rn);
    if (rn <= tol * bnorm) {
      it++;
      break;
    }
    precond(a, d, r, zv);
    let rz2 = 0;
    for (let k = 0; k < n; k++) rz2 += r[k] * zv[k];
    const be = rz2 / rz;
    rz = rz2;
    for (let k = 0; k < n; k++) p[k] = zv[k] + be * p[k];
  }
  if (rn > tol * bnorm) throw new Error(`solveStack2D: CG did not converge (rel residual ${rn / bnorm})`);
  return { u, iterations: it, relResidual: rn / bnorm };
}

/** Capacitance per unit length (F/m) for a two-level drive (electrodes at V and 0): C = 2 W / V^2. */
export const capacitancePerLength = (r: Stack2DResult, V: number): number => (2 * r.energy_J_per_m) / (V * V);

/** Field components (V/m) at grid nodes by finite differences on the non-uniform grid (central inside, one-sided at
 *  edges; periodic wrap in x when periodic). Values at electrode edges are grid-limited (the true field is singular). */
/** Nodal field by central differences. At a material interface the nodal Ez is the average of the two one-sided
 *  values (Ez is discontinuous there); use meanFieldInBox for in-layer averages. */
export function nodalField(r: Stack2DResult): { Ex: Float64Array; Ez: Float64Array } {
  const { x, z, nx, nz, phi, periodic, period_m } = r;
  const Ex = new Float64Array(nx * nz);
  const Ez = new Float64Array(nx * nz);
  for (let j = 0; j < nz; j++)
    for (let i = 0; i < nx; i++) {
      const n = j * nx + i;
      let il = i - 1;
      let ir = i + 1;
      let xl = x[i - 1];
      let xr = x[i + 1];
      if (i === 0) {
        il = periodic ? nx - 1 : 0;
        xl = periodic ? x[nx - 1] - period_m : x[0];
      }
      if (i === nx - 1) {
        ir = periodic ? 0 : nx - 1;
        xr = periodic ? x[0] + period_m : x[nx - 1];
      }
      Ex[n] = -(phi[j * nx + ir] - phi[j * nx + il]) / (xr - xl);
      const jl = Math.max(0, j - 1);
      const jr = Math.min(nz - 1, j + 1);
      Ez[n] = -(phi[jr * nx + i] - phi[jl * nx + i]) / (z[jr] - z[jl]);
    }
  return { Ex, Ez };
}

function locate(a: Float64Array, v: number): [number, number] {
  if (v <= a[0]) return [0, 0];
  if (v >= a[a.length - 1]) return [a.length - 2, 1];
  let lo = 0;
  let hi = a.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (a[m] <= v) lo = m;
    else hi = m;
  }
  return [lo, (v - a[lo]) / (a[lo + 1] - a[lo])];
}

/** Potential and field at (x, z) by bilinear interpolation of nodal values. */
export function fieldAt(r: Stack2DResult, F: { Ex: Float64Array; Ez: Float64Array }, x_m: number, z_m: number): { phi: number; Ex: number; Ez: number } {
  const [i, tx] = locate(r.x, x_m);
  const [j, tz] = locate(r.z, z_m);
  const nx = r.nx;
  const bl = (A: Float64Array) =>
    (1 - tx) * (1 - tz) * A[j * nx + i] + tx * (1 - tz) * A[j * nx + i + 1] + (1 - tx) * tz * A[(j + 1) * nx + i] + tx * tz * A[(j + 1) * nx + i + 1];
  return { phi: bl(r.phi), Ex: bl(F.Ex), Ez: bl(F.Ez) };
}

/** Field along a vertical line x = x_m at every grid z in [zMin, zMax]. */
export function fieldVsDepth(r: Stack2DResult, F: { Ex: Float64Array; Ez: Float64Array }, x_m: number, zMin_m = -Infinity, zMax_m = Infinity): { z: Float64Array; Ex: Float64Array; Ez: Float64Array; phi: Float64Array } {
  const zs = Array.from(r.z).filter((v) => v >= zMin_m && v <= zMax_m);
  const out = { z: Float64Array.from(zs), Ex: new Float64Array(zs.length), Ez: new Float64Array(zs.length), phi: new Float64Array(zs.length) };
  zs.forEach((zz, k) => {
    const f = fieldAt(r, F, x_m, zz);
    out.Ex[k] = f.Ex;
    out.Ez[k] = f.Ez;
    out.phi[k] = f.phi;
  });
  return out;
}

/** Area-weighted mean of (Ex, Ez) over the rectangle [x0, x1] x [z0, z1] (control-volume weights of the grid nodes
 *  inside), V/m. For an electro-optic overlap with a uniform mode window. */
/** Area-weighted mean field over a box, from cell-centred fields of the bilinear potential (each grid cell lies in one
 *  material when interfaces sit on grid lines, so the average does not mix Ez across an interface; the nodal central
 *  difference does, PHY2 audit 2026-10-25). F is accepted for API compatibility and not used. */
export function meanFieldInBox(r: Stack2DResult, _F: { Ex: Float64Array; Ez: Float64Array }, x0: number, x1: number, z0: number, z1: number): { Ex: number; Ez: number } {
  const nx = r.nx;
  let sx = 0;
  let sz = 0;
  let sw = 0;
  for (let j = 0; j + 1 < r.nz; j++) {
    const wz = Math.max(0, Math.min(z1, r.z[j + 1]) - Math.max(z0, r.z[j]));
    if (wz === 0) continue;
    const dz = r.z[j + 1] - r.z[j];
    for (let i = 0; i + 1 < nx; i++) {
      const wx = Math.max(0, Math.min(x1, r.x[i + 1]) - Math.max(x0, r.x[i]));
      if (wx === 0) continue;
      const dx = r.x[i + 1] - r.x[i];
      const p00 = r.phi[j * nx + i];
      const p01 = r.phi[j * nx + i + 1];
      const p10 = r.phi[(j + 1) * nx + i];
      const p11 = r.phi[(j + 1) * nx + i + 1];
      const w = wx * wz;
      sx += (w * -(p01 + p11 - p00 - p10)) / (2 * dx);
      sz += (w * -(p10 + p11 - p00 - p01)) / (2 * dz);
      sw += w;
    }
  }
  return { Ex: sw ? sx / sw : Number.NaN, Ez: sw ? sz / sw : Number.NaN };
}
