// References: content/chapters/02-light/manuscript.md eq. 2.18 and the derived asymptotic slope 8.686 asinh(|ln r|/beta) dB/line
// (0.8715 at r = 0.99, beta = 0.1; high-finesse 27.29/(beta F) = 0.873); eq. 2.19 (maximum 1 at G = kappa/2 with
// kappa_ex = kappa); eq. 2.20 (Q_i 1e7 / 2.9e7 / 1.6e8 at n_g 2.3, 1550 nm -> 4.05 / 1.40 / 0.25 dB/m; 1e-4 /cm = 0.043 dB/m);
// figures.md F2-13 acceptance (slopes 0.8715, 0.2177, 0.3477 dB/line; fit over lines 5-40 within 0.001; high-finesse form
// within 0.5% at F > 300; beta -> 0 single line; Parseval to 1e-9; example r = 0.99, beta = 0.314: F 312.6, slope 0.278).
// Note for the audit: the F2-13 example "431 lines above -60 dB" is the asymptotic-envelope estimate; the numerical spectrum
// of eq. 2.18 has 423 lines within 60 dB of the pump line.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as R from "./resonators.ts";
import { alphaFromQ } from "./units.ts";

const close = (a: number, b: number, tol: number, msg = "") => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} vs ${b}`);

test("EO comb asymptotic slope: 0.8715, 0.2177, 0.3477 dB/line; numerical fit over lines 5-40 within 0.001", () => {
  for (const [r, b, want] of [[0.99, 0.1, 0.8715], [0.995, 0.2, 0.2177], [0.998, 0.05, 0.3477]]) {
    const s = R.eoCombSlopeDB(r, b);
    close(s, want, 5e-5, `analytic r=${r}`);
    const c = R.eoCombIntracavity({ r, beta: b, N: 8192, K: 60 });
    close(R.fitLineSlopeDB(c.k, c.P, 5, 40), s, 1e-3, `fit r=${r}`);
    const F = R.finesseFromR(r);
    assert.ok(F > 300);
    assert.ok(Math.abs(R.eoCombSlopeDBHighFinesse(b, F) / s - 1) < 5e-3);
  }
  close(R.eoCombSlopeDBHighFinesse(0.1, R.finesseFromR(0.99)), 0.873, 5e-4);
});

test("EO comb: Parseval to 1e-9; beta -> 0 gives one line; doubling beta halves the high-finesse slope", () => {
  const c = R.eoCombIntracavity({ r: 0.99, beta: 0.314, N: 8192, K: 1000 });
  assert.ok(Math.abs(c.totalLinePower / c.meanPower - 1) < 1e-9);
  const z = R.eoCombIntracavity({ r: 0.99, beta: 0, N: 1024, K: 10 });
  assert.equal(R.countLines(z.P, 200), 1);
  close(R.eoCombSlopeDBHighFinesse(0.2, 300) / R.eoCombSlopeDBHighFinesse(0.1, 300), 0.5, 1e-15);
});

test("EO comb example r = 0.99, beta = 0.314: F 312.6, slope 0.278 dB/line; line count 423 numeric (431 asymptotic estimate)", () => {
  close(R.finesseFromR(0.99), 312.6, 0.05);
  close(R.eoCombSlopeDB(0.99, 0.314), 0.278, 5e-4);
  const c = R.eoCombIntracavity({ r: 0.99, beta: 0.314, N: 8192, K: 1000 });
  assert.equal(R.countLines(c.P, 60), 423);
  assert.equal(R.eoCombLineCountAsymptotic(0.99, 0.314, 60), 431);
});

test("shifter (eq. 2.19): maximum 1 at G = kappa/2 with kappa_ex = kappa; zero at G = 0; symmetric in detuning", () => {
  const k = 1;
  const base = { kappa_a: k, kappa_b: k, kappa_a_ex: k, kappa_b_ex: k };
  close(R.shifterTransfer({ ...base, G: k / 2 }).toShifted, 1, 1e-15);
  close(R.shifterTransfer({ ...base, G: k / 2 }).through, 0, 1e-15);
  assert.equal(R.shifterTransfer({ ...base, G: 0 }).toShifted, 0);
  let best = 0, bestG = 0;
  for (let i = 0; i <= 2000; i++) {
    const G = i * 0.001;
    const v = R.shifterTransfer({ ...base, G }).toShifted;
    if (v > best) { best = v; bestG = G; }
  }
  close(bestG, 0.5, 1e-3);
  // eq. 2.19 closed form with loss
  const p = { kappa_a: 1.3, kappa_b: 0.9, kappa_a_ex: 1.0, kappa_b_ex: 0.6, G: 0.37 };
  const want = (p.kappa_a_ex * p.kappa_b_ex * p.G ** 2) / ((p.kappa_a * p.kappa_b) / 4 + p.G ** 2) ** 2;
  close(R.shifterTransfer(p).toShifted, want, 1e-14);
  for (const d of [0.1, 0.7, 3]) {
    close(R.shifterTransfer({ ...p, delta_b: d }).toShifted, R.shifterTransfer({ ...p, delta_b: -d }).toShifted, 1e-14);
    close(R.shifterTransfer({ ...p, delta_a: d, delta_b: d }).toShifted, R.shifterTransfer({ ...p, delta_a: -d, delta_b: -d }).toShifted, 1e-14);
  }
  // energy: shifted + through <= 1, equality without intrinsic loss
  const lossless = R.shifterTransfer({ ...base, G: 0.31, delta_b: 0.2 });
  close(lossless.toShifted + lossless.through, 1, 1e-14);
});

test("shifter time-domain steady state equals eq. 2.19", () => {
  const p = { kappa_a: 1.3, kappa_b: 0.9, kappa_a_ex: 1.0, kappa_b_ex: 0.6, G: 0.37, delta_b: 0.15 };
  const td = R.shifterTimeDomain({ ...p, s: () => [1, 0], t_end: 120, steps: 24000, every: 100 });
  const ss = R.shifterTransfer(p);
  close(td.Pshift[td.Pshift.length - 1], ss.toShifted, 1e-10);
  close(td.Pthrough[td.Pthrough.length - 1], ss.through, 1e-10);
  assert.equal(td.Pshift[0], 0);
});

test("Q and loss (eq. 2.20): 4.05 / 1.40 / 0.25 dB/m at n_g 2.3, 1550 nm; 1e-4 /cm = 0.043 dB/m; inverse round trip", () => {
  [[1e7, 4.05, 0.005], [2.9e7, 1.4, 0.005], [1.6e8, 0.25, 0.005]].forEach(([Q, want, tol]) => {
    const l = R.qToLoss({ Q, ng: 2.3, lam_um: 1.55 });
    close(l.dB_per_m, want, tol, `Q ${Q}`);
    close(R.lossToQ({ dB_per_m: l.dB_per_m, ng: 2.3, lam_um: 1.55 }) / Q, 1, 1e-12);
    close(l.alpha_per_m, alphaFromQ(Q, 2.3, 1.55), 1e-12 * l.alpha_per_m);
  });
  close(R.perCmToDbPerM(1e-4), 0.043, 5e-4);
  // figures.md F2-16 output example prints 0.322 /m (= 1.40 dB/m / 4.343, from the rounded dB value); exact is 0.3215 /m
  close(R.qToLoss({ Q: 2.9e7, ng: 2.3, lam_um: 1.55 }).alpha_per_m, 0.3215, 5e-5);
});
