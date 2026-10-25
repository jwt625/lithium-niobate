// References (content/chapters/05-making/manuscript.md and figures.md, derived values by lane C05 2026-10-25):
// F05-02: L(110 h) = 110 mm at 1 mm/h; 153 mm x 110 mm body, 4647 kg/m^3 (volk2008 Table 1.1) -> 9.4 kg; pull 55-110 h.
// F05-04: jackel1982 rates 1.37 / 0.37 um^2/h at 249 / 217 C -> Ea 0.90 eV; d(249 C, 4 h) = 2.34 um (d^2/t).
// F05-07: t = D A / I = 21.1 h per cm^2 at 7600 uC/cm^2, 100 nA (kaufmann2023); 22 x 22 mm fields (luke2020) with
// 8 mm edge exclusion: 6 fields (100 mm), 21 (150 mm).
// F05-08: tan(a_LN) = S tan(a_mask): 88.3 deg at S = 3, a_mask = 85 deg; S = 1 returns 85 deg.
// F05-11 / 5.1: M(LiNbO3) 147.84 g/mol, Nb 62.84 wt%; 0.250 kg Li2CO3 + 0.899 kg Nb2O5 -> 0.149 kg CO2 per kg;
// wafer masses 10.6/6.7, 12.8/8.0, 41.1/25.8, 73.0/45.9 g.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as F from "./fab.ts";

test("F05-02 Czochralski: 110 mm at 110 h, pull time 55-110 h, body 9.4 kg", () => {
  assert.equal(F.czBodyLength(1, 110), 110);
  assert.equal(F.czPullTime(110, 2), 55);
  assert.ok(Math.abs(F.cylinderMass(153, 110, 4647) - 9.4) < 0.05, `${F.cylinderMass(153, 110, 4647)}`);
});

test("F05-04 proton exchange: Ea 0.90 eV, 2.34 um at 249 C 4 h, endpoints exact, validity band", () => {
  const r = F.peRate(249);
  assert.ok(Math.abs(r.Ea_eV - 0.9) < 0.005, `${r.Ea_eV}`);
  assert.ok(Math.abs(r.r_um2_per_h - 1.37) < 1e-12 && Math.abs(F.peRate(217).r_um2_per_h - 0.37) < 1e-12);
  const d = F.peDepth(249, 4);
  assert.ok(Math.abs(d.d_um - 2.34) < 0.005 && d.valid);
  assert.ok(Math.abs(F.peDepth(249, 4, "D").d_um - 2 * d.d_um) < 1e-12);
  assert.equal(F.peDepth(200, 4).valid, false);
  assert.equal(F.peDepth(250, 4).valid, false);
});

test("F05-07 EBL 21.1 h/cm^2; stepper fields 6 (100 mm) and 21 (150 mm)", () => {
  assert.ok(Math.abs(F.eblWriteTime(7600, 1, 100) / 3600 - 21.1) < 0.05);
  assert.ok(Math.abs(F.eblWriteTime(1900, 1, 8, 4) - (1900e-6 * 4) / 8e-9) < 1e-9);
  const a = F.stepperFieldCount(100, 22, 8);
  const b = F.stepperFieldCount(150, 22, 8);
  assert.equal(a.count, 6, `100 mm: ${a.count}`);
  assert.equal(b.count, 21, `150 mm: ${b.count}`);
  // every field fully inside the usable circle
  for (const [x, y] of b.centres) assert.ok(Math.hypot(Math.abs(x) + 11, Math.abs(y) + 11) <= 67 + 1e-9);
});

test("F05-08 sidewall: 88.3 deg at S 3, a_mask 85; S 1 returns a_mask; recession geometry", () => {
  assert.ok(Math.abs(F.sidewallAngle(3, 85) - 88.3) < 0.05, `${F.sidewallAngle(3, 85)}`);
  assert.ok(Math.abs(F.sidewallAngle(1, 85) - 85) < 1e-12);
  const h = 300e-9;
  const t = Math.tan((F.sidewallAngle(3, 85) * Math.PI) / 180);
  assert.ok(Math.abs(F.maskRecession(h, 3, 85) - h / t) < 1e-18);
});

test("F05-06 Preston: rate and time are linear in Kp P v (Kp caller-supplied, template)", () => {
  assert.ok(Math.abs(F.prestonRate(2e-13, 3e4, 1) - 6e-9) < 1e-24);
  assert.ok(Math.abs(F.prestonTime(80e-9, 2e-13, 3e4, 1) - 80e-9 / 6e-9) < 1e-12);
});

test("F05-05 implant: only the reported 195 keV He point; everything else 'no verified data'", () => {
  assert.deepEqual(F.implantRange("He", 195).Rp_um, 0.68);
  assert.equal(F.implantRange("He", 195).status, "reported");
  assert.deepEqual(F.implantRange("He", 200), { status: "no verified data", Rp_um: null });
  assert.equal(F.implantRange("H", 100).status, "no verified data");
});

test("F05-11 mass budget: molar mass, Nb fraction, charge, wafer masses", () => {
  assert.ok(Math.abs(F.MOLAR_MASS.LiNbO3 - 147.84) < 0.005);
  assert.ok(Math.abs(F.nbMassFraction() * 100 - 62.84) < 0.005);
  const c = F.chargePerKg();
  assert.ok(Math.abs(c.Li2CO3 - 0.25) < 5e-4 && Math.abs(c.Nb2O5 - 0.899) < 5e-4 && Math.abs(c.CO2 - 0.149) < 5e-4, JSON.stringify(c));
  assert.ok(Math.abs(c.Li2CO3 + c.Nb2O5 - c.CO2 - 1) < 1e-12);
  const rows: [number, number, number, number][] = [
    [76.2, 0.5, 10.6, 6.7],
    [100, 0.35, 12.8, 8.0],
    [150, 0.5, 41.1, 25.8],
    [200, 0.5, 73.0, 45.9],
  ];
  for (const [D, t, ln, nb] of rows) {
    const m = F.waferMass(D, t);
    assert.ok(Math.abs(m.LN_g - ln) < 0.05 && Math.abs(m.Nb_g - nb) < 0.05, `${D}: ${m.LN_g} ${m.Nb_g}`);
  }
});
