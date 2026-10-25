// Chapter 2.5 Third-order effects: shell overrides, server-computed default markup of F2-11 and F2-12 (both variants),
// the worked-example numbers of L2 (computed with src/lib/physics, printed to the manuscript's digits), and the page's
// popups and reference list (refs.yaml / glossary.yaml keys found in this page and its figure modules).
import type { PageMeta } from "$lib/content/site";
import { lightContent } from "$lib/figures/light/content.server";
import { cascadedRK4 } from "$lib/physics/nonlinear.ts";
import { KERR0, kerrClosed, kerrPlotSVG, kerrRK4, kerrRO, kerrStageSVG, kerrTableHTML, rk4Points, ctlTxt, symlog, MAP } from "$lib/figures/light/f25-kerr";
import { ansatzFrame, combSVG, convRO, lleRO, LLE0, ringSVG, specPlot, tracePlot, wavePlot, KAPPA_TXT, TU_TXT, PF1_TXT, GAMMA_TXT } from "$lib/figures/light/f25-lle";

const RAW = import.meta.glob(["./+page.svelte", "/src/lib/figures/light/f25-*.ts"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;

export const load = async () => {
  const meta: Partial<PageMeta> = {
    title: "Third-order Effects",
    description: "Chapter 2.5: the Kerr effect in lithium niobate, cascaded chi(2) as a designable Kerr nonlinearity, and Kerr soliton combs from the Lugiato-Lefever equation, simulated in the browser.",
    keys: ["P-db", "S", "reported", "derived", "template"],
    aside: "bias",
  };
  const k = { ...KERR0 };
  const ko = kerrClosed(k), rk = kerrRK4(k), ro = kerrRO(ko, rk);
  const rkFull = cascadedRK4({ eta: k.eta, P_W: k.P, L_m: k.L, dk_per_m: k.dk }); // 20000 steps, worked example
  const fr = ansatzFrame(LLE0), lro = lleRO(fr), cv = convRO(LLE0, LLE0.z1);
  const e = (v: number, d: number): string => { const x = v.toExponential(d).split("e"); return `${x[0].replace("-", "&minus;")}&times;10<sup>${(+x[1]).toString().replace("-", "&minus;")}</sup>`; };
  const work = {
    gK: ko.gK.toFixed(3), phiC: e(ko.phiC, 4), argA: e(rkFull.argAw, 4), gC: Math.abs(ko.gC).toFixed(1), ratio: Math.abs(ko.ratio).toFixed(0),
    shAvg: e(rkFull.shMean, 1), shPk: e(rkFull.shPeak, 1), n2r: (1.8e-19 / 9.33e-20).toFixed(1), fit: fr.fit.toFixed(3),
  };
  const content = await lightContent(Object.values(RAW));
  return {
    meta,
    work,
    init: {
      k: {
        plot: kerrPlotSVG(k, ko, rk4Points(k), rk), table: kerrTableHTML(ro), stage: kerrStageSVG(k, ko), ro,
        dk: ctlTxt.dk(k.dk), p: ctlTxt.P(k.P), l: ctlTxt.L(k.L), eta: ctlTxt.eta(k.eta), aeff: ctlTxt.aeff(k.aeff),
        sDk: symlog(k.dk, 10), sP: MAP.P.from(k.P), sL: MAP.L.from(k.L), sEta: MAP.eta.from(k.eta), sAeff: MAP.aeff.from(k.aeff),
      },
      l: {
        tr: tracePlot(LLE0, [], [], [], null), sp: specPlot(LLE0, fr), wv: wavePlot(LLE0, fr),
        ring: ringSVG(LLE0, fr, 0), vtr: tracePlot(LLE0, [], [], [], null, true, "vt25"), comb: combSVG(LLE0, fr),
        ro: lro, cv, kappa: KAPPA_TXT, tu: TU_TXT, pf1: PF1_TXT, gamma: GAMMA_TXT,
      },
    },
    content,
  };
};
