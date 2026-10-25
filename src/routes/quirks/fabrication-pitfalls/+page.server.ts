import { sectionLoad } from "$lib/figures/quirks/load.server";

export const load = () =>
  sectionLoad("fabrication-pitfalls", ["P-comp", "U", "reported", "derived"],
    "Chapter 4.10: lithium niobate fabrication pitfalls from public practitioner notes: hotplate charging, cryogenic discharge, e-beam discharge layers, hard masks under Ar+ milling, and face-dependent HF etching, each with its mechanism.");
