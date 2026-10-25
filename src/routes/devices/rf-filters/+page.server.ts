// 6.9 RF acoustic filters: manuscript text and F6.12 IDT / SAW figure (velocities from the partial-wave solver at build time).
import { buildSection, meta, sawCuts } from "$lib/figures/devices/server";
import { IDT_DEFAULT, idtArt, idtOuts } from "$lib/figures/devices/f612";

export const load = async () => {
  const cuts = sawCuts();
  const b = await buildSection("6.9", ["kushibiki1999"], [], ["derived"]);
  return {
    meta: meta("6.9", "RF acoustic filters", "Chapter 6.9: surface and bulk acoustic wave filters on lithium niobate and tantalate, with an IDT pitch model.", b.keys),
    b, f612: { cuts, init: { T: idtArt(IDT_DEFAULT, cuts, 1100, 220, "tech"), V: idtArt(IDT_DEFAULT, cuts, 1200, 300, "visual"), outs: idtOuts(IDT_DEFAULT, cuts) } },
  };
};
