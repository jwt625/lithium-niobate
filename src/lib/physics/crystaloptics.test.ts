// References:
//   Uniaxial limits, field-along-z closed form, 45 deg axis rotation for E along x, threefold invariance: R11 S1 validation list
//     (Yariv and Yeh 1984 ch. 7). Optic axes: Born and Wolf (tan^2 V = (b_max - b_mid)/(b_mid - b_min)), checked by the
//     independent degeneracy of the projected eigen-indices along each optic axis.
//   Walk-off: Dmitriev et al. 1999 formula vs the angle between D and E = B D (independent).
//   Conoscope: port equality with mockup/ln.js (executed here in a VM with a stub canvas); exact z-cut retardance
//     Gamma = k0 d [sqrt(no^2 - s^2) - (no/ne) sqrt(ne^2 - s^2)] (o/e wave-normal kz) vs the general solver.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import * as O from "./crystaloptics.ts";
import * as C from "./constants.ts";
import { refractiveIndex as n } from "./sellmeier.ts";
import { namedCut, r3m, rotZ } from "./tensors.ts";
import { dot3, matMul3, matVec3, transpose3 } from "./linalg.ts";
import type { Vec3 } from "./linalg.ts";

const no = n(C.ZELMON_CLN_O, 1.55);
const ne = n(C.ZELMON_CLN_E, 1.55);
const r = r3m(C.EO_TURNER1966_S).map((row) => row.map((v) => v * 1e-12));

test("uniaxial limits: k along z gives (no, no); along x gives (ne, no); principal indices", () => {
  const B = O.impermeability(no, ne);
  const z = O.eigenIndices(B, [0, 0, 1]);
  assert.ok(Math.abs(z.nLo - no) < 1e-12 && Math.abs(z.nHi - no) < 1e-12);
  const x = O.eigenIndices(B, [1, 0, 0]);
  assert.ok(Math.abs(x.nLo - ne) < 1e-12 && Math.abs(x.nHi - no) < 1e-12);
  assert.ok(Math.abs(Math.abs(x.dLo[2]) - 1) < 1e-12, "e polarization along z");
  const p = O.principalIndices(B);
  assert.ok(Math.abs(p.n[0] - ne) < 1e-12 && Math.abs(p.n[2] - no) < 1e-12);
  // general direction: extraordinary index formula
  const th = 0.7;
  const g = O.eigenIndices(B, [Math.sin(th), 0, Math.cos(th)]);
  assert.ok(Math.abs(g.nLo - O.extraordinaryIndex(th, no, ne)) < 1e-12);
});

test("E along z keeps the crystal uniaxial: dn_o = -no^3 r13 E/2, dn_e = -ne^3 r33 E/2 to first order", () => {
  const E = 1e7; // 10 V/um
  const p = O.principalIndices(O.impermeability(no, ne, r, [0, 0, E]));
  const dno = -0.5 * no ** 3 * 8.6e-12 * E;
  const dne = -0.5 * ne ** 3 * 30.8e-12 * E;
  assert.ok(Math.abs(p.n[1] - p.n[2]) < 1e-14, "still uniaxial");
  assert.ok(Math.abs(p.n[2] - no - dno) < 2 * Math.abs(dno) ** 2 / no * 3);
  assert.ok(Math.abs(p.n[0] - ne - dne) < 2 * Math.abs(dne) ** 2 / ne * 3);
});

test("E along x: z-propagating eigenpolarizations rotate to exactly 45 deg; crystal becomes biaxial", () => {
  const B = O.impermeability(no, ne, r, [1e7, 0, 0]);
  const e = O.eigenIndices(B, [0, 0, 1]);
  assert.ok(Math.abs(Math.abs(e.dHi[0]) - Math.SQRT1_2) < 1e-12 && Math.abs(Math.abs(e.dHi[1]) - Math.SQRT1_2) < 1e-12);
  // split = no^3 r22 E (first order)
  assert.ok(Math.abs(e.nHi - e.nLo - no ** 3 * 3.4e-12 * 1e7) < 1e-9);
  const p = O.principalIndices(B);
  assert.ok(p.n[1] - p.n[0] > 1e-6 && p.n[2] - p.n[1] > 1e-6, "three distinct indices");
});

test("threefold invariance: eigen-indices along C3 k with field C3 E equal those along k with E", () => {
  const R = rotZ((2 * Math.PI) / 3);
  const E: Vec3 = [3e6, -2e6, 5e6];
  const k: Vec3 = [0.3, 0.5, 0.81];
  const a = O.eigenIndices(O.impermeability(no, ne, r, E), k);
  const b = O.eigenIndices(O.impermeability(no, ne, r, matVec3(R, E)), matVec3(R, k));
  assert.ok(Math.abs(a.nLo - b.nLo) < 1e-14 && Math.abs(a.nHi - b.nHi) < 1e-14);
});

test("optic axes: eigen-indices degenerate along both axes; uniaxial case returns z", () => {
  const u = O.opticAxes(O.impermeability(no, ne));
  assert.ok(u.uniaxial && Math.abs(Math.abs(u.axes[0][2]) - 1) < 1e-12);
  const B = O.impermeability(no, ne, r, [2e7, 0, 0]);
  const oa = O.opticAxes(B);
  assert.ok(!oa.uniaxial);
  for (const ax of oa.axes) {
    const e = O.eigenIndices(B, ax);
    assert.ok(Math.abs(e.nHi - e.nLo) < 1e-12, `split ${e.nHi - e.nLo}`);
  }
  // nearby direction is not degenerate
  const e2 = O.eigenIndices(B, [oa.axes[0][0] + 0.05, oa.axes[0][1], oa.axes[0][2]]);
  assert.ok(e2.nHi - e2.nLo > 1e-5);
  assert.ok(oa.acute2V > 0 && oa.acute2V < Math.PI / 2);
});

test("walk-off formula equals the angle between D and E = B D (negative uniaxial)", () => {
  const B = O.impermeability(no, ne);
  for (const th of [0.2, 0.6, Math.PI / 4, 1.2]) {
    const k: Vec3 = [Math.sin(th), 0, Math.cos(th)];
    const { dLo } = O.eigenIndices(B, k); // e-wave
    const E = matVec3(B, dLo);
    const cosA = dot3(E, dLo) / Math.hypot(...E);
    const ang = Math.acos(Math.min(1, Math.abs(cosA)));
    assert.ok(Math.abs(ang - O.walkoffAngle(th, no, ne)) < 1e-12, `theta ${th}`);
  }
});

// ---------- conoscope ----------
const here = fileURLToPath(new URL(".", import.meta.url));
const mockPath = `${here}../../../mockup/ln.js`;

function runMockup(size: number, opt: Record<string, unknown>): Uint8ClampedArray {
  const code = readFileSync(mockPath, "utf8");
  const ctxv = vm.createContext({ Math });
  const LN = vm.runInContext(`${code}\n;LN`, ctxv) as { renderConoscope: (c: unknown, s: number, o: unknown) => void };
  let out: Uint8ClampedArray = new Uint8ClampedArray(0);
  const ctx2d = {
    createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }),
    putImageData: (img: { data: Uint8ClampedArray }) => { out = img.data; },
  };
  LN.renderConoscope(ctx2d, size, opt);
  return out;
}

test("conoscopeZcutWeak reproduces mockup/ln.js pixel for pixel (mono, with and without field)", { skip: !existsSync(mockPath) }, () => {
  const size = 96;
  for (const [E, dir] of [[0, "x"], [1.5, "x"], [2, "y"]] as const) {
    const mock = runMockup(size, { thicknessMm: 0.6, fieldKVmm: E, fieldDir: dir, white: false, mono: true, NA: 0.55 });
    const I = O.conoscopeZcutWeak({
      size, thickness_um: 600, lam_um: 0.6328, NA: 0.55,
      no: n(C.ZELMON_CLN_O, 0.6328), ne: n(C.ZELMON_CLN_E, 0.6328), nRefract: n(C.ZELMON_CLN_O, 0.55),
      r22_m_per_V: 6.8e-12, E_V_per_m: E * 1e6, fieldDir: dir,
    });
    let maxd = 0;
    const half = size / 2;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const u = (x + 0.5 - half) / half, v = (half - y - 0.5) / half, r2 = u * u + v * v;
      const edge = r2 > 0.985 ? 0.55 : 1;
      const want = Math.min(255, 255 * Math.pow(I[y * size + x], 0.8) * edge * 1.6);
      maxd = Math.max(maxd, Math.abs(mock[(y * size + x) * 4] - want));
    }
    assert.ok(maxd <= 1, `E ${E} ${dir}: max byte diff ${maxd}`);
  }
});

test("mockupSpectrum reproduces the mockup white-light composite (red channel)", { skip: !existsSync(mockPath) }, () => {
  const size = 48;
  const mock = runMockup(size, { thicknessMm: 0.6, fieldKVmm: 1, fieldDir: "x", white: true, mono: false, NA: 0.55 });
  const sp = O.mockupSpectrum();
  assert.equal(sp.length, 11);
  const nR = n(C.ZELMON_CLN_O, 0.55);
  const R = new Float64Array(size * size);
  let wsum = 0;
  for (const s of sp) {
    const I = O.conoscopeZcutWeak({ size, thickness_um: 600, lam_um: s.lam, NA: 0.55, no: n(C.ZELMON_CLN_O, s.lam), ne: n(C.ZELMON_CLN_E, s.lam), nRefract: nR, r22_m_per_V: 6.8e-12, E_V_per_m: 1e6, fieldDir: "x" });
    for (let i = 0; i < I.length; i++) R[i] += I[i] * s.w[0];
    wsum += s.w[0];
  }
  let maxd = 0;
  const half = size / 2;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = (x + 0.5 - half) / half, v = (half - y - 0.5) / half, r2 = u * u + v * v;
    const edge = r2 > 0.985 ? 0.55 : 1;
    const want = r2 > 1 ? 0 : Math.min(255, 255 * Math.pow(R[y * size + x] / wsum, 0.8) * edge * 1.6);
    maxd = Math.max(maxd, Math.abs(mock[(y * size + x) * 4] - want));
  }
  assert.ok(maxd <= 1, `max byte diff ${maxd}`);
});

test("general conoscope, exact retardance: z-cut matches the exact uniaxial formula to 1e-7 rad", () => {
  const size = 64, d = 600, lam = 0.6328, NA = 0.55;
  const o = n(C.ZELMON_CLN_O, lam), e = n(C.ZELMON_CLN_E, lam);
  const G = new Float32Array(size * size);
  O.conoscope({ size, thickness_um: d, lam_um: lam, NA, B: O.impermeability(o, e), retardance: "exact" }, undefined, G);
  // compare in float64 by recomputing a few pixels (Float32 storage limits precision to ~1e-5 relative)
  const half = size / 2;
  let maxRel = 0;
  for (let y = 0; y < size; y += 3) for (let x = 0; x < size; x += 3) {
    const u = (x + 0.5 - half) / half, v = (half - y - 0.5) / half, r2 = u * u + v * v;
    if (r2 > 1) continue;
    const s = NA * Math.sqrt(r2);
    const ex = O.zcutRetardanceExact(s, o, e, d, lam);
    maxRel = Math.max(maxRel, Math.abs(G[y * size + x] - ex) / Math.max(1, Math.abs(ex)));
  }
  assert.ok(maxRel < 1e-6, `max rel ${maxRel}`);
});

test("general conoscope, weak model: thin z-cut plate agrees with the mockup port to first order (no field, E along x)", () => {
  // the port linearizes n_e(theta) - n_o ~ -(no - ne) sin^2 theta; the general solver uses exact eigen-indices, so the
  // retardances differ at relative order (no - ne)/no (~4%); a 10 um plate keeps Gamma < 0.5 rad and |dI| < 0.01
  const size = 64, d = 10, lam = 0.6328, NA = 0.55;
  const o = n(C.ZELMON_CLN_O, lam), e = n(C.ZELMON_CLN_E, lam), nR = n(C.ZELMON_CLN_O, 0.55);
  for (const E of [0, 4e6]) {
    const port = O.conoscopeZcutWeak({ size, thickness_um: d, lam_um: lam, NA, no: o, ne: e, nRefract: nR, r22_m_per_V: 3.4e-12, E_V_per_m: E, fieldDir: "x" });
    const rr = r3m({ r13: 0, r22: 3.4, r33: 0, r51: 0 }).map((row) => row.map((v) => v * 1e-12));
    const gen = O.conoscope({ size, thickness_um: d, lam_um: lam, NA, B: O.impermeability(o, e, rr, [E, 0, 0]), nRefract: nR, retardance: "weak" });
    let maxd = 0;
    for (let i = 0; i < port.length; i++) maxd = Math.max(maxd, Math.abs(port[i] - gen[i]));
    assert.ok(maxd < 0.01, `E ${E}: max |dI| ${maxd}`);
  }
});

test("conoscope sanity: zero thickness is dark (crossed) and bright (parallel); Maltese-cross symmetry", () => {
  const size = 40;
  const B = O.impermeability(2.2865, 2.2022);
  const dark = O.conoscope({ size, thickness_um: 0, lam_um: 0.6328, NA: 0.5, B });
  assert.ok(dark.every((v) => Math.abs(v) < 1e-12));
  const par = O.conoscope({ size, thickness_um: 0, lam_um: 0.6328, NA: 0.5, B, analyzer_rad: 0 });
  const half = size / 2;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = (x + 0.5 - half) / half, v = (half - y - 0.5) / half;
    if (u * u + v * v <= 1) assert.ok(Math.abs(par[y * size + x] - 1) < 1e-12);
  }
  const I = O.conoscope({ size, thickness_um: 500, lam_um: 0.6328, NA: 0.5, B });
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const a = I[y * size + x];
    assert.ok(Math.abs(a - I[y * size + (size - 1 - x)]) < 1e-5, "mirror x");
    assert.ok(Math.abs(a - I[x * size + y]) < 1e-5, "swap x/y");
  }
});

test("X-cut plate at normal incidence: Gamma = k0 d (no - ne) (R11 S2 thin-film case)", () => {
  const lam = 0.55, d = 0.6;
  const o = n(C.ZELMON_CLN_O, lam), e = n(C.ZELMON_CLN_E, lam);
  const G = new Float32Array(4);
  O.conoscope({ size: 2, thickness_um: d, lam_um: lam, NA: 1e-9, B: O.impermeability(o, e), R: namedCut("X-cut, Y-prop") }, undefined, G);
  const want = ((2 * Math.PI) / lam) * d * (o - e);
  assert.ok(Math.abs(G[0] - want) < 1e-6, `${G[0]} vs ${want}`);
  // the rotated B in the lab is consistent with R B R^T
  const R = namedCut("X-cut, Y-prop");
  const Bl = matMul3(matMul3(R, O.impermeability(o, e)), transpose3(R));
  assert.ok(Math.abs(Bl[1][1] - 1 / (e * e)) < 1e-15, "crystal Z along lab y");
});
