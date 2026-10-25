// References: content/chapters/03-sound/figures.md F3.9 acceptance (p05 arXiv v1 Eq. 4 parameters; blue detuning at
// n_c = 4e4: C = 0.48, eta = 4.24e-4 x 4(0.48)/(0.52)^2 = 3.0e-3; G_int = 4C/(1 - C)^2 = 126 at C = 0.837;
// 4.24e-4 x 10^(21/10) = 5.3%; red side peaks at eta_e at C = 1; eta_oc eta_o eta_m = 4.26e-4 vs fit 4.24e-4);
// F3.10 / manuscript sec. 3.7 L2: thermal occupation of a 2 GHz mode 3.1e3 at 300 K, 6.8e-5 at 10 mK.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as O from "./optomech.ts";

const P = O.P05_PARAMS;

test("F3.9 blue detuning: C = 0.48 at n_c = 4e4, eta = 3.0e-3; instability at C >= 1", () => {
  const r = O.transductionEfficiency({ ...P, nc: 4e4, detuning: "blue" });
  assert.ok(Math.abs(r.C - 0.48) < 1e-12);
  assert.ok(Math.abs(r.eta - 3.0e-3) < 0.05e-3, `${r.eta}`);
  assert.ok(Math.abs(r.eta - (4.24e-4 * 4 * 0.48) / 0.52 ** 2) < 1e-15);
  assert.ok(O.transductionEfficiency({ ...P, nc: 1 / P.C0, detuning: "blue" }).unstable);
});

test("F3.9 internal gain 126 at C = 0.837 (blue); 21 dB x eta_e = 5.3%; red maximum eta_e at C = 1", () => {
  assert.ok(Math.abs(O.internalGain(0.837, "blue") - 126) < 0.5);
  assert.ok(Math.abs(4.24e-4 * 10 ** 2.1 - 0.053) < 0.0005); // manuscript arithmetic only (no library code)
  const red = (nc: number) => O.transductionEfficiency({ ...P, nc, detuning: "red" }).eta;
  const nc1 = 1 / P.C0;
  assert.ok(Math.abs(red(nc1) - P.etaE) < 1e-15);
  assert.ok(red(nc1 * 0.9) < red(nc1) && red(nc1 * 1.1) < red(nc1));
  assert.ok(Math.abs(O.internalGain(0.3, "red") - 1.2 / 1.69) < 1e-15);
});

test("F3.9 identity: eta_oc eta_o eta_m = 4.26e-4 vs fitted eta_e 4.24e-4 (rel 1%)", () => {
  const r = O.transductionEfficiency({ etaOc: P.etaOc, etaO: P.etaO, etaM: P.etaM, C0: P.C0, nc: 1e3, detuning: "red" });
  assert.ok(Math.abs(r.etaE - 4.26e-4) < 0.005e-4, `${r.etaE}`);
  assert.ok(Math.abs(r.etaE / 4.24e-4 - 1) < 0.01);
});

test("F3.10 thermal occupation at 2 GHz: 3.1e3 at 300 K, 6.8e-5 at 10 mK; classical limit kT/hf", () => {
  const n300 = O.thermalOccupation(2e9, 300);
  assert.ok(Math.abs(n300 - 3.1e3) < 0.05e3, `${n300}`);
  const n10 = O.thermalOccupation(2e9, 0.01);
  assert.ok(Math.abs(n10 - 6.8e-5) < 0.05e-5, `${n10}`);
  const kT_hf = (1.380649e-23 * 300) / (6.62607015e-34 * 2e9);
  assert.ok(Math.abs(n300 - (kT_hf - 0.5)) < 1e-3);
  assert.equal(O.thermalOccupation(2e9, 0), 0);
});
