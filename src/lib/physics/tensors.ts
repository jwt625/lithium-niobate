// Tensor conventions: Voigt <-> full tensors (rank 2, 3, 4), rotations, 3m forms, frame flips, COMSOL export order.
//
// Voigt map (IEEE 176-1987, Nye; R06 pitfall 6; R02 A12 code): 1 = xx, 2 = yy, 3 = zz, 4 = yz, 5 = xz, 6 = xy.
// Shear strain is engineering (S4 = 2 S23). Factor rules (f_J = 1 for J <= 3, 2 for J >= 4):
//   stiffness c_IJ = c_ijkl                     (no factor)
//   compliance s_IJ = f_I f_J s_ijkl             (factors 1, 2, 4)
//   piezo e_iJ = e_ijk                           (stress-charge, no factor)
//   piezo d_iJ = f_J d_ijk                       (strain-charge, factor 2 on shear)
//   EO r_Ik = r_ijk                              (Delta(1/n^2)_I = r_Ik E_k, no factor)
//   SHG d_iJ = d_ijk                             (factor 2 lives in the field-product vector)
//   photoelastic p_IJ = p_ijkl                   (Delta B_I = p_IJ S_J with engineering S; no factor; p_IJ != p_JI)
//   piezo-optic pi_IJ = f_J pi_ijkl
//   rank-2: stress-like v_I = T_ij; strain-like v_I = f_I S_ij
//
// Rotation: a matrix R maps component vectors from the material (crystal) frame to the global frame,
// v_g = R v_m, and tensors transform as T'_ij.. = R_ia R_jb .. T_ab... Columns of R are the crystal axes
// written in global coordinates.
// Euler angles: ZXZ, R = Rz(alpha) Rx(beta) Rz(gamma) (intrinsic), the COMSOL rotated-system convention recorded
// in the author's notes (R02 sec. 2.2: "the Euler rotation rotates the coordinates, hence the same matrix rotates
// quantities in rotated coordinates to the global coordinates"; Mathematica EulerMatrix[{a, b, g}, {3, 1, 3}]).
import { det3, matMul3 } from "./linalg.ts";
import type { Mat3 } from "./linalg.ts";

export type Matrix = number[][];
export type Tensor = Float64Array; // rank 2: 9, rank 3: 27, rank 4: 81; index i*3^(r-1) + ... (row-major)

export const VOIGT_PAIRS: readonly (readonly [number, number])[] = [
  [0, 0],
  [1, 1],
  [2, 2],
  [1, 2],
  [0, 2],
  [0, 1],
];
const VI = [
  [0, 5, 4],
  [5, 1, 3],
  [4, 3, 2],
];
/** Voigt index (0-based) of the symmetric pair (i, j). */
export const voigtIndex = (i: number, j: number): number => VI[i][j];
const fJ = (J: number): number => (J < 3 ? 1 : 2);

export type Rank2Kind = "stress" | "strain";
export type Rank3Kind = "e" | "d" | "dSHG" | "r";
export type Rank4Kind = "c" | "s" | "p" | "pi";

// ---------- rank 2 ----------
export function voigtToTensor2(v: readonly number[], kind: Rank2Kind): Tensor {
  const T = new Float64Array(9);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      const I = VI[i][j];
      T[i * 3 + j] = kind === "strain" ? v[I] / fJ(I) : v[I];
    }
  return T;
}
export function tensor2ToVoigt(T: Tensor, kind: Rank2Kind): number[] {
  return VOIGT_PAIRS.map(([i, j], I) => (kind === "strain" ? fJ(I) : 1) * T[i * 3 + j]);
}
export const matrix3ToTensor2 = (M: readonly (readonly number[])[]): Tensor => Float64Array.from(M.flat());
export const tensor2ToMatrix3 = (T: Tensor): Mat3 => [
  [T[0], T[1], T[2]],
  [T[3], T[4], T[5]],
  [T[6], T[7], T[8]],
];

// ---------- rank 3 ----------
/** Voigt matrix to full rank-3 tensor. e, d, dSHG are 3x6 (row i, column J); r is 6x3 (row I = ij, column k). */
export function voigtToTensor3(M: Matrix, kind: Rank3Kind): Tensor {
  const T = new Float64Array(27);
  for (let a = 0; a < 3; a++)
    for (let b = 0; b < 3; b++)
      for (let c = 0; c < 3; c++) {
        let v: number;
        if (kind === "r") v = M[VI[a][b]][c]; // r_abc, (ab) symmetric
        else {
          const J = VI[b][c];
          v = kind === "d" ? M[a][J] / fJ(J) : M[a][J];
        }
        T[a * 9 + b * 3 + c] = v;
      }
  return T;
}
export function tensor3ToVoigt(T: Tensor, kind: Rank3Kind): Matrix {
  if (kind === "r") return VOIGT_PAIRS.map(([i, j]) => [0, 1, 2].map((k) => T[i * 9 + j * 3 + k]));
  return [0, 1, 2].map((i) => VOIGT_PAIRS.map(([j, k], J) => (kind === "d" ? fJ(J) : 1) * T[i * 9 + j * 3 + k]));
}

// ---------- rank 4 ----------
export function voigtToTensor4(M: Matrix, kind: Rank4Kind): Tensor {
  const T = new Float64Array(81);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      for (let k = 0; k < 3; k++)
        for (let l = 0; l < 3; l++) {
          const I = VI[i][j];
          const J = VI[k][l];
          let f = 1;
          if (kind === "s") f = fJ(I) * fJ(J);
          else if (kind === "pi") f = fJ(J);
          T[i * 27 + j * 9 + k * 3 + l] = M[I][J] / f;
        }
  return T;
}
export function tensor4ToVoigt(T: Tensor, kind: Rank4Kind): Matrix {
  return VOIGT_PAIRS.map(([i, j], I) =>
    VOIGT_PAIRS.map(([k, l], J) => {
      let f = 1;
      if (kind === "s") f = fJ(I) * fJ(J);
      else if (kind === "pi") f = fJ(J);
      return f * T[i * 27 + j * 9 + k * 3 + l];
    }),
  );
}

// ---------- rotation of full tensors ----------
export function rotateTensor2(T: Tensor, R: Mat3): Tensor {
  const out = new Float64Array(9);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      let s = 0;
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) s += R[i][a] * R[j][b] * T[a * 3 + b];
      out[i * 3 + j] = s;
    }
  return out;
}
export function rotateTensor3(T: Tensor, R: Mat3): Tensor {
  // sequential contraction: 3 passes of 27x3
  let A = T;
  for (let pass = 0; pass < 3; pass++) {
    const B = new Float64Array(27);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        for (let k = 0; k < 3; k++) {
          let s = 0;
          for (let a = 0; a < 3; a++) {
            const idx = pass === 0 ? a * 9 + j * 3 + k : pass === 1 ? i * 9 + a * 3 + k : i * 9 + j * 3 + a;
            const r = pass === 0 ? R[i][a] : pass === 1 ? R[j][a] : R[k][a];
            s += r * A[idx];
          }
          B[i * 9 + j * 3 + k] = s;
        }
    A = B;
  }
  return A;
}
export function rotateTensor4(T: Tensor, R: Mat3): Tensor {
  let A = T;
  const strides = [27, 9, 3, 1];
  for (let pass = 0; pass < 4; pass++) {
    const B = new Float64Array(81);
    const st = strides[pass];
    for (let idx = 0; idx < 81; idx++) {
      const digit = Math.floor(idx / st) % 3;
      const base = idx - digit * st;
      B[idx] = R[digit][0] * A[base] + R[digit][1] * A[base + st] + R[digit][2] * A[base + 2 * st];
    }
    A = B;
  }
  return A;
}

/** Rotate a Voigt matrix through its full tensor (factor rules applied both ways). */
export function rotateVoigt3(M: Matrix, kind: Rank3Kind, R: Mat3): Matrix {
  return tensor3ToVoigt(rotateTensor3(voigtToTensor3(M, kind), R), kind);
}
export function rotateVoigt4(M: Matrix, kind: Rank4Kind, R: Mat3): Matrix {
  return tensor4ToVoigt(rotateTensor4(voigtToTensor4(M, kind), R), kind);
}
export function rotateMatrix3(M: readonly (readonly number[])[], R: Mat3): Mat3 {
  return tensor2ToMatrix3(rotateTensor2(matrix3ToTensor2(M), R));
}

// ---------- rotation matrices ----------
export const rotX = (t: number): Mat3 => [
  [1, 0, 0],
  [0, Math.cos(t), -Math.sin(t)],
  [0, Math.sin(t), Math.cos(t)],
];
export const rotY = (t: number): Mat3 => [
  [Math.cos(t), 0, Math.sin(t)],
  [0, 1, 0],
  [-Math.sin(t), 0, Math.cos(t)],
];
export const rotZ = (t: number): Mat3 => [
  [Math.cos(t), -Math.sin(t), 0],
  [Math.sin(t), Math.cos(t), 0],
  [0, 0, 1],
];
/** ZXZ Euler matrix R = Rz(alpha) Rx(beta) Rz(gamma), angles in rad (COMSOL rotated system; R02 sec. 2.2). */
export const eulerZXZ = (alpha: number, beta: number, gamma: number): Mat3 => matMul3(matMul3(rotZ(alpha), rotX(beta)), rotZ(gamma));

/** ZXZ Euler angles (rad) of a proper rotation matrix; beta in [0, pi]. At beta = 0 or pi, gamma = 0. */
export function eulerZXZFromMatrix(R: Mat3): [number, number, number] {
  const beta = Math.acos(Math.max(-1, Math.min(1, R[2][2])));
  if (Math.abs(Math.sin(beta)) < 1e-12) {
    // beta = 0: R = Rz(alpha + gamma); beta = pi: R = Rz(alpha) Rx(pi) Rz(gamma). Put everything in alpha (gamma = 0);
    // in both cases the first column of R is (cos alpha, sin alpha, 0).
    return [Math.atan2(R[1][0], R[0][0]), beta, 0];
  }
  return [Math.atan2(R[0][2], -R[1][2]), beta, Math.atan2(R[2][0], R[2][1])];
}

/** Orientation from the author's three-letter naming (R02 sec. 2.2): letters name the crystal axes that lie along
 *  global x, y, z in order; a leading "n" negates that axis. Example: "nZYX" = crystal -Z along x, Y along y, X along z
 *  (X-cut, "coordA"); "ZXY" = Y-cut with crystal Z along x. Throws unless the result is a proper rotation. */
export function orientationFromAxes(spec: string): Mat3 {
  const tok = spec.match(/n?[XYZ]/g);
  if (!tok || tok.join("") !== spec || tok.length !== 3) throw new Error(`orientation "${spec}": expected three of [n]X/[n]Y/[n]Z`);
  // G rows: global axes in crystal coordinates; v_g = G v_c, so R = G.
  const G: Mat3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  tok.forEach((t, g) => {
    const s = t.startsWith("n") ? -1 : 1;
    const c = "XYZ".indexOf(t[t.length - 1]);
    G[g][c] = s;
  });
  if (Math.abs(det3(G) - 1) > 1e-12) throw new Error(`orientation "${spec}" is not a proper (right-handed) rotation`);
  return G;
}

/** Rotated Y-cut, IEEE 176-1987 notation (YXl)theta: plate normal = crystal Y rotated by theta about crystal X
 *  (positive theta turns +Y toward +Z), propagation along crystal X = global x, global z = plate normal.
 *  theta = 128 deg gives the 128 deg Y-X SAW cut. Returns R (crystal -> global). */
export function rotatedYCut(theta_deg: number): Mat3 {
  const t = (theta_deg * Math.PI) / 180;
  const c = Math.cos(t);
  const s = Math.sin(t);
  // global axes in crystal coordinates (rows): x_g = X, z_g = cY + sZ, y_g = z_g x x_g = sY - cZ
  return [
    [1, 0, 0],
    [0, s, -c],
    [0, c, s],
  ];
}

/** Named cuts. Global z = wafer normal, global x = propagation direction. */
export const NAMED_CUTS = {
  "Z-cut, X-prop": "XYZ",
  "Z-cut, Y-prop": "YnXZ",
  "X-cut, Y-prop": "YZX",
  "X-cut, Z-prop": "ZnYX",
  "Y-cut, X-prop": "XnZY",
  "Y-cut, Z-prop": "ZXY",
} as const;
export type NamedCut = keyof typeof NAMED_CUTS | "128 deg Y-X";
export function namedCut(name: NamedCut): Mat3 {
  if (name === "128 deg Y-X") return rotatedYCut(128);
  return orientationFromAxes(NAMED_CUTS[name]);
}

// ---------- 3m symmetry forms (x perpendicular to a mirror plane, z polar; R06 sec. 2.6-2.11, R14 rows 61, 68, 74) ----------
export function c3m(p: { c11: number; c12: number; c13: number; c14: number; c33: number; c44: number }): Matrix {
  const { c11, c12, c13, c14, c33, c44 } = p;
  const c66 = 0.5 * (c11 - c12);
  return [
    [c11, c12, c13, c14, 0, 0],
    [c12, c11, c13, -c14, 0, 0],
    [c13, c13, c33, 0, 0, 0],
    [c14, -c14, 0, c44, 0, 0],
    [0, 0, 0, 0, c44, c14],
    [0, 0, 0, 0, c14, c66],
  ];
}
export function s3m(p: { s11: number; s12: number; s13: number; s14: number; s33: number; s44: number }): Matrix {
  const { s11, s12, s13, s14, s33, s44 } = p;
  return [
    [s11, s12, s13, s14, 0, 0],
    [s12, s11, s13, -s14, 0, 0],
    [s13, s13, s33, 0, 0, 0],
    [s14, -s14, 0, s44, 0, 0],
    [0, 0, 0, 0, s44, 2 * s14],
    [0, 0, 0, 0, 2 * s14, 2 * (s11 - s12)],
  ];
}
/** Stress-charge piezo e (3x6). */
export function e3m(p: { e15: number; e22: number; e31: number; e33: number }): Matrix {
  const { e15, e22, e31, e33 } = p;
  return [
    [0, 0, 0, 0, e15, -e22],
    [-e22, e22, 0, e15, 0, 0],
    [e31, e31, e33, 0, 0, 0],
  ];
}
/** Strain-charge piezo d (3x6): d16 = -2 d22, d24 = d15, d32 = d31 (weis1985 Eq. 8, R14 row 61). */
export function d3m(p: { d15: number; d22: number; d31: number; d33: number }): Matrix {
  const { d15, d22, d31, d33 } = p;
  return [
    [0, 0, 0, 0, d15, -2 * d22],
    [-d22, d22, 0, d15, 0, 0],
    [d31, d31, d33, 0, 0, 0],
  ];
}
/** SHG d (3x6) with Kleinman symmetry d15 = d24 = d31 (R06 sec. 2.7). */
export function dShg3m(p: { d22: number; d31: number; d33: number }): Matrix {
  const { d22, d31, d33 } = p;
  return [
    [0, 0, 0, 0, d31, -d22],
    [-d22, d22, 0, d31, 0, 0],
    [d31, d31, d33, 0, 0, 0],
  ];
}
/** EO r (6x3): rows xx, yy, zz, yz, xz, xy; columns E_x, E_y, E_z; r42 = r51 (R06 sec. 2.6). */
export function r3m(p: { r13: number; r22: number; r33: number; r51: number }): Matrix {
  const { r13, r22, r33, r51 } = p;
  return [
    [0, -r22, r13],
    [0, r22, r13],
    [0, 0, r33],
    [0, r51, 0],
    [r51, 0, 0],
    [-r22, 0, 0],
  ];
}
/** Photoelastic p (6x6), not symmetric: p56 = p41, p65 = p14, p66 = (p11 - p12)/2 (weis1985 Eq. 19, R14 row 74). */
export function p3m(p: { p11: number; p12: number; p13: number; p14: number; p31: number; p33: number; p41: number; p44: number }): Matrix {
  const { p11, p12, p13, p14, p31, p33, p41, p44 } = p;
  return [
    [p11, p12, p13, p14, 0, 0],
    [p12, p11, p13, -p14, 0, 0],
    [p31, p31, p33, 0, 0, 0],
    [p41, -p41, 0, p44, 0, 0],
    [0, 0, 0, 0, p44, p41],
    [0, 0, 0, 0, p14, 0.5 * (p11 - p12)],
  ];
}
export function eps3m(p: { eps11: number; eps33: number }): Mat3 {
  return [
    [p.eps11, 0, 0],
    [0, p.eps11, 0],
    [0, 0, p.eps33],
  ];
}

// ---------- frame operations (R06 pitfalls 2-3, R14 rows 80-81) ----------
/** 180 deg about z: flips c14, s14, p14, p41, e22, d22, r22 (and SHG d22); keeps the rest. */
export const ROT180_Z: Mat3 = rotZ(Math.PI).map((r) => r.map((v) => Math.round(v))) as Mat3;
/** Flip +z (180 deg about x): flips every odd-rank 3m component (e, d, r, SHG d); keeps c, s, p. */
export const FLIP_Z: Mat3 = rotX(Math.PI).map((r) => r.map((v) => Math.round(v))) as Mat3;
/** Threefold rotation about z and the x mirror: the 3m generators, for invariance checks. */
export const C3_Z: Mat3 = rotZ((2 * Math.PI) / 3);
export const MIRROR_X: Mat3 = [
  [-1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

// ---------- COMSOL export order (R02 sec. 2.2) ----------
/** 6x6 symmetric D (stiffness) as COMSOL's 21-vector: upper triangle column by column {D11, D12, D22, D13, D23, D33, ..., D66}. */
export function comsolD(D: Matrix): number[] {
  const out: number[] = [];
  for (let j = 0; j < 6; j++) for (let i = 0; i <= j; i++) out.push(D[i][j]);
  return out;
}
/** Inverse of comsolD. */
export function fromComsolD(v: readonly number[]): Matrix {
  const D = Array.from({ length: 6 }, () => new Array<number>(6).fill(0));
  let k = 0;
  for (let j = 0; j < 6; j++)
    for (let i = 0; i <= j; i++) {
      D[i][j] = v[k];
      D[j][i] = v[k];
      k++;
    }
  return D;
}
/** 3x6 coupling eES as COMSOL's 18-vector, column-major {e11, e21, e31, e12, e22, ..., e36}. */
export function comsolEES(e: Matrix): number[] {
  const out: number[] = [];
  for (let J = 0; J < 6; J++) for (let i = 0; i < 3; i++) out.push(e[i][J]);
  return out;
}
export function fromComsolEES(v: readonly number[]): Matrix {
  const e = Array.from({ length: 3 }, () => new Array<number>(6).fill(0));
  for (let J = 0; J < 6; J++) for (let i = 0; i < 3; i++) e[i][J] = v[J * 3 + i];
  return e;
}

// ---------- small helpers ----------
export const matrixMaxAbsDiff = (A: Matrix, B: Matrix): number => {
  let m = 0;
  for (let i = 0; i < A.length; i++) for (let j = 0; j < A[i].length; j++) m = Math.max(m, Math.abs(A[i][j] - B[i][j]));
  return m;
};
export const matMul = (A: Matrix, B: Matrix): Matrix => A.map((r) => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
