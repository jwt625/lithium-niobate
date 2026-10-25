import { loadSection, type Cite } from "$lib/figures/making/load";

const cites: Cite[] = [
  ["src:guarino", "He<sup>+</sup> implantation for LN ion slicing", "Reported (arXiv:0705.2392v1, full text read): 195 keV, 4 × 10<sup>16</sup> cm<sup>−2</sup>, holder 100 °C, z-cut CLN; He density peak at 0.68 µm.", "guarino2007", "Methods and main text", "reported"],
  ["src:range-gap", "Implant range: no verified data", "No range-versus-energy table for He<sup>+</sup> or H<sup>+</sup> in LiNbO<sub>3</sub> is held. Needed: a SRIM run (Ziegler 2010) with stored inputs (density 4647 kg/m<sup>3</sup>, LiNbO<sub>3</sub> stoichiometry, 7° tilt, code version), kept as a derived table.", "ziegler2010", "", "U"],
  ["src:you", "H-implanted LN bonding and split", "P: RCA clean, N<sub>2</sub> plasma activation, room-temperature bonding; split 150 °C for 2 h in N<sub>2</sub>; 7° tilt.", "you2019", "Methods", "P"],
  ["src:er", "Smart-cut thermal steps", "P (arXiv): strengthening below 200 °C; split about 230 °C; edge removal and CMP.", "er_smartcut2022", "Sec. II.A", "P"],
  ["src:shams", "Recovery anneal", "P (arXiv): O<sub>2</sub>, atmospheric pressure, 520 °C, 2 h; material-limited loss about 1.5 → 0.2 dB/m.", "shamsansari2022", "", "P"],
  ["src:lt", "LiTaO<sub>3</sub> analog", "P, LiTaO<sub>3</sub>: H<sup>+</sup> 100 keV, 7.0 × 10<sup>16</sup> cm<sup>−2</sup>; split 190 °C for 10 h.", "wang2024nature", "Methods", "P"],
  ["src:rabiei", "680 nm ion-sliced films (2004)", "P(abs): energy not stated in the abstract.", "rabiei2004", "abstract", "P"],
  ["src:target", "Target film thickness", "Reported: 600 nm x-cut film.", "luke2020", "Sec. III", "reported"],
  ["src:removed", "Thickness removed by CMP", "Derived: 680 nm split depth (analog) − 600 nm target = 80 nm.", null, "", "derived"],
  ["src:sigma", "Wafer-scale uniformity", "P (arXiv): etch-depth standard deviation 5.9 nm over a 4-inch wafer with 8 mm edge exclusion; 3.2 nm with a further 6 mm excluded.", "luke2020", "Sec. III", "P"],
  ["src:map", "Template thickness field", "Template: smooth bowl, tilt and threefold term, scaled to σ = 5.9 nm over the edge-excluded wafer. Not a measured map.", null, "", "template"],
  ["src:preston", "Preston removal", "Template: dz/dt = K<sub>p</sub> P v with display values; no LN Preston coefficient is sourced.", "preston1927", "", "template"],
  ["src:colour", "Film colour", "Derived: normal-incidence reflectance of air / LN (x-cut, o and e averaged) / 4.7 µm SiO<sub>2</sub> / Si by characteristic matrices, integrated with CIE 1931 colour-matching functions under D65, encoded as sRGB.", null, "", "derived"],
];
export const load = () => loadSection("5.5", { cites, description: "Chapter 5.5: lithium niobate on insulator by ion slicing and bonding: He implantation, room-temperature bonding, split, CMP and recovery anneal, with the implant-range data gap stated." });
