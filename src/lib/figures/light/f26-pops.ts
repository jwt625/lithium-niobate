// Chapter 2.6 page popups (registered with usePops on /light/eo-combs/): derivations behind the derived readouts of
// the comb and shifter figures, the display-parameter note, and the two-bin false-color legend. Reference popups ("r:<id>") and
// glossary popups ("gl:<id>") come from content.server.ts.
import type { Pop } from "$lib/content/pops";
import { dfGHzToDlNm } from "$lib/physics/units.ts";

const D: [string, string][] = [["d", "derived"]];

export const EOCOMB_POPS: Record<string, Pop> = {
  "f26-tpl": {
    h: "Display parameters",
    body: "r, V<sub>p</sub>/V<sub>&pi;,rt</sub>, FSR and D<sub>2</sub> (comb figure) and G/&kappa;, &kappa;<sub>0</sub>/&kappa;, 2&mu;/2&pi; and the loaded Q of 1.0&times;10<sup>6</sup> (shifter figure) are set by the controls. They describe no measured device; the reported device results are in the table of L2.",
    badges: [["t", "template"]],
  },
  "f26-beta": {
    h: "Modulation index &beta;",
    body: "Peak round-trip phase modulation: &beta; = &pi; V<sub>p</sub> / V<sub>&pi;,rt</sub>, with V<sub>p</sub> the peak drive voltage and V<sub>&pi;,rt</sub> the voltage for a &pi; phase per round trip. Papers quote single-pass or round-trip indices and peak or rms voltages; convert before comparing slopes.",
    badges: D,
  },
  "f26-slope": {
    h: "Comb-line slope",
    body: "Far from the pump, line power falls by 8.686 asinh(|ln r|/&beta;) dB per line. The rate is set by the complex-time pole of eq. 2.18, where r e<sup>i&beta; cos t</sup> = 1. For high finesse F = &pi;&radic;r/(1 &minus; r) it becomes 27.29/(&beta;F) dB per line, an amplitude envelope e<sup>&minus;&pi;|k|/(&beta;F)</sup>. Numerical check: L3.",
    badges: D,
  },
  "f26-env": {
    h: "Analytic envelope",
    body: "Residue of eq. 2.18 at its pole t = &pi;/2 &minus; ia: |c<sub>k</sub>|<sup>2</sup> = |t<sub>c</sub>E<sub>in</sub>|<sup>2</sup> e<sup>&minus;2a|k|</sup> / (&beta; cosh a)<sup>2</sup>, a = asinh(|ln r|/&beta;). The lines next to the pump (k = 0, &plusmn;1) deviate from it; the pump-line excess is printed in dB.",
    badges: D,
  },
  "f26-count": {
    h: "Line count",
    body: "Lines within the threshold of the strongest line (the pump), counted on the FFT spectrum. The estimate 2&lfloor;threshold/slope&rfloor; + 1 refers the threshold to the envelope extrapolated to k = 0, which lies below the pump line by the printed excess, so it counts more lines; the difference is about twice the excess divided by the slope.",
    badges: D,
  },
  "f26-cmt": {
    h: "Coupled-mode view with dispersion",
    body: "Sideband equations 0 = (i&Delta;<sub>k</sub> &minus; &kappa;/2) a<sub>k</sub> + i (&beta;/2T<sub>rt</sub>)(a<sub>k&minus;1</sub> + a<sub>k+1</sub>) + &delta;<sub>k0</sub> &radic;&kappa;<sub>ex</sub> s, &Delta;<sub>k</sub> = &minus;(D<sub>2</sub>/2) k<sup>2</sup>, T<sub>rt</sub> = 1/FSR, solved over the same lines (design form: Buscaino et al. 2020). &kappa; = &kappa;<sub>ex</sub> = &minus;2 ln r / T<sub>rt</sub> gives the same asymptotic slope as eq. 2.18. Lines k &ne; 0 are scaled to eq. 2.18 units by 1/((1 &minus; r<sup>2</sup>)(&minus;2 ln r)); the count refers to the eq. 2.18 pump line.",
    badges: D,
  },
  "f26-eta": {
    h: "Shifter transfer",
    body: "Steady state of two supermode amplitudes, input into a, output from b: |s<sub>b,out</sub>/s<sub>in</sub>|<sup>2</sup> = &kappa;<sub>a,ex</sub>&kappa;<sub>b,ex</sub>G<sup>2</sup> / (&kappa;<sub>a</sub>&kappa;<sub>b</sub>/4 + G<sup>2</sup>)<sup>2</sup> at zero detuning (eq. 2.19). With &kappa;<sub>a</sub> = &kappa;<sub>b</sub> = &kappa; the maximum is (&kappa;<sub>ex</sub>/&kappa;)<sup>2</sup> at G = &kappa;/2, equal to 1 without intrinsic loss. A microwave detuned from 2&mu; by &delta; detunes the shifted light from supermode b by &delta;.",
    badges: D,
  },
  "f26-td": {
    h: "Time domain",
    body: "Fourth-order Runge-Kutta integration of the same two-mode equations for a step input at t = 0, 3000 steps to &kappa;t = 30. The printed difference to eq. 2.19 at &kappa;t = 30 checks the steady state.",
    badges: D,
  },
  "v-bins26": {
    h: "False color, two frequency bins",
    body: `Both bins lie near 1550 nm, &Omega;/2&pi; apart (28 GHz is ${dfGHzToDlNm(28, 1550).toFixed(2)} nm at 1550 nm). Input bin &omega;: magenta; shifted bin &omega; + &Omega;: violet. Declared false colors, always dashed.`,
    badges: D,
  },
};
