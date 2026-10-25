// Build-time precompute for F3.4 (cut-angle explorer): rotated Y-X sweep, (YXl) theta = 0..180 deg at 0.5 deg, Rayleigh
// and leaky branches, free and metallized surfaces, for three constant sets. Run with Node (type stripping):
//   node src/lib/figures/sound/gen-saw-sweep.ts
// Output: static/data/sound/saw-sweep.json (fetched by /sound/cuts/ after mount; read by its server load for the
// prerendered default state). Solver: src/lib/physics/saw.ts (partial waves, Campbell and Jones 1968).
// Constant sets (as in src/lib/physics/saw.test.ts and content/chapters/03-sound/manuscript.md sec. 3.3 L3):
//   kushibiki1999: c^E, e, eps^S, rho 4642.8 (P)
//   ogi2002: c^E, e, rho 4636 (P) with kushibiki1999 eps^S (blended sensitivity case; ogi2002 reports no eps^S)
//   warner1967: c^E (weis1985 Table 6, P-comp), e (ogi2002 Table III, S), eps^S 44.3/27.9 (weis1985 Table 1, P-comp),
//               rho 4700 assumed (C03)
import { readFileSync, writeFileSync } from "node:fs";
import { sawSweepRotY, SAW_DEFAULT_MATERIAL } from "../../physics/saw.ts";
import { acousticMaterial } from "../../physics/acoustics.ts";
import type { AcousticMaterial } from "../../physics/acoustics.ts";
import { c3m, e3m, eps3m } from "../../physics/tensors.ts";

const gen = (f: string) => JSON.parse(readFileSync(new URL(`../../generated/${f}`, import.meta.url), "utf8"));
const TENSORS = gen("tensors.json") as { id: string; independent: Record<string, { value: number }> }[];
const ind = (id: string): Record<string, number> => {
  const r = TENSORS.find((x) => x.id === id);
  if (!r) throw new Error(`missing tensor ${id}`);
  return Object.fromEntries(Object.entries(r.independent).map(([k, v]) => [k, v.value]));
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const A = (o: Record<string, number>) => o as any;

const SETS: [string, AcousticMaterial][] = [
  ["kushibiki1999", SAW_DEFAULT_MATERIAL],
  ["ogi2002", acousticMaterial(c3m(A(ind("elastic-stiffness-cE/unspecified/ogi2002"))), e3m(A(ind("piezo-stress-e/unspecified/ogi2002"))), eps3m(A(ind("permittivity-S/cln/kushibiki1999"))), 4636)],
  ["warner1967", acousticMaterial(c3m(A(ind("elastic-stiffness-cE/unspecified/weis1985-warner1967"))), e3m(A(ind("piezo-stress-e/unspecified/ogi2002-warner1967"))), eps3m(A(ind("permittivity-S/unspecified/weis1985-warner1967"))), 4700)],
];

const only = process.argv[2];
const thetas: number[] = [];
for (let i = 0; i <= 360; i++) thetas.push(i * 0.5);
const r1 = (v: number, d: number): number | null => (Number.isFinite(v) ? Math.round(v * 10 ** d) / 10 ** d : null);
const p3 = (v: number): number | null => (Number.isFinite(v) ? +v.toPrecision(3) : null);
const st = (s: string): string => (s === "root" ? "r" : s === "threshold-pinned" ? "p" : "n");

const out: Record<string, unknown> = {
  generated: new Date().toISOString().slice(0, 10),
  method: "src/lib/physics/saw.ts sawSweepRotY: partial-wave method, (YXl) theta, X propagation; k2 = 2 (v_free - v_met) / v_free; status r = isolated root, p = threshold-pinned (window edge), n = none",
  theta_deg: thetas,
  sets: {} as Record<string, unknown>,
};
for (const [name, m] of SETS) {
  if (only && only !== name) continue;
  const t0 = Date.now();
  const rows = sawSweepRotY(m, thetas);
  const pick = (f: (r: (typeof rows)[number]) => number, d: number) => rows.map((r) => r1(f(r), d));
  (out.sets as Record<string, unknown>)[name] = {
    thresholds_mps: rows[0].rayleigh.thresholds.map((v) => r1(v, 2)),
    ray: {
      vf: pick((r) => (r.rayleigh.free.status === "root" ? r.rayleigh.free.v : NaN), 2),
      vm: pick((r) => (r.rayleigh.met.status === "root" ? r.rayleigh.met.v : NaN), 2),
      k2: pick((r) => r.rayleigh.k2, 6),
    },
    lsaw: {
      vf: pick((r) => (r.leaky.free.status !== "none" ? r.leaky.free.v : NaN), 2),
      vm: pick((r) => (r.leaky.met.status !== "none" ? r.leaky.met.v : NaN), 2),
      k2: pick((r) => r.leaky.k2, 6),
      sf: rows.map((r) => st(r.leaky.free.status)),
      sm: rows.map((r) => st(r.leaky.met.status)),
      lf: rows.map((r) => p3(r.leaky.free.status === "root" ? r.leaky.free.loss_dB_per_lambda : NaN)),
      lm: rows.map((r) => p3(r.leaky.met.status === "root" ? r.leaky.met.loss_dB_per_lambda : NaN)),
    },
  };
  console.log(`${name}: ${rows.length} angles in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
const path = new URL(`../../../../static/data/sound/saw-sweep${only ? `-${only}` : ""}.json`, import.meta.url);
writeFileSync(path, JSON.stringify(out));
console.log(`wrote ${path.pathname}`);
