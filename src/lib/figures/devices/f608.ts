// F6.08 SHG converter: undepleted P2 = eta L^2 P1^2 and depleted P2 = P1 tanh^2(sqrt(eta P1) L) (coupledmode.ts,
// phase matched, lossless), bulk QPM period from Zelmon CLN (optics.ts qpmPeriodSHG).
import { shgDepleted, shgUndepleted } from "$lib/physics/coupledmode.ts";
import { qpmPeriodSHG } from "../optics.ts";
import { spectral } from "../spectral.ts";
import { Plot, arrow, type Look } from "./svgplot.ts";
import { pad } from "../fmt.ts";

export interface ShgState { [k: string]: number | string | boolean; eta: number; L: number; P1: number; lam: number }
export const SHG_DEFAULT: ShgState = { eta: 2600, L: 4, P1: 20, lam: 1.55 };
const etaSI = (s: ShgState): number => s.eta * 100; // %/W/cm^2 -> 1/(W m^2)
export const p2mW = (s: ShgState, P1mW = s.P1): number => shgDepleted(etaSI(s), P1mW / 1000, s.L / 1000) * 1000;
export function shgOuts(s: ShgState): Record<string, string> {
  const P2 = p2mW(s);
  const etaL2 = s.eta * (s.L / 10) ** 2;
  return {
    etaL2: `${pad(etaL2.toFixed(1), 8)} %/W`, P2: `${pad(P2.toFixed(3), 8)} mW`, conv: `${pad(((100 * P2) / s.P1).toFixed(1), 5)} %`, Lam: `${pad(qpmPeriodSHG(s.lam).toFixed(2), 6)} µm`,
    eta: `${pad(s.eta.toFixed(0), 5)} %/W/cm²`, L: `${pad(s.L.toFixed(1), 4)} mm`, P1: `${pad(s.P1 < 10 ? s.P1.toFixed(2) : s.P1.toFixed(1), 6)} mW`, lam: `${pad((s.lam * 1000).toFixed(0), 4)} nm`, lam2: `${pad((s.lam * 500).toFixed(0), 3)} nm`,
  };
}
export function shgPlot(s: ShgState, w: number, h: number, look: Look): string {
  const p = new Plot({ w, h, look, x: { min: 0.1, max: 1000, log: true, label: "pump power P<tspan dy='3' font-size='0.8em'>ω</tspan><tspan dy='-3'> (mW)</tspan>" }, y: { min: 1e-6, max: 1000, log: true, label: "SH power P<tspan dy='3' font-size='0.8em'>2ω</tspan><tspan dy='-3'> (mW)</tspan>" } }).axes();
  const un: [number, number][] = [], de: [number, number][] = [], id: [number, number][] = [];
  for (let i = 0; i <= 160; i++) {
    const P = 0.1 * 10 ** (4 * i / 160);
    un.push([P, shgUndepleted(etaSI(s), P / 1000, s.L / 1000) * 1000]);
    de.push([P, p2mW(s, P)]);
    id.push([P, P]);
  }
  p.line(id, "iso");
  p.text(p.sx(300) - 4, p.sy(300) - 6, "P<tspan dy='3' font-size='0.8em'>2ω</tspan><tspan dy='-3'> = P</tspan><tspan dy='3' font-size='0.8em'>ω</tspan>", "lab", "end");
  p.line(un, "ref");
  p.line(de, look === "tech" ? "cur" : "cur shg775");
  p.add(`<circle class="pt0" cx="${p.sx(s.P1).toFixed(1)}" cy="${p.sy(Math.max(1e-6, p2mW(s))).toFixed(1)}" r="${look === "tech" ? 3.5 : 6}"/>`);
  // chen2024nn: > 80% at 20 mW (lower bound on P2 at P1 = 20 mW), reported
  const x = p.sx(20), y = p.sy(16), r = look === "tech" ? 4 : 6;
  p.add(`<path class="mk pl-tfln ho" data-id="chen2024nn" tabindex="0" d="M${x} ${y - r * 1.25}L${x + r} ${y}L${x} ${y + r * 1.25}L${x - r} ${y}Z"/>`);
  p.add(arrow(x, y - r * 1.25, 0, -1, look === "tech" ? 12 : 16, "bd"));
  p.text(x + 8, y + 4, "Chen 2023", "lab");
  p.text(p.x0 + 8, p.y1 + (look === "tech" ? 12 : 16), "dashed: undepleted (slope 2); solid: depleted tanh²", "lab");
  return p.svg(`dv-plot ${look}`, "Second-harmonic power versus pump power");
}
/** Poled waveguide at 2 px per um (motif scale): domains of half-period Lambda/2, pump fading and SH growing along z. */
export function shgArt(s: ShgState, w: number, h: number): string {
  const Lam = qpmPeriodSHG(s.lam), half = Lam; // px: 2 px/um x Lambda/2
  const y0 = h * 0.35, hh = h * 0.3, x0 = 20, x1 = w - 20;
  const doms: string[] = [];
  for (let x = x0, i = 0; x < x1; x += half, i++) if (i % 2 === 0) doms.push(`<rect class="dom" x="${x.toFixed(1)}" y="${y0}" width="${Math.min(half, x1 - x).toFixed(1)}" height="${hh}"/>`);
  const eta = etaSI(s), P0 = s.P1 / 1000, Lm = s.L / 1000, n = 48, seg = (x1 - x0) / n;
  const c775 = spectral(775, 0.9);
  const pump: string[] = [], sh: string[] = [];
  for (let i = 0; i < n; i++) {
    const z = ((i + 0.5) / n) * Lm, f = Math.tanh(Math.sqrt(eta * P0) * z) ** 2;
    const xa = x0 + i * seg;
    pump.push(`<path class="ir" d="M${xa.toFixed(1)} ${(y0 + hh * 0.35).toFixed(1)}h${seg.toFixed(1)}" style="opacity:${(0.1 + 0.9 * (1 - f)).toFixed(2)}"/>`);
    sh.push(`<path d="M${xa.toFixed(1)} ${(y0 + hh * 0.65).toFixed(1)}h${seg.toFixed(1)}" stroke="${c775}" stroke-width="3" style="opacity:${(0.06 + 0.94 * f).toFixed(2)}"/>`);
  }
  return `<svg class="dv-art visual" viewBox="0 0 ${w} ${h}" width="100%" height="100%" role="img" aria-label="Periodically poled waveguide with pump and second harmonic">`
    + `<text x="${x0}" y="${(y0 - 12).toFixed(1)}">${w < 700 ? `domains at 2 px/µm, Λ = ${Lam.toFixed(2)} µm` : `+z / −z domains at 2 px per µm: Λ = ${Lam.toFixed(2)} µm (bulk CLN, 21 C); power profile drawn over L = ${s.L.toFixed(1)} mm`}</text>`
    + doms.join("") + `<rect class="dim" x="${x0}" y="${y0}" width="${x1 - x0}" height="${hh}" fill="none"/>` + pump.join("") + sh.join("")
    + `<text x="${x0}" y="${(y0 + hh + 22).toFixed(1)}">pump ${(s.lam * 1000).toFixed(0)} nm${w < 700 ? "" : " (false color, dashed)"} → SH ${(s.lam * 500).toFixed(0)} nm</text></svg>`;
}
