// References: content/chapters/02-light/manuscript.md eq. 2.17 (normalized LLE) and sec. 2.5 L3 (normalization per chembo2013);
// Herr et al., Nat. Photon. 8, 145 (2014) (single-soliton approximation psi_cw + sqrt(2 zeta) sech(sqrt(2 zeta/d2) theta),
// existence sqrt(8 zeta) <= pi f); figures.md F2-12 acceptance: sech^2 spectrum with the analytic width (Herr approximation),
// energy balance per step, existence lower edge consistent with the bistability threshold (zeta > sqrt(3)), N = 512.
// Homogeneous steady state f^2 = rho ((zeta - rho)^2 + 1) and turning points follow from eq. 2.17 with d/dt = 0 (derived).
// All parameter values below are template test inputs, not device data.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as L from "./lle.ts";
import { HBAR } from "./constants.ts";

const close = (a: number, b: number, tol: number, msg = "") => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} vs ${b}`);

test("normalization: f^2 = 8 eta_c gamma v_g FSR P_in / kappa^2; g0 N equals the Kerr shift gamma P_circ v_g", () => {
  const p = { lam_um: 1.55, ng: 2.3, FSR_Hz: 200e9, Q: 1e6, etaC: 0.5, D2_rad_per_s: 2 * Math.PI * 1e6, gamma_per_W_m: 1, Pin_W: 0.05, detuning_Hz: 300e6 };
  const n = L.lleNormalize(p);
  const vg = 299792458 / p.ng;
  close(n.f ** 2 / ((8 * p.etaC * p.gamma_per_W_m * vg * p.FSR_Hz * p.Pin_W) / n.kappa ** 2), 1, 1e-12);
  const w0 = (2 * Math.PI * 299792458) / 1.55e-6;
  const Nph = 1e5;
  const Pcirc = Nph * HBAR * w0 * p.FSR_Hz;
  close((n.g0 * Nph) / (p.gamma_per_W_m * Pcirc * vg), 1, 1e-12);
  close(n.zeta, (4 * Math.PI * 300e6) / n.kappa, 1e-12);
  close(n.d2, (2 * p.D2_rad_per_s) / n.kappa, 1e-15);
  close(L.lleNormalize({ ...p, Pin_W: n.Pin_f1_W }).f, 1, 1e-12);
});

test("homogeneous states and bistability: three roots inside the turning-point range only for zeta > sqrt(3)", () => {
  assert.equal(L.lleBistableRange(Math.sqrt(3) - 1e-9), null);
  const [lo, hi] = L.lleBistableRange(8) as [number, number];
  assert.equal(L.lleHomogeneous(8, 0.5 * (lo + hi)).length, 3);
  assert.equal(L.lleHomogeneous(8, 0.9 * lo).length, 1);
  assert.equal(L.lleHomogeneous(8, 1.1 * hi).length, 1);
  assert.equal(L.lleHomogeneous(1.5, 3).length, 1);
  for (const r of L.lleHomogeneous(8, 3)) close(r * ((8 - r) ** 2 + 1), 9, 1e-9);
  // a homogeneous root is a fixed point of the solver
  const rho = L.lleHomogeneous(8, 3)[0];
  const s = L.lleCreate(64, L.lleHomogeneousField(8, 3, rho));
  L.lleStep(s, { zeta: 8, f: 3, d2: 0.08 }, 1e-3, 2000);
  close(L.lleMeans(s).power / rho, 1, 1e-6); // split-step error O(dt^2)
});

test("single soliton (zeta 8, f 3, d2 0.08, N 512): one pulse, sech^2 spectrum width within 10% of the Herr approximation", () => {
  const p = { zeta: 8, f: 3, d2: 0.08 };
  const s = L.lleSolitonAnsatz(512, p);
  L.lleStep(s, p, 1e-3, 20000);
  assert.equal(L.lleCountSolitons(s), 1);
  const sp = L.lleSpectrum(s);
  const xs: number[] = [];
  const ys: number[] = [];
  for (let j = 0; j < sp.mu.length; j++)
    if (sp.mu[j] >= 10 && sp.mu[j] <= 60) {
      xs.push(sp.mu[j]);
      ys.push(Math.log(sp.P[j]));
    }
  const n = xs.length;
  const sx = xs.reduce((a, b) => a + b, 0), sy = ys.reduce((a, b) => a + b, 0);
  const sxx = xs.reduce((a, b) => a + b * b, 0), sxy = xs.reduce((a, b, i) => a + b * ys[i], 0);
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const wFit = -slope / Math.PI; // sech^2(pi w mu / 2) ~ exp(-pi w mu)
  const wHerr = Math.sqrt(p.d2 / (2 * p.zeta));
  assert.ok(Math.abs(wFit / wHerr - 1) < 0.1, `w ${wFit} vs ${wHerr}`);
  // spectrum is symmetric (no Raman, no higher-order dispersion)
  const P = (m: number) => sp.P[m + 256];
  close(P(20) / P(-20), 1, 1e-6);
  // energy balance per step
  let worst = 0;
  for (let i = 0; i < 20; i++) worst = Math.max(worst, L.lleEnergyResidual(s, p, 1e-3));
  assert.ok(worst < 1e-4, `energy residual ${worst}`);
});

test("no soliton without bistability: a pulse decays to the single homogeneous state at zeta = 1.5 < sqrt(3)", () => {
  // f = 1.11 keeps the homogeneous state below rho = 1 (modulationally stable) and satisfies sqrt(8 zeta) <= pi f
  const p = { zeta: 1.5, f: 1.11, d2: 0.08 };
  const s = L.lleSolitonAnsatz(512, p);
  const contrast = () => {
    let lo = Infinity, hi = -Infinity;
    for (let n = 0; n < s.N; n++) {
      const I = s.re[n] ** 2 + s.im[n] ** 2;
      lo = Math.min(lo, I);
      hi = Math.max(hi, I);
    }
    return hi - lo;
  };
  const c0 = contrast();
  L.lleStep(s, p, 1e-3, 20000);
  assert.equal(L.lleCountSolitons(s), 0);
  const c1 = contrast();
  L.lleStep(s, p, 1e-3, 20000);
  const c2 = contrast();
  assert.ok(c1 < 0.2 * c0 && c2 < 0.3 * c1, `contrast ${c0} ${c1} ${c2}`);
  close(L.lleMeans(s).power, L.lleHomogeneous(1.5, 1.11)[0], 1e-3);
  assert.ok(L.lleHomogeneous(1.5, 1.11)[0] < 1);
  assert.throws(() => L.lleSolitonAnsatz(64, { zeta: 20, f: 1, d2: 0.1 }), RangeError);
});

test("seeded red-detuning scan (zeta -2 -> 8, f 3) ends on discrete solitons, deterministic per seed", () => {
  const run = (steps: number) => {
    const s = L.lleCreate(512, L.lleHomogeneousField(-2, 3, L.lleHomogeneous(-2, 3)[0]), 1e-3, 7);
    const sc = L.lleScan(s, { f: 3, d2: 0.08 }, -2, -2 + (10 * steps) / 40000, steps, 5e-4, 100);
    return { n: L.lleCountSolitons(s), last: sc.power[sc.power.length - 1], max: Math.max(...sc.power) };
  };
  assert.deepEqual(run(4000), run(4000));
  const a = run(40000);
  assert.ok(a.n >= 1, `solitons ${a.n}`);
  assert.ok(a.max > 2 * a.last);
});
