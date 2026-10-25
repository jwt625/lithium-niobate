// 6.4 Frequency converters: manuscript text and F6.08 SHG converter.
import { buildSection, meta, refCards } from "$lib/figures/devices/server";
import { SHG_DEFAULT, shgArt, shgOuts, shgPlot } from "$lib/figures/devices/f608";

export const load = async () => {
  const b = await buildSection("6.4", ["wang2018optica", "li2024apn", "chen2024nn", "zelmon1997"], [], ["reported", "derived", "P-db"]);
  return {
    meta: meta("6.4", "Frequency converters: PPLN SHG, SFG, DFG", "Chapter 6.4: periodically poled thin-film lithium niobate frequency converters; undepleted and depleted SHG, poling period, reported efficiencies.", b.keys),
    b, hov: await refCards({ chen2024nn: ["chen2024nn"] }, { chen2024nn: "&gt; 80% conversion at 20 mW pump; overall efficiency near 10<sup>4</sup> %/W (drawn as a lower bound on P<sub>2&omega;</sub>)." }),
    f608: { plT: shgPlot(SHG_DEFAULT, 1100, 280, "tech"), plV: shgPlot(SHG_DEFAULT, 760, 360, "visual"), art: shgArt(SHG_DEFAULT, 1200, 240), outs: shgOuts(SHG_DEFAULT) },
  };
};
