// Chapter 08 landing: opener (8.0), section index with one key number each, data provenance (8.9).
import type { PageMeta } from "$lib/content/site";
import { ATLAS_DATA, EVENTS } from "$lib/figures/industry/server";
import { atlasTotals, b4, platStats } from "$lib/figures/industry/atlas";

export const load = () => {
  const meta: Partial<PageMeta> = {
    title: "Industry",
    description: "Lithium niobate industry, chapter 08: rock-to-chip value chain, companies by region, wafer size and lane rate, platform comparison from eo-modulator-atlas, OFC 2026, market ranges by evidence grade.",
    keys: ["V", "derived"],
  };
  const t = atlasTotals(ATLAS_DATA), w = b4(ATLAS_DATA), s = platStats(ATLAS_DATA, "TFLN");
  return { meta, totals: t, b4: { stated: w.stated, nanoln: w.nanoln, total: w.total }, tfln: { n: s.vpil.n, med: s.vpil.med }, events: EVENTS.length };
};
