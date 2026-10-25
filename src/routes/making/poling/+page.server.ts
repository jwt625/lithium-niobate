import { loadSection, type Cite } from "$lib/figures/making/load";
import { polingField } from "$lib/figures/making/poling-field";

const cites: Cite[] = [
  ["src:chen", "Wafer-scale poling of x-cut TFLN", "P: 4-inch, 600 nm x-cut on 4.7 µm SiO<sub>2</sub>; periods 4.38–5.51 µm; 50% duty; peak field above 3 E<sub>c</sub>.", "chen2024materials", "", "reported"],
  ["src:chen-th", "Minimum domain-growth field in thin film", "S: 28.2 kV/mm, quoted by chen2024materials from its ref. 20 (original not read).", "chen2024materials", "", "S"],
  ["src:nagy", "Sub-micrometre MgO:TFLN poling", "P(abs): 747 nm period with bipolar preconditioning.", "nagy2020", "", "reported"],
  ["src:zhao", "Shortest x-cut TFLN period", "P(abs): 600 nm.", "zhao2020jap", "abstract", "reported"],
  ["src:ec", "Bulk CLN coercive field", "21 kV/mm.", "langrock2007, volk2008", "Table 7.1", "reported"],
  ["src:field", "Poling field in the film", "Derived: 2D finite-volume electrostatics of a tooth (V) and counter electrode (0) with a 10 µm gap (template) on 600 nm x-cut LN (free permittivities ε11 83.3, ε33 28.5, kushibiki1999) / 4.7 µm SiO<sub>2</sub> / Si (permittivities 3.9 and 11.7, template), air cover (template); scaled by V/g.", null, "", "derived"],
  ["src:kin", "Domain growth kinetics", "Template: tooth width half the period plus a lateral spread of 0.15 µm × (E0/E<sub>th</sub> − 1); no thin-film nucleation or wall-velocity data are sourced.", null, "", "template"],
  ["src:deff", "Effective nonlinearity", "d<sub>eff</sub> = (2/π) d<sub>33</sub> sin(π D) × depth fraction. d<sub>33</sub> = 34 pm/V at 1064 nm is a compilation value on the older scale (Volk 2008 Table 1.2), about 35% above a later absolute measurement whose abstract gives 25.2 pm/V; D is template.", null, "", "template"],
];
export const load = () => loadSection("5.10", { cites, extra: { field: polingField() }, description: "Chapter 5.10: periodic poling of thin-film lithium niobate: comb electrodes, the field in the film from a 2D electrostatic solution, thresholds, and the shortest reported periods." });
