// References: reduced single-center band transport (Kukhtarev et al. 1978/79) in the relaxation-time form of R11 S8:
// tau = eps0 eps_r / (sigma_d + sigma_ph); photovoltaic saturation E = -j_pv/(sigma_d + sigma_ph) (Glass 1974); MgO
// photoconductivity factor about 100 above 4.5 at.% (Bryan 1984, abstract). Checks: analytic limits, closed-form steady state
// of the 1D model, zero field for uniform illumination with mean(E) = 0.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as P from "./photorefractive.ts";
import { EPS0 } from "./constants.ts";

const p = P.PR_TEMPLATE.params;

test("relaxation times and saturation field", () => {
  assert.ok(Math.abs(P.darkRelaxationTime(p) - (EPS0 * p.eps_r) / p.sigmaDark_S_per_m) < 1e-6);
  assert.ok(Math.abs(P.relaxationTime(p, 1e4) - (EPS0 * p.eps_r) / (p.sigmaDark_S_per_m + p.kPh * 1e4)) < 1e-15);
  // template: tau(1e4 W/m^2) ~ 1 s, |E_sat| ~ 1e7 V/m when sigma_ph >> sigma_d
  assert.ok(Math.abs(P.relaxationTime(p, 1e4) - 1) < 1e-3);
  assert.ok(Math.abs(P.saturationField(p, 1e4) + 1e7) / 1e7 < 1e-3);
  assert.equal(P.PR_TEMPLATE.prov.kPh.status, "template");
});

test("build-up and dark decay follow single exponentials", () => {
  const I = 1e4;
  const tau = P.relaxationTime(p, I);
  const Es = P.saturationField(p, I);
  assert.ok(Math.abs(P.fieldAt(p, I, 0, tau) - Es * (1 - Math.exp(-1))) < 1e-9 * Math.abs(Es));
  assert.ok(Math.abs(P.fieldAt(p, I, 0, 1e3 * tau) - Es) < 1e-9 * Math.abs(Es));
  const td = P.darkRelaxationTime(p);
  assert.ok(Math.abs(P.fieldAt(p, 0, Es, td) - Es * Math.exp(-1)) < 1e-9 * Math.abs(Es));
  const seq = P.fieldSequence(p, [{ I_W_per_m2: I, duration_s: 5 * tau }, { I_W_per_m2: 0, duration_s: 0.01 * td }], 10);
  assert.ok(Math.abs(seq.E[10] - P.fieldAt(p, I, 0, 5 * tau)) < 1e-9);
  assert.ok(Math.abs(seq.E[20]) < Math.abs(seq.E[10]));
});

test("MgO above threshold collapses the saturation field by about the photoconductivity factor", () => {
  const pm = { ...p, cMg: 5.0 };
  const pl = { ...p, cMg: 1.0 };
  const I = 1e4;
  const ratio = P.saturationField(p, I) / P.saturationField(pm, I);
  assert.ok(ratio > 50 && ratio < 101, `ratio ${ratio}`);
  assert.ok(Math.abs(P.saturationField(pl, I) / P.saturationField(p, I) - 1) < 1e-5, "well below threshold: unchanged");
  assert.ok(P.mgoMultiplier({ ...p, cMg: 4.5 }) > 49 && P.mgoMultiplier({ ...p, cMg: 4.5 }) < 52);
});

test("1D model: converges to the closed-form steady state; uniform light gives zero field", () => {
  const n = 128;
  const I = Float64Array.from({ length: n }, (_, i) => 1e4 * Math.exp(-(((i - 64) / 8) ** 2)));
  const steady = P.field1DSteady(p, I);
  const E = P.field1D(p, I, 50 * P.darkRelaxationTime(p), 400);
  let maxd = 0, maxE = 0;
  for (let i = 0; i < n; i++) { maxd = Math.max(maxd, Math.abs(E[i] - steady[i])); maxE = Math.max(maxE, Math.abs(steady[i])); }
  assert.ok(maxd < 1e-6 * maxE, `max diff ${maxd} of ${maxE}`);
  const mean = E.reduce((s, v) => s + v, 0) / n;
  assert.ok(Math.abs(mean) < 1e-9 * maxE);
  const U = P.field1DSteady(p, new Float64Array(n).fill(1e4));
  assert.ok(U.every((v) => Math.abs(v) < 1e-6));
  // field in the bright spot opposes the photovoltaic current (negative for kPv > 0)
  assert.ok(steady[64] < 0);
});

test("index change sign and magnitude", () => {
  assert.ok(Math.abs(P.deltaNe(2.2, 30.8, -1e7) - 0.5 * 2.2 ** 3 * 30.8e-12 * 1e7) < 1e-18);
});
