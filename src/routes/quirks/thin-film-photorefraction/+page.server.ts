import { sectionLoad } from "$lib/figures/quirks/load.server";

export const load = () =>
  sectionLoad("thin-film-photorefraction", ["P-comp", "S", "reported", "derived", "template"],
    "Chapter 4.3: photorefraction in thin-film lithium niobate rings and waveguides: resonance blue shift, cladding, long memory, trimming, and a ring-sweep model of thermal versus photorefractive tuning.");
