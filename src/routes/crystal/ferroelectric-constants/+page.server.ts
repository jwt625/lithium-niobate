// 1.3 Ferroelectric constants: popups, reference list, the T_c fit table and the prerendered state of the temperature axis,
// computed with src/lib/physics/composition.ts through the cp figure builders.
import { sectionData } from "$lib/figures/crystal/sources.server";
import { tcIyi, tcBordui } from "$lib/physics/composition.ts";
import { asciiAxis, svgAxis } from "$lib/figures/crystal/cpaxis";
import { axisReadouts } from "$lib/figures/crystal/cpmodel";
import { comp } from "$lib/stores/crystal";
import page from "./+page.svelte?raw";

export const load = async () => {
  const { c, tcIn } = comp;
  return {
    ...(await sectionData({
      title: "1.3 Ferroelectric constants",
      description: "Lithium niobate spontaneous polarization (0.71 to 0.80 C/m2, sources disagree), Curie temperature 1140 C congruent and 1206 C near-stoichiometric, melting point 1255 C, and the Curie temperature as a composition gauge from two linear fits.",
      keys: ["P", "P-comp", "V", "derived"],
    }, page)),
    init: {
      ro: axisReadouts(c, tcIn),
      cv: c.toFixed(2),
      tv: tcIn.toFixed(1),
      ascii: asciiAxis({ c, tcIn }),
      svg: svgAxis(960, { c, tcIn }, "cpa"),
    },
    fits: [48.38, 48.45, 49.0, 50.0].map((x) => ({ c: x.toFixed(2), iyi: tcIyi(x).toFixed(1), bordui: tcBordui(x).toFixed(1) })),
    gap: 1255 - 1140,
  };
};
