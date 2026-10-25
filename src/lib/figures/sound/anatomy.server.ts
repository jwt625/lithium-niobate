// Build-time SAW field profiles for Fig. 3.5 (saw.sawCut + saw.sawFields, kushibiki1999), five cut presets, free and
// metallized surface; complex u1, u2, u3, phi vs depth (0 to -3 wavelengths, 121 samples).
import { sawCut, sawProblem, sawFields, sawFrameRotY, SAW_DEFAULT_MATERIAL } from "$lib/physics/saw.ts";
import { namedCut } from "$lib/physics/tensors.ts";
import type { SawPreset, SawProfile } from "./types";

let cache: SawPreset[] | null = null;
export function anatomyPresets(): SawPreset[] {
  if (cache) return cache;
  const m = SAW_DEFAULT_MATERIAL;
  const defs: [SawPreset["id"], string, string, ReturnType<typeof namedCut>, "rayleigh" | "leaky"][] = [
    ["YZ", "Y-Z", "Rayleigh", namedCut("Y-cut, Z-prop"), "rayleigh"],
    ["128", "128° Y-X", "Rayleigh", sawFrameRotY(128), "rayleigh"],
    ["64", "64° Y-X", "leaky SAW", sawFrameRotY(64), "leaky"],
    ["XZ", "X-Z", "Rayleigh", namedCut("X-cut, Z-prop"), "rayleigh"],
    ["XY", "X-Y", "Rayleigh", namedCut("X-cut, Y-prop"), "rayleigh"],
  ];
  const r4 = (x: number): number => Math.round(x * 1e4) / 1e4;
  cache = defs.map(([id, label, wave, R, br]) => {
    const cut = sawCut(m, R, br);
    const P = sawProblem(m, R);
    const prof = (s: "open" | "short"): SawProfile => {
      const root = s === "open" ? cut.free : cut.met;
      const F = sawFields(P, s, root.v, root.vIm, 3, 121);
      return { v: root.v, vIm: root.vIm, orbit: F.orbit, frac: F.fracWithin1Lambda, bc: F.bcResidual, depth: Array.from(F.depth, r4), c: F.comp.map((a) => Array.from(a, r4)) };
    };
    return { id, label, wave, open: prof("open"), short: prof("short") };
  });
  return cache;
}
