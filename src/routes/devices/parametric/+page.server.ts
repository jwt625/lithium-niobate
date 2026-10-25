// 6.5 OPA and OPO: manuscript text and F6.09 OPO threshold.
import { buildSection, meta, refCards } from "$lib/figures/devices/server";
import { OPO_DEFAULT, opoArt, opoOuts, opoPlot } from "$lib/figures/devices/f609";

export const load = async () => {
  const b = await buildSection("6.5", ["lu2020optica", "gao2021njp", "lu2021optica", "mckenna2022"], [], ["reported", "derived", "template"]);
  return {
    meta: meta("6.5", "Optical parametric amplifiers and oscillators", "Chapter 6.5: parametric gain and oscillation in thin-film lithium niobate; OPO threshold model and reported microwatt thresholds.", b.keys),
    b, hov: await refCards({ "opo-devs": ["gao2021njp", "lu2021optica", "mckenna2022"] }, { "opo-devs": "Reported on-chip thresholds: 19.6 µW (PLACE microdisk), about 30 µW (ring), tens of µW (ring SHG + OPO)." }),
    f609: { plT: opoPlot(OPO_DEFAULT, 1100, 280, "tech"), plV: opoPlot(OPO_DEFAULT, 1200, 360, "visual"), art: opoArt(OPO_DEFAULT, 720, 300), outs: opoOuts(OPO_DEFAULT) },
  };
};
