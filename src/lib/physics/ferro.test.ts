// References: C01 manuscript Sec. 9 L2 (Q/A = 2 Ps = 142 uC/cm^2 at Ps 0.71, 160 at 0.80; 6.5 mC for a 76.2 mm wafer), Sec. 8 L2
// wafer-voltage table (10.5 / 21 kV congruent, 3.0 / 6.0 kV near-SLN, 0.9 / 1.8 kV near-SLN + 2% MgO), Sec. 10 L2
// (sigma_b = 0.025 C/m^2 = 1.5e13 e/cm^2 at 1 deg; FIG-01-10 acceptance 0.0248 C/m^2, 1.55e13 e/cm^2), Sec. 2 L2 (depolarizing
// field 2.9e9 V/m for Ps 0.71, eps33 28); FIG-01-08 construction (Er = Ec_fwd - 2 Eint, centre at Eint offset); FIG-01-09 acceptance
// (charge integral = 2 Ps A within 0.5 %, hexagonal facets along the three wall directions, determinism, backswitching vs Ec/2 hold);
// KAI form X = 1 - exp(-(t/t0)^n) (note-R11 Sec. S9 via C01 Sec. 9 L3). Template rates are exercised only for qualitative behaviour.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as F from "./ferro.ts";
import { createRng } from "./prng.ts";

const near = (a: number, b: number, tol: number, msg = "") => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} vs ${b}`);
const P = F.POLING_TEMPLATE.params;

test("closed forms: switched charge, wafer voltages, bound charge, depolarizing field", () => {
  near(F.switchedCharge(0.71, 1e-4) * 1e6, 142, 1e-9); // uC per cm^2
  near(F.switchedCharge(0.8, 1e-4) * 1e6, 160, 1e-9);
  near(F.switchedCharge(0.71, Math.PI * 0.0381 ** 2) * 1e3, 6.5, 0.05);
  const rows: [number, number, number][] = [
    [21e6, 0.5e-3, 10.5e3],
    [21e6, 1e-3, 21e3],
    [6.0e6, 0.5e-3, 3.0e3],
    [6.0e6, 1e-3, 6.0e3],
    [1.8e6, 0.5e-3, 0.9e3],
    [1.8e6, 1e-3, 1.8e3],
  ];
  for (const [Ec, t, V] of rows) near(F.coerciveVoltage(Ec, t), V, 1e-9);
  const sb = F.boundCharge(0.71, Math.PI / 180);
  assert.equal(Math.round(sb * 1e4) / 1e4, 0.0248);
  assert.equal(Math.round((F.sheetDensity(sb) / 1e4) / 1e11) / 100, 1.55); // 1.55e13 per cm^2
  assert.equal(Math.round(F.depolarizingField(0.71, 28) / 1e8) / 10, 2.9);
});

test("quartic well (template shape): minima at +-1, barrier U0, tilt reduces it to zero at 8 U0/(3 sqrt 3)", () => {
  const U0 = 2858;
  near(F.quarticWell(1, U0), 0, 1e-12);
  near(F.quarticWell(-1, U0), 0, 1e-12);
  near(F.quarticWell(0, U0), U0, 1e-12);
  near(F.quarticBarrier(U0, 0), U0, 1e-9);
  for (const tilt of [100, 1000, 3000, 4000]) {
    // brute force on a fine grid: first local minimum (disfavoured, s < 0) and the next local maximum
    const h = 1e-5;
    const U = (s: number) => F.quarticWell(s, U0, tilt);
    let uMin = NaN, uMax = NaN;
    for (let s = -1.5 + h; s < 1.5; s += h) {
      if (Number.isNaN(uMin) && U(s) < U(s - h) && U(s) < U(s + h)) uMin = U(s);
      else if (!Number.isNaN(uMin) && U(s) > U(s - h) && U(s) > U(s + h)) { uMax = U(s); break; }
    }
    near(F.quarticBarrier(U0, tilt), uMax - uMin, 1e-3 * U0, `tilt ${tilt}`);
  }
  assert.equal(F.quarticBarrier(U0, (8 * U0) / (3 * Math.sqrt(3)) + 1), 0);
  assert.equal(F.INBAR1996_WELL.depth_K, 2858);
});

test("loop construction: CLN Ec 21, Eint 2.5 kV/mm gives back switching at 16 kV/mm and centre -2.5 kV/mm", () => {
  const f = F.loopFields(21, 2.5);
  assert.equal(f.Edown, -21);
  assert.equal(f.Eup, 16);
  assert.equal(f.center, -2.5);
  const s = F.loopFields(6, 0);
  assert.equal(s.center, 0);
  near(F.loopBranch(16, 0.71, f.Eup, f.Edown, 0.5, "up"), 0, 1e-15);
  near(F.loopBranch(-21, 0.71, f.Eup, f.Edown, 0.5, "down"), 0, 1e-15);
  assert.ok(F.loopBranch(40, 0.71, f.Eup, f.Edown, 0.5, "up") > 0.7099);
});

test("poling automaton: determinism and seed dependence", () => {
  const V = (t: number) => (t < 0.01 ? 12e3 : 0);
  const a = F.runPoling(P, V, 1e-4, 120, 42);
  const b = F.runPoling(P, V, 1e-4, 120, 42);
  const c = F.runPoling(P, V, 1e-4, 120, 43);
  assert.deepEqual(a.state.s, b.state.s);
  assert.deepEqual(a.area_m2, b.area_m2);
  assert.notDeepEqual(a.state.s, c.state.s);
});

test("consistency (identity by construction, guards the bookkeeping): charge from the current trace equals 2 Ps A of the final map within 0.5 % (ramped pulse, hold at Ec/2)", () => {
  // 1 ms ramp to 12 kV, 9 ms flat, 1 ms ramp down to an Ec/2 hold (5.25 kV); C dV/dt is non-zero on both ramps
  const V = (t: number) => (t < 1e-3 ? 12e3 * (t / 1e-3) : t < 10e-3 ? 12e3 : t < 11e-3 ? 12e3 - 6.75e3 * ((t - 10e-3) / 1e-3) : 5.25e3);
  const r = F.runPoling(P, V, 1e-4, 300, 7);
  const I = F.switchingCurrent(r.t, r.area_m2, P.Ps, P.C_F, r.V);
  const Q = F.switchingChargeFromCurrent(r.t, I, P.C_F, r.V);
  const A = r.area_m2[r.area_m2.length - 1];
  assert.ok(A > 0);
  assert.ok(Math.abs(Q - F.switchedCharge(P.Ps, A)) <= 0.005 * F.switchedCharge(P.Ps, A));
  const D = F.dutyCycle(r.state);
  assert.ok(D > 0.3 && D < 0.75, `duty ${D}`);
});

test("domains facet as hexagons: walls parallel to y and +-60 deg (support function, sixfold)", () => {
  const q = { ...P, nx: 140, ny: 140, period_cols: 140, duty: 1, nuNuc: 0 };
  const st = F.createPolingState(q);
  const c0 = 70 * q.ny + 70;
  st.s[c0] = 1;
  st.tSw[c0] = 0;
  const rng = createRng(2);
  let n = 0;
  for (let k = 0; k < 3000 && n < 4000; k++) {
    F.polingStep(st, 12e3 / q.thickness_m, 1e-4, rng);
    if (k % 10 === 0) { n = 0; for (const v of st.s) n += v; }
  }
  const avg = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
  const hn = [0, 60, 120, 180, 240, 300].map((d) => F.supportFunction(st, (d * Math.PI) / 180));
  const hc = [30, 90, 150, 210, 270, 330].map((d) => F.supportFunction(st, (d * Math.PI) / 180));
  // regular hexagon with facet normals at 0, 60, ... deg: corner/normal = 1/cos 30 = 1.155; disc: 1
  assert.ok(avg(hc) / avg(hn) > 1.07, `ratio ${avg(hc) / avg(hn)}`);
  for (const h of hn) assert.ok(Math.abs(h / avg(hn) - 1) < 0.08, "sixfold");
});

test("backswitching: a pulse shorter than tauStab reverts without hold and survives with an Ec/2 hold", () => {
  const off = F.runPoling(P, (t) => (t < 8e-3 ? 12e3 : 0), 1e-4, 400, 5);
  const hold = F.runPoling(P, (t) => (t < 8e-3 ? 12e3 : 0.5 * P.Ec * P.thickness_m), 1e-4, 400, 5);
  const at8 = off.X[80];
  assert.ok(at8 > 0.2);
  assert.equal(hold.X[80], at8);
  assert.ok(off.X[400] < 0.25 * at8, `no hold ${off.X[400]}`);
  assert.ok(hold.X[400] >= at8, `hold ${hold.X[400]}`);
});

test("KAI fit: exact recovery on the model; automaton uniform-field switching is KAI-like", () => {
  const t = Float64Array.from({ length: 200 }, (_, i) => (i + 1) * 1e-4);
  const X = t.map((x) => F.kaiModel(x, 2.3, 4e-3));
  const f = F.kaiFit(t, X);
  near(f.n, 2.3, 1e-9);
  near(f.t0, 4e-3, 1e-12);
  const q = { ...P, nx: 96, ny: 96, period_cols: 96, duty: 1, interiorNuc: 1 };
  const r = F.runPoling(q, () => 12e3, 1e-4, 400, 9);
  const g = F.kaiFit(r.t, r.X);
  assert.ok(g.used > 10 && g.r2 > 0.9 && g.n > 1 && g.n < 5, JSON.stringify(g));
});
