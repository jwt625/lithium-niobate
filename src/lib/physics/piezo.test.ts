// References: IEEE Std 176-1987 Eq. 43 (form relations), Eqs. 124-125 (coupling factors); kushibiki1999 Tables IV-V
// (c^E, e, eps^S, eps^T measured, density); graham1976 via weis1985 p. 198 (d_h = 6.31 pC/N measured);
// content/chapters/03-sound/figures.md F3.1-F3.3 and manuscript sec. 3.1 (derived values computed by lane C03 on
// 2026-10-25 from the kushibiki1999 set, reproduced here); Auld 1973 vol. 1 (group velocity = phase velocity in an
// isotropic solid).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as P from "./piezo.ts";
import { CE_KUSHIBIKI1999, E_KUSHIBIKI1999, EPS_S_KUSHIBIKI1999, EPS_T_KUSHIBIKI1999 } from "./constants.ts";
import { LN_KUSHIBIKI1999, acousticMaterial, christoffel } from "./acoustics.ts";
import { c3m, e3m, eps3m, voigtToTensor3, rotZ } from "./tensors.ts";
import type { Vec3, Mat3 } from "./linalg.ts";

const F = P.convertForms({ cE_GPa: c3m(CE_KUSHIBIKI1999), e_Cm2: e3m(E_KUSHIBIKI1999), epsS_rel: eps3m(EPS_S_KUSHIBIKI1999) });
const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);
const maxRel = (A: number[][], B: number[][]) => {
  let m = 0;
  const s = Math.max(...B.flat().map(Math.abs));
  A.forEach((r, i) => r.forEach((v, j) => (m = Math.max(m, Math.abs(v - B[i][j]) / s))));
  return m;
};
const matMul = (A: number[][], B: number[][]) => A.map((r) => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
const I6 = [0, 1, 2, 3, 4, 5].map((i) => [0, 1, 2, 3, 4, 5].map((j) => (i === j ? 1 : 0)));

test("F3.2: c^E s^E = I, c^D s^D = I, e -> d -> e round trip (rel 1e-12)", () => {
  assert.ok(maxRel(matMul(F.cE, F.sE), I6) < 1e-12);
  assert.ok(maxRel(matMul(F.cD, F.sD), I6) < 1e-12);
  assert.ok(maxRel(matMul(F.d, F.cE), F.e) < 1e-12);
  // h = g c^D and d = eps^T g (IEEE 176 Eq. 43)
  assert.ok(maxRel(matMul(F.g, F.cD), F.h) < 1e-12);
  const dBack = matMul(F.epsT, F.g).map((r) => r.map((v) => v * 8.8541878128e-12));
  assert.ok(maxRel(dBack, F.d) < 1e-12);
});

test("F3.1/F3.2: eps^T 83.34 / 28.48 vs measured 83.3 / 28.5; d values; d16 = -2 d22", () => {
  assert.ok(Math.abs(F.epsT[0][0] - 83.34) < 0.005 && Math.abs(F.epsT[2][2] - 28.48) < 0.005, `${F.epsT[0][0]} ${F.epsT[2][2]}`);
  assert.ok(Math.abs(F.epsT[0][0] - EPS_T_KUSHIBIKI1999.eps11) < 0.8 && Math.abs(F.epsT[2][2] - EPS_T_KUSHIBIKI1999.eps33) < 0.3);
  const pC = (x: number) => x * 1e12;
  assert.ok(Math.abs(pC(F.d[0][4]) - 66.4) < 0.05);
  assert.ok(Math.abs(pC(F.d[1][1]) - 20.3) < 0.05);
  assert.ok(Math.abs(pC(F.d[2][0]) + 1.04) < 0.005);
  assert.ok(Math.abs(pC(F.d[2][2]) - 8.69) < 0.005);
  assert.ok(Math.abs(F.d[0][5] + 2 * F.d[1][1]) < 1e-12 * Math.abs(F.d[1][1]) + 1e-25);
  assert.ok(Math.abs(pC(P.hydrostaticD(F.d)) - 6.62) < 0.005, `d_h ${pC(P.hydrostaticD(F.d))}`);
});

test("F3.2: c33^D 249.35, c44^D 93.45 GPa; g33 0.0345 V m/N; h33 8.01e9 V/m; g15 g22 h15 h22 (rel 1e-3)", () => {
  assert.ok(rel(F.cD[2][2] / 1e9, 249.35) < 1e-3, `${F.cD[2][2]}`);
  assert.ok(rel(F.cD[3][3] / 1e9, 93.45) < 1e-3, `${F.cD[3][3]}`);
  assert.ok(rel(F.g[2][2], 0.0345) < 2e-3, `${F.g[2][2]}`);
  assert.ok(rel(F.h[2][2], 8.01e9) < 1e-3);
  assert.ok(rel(F.g[0][4], 0.09) < 2e-3 && rel(F.g[1][1], 0.0275) < 2e-3, `${F.g[0][4]} ${F.g[1][1]}`);
  assert.ok(rel(F.h[0][4], 9.19e9) < 1e-3 && rel(F.h[1][1], 6.06e9) < 1e-3);
});

test("coupling factors match manuscript 3.1 (k_t 0.247, k15 0.600, k33 0.243, k31 -0.027, kY 0.309)", () => {
  const k = P.couplingFactors(F);
  assert.ok(Math.abs(k.kt - 0.247) < 5e-4 && Math.abs(k.k15 - 0.6) < 5e-4 && Math.abs(k.k33 - 0.243) < 5e-4);
  assert.ok(Math.abs(k.k31 + 0.027) < 5e-4 && Math.abs(k.kY - 0.309) < 5e-4, JSON.stringify(k));
});

test("voigtFactor and cell expansion: s66 has 4 components times 4; c66 no factor; d16 factor 2", () => {
  assert.equal(P.voigtFactor("s", 5, 5), 4);
  assert.equal(P.voigtFactor("s", 0, 5), 2);
  assert.equal(P.voigtFactor("c", 5, 5), 1);
  assert.equal(P.voigtFactor("d", 0, 5), 2);
  assert.equal(P.voigtFactor("e", 0, 5), 1);
  assert.equal(P.voigtCellComponents("s", 5, 5).length, 4);
  assert.deepEqual(P.voigtCellComponents("d", 0, 5), [
    [0, 0, 1],
    [0, 1, 0],
  ]);
  // consistency with the full tensor: d_xxy (full) = d16 / 2
  const dF = voigtToTensor3(F.d, "d");
  assert.ok(Math.abs(dF[0 * 9 + 0 * 3 + 1] * P.voigtFactor("d", 0, 5) - F.d[0][5]) < 1e-25);
});

test("F3.1: d_L(+Y) = 20.30, d_L(+Z) = 8.69, d_L(+X) = 0, d_L(phi 30, theta 90) = -20.30 pC/N; max |d_L| 38.80 at 118.9 deg, 30 deg", () => {
  const dF = voigtToTensor3(F.d, "d");
  const pC = (n: Vec3) => P.longitudinal(dF, n) * 1e12;
  assert.ok(Math.abs(pC([0, 1, 0]) - 20.3) < 0.01);
  assert.ok(Math.abs(pC([0, 0, 1]) - 8.69) < 0.01);
  assert.ok(Math.abs(pC([1, 0, 0])) < 1e-12);
  assert.ok(Math.abs(pC(P.dirFromAngles(Math.PI / 2, Math.PI / 6)) + 20.3) < 0.01);
  // closed form d33 c^3 + (d31 + d15) c s^2 - d22 s^3 sin 3phi
  const [d15, d22, d31, d33] = [F.d[0][4], F.d[1][1], F.d[2][0], F.d[2][2]];
  for (const [t, p] of [
    [0.3, 0.7],
    [1.9, 2.5],
    [2.8, 5.1],
  ]) {
    const cf = d33 * Math.cos(t) ** 3 + (d31 + d15) * Math.cos(t) * Math.sin(t) ** 2 - d22 * Math.sin(t) ** 3 * Math.sin(3 * p);
    assert.ok(Math.abs(P.longitudinal(dF, P.dirFromAngles(t, p)) - cf) < 1e-24);
  }
  const mx = P.longitudinalMaxAbs(dF);
  assert.ok(Math.abs(mx.value * 1e12 + 38.8) < 0.05, `${mx.value * 1e12}`);
  assert.ok(Math.abs((mx.theta * 180) / Math.PI - 118.9) < 0.1, `${(mx.theta * 180) / Math.PI}`);
  const phiDeg = (mx.phi * 180) / Math.PI;
  assert.ok([30, 150, 270].some((p) => Math.abs(phiDeg - p) < 0.1), `${phiDeg}`);
});

test("F3.3 group velocity: isotropic solid gives v_g = v n; LN finite-difference check; PFA zero along Z; threefold symmetry", () => {
  // isotropic test tensor (non-piezo), lambda = 60, mu = 40 GPa
  const iso = acousticMaterial(
    c3m({ c11: 140, c12: 60, c13: 60, c14: 0, c33: 140, c44: 40 }),
    e3m({ e15: 0, e22: 0, e31: 0, e33: 0 }),
    eps3m({ eps11: 1, eps33: 1 }),
    4000,
  );
  const n: Vec3 = [0.3, -0.5, 0.81];
  const r = P.groupVelocity(iso, n, false);
  const nn = Math.hypot(...n);
  for (let q = 0; q < 3; q++) {
    for (let i = 0; i < 3; i++) assert.ok(Math.abs(r.vg[q][i] - (r.v[q] * n[i]) / nn) < 1e-9 * r.v[q]);
    assert.ok(r.pfa[q] < 1e-6);
  }
  // LN, stiffened: compare with central differences of omega(k) = |k| v(k/|k|) for a non-degenerate direction
  const m = LN_KUSHIBIKI1999;
  const k0: Vec3 = [0.41, 0.27, 0.87];
  const g = P.groupVelocity(m, k0, true);
  const omega = (k: Vec3, q: number) => Math.hypot(...k) * christoffel(m, k, true).v[q];
  const kk = Math.hypot(...k0);
  const ku: Vec3 = [k0[0] / kk, k0[1] / kk, k0[2] / kk];
  const h = 1e-6;
  for (let q = 0; q < 3; q++)
    for (let i = 0; i < 3; i++) {
      const kp = ku.slice() as Vec3;
      const km = ku.slice() as Vec3;
      kp[i] += h;
      km[i] -= h;
      const fd = (omega(kp, q) - omega(km, q)) / (2 * h);
      assert.ok(Math.abs(fd - g.vg[q][i]) < 1e-4 * g.v[q], `q${q} i${i} fd ${fd} an ${g.vg[q][i]}`);
    }
  // along Z the longitudinal mode has zero power-flow angle; group speed equals phase speed
  const z = P.groupVelocity(m, [0, 0, 1], true);
  assert.ok(z.pfa[0] < 1e-9);
  assert.ok(Math.abs(Math.hypot(...z.vg[0]) - z.v[0]) < 1e-6);
  // threefold: rotating the direction by 120 deg about Z rotates v_g by 120 deg
  const R: Mat3 = rotZ((2 * Math.PI) / 3);
  const n1: Vec3 = [0.8, 0.1, 0.59];
  const n2: Vec3 = [R[0][0] * n1[0] + R[0][1] * n1[1], R[1][0] * n1[0] + R[1][1] * n1[1], n1[2]];
  const a = P.groupVelocity(m, n1, true);
  const b = P.groupVelocity(m, n2, true);
  for (let q = 0; q < 3; q++) {
    const rv: Vec3 = [R[0][0] * a.vg[q][0] + R[0][1] * a.vg[q][1], R[1][0] * a.vg[q][0] + R[1][1] * a.vg[q][1], a.vg[q][2]];
    for (let i = 0; i < 3; i++) assert.ok(Math.abs(rv[i] - b.vg[q][i]) < 1e-7 * a.v[q]);
    assert.ok(Math.abs(a.pfa[q] - b.pfa[q]) < 1e-9);
  }
});
