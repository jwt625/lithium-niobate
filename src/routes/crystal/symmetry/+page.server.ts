// 1.7 Symmetry and every tensor: popups, reference list, and the prerendered default state of FIG-01-06 (Neumann machine,
// computed with src/lib/physics/symmetry.ts) and FIG-01-07 (Which face is +z). The allowed-form counts of the L2 table are
// recomputed here from the same group action, so the table shows the source value next to the computed one.
import { sectionData } from "$lib/figures/crystal/sources.server";
import { groupOps3m, neumann, stabilizer, KINDS } from "$lib/physics/symmetry.ts";
import { nmModel, hdrText, kindText, subText, opticText, hoverText, elemsHtml, bigText, techGrid, visGrid, visStereo, type NmState } from "$lib/figures/crystal/nm";
import { pzAscii, pzReadout, pzSvg, PZ_TESTS, type PzState } from "$lib/figures/crystal/pz";
import page from "./+page.svelte?raw";
import nmRaw from "$lib/figures/crystal/nm.ts?raw";
import pzRaw from "$lib/figures/crystal/pz.ts?raw";

export const load = async () => {
  const nmInit: NmState = { kind: "d", ops: { C3: true, myz: true, mp60: true, mm60: true }, field: "0" };
  const m = nmModel(nmInit);
  const pzInit: PzState = { flip: false, sq: false, cool: false, etch: false };
  const all = groupOps3m().map((o) => o.R);
  const counts = Object.fromEntries((["pyro", "eps", "d", "r", "c", "s", "p"] as const).map((k) => [k, `${neumann(k, all).independentCount} / ${KINDS[k].generic}`]));
  const stab = Object.fromEntries((["x", "y", "z"] as const).map((a, i) => { const E: [number, number, number] = [0, 0, 0]; E[i] = 1; return [a, stabilizer(all, E).name]; }));
  return {
    ...(await sectionData({
      title: "1.7 Symmetry and every tensor",
      description: "Point group 3m and Neumann's principle for lithium niobate: IEEE 176 axes, how to find the +z face, the allowed forms of the pyroelectric, dielectric, piezoelectric, electro-optic, elastic and photoelastic tensors, and how an applied field lowers the symmetry, with an exact group-action calculation of every allowed tensor form.",
      keys: ["P", "P-comp", "derived"],
    }, page, nmRaw, pzRaw)),
    nmInit,
    nm: {
      hdr: hdrText(m), kind: kindText(m), sub: subText(m), opt: opticText(m), hov: hoverText(m, null),
      rel: m.relLines.join("\n"), db: m.dB.join("\n"), el: elemsHtml(m), mx: techGrid(m), gg: visGrid(m), st: visStereo(m),
      ind: String(m.indep).padStart(2, " "), gen: String(m.generic).padStart(2, " "), grp: m.group,
    },
    counts, stab,
    pz: Object.fromEntries(PZ_TESTS.map((t) => [t, { a: pzAscii(t, pzInit), ro: pzReadout(t, pzInit), svg: pzSvg(t) }])) as Record<"sq" | "cool" | "etch", { a: string; ro: string; svg: string }>,
  };
};
