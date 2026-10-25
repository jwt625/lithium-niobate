// F6.09 OPO threshold: triply resonant degenerate OPO (775 nm pump -> 1550 nm signal/idler), classical coupled-mode
// steady state (devices.ts opoTriplyResonant; threshold formula in its docstring). Below threshold the output is 0.
import { kappaFromQ, opoTriplyResonant } from "$lib/physics/devices.ts";
import { Plot, type Look } from "./svgplot.ts";
import { pad } from "../fmt.ts";
import { spectral } from "../spectral.ts";

export interface OpoState { [k: string]: number | string | boolean; Qi: number; reg: string; g: number; P: number }
export const OPO_DEFAULT: OpoState = { Qi: 1e6, reg: "critical", g: 1e6, P: 100 };
const RHO: Record<string, number> = { critical: 1, under: 0.5, over: 2 }; // Q_i / Q_c (template for under / over)
function run(s: OpoState, PuW: number) {
  const k = (lam: number) => { const k0 = kappaFromQ(lam, s.Qi), kex = k0 * (RHO[s.reg] ?? 1); return { k: k0 + kex, kex }; };
  const p = k(0.775), sg = k(1.55);
  return opoTriplyResonant({ lam_p_um: 0.775, lam_s_um: 1.55, kappa_p: p.k, kappa_p_ex: p.kex, kappa_s: sg.k, kappa_s_ex: sg.kex, kappa_i: sg.k, g: 2 * Math.PI * s.g, Pin_W: PuW * 1e-6 });
}
export const pth = (s: OpoState): number => run(s, 1).Pth_W * 1e6;
const uw = (v: number): string => (v >= 1e5 ? `${pad((v / 1000).toFixed(1), 8)} mW` : `${pad(v.toFixed(2), 8)} µW`);
export function opoOuts(s: OpoState): Record<string, string> {
  const r = run(s, s.P);
  return { Pth: uw(r.Pth_W * 1e6), Psig: uw(r.Psig_W * 1e6), P: uw(s.P), Qi: pad(s.Qi.toExponential(2).replace("e+", "e"), 7), g: `${pad((s.g / 1e6).toFixed(3), 6)} MHz`, state: r.Psig_W > 0 ? "oscillating" : "below threshold" };
}
export const DEVS: { id: string; lo: number; hi: number; label: string }[] = [
  { id: "gao2021njp", lo: 19.6, hi: 19.6, label: "19.6" },
  { id: "lu2021optica", lo: 30, hi: 30, label: "about 30" },
  { id: "mckenna2022", lo: 10, hi: 99, label: "tens of" },
];
export function opoPlot(s: OpoState, w: number, h: number, look: Look): string {
  const p = new Plot({ w, h, look, x: { min: 1, max: 1e4, log: true, label: "on-chip pump power (µW)" }, y: { min: 1e-3, max: 1e4, log: true, label: "signal output (µW)" } }).axes();
  const th = pth(s);
  const pts: [number, number][] = [];
  for (let i = 0; i <= 200; i++) { const P = 10 ** (4 * i / 200); if (P > th) pts.push([P, run(s, P).Psig_W * 1e6]); }
  if (p.inX(th)) {
    p.vline(th, "xh");
    p.add(`<path class="cur" d="M${p.x0} ${p.y0 - 1}H${p.sx(th).toFixed(1)}"/>`);
    p.text(p.sx(th) + 4, p.y1 + (look === "tech" ? 10 : 14), "P<tspan dy='3' font-size='0.8em'>th</tspan>", "lab");
  } else p.add(`<path class="cur" d="M${p.x0} ${p.y0 - 1}H${p.x1}"/>`);
  if (pts.length) p.line([[th * 1.0001, 1e-3], ...pts], "cur");
  p.text(p.x0 + 6, p.y0 - 6, "output 0 below threshold", "lab");
  const yb = p.y0 - (look === "tech" ? 22 : 30);
  for (const d of DEVS) {
    const a = p.sx(d.lo), b = p.sx(d.hi), r = look === "tech" ? 3.5 : 5;
    if (d.hi > d.lo) p.add(`<path class="bd" d="M${a.toFixed(1)} ${yb}H${b.toFixed(1)}M${a.toFixed(1)} ${yb - 4}v8M${b.toFixed(1)} ${yb - 4}v8"/>`);
    else p.add(`<path class="mk pl-tfln ho" d="M${a.toFixed(1)} ${yb - r * 1.25}l${r} ${r * 1.25}l${-r} ${r * 1.25}l${-r} ${-r * 1.25}z"/>`);
  }
  p.add(`<rect class="hit" data-id="opo-devs" tabindex="0" x="${(p.sx(10) - 6).toFixed(1)}" y="${yb - 10}" width="${(p.sx(99) - p.sx(10) + 12).toFixed(1)}" height="20"/>`);
  p.text(p.sx(99) + 6, yb + 4, "reported thresholds", "lab");
  return p.svg(`dv-plot ${look}`, "OPO signal output versus pump power");
}
/** VISUAL: ring that stays dark below threshold and lights at threshold (glow follows signal / pump). */
export function opoArt(s: OpoState, w: number, h: number): string {
  const r = run(s, s.P), on = r.Psig_W > 0, frac = on ? Math.min(1, (r.Psig_W / (s.P * 1e-6)) * 3) : 0;
  const R = Math.min(h * 0.3, w * 0.18), cx = w / 2, cy = h * 0.42, by = cy + R + 10;
  const c775 = spectral(775, 0.95);
  return `<svg class="dv-art visual" viewBox="0 0 ${w} ${h}" width="100%" height="100%" role="img" aria-label="OPO ring: dark below threshold, lit above">`
    + `<circle class="wg" cx="${cx}" cy="${cy}" r="${R.toFixed(1)}"/>`
    + (on ? `<circle class="ir" cx="${cx}" cy="${cy}" r="${R.toFixed(1)}" style="opacity:${(0.35 + 0.65 * frac).toFixed(2)}; stroke-width:${(2.5 + 5 * frac).toFixed(1)}px"/>` : "")
    + `<path class="wg" d="M20 ${by}H${w - 20}"/><path d="M20 ${by}H${cx}" stroke="${c775}" stroke-width="3"/>`
    + (on ? `<path class="ir" d="M${cx} ${by}H${w - 20}" style="opacity:${(0.3 + 0.7 * frac).toFixed(2)}"/>` : "")
    + `<text x="20" y="${by + 22}">pump 775 nm</text><text x="${w - 20}" y="${by + 22}" text-anchor="end">${on ? "signal + idler 1550 nm (false color)" : "no signal: below threshold"}</text></svg>`;
}
