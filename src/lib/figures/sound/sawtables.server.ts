// Build-time SAW tables for section 3.3 (saw.sawCut): standard cuts with kushibiki1999, and the constant-set
// sensitivity (ogi2002 c, e, rho with kushibiki1999 eps^S; Warner 1967 c P-comp, e S, eps^S 44.3/27.9, rho 4700 assumed).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sawCut, sawFrameRotY, SAW_DEFAULT_MATERIAL } from "$lib/physics/saw.ts";
import { acousticMaterial, type AcousticMaterial } from "$lib/physics/acoustics.ts";
import { c3m, e3m, eps3m, namedCut } from "$lib/physics/tensors.ts";

export interface CutRow { cut: string; wave: string; vf: number; vm: number; k2: number; k2Status: string; freeStatus: string; lossF: number; lossM: number; vendor: string }
type Mat3 = ReturnType<typeof namedCut>;

function materials(): Record<string, AcousticMaterial> {
  const T = JSON.parse(readFileSync(resolve("src/lib/generated/tensors.json"), "utf8")) as { id: string; independent: Record<string, { value: number }> }[];
  const ind = (id: string) => { const r = T.find((x) => x.id === id); if (!r) throw new Error(`missing ${id}`); return Object.fromEntries(Object.entries(r.independent).map(([k, v]) => [k, v.value])) as never; };
  return {
    kushibiki1999: SAW_DEFAULT_MATERIAL,
    ogi2002: acousticMaterial(c3m(ind("elastic-stiffness-cE/unspecified/ogi2002")), e3m(ind("piezo-stress-e/unspecified/ogi2002")), eps3m(ind("permittivity-S/cln/kushibiki1999")), 4636),
    warner1967: acousticMaterial(c3m(ind("elastic-stiffness-cE/unspecified/weis1985-warner1967")), e3m(ind("piezo-stress-e/unspecified/ogi2002-warner1967")), eps3m(ind("permittivity-S/unspecified/weis1985-warner1967")), 4700),
  };
}

let cache: { cuts: CutRow[]; sens: { cut: string; vals: [number, number][] }[] } | null = null;
export function sawTables() {
  if (cache) return cache;
  const M = materials();
  const one = (m: AcousticMaterial, R: Mat3, br: "rayleigh" | "leaky") => sawCut(m, R, br);
  const defs: [string, string, Mat3, "rayleigh" | "leaky", string][] = [
    ["Y-Z", "Rayleigh", namedCut("Y-cut, Z-prop"), "rayleigh", "3488"],
    ["(YXl) 128°, 128° Y-X", "Rayleigh", sawFrameRotY(128), "rayleigh", "3980"],
    ["X-Z", "Rayleigh", namedCut("X-cut, Z-prop"), "rayleigh", "–"],
    ["X-Y", "Rayleigh", namedCut("X-cut, Y-prop"), "rayleigh", "–"],
    ["Z-X", "Rayleigh", namedCut("Z-cut, X-prop"), "rayleigh", "–"],
    ["(YXl) 64°", "leaky SAW", sawFrameRotY(64), "leaky", "4690"],
    ["(YXl) 41°", "leaky SAW", sawFrameRotY(41), "leaky", "4750"],
    ["(YXl) 36°", "leaky SAW", sawFrameRotY(36), "leaky", "–"],
  ];
  const cuts = defs.map(([cut, wave, R, br, vendor]) => {
    const r = one(M.kushibiki1999, R, br);
    return { cut, wave, vf: r.free.v, vm: r.met.v, k2: r.k2, k2Status: r.k2Status, freeStatus: r.free.status, lossF: r.free.loss_dB_per_lambda, lossM: r.met.loss_dB_per_lambda, vendor };
  });
  const sdefs: [string, Mat3, "rayleigh" | "leaky"][] = [["Y-Z", namedCut("Y-cut, Z-prop"), "rayleigh"], ["128° Y-X", sawFrameRotY(128), "rayleigh"], ["41° Y-X leaky", sawFrameRotY(41), "leaky"], ["64° Y-X leaky", sawFrameRotY(64), "leaky"]];
  const sens = sdefs.map(([cut, R, br]) => ({ cut, vals: (["kushibiki1999", "ogi2002", "warner1967"] as const).map((k) => { const r = one(M[k], R, br); return [r.free.v, r.k2] as [number, number]; }) }));
  cache = { cuts, sens };
  return cache;
}
