// Chapter 02 popups shared by every page of the chapter (page-local registry entries; register with usePops).
// The masthead band on chapter 02 pages draws the 1550 -> 775 nm SHG period (site.ts qpm: 1.55); the shell entries
// describe the landing's 1064 nm period, so these page entries override "qpm" and "v-qpm" here.
import type { Pop } from "$lib/content/pops";
import { qpmPeriodSHG } from "../optics.ts";

const L1550 = qpmPeriodSHG(1.55);

export const LIGHT_POPS: Record<string, Pop> = {
  qpm: { h: "Poled domains", body: `Alternating &plusmn;z ferroelectric domains, drawn not to scale. First-order QPM period for e-e-e SHG 1550 &rarr; 775 nm in bulk congruent LN at 21 &deg;C: &Lambda; = &lambda; / (2 (n<sub>e</sub>(&lambda;/2) &minus; n<sub>e</sub>(&lambda;))) = <span class='v'>${L1550.toFixed(3)} &micro;m</span>.`, badges: [["pc", "P-db inputs"], ["d", "derived"]], src: "n<sub>e</sub>: Zelmon et al. 1997, <a href='https://doi.org/10.1364/JOSAB.14.003319'>doi:10.1364/JOSAB.14.003319</a>" },
  "v-qpm": { h: "Poled domains, to scale", body: `Alternating &plusmn;z ferroelectric domains drawn at 2 px per &micro;m, 50% duty cycle. First-order QPM period for e-e-e SHG 1550 &rarr; 775 nm in bulk congruent LN at 21 &deg;C: <span class='v'>${L1550.toFixed(3)} &micro;m</span>; the landing page draws the 1064 &rarr; 532 nm period at the same scale.`, badges: [["pc", "P-db inputs"], ["d", "derived"]], src: "n<sub>e</sub>: Zelmon et al. 1997." },
  "v-false": { h: "False color", body: "Infrared light (1064 nm, 1550 nm, mid-IR) is invisible. It is drawn in declared false colors (orange for 1064 nm, magenta for 1550 nm and longer), always dashed. Visible wavelengths use computed spectral colors (CIE 1931 2&deg; color-matching functions, Wyman, Sloan, Shirley 2013 fit)." },
};
