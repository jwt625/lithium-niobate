// 8.4 Platform comparison from the atlas: charts B1-B6 (F8.05) and platform cards (F8.10). All statistics computed here
// from the pinned subset (chart-specs sec. 1-2); the client receives compact rows for the interactive views.
import type { PageMeta } from "$lib/content/site";
import { ATLAS_DATA as A } from "$lib/figures/industry/server";
import pa from "../../../../static/data/industry/photonics-atlas-lnoi.json";
import { b1Points, b3Counts, b4, b5, b6, isCoherent, plat, platStats, cardsFor, median, PLATFORMS, TELECOM } from "$lib/figures/industry/atlas";

export const load = () => {
  const meta: Partial<PageMeta> = {
    title: "Platforms",
    description: "Chapter 8.4: thin-film LN and LT against silicon, InP, BTO, and polymer modulators in the eo-modulator-atlas sample: V_pi L vs bandwidth, symbol rate, papers per year, wafer suppliers, integration, footprint.",
    keys: ["reported", "derived"],
  };
  const b1 = b1Points(A, { allBands: true, allConv: true, design: true }).map((p) => ({
    id: p.d.device_id, p: plat(p.d.platform), x: p.x, y: p.y, gt: p.gt, pp: p.d.vpi_convention === "mzm_push_pull", tel: TELECOM.has(p.d.band), des: p.design, yr: p.d.year ?? 0 }));
  const b2 = A.devices.filter((d) => d.row_kind === "device" && d.year !== null && (d.max_baud_gbd !== null || d.max_line_rate_gbps !== null || d.max_net_rate_gbps !== null))
    .map((d) => ({ id: d.device_id, p: plat(d.platform), yr: d.year as number, baud: d.max_baud_gbd, line: d.max_line_rate_gbps, net: d.max_net_rate_gbps, coh: isCoherent(d) }));
  const all = b3Counts(A, false), ex = b3Counts(A, true);
  const b3 = Object.fromEntries(PLATFORMS.map((p) => [p, Object.fromEntries([...(all.get(p) ?? new Map())].map(([y, n]) => [y, [n, ex.get(p)?.get(y) ?? 0]]))]));
  const w = b4(A);
  const b5m = Object.fromEntries([...b5(A)].filter(([y]) => y >= 2017));
  const b6m = Object.fromEntries([...b6(A)].map(([p, ds]) => [p, { pts: ds.map((d) => ({ id: d.device_id, L: d.length_mm as number })), med: median(ds.map((d) => d.length_mm as number)) }]));
  const stats = (["TFLN", "TFLT", "SiPh", "InP", "BTO", "Polymer"] as const).map((p) => platStats(A, p));
  const ids = [...b1.map((p) => p.id), ...b2.map((p) => p.id), ...Object.values(b6m).flatMap((x) => x.pts.map((p) => p.id))];
  const tflnBw = stats[0].bw;
  const paOrgs = [...new Set(pa.usage.map((u) => u.org_id))];
  return { meta, pa: { n: pa.usage.length, orgs: paOrgs }, b1, b2, b3, b4: w, b5: b5m, b6: b6m, stats, cards: cardsFor(A, ids), tflnBw };
};
