// 1.6 Dopants: popups, reference list, and the default state of FIG-01-05 (Threshold explorer) rendered at prerender with
// the same pure renderers the browser uses (src/lib/figures/crystal/th.ts), so hydration reuses identical strings.
import { sectionData } from "$lib/figures/crystal/sources.server";
import { renderAll, DEFAULT } from "$lib/figures/crystal/th";
import page from "./+page.svelte?raw";
import thData from "$lib/figures/crystal/th-data.ts?raw";

export const load = async () => ({
  ...(await sectionData({
    title: "1.6 Dopants",
    description: "Dopants in lithium niobate: damage-resistance thresholds of MgO, ZnO, In2O3, Sc2O3, HfO2 and ZrO2 in congruent, Li-rich-melt and near-stoichiometric crystal, the Mg site-occupancy scheme, the OH-band step, and Fe, Ti, Er, Cr sites, with an interactive threshold figure.",
    keys: ["P", "P-comp", "derived", "template"],
  }, page, thData)),
  init: renderAll(DEFAULT),
});
