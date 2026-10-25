// export_eo_overlap.mjs
// Purpose: run the eo-modulator-atlas engine on one device config (stage eo_overlap) and export the solved
//   electro-optic overlap on a regular grid for the lithium-niobate.com chapter 2.2 page
//   (mockup/data/eo-overlap-li2026aa.json): optical E_x of arm A (V/m at 1 W), static field per terminal volt
//   (E_x, E_y in V/m per V), the d n_eff/dV integrand per area (1/(V m^2), total and r33-only, as base64 Float32,
//   row-major from the top row), engine globals, surface integrals by Pockels coefficient, and the geometry polygons.
// Usage: node scripts/export_eo_overlap.mjs <path-to-eo-modulator-atlas/engine> <config.yaml> vector <out.json>
//   e.g. node scripts/export_eo_overlap.mjs ../eo-modulator-atlas/engine ../eo-modulator-atlas/sims/li2026aa/config.yaml vector mockup/data/eo-overlap-li2026aa.json
// Engine source: github.com/jwt625/eo-modulator-atlas (engine/, GPL-3.0-or-later). Sign and normalization conventions
//   are documented in engine/src/eo-overlap.mjs (FROZEN CONVENTIONS) and engine/src/postproc/eo-analysis.mjs (EO_FORMULAS).
// The grid window, geometry block and measured values below are specific to sims/li2026aa/config.yaml.
// License: GPL-3.0 (repository code license; the imported engine is GPL-3.0-or-later).
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const [engineDir, cfgPath, solver, outPath] = process.argv.slice(2);
const { runCrossSection } = await import(pathToFileURL(join(engineDir, 'src/run.mjs')).href);
const { createSolutionStore, evaluateAtPoints, evaluateDerived } = await import(pathToFileURL(join(engineDir, 'src/postproc/index.mjs')).href);

const text = await readFile(cfgPath, 'utf8');
const t0 = performance.now();
const result = runCrossSection(text, { stages: ['eo_overlap'], solver, keep: true });
const tRun = performance.now() - t0;
const store = createSolutionStore(result);

// grid over the arm A window region (um)
const X0 = -3.6, X1 = 3.6, Y0 = -0.9, Y1 = 1.5, DX = 0.03;
const nx = Math.round((X1 - X0) / DX) + 1, ny = Math.round((Y1 - Y0) / DX) + 1;
const xs = [], ys = [];
for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { xs.push(X0 + i * DX); ys.push(Y1 - j * DX); }

const field = (dataset, expr) => {
  const r = evaluateAtPoints(store, { dataset, expr, x: xs, y: ys });
  const f = Float32Array.from(r.values, (v) => (Number.isFinite(v) ? v : NaN));
  return { unit: r.siUnit, f32: Buffer.from(f.buffer).toString('base64') };
};
const out = {
  meta: {
    source: 'eo-modulator-atlas engine (GPL-3.0-or-later), sims/li2026aa/config.yaml',
    device: 'li2026aa-d: Li 2026, 9 mm TFLN MZM on silicon, plain G-S-G CPW, push-pull arms, 1550 nm',
    solver, run_ms: Math.round(tRun), grid: { x0: X0, y1: Y1, dx: DX, nx, ny, unit: 'um' },
    exported: new Date().toISOString().slice(0, 10),
  },
  metrics: result.metrics,
  fields: {
    optEx: field('armA', 'armA.Ex'),
    esEx: field('es', 'es.Ex'),
    esEy: field('es', 'es.Ey'),
    integrand: field('eoA', 'eoA.integrand'),
    integrand_r33: field('eoA', 'eoA.integrand_r33'),
  },
  regionNames: result.internals?.es?.regionNames ?? null,
};
const g = {};
for (const name of ['dneffA', 'dneffB', 'GammaA', 'EbarA', 'gapA', 'VpiL', 'VpiLtextbook', 'balance', 'armA.neff', 'armA.ng']) {
  try { const r = evaluateDerived(store, { kind: 'global', dataset: 'eoA', expr: name }); g[name] = { value: r.value ?? r.values?.[0], unit: r.siUnit ?? r.unit }; } catch (e) { g[name] = String(e.message).slice(0, 120); }
}
out.globals = g;
const ints = {};
for (const e of ['eoA.integrand', 'eoA.integrand_r33', 'eoA.integrand_r13', 'eoA.integrand_r22', 'eoA.integrand_r51', 'eoA.integrand_other']) {
  try { const r = evaluateDerived(store, { kind: 'surface_int', dataset: 'eoA', expr: e }); ints[e] = { value: r.value ?? r.values?.[0], unit: r.siUnit ?? r.unit }; } catch (err) { ints[e] = String(err.message).slice(0, 120); }
}
out.surfaceIntegrals = ints;
out.geometry = {
  note: 'from sims/li2026aa/config.yaml (um): LN slab y 0-0.12; rib trapezoid; Au electrodes 1.0 um thick on the slab; SiO2 cladding to y 2.3; BOX to y -4.7',
  ln_slab: [[-3.6, 0], [3.6, 0], [3.6, 0.12], [-3.6, 0.12]],
  ln_rib: [[-1.85392, 0.12], [1.85392, 0.12], [1.75, 0.3], [-1.75, 0.3]],
  signal: [[-3.6, 0.12], [-3, 0.12], [-3, 1.12], [-3.6, 1.12]],
  ground: [[3, 0.12], [3.6, 0.12], [3.6, 1.12], [3, 1.12]],
  r_pm_per_v: { r13: 8.6, r22: 3.4, r33: 30.8, r51: 28.0, note: 'engine library lithium_niobate_congruent, clamped' }, n_e: 2.138, n_o: 2.211, lambda_um: 1.55, length_mm: 9,
  measured: { vpi_l_dc_vcm: 2.61, vpi_dc_v: 2.90, locator: 'devices.csv row li2026aa-d; paper p.5 Fig. 3(b)' },
};
await writeFile(outPath, JSON.stringify(out));
console.log(JSON.stringify({ ints, globals: g, run_ms: Math.round(tRun), nx, ny, metrics: result.metrics, regionNames: out.regionNames }, null, 1));
