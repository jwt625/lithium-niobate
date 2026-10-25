// References: Qucs Technical Papers, "Coplanar waveguides", Eqs. (12.2)-(12.9) (https://qucs.sourceforge.net/tech/node86.html,
// read 2026-10-25; credits Gupta, Garg, Bahl, Bhartia, Microstrip Lines and Slotlines, 2nd ed. (1996), pp. 375 ff.):
// half-space eps_re = (eps_r + 1)/2 (12.6), Z = 30 pi K'(k)/(sqrt(eps_re) K(k)) (12.7), finite-layer eps_re (12.8)-(12.9),
// Hilberg K/K' approximations (12.4)-(12.5). K(1/sqrt 2) = Gamma(1/4)^2 / (4 sqrt(pi)) (classical lemniscatic value).
// Babinet/Booker: Z_CPW Z_CPS = eta0^2 / 4 for complementary lines in air (derived identity used by rf.ts).
// Traveling-wave response: the closed form in modulator.ts is checked against rf.ts twResponseNumeric (independent
// boundary-value + quadrature route). Chung, Chang, Adler, IEEE JQE 27, 608 (1991) was not read (closed access): no test
// here claims agreement with its equations. Matched limits per Alferness, IEEE TMTT 30, 1121 (1982) via R11 S6.
// Finite-difference cross-checks use electrostatics.ts (derived, numerical).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as R from "./rf.ts";
import { twResponse } from "./modulator.ts";
import { EPS0, C0, EPS_S_KUSHIBIKI1999 } from "./constants.ts";

const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);
const ETA0 = 1 / (EPS0 * C0);

test("elliptic K: K(0) = pi/2, K(1/sqrt2) lemniscatic value, K/K' reciprocity, Hilberg (Qucs 12.4-12.5) within 1e-5", () => {
  assert.ok(Math.abs(R.ellipticK(0) - Math.PI / 2) < 1e-15);
  assert.ok(rel(R.ellipticK(Math.SQRT1_2), 1.8540746773013719) < 1e-14);
  // small-k asymptote K(k)/K'(k) -> (pi/2)/ln(4/k), next term O(k^2)
  assert.ok(rel(R.kRatio(1e-6), Math.PI / 2 / Math.log(4e6)) < 1e-10);
  for (const k of [1e-3, 0.01, 0.2, 0.5, Math.SQRT1_2, 0.9, 0.999, 1 - 1e-9]) {
    const kp = Math.sqrt((1 - k) * (1 + k));
    assert.ok(Math.abs(R.kRatio(k) * R.kRatio(kp) - 1) < 1e-10, `k ${k}`); // limited by rounding of k' -> k
    // Hilberg's closed form itself loses precision (1 - sqrt(k')) for k < 1e-3, so it is compared only on [0.01, 0.999]
    if (k >= 0.01 && k <= 0.999) assert.ok(rel(R.kRatio(k), R.kRatioHilberg(k)) < 1e-5, `Hilberg k ${k}`);
  }
});

test("CPW in air: Z0 = (eta0/4) K'(k)/K(k), equal to the Qucs 30 pi form within the 30 pi vs eta0/4 difference (7e-4)", () => {
  for (const [S, W] of [[10e-6, 5e-6], [50e-6, 30e-6], [2e-6, 10e-6]]) {
    const r = R.coplanarLine({ kind: "cpw", S_m: S, W_m: W, layers: [] });
    const k = S / (S + 2 * W);
    assert.ok(Math.abs(r.epsEff - 1) < 1e-14);
    assert.ok(rel(r.Z0_ohm, (ETA0 / 4) / R.kRatio(k)) < 1e-12);
    assert.ok(rel(r.Z0_ohm, (30 * Math.PI) / R.kRatio(k)) < 1e-3);
    assert.ok(rel(r.Cair_F_per_m, 4 * EPS0 * R.kRatio(k)) < 1e-14);
    const q = R.quasiTEM(r.C_F_per_m, r.L_H_per_m);
    assert.ok(rel(q.nRF, 1) < 1e-12 && rel(q.Z0_ohm, r.Z0_ohm) < 1e-12);
  }
});

test("CPW half-space: eps_eff = (eps_r + 1)/2 (Qucs 12.6); uniaxial layer uses sqrt(eps_x eps_z)", () => {
  const r = R.coplanarLine({ kind: "cpw", S_m: 10e-6, W_m: 5e-6, layers: [{ thickness_m: Infinity, epsX: 10, epsZ: 10 }] });
  assert.ok(rel(r.epsEff, 5.5) < 1e-14);
  const ln = R.lnLayer("x-cut, field along z", Infinity);
  assert.equal(ln.epsX, EPS_S_KUSHIBIKI1999.eps33);
  assert.equal(ln.epsZ, EPS_S_KUSHIBIKI1999.eps11);
  const a = R.coplanarLine({ kind: "cpw", S_m: 10e-6, W_m: 5e-6, layers: [ln] });
  assert.ok(rel(a.epsEff, (1 + Math.sqrt(26.7 * 44.9)) / 2) < 1e-14);
  // n_RF of an x-cut bulk-LN CPW with eps^S: 4.220 (derived)
  assert.ok(Math.abs(a.nRF - 4.2203) < 1e-3);
  assert.ok(rel(R.lnLayer("z-cut", 1).epsZ, 26.7) < 1e-15);
});

test("CPW single finite layer on air reduces to Qucs Eqs. (12.8)-(12.9) exactly; limits h -> inf and h -> 0", () => {
  const S = 10e-6;
  const W = 5e-6;
  for (const h of [1e-6, 3e-6, 20e-6, 300e-6]) {
    const r = R.coplanarLine({ kind: "cpw", S_m: S, W_m: W, layers: [{ thickness_m: h, epsX: 10, epsZ: 10 }] });
    const k1 = S / (S + 2 * W);
    const k2 = Math.sinh((Math.PI * S) / (4 * h)) / Math.sinh((Math.PI * (S + 2 * W)) / (4 * h));
    const want = 1 + ((10 - 1) / 2) * (R.kRatio(k2) / R.kRatio(k1));
    assert.ok(rel(r.epsEff, want) < 1e-12, `h ${h}`);
  }
  const thick = R.coplanarLine({ kind: "cpw", S_m: S, W_m: W, layers: [{ thickness_m: 1, epsX: 10, epsZ: 10 }] });
  assert.ok(rel(thick.epsEff, 5.5) < 1e-9);
  const thin = R.coplanarLine({ kind: "cpw", S_m: S, W_m: W, layers: [{ thickness_m: 1e-12, epsX: 10, epsZ: 10 }] });
  assert.ok(Math.abs(thin.epsEff - 1) < 1e-3);
});

test("CPS: Babinet Z_CPW(k) Z_CPS(k) = eta0^2/4 in air; half-space eps_eff = (eps_r+1)/2; layered CPS refused", () => {
  for (const k of [0.1, 0.4, 0.8]) {
    const S = k;
    const W = (1 - k) / 2; // S/(S + 2W) = k
    const cpw = R.coplanarLine({ kind: "cpw", S_m: S, W_m: W, layers: [] });
    const cps = R.coplanarLine({ kind: "cps", S_m: S, W_m: W, layers: [] });
    assert.ok(rel(cpw.Z0_ohm * cps.Z0_ohm, ETA0 ** 2 / 4) < 1e-12);
  }
  const h = R.coplanarLine({ kind: "cps", S_m: 5e-6, W_m: 10e-6, layers: [{ thickness_m: Infinity, epsX: 10, epsZ: 10 }] });
  assert.ok(rel(h.epsEff, 5.5) < 1e-14);
  assert.throws(() => R.coplanarLine({ kind: "cps", S_m: 5e-6, W_m: 10e-6, layers: [{ thickness_m: 1e-6, epsX: 10, epsZ: 10 }] }), RangeError);
});

test("finite-difference route (coplanarLineFD) agrees with the exact half-space values (CPW and CPS, isotropic and uniaxial)", () => {
  const cases: [R.CoplanarKind, R.RFLayer][] = [
    ["cpw", { thickness_m: Infinity, epsX: 10, epsZ: 10 }],
    ["cpw", R.lnLayer("x-cut, field along z", Infinity)],
    ["cps", { thickness_m: Infinity, epsX: 10, epsZ: 10 }],
  ];
  for (const [kind, layer] of cases) {
    const inp = { kind, S_m: 10e-6, W_m: 5e-6, layers: [layer] };
    const fd = R.coplanarLineFD(inp, { hDiv: 100 });
    const ex = R.coplanarLine(inp);
    assert.ok(rel(fd.epsEff, ex.epsEff) < 1e-3, `${kind} ${fd.epsEff} vs ${ex.epsEff}`);
    assert.ok(rel(fd.Z0_ohm, ex.Z0_ohm) < 5e-4);
  }
});

test("partial-capacitance error measured against FD: 3 um eps-10 layer on air (-2.7%) and x-cut LN/SiO2/Si TFLN stack (+9%)", () => {
  const film = { kind: "cpw" as const, S_m: 10e-6, W_m: 5e-6, layers: [{ thickness_m: 3e-6, epsX: 10, epsZ: 10 }] };
  const fF = R.coplanarLineFD(film, { hDiv: 100 }).epsEff;
  const pF = R.coplanarLine(film).epsEff;
  assert.ok(Math.abs(fF - 3.345) < 0.01, `film FD ${fF}`);
  assert.ok(Math.abs(pF - 3.256) < 0.001, `film PC ${pF}`);
  const stack = {
    kind: "cpw" as const,
    S_m: 10e-6,
    W_m: 5e-6,
    layers: [R.lnLayer("x-cut, field along z", 0.6e-6), { thickness_m: 4.7e-6, ...R.SIO2_TEMPLATE }, { thickness_m: 500e-6, ...R.SI_TEMPLATE }],
  };
  const fS = R.coplanarLineFD(stack, { hDiv: 100 }).epsEff;
  const pS = R.coplanarLine(stack).epsEff;
  assert.ok(Math.abs(fS - 4.921) < 0.01, `stack FD ${fS}`);
  assert.ok(Math.abs(pS - 5.368) < 0.001, `stack PC ${pS}`);
});

test("twResponse (closed form) equals the independent boundary-value + Simpson route to 1e-8, incl. source/load mismatch", () => {
  const sets = [
    { L_m: 0.01, nRF: 2.25, ng: 2.25, alpha0_Np_per_m_sqrtGHz: 1e-3 },
    { L_m: 0.01, nRF: 2.4, ng: 2.2, alpha0_Np_per_m_sqrtGHz: 4 },
    { L_m: 0.02, nRF: 2.3, ng: 2.25, alpha0_Np_per_m_sqrtGHz: 3, alphaD_Np_per_m_GHz: 0.05, Z0: 35, Zs: 50, ZL: 50 },
    { L_m: 0.005, nRF: 2.1, ng: 2.3, alpha0_Np_per_m_sqrtGHz: 6, Z0: 45, Zs: 50, ZL: 25 },
    { L_m: 0.015, nRF: 2.2, ng: 2.2, alpha0_Np_per_m_sqrtGHz: 2, Z0: 50, Zs: 50, ZL: 1e6 },
  ];
  for (const p of sets)
    for (const f of [1e8, 5e9, 3e10, 1e11, 3e11]) {
      const a = twResponse(f, p);
      const b = R.twResponseNumeric(f, p, 20000);
      assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-8, `${JSON.stringify(p)} f ${f}: ${a} vs ${b}`);
    }
});

test("line voltage: low-frequency divider ZL/(Zs + ZL); matched source and load give no backward wave", () => {
  const p = { L_m: 0.01, nRF: 2.2, ng: 2.2, Z0: 40, Zs: 50, ZL: 30 };
  const { Vp, Vm } = R.lineAmplitudes(1, p);
  assert.ok(Math.abs(Vp[0] + Vm[0] - 30 / 80) < 1e-9);
  const m = R.lineAmplitudes(3e10, { L_m: 0.01, nRF: 2.2, ng: 2.2, Z0: 50 });
  assert.ok(Math.hypot(...m.Vm) < 1e-15 && Math.abs(m.Vp[0] - 0.5) < 1e-15);
});

test("loss limits: (1 - e^-a)/a = 1/sqrt2 at a = 0.7384 Np (6.41 dB); loss mapping reproduces alpha at fRef", () => {
  assert.ok(Math.abs(R.LOSS_3DB_ALPHA_L - 0.73838) < 1e-5);
  assert.ok(Math.abs(R.LOSS_3DB_ALPHA_L * (20 / Math.LN10) - 6.4135) < 1e-3);
  const p = R.twParamsFromLoss({ L_m: 0.01, nRF: 2.2, ng: 2.2, lossRef_dB_per_cm: 3, fRef_GHz: 67, exponent: 0.5 });
  const a67 = (p.alpha0_Np_per_m_sqrtGHz ?? 0) * Math.sqrt(67);
  assert.ok(rel(a67, (3 * 100 * Math.LN10) / 20) < 1e-14);
  assert.ok(rel(R.rfLossNpPerM(67, 3, 67, 1), a67) < 1e-14);
  // velocity-matched, matched load: 3 dB exactly where total loss = 6.41 dB
  const f3 = R.f3dBLossOnly(0.01, 3, 67, 0.5) * 1e9;
  assert.ok(Math.abs(20 * Math.log10(Math.hypot(...twResponse(f3, p))) + 10 * Math.log10(2)) < 1e-9);
});

test("matched, lossless, velocity-matched line: |H| = 1 at every f (F6.04 acceptance) by the independent route", () => {
  const p = { L_m: 0.01, nRF: 2.25, ng: 2.25 };
  for (const f of [1e8, 1e10, 1e11, 3e11]) assert.ok(Math.abs(Math.hypot(...R.twResponseNumeric(f, p, 2000)) - 1) < 1e-9);
});

test("closed-form twResponse at u+ = 0 (nRF = ng, alpha = 0): series limit gives |H| = 1 (F6.04 acceptance)", () => {
  const p = { L_m: 0.01, nRF: 2.25, ng: 2.25 };
  for (const f of [1e8, 1e10, 1e11, 3e11]) assert.ok(Math.abs(Math.hypot(...twResponse(f, p)) - 1) < 1e-9);
  // continuity across the series switch (|uL| = 1e-6)
  const q = { L_m: 0.01, nRF: 2.25, ng: 2.25 + 1e-9 };
  assert.ok(Math.abs(Math.hypot(...twResponse(1e10, q)) - 1) < 1e-9);
});
