// References: content/chapters/02-light/manuscript.md (derived values, 2026-10-25) and figures.md acceptance for F2-01, F2-03,
// F2-04, F2-07, F2-15: z-cut dark rings 11.09 / 15.75 / 19.38 deg (d = 1 mm, 632.8 nm, Zelmon CLN 21 C); induced dn
// no^3 r22 E = 4.064e-5 and retardance 0.404 rad at 1 kV/mm with r22 = 3.4 pm/V (Turner 1966 clamped via weis1985);
// first-order tilt 1.26 deg inside / 2.88 deg in air; max walk-off 2.150 @ 43.92, 2.000 @ 44.00, 1.938 @ 44.03 deg;
// |dn_e| = 1.504e-4 at 1 V/um and E L = 5.15 kV (eq. 2.4, 1550 nm, r33 30.8); type-I BPM SH walk-off 2.034 deg at
// 49.55 deg (1550 nm), 45.01 deg at 2000 nm; x-cut ring spans n_e..n_o = 2.1376..2.2111 (1550 nm).
// Note recorded for the audit: the manuscript first-order tilt formula differs from the exact eigen-decomposition by about 3%
// (not < 1% as figures.md states); see the "exact vs first-order tilt" test.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as E from "./ellipsoid.ts";
import { refractiveIndex } from "./sellmeier.ts";
import { ZELMON_CLN_O, ZELMON_CLN_E, EO_TURNER1966_S } from "./constants.ts";
import { birefringentAngle } from "./phasematching.ts";
import { walkoffAngle } from "./crystaloptics.ts";

const no = (l: number) => refractiveIndex(ZELMON_CLN_O, l);
const ne = (l: number) => refractiveIndex(ZELMON_CLN_E, l);
const DEG = Math.PI / 180;

test("z-cut dark rings at 632.8 nm, d = 1 mm: 11.09, 15.75, 19.38 deg external", () => {
  const r = E.ringAngles(1, 0.6328, 3, no(0.6328), ne(0.6328));
  assert.equal(r.length, 3);
  [11.09, 15.75, 19.38].forEach((want, i) => assert.ok(Math.abs(r[i] - want) < 0.005, `ring ${i + 1}: ${r[i]}`));
  // the small-angle formula is far off at these angles (the manuscript uses the exact phase)
  // small-angle estimate: about 3% above the exact first ring (11.42 vs 11.09 deg)
  const sm = E.ringAngleSmall(1, 0.6328, 1, no(0.6328), ne(0.6328));
  assert.ok(sm > r[0] && sm - r[0] < 0.5, `small-angle ring ${sm}`);
  // thin plate: no ring inside the hemisphere (dark field)
  assert.ok(Number.isNaN(E.ringAngle(0.001, 0.6328, 1, no(0.6328), ne(0.6328))));
  // ring angle scales as 1/sqrt(d) at small angles
  const thick = E.ringAngles(100, 0.6328, 1, no(0.6328), ne(0.6328))[0];
  const thicker = E.ringAngles(400, 0.6328, 1, no(0.6328), ne(0.6328))[0];
  assert.ok(Math.abs(thick / thicker - 2) < 2e-3);
});

test("field-induced biaxiality: dn = 4.064e-5, retardance 0.404 rad, first-order tilt 1.26 / 2.88 deg", () => {
  for (const dir of ["x", "y"] as const) {
    const b = E.opticAxisTilt({ E_V_per_m: 1e6, dir, eo: EO_TURNER1966_S, no: no(0.6328), ne: ne(0.6328), lam_um: 0.6328, d_mm: 1 });
    assert.ok(Math.abs(b.dn_z - 4.064e-5) < 5e-9, `${dir} dn ${b.dn_z}`);
    assert.ok(Math.abs(b.dn_z - b.dn_z_firstOrder) / b.dn_z < 1e-6);
    assert.ok(Math.abs(b.retardance_z - 0.404) < 1e-3);
    assert.ok(Math.abs(b.tiltInt_firstOrder_deg - 1.26) < 0.005);
    assert.ok(Math.abs(b.tiltExt_firstOrder_deg - 2.88) < 0.005);
  }
});

test("exact vs first-order tilt: biaxial first-order form within 0.5% for E || y; manuscript form about 3% high", () => {
  const p = { E_V_per_m: 1e6, eo: EO_TURNER1966_S, no: no(0.6328), ne: ne(0.6328), lam_um: 0.6328 };
  const y = E.opticAxisTilt({ ...p, dir: "y" });
  const x = E.opticAxisTilt({ ...p, dir: "x" });
  assert.ok(Math.abs(y.tiltInt_deg - y.tiltInt_biaxial_deg) / y.tiltInt_deg < 5e-3, `${y.tiltInt_deg} vs ${y.tiltInt_biaxial_deg}`);
  // recorded values (exact Jacobi path, r51 included): about 1.223 deg (E || y) and 1.302 deg (E || x) inside
  assert.ok(Math.abs(y.tiltInt_deg - 1.2234) < 1e-3 && Math.abs(x.tiltInt_deg - 1.3019) < 1e-3);
  const err = Math.abs(y.tiltInt_firstOrder_deg - y.tiltInt_deg) / y.tiltInt_deg;
  assert.ok(err > 0.02 && err < 0.04, `first-order error ${err}`);
  // tilt grows as sqrt(E)
  const y4 = E.opticAxisTilt({ ...p, dir: "y", E_V_per_m: 4e6 });
  assert.ok(Math.abs(y4.tiltInt_deg / y.tiltInt_deg - 2) < 5e-3);
});

test("E along x rotates the in-plane axes by 45 deg; E along y does not", () => {
  const p = { E_V_per_m: 1e6, eo: EO_TURNER1966_S, no: no(0.6328), ne: ne(0.6328), lam_um: 0.6328 };
  const ax = E.opticAxisTilt({ ...p, dir: "x" }).inPlaneAxis_deg;
  const ay = E.opticAxisTilt({ ...p, dir: "y" }).inPlaneAxis_deg;
  assert.ok(Math.abs(Math.min(Math.abs(ax - 45), Math.abs(ax - 135))) < 1e-6, `x: ${ax}`);
  assert.ok(Math.min(Math.abs(ay), Math.abs(ay - 90), Math.abs(ay - 180)) < 1e-6, `y: ${ay}`);
});

test("maximum walk-off: 2.150 @ 43.92 (632.8), 2.000 @ 44.00 (1064), 1.938 @ 44.03 deg (1550); closed form agrees", () => {
  for (const [l, rho, th] of [[0.6328, 2.15, 43.92], [1.064, 2.0, 44.0], [1.55, 1.938, 44.03]] as const) {
    const m = E.maxWalkoff(no(l), ne(l));
    const c = E.maxWalkoffClosedForm(no(l), ne(l));
    assert.ok(Math.abs(m.rho_deg - rho) < 5e-4 && Math.abs(m.theta_deg - th) < 5e-3, `${l}: ${m.rho_deg} @ ${m.theta_deg}`);
    assert.ok(Math.abs(m.rho_deg - c.rho_deg) < 1e-9 && Math.abs(m.theta_deg - c.theta_deg) < 1e-5);
  }
});

test("type-I BPM SH walk-off 2.034 deg at 49.55 deg (1550 nm); 2000 nm phase matches at 45.01 deg", () => {
  const th = birefringentAngle("ooe", 1.55, 1.55, no, ne);
  assert.ok(Math.abs(th / DEG - 49.55) < 5e-3);
  assert.ok(Math.abs(walkoffAngle(th, no(0.775), ne(0.775)) / DEG - 2.034) < 5e-4);
  assert.ok(Math.abs(birefringentAngle("ooe", 2.0, 2.0, no, ne) / DEG - 45.01) < 5e-3);
});

test("bulk Pockels (eq. 2.4): |dn_e| = 1.504e-4 at 1 V/um, E L = 5.15 kV for pi (1550 nm, r33 = 30.8 pm/V)", () => {
  assert.ok(Math.abs(Math.abs(E.pockelsDn(ne(1.55), 30.8, 1e6)) - 1.504e-4) < 5e-8);
  assert.ok(E.pockelsDn(ne(1.55), 30.8, 1e6) < 0);
  assert.ok(Math.abs(E.piFieldLength(1.55, ne(1.55), 30.8) / 1e3 - 5.15) < 5e-3);
});

test("x-cut ring bulk approximation spans n_e (phi = 90 deg) to n_o (phi = 0): 2.1376 to 2.2111 at 1550 nm", () => {
  assert.ok(Math.abs(E.xcutRingIndex(0, no(1.55), ne(1.55)) - 2.2111) < 5e-5);
  assert.ok(Math.abs(E.xcutRingIndex(Math.PI / 2, no(1.55), ne(1.55)) - 2.1376) < 5e-5);
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i <= 360; i++) {
    const n = E.xcutRingIndex((i * Math.PI) / 180, no(1.55), ne(1.55));
    lo = Math.min(lo, n);
    hi = Math.max(hi, n);
  }
  assert.ok(Math.abs(lo - ne(1.55)) < 1e-12 && Math.abs(hi - no(1.55)) < 1e-12);
});
