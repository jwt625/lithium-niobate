// Popups that tie the shell motifs (footer bias meter, VISUAL cursor trace, IR dimming) to the sections that explain
// them. Registered on every chapter 04 page; page entries win over shell entries for the same key ("drift").
import type { Pop } from "$lib/content/pops";

export const MOTIF_POPS: Record<string, Pop> = {
  "v-false": { h: "False color", body: "Infrared light is invisible. These pages draw it in a declared false color, always dashed. Visible wavelengths use computed spectral colors (CIE 1931 2&deg; color-matching functions, Wyman, Sloan, Shirley 2013 fit)." },
  "q-zel": { h: "Zelmon et al. 1997", body: "Sellmeier fit for congruent LN at 21 &deg;C, 0.4 to 5.0 &micro;m; n<sub>e</sub>(1550 nm) = <span class='v'>2.1376</span>. Coefficients via refractiveindex.info (CC0).", badges: [["pc", "P-db"]], src: "JOSA B 14, 3319 (1997), <a href='https://doi.org/10.1364/JOSAB.14.003319'>doi:10.1364/JOSAB.14.003319</a>" },
  drift: {
    h: "Bias drift",
    body: "A DC bias on a thin-film LN modulator is screened over time by charge in the film, cladding, and interfaces, so the operating point moves and needs a control loop. TECH: fixed at quadrature. VISUAL: single-RC drift with &tau; = 40 s and 90&deg; span (display values, not measured); click to re-lock.",
    badges: [["t", "template"]],
    src: "TFLN EO relaxation, 1 mHz to 1 MHz: J. Holzgrafe et al., Opt. Express 32, 3619 (2024), <a href='https://doi.org/10.1364/OE.507536'>doi:10.1364/OE.507536</a>.",
    more: ["4.7 DC bias drift: layered RC model", "/quirks/dc-bias-drift/#l2"],
  },
  "m-trace": {
    h: "Cursor trace",
    body: "VISUAL with effects on: the pointer writes a 532 nm trace that fades over about 15 s, a display time constant. In the crystal the written index change decays with the dielectric relaxation time &epsilon;&epsilon;<sub>0</sub>/&sigma;, seconds under light and hours to weeks in the dark.",
    badges: [["t", "template"]],
    more: ["4.1 Photorefraction", "/quirks/photorefraction/"],
  },
  "m-griira": {
    h: "Infrared dimming",
    body: "VISUAL with effects on: infrared false-color marks within 40 px of the pointer dim to 35% and recover, a display effect. In the crystal, green light fills Nb antisite traps whose bound polarons absorb near-infrared light (GRIIRA); the absorption vanishes when the green light stops.",
    badges: [["t", "template"]],
    more: ["4.4 GRIIRA and polarons", "/quirks/griira/"],
  },
};
