// 1.4 Composition: popups, reference list, derived table values and the prerendered state of FIG-01-03 (Composition dial),
// all computed with src/lib/physics/composition.ts through the cp figure builders.
import { sectionData } from "$lib/figures/crystal/sources.server";
import { liNbRatio, defectFractions, tcIyi, tcBordui, uvEdge } from "$lib/physics/composition.ts";
import { asciiAxis, svgAxis } from "$lib/figures/crystal/cpaxis";
import { dialReadouts, asciiFields, asciiUv, svgTile, svgUv, tileCounts } from "$lib/figures/crystal/cpmodel";
import { comp } from "$lib/stores/crystal";
import page from "./+page.svelte?raw";

export const load = async () => {
  const { c, model } = { c: comp.c, model: comp.model };
  const ro = dialReadouts(c, model), F = asciiFields(c, model);
  ro.count = F.count;
  ro.vcount = tileCounts(c, model);
  const f45 = defectFractions(48.45);
  return {
    ...(await sectionData({
      title: "1.4 Composition: congruent and stoichiometric",
      description: "Lithium niobate between congruent (about 48.4-48.5 mol% Li2O) and stoichiometric (50 mol%): [Li]/[Nb], antisite and vacancy fractions in two defect models, Curie temperature fits, UV absorption edge, coercive and internal field anchors, growth routes, with an interactive composition dial.",
      keys: ["P", "P-comp", "V", "derived"],
    }, page)),
    init: {
      ro,
      ascii: { ax: asciiAxis({ c }), uv: asciiUv(c), li: F.li, nb: F.nb },
      svg: { ax: svgAxis(960, { c }, "cpd"), uv: svgUv(960, c, "cpu"), li: svgTile(c, model, "li"), nb: svgTile(c, model, "nb") },
    },
    num: {
      r1_4845: liNbRatio(48.45).toFixed(3),
      r1_969: (0.969 / (1 + 0.969)).toFixed(4),
      dTc: `${(tcIyi(50) - tcIyi(48.45)).toFixed(1)} / ${(tcBordui(50) - tcBordui(48.45)).toFixed(1)}`,
      dUv: (uvEdge(48.45).lambda_nm - uvEdge(50).lambda_nm).toFixed(1),
      vac45: (100 * (f45.VLi + f45.NbLi)).toFixed(2),
      uv: [48.38, 49.0, 49.5, 50.0].map((x) => ({ c: x.toFixed(2), l20: uvEdge(x, 20).lambda_nm.toFixed(1), l15: uvEdge(x, 15).lambda_nm.toFixed(1) })),
    },
  };
};
