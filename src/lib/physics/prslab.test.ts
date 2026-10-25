// References: volk2008 Eqs. 3.5, 3.6, 3.9, 3.18-3.19 (pp. 52-57) and the derived table of content/chapters/04-quirks/
// manuscript.md sec. 4.1 (dark tau 2.48e5 s at sigma_d = 1e-15 S/m, eps 28; diffusion-field amplitude 1.597e5 V/m per unit m
// at Lambda = 1 um, 295 K; Delta n_e 1.7e-4 at 1e6 V/m with n_e 2.2028, r33^T 32.2 pm/V, weis1985); bryan1984 (MgO x100
// photoconductivity, kG unchanged); schwesyg2011 Table 2.1 band centers; 1 eV = 8065.54 cm^-1 (SI 2019 h, c, e).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as P from "./prslab.ts";

const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

test("dielectric relaxation: dark tau 2.48e5 s at sigma_d 1e-15 S/m, eps 28; lit range 0.25-2.5 s", () => {
  assert.ok(Math.abs(P.dielectricRelaxationTime(28, 1e-15) - 2.48e5) < 0.005e5);
  assert.ok(Math.abs(P.dielectricRelaxationTime(28, 0, 1e-9) - 0.248) < 0.001);
  assert.ok(Math.abs(P.dielectricRelaxationTime(28, 0, 1e-10) - 2.48) < 0.01);
  // 6.9 h and 29 d bounds of the manuscript table
  assert.ok(Math.abs(P.dielectricRelaxationTime(28, 1e-14) / 3600 - 6.9) < 0.05);
  assert.ok(Math.abs(P.dielectricRelaxationTime(28, 1e-16) / 86400 - 28.7) < 0.1);
});

test("write/erase: E(0) = 0, E(20 tau) = -E_sat within 1e-8, erase is a single exponential", () => {
  const Es = 1.23e6, tau = 2.48;
  assert.equal(P.scFieldWrite(0, Es, tau), -0);
  assert.ok(rel(P.scFieldWrite(20 * tau, Es, tau), -Es) < 1e-8);
  const E0 = -1e6;
  for (const t of [0.1, 1, 10, 30]) {
    const slope = (Math.log(Math.abs(P.scFieldErase(t + 1e-3, E0, tau))) - Math.log(Math.abs(P.scFieldErase(t, E0, tau)))) / 1e-3;
    assert.ok(Math.abs(slope + 1 / tau) < 1e-9 / tau + 1e-9);
  }
});

test("MgO preset (kappa x 100, same kG) cuts E_sat by 100x when sigma_ph >> sigma_d", () => {
  const fe = P.SLAB_PRESETS.find((p) => p.id === "cln")!;
  const mg = P.SLAB_PRESETS.find((p) => p.id === "mgo5")!;
  const I = 1e8; // 1e4 W/cm^2
  const a = P.slabState(fe, I, 1e-16);
  const b = P.slabState(mg, I, 1e-16);
  assert.ok(a.sigmaPh / 1e-16 > 1e6);
  // ratio = 100 - 99 sigma_d/(sigma_ph + sigma_d) -> 100 from below
  assert.ok(a.Esat / b.Esat > 100 * (1 - 1e-5));
  assert.equal(a.tauDark, b.tauDark);
});

test("Fe preset saturates inside the P-comp 1e6-1e7 V/m band; Delta n_e 1.7e-4 at 1e6 V/m (weis1985 inputs)", () => {
  const fe = P.SLAB_PRESETS.find((p) => p.id === "fe")!;
  const s = P.slabState(fe, 1e7, 1e-15);
  assert.ok(s.Esat > 1e6 && s.Esat < 1e7);
  const dn = P.pockelsDeltaN(P.SLAB_MATERIAL.ne633.value, P.SLAB_MATERIAL.r33T_m_per_V.value, 1e6);
  assert.ok(Math.abs(dn + 1.72e-4) < 0.01e-4);
});

test("diffusion field: 1.597e5 V/m per unit m at Lambda 1 um, 295 K (0.5 %); Eq. 3.9 small-m limit", () => {
  const A = P.diffusionFieldAmplitude(1e-6, 295, 1);
  assert.ok(rel(A, 1.597e5) < 0.005);
  const m = 1e-4;
  assert.ok(rel(P.diffusionField(0.25e-6, 1e-6, 295, m), P.diffusionFieldAmplitude(1e-6, 295, m)) < 1e-9);
});

test("grating1D: m -> 0 gives no modulation; kG = 0 gives Eq. 3.9 and a 90 deg phase; diffusion off gives 0 deg", () => {
  const base = { Lambda_m: 1e-6, I0_W_m2: 1e7, kG_m_per_V: 2.8e-11, alpha_per_m: 1000, kappa_S_m_per_W: 1e-14, sigmaDark_S_m: 1e-16, epsR: 28, T_K: 295 };
  const z0 = P.grating1D({ ...base, m: 0 });
  assert.ok(z0.E.every((x) => Math.abs(x) < 1e-6));
  const d = P.grating1D({ ...base, m: 0.3, kG_m_per_V: 0 });
  assert.ok(Math.abs(d.phase_deg - 90) < 0.5);
  // sigma_d << sigma_ph: steady field equals the closed form (relative to its amplitude)
  const A = P.diffusionFieldAmplitude(1e-6, 295, 1);
  let err = 0;
  for (let i = 0; i < d.z.length; i++) err = Math.max(err, Math.abs(d.E[i] - P.diffusionField(d.z[i], 1e-6, 295, 0.3)));
  assert.ok(err / A < 1e-6);
  const pv = P.grating1D({ ...base, m: 0.3, diffusion: false });
  assert.ok(Math.abs(pv.phase_deg) < 0.5);
});

test("grating1D time stepping converges to the closed-form steady state; rho integrates to zero", () => {
  const o = { Lambda_m: 2e-6, m: 0.5, I0_W_m2: 1e7, kG_m_per_V: 2.8e-11, alpha_per_m: 1000, kappa_S_m_per_W: 1e-14, sigmaDark_S_m: 1e-16, epsR: 28, T_K: 295 };
  const ss = P.grating1D(o);
  const tau = P.dielectricRelaxationTime(28, 1e-16, 1e-14 * 1e7 * 0.5);
  const tr = P.grating1D({ ...o, dt_s: tau / 4, steps: 400 });
  let err = 0, mx = 0;
  for (let i = 0; i < ss.E.length; i++) {
    err = Math.max(err, Math.abs(tr.E[i] - ss.E[i]));
    mx = Math.max(mx, Math.abs(ss.E[i]));
  }
  assert.ok(err / mx < 1e-9);
  const q = tr.rho.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(q) / tr.rho.reduce((a, b) => a + Math.abs(b), 0) < 1e-12);
  // mean E = 0 (short circuit) at every time
  const early = P.grating1D({ ...o, dt_s: tau / 4, steps: 3 });
  assert.ok(Math.abs(early.E.reduce((a, b) => a + b, 0) / early.E.length) < 1e-9 * mx);
});

test("polaron bands: centers convert with 1 eV = 8065.54 cm^-1; Gaussian peak 1, half max at HWHM", () => {
  assert.ok(Math.abs(P.EV_TO_CM1 - 8065.54) < 0.01);
  const b = P.POLARON_BANDS[0];
  assert.ok(Math.abs(b.center_cm1 / P.EV_TO_CM1 - 1.6) < 0.001);
  assert.equal(P.polaronBandShape(b, b.center_cm1 / P.EV_TO_CM1), 1);
  assert.ok(Math.abs(P.polaronBandShape(b, (b.center_cm1 + b.hwhm_cm1!) / P.EV_TO_CM1) - 0.5) < 1e-12);
  assert.ok(Number.isNaN(P.polaronBandShape(P.POLARON_BANDS[3], 2.5)));
});

test("GRIIRA toy: MgO at threshold gives N_max = 0 and SHG_rel = 1; steady state equals t -> infinity", () => {
  const base = { Ig_W_m2: 2.5e7, gen: 1e17, tauPol_s: 1e-3, sigmaAbs_m2: 1e-22, Nmax_m3: 1e24, Pir_W: 10, Gth_W_per_K: 0.1, dDkdT_per_m_K: 100, L_m: 0.01 };
  for (const c of ["CLN", "NSLN"] as const) {
    const s = P.griiraNmaxScale(P.GRIIRA_MG_THRESHOLD[c].value, c);
    assert.equal(s, 0);
    const r = P.griiraToy({ ...base, Nmax_m3: base.Nmax_m3 * s });
    assert.equal(r.Npol, 0);
    assert.equal(r.shgRel, 1);
  }
  const ss = P.griiraToy(base);
  const late = P.griiraToy({ ...base, t_s: 1 });
  assert.ok(rel(late.Npol, ss.Npol) < 1e-12);
  assert.ok(ss.Npol < base.Nmax_m3 && ss.shgRel < 1);
  // analytic steady state
  const G = base.gen * base.Ig_W_m2;
  assert.ok(rel(ss.Npol, (G * base.tauPol_s * base.Nmax_m3) / (base.Nmax_m3 + G * base.tauPol_s)) < 1e-12);
});
