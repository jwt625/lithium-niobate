// References: SI Brochure 2019 exact constants (c, h, e); definitions of dB and Np.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as U from "./units.ts";

const close = (a: number, b: number, rel = 1e-12) => assert.ok(Math.abs(a - b) <= rel * Math.abs(b), `${a} vs ${b}`);

test("wavelength <-> frequency <-> energy (exact SI constants)", () => {
  close(U.umToTHz(1.55), 299792458 / 1.55e-6 / 1e12);
  close(U.umToTHz(1.55), 193.41448903225806, 1e-12);
  // hc/e = 1.239841984... um eV (exact from SI definitions)
  close(U.eVToUm(1), 1.2398419843320026, 1e-12);
  close(U.THzToUm(U.umToTHz(0.775)), 0.775);
  close(U.umToEV(U.eVToUm(3.7)), 3.7);
  close(U.wavenumberToUm(U.umToWavenumber(2.87)), 2.87);
});

test("linewidth conversion: 0.8 nm at 1550 nm is about 99.9 GHz", () => {
  close(U.dlNmToDfGHz(0.8, 1550), (299792458 * 0.8e-9) / (1550e-9) ** 2 / 1e9);
  close(U.dfGHzToDlNm(U.dlNmToDfGHz(0.8, 1550), 1550), 0.8);
});

test("dB conventions", () => {
  close(U.toDb(2), 3.010299956639812);
  close(U.fieldToDb(2), 6.020599913279624);
  close(U.fromDb(U.toDb(0.37)), 0.37);
  close(U.dbmToW(0), 1e-3);
  close(U.wToDbm(1), 30);
  close(U.NP_TO_DB, 8.685889638065035);
  // 1 dB/cm = 100 dB/m = 23.0259 1/m power attenuation
  close(U.dbPerCmToAlphaPerM(1), 100 * Math.LN10 / 10);
  close(U.alphaPerMToDbPerCm(U.dbPerCmToAlphaPerM(0.027)), 0.027);
  close(U.alphaPerMToDbPerM(U.dbPerMToAlphaPerM(2.7)), 2.7);
});

test("EO and Q units", () => {
  close(U.vcmToVm(2.2), 0.022);
  close(U.kVPerMmToVPerM(1), 1e6);
  close(U.pmPerVToMPerV(30.8), 30.8e-12);
  const Q = U.qFromAlpha(U.dbPerMToAlphaPerM(2.7), 2.3, 1.55);
  close(U.alphaFromQ(Q, 2.3, 1.55), U.dbPerMToAlphaPerM(2.7));
});
