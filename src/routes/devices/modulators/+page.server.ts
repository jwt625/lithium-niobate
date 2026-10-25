// 6.1 Electro-optic modulators: manuscript text, F6.02 bench, F6.03 V_pi L calculator with A3, F6.07 ring with A7.
// Default-state SVG and readouts computed here so the prerendered page shows final values.
import { buildSection, meta, atlas, stamp, lab, labelOf } from "$lib/figures/devices/server";
import { BENCH_DEFAULT, benchDevices, benchOuts, benchTF } from "$lib/figures/devices/f602";
import { CALC_DEFAULT, calcOuts, crossSection } from "$lib/figures/devices/f603";
import { RING_DEFAULT, ringArt, ringOuts, ringPlot } from "$lib/figures/devices/f607";
import { chartA3, chartA7, ptsA3, ptsA7 } from "$lib/figures/devices/charts";

export const load = async () => {
  const b = await buildSection("6.1", ["weis1985", "zelmon1997"], ["li2026aa-d", "wang2018-rt-q50k"], ["template", "derived", "reported", "P-comp", "P-db"]);
  const a3 = lab(ptsA3(atlas.devices)), a7 = lab(ptsA7(atlas.devices));
  return {
    meta: meta("6.1", "Electro-optic modulators", "Chapter 6.1: Mach-Zehnder, IQ and ring modulators on lithium niobate; transfer function, V_pi L from the cross-section, atlas implied overlap, resonator speed limit.", b.keys),
    b,
    stamp: stamp(),
    f602: { devs: benchDevices(atlas.devices).map((d) => ({ ...d, lb: labelOf(d.id) })), init: { tfT: benchTF(BENCH_DEFAULT, 560, 260, "tech"), tfV: benchTF(BENCH_DEFAULT, 620, 300, "visual"), outs: benchOuts(BENCH_DEFAULT) } },
    f603: { pts: a3, init: { xsT: crossSection(CALC_DEFAULT, 560, 280, "tech"), xsV: crossSection(CALC_DEFAULT, 720, 340, "visual"), a3T: chartA3(a3, CALC_DEFAULT, 560, 280, "tech"), a3V: chartA3(a3, CALC_DEFAULT, 1200, 360, "visual"), outs: calcOuts(CALC_DEFAULT) } },
    f607: { pts: a7, init: { trT: ringPlot(RING_DEFAULT, 560, 260, "tech"), trV: ringPlot(RING_DEFAULT, 620, 300, "visual"), a7T: chartA7(a7, RING_DEFAULT.QL, 560, 260, "tech"), a7V: chartA7(a7, RING_DEFAULT.QL, 620, 300, "visual"), art: ringArt(RING_DEFAULT, 720, 300), outs: ringOuts(RING_DEFAULT) } },
  };
};
