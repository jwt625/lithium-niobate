// Section 3.2 Elastic constants and bulk waves: shell meta, references, popups.
import type { PageMeta } from "$lib/content/site";
import { sectionData } from "$lib/figures/sound/content.server";

const REFS = ["kushibiki1999", "ogi2002", "weis1985", "smithwelsh1971", "warner1967", "volk2008", "ieee176", "jaeken2016", "bond1943", "andrushchak2009"];

export const load = async () => {
  const meta: Partial<PageMeta> = {
    title: "Elastic constants and bulk waves",
    description: "Chapter 3.2: elastic stiffness of lithium niobate from four sources, the Christoffel equation with piezoelectric stiffening, slowness surfaces and computed vs measured bulk velocities.",
    keys: ["P", "P-comp", "S", "derived"],
  };
  return { meta, ...(await sectionData(REFS)) };
};
