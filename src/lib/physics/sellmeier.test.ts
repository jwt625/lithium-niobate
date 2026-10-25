// References:
//   R06 sec. 2.4 (C, recomputed from Zelmon 1997 via rii, 21 C): CLN no/ne 2.2865/2.2022 (632.8), 2.2321/2.1555 (1064),
//     2.2111/2.1376 (1550); Zelmon MgO5 corrected at 1550: 2.2082/2.1299; Jundt ne at 24.5 C: 2.1558 (1064), 2.1379 (1550);
//     Jundt dne/dT at 25 C: 3.75e-5 (1550), 4.01e-5 (1064), 4.89e-5 (633); Gayer MgO5 at 1550, 24.5 C: ne 2.1306, no 2.2088.
//   R11 A1: Zelmon CLN 21 C n_e(1550) = 2.13756, n_o(1550) = 2.21111, n_g,e(1550) = 2.182.
//   R14 row 31-32 (independent measurement, Nelson & Mikulyak 1974 via weis1985, 24.5 C): 2.2866/2.2028 (632.8), 2.2323/2.1561 (1060).
//   R14 row 36c: Gayer dn/dT at 1550 nm, 24.5 C (central difference +-1 C): 2.65e-4, 1.11e-4, -7.1e-5 /K.
//   R06 pitfall 10: ne < no (negative uniaxial) over the whole validity range.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as S from "./sellmeier.ts";
import * as C from "./constants.ts";

const n = S.refractiveIndex;
const near = (a: number, b: number, tol: number, msg = "") => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} vs ${b} (tol ${tol})`);

test("Zelmon CLN spot values (R06 sec. 2.4, R11 A1)", () => {
  near(n(C.ZELMON_CLN_O, 0.6328), 2.2865, 5e-5);
  near(n(C.ZELMON_CLN_E, 0.6328), 2.2022, 5e-5);
  near(n(C.ZELMON_CLN_O, 1.064), 2.2321, 5e-5);
  near(n(C.ZELMON_CLN_E, 1.064), 2.1555, 5e-5);
  near(n(C.ZELMON_CLN_O, 1.55), 2.21111, 5e-6);
  near(n(C.ZELMON_CLN_E, 1.55), 2.13756, 5e-6);
  near(S.groupIndex(C.ZELMON_CLN_E, 1.55), 2.182, 5e-4);
});

test("Zelmon CLN vs an independent measurement (Nelson & Mikulyak 1974 via weis1985): within 7e-4", () => {
  near(n(C.ZELMON_CLN_O, 0.6328), 2.2866, 7e-4);
  near(n(C.ZELMON_CLN_E, 0.6328), 2.2028, 7e-4);
  near(n(C.ZELMON_CLN_O, 1.06), 2.2323, 7e-4);
  near(n(C.ZELMON_CLN_E, 1.06), 2.1561, 7e-4);
});

test("Zelmon MgO5 with the 2026 erratum applied (R06 sec. 2.4)", () => {
  near(n(C.ZELMON_MGO5_O, 1.55), 2.2082, 5e-5);
  near(n(C.ZELMON_MGO5_E, 1.55), 2.1299, 5e-5);
  assert.ok(C.ZELMON_MGO5_O.errata.some((e) => e.includes("10.1364/JOSAB.616304")));
});

test("negative uniaxial (ne < no) over 0.4-5 um for Zelmon CLN and MgO5", () => {
  for (const [o, e] of [[C.ZELMON_CLN_O, C.ZELMON_CLN_E], [C.ZELMON_MGO5_O, C.ZELMON_MGO5_E]] as const) {
    for (let l = 0.4; l <= 5.0 + 1e-12; l += 0.01) {
      const L = Math.min(l, 5.0);
      assert.ok(n(e, L) < n(o, L), `${o.id} at ${L}`);
    }
  }
});

test("Jundt 1997 (status S, not a default): spot values and dne/dT (R06 sec. 2.4)", () => {
  assert.equal(C.JUNDT_CLN_E.isDefault, false);
  assert.equal(C.JUNDT_CLN_E.prov.status, "S");
  near(n(C.JUNDT_CLN_E, 1.064, 24.5), 2.1558, 5e-5);
  near(n(C.JUNDT_CLN_E, 1.55, 24.5), 2.1379, 5e-5);
  near(S.dnDT(C.JUNDT_CLN_E, 1.55, 25), 3.75e-5, 5e-8);
  near(S.dnDT(C.JUNDT_CLN_E, 1.064, 25), 4.01e-5, 5e-8);
  near(S.dnDT(C.JUNDT_CLN_E, 0.633, 25), 4.89e-5, 5e-8);
  // Jundt ne at 24.5 C agrees with Zelmon ne (21 C) to < 5e-4 at 1064 and 1550
  near(n(C.JUNDT_CLN_E, 1.55, 24.5), n(C.ZELMON_CLN_E, 1.55), 5e-4);
});

test("Gayer 2008: spot values and the anomalous dn/dT reproduced (R06, R14 row 36c)", () => {
  near(n(C.GAYER_MGO5_E, 1.55, 24.5), 2.1306, 5e-5);
  near(n(C.GAYER_MGO5_O, 1.55, 24.5), 2.2088, 5e-5);
  const cd = (m: C.JundtCoefficients) => (n(m, 1.55, 25.5) - n(m, 1.55, 23.5)) / 2;
  near(cd(C.GAYER_MGO5_E), 2.65e-4, 5e-7);
  near(cd(C.GAYER_MGO5_O), 1.11e-4, 5e-7);
  near(cd(C.GAYER_MGO1SLN_E), -7.1e-5, 5e-7);
  // flagged, not a default
  for (const m of [C.GAYER_MGO5_E, C.GAYER_MGO5_O, C.GAYER_MGO1SLN_E]) {
    assert.equal(m.isDefault, false);
    assert.ok(m.flags.some((f) => f.startsWith("dndT-anomalous")));
  }
});

test("analytic derivatives match finite differences", () => {
  for (const m of [C.ZELMON_CLN_E, C.ZELMON_CLN_O, C.ZELMON_MGO5_E]) {
    for (const l of [0.5, 1.064, 1.55, 3.0]) {
      const h = 1e-4;
      const fd1 = (n(m, l + 1e-5) - n(m, l - 1e-5)) / 2e-5;
      const fd2 = (n(m, l + h) - 2 * n(m, l) + n(m, l - h)) / (h * h);
      near(S.dnDlambda(m, l), fd1, 1e-8);
      near(S.d2nDlambda2(m, l), fd2, 1e-5);
    }
  }
  for (const m of [C.JUNDT_CLN_E, C.GAYER_MGO5_E]) {
    const h = 1e-3;
    const fd = (n(m, 1.3, 60 + h) - n(m, 1.3, 60 - h)) / (2 * h);
    near(S.dnDT(m, 1.3, 60), fd, 1e-10);
    const fdl = (n(m, 1.3 + 1e-4, 60) - n(m, 1.3 - 1e-4, 60)) / 2e-4;
    near(S.dnDlambda(m, 1.3, 60), fdl, 1e-8);
    const fdl2 = (n(m, 1.3 + 1e-4, 60) - 2 * n(m, 1.3, 60) + n(m, 1.3 - 1e-4, 60)) / 1e-8;
    near(S.d2nDlambda2(m, 1.3, 60), fdl2, 1e-5);
  }
});

test("GVD: beta2 = lambda^3/(2 pi c^2) d2n/dl2 and D = -2 pi c beta2 / lambda^2", () => {
  const m = C.ZELMON_CLN_E;
  const b2 = S.gvd(m, 1.55); // fs^2/mm
  const D = S.dispersionD(m, 1.55); // ps/(nm km)
  const b2SI = b2 * 1e-30 * 1e3; // s^2/m
  const DSI = (-2 * Math.PI * C.C0 * b2SI) / (1.55e-6) ** 2; // s/m^2
  near(D, DSI * 1e12 * 1e-9 * 1e3, 1e-9 * Math.abs(D));
  assert.ok(b2 > 0, "normal dispersion at 1550 nm in bulk CLN (e)");
});

test("validity windows are enforced", () => {
  assert.throws(() => n(C.ZELMON_CLN_E, 0.39), RangeError);
  assert.throws(() => n(C.ZELMON_CLN_E, 5.01), RangeError);
  assert.throws(() => n(C.ZELMON_CLN_E, 1.55, 25), /21 C only/);
  assert.equal(n(C.ZELMON_CLN_E, 1.55, 21), n(C.ZELMON_CLN_E, 1.55));
  assert.throws(() => n(C.JUNDT_CLN_E, 1.55, 260), RangeError);
  assert.throws(() => n(C.GAYER_MGO5_O, 2.0, 50), RangeError); // no only to 1.62 um
  assert.throws(() => n(C.GAYER_MGO5_O, 1.55, 150), RangeError); // no only to 100 C
  assert.ok(Number.isNaN(S.refractiveIndexOrNaN(C.ZELMON_CLN_O, 6)));
  assert.throws(() => S.dnDT(C.ZELMON_CLN_E, 1.55), RangeError);
});

test("defaults: Zelmon for CLN and MgO5; every model has provenance", () => {
  assert.equal(S.defaultModel("CLN", "e").id, "zelmon1997-cln-e");
  assert.equal(S.defaultModel("MgO5-CLN", "o").id, "zelmon1997-mgo5-o");
  for (const m of C.DISPERSION_MODELS) {
    assert.ok(C.SOURCES[m.prov.source], m.id);
    assert.ok(m.prov.status.length > 0);
  }
  assert.equal(S.modelById("gayer2008-mgo5-e"), C.GAYER_MGO5_E);
});
