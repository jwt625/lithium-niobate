// VISUAL conoscope bench (port of mockup/visual.js initBench): optical bench drawing that reflects state (beam color =
// source, plate width = d, E arrow length and direction), eyepiece figure, retardation legend, fixed-format HUD.
// State shared with the TECH Fig. 0 (figstate.cono). Exact eyepiece frame once input settles (conoscope.ts).
import { cono as st } from "$lib/stores/figstate";
import { makeConoPainter, renderConoscope } from "../conoscope.ts";
import { nCLN } from "../optics.ts";
import { zcutRetardanceExact } from "../../physics/crystaloptics.ts";
import { conoHud } from "../cono-tech.ts";
import { pad } from "../fmt.ts";
import { Disposer, dpr, need, qa, rafQueue } from "../dom.ts";
import { rangeFill } from "./range.ts";
import type { Part } from "./lifecycle.ts";

const NA = 0.55;

/** Eyepiece frame: mirror-plane traces of 3m (x perpendicular to a mirror) as major ticks, threefold set. */
export function eyeRingSVG(): string {
  let t = "";
  for (let k = 0; k < 6; k++) {
    const a = ((90 + k * 60) * Math.PI) / 180, major = k % 2 === 0, r0 = 45.2, r1 = major ? 49 : 47.4;
    t += `<line x1="${(50 + r0 * Math.cos(a)).toFixed(2)}" y1="${(50 - r0 * Math.sin(a)).toFixed(2)}" x2="${(50 + r1 * Math.cos(a)).toFixed(2)}" y2="${(50 - r1 * Math.sin(a)).toFixed(2)}" stroke="var(--v-text${major ? 2 : 3})" stroke-width="${major ? 0.6 : 0.4}"/>`;
  }
  return `<circle cx="50" cy="50" r="43.7" fill="none" stroke="var(--v-line2)" stroke-width="0.5"/><circle cx="50" cy="50" r="45.2" fill="none" stroke="var(--v-line)" stroke-width="0.3"/>${t}
        <text x="99.4" y="51.2" font-size="3.4" fill="var(--v-text3)" style="font-family:var(--v-ui)">x</text><text x="51.6" y="2.4" font-size="3.4" fill="var(--v-text3)" style="font-family:var(--v-ui)">y</text>`;
}

/** Bench SVG body for the current state (compact = narrow layout, alternating label rows). */
export function benchSVG(compact: boolean): string {
  const src = st.src || "white";
  const C = src === "white" ? "var(--v-text)" : "var(--v-l633)";
  const w = 8 + ((st.d - 0.2) / 1.8) * 30, px = 360;
  const eLen = (st.E / 5) * 15;
  const ex = st.dir === "x" ? [eLen, 0] : [0, -eLen];
  const beam = (pts: number[][], o: number): string => `<path d="M${pts.map((p) => p.join(" ")).join("L")}Z" fill="${C}" fill-opacity="${o}"/>`;
  const up = (x: number, y: number): number[] => [x, 150 - y], dn = (x: number, y: number): number[] => [x, 150 + y];
  const seg = (xs: number[][]): number[][] => [...xs.map(([x, y]) => up(x, y)), ...xs.reverse().map(([x, y]) => dn(x, y))];
  const lens = (x: number, hh: number, k: number): string => `<path d="M${x} ${150 - hh}Q${x + k} 150 ${x} ${150 + hh}Q${x - k} 150 ${x} ${150 - hh}Z" fill="var(--v-sio2)" stroke="var(--v-text2)" stroke-width="1.2"/>`;
  const inset = (x: number, lab: string, body: string): string => `<g transform="translate(${x} 46)"><circle r="19" fill="var(--v-ink0)" stroke="var(--v-line2)" stroke-width="1.2"/>${body}<text x="25" y="-10" class="lb3">${lab}</text></g>`;
  const dbl = (dx: number, dy: number): string => `<path d="M${-dx} ${-dy}L${dx} ${dy}" stroke="var(--v-text)" stroke-width="1.6"/><path d="M${dx} ${dy}l${dy ? 3 : -4} ${dy ? -4 : -3}M${dx} ${dy}l${dy ? -3 : -4} ${dy ? -4 : 3}M${-dx} ${-dy}l${dy ? 3 : 4} ${dy ? 4 : -3}M${-dx} ${-dy}l${dy ? -3 : 4} ${dy ? 4 : 3}" stroke="var(--v-text)" stroke-width="1.6" fill="none"/>`;
  const arrowE = st.E > 0 ? `<path d="M${-ex[0]} ${-ex[1]}L${ex[0]} ${ex[1]}" stroke="var(--v-au)" stroke-width="2"/><path d="M${ex[0]} ${ex[1]}l${st.dir === "x" ? "-5 -3.5" : "-3.5 5"}M${ex[0]} ${ex[1]}l${st.dir === "x" ? "-5 3.5" : "3.5 5"}" stroke="var(--v-au)" stroke-width="2" fill="none"/>` : `<circle r="2" fill="var(--v-text3)"/>`;
  const labels: [number, string, string][] = [[50, "Lamp", src === "white" ? "white" : "632.8 nm"], [150, "Polarizer", "P along x"], [250, "Condenser", `NA ${NA}`], [px, "LN plate", `z-cut, ${st.d.toFixed(2)} mm`], [470, "Objective", ""], [570, "Analyzer", "A along y"], [670, "Bertrand lens", ""]];
  const lab = labels.map(([x, a, b], k) => {
    const y = compact ? (k % 2 ? 282 : 252) : 252;
    return `<text x="${x}" y="${y}" text-anchor="middle" class="lb">${a}</text>${!compact && b ? `<text x="${x}" y="${y + 20}" text-anchor="middle" class="lb2">${b}</text>` : ""}`;
  }).join("");
  return `<style>.lb{font:500 ${compact ? 24 : 15}px var(--v-ui);fill:var(--v-text2)}.lb2{font:400 13px var(--v-ui);fill:var(--v-text3)}.lb3{font:500 ${compact ? 22 : 14}px var(--v-ui);fill:var(--v-text2)}</style>
        <line x1="20" y1="150" x2="860" y2="150" stroke="var(--v-line)" stroke-dasharray="4 4"/>
        ${beam(seg([[72, 20], [146, 34]]), 0.2)}${beam(seg([[154, 35], [250, 46], [px, 3], [470, 46], [566, 46]]), 0.13)}${beam(seg([[574, 46], [670, 46], [800, 6]]), 0.07)}
        <circle cx="50" cy="150" r="22" fill="${C}" fill-opacity="0.18" stroke="var(--v-text2)" stroke-width="1.2"/><path d="M38 150l4-6 4 12 4-12 4 12 4-6" fill="none" stroke="${C}" stroke-width="1.4"/>
        <rect x="146" y="92" width="8" height="116" fill="var(--v-ink2)" stroke="var(--v-text2)" stroke-width="1.2"/>
        ${lens(250, 52, 13)}
        <rect x="${px - w / 2 - 6}" y="84" width="${w + 12}" height="13" fill="var(--v-au)"/><rect x="${px - w / 2 - 6}" y="203" width="${w + 12}" height="13" fill="var(--v-au)"/>
        <rect x="${px - w / 2}" y="98" width="${w}" height="104" fill="var(--v-ln)" fill-opacity="0.28" stroke="var(--v-ln)" stroke-width="1.2"/>
        <path d="M${px - 30} 226H${px + 30}M${px + 30} 226l-6-3.5M${px + 30} 226l-6 3.5" stroke="var(--v-text3)" stroke-width="1.2" fill="none"/><text x="${px + 36}" y="230" class="lb2" style="font-style:italic">c</text>
        ${lens(470, 52, 13)}
        <rect x="566" y="92" width="8" height="116" fill="var(--v-ink2)" stroke="var(--v-text2)" stroke-width="1.2"/>
        ${lens(670, 40, 9)}
        <path d="M806 150H856M856 150l-8-5M856 150l-8 5" stroke="var(--v-text2)" stroke-width="1.6" fill="none"/>
        ${inset(150, "P", dbl(12, 0))}${inset(px, "E", arrowE)}${inset(570, "A", dbl(0, 12))}
        ${lab}`;
}

/** Retardation at the NA edge at 550 nm, um: exact plane-wave path difference of the o and e waves in a z-cut plate,
 *  d (sqrt(n_o^2 - s^2) - (n_o/n_e) sqrt(n_e^2 - s^2)) with s = NA (INT 2026-10-25, audit E05; the first-order form
 *  d (n_o - n_e) sin^2(theta_int)/cos(theta_int) read 6% low at 0.60 mm). */
export function edgeRetardation(dMm: number): number {
  const lam = 0.55;
  return (zcutRetardanceExact(NA, nCLN("o", lam), nCLN("e", lam), dMm * 1000, lam) * lam) / (2 * Math.PI);
}
export const fmtDn = (E: number): string => `${pad((conoHud(E).dn * 1e5).toFixed(2), 5)} × 10⁻⁵ at 632.8 nm`;
export const fmtState = (E: number): string => { const h = conoHud(E); return E > 0 ? `biaxial, optic axes ±${Number.isFinite(h.angle) ? pad(h.angle.toFixed(1), 4) : " n/a"}° in air` : "uniaxial"; };
export const fmtG = (d: number): string => `${pad(edgeRetardation(d).toFixed(2), 5)} µm at 550 nm`;

export function initBench(root: HTMLElement): Part {
  const dis = new Disposer();
  const cv = need<HTMLCanvasElement>(root, "#v-cono"), svg = need<SVGSVGElement>(root, "#v-bench-svg");
  const src = (): "633" | "white" => st.src || "white"; // VISUAL default source until the reader picks one
  const eIn = need<HTMLInputElement>(root, "#v-e"), dIn = need<HTMLInputElement>(root, "#v-d"), eOut = need(root, "#v-e-o"), dOut = need(root, "#v-d-o");
  const hDn = need(root, "#v-hud-dn"), hSt = need(root, "#v-hud-st"), hG = need(root, "#v-hud-g");
  const ret = need<HTMLCanvasElement>(root, "#v-ret"), rctx = ret.getContext("2d") as CanvasRenderingContext2D, off = document.createElement("canvas"), OS = 192;
  off.width = OS; off.height = OS;
  const octx = off.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
  const ctx = cv.getContext("2d") as CanvasRenderingContext2D, paint = makeConoPainter();
  let S = 0, compact: boolean | null = null;
  const bench = (): void => { svg.innerHTML = benchSVG(!!compact); };

  function size(): void {
    const want = Math.max(240, Math.min(640, Math.round(cv.clientWidth * dpr())));
    if (want !== S) { S = want; cv.width = S; cv.height = S; }
    const c = svg.clientWidth < 560;
    if (c !== compact) { compact = c; svg.setAttribute("viewBox", `0 0 880 ${compact ? 300 : 290}`); bench(); }
    const rw = Math.max(120, Math.round(ret.clientWidth * dpr()));
    if (ret.width !== rw) { ret.width = rw; ret.height = 14; }
  }
  function legend(): void { // E = 0 figure along the 45-degree diagonal, centre to NA edge: the isochromatic sequence for this d and source
    renderConoscope(octx, OS, { thicknessMm: st.d, fieldKVmm: 0, fieldDir: "x", white: src() === "white", mono: false, NA });
    const px = octx.getImageData(0, 0, OS, OS).data, W = ret.width, img = rctx.createImageData(W, 1), h = OS / 2;
    for (let i = 0; i < W; i++) {
      const r = Math.min(0.99, i / (W - 1)), u = r / Math.SQRT2;
      const x = Math.min(OS - 1, Math.floor(h + u * h)), y = Math.max(0, Math.floor(h - u * h)), k = (y * OS + x) * 4;
      img.data.set([px[k], px[k + 1], px[k + 2], 255], i * 4);
    }
    for (let j = 0; j < ret.height; j++) rctx.putImageData(img, 0, j);
    hG.textContent = fmtG(st.d);
  }
  let lastD: number | null = null, lastSrc: string | null = null;
  function draw(): void {
    size();
    paint(ctx, S, { thicknessMm: st.d, fieldKVmm: st.E, fieldDir: st.dir, white: src() === "white", mono: false, NA }, false);
    if (st.d !== lastD || src() !== lastSrc) { legend(); lastD = st.d; lastSrc = src(); }
    hDn.textContent = fmtDn(st.E);
    hSt.textContent = fmtState(st.E);
    qa<HTMLButtonElement>(root, "#v-src button").forEach((b) => { const on = b.dataset.s === src(); b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
    qa<HTMLButtonElement>(root, "#v-fdir button").forEach((b) => { const on = b.dataset.f === st.dir; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
    bench();
  }
  const req = rafQueue(draw);
  const setE = (): void => { st.E = +eIn.value; const t = st.E.toFixed(2); eOut.textContent = `${t} kV/mm`; eIn.setAttribute("aria-valuetext", `${t} kilovolts per millimeter`); rangeFill(eIn); req(); };
  const setD = (): void => { st.d = +dIn.value; const t = st.d.toFixed(2); dOut.textContent = `${t} mm`; dIn.setAttribute("aria-valuetext", `${t} millimeters`); rangeFill(dIn); req(); };
  dis.on(eIn, "input", setE); dis.on(dIn, "input", setD);
  qa<HTMLButtonElement>(root, "#v-fdir button").forEach((b) => dis.on(b, "click", () => { st.dir = b.dataset.f === "y" ? "y" : "x"; req(); }));
  qa<HTMLButtonElement>(root, "#v-src button").forEach((b) => dis.on(b, "click", () => { st.src = b.dataset.s === "633" ? "633" : "white"; req(); }));
  const sync = (): void => { eIn.value = String(st.E); dIn.value = String(st.d); setE(); setD(); };
  sync();
  dis.observe(cv, req);
  dis.observe(svg as unknown as Element, () => { compact = null; req(); });
  return { repaint: () => { lastD = null; compact = null; sync(); }, dispose: dis.run };
}
