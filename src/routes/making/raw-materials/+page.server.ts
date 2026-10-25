import { loadSection, type Cite } from "$lib/figures/making/load";

const F = "Government statistics, opened and read.";
const V = "Company statement about its own products, opened and read.";
const cites: Cite[] = [
  ["src:usgs-nb", "USGS Mineral Commodity Summaries 2026: Niobium", F, "R09:S1", "", "P"],
  ["src:usgs-li", "USGS Mineral Commodity Summaries 2026: Lithium", F, "R09:S2", "", "P"],
  ["src:charge", "Charge per kg LiNbO<sub>3</sub>", "Derived: Li<sub>2</sub>CO<sub>3</sub> + Nb<sub>2</sub>O<sub>5</sub> → 2 LiNbO<sub>3</sub> + CO<sub>2</sub> with IUPAC abridged atomic weights Li 6.94, C 12.011, O 15.999, Nb 92.906 (Prohaska et al., Pure Appl. Chem. 94, 573 (2022)).", null, "", "derived"],
  ["src:wafer-mass", "LN and Nb mass of a wafer", "Derived: m = ρ π (D/2)<sup>2</sup> t with ρ = 4647 kg/m<sup>3</sup> (P-comp), flats ignored; Nb mass = 62.84 wt% of m (atomic weights above).", "volk2008", "Table 1.1", "derived"],
  ["src:cz", "Czochralski growth of a 6-inch boule", "Secondary: re-keyed from the review table, original cited there.", "chen2021molecules", "Table 1 (original: Wang et al. 2020)", "S"],
  ["src:boule-mass", "Boule body mass", "Derived: cylinder 153 mm × 110 mm at 4647 kg/m<sup>3</sup>; shoulder and tail excluded.", null, "", "derived"],
  ["src:r09-sizes", "Bulk wafer diameters", "Company statements: 4- and 6-inch SAW wafers (one maker); 8-inch LN claimed in mass production (one grower).", "R09:S3, R09:S5", "", "V"],
  ["src:smm", "Sumitomo Metal Mining 128° Y LN wafers", V, "R09:S3", "", "V"],
  ["src:nanoln", "NanoLN LNOI and LTOI", V, "R09:S6", "", "V"],
  ["src:soitec", "Soitec Connect POI", V, "R09:S10", "", "V"],
  ["src:ccraft", "CCRAFT TFLN foundry", "Trade press, opened and read.", "R09:S13", "", "S"],
  ["src:hyperlight", "HyperLight, UMC and Wavetek", "Investor press release, opened and read.", "R09:S18", "", "V"],
  ["src:luke2020", "Wafer-scale DUV TFLN", "P: arXiv version read.", "luke2020", "", "P"],
  ["src:li2023nc", "DLC-masked TFLN modulator", "P: values from the abstract.", "li2023nc", "abstract", "P"],
  ["src:tiln", "Commercial Ti:LN modulators", V, "R09:S37", "", "V"],
];

export const load = () => loadSection("5.1", { cites, description: "Chapter 5.1: lithium carbonate and niobium pentoxide, the charge chemistry, world Nb and Li supply (USGS 2026), and the LN and Nb mass of a wafer." });
