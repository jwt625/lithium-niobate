// References: Bogaerts et al., Laser Photon. Rev. 6, 47 (2012) (all-pass/add-drop forms, critical coupling r = a, FSR,
// finesse); R11 S7 validation (critical coupling, FSR, EO comb closed form vs coupled-mode model at zero dispersion).
// Independent checks: numerical FWHM of the transmission curve; Parseval for the lossless comb; tridiagonal CMT solver.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as R from "./ring.ts";

test("all-pass: critical coupling r = a gives T = 0 on resonance; lossless ring is all-pass", () => {
  assert.ok(R.allPass(0, 0.97, 0.97) < 1e-28);
  for (const phi of [0, 0.1, 1, 3]) assert.ok(Math.abs(R.allPass(phi, 0.9, 1) - 1) < 1e-14);
  const [tr, ti] = R.allPassField(0.37, 0.95, 0.98);
  assert.ok(Math.abs(tr * tr + ti * ti - R.allPass(0.37, 0.95, 0.98)) < 1e-14);
});

test("add-drop: lossless ring conserves power; symmetric critical coupling drops everything on resonance", () => {
  for (const phi of [0, 0.2, 2]) {
    const { through, drop } = R.addDrop(phi, 0.95, 0.9, 1);
    assert.ok(Math.abs(through + drop - 1) < 1e-14);
  }
  const r = R.addDrop(0, 0.95, 0.95, 1);
  assert.ok(r.through < 1e-28 && Math.abs(r.drop - 1) < 1e-14);
});

test("FWHM (exact phase form) equals the measured width of the all-pass dip; finesse approx at high finesse", () => {
  const r = 0.99, a = 0.995;
  const fw = R.fwhmPhase(r, a);
  // T = 1 - (1 - a^2)(1 - r^2)/D(phi): fwhmPhase is the width where the Airy denominator D doubles, i.e. half depth
  // relative to unity
  const Tmin = R.allPass(0, r, a);
  const target = (1 + Tmin) / 2;
  let lo = 0, hi = 0.5;
  for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (R.allPass(m, r, a) < target) lo = m; else hi = m; }
  assert.ok(Math.abs(2 * lo - fw) / fw < 1e-9, `${2 * lo} vs ${fw}`);
  assert.ok(Math.abs(R.finesse(r, a) - R.finesseApprox(r, a)) / R.finesse(r, a) < 1e-4);
});

test("Q relations and FSR", () => {
  const lam = 1.55, ng = 2.3, L = 2 * Math.PI * 100; // um
  const r = 0.995, a = 0.997;
  const QL = R.loadedQ(lam, ng, L, r, a);
  const Qi = R.intrinsicQ(lam, ng, L, a);
  const Qc = R.couplingQ(lam, ng, L, r);
  assert.ok(Math.abs(1 / QL - (1 / Qi + 1 / Qc)) * QL < 2e-3, "1/QL = 1/Qi + 1/Qc (high finesse)");
  assert.ok(Math.abs(R.fsrWavelength(lam, ng, L) - (lam * lam) / (ng * L)) < 1e-16);
  assert.ok(Math.abs(R.fsrFrequency(ng, L * 1e-6) - 299792458 / (ng * L * 1e-6)) < 1e-3);
  assert.ok(Math.abs(R.singlePassA(10, 1e-3) - Math.exp(-5e-3)) < 1e-16);
  // EO shift: dn_eff = 1e-5 at ng = 2.3 -> 6.74 pm
  assert.ok(Math.abs(R.eoShift(1.55, 1e-5, 2.3) - 1.55e-5 / 2.3) < 1e-18);
});

test("EO comb: beta = 0 gives one line equal to the CW transmission; lossless comb conserves power; symmetric at phi0 = 0", () => {
  const c0 = R.eoCombThrough({ r: 0.98, a: 0.99, beta: 0, phi0: 0.01, K: 8 });
  assert.ok(Math.abs(c0.P[8] - R.allPass(0.01, 0.98, 0.99)) < 1e-12);
  assert.ok(c0.P.every((p, i) => i === 8 || p < 1e-24));
  const c1 = R.eoCombThrough({ r: 0.98, a: 1, beta: 0.8, K: 2047, N: 4096 });
  const tot = c1.P.reduce((s, p) => s + p, 0);
  assert.ok(Math.abs(tot - 1) < 1e-9, `Parseval ${tot}`);
  const c2 = R.eoCombThrough({ r: 0.98, a: 0.99, beta: 0.8, K: 20 });
  for (let k = 1; k <= 20; k++) assert.ok(Math.abs(c2.P[20 + k] - c2.P[20 - k]) < 1e-12 * Math.max(1e-30, c2.P[20 + k]) + 1e-20);
  // lines fall off away from the carrier
  assert.ok(c2.P[21] > c2.P[25] && c2.P[25] > c2.P[35]);
});

test("EO comb drop port: beta = 0 equals the add-drop CW drop transmission", () => {
  const d = R.eoCombDrop({ r1: 0.98, r2: 0.98, a: 0.995, beta: 0, phi0: 0.003, K: 4 });
  assert.ok(Math.abs(d.P[4] - R.addDrop(0.003, 0.98, 0.98, 0.995).drop) < 1e-12);
});

test("EO comb: closed form vs coupled-mode sideband model at zero dispersion (high finesse) agree to 3%", () => {
  const r = 0.995, a = 0.998, beta = 0.3;
  const Trt = 1e-10; // 10 GHz FSR
  const cf = R.eoCombThrough({ r, a, beta, K: 30, N: 8192 });
  const cmt = R.eoCombCMT({ kappaEx_per_s: (1 - r * r) / Trt, kappa0_per_s: (1 - a * a) / Trt, beta, Trt_s: Trt, K: 200 });
  const K0 = 200;
  for (const k of [1, 2, 5, 10, 20]) {
    const p1 = cf.P[30 + k];
    const p2 = cmt.P[K0 + k];
    assert.ok(Math.abs(p1 - p2) / p1 < 0.03, `line ${k}: closed ${p1} vs CMT ${p2}`);
  }
  // dispersion narrows the comb
  const disp = R.eoCombCMT({ kappaEx_per_s: (1 - r * r) / Trt, kappa0_per_s: (1 - a * a) / Trt, beta, Trt_s: Trt, K: 200, D2_rad_per_s: 2 * Math.PI * 2e6 });
  assert.ok(disp.P[K0 + 40] < cmt.P[K0 + 40]);
});
