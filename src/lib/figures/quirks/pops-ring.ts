// Popups for fig-04-04 (ring sweep), shared by sections 4.3 and 4.8.
import type { Pop } from "$lib/content/pops";

export const RING_POPS: Record<string, Pop> = {
  "f4-tmpl": { h: "Ring-sweep model parameters", body: "Ring radius 100 &micro;m, n<sub>g</sub> 2.3, &Gamma; 0.8, intrinsic Q 10<sup>6</sup>, critical coupling; absorbed fraction 0.5 of the intrinsic loss, &tau;<sub>th</sub> 1 &micro;s, R<sub>th</sub> 10<sup>3</sup> K/W; effective area 1 &micro;m<sup>2</sup>; photoconductivity &kappa; 10<sup>&minus;16</sup> S m/W, &sigma;<sub>d</sub> 10<sup>&minus;14</sup> S/m (air-clad: 10<sup>&minus;12</sup> S/m and photovoltaic gain &times;0.2); photovoltaic gain = strength &times; 6.6&times;10<sup>&minus;12</sup> A/W. Chosen to show the competition; no device is fitted.", badges: [["t", "template"]] },
  "f4-dn": { h: "dn<sub>e</sub>/dT at 1550 nm", body: "Jundt 1997 temperature-dependent Sellmeier (coefficients status S), analytic derivative at 1550 nm and 25 &deg;C: <span class='v'>3.75&times;10<sup>&minus;5</sup> /K</span>. Alternative: 3.34&times;10<sup>&minus;5</sup> /K at 1523 nm and 300 K (Moretti et al. 2005 via Zhu et al. 2021, S).", badges: [["d", "derived"], ["s", "S"]] },
};
