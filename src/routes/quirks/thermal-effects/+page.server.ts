import { sectionLoad } from "$lib/figures/quirks/load.server";

export const load = () =>
  sectionLoad("thermal-effects", ["P-comp", "S", "V", "reported", "derived", "template"],
    "Chapter 4.8: thermal effects in lithium niobate: thermo-optic coefficients with sources, thermal lensing, ring resonance shifts, athermal rings, and thermal bistability against photorefraction.");
