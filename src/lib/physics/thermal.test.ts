// References: R06 sec. 2.4 / data rows dne-dt/cln/jundt1997-* (4.89e-5, 4.01e-5, 3.75e-5 /K at 633, 1064, 1550 nm, 25 C;
// Jundt 1997 via Wikipedia, S); schwesyg2011 Eqs. 2.26-2.28 (Moretti 2005 fits, thermal lens), manuscript sec. 4.8 derived
// lens check (10 W, w 150 um, alpha 0.005 /cm, L 20 mm, K_th 5 W/(m K), dn_e/dT(632 nm, 373 K) = 5.76e-5 -> f = 61 mm);
// carmon2004 (thermal triangle: dragging on the increasing-wavelength sweep, width grows with power); Bogaerts 2012 all-pass
// (critical coupling null); Lorentzian FWHM = lambda / Q_L (coupled-mode theory, Haus).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as Th from "./thermal.ts";
import { allPass } from "./ring.ts";
import { qpmPeriodSHG } from "./phasematching.ts";
import { indexFn } from "./sellmeier.ts";
import { JUNDT_CLN_E } from "./constants.ts";

const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

test("dn_e/dT (Jundt, 25 C) reproduces R06 / data rows to 3 significant figures", () => {
  const rows = JSON.parse(readFileSync(new URL("../generated/properties.json", import.meta.url), "utf8")) as { id: string; value?: number }[];
  const v = (id: string) => rows.find((r) => r.id === id)!.value!;
  assert.ok(rel(Th.dnedT(0.633, 25), v("dne-dt/cln/jundt1997-633nm")) < 0.005);
  assert.ok(rel(Th.dnedT(1.064, 25), v("dne-dt/cln/jundt1997-1064nm")) < 0.005);
  assert.ok(rel(Th.dnedT(1.55, 25), v("dne-dt/cln/jundt1997-1550nm")) < 0.005);
});

test("Moretti fits at 300 K: 0.37e-5 (o) and 4.12e-5 (e); range enforced", () => {
  assert.ok(Math.abs(Th.morettiDnDT("o", 300) - 0.37e-5) < 0.005e-5);
  assert.ok(Math.abs(Th.morettiDnDT("e", 300) - 4.12e-5) < 0.005e-5);
  assert.throws(() => Th.morettiDnDT("e", 250), RangeError);
});

test("thermal lens example gives 61 mm", () => {
  const dndT = Th.morettiDnDT("e", 373.15);
  assert.ok(Math.abs(dndT - 5.76e-5) < 0.01e-5);
  const f = Th.thermalLensFocal(150e-6, 5, 0.5, 10, 0.02, dndT);
  assert.ok(Math.abs(f - 0.061) < 0.0005);
});

test("ring shift per kelvin and QPM detuning: zero at the phase-matched period, slope finite", () => {
  assert.ok(rel(Th.thermalShiftPerK(1.55e-6, 1, 3.75e-5, 2.3), (1.55e-6 * 3.75e-5) / 2.3) < 1e-15);
  const L = qpmPeriodSHG(1.55, indexFn(JUNDT_CLN_E), 1, 40);
  assert.ok(Math.abs(Th.qpmDetuning(1.55, L, 40)) < 1e-6);
  assert.ok(Math.abs(Th.qpmDetuningDT(1.55, L, 40)) > 1);
});

test("all-pass at critical coupling r = a: T_min < 1e-6", () => {
  assert.ok(allPass(0, 0.99, 0.99) < 1e-6);
});

const base = Th.RING_SWEEP_TEMPLATE.params;

test("ringSweep, PR off, P -> 0: Lorentzian dip with FWHM = lambda / Q_L within 1 %, minimum ~0 at critical coupling", () => {
  const r = Th.ringSweep({ ...base, P_W: 1e-9, lambdaStart_m: base.lambda0_m - 15e-12, lambdaStop_m: base.lambda0_m + 15e-12, nOut: 20001, maxSteps: 20000, dt_s: 1e-4 });
  let iMin = 0;
  for (let i = 0; i < r.T.length; i++) if (r.T[i] < r.T[iMin]) iMin = i;
  assert.ok(r.T[iMin] < 1e-3);
  const half = (1 + r.T[iMin]) / 2;
  const cross = (dir: number) => {
    let i = iMin;
    while (r.T[i] < half) i += dir;
    const j = i - dir;
    return r.lambda[j] + ((half - r.T[j]) * (r.lambda[i] - r.lambda[j])) / (r.T[i] - r.T[j]);
  };
  const fwhm = Math.abs(cross(1) - cross(-1));
  assert.ok(rel(fwhm, r.linewidth_m) < 0.01, `${fwhm} vs ${r.linewidth_m}`);
});

const dropPoint = (r: Th.RingSweepResult): number => {
  let iMin = 0;
  for (let i = 0; i < r.T.length; i++) if (r.T[i] < r.T[iMin]) iMin = i;
  return r.lambda[iMin];
};

test("thermal only, increasing-wavelength sweep: triangle width grows monotonically with power; hysteresis vs decreasing sweep", () => {
  const P = [0.3e-3, 1e-3, 3e-3, 10e-3];
  const lo = base.lambda0_m - 20e-12, hi = base.lambda0_m + 400e-12;
  const up = P.map((p) => dropPoint(Th.ringSweep({ ...base, P_W: p, lambdaStart_m: lo, lambdaStop_m: hi })) - base.lambda0_m);
  for (let i = 1; i < up.length; i++) assert.ok(up[i] > up[i - 1], `${up}`);
  const down = Th.ringSweep({ ...base, P_W: 3e-3, lambdaStart_m: hi, lambdaStop_m: lo });
  assert.ok(dropPoint(down) - base.lambda0_m < up[2] / 2);
});

test("photorefraction with the thermal sign drags like heating (thermal off); opposite sign shortens the triangle", () => {
  const lo = base.lambda0_m - 20e-12, hi = base.lambda0_m + 200e-12;
  const common = { ...base, P_W: 3e-3, lambdaStart_m: lo, lambdaStop_m: hi, prGain_A_per_W: 1e-8, kappa_S_m_per_W: 1e-14, sigmaDark_S_m: 1e-14 };
  const prLike = Th.ringSweep({ ...common, Rth_K_per_W: 0, prSign: +1 });
  assert.ok(dropPoint(prLike) - base.lambda0_m > 3 * prLike.linewidth_m);
  assert.ok(Math.max(...prLike.dTcav) === 0);
  const thOnly = Th.ringSweep({ ...common, prGain_A_per_W: 0 });
  const both = Th.ringSweep({ ...common, prSign: -1 });
  assert.ok(dropPoint(both) < dropPoint(thOnly));
});
