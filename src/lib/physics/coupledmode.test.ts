// References: Armstrong et al. 1962 and Boyd 2008 ch. 2 (undepleted sinc^2, depleted tanh^2 at dk = 0, OPA gain
// 1 + (Gamma/g)^2 sinh^2(gL), cosh^2 at dk = 0, Manley-Rowe); R11 C1 (RK4 vs tanh^2 to 1e-8); Yariv 1989 (OPO threshold,
// checked here against the round-trip eigenvalue of the single-pass gain matrix, an independent numerical construction).
import { test } from "node:test";
import assert from "node:assert/strict";
import * as CM from "./coupledmode.ts";

const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

test("RK4 depleted SHG at dk = 0 matches P0 tanh^2(sqrt(eta P0) L) to 1e-8 (R11 C1)", () => {
  const eta = 1e4; // 1/(W m^2)
  const P0 = 1;
  const L = 0.01;
  const r = CM.shgRK4({ eta, P0_W: P0, L_m: L, steps: 1000 });
  const want = CM.shgDepleted(eta, P0, L);
  assert.ok(Math.abs(r.P2[1000] - want) < 1e-8 * P0, `${r.P2[1000]} vs ${want}`);
  // power conserved without loss
  for (let i = 0; i <= 1000; i += 100) assert.ok(Math.abs(r.P1[i] + r.P2[i] - P0) < 1e-12);
});

test("RK4 with detuning matches undepleted sinc^2 at low conversion", () => {
  const eta = 1e4, P0 = 1e-8, L = 0.01; // conversion 1e-8: depletion correction ~ 7e-9 relative
  for (const dk of [0, 300, 628.3, 1500]) {
    const r = CM.shgRK4({ eta, P0_W: P0, L_m: L, dk_per_m: dk, steps: 2000 });
    const want = CM.shgUndepleted(eta, P0, L, dk);
    if (want > 1e-14) assert.ok(rel(r.P2[2000], want) < 1e-5, `dk ${dk}: ${r.P2[2000]} vs ${want}`);
  }
  // first zero of sinc^2 at dk L = 2 pi
  const z = CM.shgRK4({ eta, P0_W: P0, L_m: L, dk_per_m: (2 * Math.PI) / L, steps: 2000 });
  assert.ok(z.P2[2000] < 1e-6 * CM.shgUndepleted(eta, P0, L));
});

test("loss: undepleted SH with fundamental loss only scales as the analytic integral", () => {
  // dk = 0, alpha2 = 0: A2(L) = -i k A1(0)^2 int_0^L exp(-alpha1 z) dz -> P2 = eta P0^2 ((1 - e^{-a L})/a)^2
  const eta = 1e4, P0 = 1e-9, L = 0.02, a = 20;
  const r = CM.shgRK4({ eta, P0_W: P0, L_m: L, alpha1_per_m: a, steps: 2000 });
  const want = eta * P0 * P0 * ((1 - Math.exp(-a * L)) / a) ** 2;
  assert.ok(rel(r.P2[2000], want) < 1e-5);
});

test("normalized efficiency: eta scales as d^2 / (lambda^2 A) and converts to %/(W cm^2)", () => {
  const base = { deff_pm_per_V: 14, n1: 2.14, n2: 2.18, lam1_um: 1.55, Aeff_um2: 1 };
  const e0 = CM.etaNormSHG(base);
  assert.ok(rel(CM.etaNormSHG({ ...base, deff_pm_per_V: 28 }), 4 * e0) < 1e-14);
  assert.ok(rel(CM.etaNormSHG({ ...base, Aeff_um2: 2 }), e0 / 2) < 1e-14);
  assert.ok(rel(CM.etaNormSHG({ ...base, lam1_um: 3.1 }), e0 / 4) < 1e-14);
  // explicit arithmetic of 8 pi^2 d^2 / (eps0 c n1^2 n2 lambda^2 A)
  const hand = (8 * Math.PI ** 2 * (14e-12) ** 2) / (8.8541878128e-12 * 299792458 * 2.14 ** 2 * 2.18 * (1.55e-6) ** 2 * 1e-12);
  assert.ok(rel(e0, hand) < 1e-14);
  assert.ok(rel(CM.etaToPercentPerWcm2(e0), e0 * 1e-2) < 1e-14);
});

test("three-wave RK4: Manley-Rowe invariants and undepleted-pump OPA gain cosh^2 / general dk formula", () => {
  const g = CM.gFromEtaSFG(1e3, 1.55, 3.39);
  const l3 = 1 / (1 / 1.55 + 1 / 3.39);
  const P3 = 5;
  const L = 0.02;
  const Gam = CM.opaGamma(g, P3, l3);
  for (const dk of [0, 0.5 * Gam, 3 * Gam]) {
    const r = CM.threeWaveRK4({ g, l1_um: 1.55, l2_um: 3.39, P1_W: 1e-9, P2_W: 0, P3_W: P3, L_m: L, dk_per_m: dk, steps: 4000 });
    const G = r.P1[4000] / 1e-9;
    assert.ok(rel(G, CM.opaGain(Gam, L, dk)) < 1e-6, `dk ${dk}: ${G} vs ${CM.opaGain(Gam, L, dk)}`);
  }
  assert.ok(rel(CM.opaGain(Gam, L), Math.cosh(Gam * L) ** 2) < 1e-14);
  // strong conversion: photon-number invariants N1 + N3 and N2 + N3
  const r = CM.threeWaveRK4({ g, l1_um: 1.55, l2_um: 3.39, P1_W: 0.5, P2_W: 0.3, P3_W: 0, L_m: 0.05, steps: 4000 });
  const hw = (l: number) => (6.62607015e-34 * 299792458) / (l * 1e-6);
  const N = (i: number) => [r.P1[i] / hw(1.55), r.P2[i] / hw(3.39), r.P3[i] / hw(l3)];
  const [a0, b0, c0] = N(0);
  const [a1, b1, c1] = N(4000);
  assert.ok(c1 > 0.01 * a0, "substantial conversion");
  assert.ok(rel(a1 + c1, a0 + c0) < 1e-9 && rel(b1 + c1, b0 + c0) < 1e-9);
});

test("SFG normalization: undepleted P3 = eta_SFG P1 P2 L^2 from g = gFromEtaSFG", () => {
  const eta = 2e3;
  const g = CM.gFromEtaSFG(eta, 1.55, 1.064);
  const r = CM.threeWaveRK4({ g, l1_um: 1.55, l2_um: 1.064, P1_W: 1e-7, P2_W: 2e-7, P3_W: 0, L_m: 0.01, steps: 2000 });
  assert.ok(rel(r.P3[2000], eta * 1e-7 * 2e-7 * 1e-4) < 1e-6);
});

test("degenerate OPA: the SHG equations with a strong SH pump give exp(2 sqrt(eta P) L) quadrature gain", () => {
  const eta = 1e4, Pp = 1, L = 0.01; // 2 sqrt(eta P) L = 2
  const g = CM.degenerateOpaGains(eta, Pp, L);
  const amp = CM.shgRK4({ eta, P0_W: 1e-12, L_m: L, P2_0_W: Pp, phase2_0: Math.PI / 2, steps: 4000 });
  const de = CM.shgRK4({ eta, P0_W: 1e-12, L_m: L, P2_0_W: Pp, phase2_0: -Math.PI / 2, steps: 4000 });
  assert.ok(rel(amp.P1[4000] / 1e-12, g.amplified) < 1e-6, `${amp.P1[4000] / 1e-12} vs ${g.amplified}`);
  assert.ok(rel(de.P1[4000] / 1e-12, g.deamplified) < 1e-6);
});

test("OPO threshold: round-trip map has unit eigenvalue at the DRO/SRO threshold (Yariv form)", () => {
  const unitEig = (rs: number, ri: number, GL: number) => {
    const Cc = Math.cosh(GL), Ss = Math.sinh(GL);
    // M = diag(rs, ri) [[C, -iS], [iS, C]] acting on (a_s, a_i*); det(M - 1) = 0 at threshold
    // det = (rs C - 1)(ri C - 1) - (rs)(ri)(-i S)(i S) = (rs C - 1)(ri C - 1) - rs ri S^2
    return (rs * Cc - 1) * (ri * Cc - 1) - rs * ri * Ss * Ss;
  };
  for (const [Rs, Ri] of [[0.98, 0.97], [0.9, 0.5], [0.999, 0.99]]) {
    const GL = CM.opoThresholdGammaL_DRO(Rs, Ri);
    assert.ok(Math.abs(unitEig(Math.sqrt(Rs), Math.sqrt(Ri), GL)) < 1e-12);
    assert.ok(Math.abs(unitEig(Math.sqrt(Rs), Math.sqrt(Ri), GL * 0.99)) > 1e-8, "not at threshold below");
  }
  // SRO = DRO limit Ri -> 0; cosh^2 = 1/Rs
  assert.ok(Math.abs(CM.opoThresholdGammaL_DRO(0.95, 1e-20) - CM.opoThresholdGammaL_SRO(0.95)) < 1e-9);
  assert.ok(Math.abs(Math.cosh(CM.opoThresholdGammaL_SRO(0.95)) ** 2 - 1 / 0.95) < 1e-12);
  // small-loss limits: DRO (Gamma L)^2 ~ eps_s eps_i (field losses), SRO (Gamma L)^2 ~ 1 - Rs
  const es = 1e-3, ei = 2e-3;
  const GLd = CM.opoThresholdGammaL_DRO((1 - es) ** 2, (1 - ei) ** 2);
  assert.ok(rel(GLd * GLd, es * ei) < 5e-3);
  const GLs = CM.opoThresholdGammaL_SRO(1 - 2e-3);
  assert.ok(rel(GLs * GLs, 2e-3) < 5e-3);
  // SRO threshold / DRO threshold ~ 4 / (idler power loss) in the small-loss limit
  assert.ok(rel(CM.opoThresholdPower(GLd, 0.01, 1) * 4 / (2 * ei), CM.opoThresholdPower(CM.opoThresholdGammaL_SRO((1 - es) ** 2), 0.01, 1)) < 1e-2);
});
