// References: C01 figures.md FIG-01-01 acceptance (counts Li 6 / Nb 6 / O 18 / empty 6; a_R 5.4943 A, alpha 55.872 deg within 1e-3;
// cleavage 32.749 deg; column sequence at (0, 0): empty, Li, Nb, empty, Li, Nb) and FIG-01-02 acceptance (O-fixed Nb 0.275, Li 0.713;
// Nb-fixed Li 0.438, O -0.275; travel Nb 0.550, Li 1.426; s = 0 is R-3c); C01 manuscript Sec. 1 L2 (weis1985 Eq. (1) and p. 194:
// 5.494 A, 55.867 deg, cleavage 32.75 deg measured / 32.7502 deg calculated; hsu1997 Nb-O 1.876 x3 / 2.130 x3, Li-O 2.063 x3 /
// 2.245 x3) and Sec. 2 L2 (three-frame table incl. centre of mass Nb +0.069, Li +0.507, O -0.206). Cell: static/data/linbo3-cell.json.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as X from "./crystal.ts";
import type { CellData } from "./crystal.ts";

const cell = JSON.parse(readFileSync(new URL("../../../static/data/linbo3-cell.json", import.meta.url), "utf8")) as CellData & {
  atoms: { el: string; frac: number[] }[];
};
const near = (a: number, b: number, tol: number, msg = "") => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} vs ${b}`);
const a = cell.cell.a_A;
const c = cell.cell.c_A;

test("hexagonal to rhombohedral (weis1985 Eq. 1): 5.4943 A, 55.872 deg; basis sums to c and has length a_R", () => {
  const r = X.hexToRhomb(a, c);
  near(r.aR, 5.4943, 1e-3);
  near(r.alpha_deg, 55.872, 1e-3);
  const s = [0, 1, 2].map((k) => r.basis[0][k] + r.basis[1][k] + r.basis[2][k]);
  near(s[0], 0, 1e-12);
  near(s[1], 0, 1e-12);
  near(s[2], c, 1e-12);
  for (const v of r.basis) near(Math.hypot(...v), r.aR, 1e-12);
  const cosAlpha = (r.basis[0][0] * r.basis[1][0] + r.basis[0][1] * r.basis[1][1] + r.basis[0][2] * r.basis[1][2]) / r.aR ** 2;
  near((Math.acos(cosAlpha) * 180) / Math.PI, r.alpha_deg, 1e-9);
});

test("cleavage plane (01-12) at 32.749 deg to c; closed form tan(phi) = c/(sqrt3 a); basal plane 90 deg, prism plane 0 deg", () => {
  const ang = X.planeAngleToC([0, 1, -1, 2], a, c);
  near(ang, 32.749, 1e-3);
  near(ang, 90 - (Math.atan(c / (Math.sqrt(3) * a)) * 180) / Math.PI, 1e-12);
  near(X.planeAngleToC([0, 0, 0, 1], a, c), 90, 1e-12);
  near(X.planeAngleToC([1, 1, -2, 0], a, c), 0, 1e-12);
  assert.throws(() => X.planeAngleToC([0, 1, 1, 2], a, c));
});

test("expandCell: 30 atoms, reproduces the generated cell file; Nb-O and Li-O shells (hsu1997)", () => {
  const atoms = X.expandCell(cell);
  const count = (e: string) => atoms.filter((t) => t.el === e).length;
  assert.equal(count("Li"), 6);
  assert.equal(count("Nb"), 6);
  assert.equal(count("O"), 18);
  assert.equal(cell.empty_octahedral_sites?.length, 6);
  for (const ref of cell.atoms) {
    const hit = atoms.some((t) => t.el === ref.el && t.frac.every((f, i) => Math.min(Math.abs(f - ref.frac[i]), 1 - Math.abs(f - ref.frac[i])) < 2e-6));
    assert.ok(hit, `${ref.el} ${ref.frac}`);
  }
  const nb = atoms.find((t) => t.el === "Nb")!;
  const sh = X.neighborShells(cell, atoms, nb.frac, 2.3).filter((s) => s.el === "O");
  assert.equal(sh.length, 2);
  assert.equal(sh[0].n, 3);
  assert.equal(sh[1].n, 3);
  near(sh[0].d_A, 1.876, 5e-4);
  near(sh[1].d_A, 2.13, 5e-4);
  const li = atoms.find((t) => t.el === "Li")!;
  const sl = X.neighborShells(cell, atoms, li.frac, 2.3).filter((s) => s.el === "O");
  near(sl[0].d_A, 2.063, 5e-4);
  near(sl[1].d_A, 2.245, 5e-4);
});

test("octahedral column at (0, 0): empty, Li, Nb, empty, Li, Nb along +c", () => {
  const atoms = X.expandCell(cell);
  const col = X.octahedralColumn(cell, atoms, [0, 0]).map((p) => p.occupant);
  assert.deepEqual(col, ["empty", "Li", "Nb", "empty", "Li", "Nb"]);
});

test("symop parser: identity, centring and glide operators", () => {
  const f = X.parseSymop("2/3-y,1/3+x-y,1/3+z")([0.1, 0.2, 0.3]);
  near(f[0], 2 / 3 - 0.2, 1e-15);
  near(f[1], 1 / 3 + 0.1 - 0.2, 1e-15);
  near(f[2], 1 / 3 + 0.3, 1e-15);
  const g = X.parseSymop("-y,-x,1/2+z")([0.1, 0.2, 0.3]);
  assert.deepEqual(g.map((v) => Math.round(v * 1e12) / 1e12), [-0.2, -0.1, 0.8]);
});

test("flip model: three-frame displacements, travel, centrosymmetric reference", () => {
  const m = X.flipModel(cell);
  const O = X.polarDisplacements(m, "O");
  near(O.Nb, 0.275, 1e-3, "O frame Nb");
  near(O.Li, 0.713, 1e-3, "O frame Li");
  near(O.O, 0, 1e-9, "O frame O");
  const N = X.polarDisplacements(m, "Nb");
  near(N.Nb, 0, 1e-12);
  near(N.Li, 0.438, 1e-3, "Nb frame Li");
  near(N.O, -0.275, 1e-3, "Nb frame O");
  const G = X.polarDisplacements(m, "com");
  near(G.Nb, 0.069, 1e-3, "com Nb");
  near(G.Li, 0.507, 1e-3, "com Li");
  near(G.O, -0.206, 1e-3, "com O");
  // total travel s = +1 -> -1 in the O frame
  near(2 * O.Nb, 0.55, 1e-3);
  near(2 * O.Li, 1.426, 1e-3);
  // relative positions are frame independent
  const p1 = X.interpolateFlip(m, 0.6, "O");
  const p2 = X.interpolateFlip(m, 0.6, "com");
  const iLi = m.atoms.findIndex((t) => t.el === "Li");
  const iNb = m.atoms.findIndex((t) => t.el === "Nb");
  near(p1[iLi][2] - p1[iNb][2], p2[iLi][2] - p2[iNb][2], 1e-12);
  // s = 0: Li sits in an O layer and Nb at its O6 centroid (R-3c)
  const p0 = X.interpolateFlip(m, 0, "O");
  const oz = m.atoms.map((t, i) => (t.el === "O" ? p0[i][2] : NaN)).filter((z) => !Number.isNaN(z));
  for (let i = 0; i < m.atoms.length; i++) {
    if (m.atoms[i].el !== "Li") continue;
    const dz = Math.min(...oz.map((z) => Math.abs(((p0[i][2] - z) % c + c + c / 2) % c - c / 2)));
    near(dz, 0, 1e-3, "Li in O plane");
  }
  const Mx = X.hexCellMatrix(a, c);
  for (let i = 0; i < m.atoms.length; i++) {
    if (m.atoms[i].el !== "Nb") continue;
    const d = m.atoms
      .map((t, j) => (t.el === "O" ? (() => {
        const v = [0, 1, 2].map((k) => p0[j][k] - p0[i][k]);
        const f2 = v[1] / Mx[1][1];
        const f1 = (v[0] + (a / 2) * f2) / a;
        const fr = [f1, f2, v[2] / c].map((x) => x - Math.round(x));
        return X.fracToCart(Mx, fr);
      })() : null))
      .filter((v): v is [number, number, number] => v !== null)
      .sort((u, w) => Math.hypot(...u) - Math.hypot(...w))
      .slice(0, 6);
    const zc = d.reduce((s, v) => s + v[2], 0) / 6;
    near(zc, 0, 1e-3, "Nb at O6 centroid");
  }
  // s = -1 is the inversion of s = +1: Nb travel 0.550 A downward
  const pm = X.interpolateFlip(m, -1, "O");
  const pp = X.interpolateFlip(m, 1, "O");
  near(pp[iNb][2] - pm[iNb][2], 0.55, 1e-3);
});
