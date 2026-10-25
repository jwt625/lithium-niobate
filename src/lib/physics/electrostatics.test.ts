// References:
// - Exact coplanar-gap field: two coplanar half-plane electrodes (potentials V and 0) separated by a gap G on z = 0 in a
//   medium that may differ above and below. The aperture z = 0, |x| < G/2 carries E_z = 0 by symmetry, so each half-space
//   solves independently: phi = V/2 - (V/pi) Re arcsin(2 zeta / G), zeta = x + i z (conformal map; derived here), giving
//   E_x(0, -d) = 2 V / (pi sqrt(G^2 + 4 d^2)) and, for a uniaxial half-space (eps_x, eps_z), d -> d sqrt(eps_x/eps_z).
// - Parallel-plate stack: C = eps0 P / sum(h_i / eps_z,i) per unit length for a period P (exact; series capacitors).
// - CPW conformal capacitance C = 2 eps0 (eps_r + 1) K(k)/K'(k): Qucs Technical Papers Eqs. (12.2)-(12.3), via rf.ts.
// Status of every computed field and capacitance: derived (numerical).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as E from "./electrostatics.ts";
import { coplanarLine } from "./rf.ts";
import { EPS0 } from "./constants.ts";

const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

test("gradedAxis: monotonic, contains every key point, spacing within [hMin/2, 1.5 hMax]", () => {
  const keys = [0, 1e-6, 2.5e-6, 7e-6];
  const a = E.gradedAxis(-5e-6, 20e-6, keys, 0.05e-6, 2e-6, 1.2);
  for (let i = 1; i < a.length; i++) assert.ok(a[i] > a[i - 1]);
  for (const k of keys) assert.ok(a.some((v) => Math.abs(v - k) < 1e-18));
  for (let i = 1; i < a.length; i++) {
    const h = a[i] - a[i - 1];
    assert.ok(h >= 0.025e-6 * 0.999 && h <= 3e-6, `h ${h}`);
  }
});

test("parallel-plate limit: covered periodic top electrode over LN/SiO2 with grounded bottom gives the series capacitance exactly", () => {
  const P = 4e-6;
  const layers = [
    { thickness_m: 0.6e-6, epsX: 26.7, epsZ: 44.9 },
    { thickness_m: 2e-6, epsX: 3.9, epsZ: 3.9 },
  ];
  const r = E.solveStack2D({ layers, coverHeight_m: 2e-6, xMin_m: 0, xMax_m: P, electrodes: [{ x0_m: 0, x1_m: P, V: 1 }], lateral: "periodic", bottom: "ground", hMin_m: 0.05e-6, hMax_m: 0.5e-6, tol: 1e-14 });
  const want = (EPS0 * P) / (0.6e-6 / 44.9 + 2e-6 / 3.9);
  assert.ok(rel(E.capacitancePerLength(r, 1), want) < 1e-9);
  // uniform D: E_z ratio across the interface equals eps ratio
  const F = E.nodalField(r);
  const eLN = E.fieldAt(r, F, 1e-6, -0.3e-6).Ez;
  const eOx = E.fieldAt(r, F, 1e-6, -1.6e-6).Ez;
  assert.ok(rel(eOx / eLN, 44.9 / 3.9) < 1e-9);
  assert.ok(rel(eLN, -1 / (0.6e-6 + (2e-6 * 44.9) / 3.9)) < 1e-9);
});

test("coplanar gap field vs exact conformal solution, isotropic and uniaxial half-space (1%)", () => {
  const G = 5e-6;
  const X = 60 * G;
  for (const [ex, ez] of [[10, 10], [26.7, 44.9]]) {
    const r = E.solveStack2D({
      layers: [{ thickness_m: X, epsX: ex, epsZ: ez }],
      coverHeight_m: X,
      xMin_m: -X,
      xMax_m: X,
      electrodes: [{ x0_m: -X, x1_m: -G / 2, V: 1 }, { x0_m: G / 2, x1_m: X, V: 0 }],
      bottom: "neumann",
      xExtra_m: [0],
      hMin_m: G / 200,
      hMax_m: X / 20,
      growth: 1.15,
    });
    const F = E.nodalField(r);
    for (const d of [0.5 * G, G, 2 * G]) {
      const want = 2 / (Math.PI * Math.sqrt(G * G + 4 * d * d * (ex / ez)));
      const got = E.fieldAt(r, F, 0, -d).Ex;
      assert.ok(rel(got, want) < 0.01, `eps ${ex}/${ez} d ${d}: ${got} vs ${want}`);
    }
    // the potential at the gap centre is V/2 by symmetry (grid is not exactly mirror-symmetric: 1e-3)
    assert.ok(Math.abs(E.fieldAt(r, F, 0, 0).phi - 0.5) < 1e-3);
  }
});

test("CPW capacitance on a thick substrate vs conformal mapping: sqrt(h) extrapolation within 2e-3; C/C_air within 3e-4", () => {
  const S = 10e-6;
  const W = 5e-6;
  const X = 60 * (S / 2 + W);
  const run = (eps: number, h: number) =>
    E.solveStack2D({
      layers: [{ thickness_m: X, epsX: eps, epsZ: eps }],
      coverHeight_m: X,
      xMin_m: 0,
      xMax_m: X,
      electrodes: [{ x0_m: 0, x1_m: S / 2, V: 1 }, { x0_m: S / 2 + W, x1_m: X, V: 0 }],
      bottom: "neumann",
      hMin_m: h,
      hMax_m: X / 20,
      growth: 1.15,
    });
  const ref = coplanarLine({ kind: "cpw", S_m: S, W_m: W, layers: [{ thickness_m: Infinity, epsX: 10, epsZ: 10 }] }).C_F_per_m;
  const c1 = 2 * E.capacitancePerLength(run(10, 0.1e-6), 1); // x2: symmetry plane at x = 0
  const c4 = 2 * E.capacitancePerLength(run(10, 0.025e-6), 1);
  assert.ok(rel(2 * c4 - c1, ref) < 2e-3, `extrapolated ${(2 * c4 - c1) / ref - 1}`);
  const ca = 2 * E.capacitancePerLength(run(1, 0.025e-6), 1);
  assert.ok(rel(c4 / ca, 5.5) < 3e-4);
});

test("periodic lateral boundary equals the mirrored Neumann half cell for a symmetric comb", () => {
  const P = 8e-6;
  const a = 1e-6;
  const layers = [{ thickness_m: 0.6e-6, epsX: 26.7, epsZ: 44.9 }, { thickness_m: 4.7e-6, epsX: 3.9, epsZ: 3.9 }, { thickness_m: 20e-6, epsX: 11.7, epsZ: 11.7 }];
  const common = { layers, coverHeight_m: 20e-6, bottom: "neumann" as const, hMin_m: 0.02e-6, hMax_m: 1e-6, growth: 1.15 };
  const per = E.solveStack2D({ ...common, xMin_m: -P / 2, xMax_m: P / 2, lateral: "periodic", electrodes: [{ x0_m: -a, x1_m: a, V: 1 }, { x0_m: -P / 2, x1_m: -P / 2 + a, V: 0 }, { x0_m: P / 2 - a, x1_m: P / 2, V: 0 }], xExtra_m: [0] });
  const half = E.solveStack2D({ ...common, xMin_m: 0, xMax_m: P / 2, lateral: "neumann", electrodes: [{ x0_m: 0, x1_m: a, V: 1 }, { x0_m: P / 2 - a, x1_m: P / 2, V: 0 }] });
  assert.ok(rel(E.capacitancePerLength(per, 1), 2 * E.capacitancePerLength(half, 1)) < 2e-3);
  const Fp = E.nodalField(per);
  const Fh = E.nodalField(half);
  const ep = E.fieldAt(per, Fp, 2e-6, -0.3e-6).Ex;
  const eh = E.fieldAt(half, Fh, 2e-6, -0.3e-6).Ex;
  assert.ok(rel(ep, eh) < 5e-3, `${ep} vs ${eh}`);
  // antisymmetry of Ex about the tooth centre in the periodic solution
  assert.ok(Math.abs(E.fieldAt(per, Fp, 2e-6, -0.3e-6).Ex + E.fieldAt(per, Fp, -2e-6, -0.3e-6).Ex) < 1e-3 * Math.abs(ep));
});

test("fieldVsDepth and meanFieldInBox: shapes and a uniform-field box average", () => {
  const P = 4e-6;
  const r = E.solveStack2D({ layers: [{ thickness_m: 1e-6, epsX: 5, epsZ: 5 }], coverHeight_m: 1e-6, xMin_m: 0, xMax_m: P, electrodes: [{ x0_m: 0, x1_m: P, V: 2 }], lateral: "periodic", bottom: "ground", hMin_m: 0.05e-6, hMax_m: 0.2e-6, tol: 1e-14 });
  const F = E.nodalField(r);
  const prof = E.fieldVsDepth(r, F, 1e-6, -0.9e-6, -0.1e-6); // interior nodes (one-sided differences at z = 0 see the cover)
  assert.equal(prof.z.length, prof.Ez.length);
  for (let k = 0; k < prof.z.length; k++) assert.ok(rel(prof.Ez[k], -2e6) < 1e-9);
  const m = E.meanFieldInBox(r, F, 0.5e-6, 3e-6, -0.8e-6, -0.2e-6);
  assert.ok(rel(m.Ez, -2e6) < 1e-9 && Math.abs(m.Ex) < 1e-3);
});
