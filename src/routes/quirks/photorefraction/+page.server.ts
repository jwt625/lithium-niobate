import { sectionLoad } from "$lib/figures/quirks/load.server";

export const load = () =>
  sectionLoad("photorefraction", ["P-comp", "reported", "derived", "template"],
    "Chapter 4.1: photorefraction in lithium niobate, from optical damage to the bulk photovoltaic current, space-charge field, and dielectric relaxation, with a write-and-erase model and a 1D grating solver.");
