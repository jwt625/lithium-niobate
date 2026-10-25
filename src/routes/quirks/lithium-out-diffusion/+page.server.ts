import { sectionLoad } from "$lib/figures/quirks/load.server";

export const load = () =>
  sectionLoad("lithium-out-diffusion", ["P-comp", "S", "U", "reported", "derived", "template"],
    "Chapter 4.9: lithium out-diffusion from lithium niobate surfaces: out-diffused guides, Li2O compensation during Ti indiffusion, domain inversion on +c, and index and Curie-temperature profiles from the generalized Sellmeier.");
