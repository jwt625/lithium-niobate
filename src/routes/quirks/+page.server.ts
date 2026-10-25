import type { PageMeta } from "$lib/content/site";

export const load = () => {
  const meta: Partial<PageMeta> = {
    title: "Quirks",
    description: "Lithium niobate, chapter 04: photorefraction, damage-resistant doping, GRIIRA, damage thresholds, pyroelectricity, DC bias drift, thermal effects, lithium out-diffusion, fabrication pitfalls.",
    keys: [],
  };
  return { meta };
};
