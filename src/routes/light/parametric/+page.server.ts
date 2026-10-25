// Chapter 2.4 Parametric amplification and OPOs: shell overrides, server-computed default markup of every figure (both
// variants), and the page's popups and reference list (refs.yaml / glossary.yaml keys found in this page and its figure
// modules).
import type { PageMeta } from "$lib/content/site";
import { lightContent } from "$lib/figures/light/content.server";
import { initAll } from "$lib/figures/light/f24-model";

const RAW = import.meta.glob(["./+page.svelte", "/src/lib/figures/light/f24-*.ts"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;

export const load = async () => {
  const meta: Partial<PageMeta> = {
    title: "Parametric Amplification and OPOs",
    description: "Chapter 2.4: parametric gain and optical parametric oscillators in lithium niobate: phase-sensitive gain, resonator threshold and clamping, threshold scaling with Q, and signal/idler tuning with period and temperature.",
    keys: ["P-db", "S", "reported", "derived", "template"],
    aside: "bias",
  };
  const content = await lightContent(Object.values(RAW));
  return { meta, init: initAll(), content };
};
