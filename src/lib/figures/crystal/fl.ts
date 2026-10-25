// FIG-01-02 One cell, flipped: client module. Binds the TECH panel and the VISUAL specimen to the shared state `flip`
// (src/lib/stores/crystal.ts), repaints the visible variant on demand (no idle frames), keeps both variants' controls in sync.
// Markup hooks (both variants inside `root`): input[data-fl="s"|"E"], button[data-fl-frame], button[data-fl-s] (TECH presets),
// button[data-fl-flip] (VISUAL, animated only when effects are on), [data-ro=<key>] readouts, pre.fl-art, pre.fl-well,
// svg.fl-col, svg.fl-wsv. Renderers: flrender.ts (same functions produce the prerendered default state on the server).
import { flip } from "$lib/stores/crystal";
import { Disposer, fxOn, isVisual, onUi, rafQueue } from "../dom.ts";
import { artASCII, colSVG, readouts, wellASCII, wellSVG, type FlData, type Frame } from "./flrender";

export function mountFlip(root: HTMLElement, D: FlData): () => void {
  const dis = new Disposer();
  const qa = <T extends Element>(sel: string): T[] => [...root.querySelectorAll<T>(sel)];
  const sIn = qa<HTMLInputElement>('input[data-fl="s"]'), eIn = qa<HTMLInputElement>('input[data-fl="E"]');
  const frameB = qa<HTMLButtonElement>("button[data-fl-frame]"), presetB = qa<HTMLButtonElement>("button[data-fl-s]");
  const ro = qa<HTMLElement>("[data-ro]");
  const art = qa<HTMLElement>("pre.fl-art"), well = qa<HTMLElement>("pre.fl-well");
  const col = qa<SVGSVGElement>("svg.fl-col"), wsv = qa<SVGSVGElement>("svg.fl-wsv");
  let anim = 0;

  function paint(): void {
    const st = { s: flip.s, frame: flip.frame as Frame, E: flip.E };
    const R = readouts(D, st);
    ro.forEach((el) => { const v = R[el.dataset.ro as string]; if (v !== undefined && el.textContent !== v) el.textContent = v; });
    if (isVisual()) {
      const c = colSVG(D, st), w = wellSVG(D, st);
      col.forEach((el) => { el.innerHTML = c; });
      wsv.forEach((el) => { el.innerHTML = w; });
    } else {
      const a = artASCII(D, st), w = wellASCII(D, st);
      art.forEach((el) => { el.innerHTML = a; });
      well.forEach((el) => { el.innerHTML = w; });
    }
    sIn.forEach((el) => { if (+el.value !== flip.s) el.value = String(flip.s); el.setAttribute("aria-valuetext", `s ${R.s}`); });
    eIn.forEach((el) => { if (+el.value !== flip.E) el.value = String(flip.E); el.setAttribute("aria-valuetext", R.e); });
    frameB.forEach((b) => { const on = b.dataset.flFrame === flip.frame; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
    presetB.forEach((b) => { const on = Math.abs(+(b.dataset.flS as string) - flip.s) < 1e-9; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
  }
  const request = rafQueue(paint);
  const stop = (): void => { if (anim) cancelAnimationFrame(anim); anim = 0; };

  sIn.forEach((el) => dis.on(el, "input", () => { stop(); flip.s = Math.max(-1, Math.min(1, +el.value)); request(); }));
  eIn.forEach((el) => dis.on(el, "input", () => { flip.E = +el.value; request(); }));
  frameB.forEach((b) => dis.on(b, "click", () => { flip.frame = b.dataset.flFrame as Frame; request(); }));
  presetB.forEach((b) => dis.on(b, "click", () => { stop(); flip.s = +(b.dataset.flS as string); request(); }));
  qa<HTMLButtonElement>("button[data-fl-flip]").forEach((b) => dis.on(b, "click", () => {
    stop();
    const from = flip.s, to = from > 0 ? -1 : 1;
    if (!fxOn()) { flip.s = to; request(); return; }
    const t0 = performance.now(), T = 600;
    const step = (now: number): void => {
      const u = Math.min(1, (now - t0) / T), e = u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2;
      flip.s = Math.round((from + (to - from) * e) * 100) / 100;
      paint();
      anim = u < 1 ? requestAnimationFrame(step) : 0;
    };
    anim = requestAnimationFrame(step);
  }));
  dis.add(onUi(request));
  dis.add(stop);
  request();
  return dis.run;
}
