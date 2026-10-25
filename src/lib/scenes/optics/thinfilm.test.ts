// Checks of the LNOI thin-film colour model. Run: node --test src/lib/scenes/optics/thinfilm.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { colorOf, hexOf, NLAM, reflectance, spectrum, tables } from "./thinfilm.ts";
import { nkSi, nSiO2 } from "./nk.ts";

const T = tables("CLN");
const idx = (nm: number): number => (nm - 400) / 2;

test("bare Si at normal incidence equals the Fresnel formula with Green 2008 n, k (600 nm)", () => {
  const [n, k] = nkSi(600);
  const want = ((n - 1) ** 2 + k * k) / ((n + 1) ** 2 + k * k);
  const got = reflectance(T, idx(600), { cut: "x", film_nm: 0, box_nm: 0 }, 0, "s", "par");
  assert.ok(Math.abs(got - want) < 1e-12, `${got} vs ${want}`);
  assert.ok(Math.abs(want - 0.3546) < 5e-4);
});

test("half-wave SiO2 layer is absent at its design wavelength (550 nm)", () => {
  const d = 550 / (2 * nSiO2(0.55));
  const a = reflectance(T, idx(550), { cut: "x", film_nm: 0, box_nm: d }, 0, "p", "par");
  const b = reflectance(T, idx(550), { cut: "x", film_nm: 0, box_nm: 0 }, 0, "p", "par");
  assert.ok(Math.abs(a - b) < 1e-12);
});

test("s and p agree at normal incidence; x-cut par: s uses n_o, p uses n_e", () => {
  const st = { cut: "z" as const, film_nm: 600, box_nm: 4700 };
  for (const nm of [400, 532, 650, 780]) assert.ok(Math.abs(reflectance(T, idx(nm), st, 0, "s", "par") - reflectance(T, idx(nm), st, 0, "p", "par")) < 1e-12);
  const x = { cut: "x" as const, film_nm: 600, box_nm: 4700 };
  // x-cut s (par) == z-cut s at any angle (both n_o, E in plane perpendicular to c)
  for (const s0 of [0, 0.3, 0.7]) assert.ok(Math.abs(reflectance(T, idx(500), x, s0, "s", "par") - reflectance(T, idx(500), st, s0, "s", "par")) < 1e-12);
  // x-cut p (par) at normal incidence differs from s (n_e vs n_o)
  assert.ok(Math.abs(reflectance(T, idx(500), x, 0, "p", "par") - reflectance(T, idx(500), x, 0, "s", "par")) > 1e-4);
  // x-cut perp: s at normal incidence equals x-cut par p (both n_e)
  assert.ok(Math.abs(reflectance(T, idx(500), x, 0, "s", "perp") - reflectance(T, idx(500), x, 0, "p", "par")) < 1e-12);
});

test("reflectance stays in [0, 1] over thickness, angle, wavelength", () => {
  for (const f of [0, 137, 600, 999]) for (const b of [0, 2000, 4700]) for (const s0 of [0, 0.5, 0.95]) for (let i = 0; i < NLAM; i += 7)
    for (const pol of ["s", "p"] as const) for (const az of ["par", "perp"] as const) {
      const r = reflectance(T, i, { cut: "x", film_nm: f, box_nm: b }, s0, pol, az);
      assert.ok(r >= 0 && r <= 1, `${r}`);
    }
});

test("R = 1 maps to white; colours are deterministic", () => {
  const one = new Float64Array(NLAM).fill(1);
  assert.equal(hexOf(colorOf(one)), "#ffffff");
  const a = hexOf(colorOf(spectrum({ cut: "x", film_nm: 600, box_nm: 4700 }, 0))), b = hexOf(colorOf(spectrum({ cut: "x", film_nm: 600, box_nm: 4700 }, 0)));
  assert.equal(a, b);
});
