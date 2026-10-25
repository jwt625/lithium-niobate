// Section 3.3 Surface and guided waves: meta, references, SAW field presets (Fig. 3.5) and the cut tables, all computed
// at prerender with src/lib/physics/saw.ts.
import type { PageMeta } from "$lib/content/site";
import { sectionData } from "$lib/figures/sound/content.server";
import { anatomyPresets } from "$lib/figures/sound/anatomy.server";
import { sawTables } from "$lib/figures/sound/sawtables.server";

const REFS = ["rayleigh1885", "campbell1968", "ingebrigtsen1969", "yamanouchi1972", "kushibiki1999", "ogi2002", "warner1967", "weis1985", "fomos-ln", "p09", "plessky2019", "smithwelsh1971", "volk2008"];

export const load = async () => {
  const meta: Partial<PageMeta> = {
    title: "Surface and guided waves",
    description: "Chapter 3.3: Rayleigh and leaky surface acoustic waves on lithium niobate from a partial-wave solver: fields vs depth, standard cuts, coupling, losses, constant-set sensitivity; guided waves in thin films.",
    keys: ["P", "P-comp", "S", "V", "reported", "derived"],
  };
  return { meta, presets: anatomyPresets(), tables: sawTables(), ...(await sectionData(REFS)) };
};
