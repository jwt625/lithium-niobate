import { sectionLoad } from "$lib/figures/quirks/load.server";

export const load = () =>
  sectionLoad("dc-bias-drift", ["P-comp", "U", "reported", "derived", "template"],
    "Chapter 4.7: DC bias drift in lithium niobate modulators: Maxwell-Wagner relaxation of layered stacks, reported mitigations from 1981 to 2026, thin-film relaxation times, and mechanism candidates.");
