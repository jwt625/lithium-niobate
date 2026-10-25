// References: content/chapters/02-light/figures.md F2-05 acceptance and manuscript C02 sec. 2.2 L3 (eqs. 2.7-2.9);
// data static/data/eo-overlap-li2026aa.json (eo-modulator-atlas engine export of li2026aa-d, status engine; measured
// VpiL 2.61 V cm reported, li2026aa). Port target: mockup/eo.js analyze() and numbers() (same algorithms).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as EO from "./eo.ts";
import type { EoExport } from "./eo.ts";

const J = JSON.parse(readFileSync(new URL("../../../static/data/eo-overlap-li2026aa.json", import.meta.url), "utf8")) as EoExport;
const A = EO.eoAnalyze(J);
const N = EO.eoNumbers(J, A);
const near = (a: number, b: number, tol: number, msg: string) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);

test("decode: grid 241 x 81, fields finite inside the arm window, NaN outside", () => {
  assert.equal(A.grid.nx, 241);
  assert.equal(A.grid.ny, 81);
  for (const k of ["optEx", "esEx", "esEy", "integrand", "integrand_r33"]) assert.equal(A.F[k].length, 241 * 81);
  // |x| <= 2.9 um window: the corner node x = -3.6 um has no optical field
  assert.ok(!Number.isFinite(A.F.optEx[A.K(0, 40)]));
  assert.ok(Number.isFinite(A.F.optEx[A.K(120, 40)]));
});

test("dn_eff/dV: engine -1.4367e-5 /V; grid nodal sum -1.4424e-5 /V (+0.39% vs engine); trapezoid close to nodal", () => {
  near(N.engine, -1.4367e-5, 5e-10, "engine");
  near(N.nodal, -1.4424e-5, 5e-10, "nodal");
  // figures.md prints +0.40%; the computed deviation is +0.393% (rounds to +0.39%)
  near(N.nodalDev * 100, 0.39, 0.005, "nodal deviation %");
  near(N.trap / N.nodal, 1, 5e-4, "trapezoid vs nodal");
  // depth-profile row sum vs nodal sum: same nodes, half weights on the two end columns (integrand ~0 there): 1e-5 rel
  near(A.prof.reduce((s, p) => s + p.t * A.grid.dx, 0), N.nodal, 1e-5 * Math.abs(N.nodal), "profile sum");
});

test("region split 61.4 / 38.3 / 0.3 % (rib / slab under rib / slab outside); 38% from the slab under the rib", () => {
  near(N.share.rib * 100, 61.4, 0.05, "rib");
  near(N.share.slabIn * 100, 38.3, 0.05, "slab under rib");
  near(N.share.slabOut * 100, 0.3, 0.05, "slab outside");
  near(N.share.rib + N.share.slabIn + N.share.slabOut, 1, 1e-12, "sum");
});

test("tensor shares: r33 99.66 %, r22 0", () => {
  near(N.tensorShare.r33 * 100, 99.66, 0.005, "r33 share");
  assert.equal(Math.abs(N.tensorShare.r22), 0);
  near(N.tensorShare.r33 + N.tensorShare.r13 + N.tensorShare.r51, 1, 1e-6, "sum of entries");
});

test("overlap and indices: Gamma 0.4771, Ebar 7.951e4 V/m per V, n_e/n_eff 1.208; Gamma_x from the grid near Gamma_A", () => {
  near(N.GammaA, 0.4771, 5e-5, "Gamma_A");
  near(N.EbarA, 7.951e4, 5, "Ebar_A");
  near(N.EbarA * N.gap_m, N.GammaA, 1e-9, "Ebar = Gamma V / g");
  near(N.neOverNeff, 1.208, 5e-4, "n_e / n_eff");
  near(N.GammaX / N.GammaA, 1, 0.005, "grid Gamma_x vs engine Gamma_A");
  assert.ok(N.fracLN > 0.6 && N.fracLN < 0.7, `fraction in LN ${N.fracLN}`);
});

test("VpiL: engine 2.697, textbook 3.238 V cm; check lambda/(2|dn_A - dn_B|) = engine; eq. 2.8 scalar TE vs nodal grid sum", () => {
  near(N.vpiLEngine, 2.697, 5e-4, "engine VpiL");
  near(N.vpiLTextbook, 3.238, 5e-4, "textbook VpiL");
  near(N.vpiLCheck, N.vpiLEngine, 1e-9, "push-pull check");
  assert.equal(N.vpiLMeasured, 2.61); // reported data value, not computed
  near(N.scalarTE / N.nodal, 1, 2e-3, "scalar TE vs grid");
  // conventional form underestimates |dn/dV| by about n_e / n_eff
  near(N.scalarTE / N.conventional, N.neOverNeff * (N.GammaX / N.GammaA), 1e-9, "scalar TE / conventional");
});

test("regions and probe: rib, slab, electrodes, oxide; probe clamps to the grid", () => {
  const G = J.geometry;
  assert.equal(EO.eoRegion(G, 0, 0.2), "LN rib");
  assert.equal(EO.eoRegion(G, 2.5, 0.06), "LN slab");
  assert.equal(EO.eoRegion(G, 0, 0), "LN slab"); // bottom row is LN (interface takes the side above)
  assert.equal(EO.eoRegion(G, -3.3, 0.5), "Au signal");
  assert.equal(EO.eoRegion(G, 3.3, 0.5), "Au ground");
  assert.equal(EO.eoRegion(G, 0, 1.0), "SiO2 cladding");
  assert.equal(EO.eoRegion(G, 0, -0.5), "SiO2 BOX");
  const p = EO.eoProbe(J, A, 100, -100);
  assert.equal(p.i, 240);
  assert.equal(p.j, 80);
  const q = EO.eoProbe(J, A, A.X(A.kMax % 241), A.Y(Math.floor(A.kMax / 241)));
  near(q.ExNorm2, 1, 1e-12, "peak |E_x|^2 normalized");
});
