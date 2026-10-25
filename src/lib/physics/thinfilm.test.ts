// References: Macleod, Thin-Film Optical Filters (characteristic-matrix method; quarter-wave and half-wave layer
// limits R = ((n0 ns - n1^2)/(n0 ns + n1^2))^2 and absentee layer); Fresnel normal-incidence reflectance
// |(n0 - N)/(n0 + N)|^2; Malitson 1965 (fused silica n_d = 1.4585 at 587.6 nm); Green 2008 Si table (600 nm:
// n 3.940, k 0.019934 via refractiveindex.info); IEC 61966-2-1 (D65 white maps to sRGB (1, 1, 1)); CIE 018:2019
// Table 6 (y-bar(555 nm) = 1). The F05-06 colour at 600 nm is a regression snapshot of this code (derived).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as T from "./thinfilm.ts";

test("bare substrate equals Fresnel; absorbing Si table values at grid points", () => {
  const [n, k] = T.siIndex(600);
  assert.ok(Math.abs(n - 3.94) < 1e-12 && Math.abs(k - 0.019934) < 1e-12, `${n} ${k}`);
  const R = T.stackRT(600, [], [n, k]).R;
  const fres = ((1 - n) ** 2 + k * k) / ((1 + n) ** 2 + k * k);
  assert.ok(Math.abs(R - fres) < 1e-14);
  assert.throws(() => T.siIndex(390), RangeError);
});

test("quarter-wave and half-wave layers (lossless) and R + T = 1", () => {
  const n1 = 2.2;
  const ns = 1.45;
  const lam = 1000;
  const q = T.stackRT(lam, [{ n: n1, d_nm: lam / (4 * n1) }], ns);
  assert.ok(Math.abs(q.R - ((ns - n1 * n1) / (ns + n1 * n1)) ** 2) < 1e-14);
  const h = T.stackRT(lam, [{ n: n1, d_nm: lam / (2 * n1) }], ns);
  assert.ok(Math.abs(h.R - ((1 - ns) / (1 + ns)) ** 2) < 1e-14);
  const s = T.stackRT(633, [
    { n: 2.2, d_nm: 600 },
    { n: 1.457, d_nm: 4700 },
  ], 1.52);
  assert.ok(Math.abs(s.R + s.T - 1) < 1e-13);
});

test("Malitson fused silica n_d = 1.4585; LNOI with h = 0 and semi-infinite oxide equals air/SiO2 Fresnel", () => {
  assert.ok(Math.abs(T.sio2Index(587.6) - 1.4585) < 1e-4);
  const n = T.sio2Index(550);
  assert.ok(Math.abs(T.lnoiReflectance(550, { h_nm: 0, oxide_nm: Infinity }) - ((1 - n) / (1 + n)) ** 2) < 1e-14);
  // x-cut averages o and e; z-cut uses o only: they differ for a finite film
  assert.ok(Math.abs(T.lnoiReflectance(550, { h_nm: 600, cut: "x" }) - T.lnoiReflectance(550, { h_nm: 600, cut: "z" })) > 1e-4);
});

test("colour pipeline: perfect reflector -> white (within 0.005 linear), black -> 0; y-bar normalization", () => {
  const w = T.colorFromReflectance(() => 1);
  assert.ok(Math.abs(w.XYZ[1] - 1) < 1e-14);
  for (const v of w.linear) assert.ok(Math.abs(v - 1) < 0.005, `${w.linear}`);
  assert.equal(w.outOfGamut, false);
  const b = T.colorFromReflectance(() => 0);
  assert.deepEqual(b.rgb, [0, 0, 0]);
  assert.equal(b.hex, "#000000");
  assert.ok(Math.abs(T.srgbEncode(0.5) - 0.735356983) < 1e-6);
});

test("F05-06: 600 nm LN on 4.7 um SiO2 on Si, z-cut, D65: deterministic colour (regression snapshot)", () => {
  const a = T.lnoiColor({ h_nm: 600 });
  const b = T.lnoiColor({ h_nm: 600 });
  assert.deepEqual(a, b);
  assert.equal(a.hex, "#a49ca9");
  // thinning changes the colour of the semi-infinite-oxide view (interference orders)
  assert.notEqual(T.lnoiColor({ h_nm: 600, oxide_nm: Infinity }).hex, T.lnoiColor({ h_nm: 520, oxide_nm: Infinity }).hex);
});
