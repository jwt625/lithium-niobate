// VISUAL MZM li2026aa (port of mockup/visual.js initMZM): push-pull top view (waveguides in the gaps of a G-S-G line,
// 1550 nm in declared false color), T(V) with the reported V_pi = 2.90 V (solid) and the engine curve (dashed,
// V_pi L 2.697 V cm over 0.9 cm), fixed-format readouts. T = cos^2(pi V / 2 V_pi). Drive voltage shared (figstate.mzm).
import { mzm as MS } from "$lib/stores/figstate";
import { mzmTransmission } from "$lib/physics/modulator.ts";
import { MINUS, pad, sgn } from "../fmt.ts";
import { Disposer, need } from "../dom.ts";
import { rangeFill } from "./range.ts";
import type { Part } from "./lifecycle.ts";

export const VPI = 2.9;                 // reported, li2026aa-d, 1550 nm
export const VPI_ENG = 2.697 / 0.9;     // engine V_pi L 2.697 V cm over L = 0.9 cm (DevLog-003, L3)
const x1 = 250, x2 = 750, ya = 120, yb = 220, sp = 25;
const X = (v: number): number => 44 + ((v + 6) / 12) * 360, Y = (t: number): number => 16 + (1 - t) * 170;

/** Static top view (rendered at build time). */
export function mzmArtSVG(): string {
  const wg = `M20 170H130C175 170 180 ${ya} 225 ${ya}H775C820 ${ya} 825 170 870 170H980M130 170C175 170 180 ${yb} 225 ${yb}H775C820 ${yb} 825 170 870 170`;
  return `<svg viewBox="0 0 1000 350" role="img" aria-label="Top view of the push-pull Mach-Zehnder modulator: Y-splitter, two arms in the gaps of a ground-signal-ground line, Y-combiner">
      <rect x="${x1}" y="40" width="${x2 - x1}" height="65" fill="var(--v-au)" fill-opacity="0.85"/><rect x="${x1}" y="135" width="${x2 - x1}" height="70" fill="var(--v-au)" fill-opacity="0.85"/><rect x="${x1}" y="235" width="${x2 - x1}" height="65" fill="var(--v-au)" fill-opacity="0.85"/>
      <text x="${x1 + 12}" y="78" class="m1">G</text><text x="${x1 + 12}" y="176" class="m1">S</text><text x="${x1 + 12}" y="273" class="m1">G</text>
      <path class="ir-el" d="${wg}" fill="none" stroke="var(--v-ir1550)" stroke-width="3" stroke-dasharray="9 5"/>
      <g id="mzm-ticks" class="ir-el"></g><g id="mzm-field"></g>
      <circle id="mzm-out" cx="980" cy="170" r="16" fill="var(--v-ir1550)" fill-opacity="1.000" class="ir-el"/>
      <path d="M${x1} 322V314M${x2} 322V314M${x1} 318H${x2}" stroke="var(--v-text3)" fill="none"/><text x="${(x1 + x2) / 2}" y="340" text-anchor="middle" class="m2">9 mm</text>
      <g transform="translate(40 300)"><path d="M0 0V-40M0 -40l-4 7M0 -40l4 7M0 0H40M40 0l-7-4M40 0l-7 4" stroke="var(--v-text2)" stroke-width="1.4" fill="none"/><text x="8" y="-34" class="m2">c (z)</text><text x="46" y="5" class="m2">y</text></g>
      <text x="20" y="160" class="m2">1550 nm in</text>
      <text x="990" y="340" text-anchor="end" class="m3">gaps drawn 90× wider than the length scale</text>
      <style>.m1{font:600 18px var(--v-ui);fill:var(--v-ink0)}.m2{font:500 14px var(--v-ui);fill:var(--v-text2)}.m3{font:400 12px var(--v-ui);fill:var(--v-text3)}</style></svg>`;
}
/** Static T(V) plot with the cursor at V = 0 (rendered at build time). */
export function mzmCurveSVG(): string {
  const curve = (vp: number): string => { let d = ""; for (let i = 0; i <= 240; i++) { const v = -6 + (i / 240) * 12; d += `${i ? "L" : "M"}${X(v).toFixed(1)} ${Y(mzmTransmission(v, vp)).toFixed(1)}`; } return d; };
  let tk = "";
  [-6, -3, 0, 3, 6].forEach((v) => { tk += `<line x1="${X(v)}" y1="186" x2="${X(v)}" y2="192" stroke="var(--v-text3)"/><text x="${X(v)}" y="208" text-anchor="middle" font-size="13" fill="var(--v-text3)">${v < 0 ? MINUS + -v : v}</text>`; });
  [0, 0.5, 1].forEach((t) => { tk += `<line x1="40" y1="${Y(t)}" x2="404" y2="${Y(t)}" stroke="var(--v-line)"/><text x="34" y="${Y(t) + 4}" text-anchor="end" font-size="13" fill="var(--v-text3)">${t}</text>`; });
  return `<svg viewBox="0 0 436 222" role="img" aria-label="Transmission versus drive voltage">${tk}
      ${[-VPI, VPI].map((v) => `<line x1="${X(v)}" y1="16" x2="${X(v)}" y2="186" stroke="var(--v-line2)" stroke-dasharray="3 3"/>`).join("")}<text x="${X(VPI) + 4}" y="30" font-size="13" fill="var(--v-text3)">V<tspan baseline-shift="sub" font-size="9">π</tspan></text>
      <path d="${curve(VPI_ENG)}" fill="none" stroke="var(--v-text3)" stroke-width="1.4" stroke-dasharray="5 4"/><path d="${curve(VPI)}" fill="none" stroke="var(--v-text)" stroke-width="2"/>
      <text x="414" y="191" font-size="13" fill="var(--v-text3)">V</text><text x="44" y="10" font-size="13" fill="var(--v-text3)">T</text>
      <line id="mzm-vl" y1="16" y2="186" stroke="var(--v-l532)" stroke-width="1" x1="${X(0).toFixed(1)}" x2="${X(0).toFixed(1)}"/><path id="mzm-pt" d="M0 -7l7 7-7 7-7-7z" fill="var(--v-l532)" transform="translate(${X(0).toFixed(1)} ${Y(1).toFixed(1)})"/></svg>`;
}
/** Readouts at drive voltage V. */
export function mzmReadout(V: number): { v: string; ph: string; t: string; vr: string } {
  const phi = (Math.PI / 2) * (V / VPI), T = Math.cos(phi) ** 2;
  return { v: `${sgn(V, 2)} V`, ph: pad(`±${((Math.abs(phi) * 180) / Math.PI).toFixed(1)}°`, 7), t: T.toFixed(3), vr: sgn(V / VPI, 3) };
}

export function initMZM(root: HTMLElement): Part {
  const dis = new Disposer();
  const art = need(root, "#v-mzm-art"), cur = need(root, "#v-mzm-curve"), inp = need<HTMLInputElement>(root, "#v-v");
  if (!art.querySelector("svg")) art.innerHTML = mzmArtSVG();
  if (!cur.querySelector("svg")) cur.innerHTML = mzmCurveSVG();
  const ticks = need(art, "#mzm-ticks"), field = need(art, "#mzm-field"), out = need(art, "#mzm-out"), vl = need(cur, "#mzm-vl"), pt = need(cur, "#mzm-pt");
  const oV = need(root, "#v-v-o"), oPh = need(root, "#v-ph"), oT = need(root, "#v-t"), oR = need(root, "#v-vr");
  const upd = (): void => {
    const V = +inp.value, phi = (Math.PI / 2) * (V / VPI), T = Math.cos(phi) ** 2; // per-arm phase +/- phi; T = cos^2(phi)
    let s = "";
    const off = (phi / (2 * Math.PI)) * sp;
    for (let x = x1 - sp; x < x2 + sp; x += sp) {
      const xa = x + off, xb = x - off;
      if (xa > x1 + 30 && xa < x2) s += `<line x1="${xa.toFixed(1)}" y1="${ya - 9}" x2="${xa.toFixed(1)}" y2="${ya + 9}" stroke="var(--v-ir1550)" stroke-width="2"/>`;
      if (xb > x1 + 30 && xb < x2) s += `<line x1="${xb.toFixed(1)}" y1="${yb - 9}" x2="${xb.toFixed(1)}" y2="${yb + 9}" stroke="var(--v-ir1550)" stroke-width="2"/>`;
    }
    ticks.innerHTML = s;
    const L = (Math.abs(V) / 6) * 13, dir = Math.sign(V);
    let f = "";
    if (L > 0.5) for (let x = x1 + 60; x < x2; x += 50) {
      ([[ya, -dir], [yb, dir]] as [number, number][]).forEach(([y, dy]) => { const a = y - dy * L, b = y + dy * L; f += `<path d="M${x} ${a.toFixed(1)}L${x} ${b.toFixed(1)}M${x - 3.5} ${(b - dy * 5).toFixed(1)}L${x} ${b.toFixed(1)}L${x + 3.5} ${(b - dy * 5).toFixed(1)}" stroke="var(--v-text)" stroke-width="1.6" fill="none"/>`; });
    }
    field.innerHTML = f;
    out.setAttribute("fill-opacity", (0.08 + 0.92 * T).toFixed(3)); out.setAttribute("r", (6 + 10 * T).toFixed(1));
    vl.setAttribute("x1", X(V).toFixed(1)); vl.setAttribute("x2", X(V).toFixed(1));
    pt.setAttribute("transform", `translate(${X(V).toFixed(1)} ${Y(T).toFixed(1)})`);
    const r = mzmReadout(V);
    oV.textContent = r.v; oPh.textContent = r.ph; oT.textContent = r.t; oR.textContent = r.vr;
    inp.setAttribute("aria-valuetext", `${V.toFixed(2)} volts, transmission ${T.toFixed(3)}`);
    rangeFill(inp);
    MS.V = V;
  };
  dis.on(inp, "input", upd);
  const sync = (): void => { inp.value = String(MS.V); upd(); };
  sync();
  return { repaint: sync, dispose: dis.run };
}
