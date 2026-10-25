// References: Alferness 1982 traveling-wave limits as listed in R11 S6: pure velocity mismatch |H| = |sin u / u|,
// u = pi f L |nRF - ng| / c, f_3dB,el = 1.39 c / (pi L |dn|); pure RF loss |H| = (1 - e^{-aL})/(aL); H(0) = 1;
// reflection-free case Zs = ZL = Z0. ITU-T O.150 PRBS: period 2^n - 1 with 2^(n-1) ones per period.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as M from "./modulator.ts";

const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);
const c = 299792458;

test("H(0) = 1; pure velocity mismatch gives |sin u / u|", () => {
  const p = { L_m: 0.01, nRF: 2.4, ng: 2.25 };
  assert.deepEqual(M.twResponse(0, p), [1, 0]);
  for (const f of [1e9, 2e10, 6e10, 1.5e11]) {
    const u = (Math.PI * f * p.L_m * Math.abs(p.nRF - p.ng)) / c;
    assert.ok(Math.abs(M.twResponseMag(f, p) - Math.abs(Math.sin(u) / u)) < 1e-12, `f ${f}`);
  }
  const f3 = M.f3dBVelocityMismatch(p.L_m, p.nRF - p.ng);
  assert.ok(Math.abs(M.s21EOdB(f3, p) + 10 * Math.log10(2)) < 1e-9);
  assert.ok(rel(M.bandwidth(p, 10 * Math.log10(2)), f3) < 1e-6);
});

test("pure RF loss (velocity matched) gives (1 - e^{-aL})/(aL)", () => {
  const p = { L_m: 0.02, nRF: 2.2, ng: 2.2, alpha0_Np_per_m_sqrtGHz: 5 };
  for (const f of [1e9, 1e10, 1e11]) {
    const a = 5 * Math.sqrt(f / 1e9);
    const want = (1 - Math.exp(-a * p.L_m)) / (a * p.L_m);
    assert.ok(Math.abs(M.twResponseMag(f, p) - want) < 1e-12);
  }
});

test("impedance mismatch: low-frequency limit returns to 1; matched source and load leave the matched formula", () => {
  const p = { L_m: 0.01, nRF: 2.3, ng: 2.25, alpha0_Np_per_m_sqrtGHz: 3, Z0: 35, Zs: 50, ZL: 50 };
  assert.ok(Math.abs(M.twResponseMag(1e3, p) - 1) < 1e-4);
  const q = { ...p, Zs: 35, ZL: 35 };
  const r = { L_m: 0.01, nRF: 2.3, ng: 2.25, alpha0_Np_per_m_sqrtGHz: 3 };
  assert.ok(Math.abs(M.twResponseMag(3e10, q) - M.twResponseMag(3e10, r)) < 1e-14);
  // mismatch changes the response at high frequency
  assert.ok(Math.abs(M.twResponseMag(3e10, p) - M.twResponseMag(3e10, q)) > 1e-3);
});

test("MZM closed form: push-pull halves VpiL; transmission nulls and peaks", () => {
  const ph = M.vpiLPhase({ lam_um: 1.55, gap_um: 5, n: 2.1376, r_pm_per_V: 30.8, Gamma: 0.5 });
  const hand = (1.55e-6 * 5e-6) / (2.1376 ** 3 * 30.8e-12 * 0.5);
  assert.ok(rel(ph, hand) < 1e-14);
  assert.equal(M.vpiLMZM(ph, true), ph / 2);
  assert.equal(M.vpiLMZM(ph, false), ph);
  assert.ok(Math.abs(M.vpiFromVpiL(2.2, 0.9) - 2.2 / 0.9) < 1e-15);
  assert.ok(Math.abs(M.mzmTransmission(0, 3)) - 1 < 1e-15);
  assert.ok(M.mzmTransmission(3, 3) < 1e-30);
  assert.ok(Math.abs(M.mzmTransmission(0, 3, -Math.PI / 2) - 0.5) < 1e-15);
});

test("PRBS (ITU-T O.150): period 2^n - 1 and balance for n = 7, 9, 11, 15", () => {
  for (const n of [7, 9, 11, 15]) {
    const P = 2 ** n - 1;
    const s = M.prbs(n, 2 * P);
    for (let i = 0; i < P; i++) assert.equal(s[i], s[i + P]);
    let ones = 0;
    for (let i = 0; i < P; i++) ones += s[i];
    assert.equal(ones, 2 ** (n - 1));
    // no shorter period dividing P (P prime for 7; check P/q for small factors)
    for (const q of [3, 7, 31, 73, 23, 89, 151]) {
      if (P % q !== 0 || q === P) continue;
      const per = P / q;
      let same = true;
      for (let i = 0; i < P - per; i++) if (s[i] !== s[i + per]) { same = false; break; }
      assert.ok(!same, `n ${n} has period ${per}`);
    }
  }
  assert.equal(M.prbs(31, 100).length, 100);
  assert.throws(() => M.prbs(8, 10), RangeError);
});

test("eye diagram: deterministic per seed; ideal eye opening equals the static transfer; bandwidth closes the eye", () => {
  const bits = M.prbs(9, 512);
  const base = { bits, baud: 50e9, samplesPerBit: 16, Vpp: 2, Vpi: 3 };
  const ideal = M.eyeDiagram(base);
  const want = M.mzmTransmission(1, 3, -Math.PI / 2) - M.mzmTransmission(-1, 3, -Math.PI / 2);
  assert.ok(Math.abs(M.eyeOpening(ideal.T, bits, 16, 8) - want) < 1e-9);
  const a = M.eyeDiagram({ ...base, noiseStd: 0.02, seed: 5, driverBW_Hz: 40e9 });
  const b = M.eyeDiagram({ ...base, noiseStd: 0.02, seed: 5, driverBW_Hz: 40e9 });
  assert.deepEqual(a.hist, b.hist);
  const slow = M.eyeDiagram({ ...base, tw: { L_m: 0.02, nRF: 2.6, ng: 2.25, alpha0_Np_per_m_sqrtGHz: 5 } });
  const fast = M.eyeDiagram({ ...base, tw: { L_m: 0.005, nRF: 2.3, ng: 2.25, alpha0_Np_per_m_sqrtGHz: 5 } });
  const os = M.eyeOpening(slow.T, bits, 16, 8);
  const of = M.eyeOpening(fast.T, bits, 16, 8);
  assert.ok(of > os, `fast ${of} vs slow ${os}`);
  assert.ok(of <= want + 1e-9);
  let tot = 0;
  for (const h of ideal.hist) tot += h;
  assert.equal(tot, bits.length * 16);
});

test("series branch of twResponse (|uL| < 1e-4) is continuous with the closed form: |H| = |sin(t)/t|, t = uL/2", () => {
  for (const x of [0.999e-4, 1.001e-4, 3e-7, 0]) {
    const f = 1e10;
    const L = 0.01;
    const dn = (x * c) / (2 * Math.PI * f * L);
    const p = { L_m: L, nRF: 2.25 + dn, ng: 2.25 };
    const t = x / 2;
    const want = t === 0 ? 1 : Math.abs(Math.sin(t) / t);
    assert.ok(Math.abs(M.twResponseMag(f, p) - want) < 1e-12, `x ${x}`);
  }
});
