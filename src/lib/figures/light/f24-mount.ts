// Chapter 2.4 browser side: binds the TECH panels and the VISUAL instruments to the shared state S24 (f24-model.ts) and
// repaints every view of a figure group (OPO, OPA, tuning) when any of its controls moves, so a mode switch keeps all
// values. TECH: mountP24 (always mounted). VISUAL: initP24Visual (lazily, through whenVisual).
import { Disposer, need, onUi, rafQueue } from "../dom.ts";
import { bindRange, bindSeg, logMap } from "./ctl.ts";
import type { Part } from "../visual/lifecycle.ts";
import {
  S24, LOG, OUT, opoModel, opoPlotSVG, opoRows, scalingSVG, scalingRows, opaPlotSVG, opaRows, tuneASVG, tuneBSVG, tuneRows,
  ringDyn, ringHud, vOpaSVG, vOpaHud, vFanSVG, vFanHud, RING,
} from "./f24-model.ts";

type G = "opo" | "opa" | "tune";
const painters: Record<G, Set<() => void>> = { opo: new Set(), opa: new Set(), tune: new Set() };
const emit = (g: G): void => painters[g].forEach((f) => f());
const lm = (k: keyof typeof LOG) => logMap(LOG[k][0], LOG[k][1], LOG[k][2]);
const clampS = (s: number, N: number): number => Math.max(0, Math.min(N, s));

function addPainter(dis: Disposer, g: G, f: () => void): () => void {
  const p = rafQueue(f);
  painters[g].add(p);
  dis.add(() => painters[g].delete(p));
  return p;
}

/** TECH panels (OPO threshold, threshold scaling, OPA gain, OPO tuning). Returns the teardown. */
export function mountP24(root: HTMLElement): () => void {
  const dis = new Disposer();
  const S = S24;
  const inp = (id: string): HTMLInputElement => need<HTMLInputElement>(root, `#${id}`);
  const out = (id: string): HTMLElement => need(root, `#${id}-o`);
  const logSpec = (k: keyof typeof LOG, get: () => number, set: (v: number) => void, fmt: (v: number) => string, unit: string) => {
    const m = lm(k);
    return { read: m.to, write: (v: number) => clampS(m.from(v), m.N), fmt, aria: (v: number) => `${fmt(v).trim()}${unit}`, get, set };
  };
  const linSpec = (get: () => number, set: (v: number) => void, fmt: (v: number) => string) => ({ read: (s: number) => s, write: (v: number) => v, fmt, aria: (v: number) => fmt(v).trim(), get, set });

  // ---- OPO threshold + scaling (shared DOM)
  const o = S.opo;
  const sO: (() => void)[] = [];
  const fO = (): void => emit("opo");
  sO.push(bindRange(dis, inp("p24-P"), out("p24-P"), logSpec("P", () => o.P, (v) => { o.P = v; }, OUT.P, ""), fO));
  sO.push(bindRange(dis, inp("p24-qp"), out("p24-qp"), logSpec("Q", () => o.Qp, (v) => { o.Qp = v; }, OUT.Q, ""), fO));
  sO.push(bindRange(dis, inp("p24-qs"), out("p24-qs"), logSpec("Q", () => o.Qs, (v) => { o.Qs = v; }, OUT.Q, ""), fO));
  sO.push(bindRange(dis, inp("p24-ep"), out("p24-ep"), linSpec(() => o.ep, (v) => { o.ep = v; }, OUT.e), fO));
  sO.push(bindRange(dis, inp("p24-es"), out("p24-es"), linSpec(() => o.es, (v) => { o.es = v; }, OUT.e), fO));
  sO.push(bindRange(dis, inp("p24-g"), out("p24-g"), logSpec("g", () => o.g2pi, (v) => { o.g2pi = v; }, OUT.g, ""), fO));
  const opoSvg = need(root, "#p24-opo-svg"), opoRo = need(root, "#p24-opo-ro"), scSvg = need(root, "#p24-sc-svg"), scRo = need(root, "#p24-sc-ro");
  const pOpo = addPainter(dis, "opo", () => {
    sO.forEach((f) => f());
    opoSvg.innerHTML = opoPlotSVG(o); opoRo.innerHTML = opoRows(o); scSvg.innerHTML = scalingSVG(o); scRo.innerHTML = scalingRows(o);
  });

  // ---- OPA gain
  const a = S.opa;
  const sA: (() => void)[] = [];
  const fA = (): void => emit("opa");
  sA.push(bindRange(dis, inp("p24-eta"), out("p24-eta"), logSpec("eta", () => a.eta, (v) => { a.eta = v; }, OUT.eta, ""), fA));
  sA.push(bindRange(dis, inp("p24-pp"), out("p24-pp"), logSpec("Pp", () => a.Pp, (v) => { a.Pp = v; }, OUT.Pp, " peak"), fA));
  sA.push(bindRange(dis, inp("p24-l"), out("p24-l"), linSpec(() => a.Lmm, (v) => { a.Lmm = v; }, OUT.L), fA));
  sA.push(bindRange(dis, inp("p24-dk"), out("p24-dk"), linSpec(() => a.dk, (v) => { a.dk = v; }, OUT.dk), fA));
  sA.push(bindSeg(dis, need(root, "#p24-ylog"), () => (a.ylog ? "log" : "lin"), (v) => { a.ylog = v === "log"; }, fA));
  const opaSvg = need(root, "#p24-opa-svg"), opaRo = need(root, "#p24-opa-ro");
  const pOpa = addPainter(dis, "opa", () => { sA.forEach((f) => f()); opaSvg.innerHTML = opaPlotSVG(a); opaRo.innerHTML = opaRows(a); });

  // ---- OPO tuning
  const t = S.tune;
  const sT: (() => void)[] = [];
  const fT = (): void => emit("tune");
  sT.push(bindRange(dis, inp("p24-lam"), out("p24-lam"), linSpec(() => t.L, (v) => { t.L = v; }, OUT.lam), fT));
  sT.push(bindRange(dis, inp("p24-t"), out("p24-t"), linSpec(() => t.T, (v) => { t.T = v; }, OUT.T), fT));
  const ta = need(root, "#p24-ta"), tb = need(root, "#p24-tb"), tro = need(root, "#p24-tu-ro");
  const pTune = addPainter(dis, "tune", () => { sT.forEach((f) => f()); ta.innerHTML = tuneASVG(t); tb.innerHTML = tuneBSVG(t); tro.innerHTML = tuneRows(t); });

  const all = (): void => { pOpo(); pOpa(); pTune(); };
  all(); // state may differ from the prerendered default after client-side navigation
  dis.add(onUi(all));
  return dis.run;
}

/** VISUAL instruments: ring OPO, OPA waveguide, tuning fan. */
export function initP24Visual(root: HTMLElement): Part {
  const dis = new Disposer();
  const S = S24, o = S.opo, a = S.opa, t = S.tune;
  const inp = (id: string): HTMLInputElement => need<HTMLInputElement>(root, `#${id}`);
  const out = (id: string): HTMLElement => need(root, `#${id}-o`);
  const txt = (id: string, v: string): void => { need(root, `#${id}`).textContent = v; };

  // ---- ring OPO
  const sR: (() => void)[] = [];
  const fO = (): void => emit("opo");
  const mQ = lm("vQ");
  sR.push(bindRange(dis, inp("p24v-x"), out("p24v-x"), {
    read: (s) => s, write: (x) => Math.max(0.1, Math.min(8, x)), fmt: OUT.x, aria: (x) => `pump ${OUT.x(x).trim()} times threshold`,
    get: () => opoModel(o).x, set: (x) => { o.P = x * opoModel(o).Pth; },
  }, fO));
  sR.push(bindRange(dis, inp("p24v-q"), out("p24v-q"), {
    read: mQ.to, write: (v) => clampS(mQ.from(v), mQ.N), fmt: OUT.Q, aria: (v) => `intrinsic Q ${v.toExponential(1)}`,
    get: () => o.Qs, set: (v) => { o.Qs = v; o.Qp = v; },
  }, fO));
  sR.push(bindSeg(dis, need(root, "#p24v-cpl"), () => (o.ep === o.es ? String(o.ep) : ""), (v) => { o.ep = +v; o.es = +v; }, fO));
  const svgR = need<SVGSVGElement>(root, "#p24v-ring");
  const at = (id: string): SVGElement => need<SVGElement>(svgR, `#${id}`);
  const paintRing = (): void => {
    sR.forEach((f) => f());
    const d = ringDyn(o), R = RING, yP = 378, yO = 404;
    at("p24v-pg").style.opacity = d.pumpOp;
    for (const id of ["p24v-sg", "p24v-sgb"]) at(id).style.opacity = d.sigOp;
    at("p24v-sgb").style.strokeWidth = d.sigW;
    at("p24v-so").style.opacity = d.outOp;
    at("p24v-ov").style.opacity = d.over ? "1" : "0";
    const arrow = (len: number, y: number): [string, string] => len < 1 ? [`M${R.x0} ${y}H${R.x0}`, ""] : [`M${R.x0} ${y}H${(R.x0 + len).toFixed(1)}`, `M${(R.x0 + len - 9).toFixed(1)} ${y - 7}L${(R.x0 + len + 1).toFixed(1)} ${y}L${(R.x0 + len - 9).toFixed(1)} ${y + 7}`];
    const [pa, ph] = arrow(d.pumpLen, yP), [oa, oh] = arrow(d.outLen, yO);
    at("p24v-pa").setAttribute("d", pa); at("p24v-ph").setAttribute("d", ph); at("p24v-oa").setAttribute("d", oa); at("p24v-oh").setAttribute("d", oh);
    const h = ringHud(o);
    txt("p24v-hP", h.P); txt("p24v-hPth", h.Pth); txt("p24v-hnp", h.np); txt("p24v-hnth", h.nth); txt("p24v-hqp", h.QpL); txt("p24v-hqs", h.QsL); txt("p24v-hg", h.g); txt("p24v-hPsi", h.Psi); txt("p24v-heff", h.eff); txt("p24v-hmax", h.effMax);
  };
  const pR = addPainter(dis, "opo", paintRing);

  // ---- OPA
  const sA: (() => void)[] = [];
  const fA = (): void => emit("opa");
  const mP = lm("Pp");
  sA.push(bindRange(dis, inp("p24v-pp"), out("p24v-pp"), { read: mP.to, write: (v) => clampS(mP.from(v), mP.N), fmt: OUT.Pp, aria: (v) => `pump ${OUT.Pp(v).trim()} peak`, get: () => a.Pp, set: (v) => { a.Pp = v; } }, fA));
  sA.push(bindRange(dis, inp("p24v-l"), out("p24v-l"), { read: (s) => s, write: (v) => v, fmt: OUT.L, aria: (v) => OUT.L(v).trim(), get: () => a.Lmm, set: (v) => { a.Lmm = v; } }, fA));
  sA.push(bindRange(dis, inp("p24v-dk"), out("p24v-dk"), { read: (s) => s, write: (v) => v, fmt: OUT.dk, aria: (v) => OUT.dk(v), get: () => a.dk, set: (v) => { a.dk = v; } }, fA));
  sA.push(bindSeg(dis, need(root, "#p24v-eta"), () => String(a.eta), (v) => { a.eta = +v; }, fA));
  sA.push(bindSeg(dis, need(root, "#p24v-ylog"), () => (a.ylog ? "log" : "lin"), (v) => { a.ylog = v === "log"; }, fA));
  const svgA = need(root, "#p24v-opa");
  const pA = addPainter(dis, "opa", () => {
    sA.forEach((f) => f());
    svgA.innerHTML = vOpaSVG(a);
    const h = vOpaHud(a);
    txt("p24v-agam", h.Gamma); txt("p24v-arat", h.ratio); txt("p24v-adb", h.dBcm); txt("p24v-aps", h.Gps); txt("p24v-adq", h.Gdq); txt("p24v-api0", h.Gpi0); txt("p24v-api", h.Gpi);
  });

  // ---- tuning fan
  const sT: (() => void)[] = [];
  const fT = (): void => emit("tune");
  sT.push(bindRange(dis, inp("p24v-t"), out("p24v-t"), { read: (s) => s, write: (v) => v, fmt: OUT.T, aria: (v) => OUT.T(v).trim(), get: () => t.T, set: (v) => { t.T = v; } }, fT));
  sT.push(bindRange(dis, inp("p24v-lam"), out("p24v-lam"), { read: (s) => s, write: (v) => v, fmt: OUT.lam, aria: (v) => OUT.lam(v), get: () => t.L, set: (v) => { t.L = v; } }, fT));
  const svgF = need(root, "#p24v-fan");
  const pF = addPainter(dis, "tune", () => {
    sT.forEach((f) => f());
    svgF.innerHTML = vFanSVG(t);
    const h = vFanHud(t);
    txt("p24v-fs", h.s); txt("p24v-fi", h.i); txt("p24v-fzs", h.zs); txt("p24v-fzi", h.zi); txt("p24v-fdz", h.degZ); txt("p24v-fdj", h.degJ); txt("p24v-fds", h.dS); txt("p24v-fdi", h.dI); txt("p24v-fres", h.res);
  });

  const repaint = (): void => { pR(); pA(); pF(); };
  [...sR, ...sA, ...sT].forEach((f) => f());
  repaint();
  return { repaint, dispose: dis.run };
}
