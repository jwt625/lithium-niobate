// precompute_tfln_modes.mjs
// Purpose: precompute the TFLN rib-waveguide mode lattice of figure F2-15 (chapter 2.7) with the eo-modulator-atlas
//   full-vector FEM engine (engine/src/vector-mode.mjs; GPL-3.0-or-later), imported as scripts/export_eo_overlap.mjs does.
//   Output: static/data/tfln-modes/lattice.json (query: src/lib/physics/modes.ts).
// Usage:
//   node scripts/precompute_tfln_modes.mjs [--engine DIR] [--workers N] [--dry-run] [--pilot] [--study-width]
//        [--lattice] [--heldout] [--ref] [--assemble] [--relabel-only] [--limit N] [--mesh-scale S]
//   Default (no task flag): --ref --lattice --heldout, then --assemble. --relabel-only: assemble from the existing
//   logs/tfln-modes-*.jsonl and lattice.json (engine id kept from lattice.meta) without solving; no engine needed. DIR defaults to $ATLAS_ENGINE_DIR or
//   ../eo-modulator-atlas/engine (relative to the repository root).
//   Resumable: every finished task is appended to logs/tfln-modes-<timestamp>.jsonl; tasks whose key is already in any
//   logs/tfln-modes-*.jsonl are skipped. --dry-run lists the grid, the remaining tasks and a runtime estimate.
// Stack (per point): LN film of thickness t on SiO2 (BOX), SiO2 cladding over the whole cross-section (rib embedded);
//   the optical window holds only LN and SiO2 (no Si substrate, no electrodes: substrate leakage is not modelled).
//   Rib: top width w, etch depth t * etch, sidewall angle from horizontal (bottom width w + 2 t etch / tan(angle)),
//   slab t (1 - etch) outside the rib (none at etch = 1).
//   x-cut: propagation along crystal y (lab x = crystal z: TE sees n_e); z-cut: propagation along crystal x (TM sees n_e).
// Materials (engine library engine/data/materials.json, via material names without explicit n):
//   LN: Zelmon, Small, Jundt, JOSA B 14, 3319 (1997), congruent, 21 C, Sellmeier (refractiveindex.info transcription;
//   same coefficients as data/dispersion/zelmon1997.yaml and src/lib/physics/constants.ts ZELMON_CLN_*).
//   SiO2: Malitson, JOSA 55, 1205 (1965), fused silica, for both BOX and cladding (approximation for thermal and
//   deposited oxide). Group index: engine first-order perturbation with eps_g = eps - (lambda/2) d eps / d lambda from the
//   same Sellmeier fits (material + waveguide dispersion).
// Mode quantities (engine definitions, vector-mode.mjs postProcess): n_eff; n_g; A_eff = (int |E|^2)^2 / int |E|^4 over
//   the window (E incl. E_z); LN fraction = Poynting power fraction in LN regions; TE fraction = int |E_x|^2 /
//   int (|E_x|^2 + |E_y|^2) (x lateral).
// Solve-time labels (stored in the logs) TE0 / TM0 / TE1 along each width line (w ascending): first width (or after a lost
//   track) by mirror-symmetry class
//   (class A: E_x even, E_y odd; class B: E_x odd, E_y even) and TE fraction: TE0 = highest class-A mode with TE
//   fraction >= 0.5, TE1 = highest class-B mode with TE fraction >= 0.5, TM0 = highest class-B mode with TE fraction < 0.5,
//   among modes above the cladding index that are bound (n_eff above the outer-slab index) or have >= 50 % of |E|^2
//   within |x| <= w_bottom/2 + lambda/4. Later widths: greedy assignment by the transverse-E overlap
//   |int E_t,prev . E_t| / (||E_t,prev|| ||E_t||) on a common grid (not by index order). TE1 and TM0 share class B, so
//   they anticross; the label follows the larger overlap. Overlap tracking can carry a label through a same-class
//   anticrossing onto the other polarization (TE0 -> TM1 at x-cut, t 900 nm, w 3 um), so assemble relabels.
// Assembled labels (relabelRecords, deterministic, from the stored per-mode summaries; no re-solve): among the candidate
//   modes (isCand), TE family = TE fraction > 0.5, TM family = the rest; within a family n_eff order (TE0 > TE1; TM0 =
//   highest TM-family mode). Width tracking is kept only for near-degenerate neighbours in a family (n_eff gap < DEG_N):
//   the pair is ordered by the stored overlap with the previous width's same-label mode. TRACK_LOW / REIDENTIFIED are
//   recomputed for the new labels from the stored overlaps; POL_RELABELED marks a label whose mode changed versus the
//   solve-time label; POL_HYBRID marks 0.3 < TE fraction < 0.7.
// License: GPL-3.0 (repository code license; the imported engine is GPL-3.0-or-later).
import { readFile, writeFile, appendFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, resolve, dirname } from 'node:path';
import os from 'node:os';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SELF = fileURLToPath(import.meta.url);

// ---- grid ------------------------------------------------------------------------------------------------------
// 7 x 5 x 10 x 3 x 3 x 2 = 6300 solves. Polarization is not a solve axis: one full-vector solve returns the TE- and
// TM-like families, so TE0, TM0 and TE1 come from the same solve. Width nodes are geometric (ratio 5^(1/9) = 1.196):
// n_eff - n_slab scales roughly as 1/w^2, so the curvature sits at small w (pilot study --study-width).
const T_NM = [300, 400, 500, 600, 700, 800, 900];
const ETCH = [0.2, 0.4, 0.6, 0.8, 1.0];
const W_UM = Array.from({ length: 10 }, (_, i) => +(0.6 * 5 ** (i / 9)).toFixed(4));
const SW_DEG = [60, 70, 80];
const LAM_UM = [0.775, 1.064, 1.55];
const CUTS = ['x', 'z'];
const MODE_LABELS = ['TE0', 'TM0', 'TE1'];
const HELDOUT_SEED = 20261025;
const HELDOUT_N = 126; // 2 % of 6300
const FLAG = { NOT_FOUND: 1, NOT_CONVERGED: 2, WINDOW_EDGE: 4, LEAKY: 8, TRACK_LOW: 16, REIDENTIFIED: 32, CROSS_LEAKY: 64, POL_RELABELED: 128, POL_HYBRID: 256 };
const DEG_N = 5e-4; // near-degenerate n_eff gap within a polarization family (relabel tie-break by width tracking)
const NUM_MODES = 8;
const LI2026AA = { t: 300, etch: 0.6, w: 3.5, sw: 60, lam: 1.55, cut: 'x' };

// ---- args ------------------------------------------------------------------------------------------------------
function parseArgs(argv) {
  const a = { engine: process.env.ATLAS_ENGINE_DIR ?? join(REPO, '..', 'eo-modulator-atlas', 'engine'), workers: 6, dryRun: false, tasks: new Set(), assemble: false, relabelOnly: false, limit: Infinity, meshScale: 1 };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--engine') a.engine = resolve(argv[++i]);
    else if (k === '--workers') a.workers = Math.max(1, Math.min(6, +argv[++i]));
    else if (k === '--dry-run') a.dryRun = true;
    else if (k === '--pilot') a.tasks.add('pilot');
    else if (k === '--study-width') a.tasks.add('study');
    else if (k === '--lattice') a.tasks.add('lattice');
    else if (k === '--heldout') a.tasks.add('heldout');
    else if (k === '--ref') a.tasks.add('ref');
    else if (k === '--assemble') a.assemble = true;
    else if (k === '--relabel-only') { a.relabelOnly = true; a.assemble = true; }
    else if (k === '--limit') a.limit = +argv[++i];
    else if (k === '--mesh-scale') a.meshScale = +argv[++i];
    else throw new Error(`unknown argument ${k}`);
  }
  if (a.relabelOnly && a.tasks.size) throw new Error('--relabel-only takes no solve task flags');
  if (!a.tasks.size && !a.assemble) { for (const t of ['ref', 'lattice', 'heldout']) a.tasks.add(t); a.assemble = true; }
  return a;
}

// ---- geometry / config -----------------------------------------------------------------------------------------
const r6 = (x) => +x.toFixed(6);
export function windowFor({ t, etch, w, sw, lam }) {
  const tu = t / 1000, te = tu * etch;
  const wb = w + (2 * te) / Math.tan((sw * Math.PI) / 180);
  return { x: r6(wb / 2 + 0.3 + 1.1 * lam), yLo: r6(-(0.25 + 1.1 * lam)), yHi: r6(tu + 0.25 + 1.1 * lam), wb };
}

/** Engine config text for one point. idx: optional {no, ne, ns} anchors (li2026aa reproduction); win: window override. */
function configText(p, { idx = null, win = null } = {}) {
  const tu = p.t / 1000, te = tu * p.etch, ts = r6(tu - te);
  const dx = te / Math.tan((p.sw * Math.PI) / 180);
  const W = win ?? windowFor(p);
  const X = r6(W.x + 6), Y = r6(Math.max(-W.yLo, W.yHi) + 6);
  const crystal = p.cut === 'x' ? '{cut: x, propagation: y}' : '{cut: z, propagation: x}';
  const ln = idx ? `\n    n_o: ${idx.no}\n    n_e: ${idx.ne}` : '';
  const sio2 = idx ? `{n: ${idx.ns}, eps_r: 3.9}` : '{eps_r: 3.9}';
  const rib = [[-(p.w / 2 + dx), ts], [p.w / 2 + dx, ts], [p.w / 2, tu], [-p.w / 2, tu]].map(([a, b]) => `[${r6(a)}, ${r6(b)}]`).join(', ');
  return `schema: eo-atlas.sim/v1
id: tfln-lattice
optics: {wavelength_nm: ${r6(p.lam * 1000)}, polarization: TE, mode_index: 0, group_index_from: perturbation, solver: vector}
materials:
  lithium_niobate:
    crystal: ${crystal}${ln}
    eps_r: {perp: 43.0, par: 28.0}
  silicon_dioxide: ${sio2}
  gold: {conductor: true}
geometry:
  symmetry: none
  domain: {x_um: [${-X}, ${X}], y_um: [${-Y}, ${Y}]}
  regions:
    - {name: sio2, material: silicon_dioxide, rect: {x_um: [${-X}, ${X}], y_um: [${-Y}, ${Y}]}}
${ts > 1e-9 ? `    - {name: ln_slab, material: lithium_niobate, rect: {x_um: [${-X}, ${X}], y_um: [0, ${ts}]}}\n` : ''}    - {name: ln_rib, material: lithium_niobate, polygon_um: [${rib}]}
  electrodes:
    - {name: dummy_s, role: signal, weight: 1.0, material: gold, rect: {x_um: [${r6(X - 3)}, ${r6(X - 2)}], y_um: [${r6(Y - 3)}, ${r6(Y - 2)}]}}
    - {name: dummy_g, role: ground, weight: 0.0, material: gold, rect: {x_um: [${r6(-X + 2)}, ${r6(-X + 3)}], y_um: [${r6(Y - 3)}, ${r6(Y - 2)}]}}
  optical_window: {x_um: [${-W.x}, ${W.x}], y_um: [${W.yLo}, ${W.yHi}]}
  mesh: {max_edge_um: 2.0}
`;
}

// ---- worker: solve ---------------------------------------------------------------------------------------------
let ENG = null;
async function loadEngine(dir) {
  if (ENG) return ENG;
  const u = (f) => pathToFileURL(join(dir, 'src', f)).href;
  const cfg = await import(u('config.mjs'));
  const vm = await import(u('vector-mode.mjs'));
  const mat = await import(u('materials.mjs'));
  const modes = await import(pathToFileURL(join(REPO, 'src/lib/physics/modes.ts')).href);
  ENG = { ...cfg, ...vm, libraryIndex: mat.libraryIndex, slabIndex: modes.slabIndex, lnLabEps: modes.lnLabEps };
  return ENG;
}

/** Outer-slab fundamental indices (TE, TM) and the cladding index from the library fits. */
function slabCutoffs(E, p, idx = null) {
  const no = idx?.no ?? E.libraryIndex('lithium_niobate', 'n_o', p.lam).n;
  const ne = idx?.ne ?? E.libraryIndex('lithium_niobate', 'n_e', p.lam).n;
  const nc = idx?.ns ?? E.libraryIndex('silicon_dioxide', 'n', p.lam).n;
  const d = (p.t / 1000) * (1 - p.etch);
  const eps = E.lnLabEps(p.cut, no, ne);
  if (d < 1e-9) return { nClad: nc, slabTE: nc, slabTM: nc, nMax: nc };
  const te = E.slabIndex({ d_um: d, lambda_um: p.lam, eps, n_clad: nc, pol: 'TE' });
  const tm = E.slabIndex({ d_um: d, lambda_um: p.lam, eps, n_clad: nc, pol: 'TM' });
  return { nClad: nc, slabTE: te, slabTM: tm, nMax: Math.max(te, tm) };
}

/** Rasterise per-triangle centroid E_x, E_y of every mode onto a regular grid {x0, y0, h, nx, ny}. */
function rasterise(model, modes, G) {
  const { mesh } = model;
  const nP = G.nx * G.ny;
  const out = modes.map(() => ({ ex: new Float32Array(nP), ey: new Float32Array(nP) }));
  const X = mesh.x, Y = mesh.y, T = mesh.tri;
  for (let t = 0; t < mesh.nTris; t++) {
    const a = T[3 * t], b = T[3 * t + 1], c = T[3 * t + 2];
    const ax = X[a], ay = Y[a], bx = X[b], by = Y[b], cx = X[c], cy = Y[c];
    const i0 = Math.max(0, Math.ceil((Math.min(ax, bx, cx) - G.x0) / G.h)), i1 = Math.min(G.nx - 1, Math.floor((Math.max(ax, bx, cx) - G.x0) / G.h));
    const j0 = Math.max(0, Math.ceil((Math.min(ay, by, cy) - G.y0) / G.h)), j1 = Math.min(G.ny - 1, Math.floor((Math.max(ay, by, cy) - G.y0) / G.h));
    if (i0 > i1 || j0 > j1) continue;
    const det = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
    if (det === 0) continue;
    for (let j = j0; j <= j1; j++) {
      const py = G.y0 + j * G.h;
      for (let i = i0; i <= i1; i++) {
        const px = G.x0 + i * G.h;
        const l1 = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / det;
        const l2 = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / det;
        if (l1 < -1e-12 || l2 < -1e-12 || l1 + l2 > 1 + 1e-12) continue;
        const k = j * G.nx + i;
        for (let m = 0; m < modes.length; m++) {
          out[m].ex[k] = modes[m].fields.ex[t];
          out[m].ey[k] = modes[m].fields.ey[t];
        }
      }
    }
  }
  return out;
}

/** Mirror-symmetry indicator (+1 class A, -1 class B) and core |E_t|^2 fraction of a rasterised mode. */
function symCore(F, G, xc) {
  let s = 0, n = 0, core = 0;
  for (let j = 0; j < G.ny; j++)
    for (let i = 0; i < G.nx; i++) {
      const k = j * G.nx + i, km = j * G.nx + (G.nx - 1 - i);
      const e2 = F.ex[k] * F.ex[k] + F.ey[k] * F.ey[k];
      s += F.ex[k] * F.ex[km] - F.ey[k] * F.ey[km];
      n += e2;
      if (Math.abs(G.x0 + i * G.h) <= xc) core += e2;
    }
  return { sym: n > 0 ? s / n : 0, core: n > 0 ? core / n : 0 };
}

function overlap(A, B) {
  let ab = 0, aa = 0, bb = 0;
  for (let k = 0; k < A.ex.length; k++) {
    ab += A.ex[k] * B.ex[k] + A.ey[k] * B.ey[k];
    aa += A.ex[k] * A.ex[k] + A.ey[k] * A.ey[k];
    bb += B.ex[k] * B.ex[k] + B.ey[k] * B.ey[k];
  }
  return aa > 0 && bb > 0 ? Math.abs(ab) / Math.sqrt(aa * bb) : 0;
}

/** Symmetric grid covering window W (x symmetric about 0). */
function gridFor(W, lam) {
  const h = Math.min(0.04, lam / 30);
  const nxh = Math.ceil(W.x / h);
  return { x0: -nxh * h, y0: W.yLo, h, nx: 2 * nxh + 1, ny: Math.floor((W.yHi - W.yLo) / h) + 1 };
}

/** One point: solve, summarise all modes, rasterise on grid G; one retry with 2x modes when a label is missing and
 *  could still be bound; one retry with an enlarged window when a bound labelled mode has > 1e-2 power at the edge. */
function solvePoint(E, p, { meshScale = 1, idx = null, win = null, G = null } = {}) {
  const t0 = performance.now();
  const cut = slabCutoffs(E, p, idx);
  const wb = windowFor(p).wb;
  let W = win ? { ...win } : windowFor(p);
  let nm = NUM_MODES, moreModes = false, expanded = false;
  for (;;) {
    const config = E.parseConfig(configText(p, { idx, win: W }));
    const section = E.crossSectionOf(config, 'geometry');
    const model = E.buildVectorModel(section, config.materials, { lambda0Um: p.lam, order: 2, metal: 'reject', meshScale });
    const grid = G ?? gridFor(W, p.lam);
    const res = E.solveVectorModes(model, p.lam, { numModes: nm });
    const F = rasterise(model, res.modes, grid);
    const xc = wb / 2 + p.lam / 4;
    const sum = res.modes.map((m, k) => {
      const sc = symCore(F[k], grid, xc);
      let ln = 0;
      for (const [r, c] of Object.entries(m.confinement)) if (r.startsWith('ln_')) ln += c.power;
      return { n: m.neff, ng: m.ng, a: m.effectiveAreaUm2, ln, te: m.teFraction, sym: sc.sym, core: sc.core, wm: m.windowMargin.powerFraction, res: m.residual };
    });
    const ids = identify(sum, cut);
    const missing = MODE_LABELS.filter((l) => ids[l] < 0);
    const lowest = Math.min(...sum.map((s) => s.n));
    const bar = Math.max(cut.nClad + 2e-3, Math.min(...missing.map((l) => (l === 'TM0' ? cut.slabTM : cut.slabTE))));
    if (missing.length && !moreModes && lowest > bar) { nm *= 2; moreModes = true; continue; }
    if (!expanded && !win) {
      // enlarge to 3.5 field decay lengths beyond the rib (lateral, own-polarization slab) and the film (vertical, SiO2)
      let x = W.x, yLo = W.yLo, yHi = W.yHi;
      for (const l of MODE_LABELS) {
        const k = ids[l];
        if (k < 0) continue;
        const s = sum[k], own = ownSlab(s, cut);
        if (!(s.wm > 1e-2) || s.n <= own || s.n <= cut.nClad) continue;
        const dx = p.lam / (2 * Math.PI * Math.sqrt(s.n * s.n - own * own)), dy = p.lam / (2 * Math.PI * Math.sqrt(s.n * s.n - cut.nClad * cut.nClad));
        x = Math.max(x, Math.min(wb / 2 + 3.5 * dx, wb / 2 + 12));
        yLo = Math.min(yLo, Math.max(-3.5 * dy, -8));
        yHi = Math.max(yHi, Math.min(p.t / 1000 + 3.5 * dy, p.t / 1000 + 8));
      }
      if (x > W.x * 1.02 || yLo < W.yLo * 1.02 || yHi > W.yHi * 1.02) { W = { x: r6(x), yLo: r6(yLo), yHi: r6(yHi) }; expanded = true; continue; }
    }
    const ms = performance.now() - t0;
    return { sum, F, grid, cut, res, model, ms, nm, expanded, W, converged: res.converged, warnings: res.warnings, dof: model.dof.n, tris: model.mesh.nTris };
  }
}

const ownSlab = (s, cut) => (s.te >= 0.5 ? cut.slabTE : cut.slabTM);
const isCand = (s, cut) => s.n > cut.nClad + 1e-4 && (s.n > ownSlab(s, cut) || s.core >= 0.5);
/** Fresh identification by symmetry class and TE fraction (indices into sum; -1 when absent). */
function identify(sum, cut, exclude = new Set()) {
  const pick = (f) => {
    let best = -1;
    sum.forEach((s, k) => { if (!exclude.has(k) && isCand(s, cut) && f(s) && (best < 0 || s.n > sum[best].n)) best = k; });
    return best;
  };
  return { TE0: pick((s) => s.te >= 0.5 && s.sym > 0), TM0: pick((s) => s.te < 0.5 && s.sym < 0), TE1: pick((s) => s.te >= 0.5 && s.sym < 0) };
}

function flagsFor(s, cut, solveConverged) {
  let f = 0;
  if (!solveConverged || !(s.res < 1e-6)) f |= FLAG.NOT_CONVERGED;
  if (s.wm > 1e-2) f |= FLAG.WINDOW_EDGE;
  if (s.n < ownSlab(s, cut) || s.n < cut.nClad) f |= FLAG.LEAKY;
  else if (s.n < cut.nMax) f |= FLAG.CROSS_LEAKY;
  if (s.te > 0.3 && s.te < 0.7) f |= FLAG.POL_HYBRID;
  return f;
}

const compact = (s) => ({ n: +s.n.toFixed(7), ng: +s.ng.toFixed(6), a: +s.a.toPrecision(5), ln: +s.ln.toFixed(5), te: +s.te.toFixed(5), sym: +s.sym.toFixed(3), core: +s.core.toFixed(3), wm: +s.wm.toPrecision(3), res: +s.res.toPrecision(3) });

function labelled(sum, ids, cut, converged, extra = {}) {
  const out = {};
  for (const l of MODE_LABELS) {
    const k = ids[l];
    if (k < 0) { out[l] = { k: -1, flags: FLAG.NOT_FOUND | (extra[l] ?? 0) }; continue; }
    out[l] = { k, ...compact(sum[k]), flags: flagsFor(sum[k], cut, converged) | (extra[l] ?? 0) };
  }
  return out;
}

/** Polarization-family labels (assembled rule): candidates split by TE fraction > 0.5, n_eff order within a family.
 *  track(label, k): stored overlap of mode k with the previous width's same-label mode (null when unknown); used only to
 *  order near-degenerate neighbours (n_eff gap < DEG_N). Returns indices into sum (-1 absent) and the tie-breaks used. */
export function polarIds(sum, cut, track = null) {
  const cand = sum.map((_, k) => k).filter((k) => isCand(sum[k], cut));
  const byN = (a, b) => sum[b].n - sum[a].n || a - b;
  const fam = { TE: cand.filter((k) => sum[k].te > 0.5).sort(byN), TM: cand.filter((k) => !(sum[k].te > 0.5)).sort(byN) };
  const ids = { TE0: -1, TM0: -1, TE1: -1 };
  let swaps = 0;
  for (const [F, labels] of [['TE', ['TE0', 'TE1']], ['TM', ['TM0']]]) {
    const L = fam[F];
    labels.forEach((l, i) => {
      if (i >= L.length) return;
      if (track && i + 1 < L.length && sum[L[i]].n - sum[L[i + 1]].n < DEG_N) {
        const o0 = track(l, L[i]), o1 = track(l, L[i + 1]);
        if (o0 != null && o1 != null && o1 > o0) { [L[i], L[i + 1]] = [L[i + 1], L[i]]; swaps++; }
      }
      ids[l] = L[i];
    });
  }
  return { ids, swaps };
}

const cutOf = (c) => ({ nClad: c.clad, slabTE: c.te, slabTM: c.tm, nMax: Math.max(c.te, c.tm) });

/** Stored overlap between mode kPrev of the previous width and mode kCur (null when kPrev was not a solve-time label). */
function storedOverlap(prevPt, pt, kPrev, kCur) {
  if (!prevPt || kPrev < 0 || kCur < 0) return null;
  for (const l of MODE_LABELS) if (prevPt.modes[l].k === kPrev && pt.overlaps?.[l]) return pt.overlaps[l][kCur];
  return null;
}

/** Unchanged label: keep the solve-time solver flags (computed from unrounded values; the stored summaries are rounded). */
const SOLVE_FLAGS = FLAG.NOT_CONVERGED | FLAG.WINDOW_EDGE | FLAG.LEAKY | FLAG.CROSS_LEAKY;
function keepSolveFlags(modes, old) {
  for (const l of MODE_LABELS) if (modes[l].k >= 0 && modes[l].k === old[l].k) modes[l].flags = (modes[l].flags & ~SOLVE_FLAGS) | (old[l].flags & SOLVE_FLAGS);
  return modes;
}

/** Relabel every logged lattice line and point solve in place (polarIds); returns per-group counts. */
export function relabelRecords(recs) {
  const st = { nodes: 0, nodesRelabeled: 0, labelsRelabeled: Object.fromEntries(MODE_LABELS.map((l) => [l, 0])), hybrid: Object.fromEntries(MODE_LABELS.map((l) => [l, 0])), degSwaps: 0, overlapUnknown: 0, byGroup: {}, points: { n: 0, relabeled: 0 } };
  const relabelFlag = (old, k) => (old.k !== k ? FLAG.POL_RELABELED : 0);
  for (const [key, r] of recs) {
    if (r.kind === 'line') {
      const [, cut, lam, , t] = key.split(':');
      const g = `${cut}:${lam}:${t}`;
      st.byGroup[g] ??= { nodes: 0, relabeled: 0 };
      let prevPt = null, prevIds = null;
      for (const pt of r.result.points) {
        const C = cutOf(pt.cut);
        const track = prevPt ? (l, k) => storedOverlap(prevPt, pt, prevIds[l], k) : null;
        const { ids, swaps } = polarIds(pt.all, C, track);
        st.degSwaps += swaps;
        const extra = {};
        let changed = false;
        for (const l of MODE_LABELS) {
          let f = relabelFlag(pt.modes[l], ids[l]);
          if (f) { changed = true; st.labelsRelabeled[l]++; }
          if (prevPt && prevIds[l] >= 0 && ids[l] >= 0) {
            const o = storedOverlap(prevPt, pt, prevIds[l], ids[l]);
            if (o == null) { st.overlapUnknown++; f |= FLAG.TRACK_LOW; }
            else if (o < 0.5) f |= FLAG.REIDENTIFIED;
            else if (o < 0.9) f |= FLAG.TRACK_LOW;
          }
          extra[l] = f;
        }
        const modes = keepSolveFlags(labelled(pt.all, ids, C, pt.conv, extra), pt.modes);
        for (const l of MODE_LABELS) if (modes[l].flags & FLAG.POL_HYBRID) st.hybrid[l]++;
        st.nodes++; st.byGroup[g].nodes++;
        if (changed) { st.nodesRelabeled++; st.byGroup[g].relabeled++; }
        prevPt = { modes: pt.modes }; // solve-time labels (the stored overlaps refer to them)
        prevIds = ids;
        pt.modes = modes;
      }
    } else if (r.result?.all) {
      const C = cutOf(r.result.cut);
      const { ids } = polarIds(r.result.all, C);
      const extra = Object.fromEntries(MODE_LABELS.map((l) => [l, relabelFlag(r.result.modes[l], ids[l])]));
      st.points.n++;
      if (MODE_LABELS.some((l) => extra[l])) st.points.relabeled++;
      r.result.modes = keepSolveFlags(labelled(r.result.all, ids, C, r.result.conv, extra), r.result.modes);
    }
  }
  return st;
}

/** A width line: solve w ascending, track labels by overlap. */
function solveLine(E, base, meshScale) {
  const Wmax = windowFor({ ...base, w: W_UM[W_UM.length - 1] });
  const G = gridFor({ ...Wmax, x: Wmax.x + 3 }, base.lam); // margin for enlarged windows
  const points = [];
  let prev = null;
  for (const w of W_UM) {
    const p = { ...base, w };
    const r = solvePoint(E, p, { meshScale, G });
    let ids, extra = {}, ov = null, lab = {};
    if (!prev) ids = identify(r.sum, r.cut);
    else {
      // overlap matrix previous-labelled x current modes; greedy assignment, highest overlap first
      ov = {};
      const pairs = [];
      for (const l of MODE_LABELS) {
        if (prev.ids[l] < 0) continue;
        const A = prev.F[prev.ids[l]];
        ov[l] = r.F.map((B) => +overlap(A, B).toFixed(4));
        ov[l].forEach((o, k) => pairs.push({ l, k, o }));
      }
      pairs.sort((a, b) => b.o - a.o);
      ids = { TE0: -1, TM0: -1, TE1: -1 };
      const used = new Set();
      for (const { l, k, o } of pairs) {
        if (ids[l] >= 0 || used.has(k) || o < 0.5) continue;
        ids[l] = k; used.add(k); lab[l] = o;
        if (o < 0.9) extra[l] = FLAG.TRACK_LOW;
      }
      const fresh = identify(r.sum, r.cut, used);
      for (const l of MODE_LABELS) {
        if (ids[l] >= 0) continue;
        if (fresh[l] >= 0 && !used.has(fresh[l])) { ids[l] = fresh[l]; used.add(fresh[l]); if (prev.ids[l] >= 0) extra[l] = FLAG.REIDENTIFIED; }
      }
    }
    points.push({ w, ms: Math.round(r.ms), nm: r.nm, dof: r.dof, win: r.expanded ? r.W : undefined, conv: r.converged, warn: r.warnings.slice(0, 3), cut: { te: +r.cut.slabTE.toFixed(6), tm: +r.cut.slabTM.toFixed(6), clad: +r.cut.nClad.toFixed(6) },
      modes: labelled(r.sum, ids, r.cut, r.converged, extra), trackOverlap: prev ? lab : null, all: r.sum.map(compact), overlaps: ov });
    prev = { ids, F: r.F };
  }
  return points;
}

/** Direct single-point solve with the lattice settings (tests and held-out checks): labelled TE0 / TM0 / TE1 summaries. */
export async function directSolve(engineDir, p, { idx = null, win = null, meshScale = 1 } = {}) {
  const E = await loadEngine(engineDir);
  const r = solvePoint(E, p, { meshScale, idx, win });
  return { modes: labelled(r.sum, polarIds(r.sum, r.cut).ids, r.cut, r.converged), dof: r.dof, ms: Math.round(r.ms) };
}

async function runWorker() {
  const { engine, meshScale } = workerData;
  const E = await loadEngine(engine);
  parentPort.on('message', (task) => {
    const t0 = Date.now();
    try {
      let result;
      if (task.kind === 'line') result = { points: solveLine(E, task.p, meshScale) };
      else {
        const r = solvePoint(E, task.p, { meshScale: task.meshScale ?? meshScale, idx: task.idx ?? null, win: task.win ?? null });
        const ids = identify(r.sum, r.cut);
        result = { ms: Math.round(r.ms), nm: r.nm, dof: r.dof, tris: r.tris, win: r.expanded ? r.W : undefined, conv: r.converged, warn: r.warnings.slice(0, 3),
          cut: { te: +r.cut.slabTE.toFixed(6), tm: +r.cut.slabTM.toFixed(6), clad: +r.cut.nClad.toFixed(6) }, modes: labelled(r.sum, ids, r.cut, r.converged), all: r.sum.map(compact) };
      }
      parentPort.postMessage({ key: task.key, ok: true, result, wall_ms: Date.now() - t0, rss_mb: Math.round(process.memoryUsage().rss / 2 ** 20) });
    } catch (e) {
      parentPort.postMessage({ key: task.key, ok: false, error: String(e?.stack ?? e).slice(0, 2000), wall_ms: Date.now() - t0, rss_mb: Math.round(process.memoryUsage().rss / 2 ** 20) });
    }
  });
}

// ---- main: tasks -----------------------------------------------------------------------------------------------
async function seededRng(seed) {
  const { createRng } = await import(pathToFileURL(join(REPO, 'src/lib/physics/prng.ts')).href);
  return createRng(seed);
}

export async function heldoutPoints() {
  const rng = await seededRng(HELDOUT_SEED);
  return Array.from({ length: HELDOUT_N }, () => ({
    t: +rng.uniform(300, 900).toFixed(2), etch: +rng.uniform(0.2, 1.0).toFixed(4), w: +rng.uniform(0.6, 3.0).toFixed(4),
    sw: +rng.uniform(60, 80).toFixed(3), lam: LAM_UM[rng.int(3)], cut: CUTS[rng.int(2)],
  }));
}

const PILOT = [
  [300, 0.2, 0.6, 60, 1.55, 'x'], [300, 1.0, 3.0, 80, 0.775, 'z'], [900, 0.2, 3.0, 60, 0.775, 'x'], [900, 1.0, 0.6, 80, 1.55, 'z'],
  [600, 0.6, 1.2, 70, 1.064, 'x'], [600, 0.6, 1.2, 70, 1.064, 'z'], [300, 0.6, 1.6, 60, 1.55, 'x'], [500, 0.4, 2.0, 70, 1.55, 'z'],
  [700, 0.8, 0.9, 60, 0.775, 'x'], [400, 1.0, 1.0, 70, 1.064, 'x'], [800, 0.2, 1.5, 80, 1.064, 'z'], [900, 0.6, 2.5, 60, 1.55, 'x'],
  [300, 0.4, 3.0, 80, 1.064, 'z'], [600, 1.0, 2.0, 60, 0.775, 'z'], [500, 0.2, 0.6, 70, 0.775, 'x'], [700, 0.4, 1.8, 80, 1.55, 'x'],
  [400, 0.8, 2.6, 60, 0.775, 'z'], [800, 0.6, 0.7, 70, 1.55, 'z'], [600, 0.3, 1.0, 60, 1.55, 'x'], [900, 0.8, 1.3, 70, 1.064, 'x'],
].map(([t, etch, w, sw, lam, cut]) => ({ t, etch, w, sw, lam, cut }));

async function buildTasks(a) {
  const tasks = [];
  if (a.tasks.has('ref')) {
    tasks.push({ key: 'R:li2026aa-lib', kind: 'point', p: LI2026AA });
    tasks.push({ key: 'R:li2026aa-cfg', kind: 'point', p: LI2026AA, idx: { no: 2.211, ne: 2.138, ns: 1.444 }, win: { x: 2.9, yLo: -1.5, yHi: 2.0 } });
  }
  if (a.tasks.has('pilot')) {
    PILOT.forEach((p, i) => tasks.push({ key: `P:${i}`, kind: 'point', p }));
    [0, 4, 9, 12].forEach((i) => tasks.push({ key: `P:${i}:ms0.7`, kind: 'point', p: PILOT[i], meshScale: 0.7 }));
  }
  if (a.tasks.has('study')) {
    const dense = Array.from({ length: 25 }, (_, i) => +(0.6 + 0.1 * i).toFixed(2));
    for (const [cut, lam] of [['x', 1.55], ['z', 1.55], ['x', 0.775], ['z', 0.775]])
      for (const w of dense) tasks.push({ key: `S:${cut}:${lam}:${w}`, kind: 'point', p: { t: 600, etch: 0.5, w, sw: 70, lam, cut } });
  }
  if (a.tasks.has('lattice'))
    for (const cut of CUTS) for (const lam of LAM_UM) for (const sw of SW_DEG) for (const t of T_NM) for (const etch of ETCH)
      tasks.push({ key: `L:${cut}:${lam}:${sw}:${t}:${etch}`, kind: 'line', p: { t, etch, sw, lam, cut }, solves: W_UM.length });
  if (a.tasks.has('heldout')) (await heldoutPoints()).forEach((p, i) => tasks.push({ key: `H:${i}`, kind: 'point', p }));
  return tasks;
}

async function readLogs() {
  const dir = join(REPO, 'logs');
  const recs = new Map();
  if (!existsSync(dir)) return recs;
  const files = (await readdir(dir)).filter((f) => /^tfln-modes-.*\.jsonl$/.test(f)).sort();
  for (const f of files)
    for (const line of (await readFile(join(dir, f), 'utf8')).split('\n')) {
      if (!line.trim()) continue;
      try { const r = JSON.parse(line); if (r.type === 'task' && r.ok) recs.set(r.key, r); } catch { /* partial last line of an interrupted run */ }
    }
  return recs;
}

function engineCommit(dir) {
  try {
    const git = join(dir, '..', '.git');
    const head = readFileSync(join(git, 'HEAD'), 'utf8').trim();
    if (!head.startsWith('ref: ')) return head;
    const ref = head.slice(5);
    if (existsSync(join(git, ref))) return readFileSync(join(git, ref), 'utf8').trim();
    const packed = readFileSync(join(git, 'packed-refs'), 'utf8').split('\n').find((l) => l.endsWith(` ${ref}`));
    return packed ? packed.split(' ')[0] : null;
  } catch { return null; }
}

async function runTasks(a, todo, logPath) {
  const ts = () => new Date().toISOString();
  const log = (obj) => appendFile(logPath, JSON.stringify({ ts: ts(), ...obj }) + '\n');
  await log({ type: 'start', n: todo.length, solves: todo.reduce((s, t) => s + (t.solves ?? 1), 0), workers: a.workers, meshScale: a.meshScale, engineCommit: engineCommit(a.engine) });
  const queue = [...todo];
  let done = 0, failed = 0, solvesDone = 0;
  const totalSolves = todo.reduce((s, t) => s + (t.solves ?? 1), 0);
  const t0 = Date.now();
  const spawn = () => new Worker(SELF, { workerData: { engine: a.engine, meshScale: a.meshScale }, resourceLimits: { maxOldGenerationSizeMb: 2048 } });
  await new Promise((resolveAll) => {
    let active = 0;
    const next = (w) => {
      const task = queue.shift();
      if (!task) { w.terminate(); if (--active === 0) resolveAll(); return; }
      w.once('message', async (m) => {
        done++; solvesDone += task.solves ?? 1;
        if (!m.ok) failed++;
        await log({ type: 'task', key: task.key, kind: task.kind, p: task.p, ok: m.ok, wall_ms: m.wall_ms, rss_mb: m.rss_mb, ...(m.ok ? { result: m.result } : { error: m.error }), ...(task.meshScale ? { meshScale: task.meshScale } : {}), ...(task.idx ? { idx: task.idx, win: task.win } : {}) });
        const el = (Date.now() - t0) / 1000, rate = solvesDone / el;
        console.log(`${ts()} ${done}/${todo.length} ${task.key} ${m.ok ? 'ok' : 'FAIL'} ${(m.wall_ms / 1000).toFixed(1)}s rss ${m.rss_mb}MB | solves ${solvesDone}/${totalSolves} ${rate.toFixed(2)}/s eta ${((totalSolves - solvesDone) / Math.max(rate, 1e-9) / 60).toFixed(1)} min`);
        if (!m.ok) console.log(m.error.split('\n')[0]);
        if (m.rss_mb > 3500) { w.terminate(); const nw = spawn(); next(nw); } else next(w);
      });
      w.postMessage(task);
    };
    const n = Math.min(a.workers, queue.length);
    if (!n) return resolveAll();
    for (let i = 0; i < n; i++) { active++; next(spawn()); }
  });
  await log({ type: 'end', done, failed, wall_s: Math.round((Date.now() - t0) / 1000) });
  return { done, failed };
}

// ---- assemble --------------------------------------------------------------------------------------------------
const rnd = (v, d) => (v == null || !Number.isFinite(v) ? null : +v.toFixed(d));
async function assemble(a) {
  const recs = await readLogs();
  const relabel = relabelRecords(recs);
  const out = join(REPO, 'static/data/tfln-modes/lattice.json');
  // --relabel-only: no engine checkout needed; keep the engine description and commit of the solves from lattice.meta
  const prevMeta = a.relabelOnly ? JSON.parse(await readFile(out, 'utf8')).meta : null;
  const M = await import(pathToFileURL(join(REPO, 'src/lib/physics/modes.ts')).href);
  const N = CUTS.length * LAM_UM.length * SW_DEG.length * T_NM.length * ETCH.length * W_UM.length;
  const modes = Object.fromEntries(MODE_LABELS.map((l) => [l, { n_eff: [], n_g: [], a_eff_um2: [], ln_fraction: [], te_fraction: [], flags: [] }]));
  let missingLines = 0, solveMs = 0, nSolves = 0;
  for (const cut of CUTS) for (const lam of LAM_UM) for (const sw of SW_DEG) for (const t of T_NM) for (const etch of ETCH) {
    const r = recs.get(`L:${cut}:${lam}:${sw}:${t}:${etch}`);
    if (!r) missingLines++;
    for (let iw = 0; iw < W_UM.length; iw++) {
      const pt = r?.result.points[iw];
      if (pt) { solveMs += pt.ms; nSolves++; }
      for (const l of MODE_LABELS) {
        const m = pt?.modes[l];
        const D = modes[l];
        const ok = m && m.k >= 0;
        D.n_eff.push(ok ? rnd(m.n, 5) : null);
        D.n_g.push(ok ? rnd(m.ng, 4) : null);
        D.a_eff_um2.push(ok ? rnd(m.a, 3) : null);
        D.ln_fraction.push(ok ? rnd(m.ln, 3) : null);
        D.te_fraction.push(ok ? rnd(m.te, 3) : null);
        D.flags.push(m ? m.flags : FLAG.NOT_FOUND);
      }
    }
  }
  if (modes.TE0.n_eff.length !== N) throw new Error('assemble: size mismatch');
  const flagCounts = Object.fromEntries(MODE_LABELS.map((l) => [l, Object.fromEntries(Object.entries(FLAG).map(([k, b]) => [k, modes[l].flags.filter((f) => f & b).length]))]));
  const lattice = {
    meta: {
      title: 'TFLN rib waveguide mode lattice (F2-15)',
      status: 'derived',
      engine: prevMeta?.engine ?? 'eo-modulator-atlas engine (github.com/jwt625/eo-modulator-atlas, engine/, GPL-3.0-or-later): full-vector FEM, Nedelec/Lagrange order 2, auto window mesh (meshScale ' + a.meshScale + '), shift-invert block Arnoldi',
      engine_commit: prevMeta ? prevMeta.engine_commit : engineCommit(a.engine),
      generator: 'scripts/precompute_tfln_modes.mjs',
      created: new Date().toISOString().slice(0, 10),
      stack: 'LN film (thickness t) on SiO2 BOX, SiO2 cladding over the whole cross-section (rib embedded); window holds LN and SiO2 only (no Si substrate: substrate leakage not modelled; no electrodes)',
      orientation: { x: 'x-cut, propagation along crystal y; lab x (lateral) = crystal z, so TE sees n_e', z: 'z-cut, propagation along crystal x; lab y (normal) = crystal z, so TM sees n_e' },
      geometry: 'rib top width w; etch depth t * etch; sidewall angle from horizontal (bottom width w + 2 t etch / tan(angle)); slab t (1 - etch) outside the rib, none at etch = 1',
      materials: {
        LN: 'Zelmon, Small, Jundt, JOSA B 14, 3319 (1997), doi:10.1364/JOSAB.14.003319, congruent LN, 21 C, Sellmeier (engine library, refractiveindex.info transcription; identical coefficients to data/dispersion/zelmon1997.yaml); status P-db',
        SiO2: 'Malitson, JOSA 55, 1205 (1965), doi:10.1364/JOSA.55.001205, fused silica, used for BOX and cladding (approximation for thermal / deposited oxide); status P-db',
      },
      window: 'x in +-(w_bottom/2 + 0.3 + 1.1 lambda) um, y in [-(0.25 + 1.1 lambda), t + 0.25 + 1.1 lambda] um, PEC (zero tangential E) on the window edge; enlarged once to 3.5 field decay lengths (lateral: own-polarization slab index; vertical: SiO2) when a bound labelled mode has > 1e-2 of its power within 10 % of the edge',
      definitions: {
        n_eff: 'effective index', n_g: 'group index, engine first-order perturbation incl. material dispersion of both Sellmeier fits',
        a_eff_um2: '(int |E|^2 dA)^2 / int |E|^4 dA over the window, E incl. E_z (engine effectiveAreaUm2)',
        ln_fraction: 'Poynting power fraction in LN (slab + rib)', te_fraction: 'int |E_x|^2 / int (|E_x|^2 + |E_y|^2), x lateral',
      },
      tracking: 'labels by dominant polarization, assembled from the stored per-mode summaries (no re-solve): among candidate modes (above the cladding index + 1e-4, and bound or >= 50 % of |E_t|^2 within |x| <= w_bottom/2 + lambda/4), TE family = TE fraction > 0.5, TM family = the rest; within a family n_eff order (TE0 above TE1; TM0 = highest TM-family mode). Width tracking (transverse-E overlap with the previous width, w ascending) only orders near-degenerate neighbours in a family (n_eff gap < ' + DEG_N + ') and sets TRACK_LOW / REIDENTIFIED. Solve-time labels (overlap tracking from a symmetry-class seed) are kept in the logs; POL_RELABELED marks where they differ',
      flags: { ...FLAG, legend: 'NOT_CONVERGED: eigen residual >= 1e-6; WINDOW_EDGE: power within 10 % of the window edge > 1e-2 after one window enlargement; LEAKY: n_eff below the outer-slab fundamental index of the mode\'s own dominant polarization (symmetric anisotropic slab, modes.ts slabIndex) or below the cladding index (not bound); CROSS_LEAKY: bound, but below the other polarization\'s slab index (lateral leakage by polarization conversion possible; in the closed window such modes can mix with slab box modes); TRACK_LOW: overlap with the previous width\'s same-label mode 0.5-0.9, or not available in the stored overlaps; REIDENTIFIED: that overlap < 0.5 (the label moves to another mode between widths); POL_RELABELED: label assigned to a different mode than the solve-time overlap tracking (provenance; values are those of the relabelled mode); POL_HYBRID: 0.3 < TE fraction < 0.7, strongly hybrid, TE / TM label ambiguous' },
      grid_note: '7 x 5 x 10 x 3 x 3 x 2 = 6300 solves; polarization is not a solve axis (one full-vector solve gives TE and TM families); width nodes geometric 0.6 * 5^(i/9) um',
      rounding: 'n_eff 1e-5, n_g 1e-4, A_eff 1e-3 um^2, fractions 1e-3',
      solves: nSolves, missing_lines: missingLines, mean_solve_s: nSolves ? +(solveMs / nSolves / 1000).toFixed(3) : null,
      flag_counts: flagCounts,
      relabel: { created: new Date().toISOString().slice(0, 10), nodes: relabel.nodes, nodes_relabeled: relabel.nodesRelabeled, labels_relabeled: relabel.labelsRelabeled, pol_hybrid: relabel.hybrid, near_degenerate_swaps: relabel.degSwaps, track_overlap_unknown: relabel.overlapUnknown, point_solves: relabel.points, nodes_relabeled_by_cut_lambda_t: Object.fromEntries(Object.entries(relabel.byGroup).filter(([, v]) => v.relabeled).map(([k, v]) => [k, v.relabeled])) },
    },
    axes: { t_nm: T_NM, etch: ETCH, w_um: W_UM, sidewall_deg: SW_DEG, lambda_um: LAM_UM, cut: CUTS },
    order: ['cut', 'lambda_um', 'sidewall_deg', 't_nm', 'etch', 'w_um'],
    modes,
  };
  // reference solves (li2026aa)
  const ref = {};
  for (const k of ['R:li2026aa-lib', 'R:li2026aa-cfg']) {
    const r = recs.get(k);
    if (r) ref[k.slice(2)] = { p: r.p, ...(r.idx ? { indices: r.idx, window: r.win } : {}), TE0: { n_eff: r.result.modes.TE0.n, n_g: r.result.modes.TE0.ng, flags: r.result.modes.TE0.flags }, dof: r.result.dof };
  }
  lattice.meta.reference = { note: 'li2026aa geometry (300 nm film, 180 nm etch, 3.5 um top width, 60 deg, x-cut TE0, 1550 nm). lib: lattice stack and window with library indices; cfg: sims/li2026aa/config.yaml indices (n_o 2.211, n_e 2.138, SiO2 1.444, library slopes) and optical window. Engine value of the li2026aa eo_overlap arm A: n_eff 1.7695566, n_g 2.1351030 (static/data/eo-overlap-li2026aa.json). w = 3.5 um lies outside the lattice width axis.', ...ref };
  // held-out errors
  const L = M.createModeLattice(lattice);
  const held = [];
  for (let i = 0; i < HELDOUT_N; i++) {
    const r = recs.get(`H:${i}`);
    if (!r) continue;
    const p = r.p;
    const row = { i, p, modes: {} };
    for (const l of MODE_LABELS) {
      const d = r.result.modes[l];
      const q = L.query({ t: p.t, etch: p.etch, w: p.w, sidewall: p.sw, lambda: p.lam, cut: p.cut, pol: l });
      row.modes[l] = { direct: d.k >= 0 ? { n_eff: d.n, n_g: d.ng, a_eff_um2: d.a, ln_fraction: d.ln, te_fraction: d.te, flags: d.flags } : null,
        lattice: { n_eff: rnd(q.n_eff, 6), n_g: rnd(q.n_g, 5), te_fraction: rnd(q.te_fraction, 4), valid: q.validity.valid, tracked: q.validity.tracked, hybrid: q.validity.hybrid } };
    }
    held.push(row);
  }
  lattice.meta.heldout = { seed: HELDOUT_SEED, n: held.length, sampling: 'uniform t 300-900 nm, etch 0.2-1.0, w 0.6-3.0 um, sidewall 60-80 deg; lambda and cut uniform over the grid values (prng.ts xorshift128)', labels: 'direct solves relabelled with the lattice rule (polarization family, n_eff order; no width tracking for single points)', clean: 'query valid, tracked, not hybrid (interpolated TE fraction 0.1-0.9 or POL_HYBRID at a node); direct solve without LEAKY / WINDOW_EDGE / NOT_CONVERGED and TE fraction > 0.9 or < 0.1; flagged = comparable minus clean', stats: heldoutStats(held) };
  lattice.heldout = held.map((h) => ({ p: h.p, modes: Object.fromEntries(MODE_LABELS.map((l) => [l, h.modes[l].direct ? { n_eff: rnd(h.modes[l].direct.n_eff, 6), n_g: rnd(h.modes[l].direct.n_g, 5), te_fraction: rnd(h.modes[l].direct.te_fraction, 4), flags: h.modes[l].direct.flags } : null])) }));
  await mkdir(dirname(out), { recursive: true });
  const text = JSON.stringify(lattice);
  await writeFile(out, text);
  console.log(JSON.stringify({ out: 'static/data/tfln-modes/lattice.json', bytes: text.length, solves: nSolves, missingLines, flagCounts, relabel: lattice.meta.relabel, reference: lattice.meta.reference, heldout: lattice.meta.heldout.stats }, null, 1));
}

/** Held-out |error| statistics per mode and quantity: all comparable points, the clean subset, and the flagged rest. */
export function heldoutStats(held) {
  const q = (arr, p) => { if (!arr.length) return null; const s = [...arr].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * (s.length - 1) + 0.5))]; };
  const S = {};
  for (const l of MODE_LABELS) {
    const all = { n_eff: [], n_g: [] }, clean = { n_eff: [], n_g: [] }, flagged = { n_eff: [], n_g: [] };
    let comparable = 0, cleanN = 0;
    for (const h of held) {
      const m = h.modes[l];
      if (!m.direct || m.lattice.n_eff == null) continue;
      comparable++;
      const dn = Math.abs(m.direct.n_eff - m.lattice.n_eff), dg = Math.abs(m.direct.n_g - m.lattice.n_g);
      all.n_eff.push(dn); all.n_g.push(dg);
      const isClean = m.lattice.valid && m.lattice.tracked && !m.lattice.hybrid && (m.direct.flags & (FLAG.LEAKY | FLAG.WINDOW_EDGE | FLAG.NOT_CONVERGED)) === 0 && (m.direct.te_fraction > 0.9 || m.direct.te_fraction < 0.1);
      if (isClean) { cleanN++; clean.n_eff.push(dn); clean.n_g.push(dg); } else { flagged.n_eff.push(dn); flagged.n_g.push(dg); }
    }
    const st = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { median: rnd(q(v, 0.5), 6), p95: rnd(q(v, 0.95), 6), max: rnd(v.length ? Math.max(...v) : null, 6) }]));
    S[l] = { comparable, clean: cleanN, flagged: comparable - cleanN, all: st(all), clean_stats: st(clean), flagged_stats: st(flagged) };
  }
  return S;
}

// ---- entry -----------------------------------------------------------------------------------------------------
async function main() {
  const a = parseArgs(process.argv.slice(2));
  if (a.relabelOnly) return assemble(a);
  if (!existsSync(join(a.engine, 'src', 'vector-mode.mjs'))) throw new Error(`engine not found at ${a.engine} (set --engine or ATLAS_ENGINE_DIR)`);
  const all = (await buildTasks(a)).slice(0, a.limit);
  const recs = await readLogs();
  const todo = all.filter((t) => !recs.has(t.key));
  const solves = todo.reduce((s, t) => s + (t.solves ?? 1), 0);
  console.log(`grid: t ${T_NM.join(',')} nm | etch ${ETCH.join(',')} | w ${W_UM.join(',')} um | sw ${SW_DEG.join(',')} deg | lambda ${LAM_UM.join(',')} um | cut ${CUTS.join(',')}`);
  console.log(`tasks ${all.length}, done ${all.length - todo.length}, remaining ${todo.length} (${solves} solves), workers ${a.workers}, cpus ${os.cpus().length}`);
  const prev = [...recs.values()].filter((r) => r.kind === 'line');
  if (prev.length) {
    const ms = prev.flatMap((r) => r.result.points.map((p) => p.ms));
    const mean = ms.reduce((x, y) => x + y, 0) / ms.length / 1000;
    console.log(`measured mean solve ${mean.toFixed(2)} s (from ${ms.length} lattice solves); estimate ${(solves * mean / a.workers / 60).toFixed(1)} min with ${a.workers} workers (ideal scaling)`);
  }
  if (a.dryRun) return;
  if (todo.length) {
    await mkdir(join(REPO, 'logs'), { recursive: true });
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
    const logPath = join(REPO, 'logs', `tfln-modes-${stamp}.jsonl`);
    console.log(`log: logs/tfln-modes-${stamp}.jsonl`);
    await runTasks(a, todo, logPath);
  }
  if (a.assemble) await assemble(a);
}

if (isMainThread) {
  if (process.argv[1] && resolve(process.argv[1]) === SELF) main().catch((e) => { console.error(e); process.exit(1); });
} else runWorker();
