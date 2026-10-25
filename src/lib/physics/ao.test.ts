// References: content/chapters/03-sound/figures.md F3.7 acceptance (lambda0 1550 nm, f 1 GHz, v 6544.6 m/s:
// Lambda 6.545 um, theta_B,ext 6.80 deg); weis1985 Eq. 20 definitions and p. 201 values (dixon1967 M1 6.65e-7,
// M2 6.99e-15 at n 2.20, rho 4.7e3, v 6.57e3; chang1976 M4 62.9) with the C03 derived consistency check
// (p = 0.287 implied by M2 gives M1 6.64e-7, M4 63.0, M3 1.01e-10 m s^2/kg; manuscript sec. 3.6).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as A from "./ao.ts";

test("F3.7: Lambda 6.545 um and external Bragg angle 6.80 deg at 1550 nm, 1 GHz, 6544.6 m/s", () => {
  const b = A.bragg(1550e-9, 2.1376, 6544.6, 1e9);
  assert.ok(Math.abs(b.Lambda_m * 1e6 - 6.545) < 5e-4);
  assert.ok(Math.abs((b.thetaExt_rad * 180) / Math.PI - 6.8) < 0.01);
  assert.equal(b.shift_Hz, 1e9);
  // internal angle obeys Snell with the external one; K = 2 k sin(theta_int) (Bragg triangle closes)
  assert.ok(Math.abs(2.1376 * Math.sin(b.thetaInt_rad) - Math.sin(b.thetaExt_rad)) < 1e-15);
  assert.ok(Math.abs(2 * b.kOpt * Math.sin(b.thetaInt_rad) - b.K) < 1e-9 * b.K);
  assert.ok(Math.abs(A.braggFrequency(1550e-9, 6544.6, b.thetaExt_rad) - 1e9) < 1e-3);
  assert.ok(Number.isNaN(A.bragg(1550e-9, 2.2, 6544.6, 1e12).thetaExt_rad));
});

test("weis1985 Eq. 20 figures of merit: M2-implied p reproduces M1 6.64e-7, M4 63.0, M3 1.01e-10", () => {
  const n = 2.2;
  const rho = 4.7e3;
  const v = 6.57e3;
  const p = A.pFromM2(6.99e-15, n, rho, v);
  assert.ok(Math.abs(p - 0.287) < 5e-4, `p ${p}`);
  const M = A.aoFiguresOfMerit(n, p, rho, v);
  assert.ok(Math.abs(M.M1 / 6.64e-7 - 1) < 1e-3 + 2e-3, `M1 ${M.M1}`);
  assert.ok(Math.abs(M.M2 / 6.99e-15 - 1) < 1e-12);
  assert.ok(Math.abs(M.M4 - 63.0) < 0.1, `M4 ${M.M4}`);
  assert.ok(Math.abs(M.M3 / 1.01e-10 - 1) < 5e-3, `M3 ${M.M3}`);
  // printed M1 (6.65e-7) and M4 (62.9) agree within 0.3%
  assert.ok(Math.abs(M.M1 / 6.65e-7 - 1) < 3e-3 && Math.abs(M.M4 / 62.9 - 1) < 3e-3);
  // identities: M1 = n v M2 ... M1 / M2 = n v^2; M4 = M1 n v^2
  assert.ok(Math.abs(M.M1 / M.M2 / (n * v * v) - 1) < 1e-12);
  assert.ok(Math.abs(M.M4 / (M.M1 * n * v * v) - 1) < 1e-12);
});
