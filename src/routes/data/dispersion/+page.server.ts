// /data/dispersion/: dispersion models of the data API, plotted from their coefficients; errata, caveats, check values.
import type { PageMeta } from "$lib/content/site";
import DISP from "$lib/generated/dispersion.json";
import { cite, stripNotes, replaceKeys } from "$lib/figures/p09/sources.server";

const clean = (t: string): string => replaceKeys(stripNotes(t));
import { dispSVG, nAt, readRows, type DModel } from "$lib/figures/p09/disp";
import { disp } from "$lib/stores/p09";

interface Raw { id: string; name: string; axis: "o" | "e"; variant: string; formula: { form: string }; coefficients: Record<string, number>; valid_lambda_um: [number, number]; valid_T_C?: [number, number] | null; reference_T_C: number; temperature_dependent?: boolean; errata?: DModel["errata"]; caveats?: string[]; check_values?: DModel["checks"]; provenance: { source_id: string; status: string; locator?: string } }

export const load = () => {
  const meta: Partial<PageMeta> = {
    title: "Dispersion Models",
    description: "Sellmeier dispersion models of lithium niobate (Zelmon 1997, Gayer 2008): n(lambda) from the stored coefficients, validity windows, errata, check values.",
    keys: ["P", "P-db", "derived"], qpm: 1.55,
  };
  const order = (r: Raw): number => (r.id.startsWith("zelmon1997-cln") ? 0 : r.id.startsWith("zelmon") ? 1 : 2);
  const models: DModel[] = (DISP as unknown as Raw[]).slice().sort((a, b) => order(a) - order(b) || a.id.localeCompare(b.id)).map((r) => {
    const c = cite(r.provenance.source_id);
    return { id: r.id, name: r.name, axis: r.axis, variant: r.variant, status: r.provenance.status, form: r.formula.form, coefficients: r.coefficients, valid_lambda_um: r.valid_lambda_um, valid_T_C: r.valid_T_C ?? null, reference_T_C: r.reference_T_C, tdep: !!r.temperature_dependent, errata: (r.errata ?? []).map((e) => ({ ...e, effect: e.effect ? clean(e.effect) : e.effect })), caveats: (r.caveats ?? []).map(clean), checks: r.check_values ?? [], src: c.text, doi: c.doi, locator: clean(r.provenance.locator ?? "") };
  });
  const checks = models.flatMap((m) => m.checks.map((k) => {
    const T = m.tdep ? k.T_C : m.reference_T_C;
    const n = nAt(m, k.lambda_nm / 1000, T);
    return { model: m.name, lam: k.lambda_nm, T: k.T_C, Tused: T, stored: k.n, computed: n, diff: n - k.n, tol: k.tolerance, ok: Math.abs(n - k.n) <= k.tolerance, source: clean(k.source) || "computed from these coefficients" };
  }));
  return { meta, models: models.map((m) => ({ ...m, checks: [] })), checks, init: { svg: dispSVG(models, disp.on, disp.T, disp.lam, disp.log), rows: readRows(models, disp.T, disp.lam) } };
};
