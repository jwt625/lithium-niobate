// Chapter 2.6 EO combs and frequency shifters: shell overrides, server-computed default markup of the comb and shifter figures (both
// variants), the numerical checks printed in L2 / L3, and the page's popups and reference list (refs.yaml / glossary.yaml
// keys found in this page and its figure modules).
import type { PageMeta } from "$lib/content/site";
import { lightContent } from "$lib/figures/light/content.server";
import { cmtOffset, combChecks, combInit, countFacts, l2Check } from "$lib/figures/light/f26-comb";
import { shiftChecks, shiftInit } from "$lib/figures/light/f26-shift";

const RAW = import.meta.glob(["./+page.svelte", "/src/lib/figures/light/f26-*.ts"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;

export const load = async () => {
  const meta: Partial<PageMeta> = {
    title: "EO Combs and Frequency Shifters",
    description: "Chapter 2.6: resonant electro-optic frequency combs in lithium niobate rings (line slope versus beta F, line counts) and coupled-ring electro-optic frequency shifters (eq. 2.19).",
    keys: ["reported", "derived", "template"],
    aside: "bias",
  };
  const init = {
    comb: combInit(),
    shift: shiftInit(),
    checks: combChecks(),
    count: countFacts(),
    cmt: cmtOffset(),
    l2: l2Check(),
    sh: shiftChecks(),
  };
  const content = await lightContent(Object.values(RAW));
  return { meta, init, content };
};
