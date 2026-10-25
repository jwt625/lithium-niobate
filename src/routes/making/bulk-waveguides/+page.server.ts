import { loadSection, type Cite } from "$lib/figures/making/load";

const cites: Cite[] = [
  ["src:pe", "Proton-exchange depth", "Derived: d<sup>2</sup> = r(T) t (or d = 2√(D t)), r(T) Arrhenius through 1.37 µm<sup>2</sup>/h at 249 °C and 0.37 µm<sup>2</sup>/h at 217 °C (x-cut, P(abs)); valid 217–249 °C.", "jackel1982", "abstract", "derived"],
  ["src:pe-extrap", "Outside the reported window", "Template: extrapolation of the two-point Arrhenius fit beyond 217–249 °C; not a measured rate.", "jackel1982", "", "template"],
  ["src:pe-ea", "Apparent activation energy", "Derived from two points: 0.90 eV. The meaning of the reported rate (d<sup>2</sup>/t or D) is not confirmed from the full text, so this is a template-grade estimate.", "jackel1982", "", "derived"],
  ["src:jackel", "Proton exchange in benzoic acid", "P(abs): +0.12 on n<sub>e</sub> only, step profile (633 nm); < 0.5 dB/cm, x-cut.", "jackel1982", "abstract", "P"],
  ["src:luo", "Ti indiffusion recipe", "P: 80 nm Ti, 7 µm stripes, 1060 °C for 9 h, z-cut.", "luo2019sciadv", "", "P"],
  ["src:chung", "Ti indiffusion recipe", "P: Ti on the −z face, 1035 °C, constant O<sub>2</sub> flow, 12 h.", "chung2017", "", "P"],
  ["src:schmidt", "First Ti-diffused LN waveguides (1974)", "P(abs): Ti, V and Ni films diffused into LiNbO<sub>3</sub>; Ti gives single-mode low-loss guides within about 1 µm of the surface.", "schmidt1974", "abstract", "P"],
];
export const load = () => loadSection("5.4", { cites, description: "Chapter 5.4: waveguides in bulk lithium niobate by titanium indiffusion and proton exchange, with an exchange-depth calculator built on the reported rates." });
