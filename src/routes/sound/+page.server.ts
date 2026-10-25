// Chapter 03 landing: meta, key values computed with src/lib/physics (same functions as the section pages), and an
// ASCII plot of k^2 vs rotated Y-X cut angle from the build-time SAW sweep (Kushibiki et al. 1999 constants).
import type { PageMeta } from "$lib/content/site";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sectionData } from "$lib/figures/sound/content.server";
import { sawTables } from "$lib/figures/sound/sawtables.server";
import { convertForms, couplingFactors } from "$lib/physics/piezo.ts";
import { christoffel, LN_KUSHIBIKI1999 } from "$lib/physics/acoustics.ts";
import { c3m, e3m, eps3m } from "$lib/physics/tensors.ts";
import { CE_KUSHIBIKI1999, E_KUSHIBIKI1999, EPS_S_KUSHIBIKI1999 } from "$lib/physics/constants.ts";
import type { SweepFile } from "$lib/figures/sound/types";

/** ASCII plot: k^2 (%) vs theta 0..180 deg; '*' Rayleigh, 'o' leaky SAW (both surfaces isolated roots), 60 x 12 cells. */
function asciiK2(f: SweepFile): string {
  const S = f.sets.kushibiki1999, th = f.theta_deg, W = 60, H = 12, KMAX = 24;
  const g = Array.from({ length: H }, () => Array(W).fill(" "));
  const put = (t: number, k: number, ch: string): void => {
    const c = Math.min(W - 1, Math.round((t / 180) * (W - 1))), r = H - 1 - Math.min(H - 1, Math.round((k / KMAX) * (H - 1)));
    if (g[r][c] === " " || ch === "*") g[r][c] = ch;
  };
  th.forEach((t, i) => {
    const kr = S.ray.k2[i]; if (kr !== null) put(t, kr * 100, "*");
    const kl = S.lsaw.k2[i]; if (kl !== null && S.lsaw.sf[i] === "r" && S.lsaw.sm[i] === "r") put(t, kl * 100, "o");
  });
  const rows = g.map((r, i) => {
    const k = Math.round(((H - 1 - i) / (H - 1)) * KMAX);
    const lab = i % 3 === 0 || i === H - 1 ? String(k).padStart(3, " ") + "% |" : "     |";
    return lab + r.join("");
  });
  const axis = "     +" + "-".repeat(W);
  const ticks = "      0" + " ".repeat(13) + "45" + " ".repeat(13) + "90" + " ".repeat(12) + "135" + " ".repeat(11) + "180 deg";
  return [...rows, axis, ticks, "      * Rayleigh   o leaky SAW   (YXl) theta, X propagation"].join("\n");
}

export const load = async () => {
  const meta: Partial<PageMeta> = {
    title: "Sound",
    description: "Lithium niobate, chapter 03: piezoelectricity, elastic and bulk waves, surface acoustic waves and cuts, IDTs and SAW filters, acousto-optics, GHz phononics and piezo-optomechanics.",
    keys: ["P", "derived", "reported"],
  };
  const f = convertForms({ cE_GPa: c3m(CE_KUSHIBIKI1999), e_Cm2: e3m(E_KUSHIBIKI1999), epsS_rel: eps3m(EPS_S_KUSHIBIKI1999) });
  const k = couplingFactors(f);
  const t = sawTables().cuts;
  const sweep = JSON.parse(readFileSync(resolve("static/data/sound/saw-sweep-kushibiki1999.json"), "utf8")) as SweepFile;
  const zl = christoffel(LN_KUSHIBIKI1999, [0, 0, 1], true).v[0], zl0 = christoffel(LN_KUSHIBIKI1999, [0, 0, 1], false).v[0];
  const key = {
    d22: (f.d[1][1] * 1e12).toFixed(1), d33: (f.d[2][2] * 1e12).toFixed(2), d15: (f.d[0][4] * 1e12).toFixed(1), k15: k.k15.toFixed(3), kt: k.kt.toFixed(3),
    zl: zl.toFixed(1), zl0: zl0.toFixed(1),
    r128: [t[1].vf.toFixed(1), (t[1].k2 * 100).toFixed(2)], yz: [t[0].vf.toFixed(1), (t[0].k2 * 100).toFixed(2)],
    l64: [t[5].vf.toFixed(1), (t[5].k2 * 100).toFixed(2)], l41: [t[6].vf.toFixed(1), (t[6].k2 * 100).toFixed(2)],
    lam1g: (t[1].vf / 1e3).toFixed(3),
  };
  return { meta, v128: t[1].vf, key, k2ascii: asciiK2(sweep), ...(await sectionData(["kushibiki1999", "p05", "p17", "p07"])) };
};
