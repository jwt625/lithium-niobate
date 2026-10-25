// References:
//   R11 A1 and audit C (DevLog/audits/audit-C-verification-2026-10-24.md A02): bulk CLN e-e-e first-order QPM period, Zelmon 21 C:
//     6.818 um (1064 -> 532 nm SHG), 18.989 um (1550 -> 775 nm SHG).
//   Fejer et al., IEEE JQE 28, 2631 (1992): order-m period m Lambda_1, d_eff = (2/(m pi)) sin(m pi D) d; sinc^2 acceptance with
//     FWHM in Delta k = 0.8859 (2 pi / L).
//   Birefringent type I: n_e(theta_pm, 2w) = n_o(w) (definition); walk-off checked in crystaloptics.test.ts.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as PM from "./phasematching.ts";
import * as C from "./constants.ts";
import { indexFn, refractiveIndex } from "./sellmeier.ts";
import { extraordinaryIndex } from "./crystaloptics.ts";

const ne = indexFn(C.ZELMON_CLN_E);
const no = indexFn(C.ZELMON_CLN_O);
const neJ = indexFn(C.JUNDT_CLN_E);

test("bulk CLN QPM periods (R11 A1, audit C A02): 6.818 um and 18.989 um", () => {
  assert.ok(Math.abs(PM.qpmPeriodSHG(1.064, ne) - 6.818) < 5e-4);
  assert.ok(Math.abs(PM.qpmPeriodSHG(1.55, ne) - 18.989) < 5e-4);
  // the general SFG form with l1 = l2 gives the same
  assert.equal(PM.qpmPeriod(1.064, 1.064, { n1: ne, n2: ne, n3: ne }), PM.qpmPeriodSHG(1.064, ne));
});

test("odd orders: Lambda_m = m Lambda_1; d_eff factor (2/(m pi)) sin(m pi D)", () => {
  const L1 = PM.qpmPeriodSHG(1.064, ne);
  assert.ok(Math.abs(PM.qpmPeriodSHG(1.064, ne, 3) - 3 * L1) < 1e-12);
  assert.ok(Math.abs(PM.qpmDeffFactor(1) - 2 / Math.PI) < 1e-15);
  assert.ok(Math.abs(PM.qpmDeffFactor(3) - -2 / (3 * Math.PI)) < 1e-15);
  assert.ok(Math.abs(PM.qpmDeffFactor(2)) < 1e-15);
  assert.ok(Math.abs(PM.qpmDeffFactor(2, 0.25) - 1 / Math.PI) < 1e-15);
  assert.throws(() => PM.qpmPeriodSHG(1.064, ne, 0), RangeError);
  // Delta k vanishes at the computed period
  assert.ok(Math.abs(PM.deltaKQPM(1.064, 1.064, { n1: ne, n2: ne, n3: ne }, L1)) < 1e-12);
});

test("temperature tuning (Jundt CLN, status S): period computed at 100 C phase matches back at 100 C", () => {
  const w = { n1: neJ, n2: neJ, n3: neJ };
  const L100 = PM.qpmPeriod(1.55, 1.55, w, 1, 100);
  const T = PM.qpmTemperature(1.55, 1.55, w, L100, 30, 200);
  assert.ok(Math.abs(T - 100) < 1e-6, `T ${T}`);
  // with thermal expansion the solution moves; alpha_a from volk2008 (P-comp)
  const a = C.THERMAL_EXPANSION_CLN.alpha_a.value;
  const L25 = L100 / (1 + a * 75); // room-temperature period that expands to L100 at 100 C
  const Tx = PM.qpmTemperature(1.55, 1.55, w, L25, 30, 200, { alpha_per_K: a });
  assert.ok(Math.abs(Tx - 100) < 1e-6, `Tx ${Tx}`);
  // ignoring expansion with the same room-temperature period gives a different temperature
  assert.ok(Math.abs(PM.qpmTemperature(1.55, 1.55, w, L25, 30, 200) - 100) > 0.1);
  assert.ok(Number.isNaN(PM.qpmTemperature(1.55, 1.55, w, L100 * 1.2, 30, 200)));
});

test("SFG / DFG energy conservation helpers", () => {
  const l3 = PM.sumWavelength(1.55, 1.064);
  assert.ok(Math.abs(1 / l3 - 1 / 1.55 - 1 / 1.064) < 1e-14);
  assert.ok(Math.abs(PM.differenceWavelength(l3, 1.55) - 1.064) < 1e-12);
});

test("OPO tuning: 1.064 um pump, 30 um period (Zelmon CLN e-e-e, 21 C) gives Delta k = 0 with signal < 2 lambda_p", () => {
  const { signal, idler } = PM.opoSignalIdler(1.064, 30, { ns: ne, ni: ne, np: ne }, 1.2);
  assert.ok(signal > 1.2 && signal < 2.128, `signal ${signal}`);
  assert.ok(Math.abs(1 / signal + 1 / idler - 1 / 1.064) < 1e-12);
  const dk = 2 * Math.PI * (ne(1.064) / 1.064 - ne(signal) / signal - ne(idler) / idler) - (2 * Math.PI) / 30;
  assert.ok(Math.abs(dk) < 1e-9);
});

test("birefringent type I (ooe) SHG angle satisfies n_e(theta, 2w) = n_o(w); impossible types return NaN", () => {
  // Zelmon CLN at 21 C: ne(532) = 2.23357 > no(1064) = 2.23211, so type-I 1064 nm SHG cannot be angle phase matched
  assert.ok(refractiveIndex(C.ZELMON_CLN_E, 0.532) > no(1.064));
  assert.ok(Number.isNaN(PM.birefringentAngle("ooe", 1.064, 1.064, no, ne)));
  const th = PM.birefringentAngle("ooe", 1.55, 1.55, no, ne);
  assert.ok(th > 0 && th < Math.PI / 2, `theta ${th}`);
  const lhs = extraordinaryIndex(th, refractiveIndex(C.ZELMON_CLN_O, 0.775), refractiveIndex(C.ZELMON_CLN_E, 0.775));
  assert.ok(Math.abs(lhs - no(1.55)) < 1e-12);
  assert.ok(Number.isNaN(PM.birefringentAngle("eeo", 1.064, 1.064, no, ne)));
  const t2 = PM.birefringentAngle("oee", 1.55, 1.55, no, ne);
  if (Number.isFinite(t2)) {
    const dk = PM.deltaKMaterial(1.55, 1.55, { n1: no, n2: (l) => extraordinaryIndex(t2, no(l), ne(l)), n3: (l) => extraordinaryIndex(t2, no(l), ne(l)) });
    assert.ok(Math.abs(dk) < 1e-9);
  }
});

test("acceptance: sinc^2 half-maximum constant and FWHM vs direct measurement of the tuning curve", () => {
  assert.ok(Math.abs(PM.sinc2(PM.SINC2_HALF_X) - 0.5) < 1e-15);
  assert.ok(Math.abs((4 * PM.SINC2_HALF_X) / (2 * Math.PI) - 0.8859) < 1e-4, "Fejer 0.886 (2 pi / L)");
  const L_mm = 10;
  const per = PM.qpmPeriodSHG(1.55, ne);
  const fw = PM.shgWavelengthAcceptance(1.55, ne, L_mm);
  // measure the curve's half-maximum points by bisection
  const f = (l: number) => PM.shgTuningCurve([l], ne, per, L_mm)[0] - 0.5;
  const step = fw;
  const lo = (() => { let a = 1.55 - step, b = 1.55; for (let i = 0; i < 80; i++) { const m = (a + b) / 2; if (f(m) < 0) a = m; else b = m; } return (a + b) / 2; })();
  const hi = (() => { let a = 1.55, b = 1.55 + step; for (let i = 0; i < 80; i++) { const m = (a + b) / 2; if (f(m) > 0) a = m; else b = m; } return (a + b) / 2; })();
  assert.ok(Math.abs(hi - lo - fw) / fw < 2e-3, `measured ${hi - lo} vs linearized ${fw}`);
  assert.ok(fw > 0 && fw < 0.01, "sub-nm acceptance for 10 mm at 1550 nm");
});

test("temperature acceptance (Jundt): FWHM matches the measured tuning curve", () => {
  const per = PM.qpmPeriod(1.55, 1.55, { n1: neJ, n2: neJ, n3: neJ }, 1, 80);
  const fw = PM.shgTemperatureAcceptance(1.55, neJ, per, 10, 80);
  const curve = (T: number) => PM.sinc2((PM.deltaKQPM(1.55, 1.55, { n1: neJ, n2: neJ, n3: neJ }, per, 1, T) * 1e4) / 2) - 0.5;
  const bis = (a: number, b: number) => { const s = curve(a) > 0; for (let i = 0; i < 80; i++) { const m = (a + b) / 2; if ((curve(m) > 0) === s) a = m; else b = m; } return (a + b) / 2; };
  const lo = bis(80, 80 - 2 * fw);
  const hi = bis(80, 80 + 2 * fw);
  assert.ok(Math.abs(hi - lo - fw) / fw < 5e-3, `measured ${hi - lo} vs ${fw}`);
});
