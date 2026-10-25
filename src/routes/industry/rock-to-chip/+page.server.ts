// 8.1 Rock to chip: value chain (F8.01), node facts, niobium per wafer (F8.11). Atlas count computed from the pinned subset.
import type { PageMeta } from "$lib/content/site";
import { ATLAS_DATA } from "$lib/figures/industry/server";
import { b4 } from "$lib/figures/industry/atlas";

export const load = () => {
  const meta: Partial<PageMeta> = {
    title: "Rock to Chip",
    description: "Chapter 8.1: the lithium niobate value chain from Brazilian niobium ore to data-center modulators, with graded facts per step and a niobium-per-wafer calculator.",
    keys: ["P", "V", "derived", "template"],
  };
  const w = b4(ATLAS_DATA);
  return { meta, atlasFact: { t: `Of ${w.stated} TFLN/TFLT papers in the atlas that state a wafer supplier, ${w.nanoln} name NanoLN`, g: "derived", r: "i8-atlas" } };
};
