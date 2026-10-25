// Section 3.6 Acousto-optics: meta, references, acoustic velocities for Fig. 3.7, photoelastic sets for Fig. 3.8 (from
// the generated tensor records), and the X-/Y-cut pairing table computed with src/lib/physics/photoelastic.ts.
import type { PageMeta } from "$lib/content/site";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sectionData } from "$lib/figures/sound/content.server";
import { sawTables } from "$lib/figures/sound/sawtables.server";
import { christoffel, LN_KUSHIBIKI1999 } from "$lib/physics/acoustics.ts";
import { fullFrom3m, flipP14P41, longitudinal, inPlaneDir, inPlaneMaxima } from "$lib/physics/photoelastic.ts";
import { aoFiguresOfMerit, pFromM2 } from "$lib/physics/ao.ts";
import type { PSetIn } from "$lib/figures/sound/types";

const REFS = ["weis1985", "avakyants1976", "coquin-pinnow1971", "andrushchak2009", "krupych2014", "mys2015", "mytsyk2021", "sarabalis2020", "nelsonlax1970", "nelsonlax1971", "dixon1967", "chang1976", "zelmon1997", "p10", "wan2022", "atalar2022", "p03", "jiang2018-blog-photoelastic"];

export const load = async () => {
  const meta: Partial<PageMeta> = {
    title: "Acousto-optics",
    description: "Chapter 3.6: acousto-optics in lithium niobate: Bragg geometry, figures of merit, photoelastic tensor sets and the unresolved p14/p41 sign pairing that moves the X-cut optimum between 45 and 135 deg.",
    keys: ["P", "P-comp", "P-db", "S", "U", "reported", "derived"],
  };
  const T = JSON.parse(readFileSync(resolve("src/lib/generated/tensors.json"), "utf8")) as { id: string; independent: Record<string, { value: number }> }[];
  const ind = (id: string) => { const r = T.find((x) => x.id === id); if (!r) throw new Error(`missing ${id}`); return Object.fromEntries(Object.entries(r.independent).map(([k, v]) => [k, v.value])) as PSetIn["p"]; };
  const sets: PSetIn[] = [
    { id: "andrushchak2009", label: "Andrushchak 2009", p: ind("photoelastic-p/unspecified/andrushchak2009"), code: "S", pop: "r:andrushchak2009", frame: "not stated in the sources (via Sarabalis et al. 2020 Table I and Mytsyk et al. 2021 Table 6)." },
    { id: "avakyants1976", label: "Avakyants 1976 (Set B)", p: ind("photoelastic-p/unspecified/weis1985-avakyants1976"), code: "P-comp", pop: "r:weis1985", frame: "compiled in Weis & Gaylord 1985 (IRE 1949 axes) next to c14 > 0; the frame of the 1976 measurement is not stated." },
    { id: "krupych2014", label: "Krupych 2014", p: ind("photoelastic-p/unspecified/mys2015-krupych2014"), code: "S", pop: "r:mys2015", frame: "not stated; quoted with c14 > 0 (via Mys et al. 2015), with p14, p41 opposite in sign to the Weis & Gaylord 1985 compilation." },
    { id: "coquin", label: "Coquin (Pinnow 1971)", p: ind("photoelastic-p/unspecified/weis1985-coquin"), code: "P-comp", pop: "r:weis1985", frame: "IRE 1949 axes as compiled in Weis & Gaylord 1985." },
  ];
  const D = Math.PI / 180;
  const pair = sets.slice(0, 2).map((s) => {
    const A = fullFrom3m(s.p), B = fullFrom3m(flipP14P41(s.p));
    const at = (T4: Float64Array, cut: "X" | "Y") => [0, 45, 90, 135].map((a) => longitudinal(T4, inPlaneDir(cut, a * D)));
    return { label: s.label, XA: at(A, "X"), XB: at(B, "X"), mXA: inPlaneMaxima(A, "X"), mXB: inPlaneMaxima(B, "X"), mYA: inPlaneMaxima(A, "Y"), mYB: inPlaneMaxima(B, "Y") };
  });
  const c = sawTables().cuts;
  const modes = [
    { id: "XL" as const, label: "X longitudinal", v: christoffel(LN_KUSHIBIKI1999, [1, 0, 0]).v[0] },
    { id: "ZS" as const, label: "Z shear", v: christoffel(LN_KUSHIBIKI1999, [0, 0, 1]).v[1] },
    { id: "SAW" as const, label: "128° Y-X SAW", v: c[1].vf },
  ];
  // figure-of-merit consistency (weis1985 p. 201 inputs: n 2.20, rho 4.7e3, v 6.57e3; p implied by M2 = 6.99e-15)
  const pImp = pFromM2(6.99e-15, 2.2, 4700, 6570);
  const fom = aoFiguresOfMerit(2.2, pImp, 4700, 6570);
  return { meta, sets, pair, modes, fom: { p: pImp, ...fom }, ...(await sectionData(REFS)) };
};
