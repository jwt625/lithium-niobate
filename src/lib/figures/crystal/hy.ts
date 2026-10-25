// FIG-01-08 Hysteresis comparator: client module. Binds the TECH panel and the VISUAL instrument to the shared state `hyst`
// (src/lib/stores/crystal.ts) and repaints the visible variant on demand (no idle frames). In VISUAL with effects on, a new
// crystal selection morphs the emphasized loop over 600 ms (Ec and Eint bounds interpolated); otherwise it jumps.
// Markup hooks inside `root`: input[data-hy="t"], button[data-hy-sel], button[data-hy-show] (TECH overlay toggles),
// button[data-hy-oth] (VISUAL: other crystals shown / hidden), [data-ro=<key>] readouts, [data-hy-g=<id>] per-crystal
// badge groups, tr[data-hy-row=<id>], pre.hy-art, svg.hy-loop, svg.hy-waf. Renderers: hyrender.ts (also run at prerender).
import { hyst } from "$lib/stores/crystal";
import { Disposer, fxOn, isVisual, onUi, rafQueue } from "../dom.ts";
import { HY, hyById, type HyId } from "./hy-data";
import { asciiPlot, lerpShape, loopSVG, readouts, shapeOf, waferSVG, type Shape } from "./hyrender";

export function mountHyst(root: HTMLElement): () => void {
  const dis = new Disposer();
  const qa = <T extends Element>(sel: string): T[] => [...root.querySelectorAll<T>(sel)];
  const tIn = qa<HTMLInputElement>('input[data-hy="t"]');
  const selB = qa<HTMLButtonElement>("button[data-hy-sel]"), showB = qa<HTMLButtonElement>("button[data-hy-show]"), othB = qa<HTMLButtonElement>("button[data-hy-oth]");
  const ro = qa<HTMLElement>("[data-ro]"), groups = qa<HTMLElement>("[data-hy-g]"), rows = qa<HTMLElement>("[data-hy-row]");
  const art = qa<HTMLElement>("pre.hy-art"), loop = qa<SVGSVGElement>("svg.hy-loop"), waf = qa<SVGSVGElement>("svg.hy-waf");
  let cur: Shape = shapeOf(hyById(hyst.sel)), anim = 0;

  const press = (b: HTMLButtonElement, on: boolean): void => { b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); };
  function plots(): void {
    if (isVisual()) {
      const l = loopSVG(hyst, cur), w = waferSVG(hyst);
      loop.forEach((el) => { el.innerHTML = l; });
      waf.forEach((el) => { el.innerHTML = w; });
    } else {
      const a = asciiPlot(hyst, cur);
      art.forEach((el) => { el.innerHTML = a; });
    }
  }
  function paint(): void {
    const R = readouts(hyst);
    ro.forEach((el) => { const v = R[el.dataset.ro as string]; if (v !== undefined && el.textContent !== v) el.textContent = v; });
    plots();
    tIn.forEach((el) => { if (+el.value !== hyst.t) el.value = String(hyst.t); el.setAttribute("aria-valuetext", R.t); });
    selB.forEach((b) => press(b, b.dataset.hySel === hyst.sel));
    showB.forEach((b) => press(b, hyst.show[b.dataset.hyShow as HyId]));
    const others = HY.filter((c) => c.id !== hyst.sel), all = others.every((c) => hyst.show[c.id]), none = others.every((c) => !hyst.show[c.id]);
    othB.forEach((b) => press(b, b.dataset.hyOth === "1" ? all : none));
    groups.forEach((g) => g.classList.toggle("on", g.dataset.hyG === hyst.sel));
    rows.forEach((r) => r.classList.toggle("on", r.dataset.hyRow === hyst.sel));
  }
  const request = rafQueue(paint);
  const stop = (): void => { if (anim) cancelAnimationFrame(anim); anim = 0; };

  selB.forEach((b) => dis.on(b, "click", () => {
    const id = b.dataset.hySel as HyId;
    if (id === hyst.sel) return;
    stop();
    const from = cur, to = shapeOf(hyById(id));
    hyst.sel = id;
    if (!(isVisual() && fxOn())) { cur = to; request(); return; }
    paint();
    const t0 = performance.now(), T = 600;
    const step = (now: number): void => {
      const u = Math.min(1, (now - t0) / T), e = u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2;
      cur = u < 1 ? lerpShape(from, to, e) : to;
      plots();
      anim = u < 1 ? requestAnimationFrame(step) : 0;
    };
    anim = requestAnimationFrame(step);
  }));
  showB.forEach((b) => dis.on(b, "click", () => { const id = b.dataset.hyShow as HyId; hyst.show[id] = !hyst.show[id]; request(); }));
  othB.forEach((b) => dis.on(b, "click", () => { const on = b.dataset.hyOth === "1"; for (const c of HY) if (c.id !== hyst.sel) hyst.show[c.id] = on; request(); }));
  tIn.forEach((el) => dis.on(el, "input", () => { hyst.t = Math.max(0.1, Math.min(1, +el.value)); request(); }));
  dis.add(onUi(() => { stop(); cur = shapeOf(hyById(hyst.sel)); request(); }));
  dis.add(stop);
  request();
  return dis.run;
}
