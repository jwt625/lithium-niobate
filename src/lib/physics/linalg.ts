// Small dense linear algebra helpers (3x3, 2x2, generic real). Row-major nested arrays.

export type Vec3 = [number, number, number];
export type Mat3 = [Vec3, Vec3, Vec3];

export const identity3 = (): Mat3 => [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

export function matMul3(A: Mat3, B: Mat3): Mat3 {
  const C = identity3();
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) C[i][j] = A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j];
  return C;
}
export const transpose3 = (A: Mat3): Mat3 => [
  [A[0][0], A[1][0], A[2][0]],
  [A[0][1], A[1][1], A[2][1]],
  [A[0][2], A[1][2], A[2][2]],
];
export const matVec3 = (A: Mat3, v: Vec3): Vec3 => [
  A[0][0] * v[0] + A[0][1] * v[1] + A[0][2] * v[2],
  A[1][0] * v[0] + A[1][1] * v[1] + A[1][2] * v[2],
  A[2][0] * v[0] + A[2][1] * v[1] + A[2][2] * v[2],
];
export const dot3 = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross3 = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm3 = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);
export const normalize3 = (a: Vec3): Vec3 => {
  const n = norm3(a);
  return [a[0] / n, a[1] / n, a[2] / n];
};
export const det3 = (A: Mat3): number =>
  A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
  A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
  A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);

/** Symmetric 3x3 eigen-decomposition by cyclic Jacobi rotations (exact to rounding).
 *  Returns eigenvalues ascending and unit eigenvectors (vectors[i] belongs to values[i]). */
export function eigSym3(A: Mat3): { values: Vec3; vectors: Mat3 } {
  const a: Mat3 = [
    [A[0][0], A[0][1], A[0][2]],
    [A[1][0], A[1][1], A[1][2]],
    [A[2][0], A[2][1], A[2][2]],
  ];
  const v = identity3();
  const scale = Math.abs(a[0][0]) + Math.abs(a[1][1]) + Math.abs(a[2][2]) + Math.abs(a[0][1]) + Math.abs(a[0][2]) + Math.abs(a[1][2]);
  for (let sweep = 0; sweep < 64; sweep++) {
    const off = a[0][1] ** 2 + a[0][2] ** 2 + a[1][2] ** 2;
    if (off <= (1e-34 * scale) ** 2 || off === 0) break;
    for (let p = 0; p < 2; p++)
      for (let q = p + 1; q < 3; q++) {
        const apq = a[p][q];
        if (apq === 0) continue;
        const th = (a[q][q] - a[p][p]) / (2 * apq);
        const t = (th >= 0 ? 1 : -1) / (Math.abs(th) + Math.sqrt(th * th + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < 3; k++) {
          const akp = a[k][p];
          const akq = a[k][q];
          a[k][p] = c * akp - s * akq;
          a[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < 3; k++) {
          const apk = a[p][k];
          const aqk = a[q][k];
          a[p][k] = c * apk - s * aqk;
          a[q][k] = s * apk + c * aqk;
        }
        for (let k = 0; k < 3; k++) {
          const vkp = v[k][p];
          const vkq = v[k][q];
          v[k][p] = c * vkp - s * vkq;
          v[k][q] = s * vkp + c * vkq;
        }
      }
  }
  const idx = [0, 1, 2].sort((i, j) => a[i][i] - a[j][j]);
  const values: Vec3 = [a[idx[0]][idx[0]], a[idx[1]][idx[1]], a[idx[2]][idx[2]]];
  const vectors: Mat3 = [
    [v[0][idx[0]], v[1][idx[0]], v[2][idx[0]]],
    [v[0][idx[1]], v[1][idx[1]], v[2][idx[1]]],
    [v[0][idx[2]], v[1][idx[2]], v[2][idx[2]]],
  ];
  return { values, vectors };
}

/** Symmetric 2x2 [[a, b], [b, c]]: eigenvalues lo <= hi and the angle of the hi eigenvector (rad, from axis 1 toward axis 2). */
export function eigSym2(a: number, b: number, c: number): { lo: number; hi: number; thetaHi: number } {
  const m = 0.5 * (a + c);
  const d = Math.hypot(0.5 * (a - c), b);
  return { lo: m - d, hi: m + d, thetaHi: 0.5 * Math.atan2(2 * b, a - c) };
}

/** Solve a dense real linear system A x = b by Gaussian elimination with partial pivoting (A row-major, n x n). */
export function solveLinear(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(M[i][k]) > Math.abs(M[p][k])) p = i;
    if (M[p][k] === 0) throw new Error("solveLinear: singular matrix");
    [M[k], M[p]] = [M[p], M[k]];
    for (let i = k + 1; i < n; i++) {
      const f = M[i][k] / M[k][k];
      for (let j = k; j <= n; j++) M[i][j] -= f * M[k][j];
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n];
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
    x[i] = s / M[i][i];
  }
  return x;
}

/** Invert a dense real n x n matrix. */
export function invert(A: number[][]): number[][] {
  const n = A.length;
  const cols: number[][] = [];
  for (let j = 0; j < n; j++) {
    const e = new Array<number>(n).fill(0);
    e[j] = 1;
    cols.push(solveLinear(A, e));
  }
  return A.map((_, i) => cols.map((c) => c[i]));
}

/** Bisection root finder on [a, b]; f(a), f(b) must bracket a sign change. Returns NaN otherwise. */
export function bisect(f: (x: number) => number, a: number, b: number, tol = 1e-12, maxIter = 200): number {
  let fa = f(a);
  const fb = f(b);
  if (fa === 0) return a;
  if (fb === 0) return b;
  if (!(fa * fb < 0)) return Number.NaN;
  for (let i = 0; i < maxIter; i++) {
    const m = 0.5 * (a + b);
    const fm = f(m);
    if (fm === 0 || 0.5 * (b - a) < tol) return m;
    if (fa * fm < 0) b = m;
    else {
      a = m;
      fa = fm;
    }
  }
  return 0.5 * (a + b);
}
