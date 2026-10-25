// Checks of the TFLN mode lattice (F2-15) and its query (modes.ts).
// References: li2026aa arm-A optical solve of the eo-modulator-atlas engine, n_eff 1.7695566, n_g 2.1351030
// (static/data/eo-overlap-li2026aa.json globals armA.neff / armA.ng; sims/li2026aa/config.yaml); figure acceptance
// n_eff 1.7696 and n_g 2.135 within 1e-3 (content/chapters/02-light/figures.md F2-15). Symmetric-slab limits:
// d -> 0 gives n_clad, d -> infinity gives the core index; TE and TM coincide for an isotropic core only in those limits.
// Optional live solve: set ATLAS_ENGINE_DIR to an eo-modulator-atlas/engine checkout to re-solve li2026aa directly.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createModeLattice, slabIndex, lnLabEps, FLAG, MODE_LABELS } from "./modes.ts";
import type { LatticeData, ModeLabel } from "./modes.ts";
import { refractiveIndex } from "./sellmeier.ts";
import { ZELMON_CLN_E, ZELMON_CLN_O } from "./constants.ts";
import { sio2Index } from "./thinfilm.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const data = JSON.parse(readFileSync(join(ROOT, "static/data/tfln-modes/lattice.json"), "utf8")) as LatticeData & {
  heldout: { p: { t: number; etch: number; w: number; sw: number; lam: number; cut: "x" | "z" }; modes: Record<ModeLabel, { n_eff: number; n_g: number; te_fraction: number; flags: number } | null> }[];
};
const L = createModeLattice(data);
const A = data.axes;
const meta = data.meta as any;

test("slabIndex: limits, ordering, and residual of the dispersion relation", () => {
  const eps: [number, number, number] = [2.2 ** 2, 2.2 ** 2, 2.2 ** 2];
  assert.equal(slabIndex({ d_um: 0, lambda_um: 1.55, eps, n_clad: 1.444, pol: "TE" }), 1.444);
  const thick = slabIndex({ d_um: 50, lambda_um: 1.55, eps, n_clad: 1.444, pol: "TE" });
  assert.ok(2.2 - thick < 1e-3 && thick < 2.2, `${thick}`);
  const te = slabIndex({ d_um: 0.3, lambda_um: 1.55, eps, n_clad: 1.444, pol: "TE" });
  const tm = slabIndex({ d_um: 0.3, lambda_um: 1.55, eps, n_clad: 1.444, pol: "TM" });
  assert.ok(te > tm && tm > 1.444, `${te} ${tm}`);
  // TE residual tan(k d / 2) = g / k
  const k0 = (2 * Math.PI) / 1.55, k = k0 * Math.sqrt(2.2 ** 2 - te ** 2), g = k0 * Math.sqrt(te ** 2 - 1.444 ** 2);
  assert.ok(Math.abs(Math.tan((k * 0.3) / 2) - g / k) < 1e-9);
  // x-cut TE sees n_e laterally, z-cut TE sees n_o
  const no = 2.2111, ne = 2.1376;
  assert.deepEqual(lnLabEps("x", no, ne), [ne * ne, no * no, no * no]);
  assert.deepEqual(lnLabEps("z", no, ne), [no * no, ne * ne, no * no]);
});

test("lattice shape, axes and grid-node exactness", () => {
  const N = A.cut.length * A.lambda_um.length * A.sidewall_deg.length * A.t_nm.length * A.etch.length * A.w_um.length;
  assert.equal(N, 6300);
  for (const m of MODE_LABELS) assert.equal(data.modes[m].n_eff.length, N);
  const k = L.index("z", 2, 1, 3, 2, 4);
  const q = L.query({ t: A.t_nm[3], etch: A.etch[2], w: A.w_um[4], sidewall: A.sidewall_deg[1], lambda: A.lambda_um[2], cut: "z", pol: "TE0" });
  assert.equal(q.n_eff, data.modes.TE0.n_eff[k]);
  assert.equal(q.n_g, data.modes.TE0.n_g[k]);
  // midpoint in w is the mean of the two nodes
  const k2 = L.index("z", 2, 1, 3, 2, 5);
  const mid = L.query({ t: A.t_nm[3], etch: A.etch[2], w: 0.5 * (A.w_um[4] + A.w_um[5]), sidewall: A.sidewall_deg[1], lambda: A.lambda_um[2], cut: "z", pol: "TE" });
  assert.ok(Math.abs(mid.n_eff - 0.5 * ((data.modes.TE0.n_eff[k] as number) + (data.modes.TE0.n_eff[k2] as number))) < 1e-12);
  assert.ok(mid.validity.inRange && mid.validity.lambdaOnGrid);
  const off = L.query({ t: 600, etch: 0.6, w: 1.2, sidewall: 70, lambda: 1.3, cut: "x", pol: "TM" });
  assert.equal(off.validity.lambdaOnGrid, false);
});

test("li2026aa: pipeline solve reproduces the engine reference; the lattice flags w = 3.5 um as out of range", () => {
  const ref = meta.reference;
  // lattice settings with the li2026aa config indices and window: the same solve as the engine's eo_overlap arm A
  assert.ok(Math.abs(ref["li2026aa-cfg"].TE0.n_eff - 1.7695566) < 1e-6, `${ref["li2026aa-cfg"].TE0.n_eff}`);
  assert.ok(Math.abs(ref["li2026aa-cfg"].TE0.n_g - 2.135103) < 1e-5, `${ref["li2026aa-cfg"].TE0.n_g}`);
  // lattice stack, window and library (Zelmon / Malitson) indices: acceptance 1e-3
  assert.ok(Math.abs(ref["li2026aa-lib"].TE0.n_eff - 1.7696) < 1e-3, `${ref["li2026aa-lib"].TE0.n_eff}`);
  assert.ok(Math.abs(ref["li2026aa-lib"].TE0.n_g - 2.135) < 1e-3, `${ref["li2026aa-lib"].TE0.n_g}`);
  assert.equal(ref["li2026aa-lib"].TE0.flags, 0);
  const q = L.query({ t: 300, etch: 0.6, w: 3.5, sidewall: 60, lambda: 1.55, cut: "x", pol: "TE0" });
  assert.equal(q.validity.inRange, false);
  assert.deepEqual(q.validity.outOfRange, ["w_um"]);
  assert.equal(q.validity.valid, false);
});

test("li2026aa: live engine solve (only with ATLAS_ENGINE_DIR)", { skip: !process.env.ATLAS_ENGINE_DIR }, async () => {
  const S = await import(join(ROOT, "scripts/precompute_tfln_modes.mjs"));
  const r = await S.directSolve(process.env.ATLAS_ENGINE_DIR, { t: 300, etch: 0.6, w: 3.5, sw: 60, lam: 1.55, cut: "x" });
  assert.ok(Math.abs(r.modes.TE0.n - 1.7696) < 1e-3 && Math.abs(r.modes.TE0.ng - 2.135) < 1e-3, JSON.stringify(r.modes.TE0));
  assert.ok(Math.abs(r.modes.TE0.n - meta.reference["li2026aa-lib"].TE0.n_eff) < 1e-6);
});

test("slab limit: wide fully-guided TE0 approaches, from below, the slab of the full film thickness", () => {
  // x-cut 1.55 um, 70 deg: n_slab(t) - n_eff(w) > 0 and shrinks with w for every t at etch 0.6
  const lam = 1.55, il = A.lambda_um.indexOf(lam), isw = A.sidewall_deg.indexOf(70), ie = A.etch.indexOf(0.6);
  const no = refractiveIndex(ZELMON_CLN_O, lam), ne = refractiveIndex(ZELMON_CLN_E, lam), nc = sio2Index(lam * 1000);
  for (let it = 0; it < A.t_nm.length; it++) {
    const ns = slabIndex({ d_um: A.t_nm[it] / 1000, lambda_um: lam, eps: lnLabEps("x", no, ne), n_clad: nc, pol: "TE" });
    const gaps = A.w_um.map((_, iw) => ns - (data.modes.TE0.n_eff[L.index("x", il, isw, it, ie, iw)] as number));
    assert.ok(gaps.every((g) => g > 0), `t ${A.t_nm[it]}: ${gaps}`);
    assert.ok(gaps[gaps.length - 1] < gaps[0] / 3, `t ${A.t_nm[it]}: ${gaps}`);
  }
});

test("TE0 n_eff increases with width and film thickness where the mode is clean", () => {
  let checked = 0, bad = 0;
  for (const cut of A.cut) for (let il = 0; il < A.lambda_um.length; il++) for (let isw = 0; isw < A.sidewall_deg.length; isw++)
    for (let it = 0; it < A.t_nm.length; it++) for (let ie = 0; ie < A.etch.length; ie++) for (let iw = 0; iw + 1 < A.w_um.length; iw++) {
      const a = L.index(cut, il, isw, it, ie, iw), b = L.index(cut, il, isw, it, ie, iw + 1);
      const D = data.modes.TE0;
      const clean = (k: number) => D.flags[k] === 0 && (D.te_fraction[k] as number) > 0.9;
      if (!clean(a) || !clean(b)) continue;
      checked++;
      if ((D.n_eff[b] as number) < (D.n_eff[a] as number)) bad++;
    }
  assert.ok(checked > 3000, `${checked}`);
  assert.equal(bad, 0);
});

test("polarization labels: every TE-family node has TE fraction >= 0.5 unless POL_HYBRID (whole lattice)", () => {
  let checked = 0;
  const bad: string[] = [];
  for (const cut of A.cut) for (let il = 0; il < A.lambda_um.length; il++) for (let isw = 0; isw < A.sidewall_deg.length; isw++)
    for (let it = 0; it < A.t_nm.length; it++) for (let ie = 0; ie < A.etch.length; ie++) for (let iw = 0; iw < A.w_um.length; iw++)
      for (const m of ["TE0", "TE1"] as const) {
        const k = L.index(cut, il, isw, it, ie, iw);
        if (data.modes[m].flags[k] & FLAG.POL_HYBRID) continue;
        const q = L.query({ t: A.t_nm[it], etch: A.etch[ie], w: A.w_um[iw], sidewall: A.sidewall_deg[isw], lambda: A.lambda_um[il], cut, pol: m });
        if (!Number.isFinite(q.te_fraction)) continue; // NOT_FOUND
        checked++;
        if (q.te_fraction < 0.5) bad.push(`${m} ${cut} ${A.lambda_um[il]} ${A.sidewall_deg[isw]} ${A.t_nm[it]} ${A.etch[ie]} ${A.w_um[iw]}: ${q.te_fraction}`);
      }
  assert.ok(checked > 10000, `${checked}`);
  assert.deepEqual(bad.slice(0, 10), []);
});

test("held-out points: stored statistics match a recomputation with the query", () => {
  const H = data.heldout;
  assert.equal(H.length, meta.heldout.n);
  assert.ok(H.length >= 120);
  const errs: Record<string, number[]> = { TE0: [], TM0: [], TE1: [] };
  for (const h of H)
    for (const m of MODE_LABELS) {
      const d = h.modes[m];
      if (!d) continue;
      const q = L.query({ t: h.p.t, etch: h.p.etch, w: h.p.w, sidewall: h.p.sw, lambda: h.p.lam, cut: h.p.cut, pol: m });
      const clean = q.validity.valid && q.validity.tracked && !q.validity.hybrid && (d.flags & (FLAG.LEAKY | FLAG.WINDOW_EDGE | FLAG.NOT_CONVERGED)) === 0 && (d.te_fraction > 0.9 || d.te_fraction < 0.1);
      if (clean) errs[m].push(Math.abs(q.n_eff - d.n_eff));
    }
  for (const m of MODE_LABELS) {
    assert.equal(errs[m].length, meta.heldout.stats[m].clean, m);
    if (!errs[m].length) continue;
    const s = [...errs[m]].sort((x, y) => x - y);
    const med = s[Math.min(s.length - 1, Math.floor(0.5 * (s.length - 1) + 0.5))];
    // stored values are rounded to 1e-6 and the direct values to 1e-6
    assert.ok(Math.abs(med - meta.heldout.stats[m].clean_stats.n_eff.median) < 5e-6, `${m} ${med}`);
  }
  // TE0 clean held-out median interpolation error (observed bound, see lattice.meta.heldout.stats)
  const s0 = [...errs.TE0].sort((x, y) => x - y);
  assert.ok(s0.length >= 40, `${s0.length}`);
  assert.ok(s0[Math.floor(s0.length / 2)] < 2e-3, `${s0[Math.floor(s0.length / 2)]}`);
});
