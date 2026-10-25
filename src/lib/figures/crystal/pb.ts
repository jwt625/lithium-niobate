// FIG-01-09 Poling bench: client module. Binds the TECH panel and the VISUAL bench to the shared state `poling`
// (src/lib/stores/crystal.ts). Any pulse or comb parameter change loads a fresh single-domain patch (t = 0, planned waveform
// shown); "Pulse" runs the automaton, advancing to run.stepAt(f), f = elapsed time in 60 Hz frame units (deterministic: same parameters and seed
// give the same sequence of states), painting every display frame in VISUAL and 12 times per second in TECH (step-wise). With effects off (reduced
// motion) the run is computed at once and only the final state is drawn. No animation frames while idle.
// Markup hooks inside root: input[data-pb="E"|"T"|"seed"] (range in VISUAL, number in TECH), button[data-pb-hold],
// button[data-pb-el], button[data-pb-ps], button[data-pb-view], button[data-pb-run], [data-ro=<key>], pre.pb-map, pre.pb-scope,
// svg.pb-svg, canvas.pb-cv, pre.pb-loop / svg.pb-lsv (live P-E loop).
import { poling } from "$lib/stores/crystal";
import { Disposer, fxOn, isVisual, onUi, rafQueue } from "../dom.ts";
import { PB_DEFAULT, PB_RANGE, PbRun, analyse, pbParams, unpackState, type ElKey, type PbCfg } from "./pbsim.ts";
import { loopASCII, loopSVG, mapASCII, readouts, scopeASCII, scopeSVG } from "./pbrender.ts";
import { paintStage, sizeCanvas } from "./pbcanvas.ts";
import { createPolingState } from "../../physics/ferro.ts";

const cfgOf = (): PbCfg => ({ E: poling.E, T: poling.T, hold: poling.hold, el: poling.el as ElKey, seed: poling.seed });
const sameCfg = (a: PbCfg, b: PbCfg): boolean => a.E === b.E && a.T === b.T && a.hold === b.hold && a.el === b.el && a.seed === b.seed;

export function mountPoling(root: HTMLElement, init: { s: string }): () => void {
  const dis = new Disposer();
  const qa = <T extends Element>(sel: string): T[] => [...root.querySelectorAll<T>(sel)];
  const inputs = qa<HTMLInputElement>("input[data-pb]");
  const ro = qa<HTMLElement>("[data-ro]");
  const maps = qa<HTMLElement>("pre.pb-map"), scopes = qa<HTMLElement>("pre.pb-scope");
  const svgs = qa<SVGSVGElement>("svg.pb-svg"), cvs = qa<HTMLCanvasElement>("canvas.pb-cv");
  const loops = qa<HTMLElement>("pre.pb-loop"), loopSvgs = qa<SVGSVGElement>("svg.pb-lsv");
  const runB = qa<HTMLButtonElement>("button[data-pb-run]");

  // Default state on first load: the prerendered final frame of the default run; its arrays are computed on demand.
  const p0 = pbParams(PB_DEFAULT);
  const st0 = createPolingState(p0);
  const s0 = unpackState(init.s, st0.s.length);
  let run: PbRun | null = null;
  let phase: "ready" | "run" | "done" = "done";
  let anim = 0;

  const ensureRun = (): PbRun => {
    if (!run) { run = new PbRun(PB_DEFAULT); run.finish(); phase = "done"; }
    return run;
  };

  function paintCanvas(): void {
    if (!isVisual()) return;
    const p = run ? run.p : p0, nbr = run ? run.st.nbr : st0.nbr, s = run ? run.st.s : s0;
    cvs.forEach((cv) => { sizeCanvas(cv); paintStage(cv, p, nbr, s, poling.view as "shg" | "etch"); });
  }
  function paintControls(): void {
    inputs.forEach((el) => {
      const k = el.dataset.pb as "E" | "T" | "seed";
      const v = poling[k];
      if (+el.value !== v && document.activeElement !== el) el.value = String(v);
      el.setAttribute("aria-valuetext", k === "E" ? `${v} kV/mm` : k === "T" ? `${v} ms` : `seed ${v}`);
    });
    const tog = (sel: string, on: (b: HTMLButtonElement) => boolean): void => qa<HTMLButtonElement>(sel).forEach((b) => { const o = on(b); b.classList.toggle("on", o); b.setAttribute("aria-pressed", o ? "true" : "false"); });
    tog("button[data-pb-hold]", (b) => (b.dataset.pbHold === "1") === poling.hold);
    tog("button[data-pb-el]", (b) => b.dataset.pbEl === poling.el);
    tog("button[data-pb-ps]", (b) => +(b.dataset.pbPs as string) === poling.ps);
    tog("button[data-pb-view]", (b) => b.dataset.pbView === poling.view);
    tog("button[data-pb-tlog]", (b) => (b.dataset.pbTlog === "1") === poling.tlog);
    runB.forEach((b) => b.classList.toggle("act", phase === "run"));
    const sd = String(poling.seed).padStart(2, " ");
    ro.forEach((el) => { if (el.dataset.ro === "seed" && el.textContent !== sd) el.textContent = sd; });
  }
  /** Full repaint of the visible variant from the current run. */
  function paint(): void {
    paintControls();
    if (!run && poling.ps === 0.71 && poling.tlog) { paintCanvas(); return; } // prerendered default frame stays as is
    const r = ensureRun(), a = analyse(r, poling.ps), R = readouts(r, a, phase);
    ro.forEach((el) => { const v = R[el.dataset.ro as string]; if (v !== undefined && el.textContent !== v) el.textContent = v; });
    if (isVisual()) {
      const svg = scopeSVG(r, a, poling.ps, poling.tlog);
      svgs.forEach((el) => { el.innerHTML = svg; });
      const ls = loopSVG(r, a, poling.ps);
      loopSvgs.forEach((el) => { el.innerHTML = ls; });
      paintCanvas();
    } else {
      const m = mapASCII(r), sc = scopeASCII(r, a, poling.ps, poling.tlog);
      maps.forEach((el) => { el.innerHTML = m; });
      scopes.forEach((el) => { el.innerHTML = sc; });
      const lp = loopASCII(r, a, poling.ps);
      loops.forEach((el) => { el.innerHTML = lp; });
    }
  }
  const request = rafQueue(paint);
  const stop = (): void => { if (anim) cancelAnimationFrame(anim); anim = 0; };

  function reset(): void {
    stop();
    run = new PbRun(cfgOf());
    phase = "ready";
    request();
  }
  function start(): void {
    stop();
    run = new PbRun(cfgOf());
    // VISUAL: animate when effects are on; TECH: step-wise redraw unless the reader asked for reduced motion
    const still = isVisual() ? !fxOn() : matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) { run.finish(); phase = "done"; request(); return; }
    phase = "run";
    const t0 = performance.now();
    let lastTech = -1;
    const tick = (now: number): void => {
      const r = run as PbRun;
      // schedule in 60 Hz frame units, independent of the display rate (rAF time can precede t0 on the first frame)
      const f = Math.max(0, Math.floor((now - t0) / (1000 / 60)));
      const target = r.stepAt(f);
      if (target > r.k) r.advance(target - r.k);
      if (r.done) { phase = "done"; anim = 0; paint(); return; }
      if (isVisual()) paint();
      else { const s = Math.floor(f / 5); if (s !== lastTech) { lastTech = s; paint(); } } // TECH: step-wise, 12 per second
      anim = requestAnimationFrame(tick);
    };
    paint();
    anim = requestAnimationFrame(tick);
  }

  inputs.forEach((el) => {
    const k = el.dataset.pb as "E" | "T" | "seed";
    const [lo, hi, st] = PB_RANGE[k];
    const commit = (): void => {
      let v = +el.value;
      if (!Number.isFinite(v)) v = poling[k];
      v = Math.min(hi, Math.max(lo, Math.round(v / st) * st));
      if (k === "E") v = Math.round(v * 10) / 10;
      el.value = String(v);
      if (v === poling[k] && run) return;
      poling[k] = v;
      reset();
    };
    dis.on(el, el.type === "range" ? "input" : "change", commit);
  });
  qa<HTMLButtonElement>("button[data-pb-hold]").forEach((b) => dis.on(b, "click", () => { poling.hold = b.dataset.pbHold === "1"; reset(); }));
  qa<HTMLButtonElement>("button[data-pb-el]").forEach((b) => dis.on(b, "click", () => { poling.el = b.dataset.pbEl as ElKey; reset(); }));
  qa<HTMLButtonElement>("button[data-pb-ps]").forEach((b) => dis.on(b, "click", () => { poling.ps = +(b.dataset.pbPs as string) === 0.8 ? 0.8 : 0.71; if (!anim) request(); }));
  qa<HTMLButtonElement>("button[data-pb-tlog]").forEach((b) => dis.on(b, "click", () => { poling.tlog = b.dataset.pbTlog === "1"; if (!anim) request(); }));
  qa<HTMLButtonElement>("button[data-pb-view]").forEach((b) => dis.on(b, "click", () => { poling.view = b.dataset.pbView === "etch" ? "etch" : "shg"; paintControls(); paintCanvas(); }));
  runB.forEach((b) => dis.on(b, "click", start));

  cvs.forEach((cv) => { let w = 0; dis.observe(cv, (e) => { const nw = e[0].contentRect.width; if (Math.abs(nw - w) > 0.5) { w = nw; paintCanvas(); } }); });
  dis.add(onUi(() => { if (!anim) request(); }));
  dis.add(stop);

  // Store may differ from the prerendered default (client-side navigation back to the page): load it.
  if (!sameCfg(cfgOf(), PB_DEFAULT)) reset();
  else request();
  return dis.run;
}
