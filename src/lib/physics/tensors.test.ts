// References:
//   3m forms and Voigt factor rules: weis1985 Eqs. (8), (16)-(17), (19) (R14 rows 61, 68, 74); R06 pitfall 6.
//   Invariance under the 3m generators (threefold z rotation, x mirror) is an independent check of signs and factors.
//   kushibiki1999-inverted compliance (R06 sec. 2.9, C): s11 5.854, s12 -1.182, s13 -1.356, s14 -0.920, s33 5.058, s44 16.949,
//     s66 14.071 (1e-12 m^2/N); strain-charge d = e s (R06 sec. 2.10, C): d15 66.4, d22 20.3, d31 -1.04, d33 8.7 pC/N.
//   Frame flips: R06 pitfalls 2-3 (180 deg about z flips c14, s14, p14, p41, e22, d22, r22; flipping +z flips odd rank).
//   Euler/orientation: R02 sec. 2.2 (ZXY "equiv to (pi/2, pi/2, 0)"; LNX = EulerMatrix[{pi/2,-pi/2,-pi/2},{3,1,3}] with
//     ZXZ angles (theta - pi/2, pi/2, pi/2) at theta = 0; nZYX = X-cut; LNY = EulerMatrix[{-pi/2,-pi/2,pi},{3,1,3}]).
//   COMSOL ordering: R02 sec. 2.2 (D upper triangle column-wise; eES column-major) and the R02 sec. 3 eES vector
//     {0, -2.53764, 0.193644, 0, 2.53764, 0.193644, 0, 0, 1.30863, 0, 3.69548, 0, 3.69594, 0, 0, -2.53384, 0, 0}
//     (COMSOL library values; used only as an ordering fixture); COMSOL global eps example 43.6 / 29.16 (R02 A19).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "./tensors.ts";
import * as C from "./constants.ts";
import { det3, invert, matMul3, transpose3 } from "./linalg.ts";
import type { Mat3 } from "./linalg.ts";
import { createRng } from "./prng.ts";

const maxDiff = T.matrixMaxAbsDiff;
const matEq = (A: number[][], B: number[][], tol: number, msg = "") => assert.ok(maxDiff(A, B) <= tol, `${msg} max diff ${maxDiff(A, B)}`);

const cK = T.c3m(C.CE_KUSHIBIKI1999);
const eK = T.e3m(C.E_KUSHIBIKI1999);
const rT = T.r3m(C.EO_TURNER1966_S);
const pA = T.p3m(C.P_AVAKYANTS1976);
const dS = T.dShg3m(C.D_NLO_VOLK2008_LEGACY);

test("Voigt <-> full round trips for every kind", () => {
  const r = createRng(1);
  const rand = (m: number, n: number) => Array.from({ length: m }, () => Array.from({ length: n }, () => r.uniform(-1, 1)));
  const sym6 = () => { const A = rand(6, 6); return A.map((row, i) => row.map((_, j) => (A[i][j] + A[j][i]) / 2)); };
  for (const k of ["c", "s"] as const) { const M = sym6(); matEq(T.tensor4ToVoigt(T.voigtToTensor4(M, k), k), M, 1e-15, k); }
  for (const k of ["p", "pi"] as const) { const M = rand(6, 6); matEq(T.tensor4ToVoigt(T.voigtToTensor4(M, k), k), M, 1e-15, k); }
  for (const k of ["e", "d", "dSHG"] as const) { const M = rand(3, 6); matEq(T.tensor3ToVoigt(T.voigtToTensor3(M, k), k), M, 1e-15, k); }
  const Mr = rand(6, 3);
  matEq(T.tensor3ToVoigt(T.voigtToTensor3(Mr, "r"), "r"), Mr, 1e-15, "r");
  const v = [1, 2, 3, 4, 5, 6];
  assert.deepEqual(T.tensor2ToVoigt(T.voigtToTensor2(v, "strain"), "strain"), v);
  const Ts = T.voigtToTensor2(v, "strain");
  assert.equal(Ts[1 * 3 + 2], 2); // S23 = S4 / 2
  assert.equal(T.voigtToTensor2(v, "stress")[1 * 3 + 2], 4);
});

test("factor-of-2 rules: s_IJ = f_I f_J s_ijkl, d_iJ = f_J d_ijk, p_IJ = p_ijkl, pi_IJ = f_J pi_ijkl", () => {
  const M = Array.from({ length: 6 }, () => new Array(6).fill(1));
  const s = T.voigtToTensor4(M, "s");
  assert.equal(s[0], 1); // s1111 = s11
  assert.equal(s[0 * 27 + 0 * 9 + 1 * 3 + 2], 0.5); // s1123 = s14 / 2
  assert.equal(s[1 * 27 + 2 * 9 + 1 * 3 + 2], 0.25); // s2323 = s44 / 4
  const pt = T.voigtToTensor4(M, "p");
  assert.equal(pt[1 * 27 + 2 * 9 + 1 * 3 + 2], 1);
  const pit = T.voigtToTensor4(M, "pi");
  assert.equal(pit[0 * 27 + 0 * 9 + 1 * 3 + 2], 0.5);
  const d = T.voigtToTensor3([[1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1]], "d");
  assert.equal(d[0 * 9 + 1 * 3 + 2], 0.5);
  const e = T.voigtToTensor3([[1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1]], "e");
  assert.equal(e[0 * 9 + 1 * 3 + 2], 1);
});

test("3m forms are invariant under the threefold z rotation and the x mirror", () => {
  const sK = T.s3m({ s11: 5.854, s12: -1.182, s13: -1.356, s14: -0.92, s33: 5.058, s44: 16.949 });
  const dK = T.d3m({ d15: 66.4, d22: 20.3, d31: -1.04, d33: 8.7 });
  for (const R of [T.C3_Z, T.MIRROR_X]) {
    matEq(T.rotateVoigt4(cK, "c", R), cK, 1e-12, "c");
    matEq(T.rotateVoigt4(sK, "s", R), sK, 1e-12, "s");
    matEq(T.rotateVoigt4(pA, "p", R), pA, 1e-14, "p");
    matEq(T.rotateVoigt3(eK, "e", R), eK, 1e-14, "e");
    matEq(T.rotateVoigt3(dK, "d", R), dK, 1e-12, "d");
    matEq(T.rotateVoigt3(rT, "r", R), rT, 1e-13, "r");
    matEq(T.rotateVoigt3(dS, "dSHG", R), dS, 1e-13, "dSHG");
    const eps = T.eps3m(C.EPS_S_KUSHIBIKI1999);
    matEq(T.rotateMatrix3(eps, R), eps, 1e-12, "eps");
  }
  // a wrong form (c56 = -c14) is not invariant: the test has teeth
  const bad = cK.map((r) => r.slice());
  bad[4][5] = bad[5][4] = -bad[4][5];
  assert.ok(maxDiff(T.rotateVoigt4(bad, "c", T.C3_Z), bad) > 1);
});

test("kushibiki1999 c^E inverts to the R06 compliance (engineering strain) and c_ijkl s_klmn = I_sym", () => {
  const sV = invert(cK).map((r) => r.map((v) => v * 1e3)); // 1/GPa -> 1e-12 m^2/N
  const ref = T.s3m({ s11: 5.854, s12: -1.182, s13: -1.356, s14: -0.92, s33: 5.058, s44: 16.949 });
  matEq(sV, ref, 1.5e-3, "s from c");
  assert.ok(Math.abs(sV[5][5] - 14.071) < 2e-3);
  const cT = T.voigtToTensor4(cK, "c");
  const sT = T.voigtToTensor4(sV.map((r) => r.map((v) => v * 1e-3)), "s");
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let m = 0; m < 3; m++) for (let n = 0; n < 3; n++) {
    let acc = 0;
    for (let k = 0; k < 3; k++) for (let l = 0; l < 3; l++) acc += cT[i * 27 + j * 9 + k * 3 + l] * sT[k * 27 + l * 9 + m * 3 + n];
    const Isym = 0.5 * ((i === m && j === n ? 1 : 0) + (i === n && j === m ? 1 : 0));
    assert.ok(Math.abs(acc - Isym) < 1e-12);
  }
});

test("strain-charge d = e s^E reproduces the R06 kushibiki1999-derived values (pC/N)", () => {
  const s = invert(cK.map((r) => r.map((v) => v * 1e9))); // m^2/N
  const d = T.matMul(eK, s).map((r) => r.map((v) => v * 1e12)); // pC/N
  assert.ok(Math.abs(d[0][4] - 66.4) < 0.1, `d15 ${d[0][4]}`);
  assert.ok(Math.abs(d[1][1] - 20.3) < 0.1, `d22 ${d[1][1]}`);
  assert.ok(Math.abs(d[2][0] - -1.04) < 0.01, `d31 ${d[2][0]}`);
  assert.ok(Math.abs(d[2][2] - 8.7) < 0.1, `d33 ${d[2][2]}`);
  // the product has the d3m form, including d16 = -2 d22
  matEq(d, T.d3m({ d15: d[0][4], d22: d[1][1], d31: d[2][0], d33: d[2][2] }), 1e-9, "d form");
});

test("rotation round trip R then R^T restores every tensor", () => {
  const R = T.eulerZXZ(0.3, 1.1, -0.7);
  const Rt = transpose3(R);
  matEq(T.rotateVoigt4(T.rotateVoigt4(cK, "c", R), "c", Rt), cK, 1e-11);
  matEq(T.rotateVoigt4(T.rotateVoigt4(pA, "p", R), "p", Rt), pA, 1e-14);
  matEq(T.rotateVoigt3(T.rotateVoigt3(eK, "e", R), "e", Rt), eK, 1e-13);
  matEq(T.rotateVoigt3(T.rotateVoigt3(rT, "r", R), "r", Rt), rT, 1e-13);
});

test("frame flips (R06 pitfalls 2-3): exactly the documented components change sign", () => {
  const flipped = (A: number[][], B: number[][]) => {
    const out: string[] = [];
    A.forEach((row, i) => row.forEach((v, j) => { if (Math.abs(v) > 1e-12 && Math.abs(v + B[i][j]) < 1e-9) out.push(`${i + 1}${j + 1}`); }));
    return out.sort();
  };
  // 180 deg about z
  assert.deepEqual(flipped(cK, T.rotateVoigt4(cK, "c", T.ROT180_Z)), ["14", "24", "41", "42", "56", "65"]); // c14 family
  assert.deepEqual(flipped(eK, T.rotateVoigt3(eK, "e", T.ROT180_Z)), ["16", "21", "22"]); // e22 family
  assert.deepEqual(flipped(rT, T.rotateVoigt3(rT, "r", T.ROT180_Z)), ["12", "22", "61"]); // r22 family
  assert.deepEqual(flipped(pA, T.rotateVoigt4(pA, "p", T.ROT180_Z)), ["14", "24", "41", "42", "56", "65"]); // p14, p41
  assert.deepEqual(flipped(dS, T.rotateVoigt3(dS, "dSHG", T.ROT180_Z)), ["16", "21", "22"]);
  // flip +z: all odd-rank components flip, c and p unchanged
  matEq(T.rotateVoigt3(eK, "e", T.FLIP_Z), eK.map((r) => r.map((v) => -v)), 1e-14, "e flips");
  matEq(T.rotateVoigt3(rT, "r", T.FLIP_Z), rT.map((r) => r.map((v) => -v)), 1e-14, "r flips");
  matEq(T.rotateVoigt3(dS, "dSHG", T.FLIP_Z), dS.map((r) => r.map((v) => -v)), 1e-14, "dSHG flips");
  matEq(T.rotateVoigt4(cK, "c", T.FLIP_Z), cK, 1e-12, "c kept");
  matEq(T.rotateVoigt4(pA, "p", T.FLIP_Z), pA, 1e-14, "p kept");
});

test("Euler ZXZ and the author's orientation names (R02 sec. 2.2)", () => {
  const P = Math.PI / 2;
  matEq(T.eulerZXZ(P, P, 0), T.orientationFromAxes("ZXY"), 1e-15, "ZXY = (pi/2, pi/2, 0)");
  matEq(T.eulerZXZ(P, -P, -P), T.orientationFromAxes("nZYX"), 1e-15, "LNX = nZYX");
  matEq(T.eulerZXZ(-P, P, P), T.orientationFromAxes("nZYX"), 1e-15, "(theta - pi/2, pi/2, pi/2) at theta = 0");
  const lny = matMul3(T.rotZ(0), T.eulerZXZ(-P, -P, Math.PI));
  matEq(lny, T.orientationFromAxes("ZXY"), 1e-15, "LNY at theta = 0");
  // crystal X of nZYX lies along global z (X-cut)
  const R = T.orientationFromAxes("nZYX");
  assert.deepEqual([R[0][0], R[1][0], R[2][0]], [0, 0, 1]);
  assert.throws(() => T.orientationFromAxes("XYnZ"), /proper/);
  assert.throws(() => T.orientationFromAxes("XYY"));
});

test("named cuts are proper rotations; 128 deg Y-X reduces to Y-cut X-prop at 0 deg", () => {
  for (const k of Object.keys(T.NAMED_CUTS) as (keyof typeof T.NAMED_CUTS)[]) assert.ok(Math.abs(det3(T.namedCut(k)) - 1) < 1e-15, k);
  matEq(T.rotatedYCut(0), T.namedCut("Y-cut, X-prop"), 1e-15);
  const R = T.namedCut("128 deg Y-X");
  assert.ok(Math.abs(det3(R) - 1) < 1e-15);
  // plate normal (global z) = cos128 Y + sin128 Z in crystal coordinates (row 3 of R)
  assert.ok(Math.abs(R[2][1] - Math.cos((128 * Math.PI) / 180)) < 1e-15 && Math.abs(R[2][2] - Math.sin((128 * Math.PI) / 180)) < 1e-15);
});

test("Euler angle extraction round trip", () => {
  const r = createRng(2);
  for (let i = 0; i < 100; i++) {
    const R = T.eulerZXZ(r.uniform(-3, 3), r.uniform(0.01, 3.1), r.uniform(-3, 3));
    const [a, b, g] = T.eulerZXZFromMatrix(R);
    matEq(T.eulerZXZ(a, b, g), R, 1e-12);
  }
  for (const k of Object.keys(T.NAMED_CUTS) as (keyof typeof T.NAMED_CUTS)[]) {
    const R = T.namedCut(k);
    const [a, b, g] = T.eulerZXZFromMatrix(R);
    matEq(T.eulerZXZ(a, b, g), R, 1e-12, k);
  }
});

test("COMSOL export order (R02): D upper triangle column-wise, eES column-major", () => {
  const D = Array.from({ length: 6 }, (_, i) => Array.from({ length: 6 }, (_, j) => 10 * (Math.min(i, j) + 1) + Math.max(i, j) + 1));
  assert.deepEqual(T.comsolD(D).slice(0, 6), [11, 12, 22, 13, 23, 33]);
  assert.equal(T.comsolD(D).length, 21);
  assert.equal(T.comsolD(D)[20], 66);
  matEq(T.fromComsolD(T.comsolD(cK)), cK, 0);
  const ref = [0, -2.53764, 0.193644, 0, 2.53764, 0.193644, 0, 0, 1.30863, 0, 3.69548, 0, 3.69594, 0, 0, -2.53384, 0, 0];
  const v = T.comsolEES(T.e3m({ e15: 3.69594, e22: 2.53764, e31: 0.193644, e33: 1.30863 }));
  assert.equal(v.length, 18);
  v.forEach((x, i) => assert.ok(Math.abs(x - ref[i]) < 5e-3, `index ${i}: ${x} vs ${ref[i]}`));
  matEq(T.fromComsolEES(T.comsolEES(eK)), eK, 0);
});

test("rotated permittivity matches the COMSOL global-frame example (R02 A19: 43.6 / 29.16)", () => {
  const eps = T.eps3m({ eps11: 43.6, eps33: 29.16 });
  const g = T.rotateMatrix3(eps, T.namedCut("X-cut, Y-prop")); // global y = crystal Z
  assert.ok(Math.abs(g[1][1] - 29.16) < 1e-12 && Math.abs(g[0][0] - 43.6) < 1e-12 && Math.abs(g[2][2] - 43.6) < 1e-12);
});

test("R maps crystal components to global: R e_c = global vector", () => {
  const R: Mat3 = T.namedCut("X-cut, Y-prop");
  // crystal Z should be global y
  assert.deepEqual([R[0][2], R[1][2], R[2][2]], [0, 1, 0]);
});
