// References: C01 manuscript (content/chapters/01-crystal/manuscript.md) Sec. 3 L2 Tc table (derived from volk2008 Eqs. (6.2)-(6.3),
// P-comp), Sec. 4 L2 (R1 = 0.940 at 48.45 mol%; lambda_20 = 320.4 / 317.2 / 311.5 / 303.0 nm, volk2008 Eqs. (6.5)-(6.6)),
// Sec. 5 L2 defect table (volk2008 Eqs. (2.5)-(2.6)); C01 figures.md FIG-01-03 readouts (0.9399, 1.01 %, 4.05 %, 320.2 nm);
// API rows in src/lib/generated/properties.json (coefficients re-parsed from value_text).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as C from "./composition.ts";

const near = (a: number, b: number, tol: number, msg = "") => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} vs ${b}`);
const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;

test("Tc fits: coefficients equal the API rows; manuscript Sec. 3 table to the printed digit", () => {
  const props = JSON.parse(readFileSync(new URL("../generated/properties.json", import.meta.url), "utf8")) as { id: string; value_text?: string }[];
  for (const fit of [C.TC_IYI1992, C.TC_BORDUI1992]) {
    const row = props.find((r) => r.id === fit.id);
    assert.ok(row?.value_text, fit.id);
    const m = row.value_text.match(/T_C = ([\d.]+) c - ([\d.]+)/);
    assert.ok(m);
    assert.equal(fit.slope, Number(m[1]));
    assert.equal(fit.intercept, -Number(m[2]));
  }
  const table: [number, number, number][] = [
    [48.38, 1138.7, 1143.2],
    [48.45, 1141.5, 1145.9],
    [49.0, 1163.1, 1167.4],
    [50.0, 1202.3, 1206.5],
  ];
  for (const [c, iyi, bor] of table) {
    assert.equal(round(C.tcIyi(c), 1), iyi);
    assert.equal(round(C.tcBordui(c), 1), bor);
  }
  const b = C.tcBand(48.45);
  assert.equal(round(b.lo, 1), 1141.5);
  assert.equal(round(b.hi, 1), 1145.9);
  near(C.compositionFromTc(C.tcBordui(49.2), C.TC_BORDUI1992), 49.2, 1e-12);
});

test("UV edge: API formula, manuscript values, validity flag", () => {
  const props = JSON.parse(readFileSync(new URL("../generated/properties.json", import.meta.url), "utf8")) as { id: string; value_text?: string }[];
  const row = props.find((r) => r.id === "uv-edge-formula/unspecified/volk2008-kovacs1997");
  assert.ok(row?.value_text?.includes("320.4 - 1.829 x - 5.485 x^2") && row.value_text.includes("321.9 - 1.597 x - 5.745 x^2"));
  for (const [c, l] of [
    [48.38, 320.4],
    [49.0, 317.2],
    [49.5, 311.5],
    [50.0, 303.0],
    [48.45, 320.2],
  ] as const)
    assert.equal(round(C.uvEdge(c).lambda_nm, 1), l, `c ${c}`);
  assert.equal(C.uvEdge(48.38, 15).lambda_nm, 321.9);
  assert.equal(C.uvEdge(47.9).valid, false);
  assert.equal(C.uvEdge(50.01).valid, false);
  assert.equal(C.uvEdge(48.0).valid, true);
});

test("ratios and defect fractions: FIG-01-03 readouts and Sec. 5 table; both models give the same R1", () => {
  assert.equal(round(C.liNbRatio(48.45), 4), 0.9399);
  near(C.liFraction(48.45), 0.4845, 1e-15);
  const rows: [number, number, number, number, number][] = [
    // c, x, Li-site NbLi %, V_Li %, Nb-site NbLi %
    [48.38, 0.0106, 1.06, 4.23, 5.29],
    [48.45, 0.0101, 1.01, 4.05, 5.06],
    [49.0, 0.0066, 0.66, 2.63, 3.29],
    [49.5, 0.0033, 0.33, 1.32, 1.66],
    [50.0, 0, 0, 0, 0],
  ];
  for (const [c, x, nbli, vli, nbli5] of rows) {
    const a = C.defectFractions(c, "Li-site");
    const b = C.defectFractions(c, "Nb-site");
    assert.equal(round(a.x, 4), x);
    assert.equal(round(100 * a.NbLi, 2), nbli);
    assert.equal(round(100 * a.VLi, 2), vli);
    assert.equal(round(100 * b.NbLi, 2), nbli5);
    assert.equal(round(100 * b.VNb, 2), vli);
    near(C.ratioFromFractions(a), C.liNbRatio(c), 1e-12, `R1 Li-site ${c}`);
    near(C.ratioFromFractions(b), C.liNbRatio(c), 1e-12, `R1 Nb-site ${c}`);
  }
});

test("melt-to-crystal relation (volk2008 Eq. 6.1) and Mg basis stub", () => {
  assert.equal(C.crystalFromMelt(48.5).c_molPct, 48.5);
  assert.equal(C.crystalFromMelt(44).valid, false);
  // Li-rich melt of about 58-60 mol% is outside the fit range (DCCZ, Sec. 4); the stub reports invalid rather than extrapolating silently
  assert.equal(C.crystalFromMelt(58.5).valid, false);
  const r = C.mgBasisConvert(5, "MgO/(Li2O+MgO+Nb2O5)", "MgO/(LiNbO3+MgO)");
  assert.equal(r.value, null);
  assert.match(r.note, /about 2x/);
});

test("seeded lattice: exact counts, determinism, seed dependence", () => {
  const f = C.defectFractions(48.45);
  const a = C.seededLattice(64, f.VLi, f.NbLi, 7);
  const b = C.seededLattice(64, f.VLi, f.NbLi, 7);
  const c = C.seededLattice(64, f.VLi, f.NbLi, 8);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, c);
  let nv = 0;
  let na = 0;
  for (const v of a) {
    if (v === C.LATTICE_CODE.vacancy) nv++;
    if (v === C.LATTICE_CODE.antisite) na++;
  }
  assert.equal(nv, Math.round(f.VLi * 4096));
  assert.equal(na, Math.round(f.NbLi * 4096));
  assert.throws(() => C.seededLattice(4, 0.7, 0.5, 1));
});
