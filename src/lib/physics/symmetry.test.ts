// References: C01 figures.md FIG-01-06 acceptance (counts 1, 2, 4, 4, 6, 8 for p, eps, d, r, c, photoelastic p under 3m; relations
// d16 = -2 d22, s66 = 2(s11 - s12), c66 = (c11 - c12)/2, p66 = (p11 - p12)/2; stabilizer E || z -> 3m, E || y -> m, E || x -> 1);
// weis1985 Eqs. (2), (4), (8), (12), (16), (19) via C01 manuscript Sec. 7 L2 forms (independent sets and relations);
// tensors.ts 3m forms (c3m s3m e3m d3m r3m p3m; already validated against R06 by lane PHY); subgroup counts for classes 3 and m
// (d: 6 and 10, c: 7 and 13) per Nye, Physical Properties of Crystals (1985), tables of piezoelectric and elastic moduli.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as S from "./symmetry.ts";
import { c3m, s3m, e3m, d3m, r3m, p3m, voigtToTensor3 } from "./tensors.ts";
import type { Matrix } from "./tensors.ts";
import { createRng } from "./prng.ts";

const ops = S.groupOps3m();
const all = ops.map((o) => o.R);
const byId = (...ids: string[]) => ops.filter((o) => ids.includes(o.id)).map((o) => o.R);

test("group: six elements, closure of C3 + one mirror is all of 3m", () => {
  assert.equal(S.closeGroup(all).length, 6);
  assert.equal(S.closeGroup(byId("C3", "m_yz")).length, 6);
  assert.equal(S.closeGroup(byId("C3")).length, 3);
  assert.equal(S.closeGroup(byId("m_p60")).length, 2);
  assert.equal(S.closeGroup([]).length, 1);
  assert.equal(S.groupName(S.closeGroup(all)), "3m");
});

test("independent counts under 3m: 1, 2, 4, 4, 4, 6, 6, 8 (pyro, eps, d, e, r, c, s, p)", () => {
  const want: [S.PropertyKind, number][] = [["pyro", 1], ["eps", 2], ["d", 4], ["e", 4], ["r", 4], ["c", 6], ["s", 6], ["p", 8]];
  for (const [k, n] of want) {
    const r = S.neumann(k, all);
    assert.equal(r.independentCount, n, k);
    assert.deepEqual(r.independent, S.KINDS[k].prefer, k);
  }
  assert.equal(S.neumann("d", all).genericCount, 18);
  assert.equal(S.neumann("c", all).genericCount, 21);
});

test("no operations: every generic component independent; subgroups 3 and m (Nye 1985)", () => {
  for (const k of ["pyro", "eps", "d", "r", "c", "p"] as S.PropertyKind[]) assert.equal(S.neumann(k, []).independentCount, S.KINDS[k].generic, k);
  assert.equal(S.neumann("d", byId("C3")).independentCount, 6);
  assert.equal(S.neumann("c", byId("C3")).independentCount, 7);
  assert.equal(S.neumann("d", byId("m_yz")).independentCount, 10);
  assert.equal(S.neumann("c", byId("m_yz")).independentCount, 13);
  assert.equal(S.neumann("eps", byId("C3")).independentCount, 2);
  assert.equal(S.neumann("pyro", byId("m_yz")).independentCount, 2);
});

test("relation texts and classes (weis1985 forms)", () => {
  const d = S.neumann("d", all).relations;
  assert.equal(d[0][5].text, "d16 = -2d22");
  assert.equal(d[0][5].cls, "factor");
  assert.equal(d[1][3].cls, "equal");
  assert.equal(d[1][3].text, "d24 = d15");
  assert.equal(d[1][0].cls, "minus");
  assert.equal(d[2][1].text, "d32 = d31");
  assert.equal(d[0][0].cls, "zero");
  assert.equal(S.neumann("s", all).relations[5][5].text, "s66 = 2(s11 - s12)");
  assert.equal(S.neumann("s", all).relations[4][5].text, "s56 = 2s14");
  assert.equal(S.neumann("c", all).relations[5][5].text, "c66 = (c11 - c12)/2");
  assert.equal(S.neumann("c", all).relations[1][3].text, "c24 = -c14");
  assert.equal(S.neumann("c", all).relations[4][5].text, "c56 = c14");
  const p = S.neumann("p", all).relations;
  assert.equal(p[5][5].text, "p66 = (p11 - p12)/2");
  assert.equal(p[4][5].text, "p56 = p41");
  assert.equal(p[5][4].text, "p65 = p14");
  assert.equal(p[3][1].text, "p42 = -p41");
  const r = S.neumann("r", all).relations;
  assert.equal(r[0][1].text, "r12 = -r22");
  assert.equal(r[5][0].text, "r61 = -r22");
  assert.equal(r[3][1].text, "r42 = r51");
});

test("relations reproduce the tensors.ts 3m forms for random independent values", () => {
  const rng = createRng(11);
  const v = () => rng.uniform(-3, 3);
  const cases: [S.PropertyKind, (x: Record<string, number>) => Matrix][] = [
    ["c", (x) => c3m(x as never)],
    ["s", (x) => s3m(x as never)],
    ["e", (x) => e3m(x as never)],
    ["d", (x) => d3m(x as never)],
    ["r", (x) => r3m(x as never)],
    ["p", (x) => p3m(x as never)],
  ];
  for (const [k, form] of cases) {
    const res = S.neumann(k, all);
    const vals: Record<string, number> = {};
    for (const n of res.independent) vals[n] = v();
    const M = form(vals);
    for (const row of res.relations)
      for (const rel of row) {
        const pred = rel.cls === "independent" ? vals[rel.name] : rel.terms.reduce((s, t) => s + t.coef * vals[t.name], 0);
        assert.ok(Math.abs(pred - M[rel.row][rel.col]) < 1e-12, `${k} ${rel.name}: ${pred} vs ${M[rel.row][rel.col]}`);
      }
  }
});

test("symmetrize: idempotent and leaves 3m tensors unchanged", () => {
  const rng = createRng(5);
  const T = Float64Array.from({ length: 27 }, () => rng.uniform(-1, 1));
  const A = S.symmetrize(T, 3, all);
  const B = S.symmetrize(A, 3, all);
  for (let i = 0; i < 27; i++) assert.ok(Math.abs(A[i] - B[i]) < 1e-14);
  const D = voigtToTensor3(d3m({ d15: 1.3, d22: -0.7, d31: 0.2, d33: 2.1 }), "d");
  const Ds = S.symmetrize(D, 3, all);
  for (let i = 0; i < 27; i++) assert.ok(Math.abs(D[i] - Ds[i]) < 1e-14);
});

test("stabilizer (Curie's principle): E || z -> 3m, E || y -> m, E || x -> 1, E = 0 -> 3m", () => {
  assert.equal(S.stabilizer(all, [0, 0, 1]).name, "3m");
  assert.equal(S.stabilizer(all, [0, 1, 0]).name, "m");
  assert.equal(S.stabilizer(all, [1, 0, 0]).name, "1");
  assert.equal(S.stabilizer(all, [0, 0, 0]).name, "3m");
  assert.equal(S.stabilizer(all, [0, -1, 0]).name, "m");
});
