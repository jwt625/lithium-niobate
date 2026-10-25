// Fig. 0 (TECH): conoscope panel of the landing page (port of the mockup's inline index.html script).
// z-cut LN, crossed polarizers, NA 0.55; controls E (0-5 kV/mm, perpendicular to c), d (0.2-2 mm), E along x or y, source.
// State shared with the VISUAL bench (figstate.cono). Weak model while dragging, exact frame once input settles (conoscope.ts).
import { cono as st } from "$lib/stores/figstate";
import { makeConoPainter } from "./conoscope.ts";
import { nCLN, R22_T } from "./optics.ts";
import { eigenIndices, impermeability, opticAxes } from "$lib/physics/crystaloptics.ts";
import { r3m } from "$lib/physics/tensors.ts";
import { Disposer, isVisual, need, qa, onUi, rafQueue } from "./dom.ts";

const LAM = 0.6328;

const R22_ONLY = r3m({ r13: 0, r22: R22_T, r33: 0, r51: 0 });
/** HUD values at 632.8 nm for field E (kV/mm): induced birefringence n_o^3 r22 E, and the optic-axis angle from the plate
 *  normal in air, from the eigen-decomposition of the same impermeability tensor the resting image uses (r22 term). */
export function conoHud(E: number): { dn: number; state: string; angle: number } {
  const no = nCLN("o", LAM), ne = nCLN("e", LAM);
  const dn = no ** 3 * R22_T * E * 1e6;
  if (E <= 0) return { dn, state: "uniaxial", angle: NaN };
  const B = impermeability(no, ne, R22_ONLY, [E * 1e6, 0, 0]);
  const ax = opticAxes(B).axes[0], ix = eigenIndices(B, ax);
  const sInt = Math.sqrt(Math.max(0, 1 - ax[2] * ax[2])), sAir = 0.5 * (ix.nLo + ix.nHi) * sInt;
  return { dn, state: "biaxial", angle: sAir < 1 ? (Math.asin(sAir) * 180) / Math.PI : NaN };
}

export function mountConoTech(fig: HTMLElement): () => void {
  const dis = new Disposer();
  const cv = need<HTMLCanvasElement>(fig, "#conoscope");
  const ctx = cv.getContext("2d") as CanvasRenderingContext2D;
  const paint = makeConoPainter();
  let S = 0;
  const size = (): void => { // canvas resolution from the displayed width; skipped while the TECH panel is hidden (VISUAL)
    if (!cv.clientWidth && S) return;
    const s = Math.max(240, Math.round(Math.min(560, cv.clientWidth * Math.min(2, devicePixelRatio || 1))));
    if (s !== S) { S = s; cv.width = S; cv.height = S; }
  };
  size();
  const hudSrc = need(fig, "#hud-src"), hudDn = need(fig, "#hud-dn"), hudSt = need(fig, "#hud-st");
  const srcEff = (): "633" | "white" => st.src || (isVisual() ? "white" : "633");
  function draw(): void {
    if (isVisual()) return; // VISUAL draws the bench from the same state
    size();
    const white = srcEff() === "white";
    paint(ctx, S, { thicknessMm: st.d, fieldKVmm: st.E, fieldDir: st.dir, white, mono: true, NA: 0.55 }, white);
    const h = conoHud(st.E);
    hudSrc.textContent = white ? "white, luminance" : "632.8 nm";
    hudDn.innerHTML = `Δn<sub>ind</sub> = ${h.dn.toExponential(2)} at 632.8 nm`; // fixed width: d.dde+0 at E = 0, d.dde-N otherwise
    hudSt.textContent = st.E > 0 ? `biaxial, axes ±${Number.isFinite(h.angle) ? h.angle.toFixed(1).padStart(4) : " n/a"}° in air` : "uniaxial";
    hudSt.title = "optic-axis state; angle from the plate normal, in air";
    qa<HTMLButtonElement>(fig, "#src button").forEach((b) => b.classList.toggle("on", b.dataset.s === srcEff()));
    qa<HTMLButtonElement>(fig, "#fdir button").forEach((b) => b.classList.toggle("on", b.dataset.f === st.dir));
  }
  const req = rafQueue(draw);
  const eIn = need<HTMLInputElement>(fig, "#e"), dIn = need<HTMLInputElement>(fig, "#d"), eOut = need(fig, "#eo"), dOut = need(fig, "#do");
  const showE = (): void => { const t = st.E.toFixed(2); eOut.textContent = `${t} kV/mm`; eIn.setAttribute("aria-valuetext", `${t} kilovolts per millimeter`); };
  const showD = (): void => { const t = st.d.toFixed(2); dOut.textContent = `${t} mm`; dIn.setAttribute("aria-valuetext", `${t} millimeters`); };
  dis.on(eIn, "input", () => { st.E = +eIn.value; showE(); req(); });
  dis.on(dIn, "input", () => { st.d = +dIn.value; showD(); req(); });
  qa<HTMLButtonElement>(fig, "#fdir button").forEach((b) => dis.on(b, "click", () => { st.dir = b.dataset.f === "y" ? "y" : "x"; req(); }));
  qa<HTMLButtonElement>(fig, "#src button").forEach((b) => dis.on(b, "click", () => { st.src = b.dataset.s === "white" ? "white" : "633"; req(); }));
  const sync = (): void => { eIn.value = String(st.E); dIn.value = String(st.d); showE(); showD(); req(); };
  dis.add(onUi(sync));
  const q = new URLSearchParams(location.search);
  if (q.has("E")) st.E = Math.min(5, Math.max(0, parseFloat(q.get("E") ?? "") || 0));
  if (q.has("d")) st.d = Math.min(2, Math.max(0.2, parseFloat(q.get("d") ?? "") || 0.6));
  sync();
  draw();
  return dis.run;
}
