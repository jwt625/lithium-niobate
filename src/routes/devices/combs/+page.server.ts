// 6.6 Combs and frequency shifters: manuscript text and F6.10 resonant EO comb.
import { buildSection, meta, refCards } from "$lib/figures/devices/server";
import { COMB_DEFAULT, combArt, combOuts, combPlot } from "$lib/figures/devices/f610";

export const load = async () => {
  const b = await buildSection("6.6", ["zhang2019nat"], [], ["reported", "derived", "template"]);
  return {
    meta: meta("6.6", "Frequency combs and frequency shifters", "Chapter 6.6: electro-optic and Kerr frequency combs and frequency shifters in lithium niobate, with a resonant EO comb model.", b.keys),
    b, hov: await refCards({ zhang2019nat: ["zhang2019nat"] }, { zhang2019nat: "&gt; 900 lines at about 10 GHz spacing, wider than the L band (abstract)." }),
    f610: { plT: combPlot(COMB_DEFAULT, 1100, 280, "tech"), plV: combPlot(COMB_DEFAULT, 760, 360, "visual"), art: combArt(COMB_DEFAULT, 1200, 260), outs: combOuts(COMB_DEFAULT) },
  };
};
