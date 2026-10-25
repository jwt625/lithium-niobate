// References:
// - Lord Rayleigh, Proc. London Math. Soc. 17, 4 (1885): isotropic half-space, lambda = mu (Poisson 1/4):
//   v_R / v_s = sqrt(2 - 2/sqrt(3)) = 0.919402 (root of the Rayleigh cubic); surface orbit retrograde.
// - J.L. Bleustein, Appl. Phys. Lett. 13, 412 (1968) (Bleustein-Gulyaev wave; derivation re-done in the test comment):
//   6mm crystal, c axis along x2, propagation x1, normal x3: shorted v = vb sqrt(1 - K^4), open
//   v = vb sqrt(1 - K^4 (eps0/(eps11 + eps0))^2), vb = sqrt(cbar44/rho), cbar44 = c44 + e15^2/eps11, K^2 = e15^2/(eps11 cbar44).
//   Test tensor is synthetic (not a material).
// - Lane C03 manuscript (content/chapters/03-sound/manuscript.md sec. 3.3 tables, sec. 3.4 sweep table, L3 constant-set
//   table; refs id c03-calc, status derived) and figures.md F3.4/F3.5/F3.6 acceptance. These are CROSS-IMPLEMENTATION
//   checks (C03 scratch script vs this code, same method), not external data; the external anchors are the analytic
//   limits above and the vendor velocities below. Tolerances abs 0.5 m/s and k^2 abs 0.02 pp as specified in figures.md.
// - Vendor cross-check (fomos-ln, status V, via C03 sec. 3.3): 3488 (Y-Z), 3980 (128 deg Y-X), 4690 (64 deg), 4750 (41 deg) m/s.
// - Constant sets: kushibiki1999 (P, constants.ts); ogi2002 c, e, rho with kushibiki1999 eps^S; Warner 1967 c (weis1985,
//   P-comp), e (ogi2002 Table III, S), eps^S (weis1985 Table 1, P-comp), rho 4700 assumed by C03: read from
//   src/lib/generated/*.json (lane API) so the solver and the published data stay in step.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as S from "./saw.ts";
import { acousticMaterial } from "./acoustics.ts";
import type { AcousticMaterial } from "./acoustics.ts";
import { c3m, e3m, eps3m, namedCut, orientationFromAxes, rotZ } from "./tensors.ts";
import { matMul3 } from "./linalg.ts";
import { EPS0 } from "./constants.ts";

const LN = S.SAW_DEFAULT_MATERIAL;
const near = (a: number, b: number, tol: number, msg: string) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b} (tol ${tol})`);

const gen = (f: string) => JSON.parse(readFileSync(new URL(`../generated/${f}`, import.meta.url), "utf8"));
const TENSORS = gen("tensors.json") as { id: string; independent: Record<string, { value: number }> }[];
const PROPS = gen("properties.json") as { id: string; value: number }[];
const ind = (id: string): Record<string, number> => {
  const r = TENSORS.find((x) => x.id === id);
  if (!r) throw new Error(`missing tensor ${id}`);
  return Object.fromEntries(Object.entries(r.independent).map(([k, v]) => [k, v.value]));
};
const asC = (o: Record<string, number>) => o as { c11: number; c12: number; c13: number; c14: number; c33: number; c44: number };
const asE = (o: Record<string, number>) => o as { e15: number; e22: number; e31: number; e33: number };
const asEps = (o: Record<string, number>) => o as { eps11: number; eps33: number };

test("isotropic limit: Rayleigh 1885 v_R/v_s = sqrt(2 - 2/sqrt 3), free = metallized, retrograde orbit", () => {
  const mu = 50;
  const rho = 3000;
  const iso = acousticMaterial(c3m({ c11: 3 * mu, c12: mu, c13: mu, c14: 0, c33: 3 * mu, c44: mu }), e3m({ e15: 0, e22: 0, e31: 0, e33: 0 }), eps3m({ eps11: 1, eps33: 1 }), rho);
  const vs = Math.sqrt((mu * 1e9) / rho);
  const r = S.sawCut(iso, namedCut("Z-cut, X-prop"), "rayleigh");
  near(r.free.v / vs, Math.sqrt(2 - 2 / Math.sqrt(3)), 1e-8, "v_R/v_s");
  near(r.met.v, r.free.v, 1e-6, "no piezo: shorting changes nothing");
  const P = S.sawProblem(iso, namedCut("Z-cut, X-prop"));
  const F = S.sawFields(P, "open", r.free.v);
  assert.equal(F.orbit, "retrograde");
  assert.ok(F.bcResidual < 1e-9, `bc residual ${F.bcResidual}`);
});

test("Bleustein-Gulyaev wave (6mm test tensor): shorted and open velocities vs the closed form", () => {
  const e15 = 2.0;
  const eps11 = 45;
  const c44 = 60;
  const rho = 4640;
  const m = acousticMaterial(c3m({ c11: 200, c12: 55, c13: 68, c14: 0, c33: 234, c44 }), e3m({ e15, e22: 0, e31: 0.3, e33: 1.9 }), eps3m({ eps11, eps33: 27 }), rho);
  const P = S.sawProblem(m, orientationFromAxes("XZnY")); // x1 = X, x2 = Z (c axis), x3 = -Y
  const cb = c44 * 1e9 + e15 ** 2 / (eps11 * EPS0);
  const vb = Math.sqrt(cb / rho);
  const K2 = e15 ** 2 / (eps11 * EPS0 * cb);
  const vShort = vb * Math.sqrt(1 - K2 ** 2);
  const vOpen = vb * Math.sqrt(1 - (K2 / (1 + eps11)) ** 2);
  near(P.thresholds[2], vb, 1e-6, "slow threshold = stiffened SH bulk wave");
  const rs = S.sawSolve(P, { surface: "short", branch: "rayleigh", vLo: vb - 200, dv_mps: 0.5 });
  near(rs.v, vShort, 1e-5, "BG shorted");
  // the open-surface BG wave sits 0.019 m/s below the bulk wave: shrink the threshold window to resolve it
  const ro = S.sawSolve(P, { surface: "open", branch: "rayleigh", vLo: vb - 5, dv_mps: 0.002, excludeWindow_mps: 0.001 });
  near(ro.v, vOpen, 1e-5, "BG open");
});

test("C03 standard cuts (kushibiki1999): v_free, v_met, k^2 (sec. 3.3 table)", () => {
  const cases: [string, ReturnType<typeof namedCut>, number, number, number][] = [
    ["Y-Z", namedCut("Y-cut, Z-prop"), 3486.4, 3412.7, 4.23],
    ["128 deg Y-X", S.sawFrameRotY(128), 3978.4, 3870.7, 5.41],
    ["X-Z", namedCut("X-cut, Z-prop"), 3482.3, 3405.9, 4.39],
    ["X-Y", namedCut("X-cut, Y-prop"), 3696.4, 3640.0, 3.05],
    ["Z-X", namedCut("Z-cut, X-prop"), 3785.6, 3777.4, 0.43],
  ];
  for (const [name, R, vf, vm, k2] of cases) {
    const r = S.sawCut(LN, R, "rayleigh");
    near(r.free.v, vf, 0.5, `${name} v_free`);
    near(r.met.v, vm, 0.5, `${name} v_met`);
    near(r.k2 * 100, k2, 0.02, `${name} k2`);
    assert.equal(r.k2Status, "root");
    assert.equal(r.free.vIm, 0);
  }
});

test("C03 leaky SAW: 64 deg and 36/41 deg isolated complex roots and losses; 128 deg genuinely pinned", () => {
  const r64 = S.sawCut(LN, S.sawFrameRotY(64), "leaky");
  near(r64.free.v, 4691.4, 0.5, "64 v_free");
  near(r64.met.v, 4448.2, 0.5, "64 v_met");
  near(r64.k2 * 100, 10.37, 0.02, "64 k2");
  assert.equal(r64.free.status, "root");
  assert.ok(r64.free.vIm < 0 && r64.met.vIm < 0, "leaky roots decay in time");
  // losses: rel 30% (approximate method in C03)
  assert.ok(Math.abs(r64.free.loss_dB_per_lambda / 0.051 - 1) < 0.3, `64 free loss ${r64.free.loss_dB_per_lambda}`);
  assert.ok(Math.abs(r64.met.loss_dB_per_lambda / 0.0033 - 1) < 0.3, `64 met loss ${r64.met.loss_dB_per_lambda}`);
  // 41 deg free surface: C03 reported the root as threshold-pinned (default 1 m/s window); the fine-window retry
  // resolves an isolated zero 0.77 m/s below the fast-shear velocity along X (4750.1 m/s) at the same 4749.3 m/s.
  const r41 = S.sawCut(LN, S.sawFrameRotY(41), "leaky");
  assert.equal(r41.free.status, "root");
  assert.ok(r41.free.residual < 1e-6, `41 residual ${r41.free.residual}`);
  near(r41.free.v, 4749.3, 0.5, "41 v_free");
  near(r41.thresholds[1] - r41.free.v, 0.77, 0.1, "41 gap to fast shear");
  assert.ok(r41.free.loss_dB_per_lambda > 0 && r41.free.loss_dB_per_lambda < 1e-3, `41 free loss ${r41.free.loss_dB_per_lambda}`);
  near(r41.met.v, 4376.2, 0.5, "41 v_met isolated");
  assert.equal(r41.met.status, "root");
  near(r41.k2 * 100, 15.71, 0.02, "41 k2");
  assert.equal(r41.k2Status, "root");
  assert.ok(Math.abs(r41.met.loss_dB_per_lambda / 0.016 - 1) < 0.3, `41 met loss ${r41.met.loss_dB_per_lambda}`);
  // 36 deg (C03: 4749.4 / 4347.6 / 16.92%)
  const r36 = S.sawCut(LN, S.sawFrameRotY(36), "leaky");
  assert.equal(r36.free.status, "root");
  near(r36.free.v, 4749.4, 0.5, "36 v_free");
  near(r36.met.v, 4347.6, 0.5, "36 v_met");
  near(r36.k2 * 100, 16.92, 0.02, "36 k2");
  // a genuine pin: 128 deg, both surfaces merge with the slow shear threshold (4029.0 m/s along X): no coupling
  const r128 = S.sawCut(LN, S.sawFrameRotY(128), "leaky");
  assert.equal(r128.free.status, "threshold-pinned");
  near(r128.free.pinnedTo ?? 0, 4029.0, 0.1, "128 pinned to slow shear");
  assert.equal(r128.k2Status, "none");
});

test("C03 rotated Y-X sweep table (sec. 3.4) and Rayleigh k^2 maximum 5.42% at 129 deg (1 deg sweep 122-136)", () => {
  const table: [number, number, number, number | null, number | null][] = [
    [0, 3717.7, 1.42, 4642.3, 21.05],
    [20, 3662.9, 0.61, 4732.0, 20.48],
    [60, 3667.2, 0.06, 4711.7, 11.32],
    [70, 3699.7, 0.0, 4653.4, 9.0],
    [90, 3785.6, 0.43, 4480.3, 5.52],
    [110, 3891.7, 2.42, 4214.9, 3.43],
    [128, 3978.4, 5.41, null, null],
    [170, 3756.6, 2.0, 4569.6, 19.49],
  ];
  for (const [th, vr, kr, vl, kl] of table) {
    const R = S.sawFrameRotY(th);
    const a = S.sawCut(LN, R, "rayleigh");
    near(a.free.v, vr, 0.5, `${th} Rayleigh v`);
    near(a.k2 * 100, kr, 0.02, `${th} Rayleigh k2`);
    const b = S.sawCut(LN, R, "leaky");
    if (vl === null) {
      assert.ok(!Number.isFinite(b.k2), `${th}: no leaky root resolved`);
    } else {
      near(b.free.v, vl, 0.5, `${th} LSAW v`);
      near(b.k2 * 100, kl ?? 0, 0.02, `${th} LSAW k2`);
    }
  }
  let best = { th: 0, k2: 0 };
  for (let th = 122; th <= 136; th++) {
    const k2 = S.sawCut(LN, S.sawFrameRotY(th), "rayleigh").k2;
    if (k2 > best.k2) best = { th, k2 };
  }
  assert.equal(best.th, 129);
  near(best.k2 * 100, 5.42, 0.02, "max k2");
});

test("vendor cross-check (fomos-ln, V): kushibiki1999 velocities within 3 m/s", () => {
  near(S.sawCut(LN, namedCut("Y-cut, Z-prop"), "rayleigh").free.v, 3488, 3, "Y-Z");
  near(S.sawCut(LN, S.sawFrameRotY(128), "rayleigh").free.v, 3980, 3, "128 Y-X");
  near(S.sawCut(LN, S.sawFrameRotY(64), "leaky").free.v, 4690, 3, "64 Y-X");
  near(S.sawCut(LN, S.sawFrameRotY(41), "leaky").free.v, 4750, 3, "41 Y-X");
});

test("C03 constant-set sensitivity (sec. 3.3 L3) from the lane-API tensors", () => {
  const rhoOgi = PROPS.find((p) => p.id === "density/unspecified/ogi2002")?.value;
  assert.equal(rhoOgi, 4636);
  const sets: [string, AcousticMaterial, number[][]][] = [
    [
      "ogi2002 + kushibiki eps^S",
      acousticMaterial(c3m(asC(ind("elastic-stiffness-cE/unspecified/ogi2002"))), e3m(asE(ind("piezo-stress-e/unspecified/ogi2002"))), eps3m(asEps(ind("permittivity-S/cln/kushibiki1999"))), rhoOgi as number),
      [
        [3485.2, 4.41],
        [3974.2, 5.41],
        [4721.3, 15.57],
        [4666.8, 10.31],
      ],
    ],
    [
      "Warner 1967 (rho 4700 assumed)",
      acousticMaterial(
        c3m(asC(ind("elastic-stiffness-cE/unspecified/weis1985-warner1967"))),
        e3m(asE(ind("piezo-stress-e/unspecified/ogi2002-warner1967"))),
        eps3m(asEps(ind("permittivity-S/unspecified/weis1985-warner1967"))),
        4700,
      ),
      [
        [3489.8, 4.91],
        [3991.9, 5.27],
        [4784.7, 16.99],
        [4736.6, 11.03],
      ],
    ],
  ];
  for (const [name, m, want] of sets) {
    const res = [
      S.sawCut(m, namedCut("Y-cut, Z-prop"), "rayleigh"),
      S.sawCut(m, S.sawFrameRotY(128), "rayleigh"),
      S.sawCut(m, S.sawFrameRotY(41), "leaky"),
      S.sawCut(m, S.sawFrameRotY(64), "leaky"),
    ];
    res.forEach((r, i) => {
      near(r.free.v, want[i][0], 0.5, `${name} case ${i} v_free`);
      near(r.k2 * 100, want[i][1], 0.02, `${name} case ${i} k2`);
    });
    assert.equal(res[2].free.status, "root", `${name}: 41 deg isolated root next to the fast-shear threshold`);
  }
  // Warner 41/64 metallized (figures.md F3.4): 4378.2, 4475.4
  const w = sets[1][1];
  near(S.sawCut(w, S.sawFrameRotY(41), "leaky").met.v, 4378.2, 0.5, "Warner 41 v_met");
  near(S.sawCut(w, S.sawFrameRotY(64), "leaky").met.v, 4475.4, 0.5, "Warner 64 v_met");
});

test("symmetry: theta and theta + 180 deg (opposite face) and e -> -e give the same velocities", () => {
  // theta + 180 deg (opposite face) is the e -> -e check: the 2-fold axis along X maps e to -e and keeps c, eps
  near(S.sawCut(LN, S.sawFrameRotY(308), "rayleigh").free.v, S.sawCut(LN, S.sawFrameRotY(128), "rayleigh").free.v, 1e-6, "theta + 180");
  const neg: AcousticMaterial = { ...LN, e: LN.e.map((x) => -x) };
  const a = S.sawCut(LN, S.sawFrameRotY(128), "rayleigh");
  const b = S.sawCut(neg, S.sawFrameRotY(128), "rayleigh");
  near(a.free.v, b.free.v, 1e-6, "e -> -e free");
  near(a.met.v, b.met.v, 1e-6, "e -> -e met");
  // rotating the frame about the normal by 180 deg = propagation reversal: same velocity (reciprocity)
  const R = S.sawFrameRotY(128);
  const rev = matMul3(rotZ(Math.PI), R);
  near(S.sawCut(LN, rev, "rayleigh").free.v, a.free.v, 1e-6, "propagation reversal free");
  near(S.sawCut(LN, rev, "rayleigh").met.v, a.met.v, 1e-6, "propagation reversal met");
});

test("F3.5 fields: boundary residual, Y-Z sagittal (u2 = 0), Rayleigh decay, retrograde 128 deg orbit", () => {
  const P = S.sawProblem(LN, namedCut("Y-cut, Z-prop"));
  const r = S.sawSolve(P, { surface: "open", branch: "rayleigh" });
  const F = S.sawFields(P, "open", r.v);
  assert.ok(F.bcResidual < 1e-9, `Y-Z bc residual ${F.bcResidual}`);
  let u2max = 0;
  for (let i = 0; i < F.depth.length; i++) u2max = Math.max(u2max, Math.hypot(F.comp[1][2 * i], F.comp[1][2 * i + 1]));
  assert.ok(u2max < 1e-9, `Y-Z u2 ${u2max}`); // mirror plane x = 0 contains the sagittal plane: SH decouples
  for (const [P2, name] of [
    [P, "Y-Z"],
    [S.sawProblem(LN, S.sawFrameRotY(128)), "128"],
  ] as const) {
    const rr = S.sawSolve(P2, { surface: "open", branch: "rayleigh" });
    const G = S.sawFields(P2, "open", rr.v, 0, 4, 401);
    const mag = (i: number) => Math.hypot(G.comp[0][2 * i], G.comp[0][2 * i + 1], G.comp[1][2 * i], G.comp[1][2 * i + 1], G.comp[2][2 * i], G.comp[2][2 * i + 1]);
    const i2 = G.depth.findIndex((d) => d <= -2);
    for (let i = i2 + 1; i < G.depth.length; i++) assert.ok(mag(i) <= mag(i - 1) * (1 + 1e-12), `${name} decay monotonic beyond 2 lambda at ${G.depth[i]}`);
    assert.ok(G.fracWithin1Lambda > 0.8, `${name} energy within 1 lambda ${G.fracWithin1Lambda}`);
    assert.equal(G.orbit, "retrograde");
  }
});

test("F3.6 IDT: f0 = v/p, H(f0) = 1, first nulls at f0 (1 +- 1/N), 2 GHz period on 128 deg Y-X", () => {
  const v = S.sawCut(LN, S.sawFrameRotY(128), "rayleigh").free.v;
  near(S.idtF0(v, 4e-6) / 1e6, 994.6, 0.2, "f0 MHz at p = 4 um");
  near((v / 2e9) * 1e6, 1.989, 0.0005, "p for 2 GHz (um)");
  const f0 = 1e9;
  for (const N of [10, 37, 100]) {
    near(S.idtArrayFactor(f0, f0, N), 1, 1e-12, "H(f0)");
    near(S.idtArrayFactor(f0 * (1 + 1 / N), f0, N), 0, 1e-12, "upper null");
    near(S.idtArrayFactor(f0 * (1 - 1 / N), f0, N), 0, 1e-12, "lower null");
    near(S.idtConductanceShape(f0 * (1 + 1 / N), f0, N), 0, 1e-12, "conductance null");
    near(S.idtNullBandwidth(f0, N), (2 * f0) / N, 1e-6, "null bandwidth");
    // alternating-polarity finger form: same nulls, no lobe at 2 f0 (the per-period form repeats there)
    near(S.idtArrayFactorFingers(f0 * (1 + 1 / N), f0, N), 0, 1e-12, "finger form null");
    near(S.idtArrayFactorFingers(2 * f0, f0, N), 0, 1e-12, "finger form zero at 2 f0");
    near(Math.abs(S.idtArrayFactor(2 * f0, f0, N)), 1, 1e-9, "per-period form grating lobe at 2 f0");
  }
});

test("polyRoots recovers known roots (Aberth-Ehrlich)", () => {
  // (z - 1)(z + 2)(z - i)(z + 0.5 - 0.3i)
  const roots: [number, number][] = [
    [1, 0],
    [-2, 0],
    [0, 1],
    [-0.5, 0.3],
  ];
  let pr = [1];
  let pi = [0];
  for (const [a, b] of roots) {
    const nr = new Array(pr.length + 1).fill(0);
    const ni = new Array(pr.length + 1).fill(0);
    for (let k = 0; k < pr.length; k++) {
      nr[k + 1] += pr[k];
      ni[k + 1] += pi[k];
      nr[k] -= a * pr[k] - b * pi[k];
      ni[k] -= a * pi[k] + b * pr[k];
    }
    pr = nr;
    pi = ni;
  }
  const r = S.polyRoots(pr, pi);
  for (const [a, b] of roots) {
    const d = Math.min(...Array.from(r.re, (x, j) => Math.hypot(x - a, r.im[j] - b)));
    assert.ok(d < 1e-12, `root ${a}+${b}i`);
  }
});
