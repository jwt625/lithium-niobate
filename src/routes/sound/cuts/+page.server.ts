// Section 3.4 Cuts and coupling: meta, references, the default (kushibiki1999) SAW sweep for the prerendered Fig. 3.4,
// and the sweep table rows read from the same build-time file.
import type { PageMeta } from "$lib/content/site";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sectionData } from "$lib/figures/sound/content.server";
import type { SweepFile } from "$lib/figures/sound/types";

const REFS = ["ieee176", "kushibiki1999", "ogi2002", "warner1967", "weis1985", "campbell1968", "ingebrigtsen1969", "shibayama1976", "smm-ln-lt", "sarabalis2020", "fomos-ln"];

export const load = async () => {
  const meta: Partial<PageMeta> = {
    title: "Cuts and coupling",
    description: "Chapter 3.4: SAW velocity and coupling k^2 of rotated Y-X lithium niobate cuts from a partial-wave solver, Rayleigh and leaky waves, three constant sets; why 128, 64 and 41 deg are the standard cuts.",
    keys: ["P", "P-comp", "S", "V", "derived"],
  };
  const file = JSON.parse(readFileSync(resolve("static/data/sound/saw-sweep-kushibiki1999.json"), "utf8")) as SweepFile;
  const S = file.sets.kushibiki1999, th = file.theta_deg;
  const row = (t: number) => {
    const i = th.indexOf(t);
    const ok = S.lsaw.sf[i] === "r", okm = S.lsaw.sm[i] === "r";
    return {
      t, rv: S.ray.vf[i], rk: S.ray.k2[i],
      lv: ok ? S.lsaw.vf[i] : null,
      lk: S.lsaw.k2[i], lki: S.lsaw.k2[i] !== null && !(ok && okm),
    };
  };
  const table = [0, 20, 40, 41, 60, 64, 70, 90, 110, 120, 128, 129, 150, 170].map(row);
  return { meta, sweep: S, theta: th, table, ...(await sectionData(REFS)) };
};
