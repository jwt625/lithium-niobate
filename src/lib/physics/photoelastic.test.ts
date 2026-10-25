// References: content/chapters/03-sound/figures.md F3.8 acceptance and manuscript sec. 3.6 L3 item 3 (derived by
// lane C03 2026-10-25, audit-confirmed): Andrushchak 2009 X-cut -0.021/+0.304/+0.118/+0.143 at 0/45/90/135 deg,
// max +0.3041 at 44 deg (flipped: 136 deg); Y-cut +0.2235 at 45/135 deg, max +0.2304 at 50.7/129.3 deg (flip-invariant);
// Set B (Avakyants 1976 via weis1985 Table 7) X-cut max +0.3520 at 42 deg (138 flipped), Y-cut max +0.2380 at
// 48.3/131.7 deg; Z-cut p'_bbbb = p11 for every phi. weis1985 Eq. 19 (3m form, p66 = (p11 - p12)/2).
// Coefficient sets are read from the API lane output src/lib/generated/tensors.json.
import { test } from "node:test";
import { P_AVAKYANTS1976 } from "./constants.ts";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as PE from "./photoelastic.ts";
import type { P3m } from "./photoelastic.ts";

const tensors = JSON.parse(readFileSync(new URL("../generated/tensors.json", import.meta.url), "utf8")) as { id: string; independent: Record<string, { value: number }> }[];
const set = (id: string): P3m => {
  const r = tensors.find((t) => t.id === id);
  if (!r) throw new Error(id);
  const g = (k: string) => r.independent[k].value;
  return { p11: g("p11"), p12: g("p12"), p13: g("p13"), p14: g("p14"), p31: g("p31"), p33: g("p33"), p41: g("p41"), p44: g("p44") };
};
const AND = set("photoelastic-p/unspecified/andrushchak2009");
const SETB = set("photoelastic-p/unspecified/weis1985-avakyants1976");
const at = (p: P3m, cut: PE.FilmCut, deg: number) => PE.longitudinal(PE.fullFrom3m(p), PE.inPlaneDir(cut, (deg * Math.PI) / 180));

test("Set B in tensors.json equals the constants.ts register (weis1985 Table 7)", () => {
  const { prov: _prov, ...reg } = P_AVAKYANTS1976;
  assert.deepEqual(SETB, reg);
});

test("F3.8 Andrushchak X-cut values at 0/45/90/135 deg and maximum +0.3041 at 44 deg; flip moves it to 136 deg", () => {
  const want = [-0.021, 0.304, 0.118, 0.143];
  [0, 45, 90, 135].forEach((d, i) => assert.ok(Math.abs(at(AND, "X", d) - want[i]) < 5e-4, `${d}: ${at(AND, "X", d)}`));
  const m = PE.inPlaneMaxima(PE.fullFrom3m(AND), "X");
  assert.ok(Math.abs(m.value - 0.3041) < 1e-4, `${m.value}`);
  assert.equal(m.phi_deg.length, 1);
  assert.ok(Math.abs(m.phi_deg[0] - 44) < 0.5, `${m.phi_deg}`);
  const f = PE.inPlaneMaxima(PE.fullFrom3m(PE.flipP14P41(AND)), "X");
  assert.ok(Math.abs(f.value - m.value) < 1e-12 && Math.abs(f.phi_deg[0] - 136) < 0.5);
});

test("F3.8 Andrushchak Y-cut +0.2235 at 45/135, max +0.2304 at 50.7/129.3 deg, flip-invariant", () => {
  assert.ok(Math.abs(at(AND, "Y", 45) - 0.2235) < 1e-4 && Math.abs(at(AND, "Y", 135) - 0.2235) < 1e-4);
  const m = PE.inPlaneMaxima(PE.fullFrom3m(AND), "Y");
  assert.ok(Math.abs(m.value - 0.2304) < 1e-4, `${m.value}`);
  assert.equal(m.phi_deg.length, 2);
  assert.ok(Math.abs(m.phi_deg[0] - 50.7) < 0.5 && Math.abs(m.phi_deg[1] - 129.3) < 0.5, `${m.phi_deg}`);
  for (const d of [10, 33, 77, 160]) assert.ok(Math.abs(at(AND, "Y", d) - at(PE.flipP14P41(AND), "Y", d)) < 1e-15);
});

test("F3.8 Set B: X-cut max +0.3520 at 42 deg (flip 138), Y-cut max +0.2380 at 48.3/131.7 deg; 0/45/90/135 values", () => {
  const x = PE.inPlaneMaxima(PE.fullFrom3m(SETB), "X");
  assert.ok(Math.abs(x.value - 0.352) < 1e-4 && Math.abs(x.phi_deg[0] - 42) < 0.5, `${x.value} ${x.phi_deg}`);
  const xf = PE.inPlaneMaxima(PE.fullFrom3m(PE.flipP14P41(SETB)), "X");
  assert.ok(Math.abs(xf.phi_deg[0] - 138) < 0.5);
  const y = PE.inPlaneMaxima(PE.fullFrom3m(SETB), "Y");
  assert.ok(Math.abs(y.value - 0.238) < 1e-4, `${y.value}`);
  assert.ok(Math.abs(y.phi_deg[0] - 48.3) < 0.5 && Math.abs(y.phi_deg[1] - 131.7) < 0.5, `${y.phi_deg}`);
  const want = [-0.026, 0.348, 0.071, 0.122];
  [0, 45, 90, 135].forEach((d, i) => assert.ok(Math.abs(at(SETB, "X", d) - want[i]) < 5e-4, `${d}: ${at(SETB, "X", d)}`));
});

test("Z-cut: p'_bbbb = p11 for every phi (both sets); flip equals 180 deg rotation about Z", () => {
  for (const p of [AND, SETB])
    for (const d of [0, 17, 45, 90, 123, 170]) assert.ok(Math.abs(at(p, "Z", d) - p.p11) < 1e-15);
  const a = PE.rot180Z(PE.fullFrom3m(SETB));
  const b = PE.fullFrom3m(PE.flipP14P41(SETB));
  for (let i = 0; i < 81; i++) assert.ok(Math.abs(a[i] - b[i]) < 1e-15);
  const s = PE.inPlaneSweep(PE.fullFrom3m(AND), "X", 180);
  assert.equal(s.p.length, 180);
  assert.ok(Math.abs(s.p[45] - at(AND, "X", 45)) < 1e-15);
});
