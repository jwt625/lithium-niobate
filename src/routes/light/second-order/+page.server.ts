// Chapter 2.3 Second-order nonlinear optics: shell overrides, server-computed default markup of every figure (both
// variants), recomputed tables, and the page's popups and reference list (refs.yaml / glossary.yaml keys found in this
// page and its figure modules).
import type { PageMeta } from "$lib/content/site";
import { lightContent } from "$lib/figures/light/content.server";
import { init6 } from "$lib/figures/light/f23-dtensor";
import { init7, tables7, fmt7 } from "$lib/figures/light/f23-pm";
import { init8, fmt8 } from "$lib/figures/light/f23-shg";
import { init9, fmt9 } from "$lib/figures/light/f23-ledger";
import { nE } from "$lib/figures/light/f23-common";
import { etaNormSHG, etaToPercentPerWcm2 } from "$lib/physics/coupledmode.ts";
import { qpmDeffFactor } from "$lib/physics/phasematching.ts";

const RAW = import.meta.glob(["./+page.svelte", "/src/lib/figures/light/f23-*.ts"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;

/** Eq. 2.13 example over the d33 spread (1550 nm, A_eff = 1 um^2 template, bulk Zelmon indices). */
function etaSpread(): { d33: string; deff: string; eta: string }[] {
  return [34, 42, 27.0, 25.2].map((d) => {
    const deff = qpmDeffFactor(1, 0.5) * d;
    const eta = etaToPercentPerWcm2(etaNormSHG({ deff_pm_per_V: deff, n1: nE(1.55), n2: nE(0.775), lam1_um: 1.55, Aeff_um2: 1 }));
    return { d33: d.toFixed(1), deff: deff.toFixed(1), eta: Math.round(eta).toString() };
  });
}

export const load = async () => {
  const meta: Partial<PageMeta> = {
    title: "Second-order Nonlinear Optics",
    description: "Chapter 2.3: second-order nonlinear optics in lithium niobate: the 3m d tensor, birefringent and quasi-phase matching, acceptance bandwidths, SHG growth along the crystal, and measured efficiencies with their normalizations.",
    keys: ["P-comp", "P-db", "S", "U", "reported", "derived", "template"],
    aside: "bias",
  };
  const content = await lightContent(Object.values(RAW));
  return {
    meta,
    init: { f6: init6(), f7: init7(), t7: tables7(), f8: init8(), f9: init9(), eta: etaSpread(), fmt7, fmt8, fmt9 },
    content,
  };
};
