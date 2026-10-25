// References: content/chapters/04-quirks/manuscript.md sec. 4.6 derived table (eps33^T 28.7 Warner via weis1985 Table 1;
// n_e 2.1376 at 1550 nm Zelmon 1997; r33^T 32.2 pm/V weis1985 Table 4; p3 4.0e-5 and 9.5e-5 C/(m^2 K)); sign rule
// weis1985 p. 196; schwesyg2011 Eq. 5.2 (2.6 kV/cm per K for p3 = -6.4e-5, P); sec. 4.7: Maxwell-Wagner two-layer
// closed form (R11 S8), li2026photonics RC fits 11.9 ms and 88.6 us (reported); effective sigma 2.1e-8 / 2.8e-6 S/m (derived).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as Y from "./pyro.ts";
import { pockelsDeltaN } from "./prslab.ts";
import { EPS0 } from "./constants.ts";

const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);
const sig2 = (a: number, b: number) => rel(a, b) < 0.05; // two significant figures of the printed value

test("sec. 4.6 derived table to 2 significant figures", () => {
  const eps = Y.EPS33T_WARNER.value;
  const ne = 2.1376, r = 32.2e-12;
  const rows: [number, number, number, number, number, number, number][] = [
    // |p3|, E/K (V/m), dn/K, sigma_b 95 K (C/m^2), E 95 K (V/m), V 0.5 mm, V 600 nm
    [4.0e-5, 1.57e5, 2.5e-5, 0.38e-2, 15e6, 7.5e3, 9.0],
    [9.5e-5, 3.74e5, 5.9e-5, 0.9e-2, 36e6, 17.8e3, 21],
  ];
  for (const [p, E1, dn1, q95, E95, V05, V600] of rows) {
    const p3 = -p;
    assert.ok(sig2(Math.abs(Y.pyroField(p3, 1, eps)), E1));
    assert.ok(sig2(Math.abs(pockelsDeltaN(ne, r, Y.pyroField(p3, 1, eps))), dn1));
    assert.ok(sig2(Math.abs(Y.pyroCharge(p3, 95)), q95));
    assert.ok(sig2(Math.abs(Y.pyroField(p3, 95, eps)), E95));
    assert.ok(sig2(Math.abs(Y.pyroVoltage(p3, 95, eps, 0.5e-3)), V05));
    assert.ok(sig2(Math.abs(Y.pyroVoltage(p3, 95, eps, 600e-9)), V600));
  }
  // schwesyg2011 Eq. 5.2: 2.6 kV/cm per K from p3 = -6.4e-5 (its eps not restated; 28.7 reproduces 2.5 kV/cm, within 5 %)
  assert.ok(rel(Math.abs(Y.pyroField(-6.4e-5, 1, eps)) / 1e5, 2.6) < 0.05);
});

test("sign rule: p3 < 0, cooling makes the +c face positive, heating negative", () => {
  for (const o of Y.P3_OPTIONS) {
    assert.ok(o.value < 0);
    assert.ok(Y.pyroCharge(o.value, -10) > 0);
    assert.ok(Y.pyroCharge(o.value, +10) < 0);
  }
});

test("P3 options equal the data rows (src/lib/generated/properties.json) where a row exists", () => {
  const rows = JSON.parse(readFileSync(new URL("../generated/properties.json", import.meta.url), "utf8")) as { id: string; value?: number }[];
  const get = (id: string) => rows.find((r) => r.id === id)?.value;
  assert.equal(get("pyroelectric-p3/cln/cti1999"), Y.P3_OPTIONS.find((o) => o.id === "cti1999")!.value);
  assert.equal(get("pyroelectric-p3/unspecified/schwesyg2011"), Y.P3_OPTIONS.find((o) => o.id === "schwesyg2011")!.value);
  assert.equal(get("pyroelectric-p3/unspecified/weis1985"), Y.P3_OPTIONS.find((o) => o.id === "savage1966")!.value);
});

test("screening decay is single exponential", () => {
  assert.ok(rel(Y.screenedDecay(3, 2, 2), 3 / Math.E) < 1e-15);
});

test("stackStep (2 layers) equals maxwellWagner2 to 1e-9 at 50 log-spaced times; t=0+ and t->inf divisions exact", () => {
  const L = [
    { epsR: 28, sigma: 1e-12, thickness_m: 0.6e-6 },
    { epsR: 3.9, sigma: 3e-11, thickness_m: 2e-6 },
  ];
  const a = Y.layerCG(L[0]), b = Y.layerCG(L[1]);
  const tau = Y.mwTau(a.C, a.G, b.C, b.G);
  const t = Array.from({ length: 50 }, (_, i) => tau * 10 ** (-4 + (8 * i) / 49));
  const s = Y.stackStep(L, 2.5, t);
  for (let i = 0; i < t.length; i++) assert.ok(rel(s.V[0][i], Y.maxwellWagner2(2.5, a.C, a.G, b.C, b.G, t[i])) < 1e-9);
  assert.ok(rel(s.taus[0], tau) < 1e-9);
  assert.ok(rel(Y.maxwellWagner2(1, a.C, a.G, b.C, b.G, 0), b.C / (a.C + b.C)) < 1e-15);
  assert.ok(rel(Y.maxwellWagner2(1, a.C, a.G, b.C, b.G, 1e6 * tau), b.G / (a.G + b.G)) < 1e-15);
});

test("stackResponse: capacitive ratio at high f, resistive ratio at low f; |H| matches drift.ts layerTransfer", async () => {
  const { driftModel, layerTransfer } = await import("./drift.ts");
  const L = [
    { epsR: 28, sigma: 1e-12, thickness_m: 0.6e-6 },
    { epsR: 3.9, sigma: 3e-11, thickness_m: 2e-6 },
    { epsR: 3.9, sigma: 1e-14, thickness_m: 1e-6 },
  ];
  const cg = L.map(Y.layerCG);
  const r = Y.stackResponse(L, [1e-9, 1e12, 3.3], 0);
  const sInvC = cg.reduce((s, x) => s + 1 / x.C, 0);
  const sInvG = cg.reduce((s, x) => s + 1 / x.G, 0);
  assert.ok(rel(r.mag[0], 1 / cg[0].G / sInvG) < 1e-6);
  assert.ok(rel(r.mag[1], 1 / cg[0].C / sInvC) < 1e-6);
  const m = driftModel(L.map((l, i) => ({ name: `${i}`, thickness_m: l.thickness_m, eps_r: l.epsR, sigma_S_per_m: l.sigma })));
  assert.ok(rel(r.mag[2], layerTransfer(m, 0, 3.3)) < 1e-12);
});

test("TFLN presets reproduce tau 11.9 ms and 88.6 us within 1 %, with positive and negative drift", () => {
  for (const id of ["clad", "airclad"]) {
    const p = Y.DRIFT_PRESETS.find((x) => x.id === id)!;
    const a = Y.layerCG(p.layers[0]), b = Y.layerCG(p.layers[1]);
    assert.ok(rel(Y.mwTau(a.C, a.G, b.C, b.G), p.targetTau_s!) < 0.01);
    const v0 = b.C / (a.C + b.C), vInf = b.G / (a.G + b.G);
    if (id === "clad") assert.ok(vInf > v0);
    else assert.ok(vInf < v0);
    assert.ok(p.layers.every((l) => l.sigma >= 0));
  }
  // effective LN-only conductivity implied by the fits (manuscript derived table): eps33 eps0 / tau
  assert.ok(sig2((28 * EPS0) / 11.9e-3, 2.1e-8));
  assert.ok(sig2((28 * EPS0) / 88.6e-6, 2.8e-6));
});

test("Arrhenius: identity at T0, 1.1 eV doubles sigma over the computed step; displayDrift template limits", () => {
  assert.equal(Y.arrhenius(1e-15, 1.1, 300, 300), 1e-15);
  const T1 = 1 / (1 / 300 - (Math.LN2 * 1.380649e-23) / (1.1 * 1.602176634e-19));
  assert.ok(rel(Y.arrhenius(1e-15, 1.1, T1, 300), 2e-15) < 1e-12);
  assert.equal(Y.displayDrift(0), 0);
  assert.ok(rel(Y.displayDrift(1e6), Math.PI / 2) < 1e-12);
});
