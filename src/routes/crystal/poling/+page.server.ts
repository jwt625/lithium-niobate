// 1.9 Poling and periodic poling: popups, reference list, derived table values and the prerendered final frame of FIG-01-09
// (Poling bench, default pulse), computed with src/lib/physics/ferro.ts through pbsim.ts / pbrender.ts. The default run is
// also checked here: integrated switching charge against 2 Ps A of the final map (acceptance 1, figures.md FIG-01-09).
import { sectionData } from "$lib/figures/crystal/sources.server";
import { POLING_TEMPLATE } from "$lib/physics/ferro.ts";
import { PB, PB_DEFAULT, PB_EL, PbRun, analyse, colPitch_um, elDuty, packState, patchArea, period_um } from "$lib/figures/crystal/pbsim";
import { loopASCII, loopSVG, mapASCII, readouts, scopeASCII, scopeSVG } from "$lib/figures/crystal/pbrender";
import page from "./+page.svelte?raw";

const PS = 0.71, PS_ALT = 0.8; // C/m^2, conflict c:ps (volk2008 Table 1.1 p. 3 / gopalan1998 abstract)

export const load = async () => {
  const r = new PbRun(PB_DEFAULT);
  r.finish();
  const a = analyse(r, PS);
  let cnt = 0;
  for (const v of r.st.s) cnt += v;
  const A = cnt * (patchArea() / r.st.s.length);
  const QA = 2 * PS * A;
  const rel = Math.abs(a.Qtot - QA) / QA;
  if (!(rel < 0.005)) throw new Error(`poling bench: charge check failed, |Q - 2 Ps A| / 2 Ps A = ${rel}`);
  // the same pulse without the hold (backswitching)
  const nb = new PbRun({ ...PB_DEFAULT, hold: false });
  nb.finish();
  let nbMax = 0;
  for (const x of nb.X) nbMax = Math.max(nbMax, x);
  const T = POLING_TEMPLATE.params;
  const wafer = (ps: number): string => (2 * ps * Math.PI * 0.0381 ** 2 * 1e3).toFixed(1); // mC, 76.2 mm wafer
  const el = (k: "a" | "b" | "c"): string => `${period_um(k).toFixed(2)} &micro;m, w/&Lambda; ${elDuty(k).toFixed(2)}`;
  return {
    ...(await sectionData({
      title: "1.9 Poling and periodic poling",
      description: "Poling lithium niobate: switched charge 2Ps (142 or 160 uC/cm^2), periodic poling through comb electrodes, milestones from 1962 to 1995, backswitching, domain merging and duty cycle, nucleation-and-growth kinetics and what the switching current measures, with an interactive poling bench.",
      keys: ["P", "P-comp", "S", "reported", "derived", "template"],
    }, page)),
    init: {
      s: packState(r.st.s),
      ro: readouts(r, a, "done"),
      map: mapASCII(r),
      scope: scopeASCII(r, a, PS, true),
      svg: scopeSVG(r, a, PS, true),
      loop: loopASCII(r, a, PS),
      loopSvg: loopSVG(r, a, PS),
    },
    num: {
      q2ps: (2 * PS * 100).toFixed(0), q2psAlt: (2 * PS_ALT * 100).toFixed(0),
      wafer: wafer(PS), waferAlt: wafer(PS_ALT),
      Qd: (a.Qtot * 1e12).toFixed(3), QAd: (QA * 1e12).toFixed(3), rel: rel === 0 ? "0" : rel.toExponential(1), Ad: (A * 1e12).toFixed(2),
      Xd: r.X[r.n].toFixed(3), nbMax: nbMax.toFixed(3), nbEnd: nb.X[nb.n].toFixed(3),
      kai: a.fit ? a.fit.n.toFixed(2) : "n/a", kaiT0: a.fit ? (a.fit.t0 * 1e3).toFixed(2) : "n/a", kaiR2: a.fit ? a.fit.r2.toFixed(2) : "n/a",
      C: (r.p.C_F * 1e15).toFixed(3), patch: (patchArea() * 1e12).toFixed(1),
      W: (PB.nx * colPitch_um).toFixed(1), H: (PB.ny * T.spacing_m * 1e6).toFixed(1),
      ratio: (PS / PS_ALT).toFixed(3), ratioInv: (PS_ALT / PS).toFixed(3),
      el: { a: el("a"), b: el("b"), c: el("c") },
      elCols: `${PB_EL.a.w}/${PB_EL.a.period}, ${PB_EL.b.w}/${PB_EL.b.period}, ${PB_EL.c.w}/${PB_EL.c.period}`,
      p: {
        spacing: (T.spacing_m * 1e6).toFixed(2), Ec: (T.Ec / 1e6).toFixed(0), Eint: (T.Eint / 1e6).toFixed(1), d: (T.thickness_m * 1e3).toFixed(1),
        nuNuc: T.nuNuc.toFixed(0), interiorNuc: String(T.interiorNuc), alphaNuc: String(T.alphaNuc),
        nuStep1: T.nuStep1.toFixed(0), nuStep2: T.nuStep2.toFixed(0), nuKink: T.nuKink.toExponential(0).replace("e+", " &times; 10<sup>") + "</sup>",
        alphaWall: String(T.alphaWall), fringe: String(T.fringe), tauStab: (T.tauStab_s * 1e3).toFixed(0), nuBack: T.nuBack.toFixed(0), hold: String(T.holdFraction),
        dt: (PB.dt * 1e3).toFixed(2), tr: (PB.tr * 1e3).toFixed(1), tail: (PB.tail * 1e3).toFixed(0), holdLen: (PB.holdLen * 1e3).toFixed(0),
      },
    },
  };
};
