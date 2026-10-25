// Section 3.5 IDTs and SAW filters: meta, references, cut velocities for Fig. 3.6 (partial-wave solver, kushibiki1999).
import type { PageMeta } from "$lib/content/site";
import { sectionData } from "$lib/figures/sound/content.server";
import { sawTables } from "$lib/figures/sound/sawtables.server";
import type { IdtCut } from "$lib/figures/sound/types";

const REFS = ["white1965", "white1965-erl", "spencer1965", "smith1969", "hashimoto2000", "p05", "smm-ln-lt", "soitec-poi", "eenews-2020-soitec-qualcomm", "plessky2019", "murata-2022", "mwj-2018-filters", "kushibiki1999"];

export const load = async () => {
  const meta: Partial<PageMeta> = {
    title: "IDTs and SAW filters",
    description: "Chapter 3.5: interdigital transducers on lithium niobate: synchronous frequency f0 = v/p, array factor and bandwidth 2/N, LN vs LT in phone filters, POI substrates and XBAR.",
    keys: ["P", "S", "V", "reported", "derived", "template"],
  };
  const c = sawTables().cuts;
  const cuts: IdtCut[] = [
    { id: "128", label: "128° Y-X", open: c[1].vf, short: c[1].vm },
    { id: "YZ", label: "Y-Z", open: c[0].vf, short: c[0].vm },
    { id: "64", label: "64° Y-X leaky", open: c[5].vf, short: c[5].vm },
    { id: "41", label: "41° Y-X leaky", open: c[6].vf, short: c[6].vm },
  ];
  return { meta, cuts, ...(await sectionData(REFS)) };
};
