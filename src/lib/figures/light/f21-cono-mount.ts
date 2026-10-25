// F2-01 client: TECH eyepiece panel and VISUAL bench bound to one state (f21-cono.ts c21). Quick exact frame at reduced
// resolution on input, full frame from a worker 120 ms after input stops (stale results dropped; main-thread fallback).
import { c21, cono21RGBA, cono21Overlay, cono21Readout, bench21SVG, SET_HEAD, lamLabel, type FrameOpts } from "./f21-cono.ts";
import { edgeRetardation, eyeRingSVG } from "../visual/bench.ts";
import { Disposer, dpr, isVisual, onUi, q, qa, rafQueue } from "../dom.ts";
import { bindRange, bindSeg } from "./ctl.ts";
import { pad } from "../fmt.ts";
import type { SetKey } from "./f21-common.ts";

let worker: Worker | null = null, broken = false, nextId = 1;
const pending = new Map<number, (px: Uint8ClampedArray<ArrayBuffer>) => void>();
function full(size: number, o: FrameOpts): Promise<Uint8ClampedArray<ArrayBuffer>> {
  if (!worker && !broken && typeof Worker !== "undefined") {
    try {
      worker = new Worker(new URL("./f21-cono.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (e: MessageEvent<{ id: number; px: Uint8ClampedArray<ArrayBuffer> }>) => { pending.get(e.data.id)?.(e.data.px); pending.delete(e.data.id); };
      worker.onerror = () => { worker = null; broken = true; for (const [, f] of pending) f(cono21RGBA(size, o)); pending.clear(); };
    } catch { broken = true; worker = null; }
  }
  if (!worker) return Promise.resolve(cono21RGBA(size, o));
  const id = nextId++;
  return new Promise((res) => { pending.set(id, res); (worker as Worker).postMessage({ id, size, o }); });
}

/** Painter for one canvas: quick frame now, full frame after idle. */
function painter(cv: HTMLCanvasElement): (o: FrameOpts) => void {
  const ctx = cv.getContext("2d") as CanvasRenderingContext2D;
  const tmp = document.createElement("canvas"), tctx = tmp.getContext("2d") as CanvasRenderingContext2D;
  let gen = 0, timer = 0;
  return (o) => {
    const S = Math.max(200, Math.min(640, Math.round(cv.clientWidth * dpr())));
    if (cv.width !== S) { cv.width = S; cv.height = S; }
    const g = ++gen, qs = Math.max(96, Math.round(S / (o.white ? 4 : 2.5)));
    tmp.width = qs; tmp.height = qs;
    tctx.putImageData(new ImageData(cono21RGBA(qs, o), qs, qs), 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.drawImage(tmp, 0, 0, S, S);
    clearTimeout(timer);
    timer = window.setTimeout(() => { void full(S, o).then((px) => { if (g === gen && cv.width === S) ctx.putImageData(new ImageData(px, S, S), 0, 0); }); }, 120);
  };
}

export function mountCono21(root: HTMLElement): () => void {
  const dis = new Disposer();
  const T = q(root, "#c21"), V = q(root, "#v-c21");
  const srcEff = (): "mono" | "white" => c21.src || (isVisual() ? "white" : "mono");
  const ptT = T ? painter(q<HTMLCanvasElement>(T, "#c21-cv") as HTMLCanvasElement) : null;
  const ptV = V ? painter(q<HTMLCanvasElement>(V, "#v-c21-cv") as HTMLCanvasElement) : null;
  const ret = V ? q<HTMLCanvasElement>(V, "#v-c21-leg") : null;
  const off = document.createElement("canvas"); off.width = off.height = 160;
  const octx = off.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
  let lastLeg = "";
  const syncs: (() => void)[] = [];
  const ro = (scope: Element | null, pre: string): void => {
    if (!scope) return;
    const r = cono21Readout(c21);
    for (const [k, v] of Object.entries(r)) { const el = q(scope, `#${pre}-${k}`); if (el) el.textContent = v; }
  };
  function draw(): void {
    const white = srcEff() === "white";
    if (!isVisual() && T && ptT) {
      ptT({ d: c21.d, E: c21.E, dir: c21.dir, white, mono: true, set: c21.set, lam: c21.lam });
      const ov = q(T, "#c21-ov"); if (ov) ov.innerHTML = cono21Overlay(c21);
      ro(T, "c21");
      const h = q(T, "#c21-set-h"); if (h) h.innerHTML = SET_HEAD(c21.set);
      const sh = q(T, "#c21-src-h"); if (sh) sh.textContent = white ? "white light, luminance" : `${lamLabel(c21.lam)}, gray`;
    }
    if (isVisual() && V && ptV) {
      ptV({ d: c21.d, E: c21.E, dir: c21.dir, white, mono: false, set: c21.set, lam: c21.lam });
      const svg = q(V, "#v-c21-bench"); if (svg) svg.innerHTML = bench21SVG(c21, (svg as unknown as SVGSVGElement).clientWidth < 560);
      ro(V, "v-c21");
      const vh = q(V, "#v-c21-set-h"); if (vh) vh.innerHTML = SET_HEAD(c21.set);
      const g = q(V, "#v-c21-g"); if (g) g.textContent = `${pad(edgeRetardation(c21.d).toFixed(2), 5)} µm at 550 nm`;
      const key = `${c21.d}|${white}|${c21.lam}`;
      if (ret && key !== lastLeg) { // isochromatic sequence along the diagonal at E = 0, center to NA edge
        lastLeg = key;
        octx.putImageData(new ImageData(cono21RGBA(160, { d: c21.d, E: 0, dir: "x", white, mono: false, set: c21.set, lam: c21.lam }), 160, 160), 0, 0);
        const px = octx.getImageData(0, 0, 160, 160).data, W = Math.max(120, Math.round(ret.clientWidth * dpr()));
        ret.width = W; ret.height = 14;
        const rc = ret.getContext("2d") as CanvasRenderingContext2D, img = rc.createImageData(W, 1);
        for (let i = 0; i < W; i++) { const u = Math.min(0.99, i / (W - 1)) / Math.SQRT2, x = Math.min(159, Math.floor(80 + u * 80)), y = Math.max(0, Math.floor(80 - u * 80)), k = (y * 160 + x) * 4; img.data.set([px[k], px[k + 1], px[k + 2], 255], i * 4); }
        for (let j = 0; j < 14; j++) rc.putImageData(img, 0, j);
      }
    }
    syncs.forEach((f) => f());
  }
  const req = rafQueue(draw);
  for (const [scope, pre] of [[T, "c21"], [V, "v-c21"]] as const) {
    if (!scope) continue;
    const s1 = bindRange(dis, q<HTMLInputElement>(scope, `#${pre}-e-in`), q(scope, `#${pre}-e-o`), { read: (s) => s, write: (v) => v, get: () => c21.E, set: (v) => { c21.E = v; }, fmt: (v) => `${v.toFixed(2)} kV/mm`, aria: (v) => `${v.toFixed(2)} kilovolts per millimeter` }, req);
    const s2 = bindRange(dis, q<HTMLInputElement>(scope, `#${pre}-d-in`), q(scope, `#${pre}-d-o`), { read: (s) => s, write: (v) => v, get: () => c21.d, set: (v) => { c21.d = v; }, fmt: (v) => `${v.toFixed(2)} mm`, aria: (v) => `${v.toFixed(2)} millimeters` }, req);
    const s3 = bindSeg(dis, q(scope, `#${pre}-dir`), () => c21.dir, (v) => { c21.dir = v === "y" ? "y" : "x"; }, req);
    const s4 = bindSeg(dis, q(scope, `#${pre}-src`), () => srcEff(), (v) => { c21.src = v === "white" ? "white" : "mono"; }, req);
    const s6 = bindRange(dis, q<HTMLInputElement>(scope, `#${pre}-lam-in`), q(scope, `#${pre}-lam-o`), { read: (s) => s / 1000, write: (v) => Math.round(v * 1000), get: () => c21.lam, set: (v) => { c21.lam = v; c21.src = "mono"; }, fmt: lamLabel, aria: (v) => `${(v * 1000).toFixed(1)} nanometers` }, req);
    const s5 = bindSeg(dis, q(scope, `#${pre}-set`), () => c21.set, (v) => { c21.set = v as SetKey; }, req);
    s1(); s2(); s6();
    syncs.push(s3, s4, s5, () => { s1(); s2(); s6(); });
  }
  void qa;
  dis.add(onUi(() => { lastLeg = ""; req(); }));
  for (const cv of [T && q(T, "#c21-cv"), V && q(V, "#v-c21-cv")]) if (cv) dis.observe(cv, req);
  draw();
  return dis.run;
}

export { eyeRingSVG };
