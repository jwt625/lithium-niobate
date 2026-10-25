import { loadSection, type Cite } from "$lib/figures/making/load";

const cites: Cite[] = [
  ["src:cz", "Czochralski growth of a 6-inch LN boule", "Secondary: pull 1–2 mm/h, rotation 5–10 rpm, 153 mm × 110 mm, re-keyed from the review table of Chen et al. 2021; original Wang et al. 2020 (CrystEngComm).", "chen2021molecules", "Table 1", "S"],
  ["src:cz-L", "Body length and mass", "Derived: L = v t, capped at the reported 110 mm body; mass = 4647 kg/m<sup>3</sup> × π (153 mm/2)<sup>2</sup> L. Shoulder, tail and cool-down excluded.", "volk2008", "Table 1.1 (density)", "derived"],
  ["src:tc-fits", "T<sub>c</sub> vs composition", "P-comp: T<sub>c</sub> = 39.064 c − 746.73 (Bordui 1992); T<sub>c</sub> = 39.26 c − 760.67 (Iyi 1992), c in mol% Li<sub>2</sub>O.", "volk2008", "Eqs. (6.2), (6.3), p. 140", "P-comp"],
  ["src:volk-tc", "Curie temperature of CLN", "P-comp: 1140 °C.", "volk2008", "Table 1.1", "P-comp"],
  ["src:cti", "Vendor Curie temperature", "V: 1142.3 ± 0.7 °C at 48.38 mol%.", "cti1999", "", "V"],
  ["src:sln-conflict", "Near-stoichiometric T<sub>c</sub>: conflict", "1206 °C (Volk, P-comp) vs 1213 °C (secondary). Both shown; neither preferred.", "volk2008, wong2002", "", "P-comp"],
  ["src:cz-template", "Template drawing values", "Crucible size (1.5× crystal radius), afterheater, seed orientation (drawn along Z), 45° shoulder: no source.", null, "", "template"],
];
export const load = () => loadSection("5.2", { cites, description: "Chapter 5.2: Czochralski growth of lithium niobate, congruent composition, Curie temperature vs composition, MgO doping and single-domain boules." });
