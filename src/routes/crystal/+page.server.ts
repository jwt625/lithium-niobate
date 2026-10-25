// 01 Crystal chapter landing: shell overrides and the source / term / conflict popups used on the page.
import { popsFor, refsFor } from "$lib/figures/crystal/sources.server";
import type { PageMeta } from "$lib/content/site";
import page from "./+page.svelte?raw";

export const load = async () => {
  const meta: Partial<PageMeta> = {
    title: "01 Crystal",
    description: "Lithium niobate as a crystal: R3c structure, origin of the spontaneous polarization, Curie and melting temperatures, congruent and stoichiometric composition, intrinsic defects and dopants, point-group 3m tensor forms, domains, poling and domain walls, in ten sourced sections.",
    keys: ["P", "P-comp", "P-db", "reported", "derived", "template"],
    aside: "bias",
    qpm: 1.064,
  };
  return { meta, pops: await popsFor(page), refs: await refsFor(page) };
};
