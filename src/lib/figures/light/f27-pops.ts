// Chapter 2.7 page popups (derived values, template parameters, engine geometry). Reference popups ("r:<id>") come from
// lightContent (refs.yaml); keys used here: r:zelmon1997, r:atlas-engine, r:li2026aa, r:shamsansari2022, r:zhu2024,
// r:leidinger2015, r:luke2020.
import type { Pop } from "$lib/content/pops";
import { qToLoss, perCmToDbPerM } from "$lib/physics/resonators.ts";
import { indices } from "./f27-ring.ts";
import { FLOOR, GAP, NG_T } from "./f27-loss.ts";

const Z = "Zelmon, Small &amp; Jundt 1997, <a href='https://doi.org/10.1364/JOSAB.14.003319'>doi:10.1364/JOSAB.14.003319</a>";
const I1550 = indices(1.55);
const cv = (Q: number): string => qToLoss({ Q, ng: NG_T, lam_um: 1.55 }).dB_per_m.toFixed(2);

export const F27_POPS: Record<string, Pop> = {
  "f27-idx": {
    h: "Bulk indices at 1550 nm",
    body: `Zelmon Sellmeier for congruent LN at 21 &deg;C (valid 0.4 to 5.0 &micro;m): n<sub>o</sub> = <span class='v'>${I1550.no.toFixed(4)}</span>, n<sub>e</sub> = <span class='v'>${I1550.ne.toFixed(4)}</span>. Bulk values; film indices may differ.`,
    badges: [["pc", "P-db inputs"], ["d", "derived"]], src: Z,
  },
  "f27-ring": {
    h: "Ring index, bulk approximation",
    body: "In-plane TE index at angle &phi; between propagation and crystal z in an x-cut film: 1/n(&phi;)<sup>2</sup> = cos<sup>2</sup>&phi;/n<sub>o</sub><sup>2</sup> + sin<sup>2</sup>&phi;/n<sub>e</sub><sup>2</sup>. Mode confinement ignored (no n<sub>eff</sub>, no hybridization). z-cut TE: n<sub>o</sub> in every in-plane direction; &phi; is then measured from crystal x.",
    badges: [["pc", "P-db inputs"], ["d", "derived"]], src: Z,
  },
  "f27-ng": {
    h: "n<sub>g</sub> = 2.3",
    body: "Display parameter for the conversion examples and for placing Q-only records on the loss axis; not a measured group index. Each device converts with its own n<sub>g</sub> (Li et al. 2026 rib, engine: 2.135).",
    badges: [["t", "template"]],
  },
  "f27-conv": {
    h: "Q to loss, eq. 2.20",
    body: `&alpha; = 2&pi;n<sub>g</sub>/(Q<sub>i</sub>&lambda;), &alpha;<sub>dB</sub> = 4.343&alpha;. n<sub>g</sub> = 2.3, &lambda; = 1550 nm: Q<sub>i</sub> 1e7 &rarr; <span class='v'>${cv(1e7)}</span> dB/m; 2.9e7 &rarr; <span class='v'>${cv(2.9e7)}</span> dB/m; 1.6e8 &rarr; <span class='v'>${cv(1.6e8)}</span> dB/m.`,
    badges: [["t", "template n_g"], ["d", "derived"]],
  },
  "f27-bulk": {
    h: "Bulk absorption floor",
    body: `Low end of the congruent-LN absorption range measured over 390 to 3800 nm: &lt; 1e&minus;4 /cm. 1e&minus;4 /cm &times; 100 cm/m &times; 4.343 = <span class='v'>${perCmToDbPerM(1e-4).toFixed(3)}</span> dB/m. The value at 1550 nm itself is not read from the paper.`,
    badges: [["r", "reported range"], ["d", "conversion derived"]], src: "Leidinger et al. 2015, <a href='https://doi.org/10.1364/OE.23.021690'>doi:10.1364/OE.23.021690</a>",
  },
  "f27-unit": {
    h: "0.27 dB/cm = 27 dB/m",
    body: "Unit conversion of the reported wafer-scale propagation loss.",
    badges: [["r", "reported"], ["d", "derived"]], src: "Luke et al. 2020, <a href='https://doi.org/10.1364/oe.401959'>doi:10.1364/oe.401959</a>",
  },
  "f27-qb": {
    h: "Q-only records",
    body: `Reported as Q &gt; 1e8 without a loss value. Plotted at the eq. 2.20 loss for Q = 1e8 with n<sub>g</sub> = 2.3 at 1550 nm (<span class='v'>${cv(1e8)}</span> dB/m); the arrow marks that the loss is lower.`,
    badges: [["r", "reported Q"], ["t", "template n_g"], ["d", "derived"]],
  },
  "f27-gap": {
    h: "Best dry-etched ring vs material floor",
    body: `Q: ${FLOOR.Q.toExponential(1)} / 2.9e7 = <span class='v'>${GAP.q.toFixed(1)}&times;</span>. Loss: 1.3 / 0.2 dB/m = <span class='v'>${GAP.loss.toFixed(1)}&times;</span> (each paper's own n<sub>g</sub>).`,
    badges: [["r", "reported inputs"], ["d", "derived"]], src: "Zhu et al. 2024 (Q<sub>i</sub> 29 million, 1.3 dB/m); Shams-Ansari et al. 2022 (Q 1.6e8, 0.2 dB/m).",
  },
  "f27-band": {
    h: "Material floor band",
    body: `From the reported 0.2 dB/m to the eq. 2.20 loss of the reported Q 1.6e8 at n<sub>g</sub> = 2.3, 1550 nm (<span class='v'>${FLOOR.dbmQ.toFixed(3)}</span> dB/m): the same floor in its two published forms. Typing Q<sub>i</sub> = 1.6e8 with n<sub>g</sub> 2.3 at 1550 nm puts the cursor on the band.`,
    badges: [["r", "reported"], ["t", "template n_g"], ["d", "derived"]],
  },
  "f27-geom": {
    h: "Li et al. 2026 rib as modelled",
    body: "Engine model of the reported cross-section: rib base half-width 1.854 &micro;m (sidewall 60&deg; from the substrate plane), Au electrodes 1.0 &micro;m thick on the 120 nm slab, SiO<sub>2</sub> cladding 2.0 &micro;m above the rib top, buried oxide 4.7 &micro;m. Drawing: one scale for both axes, buried oxide broken, electrodes cut at the frame.",
    badges: [["d", "engine"]], src: "eo-modulator-atlas FEM engine, model of the reported cross-section (exported 2026-10-25)",
  },
};
