import { sectionLoad } from "$lib/figures/quirks/load.server";

export const load = () =>
  sectionLoad("pyroelectricity", ["P", "P-comp", "S", "V", "U", "reported", "derived", "template"],
    "Chapter 4.6: pyroelectricity in lithium niobate: the spread of p3, bound surface charge and kilovolts from a temperature step, z-cut versus x-cut, screening, and pyroelectric-field-driven photorefraction.");
