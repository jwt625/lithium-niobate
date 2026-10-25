import { sectionLoad } from "$lib/figures/quirks/load.server";

export const load = () =>
  sectionLoad("damage-thresholds", ["P-comp", "reported", "V"],
    "Chapter 4.5: what optical damage means in lithium niobate at each intensity scale: photorefraction, coloration, and laser-induced breakdown on one log axis, with fluence kept separate.");
