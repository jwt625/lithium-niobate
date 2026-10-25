// F2-12 in the browser: worker manager (f25-lle.worker.ts; main-thread fallback if the worker fails), controls of both
// variants bound to one shared state, per-frame painting of the visible variant only while a scan runs.
// TECH: trace, spectrum (dB), waveform, readouts, conversion table. VISUAL: ring with the circulating field (rotates only
// while the scan runs), staircase, comb over the telecom band, HUD.
import { ansatzFrame, combSVG, convRO, frameOf, lleRO, LLE0, ringSVG, simAdvance, simCreate, specPlot, tracePlot, wavePlot, type LleCtl, type LleFrame, type Sim } from "./f25-lle.ts";
import { bindRange, bindSeg } from "./ctl.ts";
import { Disposer, isVisual, onUi, q, qa, rafQueue } from "../dom.ts";

export interface LleView { ctl: LleCtl; running: boolean; fr: LleFrame | null; tz: number[]; tp: number[]; tn: number[]; rot: number }
export const lleView: LleView = { ctl: { ...LLE0 }, running: false, fr: null, tz: [], tp: [], tn: [], rot: 0 };

type Msg = { type: "frame"; fr: LleFrame } | { type: "done" } | { type: "preview"; fr: LleFrame; id: number };

/** Worker with a main-thread fallback (same simAdvance, rAF-paced, 6 ms per frame). */
class Runner {
  private w: Worker | null = null;
  private broken = false;
  private sim: Sim | null = null;
  private raf = 0;
  private on: (m: Msg) => void;
  constructor(on: (m: Msg) => void) { this.on = on; }
  private worker(): Worker | null {
    if (this.w || this.broken || typeof Worker === "undefined") return this.w;
    try {
      this.w = new Worker(new URL("./f25-lle.worker.ts", import.meta.url), { type: "module" });
      this.w.onmessage = (e: MessageEvent<Msg>) => this.on(e.data);
      this.w.onerror = () => { this.w?.terminate(); this.w = null; this.broken = true; };
    } catch { this.w = null; this.broken = true; }
    return this.w;
  }
  start(ctl: LleCtl): void {
    const w = this.worker();
    if (w) { w.postMessage({ type: "start", ctl }); return; }
    this.sim = simCreate(ctl);
    let sent = 0;
    const loop = (): void => {
      if (!this.sim) return;
      const t0 = performance.now();
      simAdvance(this.sim, 6, () => performance.now());
      const fr = frameOf(this.sim, sent, performance.now() - t0);
      sent = this.sim.tz.length;
      this.on({ type: "frame", fr });
      if (this.sim.phase === "done") { this.sim = null; this.on({ type: "done" }); return; }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }
  stop(): void { this.w?.postMessage({ type: "stop" }); cancelAnimationFrame(this.raf); this.sim = null; }
  preview(ctl: LleCtl, id: number): void {
    const w = this.worker();
    if (w) w.postMessage({ type: "preview", ctl, id });
    else this.on({ type: "preview", fr: ansatzFrame(ctl), id });
  }
  set(ctl: LleCtl): void { this.w?.postMessage({ type: "set", ctl }); if (this.sim) Object.assign(this.sim.ctl, { f: ctl.f, d2: ctl.d2, z1: ctl.z1, rate: ctl.rate }); }
  dispose(): void { this.stop(); this.w?.terminate(); this.w = null; }
}

export function mountLLE(root: HTMLElement): () => void {
  const dis = new Disposer();
  const V = lleView;
  const el = {
    tr: q<SVGSVGElement>(root, "#l-tr"), sp: q<SVGSVGElement>(root, "#l-sp"), wv: q<SVGSVGElement>(root, "#l-wv"),
    ring: q<SVGSVGElement>(root, "#vl-ring"), vtr: q<SVGSVGElement>(root, "#vl-tr"), comb: q<SVGSVGElement>(root, "#vl-comb"),
    panel: q<HTMLElement>(root, "#lle"), runs: qa<HTMLButtonElement>(root, "[data-act='run']"),
    ro: qa<HTMLElement>(root, "[data-l]"), cv: qa<HTMLElement>(root, "[data-cv]"),
  };
  let lastT = 0, previewTimer = 0, previewGen = 0;
  // the prerendered markup shows the default stationary state; V.fr stays null until a preview or a scan frame arrives
  const paint = (): void => {
    const fr = V.fr;
    if (fr) {
      const ro = lleRO(fr) as unknown as Record<string, string>;
      for (const c of el.ro) c.textContent = ro[c.dataset.l ?? ""] ?? "";
    }
    const cv = convRO(V.ctl, fr ? fr.zeta : V.ctl.z1) as unknown as Record<string, string>;
    for (const c of el.cv) c.textContent = cv[c.dataset.cv ?? ""] ?? "";
    const now = performance.now();
    if (V.running && lastT) V.rot = (V.rot + (now - lastT) * 0.18) % 360;
    lastT = V.running ? now : 0;
    const cur = V.running && fr ? fr.zeta : null;
    if (isVisual()) {
      if (fr && el.ring) el.ring.innerHTML = ringSVG(V.ctl, fr, V.rot);
      if (el.vtr) el.vtr.innerHTML = tracePlot(V.ctl, V.tz, V.tp, V.tn, cur, true, "vt25");
      if (fr && el.comb) el.comb.innerHTML = combSVG(V.ctl, fr);
    } else {
      if (el.tr) el.tr.innerHTML = tracePlot(V.ctl, V.tz, V.tp, V.tn, cur);
      if (fr && el.sp) el.sp.innerHTML = specPlot(V.ctl, fr);
      if (fr && el.wv) el.wv.innerHTML = wavePlot(V.ctl, fr);
    }
    for (const b of el.runs) { b.setAttribute("aria-pressed", String(V.running)); b.classList.toggle("on", V.running); const t = b.querySelector(".c25-rt"); if (t) t.textContent = V.running ? (b.dataset.stop ?? "Stop") : (b.dataset.run ?? "Run"); }
  };
  const queue = rafQueue(paint);
  const runner = new Runner((m) => {
    if (m.type === "frame") {
      if (!V.running) return;
      V.fr = m.fr;
      for (let i = 0; i < m.fr.tz.length; i++) { V.tz.push(m.fr.tz[i]); V.tp.push(m.fr.tp[i]); V.tn.push(m.fr.tn[i]); }
      if (el.panel) el.panel.dataset.ms = m.fr.ms.toFixed(2);
      queue();
    } else if (m.type === "done") { V.running = false; queue(); }
    else if (m.type === "preview" && m.id === previewGen && !V.running) { V.fr = m.fr; V.tz = []; V.tp = []; V.tn = []; queue(); }
  });
  const preview = (): void => {
    // stationary state for the current controls, computed in the worker after input settles
    clearTimeout(previewTimer);
    const g = ++previewGen;
    previewTimer = window.setTimeout(() => { if (g === previewGen && !V.running) runner.preview({ ...V.ctl }, g); }, 200);
  };
  const changed = (): void => {
    syncAll();
    if (V.running) runner.set(V.ctl);
    else preview();
    queue();
  };
  const syncs: (() => void)[] = [];
  const fx = (v: number, d: number, n: number): string => v.toFixed(d).padStart(n, " ");
  const sg = (v: number, d: number, n: number): string => `${v < 0 ? "−" : "+"}${Math.abs(v).toFixed(d)}`.padStart(n, " ");
  for (const pre of ["l", "vl"]) {
    const r = (id: string, fmt: (v: number) => string, aria: (v: number) => string, k: "f" | "d2" | "z1"): void => {
      syncs.push(bindRange(dis, q<HTMLInputElement>(root, `#${pre}-${id}`), q<HTMLElement>(root, `#${pre}-${id}-o`), { read: (s) => s, write: (v) => v, fmt, aria, get: () => V.ctl[k], set: (v) => { V.ctl[k] = v; } }, changed));
    };
    r("f", (v) => fx(v, 2, 4), (v) => `pump ${v.toFixed(2)}`, "f");
    r("d2", (v) => fx(v, 3, 5), (v) => `dispersion ${v.toFixed(3)}`, "d2");
    r("z1", (v) => sg(v, 2, 6), (v) => `scan end ${v.toFixed(2)}`, "z1");
    syncs.push(bindSeg(dis, q(root, `#${pre}-rate`), () => String(V.ctl.rate), (v) => { V.ctl.rate = +v; }, changed));
    syncs.push(bindSeg(dis, q(root, `#${pre}-seed`), () => String(V.ctl.seed), (v) => { V.ctl.seed = +v; }, changed));
  }
  const syncAll = (): void => syncs.forEach((f) => f());
  for (const b of el.runs) dis.on(b, "click", () => {
    if (V.running) { V.running = false; runner.stop(); if (V.fr) V.fr = { ...V.fr, phase: "stopped" }; }
    else { clearTimeout(previewTimer); previewGen++; V.running = true; V.tz = []; V.tp = []; V.tn = []; runner.start({ ...V.ctl }); }
    queue();
  });
  dis.add(onUi(() => { syncAll(); queue(); }));
  dis.add(() => { clearTimeout(previewTimer); runner.dispose(); V.running = false; });
  syncAll();
  return dis.run;
}
