// 8.2 Who grows, slices, fabs, and builds: ecosystem map (F8.02), verified table, atlas fab and country counts.
import type { PageMeta } from "$lib/content/site";
import { ATLAS_DATA } from "$lib/figures/industry/server";
import { b4, fabCounts } from "$lib/figures/industry/atlas";

const COMMERCIAL = ["Sandia National Laboratories", "Luxtelligence", "imec", "LIGENTEC", "Chongqing United Microelectronics Center Co., Ltd", "CSEM", "Liobate"];

export const load = () => {
  const meta: Partial<PageMeta> = {
    title: "Who Makes It",
    description: "Chapter 8.2: lithium niobate crystal growers, thin-film wafer makers, TFLN foundries, and device makers by region, verified entries with evidence grades; fabs named in atlas papers.",
    keys: ["V", "derived"],
  };
  const f = fabCounts(ATLAS_DATA), w = b4(ATLAS_DATA);
  const fabs = f.fabs.slice(0, 3).concat(f.fabs.filter(([k]) => COMMERCIAL.some((c) => k.startsWith(c))));
  return { meta, papers: f.papers, fabs, countries: f.countries.slice(0, 9), b4: { stated: w.stated, nanoln: w.nanoln } };
};
