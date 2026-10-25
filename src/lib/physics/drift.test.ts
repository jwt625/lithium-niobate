// References: R11 S8 two-layer Maxwell-Wagner closed form V1(t)/V = G2/(G1+G2) + (C2/(C1+C2) - G2/(G1+G2)) e^{-t/tau},
// tau = (C1+C2)/(G1+G2); t = 0 capacitive and t -> infinity resistive division; independent RK4 integration of the
// series-RC ODE for N = 3.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as D from "./drift.ts";
import { EPS0 } from "./constants.ts";
import type { Layer } from "./drift.ts";

const L1: Layer = { name: "a", thickness_m: 1e-6, eps_r: 3.9, sigma_S_per_m: 1e-11 };
const L2: Layer = { name: "b", thickness_m: 0.6e-6, eps_r: 28.5, sigma_S_per_m: 1e-14 };
const L3: Layer = { name: "c", thickness_m: 2e-6, eps_r: 3.9, sigma_S_per_m: 1e-13 };

test("two layers: exact model equals the R11 closed form at all times", () => {
  const m = D.driftModel([L1, L2]);
  assert.equal(m.rates.length, 1);
  for (const t of [0, 1e-3, 0.1, 1, 10, 100, 1e4]) {
    assert.ok(Math.abs(D.layerVoltage(m, 0, t) - D.twoLayerClosedForm(L1, L2, t)) < 1e-12, `t ${t}`);
    assert.ok(Math.abs(D.layerVoltage(m, 0, t) + D.layerVoltage(m, 1, t) - 1) < 1e-12);
  }
  const C1 = (EPS0 * 3.9) / 1e-6, C2 = (EPS0 * 28.5) / 0.6e-6, G1 = 1e-11 / 1e-6, G2 = 1e-14 / 0.6e-6;
  assert.ok(Math.abs(m.taus[0] - (C1 + C2) / (G1 + G2)) / m.taus[0] < 1e-10);
});

test("three layers: t = 0 capacitive, t -> infinity resistive, and agreement with RK4 of the circuit ODE", () => {
  // moderate time-constant spread so explicit RK4 stays stable with uniform steps
  const ls: Layer[] = [
    { name: "a", thickness_m: 1e-6, eps_r: 3.9, sigma_S_per_m: 2e-12 },
    { name: "b", thickness_m: 0.6e-6, eps_r: 28.5, sigma_S_per_m: 1e-12 },
    { name: "c", thickness_m: 2e-6, eps_r: 3.9, sigma_S_per_m: 1e-13 },
  ];
  const m = D.driftModel(ls);
  assert.equal(m.rates.length, 2);
  assert.ok(m.taus[0] < m.taus[1], "taus ascending");
  m.v0.forEach((v, k) => assert.ok(Math.abs(D.layerVoltage(m, k, 0) - v) < 1e-12));
  m.vInf.forEach((v, k) => assert.ok(Math.abs(D.layerVoltage(m, k, 1e9) - v) < 1e-9));
  // RK4: unknowns V1..V3 with C_i V_i' + G_i V_i = I (same for all), sum V_i = 1
  const C = ls.map((l) => (EPS0 * l.eps_r) / l.thickness_m), G = ls.map((l) => l.sigma_S_per_m / l.thickness_m);
  const f = (V: number[]) => {
    // I = (sum G_i V_i / C_i) / (sum 1/C_i) from sum V_i' = 0
    const I = V.reduce((s, v, i) => s + (G[i] * v) / C[i], 0) / C.reduce((s, c) => s + 1 / c, 0);
    return V.map((v, i) => (I - G[i] * v) / C[i]);
  };
  let V = [...m.v0];
  const tEnd = 3 * m.taus[1];
  const N = 20000;
  // integrate in log time is unnecessary: use uniform steps over the slow constant, fast mode resolved by small h
  const tFast = m.taus[0];
  let t = 0;
  const steps = (T: number, n: number) => {
    const h = (T - t) / n;
    for (let i = 0; i < n; i++) {
      const k1 = f(V), k2 = f(V.map((v, j) => v + 0.5 * h * k1[j])), k3 = f(V.map((v, j) => v + 0.5 * h * k2[j])), k4 = f(V.map((v, j) => v + h * k3[j]));
      V = V.map((v, j) => v + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
    }
    t = T;
  };
  steps(10 * tFast, N);
  steps(tEnd, N);
  V.forEach((v, k) => assert.ok(Math.abs(v - D.layerVoltage(m, k, tEnd)) < 1e-7, `layer ${k}: ${v} vs ${D.layerVoltage(m, k, tEnd)}`));
});

test("|H(f)|: DC equals the resistive division, high frequency the capacitive division", () => {
  const m = D.driftModel([L1, L2, L3]);
  for (let k = 0; k < 3; k++) {
    assert.ok(Math.abs(D.layerTransfer(m, k, 1e-12) - m.vInf[k]) < 1e-6);
    assert.ok(Math.abs(D.layerTransfer(m, k, 1e9) - m.v0[k]) < 1e-9);
  }
});

test("an insulating layer keeps the voltage at t -> infinity", () => {
  const ins: Layer = { ...L2, sigma_S_per_m: 0 };
  const m = D.driftModel([L1, ins]);
  assert.ok(Math.abs(m.vInf[1] - 1) < 1e-15 && m.vInf[0] === 0);
  assert.ok(Math.abs(D.layerVoltage(m, 1, 1e6) - 1) < 1e-9);
});

test("example stack carries provenance and yields finite time constants", () => {
  const m = D.driftModel(D.DRIFT_EXAMPLE.layers);
  assert.equal(m.taus.length, 2);
  assert.ok(m.taus.every((t) => Number.isFinite(t) && t > 0));
  assert.equal(D.DRIFT_EXAMPLE.prov["SiO2 cladding.sigma"].status, "template");
  assert.equal(D.DRIFT_EXAMPLE.prov["LN film.eps_r"].status, "P");
});
