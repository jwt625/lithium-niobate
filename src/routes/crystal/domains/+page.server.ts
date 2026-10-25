// 1.8 Domains, internal field, coercive field: popups, reference list, the derived wafer-voltage table and the prerendered
// default state of FIG-01-08 (Hysteresis comparator), computed with src/lib/physics/ferro.ts through hyrender.ts.
import { sectionData } from "$lib/figures/crystal/sources.server";
import { coerciveVoltage } from "$lib/physics/ferro.ts";
import { hyById } from "$lib/figures/crystal/hy-data";
import { asciiPlot, loopSVG, readouts, rngTxt, shapeOf, switching, waferSVG } from "$lib/figures/crystal/hyrender";
import { hyst } from "$lib/stores/crystal";
import page from "./+page.svelte?raw";
import hyData from "$lib/figures/crystal/hy-data.ts?raw";

export const load = async () => {
  const st = { sel: hyst.sel, show: { ...hyst.show }, t: hyst.t };
  const V = (ec: number, t: number): string => { const v = coerciveVoltage(ec * 1e6, t * 1e-3) / 1e3; return v.toFixed(1); };
  const swC = switching(shapeOf(hyById("cln"))), swS = switching(shapeOf(hyById("sln")));
  return {
    ...(await sectionData({
      title: "1.8 Domains, internal field, coercive field",
      description: "Ferroelectric domains of lithium niobate: forward coercive and internal fields of congruent, near-stoichiometric, MgO- and ZnO-doped crystals, wafer poling voltages, the switching-time law, hexagonal domain shapes, unipolarity and its proposed defect origin. Interactive hysteresis comparator with a wafer-voltage calculator.",
      keys: ["P", "P-comp", "derived", "template"],
    }, page, hyData)),
    init: { R: readouts(st), art: asciiPlot(st), loop: loopSVG(st), waf: waferSVG(st) },
    num: {
      wafer: [["Congruent, 21 kV/mm", 21, 21], ["Near-stoichiometric, 6.0&ndash;6.5 kV/mm (Table 7.1)", 6.0, 6.5], ["Near-stoichiometric, 2.1&ndash;2.5 kV/mm (p. 118)", 2.1, 2.5], ["Near-stoichiometric + 2% MgO, 1.8 kV/mm", 1.8, 1.8]].map(([k, lo, hi]) => ({ k: k as string, flag: (k as string).startsWith("Near-stoichiometric,"), a: lo === hi ? V(lo as number, 0.5) : `${V(lo as number, 0.5)}&ndash;${V(hi as number, 0.5)}`, b: lo === hi ? V(lo as number, 1) : `${V(lo as number, 1)}&ndash;${V(hi as number, 1)}` })),
      wC: rngTxt(swC.width), wS: rngTxt(swS.width),
      wRatio: `${(swS.width.lo / swC.width.hi).toFixed(2)}–${(swS.width.hi / swC.width.lo).toFixed(2)}`,
      ecRatio: `${(6.0 / 21).toFixed(2)}–${(6.5 / 21).toFixed(2)}`,
      eupC: rngTxt(swC.eup), ctrC: rngTxt(swC.ctr),
    },
  };
};
