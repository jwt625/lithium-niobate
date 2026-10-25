// Process viewer model checks (figures.md F05-01 P1, P6, P8 state parts; F05-07 field count). Run: node --test src/lib/scenes/process/model.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { evaluate, fieldLayout, frameAt, hud, routeSteps, stateHash, TH } from "./model.ts";
import type { Route } from "./model.ts";

const ROUTES: Route[] = ["ridge_duv", "strip_dlc"];
const TS = [0, 0.1, 0.2, 0.25, 0.5, 0.62, 0.75, 0.8, 0.9, 1];

test("P1 determinism: forward and backward evaluation give identical state hashes on both routes", () => {
  for (const r of ROUTES) {
    const n = routeSteps(r).length, fwd: string[] = [], bwd: string[] = [];
    for (let k = 0; k < n; k++) for (const t of TS) fwd.push(stateHash(evaluate(r, k, t)));
    for (let k = n - 1; k >= 0; k--) for (const t of [...TS].reverse()) bwd.push(stateHash(evaluate(r, k, t)));
    assert.deepEqual(fwd, bwd.reverse());
  }
});

test("routes: ridge has 9 steps ending in s15r_expose, strip has 8 ending in s14s_expose", () => {
  assert.deepEqual(routeSteps("ridge_duv").map((s) => s.id).at(-1), "s15r_expose");
  assert.equal(routeSteps("ridge_duv").length, 9);
  assert.deepEqual(routeSteps("strip_dlc").map((s) => s.id).at(-1), "s14s_expose");
  assert.equal(routeSteps("strip_dlc").length, 8);
});

test("film: split at 0.68 um, CMP to the 600 nm target, oxide 4.7 um after s07", () => {
  const r: Route = "ridge_duv", ix = (id: string): number => routeSteps(r).findIndex((s) => s.id === id);
  assert.equal(evaluate(r, ix("s11_cmp"), 0).film.nm, 680);
  assert.equal(evaluate(r, ix("s11_cmp"), 1).film.nm, TH.target_nm);
  assert.equal(evaluate(r, ix("s12_recovery_anneal"), 0.5).film.nm, 600);
  assert.equal(evaluate(r, ix("s08_implant"), 0).handle.oxideUm, 4.7);
  assert.equal(evaluate(r, ix("s07_handle"), 0).handle.oxideUm, 0);
});

test("P8 state: donor is flipped from the end of the bond step on; donor removed after the split", () => {
  const r: Route = "strip_dlc", ix = (id: string): number => routeSteps(r).findIndex((s) => s.id === id);
  assert.equal(evaluate(r, ix("s08_implant"), 1).donor.flip, 0);
  assert.equal(evaluate(r, ix("s09_bond"), 1).donor.flip, 1);
  assert.equal(evaluate(r, ix("s10_split"), 0).donor.flip, 1);
  assert.equal(evaluate(r, ix("s11_cmp"), 0).donor.present, false);
});

test("E5 camera frame changes only at retarget steps", () => {
  for (const r of ROUTES) {
    const st = routeSteps(r);
    for (let k = 1; k < st.length; k++) if (!st[k].camera.retarget) assert.equal(frameAt(r, k), frameAt(r, k - 1));
  }
});

test("fields per wafer: 6 for 100 mm and 21 for 150 mm with 8 mm edge exclusion (F05-07)", () => {
  assert.equal(fieldLayout(100, 8, 22).fields.length, 6);
  assert.equal(fieldLayout(150, 8, 22).fields.length, 21);
});

test("HUD: every parameter carries a status; reported ones carry a source", () => {
  for (const r of ROUTES) for (let k = 0; k < routeSteps(r).length; k++) {
    const h = hud(r, k, 0.5);
    for (const p of h.params) {
      assert.ok(["reported", "derived", "template", "na"].includes(p.status), `${h.step.id} ${p.key} ${p.status}`);
      if (p.status === "reported") assert.ok(p.source, `${h.step.id} ${p.key}`);
    }
  }
});
