// Build-time electrostatics for F05-10: coplanar electrodes (tooth tip at V, counter electrode at 0, gap g along crystal Z)
// on 600 nm x-cut LN / 4.7 um SiO2 / Si, solved by electrostatics.solveStack2D (finite volume, derived). LN permittivity:
// free (T) kushibiki1999 values via rf.lnLayer("x-cut, field along z"); SiO2 and Si: rf templates; cover: air (template;
// the reported process uses silicone oil, permittivity not sourced). Gap 10 um: template. Output: |E| and E_lateral in the
// film, normalized to the nominal field V/g, on a small grid for the page.
import { solveStack2D, nodalField, fieldAt } from "$lib/physics/electrostatics.ts";
import { lnLayer, SIO2_TEMPLATE, SI_TEMPLATE } from "$lib/physics/rf.ts";
import { EPS_T_KUSHIBIKI1999 } from "$lib/physics/constants.ts";

export interface PolingField { gap_um: number; film_um: number; xs: number[]; zs: number[]; mag: number[][]; lat: number[][]; iterations: number; resid: number }

export function polingField(): PolingField {
  const g = 10e-6, h = 600e-9;
  const ln = lnLayer("x-cut, field along z", h, EPS_T_KUSHIBIKI1999);
  const r = solveStack2D({
    layers: [{ name: "LN", thickness_m: h, epsX: ln.epsX, epsZ: ln.epsZ }, { name: "SiO2", thickness_m: 4.7e-6, epsX: SIO2_TEMPLATE.epsX, epsZ: SIO2_TEMPLATE.epsZ }, { name: "Si", thickness_m: 30e-6, epsX: SI_TEMPLATE.epsX, epsZ: SI_TEMPLATE.epsZ }],
    coverHeight_m: 40e-6, xMin_m: -40e-6, xMax_m: 40e-6,
    electrodes: [{ x0_m: -40e-6, x1_m: -g / 2, V: 1 }, { x0_m: g / 2, x1_m: 40e-6, V: 0 }],
    lateral: "neumann", bottom: "neumann", hMin_m: 25e-9, hMax_m: 2e-6, zExtra_m: [-h / 2],
  });
  const F = nodalField(r);
  const NX = 48, NZ = 12;
  const xs = Array.from({ length: NX }, (_, i) => -g / 2 - 2e-6 + ((i + 0.5) * (g + 4e-6)) / NX);
  const zs = Array.from({ length: NZ }, (_, j) => -((j + 0.5) * h) / NZ);
  const E0 = 1 / g;
  const mag: number[][] = [], lat: number[][] = [];
  for (const z of zs) {
    const m: number[] = [], l: number[] = [];
    for (const x of xs) { const f = fieldAt(r, F, x, z); m.push(+(Math.hypot(f.Ex, f.Ez) / E0).toFixed(3)); l.push(+(Math.abs(f.Ex) / E0).toFixed(3)); }
    mag.push(m); lat.push(l);
  }
  return { gap_um: g * 1e6, film_um: h * 1e6, xs: xs.map((x) => +(x * 1e6).toFixed(3)), zs: zs.map((z) => +(z * 1e6).toFixed(4)), mag, lat, iterations: r.iterations, resid: r.relResidual };
}
