import { loadSection, type Cite } from "$lib/figures/making/load";
import { sourceIndex } from "$lib/figures/making/sources";
import { alphaFromQ, alphaPerMToDbPerM } from "$lib/physics/units.ts";
import type { LossRow } from "$lib/figures/making/flow";

const cites: Cite[] = [
  ["src:kauf", "HSQ EBL and tuned Ar ICP etching of 4-inch LNOI", "P: EBL doses and currents, 85° resist sidewall, bias and pressure sweeps, redeposition-free regimes.", "kaufmann2023", "", "P"],
  ["src:jiang", "ZEP EBL and Ar ion milling", "P: 300 µC/cm<sup>2</sup> at 2 nA (JEOL 9500).", "jiang2016", "", "P"],
  ["src:luke", "Wafer-scale DUV lithography of TFLN", "P (arXiv): DUV exposure under 1 min per wafer vs more than 8 days for EBL at 10 nA, 125 kV (authors' estimate); 22 mm × 22 mm reticle.", "luke2020", "Sec. II–III", "reported"],
  ["src:ebl", "EBL write time", "Derived: t = D A n / I over the usable area π(D/2 − 8 mm)<sup>2</sup> times the exposed fraction (template). Stage moves and settling excluded.", null, "", "derived"],
  ["src:fields", "Stepper fields per wafer", "Derived: whole 22 mm × 22 mm fields inside the wafer minus 8 mm edge exclusion, best of the field-centred and field-edge-centred grids: 6 on 100 mm, 21 on 150 mm.", null, "", "derived"],
  ["src:swmodel", "Sidewall from mask recession", "Derived geometry: tan(a<sub>LN</sub>) = S tan(a<sub>mask</sub>), S = R<sub>LN</sub>/R<sub>mask</sub>; an upper bound.", null, "", "derived"],
  ["src:li-60", "SiO<sub>2</sub>-masked ridges, about 60°", "P: Li et al. characterize prior SiO<sub>2</sub>-masked ridges as about 60°.", "li2023nc", "introduction", "P"],
  ["src:li-80", "DLC-masked strips, 80°", "P: Ar IBE with DLC mask, full 0.7 µm etch, 3.3 µm base, 80° sidewall.", "li2023nc", "Fig. 1e", "P"],
  ["src:li-S", "Mask selectivity", "P: LN:DLC up to 3, about 1 for SiO<sub>2</sub> masks.", "li2023nc", "", "P"],
  ["src:kras", "Cr-masked etching, about 75°", "P (arXiv): EBL lift-off Cr mask, F + Ar plasma, about 75° sidewalls.", "krasnokutska2018", "", "P"],
  ["src:shams", "Material-limited loss after anneal", "P (arXiv): O<sub>2</sub> anneal reduces material-limited loss from about 1.5 to about 0.2 dB/m.", "shamsansari2022", "", "P"],
  ["src:ng", "Template group index", "Template: n<sub>g</sub> = 2.3 converts a reported Q to loss for rows without a reported loss; not a measured value.", null, "", "template"],
];

export const load = async () => {
  const idx = await sourceIndex();
  const yr = (k: string): { year: number; issued: string; doi: string | null } => { const r = idx.refs.get(k); const iss = r?.issued ?? ""; const [y, m] = iss.split("-").map(Number); return { year: (y || 2020) + ((m || 6) - 0.5) / 12, issued: iss, doi: r?.doi ?? null }; };
  const qLoss = (Q: number): number => alphaPerMToDbPerM(alphaFromQ(Q, 2.3, 1.55));
  const R = (key: string, who: string, route: string, metric: string, dbm: number, status: string, bound: "" | "<" = "", viaQ = false): LossRow => ({ key, who, route, metric, dbm, status, bound, viaQ, pop: `src:loss-${key}`, ...yr(key) });
  const rows: LossRow[] = [
    R("zhang2017", "Zhang", "EBL + Ar", "ring, Q_i about 1e7, 2.7 dB/m", 2.7, "P"),
    R("luke2020", "Luke", "DUV + Ar", "0.27 ± 0.05 dB/cm across a 4-inch wafer", 27, "P"),
    R("gao2022col", "Gao", "CMP from bulk", "ring, Q about 1e8 (no loss reported)", qLoss(1e8), "P", "", true),
    R("li2023nc", "Li", "DUV + DLC", "strip, down to 4 dB/m", 4, "P"),
    R("kaufmann2023", "Kaufmann", "EBL + Ar", "redeposition-free, 1.55 dB/cm", 155, "P"),
    R("li2023oe", "Li", "PLACE", "ring with bus, < 1 dB/m (Q_i 4.04e7)", 1, "P(abs)", "<"),
    R("zhu2024prj", "Zhu", "EBL + Ar", "ring, Q_i 2.9e7, 1.3 dB/m", 1.3, "P(abs)"),
  ];
  const lossCites: Cite[] = rows.map((r) => [r.pop, `${r.who} ${Math.floor(r.year)}`, `${r.status}: ${r.metric}.`, r.key, "", "P"]);
  return loadSection("5.7", { cites: [...cites, ...lossCites], extra: { rows }, description: "Chapter 5.7: patterning thin-film lithium niobate: e-beam and DUV lithography, hard masks, argon etching with redeposition and sidewall angle, and loss by fabrication route." });
};
