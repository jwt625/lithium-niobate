// VISUAL refractive-index card (port of mockup/visual.js initDispersion): Zelmon 1997 n_o, n_e on a log wavelength axis
// 0.4-5 um, slider in log space, cursor in spectral color (visible) or declared false color (infrared, dashed).
import { nCLN } from "../optics.ts";
import { spectral } from "../spectral.ts";
import { pad } from "../fmt.ts";
import { Disposer, isLight, need } from "../dom.ts";
import { rangeFill } from "./range.ts";
import type { Part } from "./lifecycle.ts";

const L0 = 0.4, L1 = 5.0;
const X = (l: number): number => 44 + (Math.log(l / L0) / Math.log(L1 / L0)) * 500;
const Y = (n: number): number => 16 + ((2.46 - n) / 0.48) * 150;
const T = (x: number | string, y: number | string, s: string | number, cls = 3, extra = ""): string => `<text x="${x}" y="${y}" ${extra} fill="var(--v-text${cls === 1 ? "" : cls})" font-size="13">${s}</text>`;
export const lamOf = (v: number): number => L0 * (L1 / L0) ** (v / 1000);
export const sliderOf = (lam: number): number => (Math.log(lam / L0) / Math.log(L1 / L0)) * 1000;

/** Static plot with the cursor at 1550 nm (rendered at build time, updated by initDispersion). */
export function dispersionSVG(): string {
  const pts = (ax: "o" | "e"): string => { let d = ""; for (let i = 0; i <= 160; i++) { const l = L0 * (L1 / L0) ** (i / 160); d += `${i ? "L" : "M"}${X(l).toFixed(1)} ${Y(nCLN(ax, l)).toFixed(1)}`; } return d; };
  let stops = "";
  for (let nm = 400; nm <= 780; nm += 10) stops += `<stop offset="${((X(nm / 1000) - X(0.4)) / (X(0.78) - X(0.4))).toFixed(4)}" stop-color="${spectral(nm, 1, 0.02)}"/>`;
  let tk = "";
  [0.4, 0.6, 1, 2, 3, 5].forEach((l) => { tk += `<line x1="${X(l).toFixed(1)}" y1="166" x2="${X(l).toFixed(1)}" y2="172" stroke="var(--v-text3)"/>${T(X(l).toFixed(1), 188, l === 5 ? "5 µm" : l, 3, `text-anchor="${l === 5 ? "end" : "middle"}"${l === 5 ? ' dx="8"' : ""}`)}`; });
  [2.0, 2.1, 2.2, 2.3, 2.4].forEach((n) => { tk += `<line x1="38" y1="${Y(n).toFixed(1)}" x2="544" y2="${Y(n).toFixed(1)}" stroke="var(--v-line)"/>${T(32, (Y(n) + 4).toFixed(1), n.toFixed(1), 3, 'text-anchor="end"')}`; });
  const x = X(1.55).toFixed(1);
  return `<svg viewBox="0 0 560 196" role="img" aria-label="Ordinary and extraordinary index versus wavelength, Zelmon 1997">
      <defs><linearGradient id="g-vis2" gradientUnits="userSpaceOnUse" x1="${X(0.4).toFixed(1)}" x2="${X(0.78).toFixed(1)}" y1="0" y2="0">${stops}</linearGradient></defs>
      ${tk}<rect x="${X(0.4).toFixed(1)}" y="162" width="${(X(0.78) - X(0.4)).toFixed(1)}" height="4" fill="url(#g-vis2)"/>
      <path d="${pts("o")}" fill="none" stroke="var(--v-text)" stroke-width="2"/><path d="${pts("e")}" fill="none" stroke="var(--v-text2)" stroke-width="2" stroke-dasharray="7 4"/>
      ${T(X(0.45).toFixed(1), (Y(nCLN("o", 0.45)) - 8).toFixed(1), 'n<tspan baseline-shift="sub" font-size="9">o</tspan>', 1, 'dx="6"')}${T(X(0.45).toFixed(1), (Y(nCLN("e", 0.45)) + 18).toFixed(1), 'n<tspan baseline-shift="sub" font-size="9">e</tspan>', 2, 'dx="-6"')}
      <g id="g-n-cur"><line id="g-n-line" class="ir-el" y1="12" y2="166" stroke-width="1.5" x1="${x}" x2="${x}" stroke="var(--v-ir1550)" stroke-dasharray="4 3"/><circle id="g-n-po" r="4.5" fill="var(--v-text)" cx="${x}" cy="${Y(nCLN("o", 1.55)).toFixed(1)}"/><circle id="g-n-pe" r="4.5" fill="var(--v-ink0)" stroke="var(--v-text2)" stroke-width="2" cx="${x}" cy="${Y(nCLN("e", 1.55)).toFixed(1)}"/></g></svg>`;
}
/** Readout strings at wavelength lam (um). */
export const dispReadout = (l: number): { lam: string; no: string; ne: string; dn: string } => {
  const no = nCLN("o", l), ne = nCLN("e", l);
  return { lam: `${pad(Math.round(l * 1000).toString(), 4)} nm`, no: no.toFixed(4), ne: ne.toFixed(4), dn: (no - ne).toFixed(4) };
};

export function initDispersion(root: HTMLElement): Part {
  const dis = new Disposer();
  const box = need(root, "#g-n"), inp = need<HTMLInputElement>(root, "#v-lam");
  box.innerHTML = dispersionSVG();
  const line = need<SVGLineElement>(box, "#g-n-line"), po = need<SVGCircleElement>(box, "#g-n-po"), pe = need<SVGCircleElement>(box, "#g-n-pe");
  const oL = need(root, "#v-lam-o"), oNo = need(root, "#v-no"), oNe = need(root, "#v-ne"), oDn = need(root, "#v-dn");
  const upd = (): void => {
    const l = lamOf(+inp.value), x = X(l).toFixed(1), r = dispReadout(l);
    line.setAttribute("x1", x); line.setAttribute("x2", x);
    const vis = l <= 0.78;
    line.setAttribute("stroke", vis ? spectral(l * 1000, isLight() ? 0.45 : 1, 0.04) : "var(--v-ir1550)");
    line.setAttribute("stroke-dasharray", vis ? "" : "4 3");
    line.classList.toggle("ir-el", !vis);
    po.setAttribute("cx", x); po.setAttribute("cy", Y(nCLN("o", l)).toFixed(1)); pe.setAttribute("cx", x); pe.setAttribute("cy", Y(nCLN("e", l)).toFixed(1));
    oL.textContent = r.lam; oNo.textContent = r.no; oNe.textContent = r.ne; oDn.textContent = r.dn;
    inp.setAttribute("aria-valuetext", `${Math.round(l * 1000)} nanometers`);
    rangeFill(inp);
  };
  dis.on(inp, "input", upd);
  upd();
  return { repaint: upd, dispose: dis.run };
}
