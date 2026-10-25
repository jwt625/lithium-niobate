// Chapter 2.1 Birefringence and the index ellipsoid: shell overrides, every number the page prints (computed here from
// src/lib/physics at prerender, so the static page shows final values), the default markup of F2-01/F2-02/F2-03 in both
// variants, and the page's popups and reference list (refs.yaml / glossary.yaml keys found in this page and its modules).
import type { PageMeta } from "$lib/content/site";
import { lightContent } from "$lib/figures/light/content.server";
import { c21, cono21Overlay, cono21Readout, bench21SVG, SET_HEAD } from "$lib/figures/light/f21-cono";
import { e21, ell21Ascii, ell21PlotSVG, ell21Readout } from "$lib/figures/light/f21-ell";
import { d21, disp21Rows, disp21SVG, NELSON } from "$lib/figures/light/f21-disp";
import { rowsHTML } from "$lib/figures/light/f21-disp-mount";
import { SETS21 } from "$lib/figures/light/f21-common";
import { d2nDlambda2, dnDT, groupIndex, refractiveIndex } from "$lib/physics/sellmeier.ts";
import { GAYER_MGO1SLN_E, GAYER_MGO5_E, GAYER_MGO5_O, JUNDT_CLN_E, ZELMON_CLN_E, ZELMON_CLN_O } from "$lib/physics/constants.ts";
import { maxWalkoff, opticAxisTilt, ringAngles } from "$lib/physics/ellipsoid.ts";
import { qpmPeriodSHG } from "$lib/physics/phasematching.ts";
import { schlarbIndex } from "$lib/physics/schlarb.ts";
import { morettiDnDT } from "$lib/physics/thermal.ts";
import { bisect } from "$lib/physics/linalg.ts";

const RAW = import.meta.glob(["./+page.svelte", "/src/lib/figures/light/f21-*.ts"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const MINUS = "−";
const f = (v: number, d: number): string => (v < 0 ? MINUS : "") + Math.abs(v).toFixed(d);
const sci = (v: number, d: number): string => { const e = Math.floor(Math.log10(Math.abs(v))); return `${f(v / 10 ** e, d)}&times;10<sup>${e < 0 ? MINUS : ""}${Math.abs(e)}</sup>`; };

export const load = async () => {
  const meta: Partial<PageMeta> = {
    title: "Birefringence",
    description: "Chapter 2.1: birefringence of lithium niobate in three depth layers: conoscope of a z-cut plate under a transverse field, index ellipsoid and walk-off, Sellmeier models with errata, thermo-optic coefficients.",
    keys: ["P", "P-comp", "P-db", "S", "reported", "derived"],
    aside: "bias",
  };
  const no = (l: number): number => refractiveIndex(ZELMON_CLN_O, l), ne = (l: number): number => refractiveIndex(ZELMON_CLN_E, l);
  const LAMS = [0.4, 0.532, 0.6328, 0.775, 1.064, 1.31, 1.55, 2.0, 3.39, 5.0];
  const table = LAMS.map((l) => ({ l: l.toFixed(l === 0.6328 ? 4 : 3), no: no(l).toFixed(5), ne: ne(l).toFixed(5), dn: f(ne(l) - no(l), 5), ngo: groupIndex(ZELMON_CLN_O, l).toFixed(4), nge: groupIndex(ZELMON_CLN_E, l).toFixed(4) }));
  const zgvd = (m: typeof ZELMON_CLN_O): number => bisect((l) => d2nDlambda2(m, l), 1.5, 2.5, 1e-9);
  const rings = ringAngles(1.0, 0.6328, 3, no(0.6328), ne(0.6328));
  const wo = [0.6328, 1.064, 1.55].map((l) => maxWalkoff(no(l), ne(l)));
  const tk = opticAxisTilt({ E_V_per_m: 1e6, dir: "x", eo: SETS21.kaminow, no: no(0.6328), ne: ne(0.6328), lam_um: 0.6328, d_mm: 1 });
  const ty = opticAxisTilt({ E_V_per_m: 1e6, dir: "y", eo: SETS21.kaminow, no: no(0.6328), ne: ne(0.6328), lam_um: 0.6328, d_mm: 1 });
  const tt = opticAxisTilt({ E_V_per_m: 1e6, dir: "x", eo: SETS21.turner, no: no(0.6328), ne: ne(0.6328), lam_um: 0.6328, d_mm: 1 });
  const jE = refractiveIndex(JUNDT_CLN_E, 1.55, 24.5);
  const jdn = [0.6328, 1.064, 1.55].map((l) => dnDT(JUNDT_CLN_E, l, 25));
  const gay = { e: refractiveIndex(GAYER_MGO5_E, 1.55, 24.5), o: refractiveIndex(GAYER_MGO5_O, 1.55, 24.5) };
  const gdn = [dnDT(GAYER_MGO5_E, 1.55, 24.5), dnDT(GAYER_MGO5_O, 1.55, 24.5), dnDT(GAYER_MGO1SLN_E, 1.55, 24.5)];
  const sch = { o: schlarbIndex("o", 632.8, 50.0), e: schlarbIndex("e", 632.8, 50.0) };
  const mor = { e: morettiDnDT("e", 300), o: morettiDnDT("o", 300) };
  const dZJ = jE - ne(1.55), dT = 3.5 * jdn[2];
  const N = {
    no1550: no(1.55).toFixed(4), ne1550: ne(1.55).toFixed(4), dn1550: f(ne(1.55) - no(1.55), 5),
    rings: rings.map((a) => a.toFixed(1)), ringsP: rings.map((a) => a.toFixed(2)),
    wo: wo.map((w) => ({ r: w.rho_deg.toFixed(3), t: w.theta_deg.toFixed(2) })),
    birRatio: ((no(0.4) - ne(0.4)) / (no(5) - ne(5))).toFixed(1),
    gvdE: zgvd(ZELMON_CLN_E).toFixed(3), gvdO: zgvd(ZELMON_CLN_O).toFixed(3),
    nel: NELSON.map(([l, o, e]) => ({ l: (l * 1000).toFixed(1), o: o.toFixed(4), e: e.toFixed(4), zo: no(l).toFixed(4), ze: ne(l).toFixed(4), d: f(ne(l) - e, 4), dno: f(no(l) - o, 4) })),
    jE: jE.toFixed(5), ze1550: ne(1.55).toFixed(5), dZJ: sci(dZJ, 1), dT: sci(dT, 1), dRes: sci(dZJ - dT, 1),
    gay: { e: gay.e.toFixed(5), o: gay.o.toFixed(5) },
    jdn: jdn.map((v) => sci(v, 2)), gdn: gdn.map((v) => sci(v, 2)),
    sch: { o: sch.o.toFixed(4), e: sch.e.toFixed(4) },
    mor: { e: sci(mor.e, 2), o: sci(mor.o, 2) },
    pZ: qpmPeriodSHG(1.55, ne).toFixed(3), pJ: qpmPeriodSHG(1.55, (l, T) => refractiveIndex(JUNDT_CLN_E, l, T), 1, 24.5).toFixed(3),
    dPer: ((qpmPeriodSHG(1.55, ne) - qpmPeriodSHG(1.55, (l, T) => refractiveIndex(JUNDT_CLN_E, l, T), 1, 24.5)) * 1000).toFixed(0),
    fdn: sci(tk.dn_z, 3), fret: tk.retardance_z.toFixed(3),
    tFO: { i: tk.tiltInt_firstOrder_deg.toFixed(2), e: tk.tiltExt_firstOrder_deg.toFixed(2) },
    tKx: { i: tk.tiltInt_deg.toFixed(2), e: tk.tiltExt_deg.toFixed(2) }, tKy: { i: ty.tiltInt_deg.toFixed(2), e: ty.tiltExt_deg.toFixed(2) },
    tTx: { i: tt.tiltInt_deg.toFixed(2), e: tt.tiltExt_deg.toFixed(2) },
    r22K: SETS21.kaminow.r22, r51K: SETS21.kaminow.r51, r51T: SETS21.turner.r51, r22Z: SETS21.zook.r22,
  };
  const dr = disp21Rows(d21);
  const init = {
    c21: { ov: cono21Overlay(c21), ro: cono21Readout(c21), bench: bench21SVG(c21, false), head: SET_HEAD(c21.set) },
    e21: { ascii: ell21Ascii(e21), plot: ell21PlotSVG(e21), ro: ell21Readout(e21) },
    d21: { svgT: disp21SVG(d21, false), svgV: disp21SVG(d21, true), rowsT: rowsHTML(false), rowsV: rowsHTML(true), spread: dr.spread, flag: dr.flag },
  };
  const content = await lightContent(Object.values(RAW));
  return { meta, N, table, init, content };
};
