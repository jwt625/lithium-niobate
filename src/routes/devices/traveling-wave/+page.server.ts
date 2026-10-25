// 6.2 Traveling-wave design: manuscript text, F6.04 response model with atlas presets, A2 velocity-matching map.
import { buildSection, meta, atlas, stamp, lab, labelOf } from "$lib/figures/devices/server";
import { TW_DEFAULT, twArt, twOuts, twPlot, twPresets } from "$lib/figures/devices/f604";
import { chartA2, ptsA2 } from "$lib/figures/devices/charts";

export const load = async () => {
  const presets = twPresets(atlas.devices).map((p) => ({ ...p, lb: labelOf(p.id) })), a2 = lab(ptsA2(atlas.devices));
  const b = await buildSection("6.2", ["alferness1982", "chung1991"], [], ["derived", "reported"]);
  return {
    meta: meta("6.2", "Traveling-wave design", "Chapter 6.2: traveling-wave electrodes on lithium niobate modulators; velocity mismatch, RF loss and impedance in an interactive EO response model with atlas presets.", b.keys),
    b, stamp: stamp(),
    f604: { presets, init: { plT: twPlot(TW_DEFAULT, presets, 1100, 280, "tech"), plV: twPlot(TW_DEFAULT, presets, 760, 360, "visual"), art: twArt(TW_DEFAULT, 1200, 260), outs: twOuts(TW_DEFAULT) } },
    a2: { pts: a2, init: { T: chartA2(a2, "", 1100, 360, "tech"), V: chartA2(a2, "", 1200, 480, "visual") } },
  };
};
