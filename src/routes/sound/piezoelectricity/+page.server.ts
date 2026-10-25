// Section 3.1 Piezoelectricity: shell meta, reference list and popups, the d sets for Fig. 3.1, and the derived numbers
// of the L2 tables (computed here from kushibiki1999 with src/lib/physics/piezo.ts, so the prerendered page shows them).
import type { PageMeta } from "$lib/content/site";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sectionData } from "$lib/figures/sound/content.server";
import { convertForms, couplingFactors, hydrostaticD } from "$lib/physics/piezo.ts";
import { c3m, e3m, eps3m } from "$lib/physics/tensors.ts";
import { CE_KUSHIBIKI1999, E_KUSHIBIKI1999, EPS_S_KUSHIBIKI1999 } from "$lib/physics/constants.ts";
import type { DSetIn } from "$lib/figures/sound/types";

const REFS = ["ieee176", "kushibiki1999", "ogi2002", "weis1985", "smithwelsh1971", "warner1967", "graham1976", "volk2008", "bond1943"];

export const load = async () => {
  const meta: Partial<PageMeta> = {
    title: "Piezoelectricity",
    description: "Chapter 3.1: piezoelectricity of lithium niobate: longitudinal response surface, the four IEEE 176 constitutive forms, kushibiki1999 constants, coupling factors, the convention of 2s and the sign frame.",
    keys: ["P", "P-comp", "derived"],
  };
  const f = convertForms({ cE_GPa: c3m(CE_KUSHIBIKI1999), e_Cm2: e3m(E_KUSHIBIKI1999), epsS_rel: eps3m(EPS_S_KUSHIBIKI1999) });
  const k = couplingFactors(f);
  const pC = (v: number): number => v * 1e12;
  const tensors = JSON.parse(readFileSync(resolve("src/lib/generated/tensors.json"), "utf8")) as { id: string; independent: Record<string, { value: number }> }[];
  const sw = tensors.find((t) => t.id === "piezo-strain-d/unspecified/weis1985-smithwelsh1971");
  if (!sw) throw new Error("sound: Smith & Welsh d set missing from generated tensors");
  const sets: DSetIn[] = [
    { id: "kushibiki1999", label: "Kushibiki et al. 1999", d15: pC(f.d[0][4]), d22: pC(f.d[1][1]), d31: pC(f.d[2][0]), d33: pC(f.d[2][2]), code: "derived", pop: "m-forms" },
    { id: "smithwelsh1971", label: "Smith &amp; Welsh 1971", d15: sw.independent.d15.value, d22: sw.independent.d22.value, d31: sw.independent.d31.value, d33: sw.independent.d33.value, code: "P-comp", pop: "r:weis1985" },
  ];
  const fx = (v: number, d: number): string => v.toFixed(d).replace("-", "−");
  const calc = {
    epsT11: fx(f.epsT[0][0], 2), epsT33: fx(f.epsT[2][2], 2),
    d15: fx(pC(f.d[0][4]), 1), d22: fx(pC(f.d[1][1]), 1), d31: fx(pC(f.d[2][0]), 2), d33: fx(pC(f.d[2][2]), 2), d16: fx(pC(f.d[0][5]), 1),
    dh: fx(pC(hydrostaticD(f.d)), 2),
    g15: fx(f.g[0][4], 4), g22: fx(f.g[1][1], 4), g33: fx(f.g[2][2], 4),
    h15: fx(f.h[0][4] / 1e9, 2), h22: fx(f.h[1][1] / 1e9, 2), h33: fx(f.h[2][2] / 1e9, 2),
    cD33: fx(f.cD[2][2] / 1e9, 2), cD44: fx(f.cD[3][3] / 1e9, 2),
    kt: fx(k.kt, 3), kt2: fx(k.kt ** 2, 3), k15: fx(k.k15, 3), k152: fx(k.k15 ** 2, 3), k33: fx(k.k33, 3), k31: fx(k.k31, 3), kY: fx(k.kY, 3),
  };
  return { meta, sets, calc, ...(await sectionData(REFS)) };
};
