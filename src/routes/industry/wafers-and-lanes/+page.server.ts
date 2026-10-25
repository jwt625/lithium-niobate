// 8.3 Wafer size and lane rate: wafer ladder (F8.03), lane-rate ladder (F8.04) with atlas research series (B2 values).
import type { PageMeta } from "$lib/content/site";
import { ATLAS_DATA } from "$lib/figures/industry/server";
import { b2Rows, yearlyMax, cardsFor } from "$lib/figures/industry/atlas";

export const load = () => {
  const meta: Partial<PageMeta> = {
    title: "Wafers and Lanes",
    description: "Chapter 8.3: thin-film and bulk lithium niobate wafer sizes from 3 to 8 inch with dated, graded milestones; TFLN and TFLT symbol rates from the atlas against product milestones.",
    keys: ["V", "reported", "derived", "template"],
  };
  const rows = b2Rows(ATLAS_DATA, "max_baud_gbd", "all").filter((d) => d.platform === "TFLN" || d.platform === "TFLT");
  const ym = yearlyMax(rows, "max_baud_gbd");
  const pts = rows.map((d) => ({ id: d.device_id, plat: d.platform, year: d.year as number, v: d.max_baud_gbd as number }));
  return { meta, pts, max: { TFLN: ym.get("TFLN") ?? [], TFLT: ym.get("TFLT") ?? [] }, cards: cardsFor(ATLAS_DATA, pts.map((p) => p.id)) };
};
