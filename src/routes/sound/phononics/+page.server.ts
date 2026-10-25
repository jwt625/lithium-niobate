// Section 3.7 GHz phononics and piezo-optomechanics: meta, references, derived scales (src/lib/physics), d coefficients
// for the Fig. 3.11 reference ticks.
import type { PageMeta } from "$lib/content/site";
import { sectionData } from "$lib/figures/sound/content.server";
import { convertForms } from "$lib/physics/piezo.ts";
import { thermalOccupation } from "$lib/physics/optomech.ts";
import { c3m, e3m, eps3m } from "$lib/physics/tensors.ts";
import { CE_KUSHIBIKI1999, E_KUSHIBIKI1999, EPS_S_KUSHIBIKI1999, H, QE } from "$lib/physics/constants.ts";
import { refractiveIndex } from "$lib/physics/sellmeier.ts";
import { ZELMON_CLN_O } from "$lib/physics/constants.ts";
import { sawTables } from "$lib/figures/sound/sawtables.server";

const REFS = ["p03", "p04", "p05", "p06", "p07", "p09", "p10", "p11", "p17", "zenodo7903643", "shao2019", "weaver2024", "arrangoiz2018", "wollack2022", "safavinaeini2019", "zelmon1997", "kushibiki1999"];

export const load = async () => {
  const meta: Partial<PageMeta> = {
    title: "GHz phononics and piezo-optomechanics",
    description: "Chapter 3.7: thin-film lithium niobate phononics and piezo-optomechanics: microwave-to-optical transduction model, optically heralded microwave photon addition, nanobender actuators, platforms and reported numbers.",
    keys: ["P-db", "reported", "derived"],
  };
  const f = convertForms({ cE_GPa: c3m(CE_KUSHIBIKI1999), e_Cm2: e3m(E_KUSHIBIKI1999), epsS_rel: eps3m(EPS_S_KUSHIBIKI1999) });
  const v128 = sawTables().cuts[1].vf;
  const no = refractiveIndex(ZELMON_CLN_O, 1.55);
  const scales = {
    lamA: v128 / 2e9 * 1e6, v128, no, lamO: 1.55 / no,
    Eph: (H * 2e9) / QE * 1e6, Eopt: (H * 299792458 / 1.55e-6) / QE,
    n300: thermalOccupation(2e9, 300), n10: thermalOccupation(2e9, 0.01),
  };
  return { meta, d22: f.d[1][1] * 1e12, d15: f.d[0][4] * 1e12, scales, ...(await sectionData(REFS)) };
};
