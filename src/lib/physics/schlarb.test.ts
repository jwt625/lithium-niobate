// References: research/R14 note N2 and row 37 (Schlarb generalized Sellmeier via volk2008 Eqs. 6.9-6.10, Table 6.1, p. 145;
// check at 48.38 mol%, 632.8 nm, 24.5 C: n_o 2.2849, n_e 2.2024); content/chapters/04-quirks/manuscript.md sec. 4.9 derived
// slopes (dn_e/dc -9.7e-3 and dn_o/dc +6.0e-4 per mol% at 632.8 nm; dn_e/dc -9.1e-3 at 1064 nm); Zelmon 1997 CLN at 632.8 nm
// (2.2865 / 2.2022, within the stated 2e-3 accuracy); erfc values from Abramowitz & Stegun Table 7.1.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as S from "./schlarb.ts";
import { refractiveIndex } from "./sellmeier.ts";
import { ZELMON_CLN_O, ZELMON_CLN_E } from "./constants.ts";

test("R14 row 37 check: 2.2849 (o), 2.2024 (e) at 48.38 mol%, 632.8 nm, 24.5 C", () => {
  assert.ok(Math.abs(S.schlarbIndex("o", 632.8, 48.38) - 2.2849) < 1e-4);
  assert.ok(Math.abs(S.schlarbIndex("e", 632.8, 48.38) - 2.2024) < 1e-4);
});

test("agrees with Zelmon 1997 CLN within the stated 2e-3 accuracy at 632.8 and 1064 nm", () => {
  for (const l of [0.6328, 1.064]) {
    assert.ok(Math.abs(S.schlarbIndex("o", l * 1e3, 48.38) - refractiveIndex(ZELMON_CLN_O, l)) < 2e-3);
    assert.ok(Math.abs(S.schlarbIndex("e", l * 1e3, 48.38) - refractiveIndex(ZELMON_CLN_E, l)) < 2e-3);
  }
});

test("composition slopes of sec. 4.9 within 2 %; analytic slope equals finite difference", () => {
  assert.ok(Math.abs(S.schlarbDnDc("e", 632.8, 48.38) / -9.7e-3 - 1) < 0.02);
  assert.ok(Math.abs(S.schlarbDnDc("o", 632.8, 48.38) / 6.0e-4 - 1) < 0.02);
  assert.ok(Math.abs(S.schlarbDnDc("e", 1064, 48.38) / -9.1e-3 - 1) < 0.02);
  const fd = (S.schlarbIndex("e", 800, 48.39) - S.schlarbIndex("e", 800, 48.37)) / 0.02;
  assert.ok(Math.abs(fd - S.schlarbDnDc("e", 800, 48.38)) < 1e-7);
});

test("validity enforced; T = T0 is the reference; heating raises n_e", () => {
  assert.throws(() => S.schlarbIndex("e", 1550, 48.38), RangeError);
  assert.throws(() => S.schlarbIndex("e", 632.8, 50.5), RangeError);
  assert.ok(S.schlarbIndex("e", 632.8, 48.38, 100) > S.schlarbIndex("e", 632.8, 48.38, 24.5));
});

test("erfc (A&S Table 7.1) and out-diffusion: Li loss raises n_e (guides e), lowers n_o", () => {
  assert.ok(Math.abs(S.erfc(0) - 1) < 1.2e-7);
  assert.ok(Math.abs(S.erfc(0.5) - 0.4795001222) < 1.2e-7 * 0.48);
  assert.ok(Math.abs(S.erfc(1) - 0.1572992071) < 1.2e-7 * 0.16);
  assert.ok(Math.abs(S.erfc(-1) - 1.8427007929) < 1e-7);
  assert.ok(Math.abs(S.liDeficitProfile(0, 1, 1e-6) - 1) < 1.2e-7);
  assert.ok(S.outDiffusionIndex("e", 632.8, 48.38, 0, 1, 1e-6) > 0);
  assert.ok(S.outDiffusionIndex("o", 632.8, 48.38, 0, 1, 1e-6) < 0);
  assert.ok(Math.abs(S.outDiffusionIndex("e", 632.8, 48.38, 50e-6, 1, 1e-6)) < 1e-12);
});
