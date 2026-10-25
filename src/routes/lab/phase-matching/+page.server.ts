// F2 full screen: default-state readouts and plots computed at prerender (hydration reuses identical strings).
import type { PageMeta } from "$lib/content/site";
import { computePM, pmRows, rowsHTML, statusLine } from "$lib/figures/p09/pm";
import { benchSVG, plotsInit } from "$lib/figures/p09/pmview";
import { PM_DEFAULT } from "$lib/stores/p09";

export const load = () => {
  const meta: Partial<PageMeta> = {
    title: "Phase Matching",
    description: "Quasi-phase-matching calculator for lithium niobate: SHG, SFG, DFG and OPO periods, coherence length, acceptance bandwidths and tuning curves from Sellmeier models with errata.",
    keys: ["P", "P-db", "S", "derived"],
    qpm: 1.55,
  };
  const s = { ...PM_DEFAULT };
  const r = computePM(s);
  return { meta, init: { rows: rowsHTML(pmRows(r, s)), status: statusLine(r), ...plotsInit(r), bench: benchSVG(r, s), period: r.period.toFixed(2), lc: r.lc.toFixed(2), fwhm: r.fwhmL.toFixed(3), l3: (r.l3 * 1000).toFixed(1) } };
};
