// Chapter 05 landing: chapter door text (manuscript 5.0), the full Process viewer, the sections table.
import { newBook, blocks, sectionRaw } from "$lib/figures/making/md";
import { buildFlow } from "$lib/figures/making/flow-build";
import { MK_SECTIONS } from "$lib/figures/making/sections";
import type { PageMeta } from "$lib/content/site";

export const load = async () => {
  const book = await newBook("mk50");
  const raw = await sectionRaw("5.0");
  const door = blocks(raw.L0, book);
  const { flow, pops } = await buildFlow(book.idx);
  Object.assign(book.pops, pops);
  const titles: Record<string, string> = {};
  for (const s of MK_SECTIONS) titles[s.no] = (await sectionRaw(s.no)).title;
  const meta: Partial<PageMeta> = {
    title: "Making",
    description: "Chapter 05: how lithium niobate devices are made, from Li2CO3 and Nb2O5 through Czochralski growth, wafers, ion-sliced LNOI, lithography, argon etching, electrodes and poling, and a 30-step process viewer of an x-cut thin-film modulator with thicknesses, temperatures and times per step.",
    keys: ["reported", "derived", "template"],
    aside: "bias",
  };
  return { meta, door, flow, pops: book.pops, titles };
};
