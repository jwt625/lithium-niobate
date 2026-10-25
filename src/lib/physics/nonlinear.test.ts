// References: content/chapters/02-light/manuscript.md eqs. 2.10-2.11 (d tensor and P_NL), 2.13-2.16, sec. 2.4 L2 (OPO output),
// sec. 2.5 L2 (gamma_Kerr); figures.md acceptance F2-06, F2-07 (GVM 302 fs/mm; tuning 0.115 nm/K, Jundt, 25 C), F2-09
// (2600 %/W/cm^2 x 0.25 cm^2 = 650 %/W; ring formula at kappa_ex = kappa/2), F2-10 (14.0 / 44.3 / 140 dB/cm at 0.1 / 1 / 10 W
// for 2600 %/W/cm^2; Q^-3 and Q^-2 threshold scaling; efficiency maximum at 4 P_th), F2-11 (RK4 arg(A_w) = +4.1378e-3 rad
// vs eq. 2.16 -4.1380e-3 rad at eta 2.6e5 /(W m^2), P 0.1 W, L 1 cm, dk 2 pi/(100 um); |gamma_casc| 4.1 /(W m); SH fraction
// mean 1.3e-5, peak 2.6e-5; gamma_Kerr 0.378 /(W m) at A_eff 1 um^2 with n2 = 9.33e-20 m^2/W, desalvo1996 via
// src/lib/generated/properties.json). Degeneracy factors: Boyd, Nonlinear Optics, 3rd ed. (2008) ch. 1.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as N from "./nonlinear.ts";
import { dShg3m, rotateTensor3, rotZ, voigtToTensor3, tensor3ToVoigt } from "./tensors.ts";
import { refractiveIndex } from "./sellmeier.ts";
import { ZELMON_CLN_E, JUNDT_CLN_E, HBAR } from "./constants.ts";
import { opoThresholdGammaL_DRO } from "./coupledmode.ts";
import type { Vec3 } from "./linalg.ts";

const close = (a: number, b: number, tol: number, msg = "") => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} vs ${b}`);

test("P_NL (eq. 2.11): x-cut TE uses d33 only; E || x gives P_y = -2 d22, P_z = 2 d31; E || y gives P_y = +2 d22", () => {
  const d = dShg3m({ d22: 1, d31: 10, d33: 100 });
  assert.deepEqual(N.nonlinearPolarization(d, [0, 0, 1]), [0, 0, 200]);
  assert.deepEqual(N.activeVoigtColumns([0, 0, 1]), [2]);
  assert.deepEqual(N.nonlinearPolarization(d, [1, 0, 0]), [0, -2, 20]);
  assert.deepEqual(N.nonlinearPolarization(d, [0, 1, 0]), [0, 2, 20]);
  // Kleinman form: d15 = d24 = d31
  assert.equal(d[0][4], d[2][0]);
  assert.equal(d[1][3], d[2][0]);
  // o-polarized inputs (in the xy plane) never activate column 3 (d33)
  for (let i = 0; i < 36; i++) {
    const a = (i * Math.PI) / 18;
    assert.ok(!N.activeVoigtColumns([Math.cos(a), Math.sin(a), 0]).includes(2));
  }
});

test("P_NL is invariant under the 120 deg rotation about z; SFG factor 4 reduces to 2 x SHG for equal fields", () => {
  const d = dShg3m({ d22: 2.1, d31: -4.6, d33: 25 });
  const R = rotZ((2 * Math.PI) / 3);
  const dR = tensor3ToVoigt(rotateTensor3(voigtToTensor3(d, "dSHG"), R), "dSHG");
  for (const E of [[0.3, -0.7, 0.2], [1, 0.4, -0.9]] as Vec3[]) {
    const a = N.nonlinearPolarization(d, E);
    const b = N.nonlinearPolarization(dR, E);
    for (let i = 0; i < 3; i++) close(a[i], b[i], 1e-12);
    const s = N.nonlinearPolarization(d, E, E);
    for (let i = 0; i < 3; i++) close(s[i], 2 * a[i], 1e-12);
  }
});

test("GVM 1550 / 775 nm (Zelmon CLN e, 21 C) = 302 fs/mm", () => {
  const ne = (l: number) => refractiveIndex(ZELMON_CLN_E, l);
  close(N.gvm(1.55, ne, 0.775, ne), 302, 0.5);
  close(N.groupIndexFn(ne, 1.55), 2.1823, 5e-5);
});

test("QPM SHG tuning 0.115 nm/K at 1550 nm (Jundt, 25 C)", () => {
  const ne = (l: number, T?: number) => refractiveIndex(JUNDT_CLN_E, l, T);
  close(N.shgQpmTuningRate(1.55, ne, 25), 0.115, 5e-4);
});

test("converter 2600 %/W/cm^2 at L = 0.5 cm -> 650 %/W; ring formula equals the general form at kappa_ex = kappa/2", () => {
  close(N.percentPerW(2600, 0.5), 650, 1e-9);
  const p = { g: 2 * Math.PI * 1.2e6, kappa_a: 2e9, kappa_b: 3e9, omega_a: (2 * Math.PI * 299792458) / 1.55e-6 };
  const gen = N.ringShgEfficiency({ ...p, kappa_a_ex: p.kappa_a / 2, kappa_b_ex: p.kappa_b / 2 });
  const crit = N.ringShgEfficiencyCritical(p.g, p.kappa_a, p.kappa_b, p.omega_a);
  close(gen / crit, 1, 1e-12);
  // Q^3 scaling at fixed g and fixed coupling ratios
  const g2 = N.ringShgEfficiency({ ...p, kappa_a: p.kappa_a / 2, kappa_b: p.kappa_b / 2, kappa_a_ex: p.kappa_a / 4, kappa_b_ex: p.kappa_b / 4 });
  close(g2 / gen, 8, 1e-9);
});

test("ring SHG efficiency vs undepleted coupled-mode steady state (independent RK4 in time)", () => {
  // H/hbar = g (a^dag^2 b + a^2 b^dag): da/dt = -(ka/2) a - 2 i g a* b + sqrt(kae) s, db/dt = -(kb/2) b - i g a^2
  const g = 1e-3, ka = 1, kb = 1.5, kae = 0.3, kbe = 0.9;
  const s = 1e-2; // weak drive: depletion negligible
  let ar = 0, ai = 0, br = 0, bi = 0;
  const h = 0.01;
  for (let n = 0; n < 4000; n++) {
    const f = (x: number[]) => {
      const [Ar, Ai, Br, Bi] = x;
      // a* b
      const cr = Ar * Br + Ai * Bi, ci = Ar * Bi - Ai * Br;
      const a2r = Ar * Ar - Ai * Ai, a2i = 2 * Ar * Ai;
      return [-(ka / 2) * Ar + 2 * g * ci + Math.sqrt(kae) * s, -(ka / 2) * Ai - 2 * g * cr, -(kb / 2) * Br + g * a2i, -(kb / 2) * Bi - g * a2r];
    };
    const y = [ar, ai, br, bi];
    const k1 = f(y), k2 = f(y.map((v, j) => v + (h / 2) * k1[j])), k3 = f(y.map((v, j) => v + (h / 2) * k2[j])), k4 = f(y.map((v, j) => v + h * k3[j]));
    [ar, ai, br, bi] = y.map((v, j) => v + (h / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j]));
  }
  const omega_a = 1 / HBAR; // hbar omega_a = 1 (arbitrary energy unit)
  const Pin = HBAR * omega_a * s * s;
  const Pout = HBAR * 2 * omega_a * kbe * (br * br + bi * bi);
  const eta = N.ringShgEfficiency({ g, kappa_a: ka, kappa_b: kb, kappa_a_ex: kae, kappa_b_ex: kbe, omega_a });
  close(Pout / Pin ** 2 / eta, 1, 1e-6);
});

test("OPO (eq. 2.15): threshold Q^-3 (all resonant), DRO single-pass pump Q^-2; output 0 below threshold", () => {
  const base = { omega_p: 2.43e15, kappa_p: 1e9, kappa_p_ex: 5e8, kappa_s: 1e9, kappa_i: 1e9, g: 2 * Math.PI * 1e5 };
  const t1 = N.opoThreshold(base).P_th_W;
  const t2 = N.opoThreshold({ ...base, kappa_p: 5e8, kappa_p_ex: 2.5e8, kappa_s: 5e8, kappa_i: 5e8 }).P_th_W;
  close(t1 / t2, 8, 1e-9);
  // DRO: (Gamma L)_th^2 ~ loss^2 for high finesse; doubling Q (halving 1 - R) quarters the threshold power
  const r1 = opoThresholdGammaL_DRO(0.99, 0.99) ** 2, r2 = opoThresholdGammaL_DRO(0.995, 0.995) ** 2;
  close(r1 / r2, 4, 0.03); // high-finesse asymptote (ratio -> 4 as R -> 1)
  const c = { kappa_s_ex: 4e8, kappa_s: 1e9, kappa_p_ex: 5e8, kappa_p: 1e9 };
  assert.equal(N.opoOutput(t1, t1, c), 0);
  assert.equal(N.opoOutput(0.5 * t1, t1, c), 0);
});

test("OPO conversion peaks at 4 P_th with value kappa_s,ex kappa_p,ex / (kappa_s kappa_p); 100% only when fully overcoupled", () => {
  const c = { kappa_s_ex: 0.6, kappa_s: 1, kappa_p_ex: 0.7, kappa_p: 1 };
  let best = 0, bestX = 0;
  for (let i = 1; i <= 20000; i++) {
    const x = 1 + i * 0.001;
    const e = N.opoOutput(x, 1, c) / x;
    if (e > best) { best = e; bestX = x; }
  }
  close(bestX, 4, 2e-3);
  close(best, 0.6 * 0.7, 1e-9);
  close(N.opoOutput(4, 1, { kappa_s_ex: 1, kappa_s: 1, kappa_p_ex: 1, kappa_p: 1 }) / 4, 1, 1e-12);
});

test("OPO threshold and output formula vs coupled-mode time integration (independent check of eq. 2.15)", () => {
  const p = { omega_p: 1 / HBAR, kappa_p: 1, kappa_p_ex: 0.5, kappa_s: 0.8, kappa_i: 0.8, kappa_s_ex: 0.6, g: 1 };
  const { P_th_W, nPump_th } = N.opoThreshold(p);
  for (const x of [2, 4, 9]) {
    const r = N.opoCMT({ ...p, P_W: x * P_th_W, t_end: 600, steps: 60000 });
    close(r.np / nPump_th, 1, 1e-6, `clamp x=${x}`);
    const want = N.opoOutput(x * P_th_W, P_th_W, { kappa_s_ex: 0.6, kappa_s: 0.8, kappa_p_ex: 0.5, kappa_p: 1 });
    close(r.Psi_W / want, 1, 1e-6, `output x=${x}`);
  }
  // below threshold the seed decays
  const below = N.opoCMT({ ...p, P_W: 0.8 * P_th_W, t_end: 400, steps: 20000 });
  assert.ok(below.ns < 1e-12);
});

test("phase-sensitive gain (eq. 2.14): 14.0 / 44.3 / 140 dB/cm at 0.1 / 1 / 10 W for 2600 %/W/cm^2", () => {
  const eta = 2.6e5;
  // tolerance = half a unit of the last printed digit
  [[0.1, 14.0, 0.05], [1, 44.3, 0.05], [10, 140, 0.5]].forEach(([P, want, tol]) => close(N.opaGainDbPerM(eta, P) / 100, want, tol, `P ${P}`));
});

test("cascaded chi(2) (eq. 2.16): RK4 arg(A_w) = +4.1378e-3 rad, closed form -4.1380e-3 rad, SH 1.3e-5 mean / 2.6e-5 peak", () => {
  const p = { eta: 2.6e5, P_W: 0.1, L_m: 0.01, dk_per_m: (2 * Math.PI) / 100e-6 };
  const r = N.cascadedRK4(p);
  close(r.argAw, 4.1378e-3, 5e-8);
  close(N.cascadedPhase(p.eta, p.P_W, p.L_m, p.dk_per_m), -4.138e-3, 5e-8);
  close(Math.abs(N.gammaCascaded(p.eta, p.dk_per_m)), 4.1, 0.05);
  close(r.shMean, 1.3e-5, 5e-7);
  close(r.shPeak, 2.6e-5, 5e-7);
  close(r.shPeak, 4 * p.eta * p.P_W / p.dk_per_m ** 2, 1e-8);
  close(r.Pw + r.P2w, p.P_W, 1e-12); // Manley-Rowe
  // odd symmetry in dk and sign: dk > 0 gives a negative (defocusing) phase
  const m = N.cascadedRK4({ ...p, dk_per_m: -p.dk_per_m });
  close(m.argAw, -r.argAw, 1e-9);
  assert.ok(r.dPhiNL < 0);
});

test("gamma_Kerr = 0.378 /(W m) at 1550 nm, A_eff 1 um^2, n2 = 9.33e-20 m^2/W (desalvo1996 row in generated data)", () => {
  const rows = JSON.parse(readFileSync(new URL("../generated/properties.json", import.meta.url), "utf8")) as { id: string; value?: number }[];
  const n2 = rows.find((r) => r.id === "nonlinear-index-n2/unspecified/desalvo1996-1064nm")?.value;
  assert.equal(n2, 9.33e-20);
  close(N.gammaKerr(n2 as number, 1.55, 1), 0.378, 5e-4);
  // ratio to the cascaded example: about 11 (manuscript)
  close(4.138 / N.gammaKerr(n2 as number, 1.55, 1), 10.9, 0.1);
});
