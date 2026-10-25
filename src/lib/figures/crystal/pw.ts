// FIG-01-10 Powers of ten along a wall: client module. Binds the TECH panel and the VISUAL instrument to the shared state
// `wall` (src/lib/stores/crystal.ts), repaints the visible variant on demand (no idle frames), keeps both variants' controls
// in sync. VISUAL SVGs are redrawn at their pixel size (viewBox = box size), so labels keep their size at every width.
// Markup hooks (inside `root`): input[data-pw="z"] (zoom, value = 4 - L), input[data-pw="th"], button[data-pw-ps],
// button[data-pw-go] (jump to a feature's scale), button[data-pw-th] (tilt presets), button[data-pw-dive] (VISUAL animated
// zoom), [data-ro] readouts, [data-pw-f] feature boxes, [data-pw-li] legend rows, pre.pw-rul / pre.pw-view / pre.pw-sig (TECH),
// svg.pw-vsvg / svg.pw-rsvg / svg.pw-csvg (VISUAL). Renderers: pw-data.ts (same functions run at prerender).
import { wall } from "$lib/stores/crystal";
import { Disposer, fxOn, isVisual, onUi, rafQueue } from "../dom.ts";
import { FEATURES, L_MAX, L_MIN, ariaView, chargeSVG, featureAt, readouts, rulerASCII, rulerSVG, sigmaASCII, viewASCII, viewSVG, type PwColumn, type PwState } from "./pw-data.ts";

export function mountWall(root: HTMLElement, C: PwColumn): () => void {
  const dis = new Disposer();
  const qa = <T extends Element>(sel: string): T[] => [...root.querySelectorAll<T>(sel)];
  const zIn = qa<HTMLInputElement>('input[data-pw="z"]'), tIn = qa<HTMLInputElement>('input[data-pw="th"]');
  const psB = qa<HTMLButtonElement>("button[data-pw-ps]"), goB = qa<HTMLButtonElement>("button[data-pw-go]"), thB = qa<HTMLButtonElement>("button[data-pw-th]");
  const diveB = qa<HTMLButtonElement>("button[data-pw-dive]");
  const ro = qa<HTMLElement>("[data-ro]"), fbox = qa<HTMLElement>("[data-pw-f]"), leg = qa<HTMLElement>("[data-pw-li]");
  const rul = qa<HTMLElement>("pre.pw-rul"), view = qa<HTMLElement>("pre.pw-view"), sig = qa<HTMLElement>("pre.pw-sig");
  const vsvg = qa<SVGSVGElement>("svg.pw-vsvg"), rsvg = qa<SVGSVGElement>("svg.pw-rsvg"), csvg = qa<SVGSVGElement>("svg.pw-csvg");
  const aria = qa<HTMLElement>("[data-pw-aria]");
  let anim = 0;

  const size = (el: SVGSVGElement): [number, number] => { const r = (el.parentElement ?? el).getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; };
  const draw = (el: SVGSVGElement, fn: (w: number, h: number) => string, hFix?: number): void => {
    const [w, h0] = size(el);
    const h = hFix ?? h0;
    if (w < 10 || h < 10) return;
    const vb = `0 0 ${w} ${h}`;
    if (el.getAttribute("viewBox") !== vb) el.setAttribute("viewBox", vb);
    el.innerHTML = fn(w, h);
  };

  function paint(): void {
    const st: PwState = { L: wall.L, th: wall.th, ps: wall.ps };
    const R = readouts(st);
    ro.forEach((el) => { const v = R[el.dataset.ro as string]; if (v !== undefined && el.textContent !== v) el.textContent = v; });
    const f = featureAt(st.L);
    fbox.forEach((el) => el.classList.toggle("on", el.dataset.pwF === f.id));
    leg.forEach((el) => el.classList.toggle("on", el.dataset.pwLi === f.id));
    aria.forEach((el) => el.setAttribute("aria-label", ariaView(st)));
    if (isVisual()) {
      vsvg.forEach((el) => draw(el, (w, h) => viewSVG(C, st, w, h)));
      rsvg.forEach((el) => draw(el, (w) => rulerSVG(st, w), 70));
      csvg.forEach((el) => draw(el, (w) => chargeSVG(st, w), 300));
    } else {
      const a = rulerASCII(st), b = viewASCII(C, st), c = sigmaASCII(st);
      rul.forEach((el) => { el.innerHTML = a; });
      view.forEach((el) => { el.innerHTML = b; });
      sig.forEach((el) => { el.innerHTML = c; });
    }
    zIn.forEach((el) => { const v = L_MAX - wall.L; if (Math.abs(+el.value - v) > 1e-9) el.value = String(v); el.setAttribute("aria-valuetext", `scale bar ${R.s.trim()}`); });
    tIn.forEach((el) => { if (+el.value !== wall.th) el.value = String(wall.th); el.setAttribute("aria-valuetext", R.th); });
    psB.forEach((b) => { const on = Math.abs(+(b.dataset.pwPs as string) - wall.ps) < 1e-9; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
    thB.forEach((b) => { const on = Math.abs(+(b.dataset.pwTh as string) - wall.th) < 1e-9; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
    goB.forEach((b) => { const on = b.dataset.pwGo === f.id; b.classList.toggle("on", on); });
    diveB.forEach((b) => { b.textContent = wall.L > (L_MAX + L_MIN) / 2 ? "Zoom to the seam" : "Back out to 10 µm"; });
  }
  const request = rafQueue(paint);
  const stop = (): void => { if (anim) cancelAnimationFrame(anim); anim = 0; };
  const setL = (L: number): void => { wall.L = Math.max(L_MIN, Math.min(L_MAX, Math.round(L * 1000) / 1000)); };

  zIn.forEach((el) => dis.on(el, "input", () => { stop(); setL(L_MAX - +el.value); request(); }));
  tIn.forEach((el) => dis.on(el, "input", () => { wall.th = Math.max(0, Math.min(5, +el.value)); request(); }));
  psB.forEach((b) => dis.on(b, "click", () => { wall.ps = +(b.dataset.pwPs as string); request(); }));
  thB.forEach((b) => dis.on(b, "click", () => { wall.th = +(b.dataset.pwTh as string); request(); }));
  goB.forEach((b) => dis.on(b, "click", () => {
    stop();
    const f = FEATURES.find((x) => x.id === b.dataset.pwGo);
    if (f) setL(Math.log10(f.char));
    request();
  }));
  diveB.forEach((b) => dis.on(b, "click", () => {
    stop();
    const from = wall.L, to = from > (L_MAX + L_MIN) / 2 ? L_MIN : L_MAX;
    if (!fxOn()) { setL(to); request(); return; }
    const t0 = performance.now(), T = 1000;
    const step = (now: number): void => {
      const u = Math.min(1, (now - t0) / T), e = u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2;
      setL(from + (to - from) * e);
      paint();
      anim = u < 1 ? requestAnimationFrame(step) : 0;
    };
    anim = requestAnimationFrame(step);
  }));
  const host = qa<HTMLElement>(".pw-vstage, .pw-vrul, .pw-vchg");
  host.forEach((el) => dis.observe(el, () => { if (isVisual()) request(); }));
  dis.add(onUi(request));
  dis.add(stop);
  void document.fonts?.ready.then(request);
  request();
  return dis.run;
}
