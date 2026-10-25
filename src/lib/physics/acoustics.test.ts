// References: kushibiki1999 Table II measured velocities (R06 sec. 2.12, P): Z L 7328.20, Z S 3590.41, X L 6544.53,
// Y L 6806.55, Y S 3940.49, X S (resonance) 4750.67 m/s; R06 C check: unstiffened Z L 7102.1 m/s. Isotropic limit and
// rotation invariance (Auld 1973).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as A from "./acoustics.ts";
import * as C from "./constants.ts";
import { c3m, e3m, eps3m, namedCut, rotateMatrix3, rotateVoigt3, rotateVoigt4, rotZ } from "./tensors.ts";
import { matVec3, transpose3 } from "./linalg.ts";
import type { Vec3 } from "./linalg.ts";

const m = A.LN_KUSHIBIKI1999;
const relErr = (a: number, b: number) => Math.abs(a - b) / b;

test("kushibiki1999 velocities reproduced from the kushibiki1999 constants within 0.03%", () => {
  const dirs: Record<string, Vec3> = { X: [1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1] };
  for (const row of C.VELOCITIES_KUSHIBIKI1999) {
    const r = A.christoffel(m, dirs[row.dir]);
    // longitudinal: branch with the largest longitudinal character; shear: closest shear branch
    let v: number;
    if (row.mode === "L") v = r.v[r.lcos.indexOf(Math.max(...r.lcos))];
    else v = [r.v[1], r.v[2]].reduce((best, x) => (Math.abs(x - row.v) < Math.abs(best - row.v) ? x : best));
    assert.ok(relErr(v, row.v) < 3e-4, `${row.mode} ${row.dir}: ${v.toFixed(2)} vs ${row.v}`);
  }
});

test("piezoelectric stiffening along Z: unstiffened 7102.1 m/s (R06 C), stiffened 7328.6", () => {
  assert.ok(Math.abs(A.christoffel(m, [0, 0, 1], false).v[0] - 7102.1) < 0.2);
  assert.ok(Math.abs(A.christoffel(m, [0, 0, 1], true).v[0] - 7328.6) < 0.2);
  const k2 = A.bulkCouplingK2(m, [0, 0, 1]);
  assert.ok(k2[0] > 0.05 && k2[0] < 0.07);
});

test("isotropic limit: v_L = sqrt((lambda + 2 mu)/rho), two degenerate shear branches", () => {
  const lam = 60, mu = 40; // GPa
  const c = c3m({ c11: lam + 2 * mu, c12: lam, c13: lam, c14: 0, c33: lam + 2 * mu, c44: mu });
  const iso = A.acousticMaterial(c, e3m({ e15: 0, e22: 0, e31: 0, e33: 0 }), eps3m({ eps11: 10, eps33: 10 }), 3000);
  for (const n of [[1, 0, 0], [0.3, 0.4, 0.86], [0, 1, 1]] as Vec3[]) {
    const r = A.christoffel(iso, n);
    assert.ok(relErr(r.v[0], Math.sqrt(((lam + 2 * mu) * 1e9) / 3000)) < 1e-12);
    assert.ok(relErr(r.v[1], Math.sqrt((mu * 1e9) / 3000)) < 1e-12 && relErr(r.v[2], r.v[1]) < 1e-12);
  }
});

test("rotation invariance: velocities in the 128 deg Y-X frame along global x equal crystal-X velocities", () => {
  const R = namedCut("128 deg Y-X");
  const cR = rotateVoigt4(c3m(C.CE_KUSHIBIKI1999), "c", R);
  const eR = rotateVoigt3(e3m(C.E_KUSHIBIKI1999), "e", R);
  const epsR = rotateMatrix3(eps3m(C.EPS_S_KUSHIBIKI1999), R);
  const mR = A.acousticMaterial(cR, eR, epsR, C.DENSITY_KUSHIBIKI1999.value);
  const a = A.christoffel(mR, [1, 0, 0]);
  const b = A.christoffel(m, [1, 0, 0]);
  for (let q = 0; q < 3; q++) assert.ok(relErr(a.v[q], b.v[q]) < 1e-12);
  // an arbitrary global direction n equals crystal direction R^T n
  const n: Vec3 = [0.2, 0.7, -0.3];
  const c1 = A.christoffel(mR, n);
  const c2 = A.christoffel(m, matVec3(transpose3(R), n));
  for (let q = 0; q < 3; q++) assert.ok(relErr(c1.v[q], c2.v[q]) < 1e-12);
});

test("threefold symmetry about z and sweep output", () => {
  const n: Vec3 = [0.4, 0.1, 0.9];
  const a = A.christoffel(m, n);
  const b = A.christoffel(m, matVec3(rotZ((2 * Math.PI) / 3), n));
  for (let q = 0; q < 3; q++) assert.ok(relErr(a.v[q], b.v[q]) < 1e-12);
  const sw = A.christoffelSweep(m, [1, 0, 0], [0, 0, 1], 360);
  assert.equal(sw.length, 1080);
  assert.ok(Math.abs(sw[0] - A.christoffel(m, [1, 0, 0]).v[0]) < 1e-9);
  assert.ok(Math.abs(sw[3 * 90] - A.christoffel(m, [0, 0, 1]).v[0]) < 1e-6);
});
