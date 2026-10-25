// References (acceptance numbers from content/chapters/06-devices/figures.md, derived there from the formulas below):
// - Push-pull VpiL = lambda g / (2 n_e^3 r33 Gamma) (lateral-gap model; manuscript 6.1); n_e from Zelmon 1997 CLN (PHY
//   sellmeier, P-db): F6.03 2.58 / 2.75 V cm and ratio 4.18 (1.55 vs 0.45 um).
// - Linewidth nu0/Q_L and photon lifetime Q_L/(2 pi nu0): F6.07 33.9 GHz (Q_L 5700) and 10.7 GHz (18000) at 1550 nm.
// - Traveling-wave limits (Alferness, IEEE TMTT 30, 1121 (1982) via R11 S6): f_3dB L = 0.443 c/|dn|; loss-only 3 dB at
//   alpha L = 0.738 Np (6.41 dB); chen2022-c preset 88.5 / 317 GHz (manuscript 6.2, atlas row reported).
// - SHG depleted P2 = P1 tanh^2(sqrt(eta P1) L) (Armstrong et al. 1962; coupledmode.ts): F6.08 78.9% at eta L^2 = 100 /W,
//   20 mW.
// - Triply resonant OPO steady state: closed form derived in devices.ts, checked here by RK4 integration of the same
//   coupled-mode equations; efficiency maximum (kappa_s,ex kappa_p,ex)/(kappa_s kappa_p) at 4 P_th (C02 F2-10 acceptance).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as D from "./devices.ts";
import { defaultModel, refractiveIndex } from "./sellmeier.ts";
import { allPass, loadedQ, eoCombThrough } from "./ring.ts";
import { f3dBVelocityMismatch, prbs } from "./modulator.ts";
import { shgDepleted } from "./coupledmode.ts";
import { f3dBLossOnly, twParamsFromLoss, LOSS_3DB_ALPHA_L } from "./rf.ts";
import { C0, HBAR } from "./constants.ts";

const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);
const ne = (lam: number) => refractiveIndex(defaultModel("CLN", "e"), lam);

test("F6.03: VpiL 2.58 (r33 30.8) and 2.75 (28.8) V cm at 1.55 um, g 5 um, Gamma 0.5; ratio 1.55/0.45 um = 4.18", () => {
  assert.ok(Math.abs(ne(1.55) - 2.1376) < 5e-5 && Math.abs(ne(0.6328) - 2.2022) < 5e-5);
  const v1 = D.vpiLPushPullVcm({ lam_um: 1.55, gap_um: 5, n: ne(1.55), r_pm_per_V: 30.8, Gamma: 0.5 });
  const v2 = D.vpiLPushPullVcm({ lam_um: 1.55, gap_um: 5, n: ne(1.55), r_pm_per_V: 28.8, Gamma: 0.5 });
  const v3 = D.vpiLPushPullVcm({ lam_um: 0.45, gap_um: 5, n: ne(0.45), r_pm_per_V: 30.8, Gamma: 0.5 });
  assert.ok(Math.abs(v1 - 2.58) < 0.01 && Math.abs(v2 - 2.75) < 0.01);
  assert.ok(Math.abs(v1 / v3 - 4.18) < 0.005);
  const G = D.impliedOverlap({ lam_um: 1.55, gap_um: 5, n: ne(1.55), r_pm_per_V: 30.8, vpiL_Vcm: v1 });
  assert.ok(rel(G, 0.5) < 1e-12);
  assert.ok(rel(D.impliedOverlap({ lam_um: 1.55, gap_um: 5, n: ne(1.55), r_pm_per_V: 30.8, vpiL_Vcm: 2 * v1, pushPull: false }), 0.5) < 1e-12);
});

test("F6.07: linewidth 33.9 / 10.7 GHz; ringFromQ critical gives r = a, T = 0 on resonance and loadedQ = Q_L", () => {
  assert.ok(Math.abs(D.linewidthGHz(1550, 5700) - 33.9) < 0.05);
  assert.ok(Math.abs(D.linewidthGHz(1550, 18000) - 10.7) < 0.05);
  assert.ok(rel(D.photonLifetimePs(1550, 1e4), (1e4 / (2 * Math.PI * (C0 / 1550e-9))) * 1e12) < 1e-14);
  const c = D.ringFromQ({ lambda_nm: 1550, ng: 2.3, R_um: 50, QL: 1e4, regime: "critical" });
  assert.equal(c.r, c.a);
  assert.ok(allPass(0, c.r, c.a) < 1e-20);
  assert.ok(rel(loadedQ(1.55, 2.3, c.L_um, c.r, c.a), 1e4) < 1e-10);
  for (const [regime, q] of [["under", 0.5], ["over", 3]] as const) {
    const u = D.ringFromQ({ lambda_nm: 1550, ng: 2.3, R_um: 50, QL: 2e4, regime, qRatio: q });
    assert.ok(rel(u.Qi / u.Qc, q) < 1e-9);
    assert.ok(rel(loadedQ(1.55, 2.3, u.L_um, u.r, u.a), 2e4) < 1e-10);
    assert.ok(allPass(0, u.r, u.a) > 0.01);
  }
  assert.equal(D.resonanceShiftPm(7, -2), -14);
});

test("F6.04: velocity-only 3 dB at 0.443 c/(L |dn|), loss-only at 0.738 Np (6.41 dB), chen2022-c 88.5 / 317 GHz", () => {
  const p = { L_m: 0.01, nRF: 2.4, ng: 2.25 };
  const f = Array.from({ length: 4001 }, (_, i) => i * 1e8);
  const half = 10 * Math.log10(2); // 1/sqrt(2) amplitude; s21Curve default -3.000 dB differs by 0.0103 dB
  const fc = D.s21Curve(f, p, half).fCross_Hz ?? NaN;
  const fv = (0.443 * C0) / (0.01 * 0.15);
  assert.ok(rel(fc, fv) < 5e-3, `${fc} vs ${fv}`);
  assert.ok(rel(f3dBVelocityMismatch(0.01, 0.15), fv) < 5e-3);
  const q = twParamsFromLoss({ L_m: 0.01, nRF: 2.25, ng: 2.25, lossRef_dB_per_cm: 3, fRef_GHz: 67, exponent: 0.5 });
  const fl = D.s21Curve(f, q, half).fCross_Hz ?? NaN;
  assert.ok(rel(fl / 1e9, f3dBLossOnly(0.01, 3, 67, 0.5)) < 5e-3);
  assert.ok(Math.abs(LOSS_3DB_ALPHA_L - 0.738) < 5e-4 && Math.abs(LOSS_3DB_ALPHA_L * 8.685889638 - 6.41) < 5e-3);
  const P = D.PRESET_CHEN2022C;
  assert.ok(Math.abs(f3dBVelocityMismatch(P.L_m, P.nRF - P.ng) / 1e9 - 88.5) < 0.1);
  assert.ok(Math.abs(f3dBLossOnly(P.L_m, P.lossRef_dB_per_cm, P.fRef_GHz, P.exponent) - 317) < 0.5);
  // no crossing on a short grid returns null
  assert.equal(D.s21Curve([0, 1e9, 2e9], p).fCross_Hz, null);
});

test("F6.08: depleted SHG conversion 78.9% at eta L^2 = 100 /W, 20 mW; agrees with undepleted below 1% conversion", () => {
  assert.ok(Math.abs(shgDepleted(100, 0.02, 1) / 0.02 - 0.789) < 1e-3);
  const P = 1e-5;
  assert.ok(rel(shgDepleted(100, P, 1), 100 * P * P) < 1e-2);
});

test("F6.09: triply resonant OPO closed form vs RK4 of the coupled-mode equations; efficiency maximum at 4 P_th; Q scaling", () => {
  const k = { kappa_p: 1, kappa_p_ex: 0.6, kappa_s: 1.2, kappa_s_ex: 0.5, kappa_i: 0.8, g: 2e-3 };
  const lam = 0.775;
  const wp = (2 * Math.PI * C0) / (lam * 1e-6);
  const th = D.opoTriplyResonant({ lam_p_um: lam, ...k, Pin_W: 1e-30 });
  assert.equal(th.Psig_W, 0);
  const x = 1.7;
  const res = D.opoTriplyResonant({ lam_p_um: lam, ...k, Pin_W: x * x * th.Pth_W });
  // RK4 in dimensionless time (rates as given), drive amplitude s from P_in
  const s = Math.sqrt((x * x * th.Pth_W) / (HBAR * wp));
  let ap: [number, number] = [0, 0];
  let as: [number, number] = [1, 0];
  let ai: [number, number] = [1, 0];
  const rhs = (p: number[]) => {
    const [pr, pi, sr, si, ir, ii] = p;
    // a_s a_i
    const sir = sr * ir - si * ii;
    const sii = sr * ii + si * ir;
    // a_p conj(a_i), a_p conj(a_s)
    const pir = pr * ir + pi * ii;
    const pii = pi * ir - pr * ii;
    const psr = pr * sr + pi * si;
    const psi = pi * sr - pr * si;
    // -i g z = g (Im z, -Re z)
    return [
      -0.5 * k.kappa_p * pr + k.g * sii + Math.sqrt(k.kappa_p_ex) * s,
      -0.5 * k.kappa_p * pi - k.g * sir,
      -0.5 * k.kappa_s * sr + k.g * pii,
      -0.5 * k.kappa_s * si - k.g * pir,
      -0.5 * k.kappa_i * ir + k.g * psi,
      -0.5 * k.kappa_i * ii - k.g * psr,
    ];
  };
  let y = [ap[0], ap[1], as[0], as[1], ai[0], ai[1]];
  const dt = 0.02;
  for (let n = 0; n < 60000; n++) {
    const k1 = rhs(y);
    const k2 = rhs(y.map((v, i) => v + 0.5 * dt * k1[i]));
    const k3 = rhs(y.map((v, i) => v + 0.5 * dt * k2[i]));
    const k4 = rhs(y.map((v, i) => v + dt * k3[i]));
    y = y.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
  }
  ap = [y[0], y[1]];
  as = [y[2], y[3]];
  ai = [y[4], y[5]];
  assert.ok(rel(ap[0] ** 2 + ap[1] ** 2, res.nPump) < 1e-6);
  assert.ok(rel(as[0] ** 2 + as[1] ** 2, res.nSignal) < 1e-6);
  assert.ok(rel(k.kappa_i * (ai[0] ** 2 + ai[1] ** 2), k.kappa_s * res.nSignal) < 1e-6);
  // efficiency maximum at P = 4 P_th
  const eta = (r: number) => D.opoTriplyResonant({ lam_p_um: lam, ...k, Pin_W: r * th.Pth_W }).etaPhotonSignal;
  const emax = (k.kappa_s_ex * k.kappa_p_ex) / (k.kappa_s * k.kappa_p);
  assert.ok(rel(eta(4), emax) < 1e-12);
  assert.ok(eta(3.9) < eta(4) && eta(4.1) < eta(4));
  // Q scaling at critical coupling (kappa_ex = kappa/2), equal Q: triply resonant P_th ~ Q^-3, doubly resonant ~ Q^-2
  const Pth = (Q: number) => {
    const kk = D.kappaFromQ(1.55, Q);
    return D.opoTriplyResonant({ lam_p_um: lam, kappa_p: kk, kappa_p_ex: kk / 2, kappa_s: kk, kappa_s_ex: kk / 2, kappa_i: kk, g: 1e3, Pin_W: 0 }).Pth_W;
  };
  assert.ok(rel(Pth(1e5) / Pth(1e6), 1e3) < 1e-9);
  const d = (Q: number) => D.opoThresholdDRO(D.kappaFromQ(1.55, Q), D.kappaFromQ(1.55, Q), 1);
  assert.ok(rel(d(1e5) / d(1e6), 1e2) < 1e-9);
});

test("F6.02: PAM4 eye has 3 open eyes without filtering; a narrow drive filter closes them; f3dB -> large equals unfiltered", () => {
  const sym = D.symbolsFromBits(prbs(9, 2 * 511 * 2), 4);
  const base = { symbols: sym, M: 4, baud: 100e9, samplesPerSymbol: 16, Vpp: 2, Vpi: 2 };
  const ideal = D.eyeDiagramPAM(base);
  const o0 = D.eyeOpeningsPAM(ideal.T, sym, 4, 16, 8);
  assert.equal(o0.length, 3);
  for (const v of o0) assert.ok(v > 0.2, `${o0}`);
  const wide = D.eyeOpeningsPAM(D.eyeDiagramPAM({ ...base, f3dB_Hz: 1e17 }).T, sym, 4, 16, 8);
  for (let i = 0; i < 3; i++) assert.ok(Math.abs(wide[i] - o0[i]) < 1e-6);
  const narrow = D.eyeOpeningsPAM(D.eyeDiagramPAM({ ...base, f3dB_Hz: 10e9 }).T, sym, 4, 16, 8);
  for (const v of narrow) assert.ok(v < 0, `${narrow}`);
  const h = D.eyeDiagramPAM({ ...base, f3dB_Hz: 60e9, filter: "gaussian" }).hist;
  assert.equal(h.reduce((a, b) => a + b, 0), sym.length * 16);
});

test("F6.10 / F6.12 helpers: beta = 0 gives one comb line, line count grows with beta; span and IDT period", () => {
  const n = (beta: number) => D.combLinesAbove(eoCombThrough({ r: 0.99, a: 0.995, beta, K: 200 }).P, -60);
  assert.equal(n(0), 1);
  assert.ok(n(0.05) < n(0.2) && n(0.2) < n(0.8));
  const span = D.combSpanNm(-100, 100, 10e9, 1550);
  assert.ok(Math.abs(span - (C0 / (C0 / 1550e-9 - 1e12) - C0 / (C0 / 1550e-9 + 1e12)) * 1e9) < 1e-9);
  assert.equal(D.idtPeriod(3978.4, 1e9), 3978.4e-9);
});
