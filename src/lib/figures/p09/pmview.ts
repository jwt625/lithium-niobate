// F2 views: VISUAL bench drawing (poled crystal at 2 px per um with beams in spectral or declared false color) and the
// browser binding of both variants to the shared state (src/lib/stores/p09.ts pm). Controls carry data-pm="<field>";
// outputs carry data-pmo="<name>". Every output slot has a fixed size (no layout shift).
import { computePM, modelOf, pmRows, rowsHTML, statusLine, tuningSVG, periodSVG, lamFromSlider, sliderFromLam, lenFromSlider, sliderFromLen, type PmResult } from "./pm.ts";
import { pm, PM_DEFAULT, type PmState, type Proc, type PmModel } from "$lib/stores/p09";
import { spectral } from "../spectral.ts";
import { Disposer, onUi, isVisual } from "../dom.ts";
import { fillAll } from "../visual/range.ts";
import { pad } from "../fmt.ts";

const nmLabel = (l: number): string => (Number.isFinite(l) ? `${Math.round(l * 1000)} nm` : "–");
function beamStyle(l: number): { stroke: string; dash: string; cls: string } {
  const nm = l * 1000;
  if (nm >= 390 && nm <= 780) return { stroke: spectral(nm), dash: "", cls: "" };
  return { stroke: "var(--v-ir1550)", dash: "6 4", cls: "ir-el" };
}

/** VISUAL bench: crystal 480 px long = 240 um at 2 px/um, input beams left, output beams right. */
export function benchSVG(r: PmResult, s: PmState): string {
  const W = 680, H = 210, x0 = 110, x1 = 570, y0 = 70, y1 = 140;
  let g = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" class="pb-xtal"/>`;
  const P = r.period * 2;
  if (Number.isFinite(P) && P >= 2) {
    let d = "";
    for (let x = x0; x < x1; x += P) d += `M${x.toFixed(2)} ${y0}h${Math.min(P / 2, x1 - x).toFixed(2)}v${y1 - y0}h${(-Math.min(P / 2, x1 - x)).toFixed(2)}Z`;
    g += `<path d="${d}" class="pb-dom"/>`;
  } else g += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" class="pb-none"/>`;
  g += `<path d="M${x0} ${y1 + 14}h40M${x0} ${y1 + 10}v8M${x0 + 40} ${y1 + 10}v8" class="pb-scale"/><text x="${x0 + 46}" y="${y1 + 18}" class="pb-t">20 µm</text>`;
  g += `<text x="${x1}" y="${y1 + 18}" text-anchor="end" class="pb-t">${Number.isFinite(r.period) ? `Λ = ${r.period.toFixed(2)} µm, drawn to scale` : "no QPM period in the model window"}</text>`;
  const ins: number[] = s.proc === "shg" ? [r.l1] : s.proc === "sfg" ? [r.l1, r.l2] : s.proc === "dfg" ? [r.l3, r.l1] : [r.l3];
  const outs: number[] = s.proc === "shg" ? [r.l3, r.l1] : s.proc === "sfg" ? [r.l3] : s.proc === "dfg" ? [r.l2, r.l3, r.l1] : [r.l1, r.l2];
  const beam = (xa: number, xb: number, y: number, l: number, label: string, anchor: "start" | "end"): string => {
    const b = beamStyle(l);
    const tx = anchor === "end" ? xa - 6 : xb + 6;
    return `<path d="M${xa} ${y}H${xb}" stroke="${b.stroke}" stroke-dasharray="${b.dash}" class="pb-beam ${b.cls}"/><path d="M${xb - 7} ${y - 4}L${xb} ${y}L${xb - 7} ${y + 4}" stroke="${b.stroke}" class="pb-head ${b.cls}"/><text x="${tx}" y="${y + 4}" text-anchor="${anchor}" class="pb-t pb-lam">${label}</text>`;
  };
  const yy = (k: number, n: number): number => (y0 + y1) / 2 + (k - (n - 1) / 2) * 16;
  ins.forEach((l, k) => { g += beam(14 + 64, x0 - 4, yy(k, ins.length), l, nmLabel(l), "end"); });
  outs.forEach((l, k) => { g += beam(x1 + 4, W - 70, yy(k, outs.length), l, nmLabel(l), "start"); });
  g += `<path d="M${x0} ${y0 - 18}V${y0 - 6}M${x0} ${y0 - 12}H${x0 + 26}" class="pb-axis"/><text x="${x0 + 30}" y="${y0 - 8}" class="pb-t">+z, alternating every Λ/2</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Periodically poled crystal with input and output beams">${g}</svg>`;
}

const SIZE = { tech: { w: 520, h: 220 }, vis: { w: 560, h: 260 } };
export function plotsInit(r: PmResult): { tT: string; pT: string; tV: string; pV: string } {
  return {
    tT: tuningSVG(r, { ...SIZE.tech, visual: false }), pT: periodSVG(r, { ...SIZE.tech, visual: false }),
    tV: tuningSVG(r, { ...SIZE.vis, visual: true }), pV: periodSVG(r, { ...SIZE.vis, visual: true }),
  };
}
export const procLabels = (p: Proc): { l1: string; l2: string } => (p === "shg" ? { l1: "λ fund.", l2: "λ2 (n/a)" } : p === "sfg" ? { l1: "λ1", l2: "λ2" } : p === "dfg" ? { l1: "λ pump", l2: "λ signal" } : { l1: "λ pump", l2: "λ2 (n/a)" });

export function mountPM(root: HTMLElement): () => void {
  const dis = new Disposer();
  const all = <T extends Element = HTMLElement>(sel: string): T[] => [...root.querySelectorAll<T>(sel)];
  const fmt = {
    l1: (s: PmState) => `${pad(s.l1.toFixed(3), 5)} µm`, l2: (s: PmState) => `${pad(s.l2.toFixed(3), 5)} µm`, period: (s: PmState) => `${pad(s.period.toFixed(2), 5)} µm`,
    T: (s: PmState) => (modelOf(s.model).tdep ? `${pad(s.T.toFixed(1), 5)} °C` : `${pad(modelOf(s.model).e.T_ref_C.toFixed(1), 5)} °C`), duty: (s: PmState) => s.duty.toFixed(2),
    L_mm: (s: PmState) => `${pad(s.L_mm < 1 ? s.L_mm.toFixed(2) : s.L_mm.toFixed(1), 4)} mm`,
  } as const;
  const syncInputs = (): void => {
    const s = pm, def = modelOf(s.model);
    for (const el of all<HTMLInputElement>("input[data-pm]")) {
      const k = el.dataset.pm as keyof PmState;
      const v = k === "l1" || k === "l2" ? sliderFromLam(s[k] as number) : k === "L_mm" ? sliderFromLen(s.L_mm) : (s[k] as number);
      if (+el.value !== v) el.value = String(v);
      const off = (k === "l2" && (s.proc === "shg" || s.proc === "opo")) || (k === "period" && s.proc !== "opo") || (k === "T" && !def.tdep);
      el.disabled = off;
      el.closest(".ctl, .v-ctl")?.classList.toggle("p9-off", off);
    }
    for (const el of all<HTMLSelectElement>("select[data-pm]")) if (el.value !== s.model) el.value = s.model;
    for (const b of all<HTMLButtonElement>("button[data-pmv]")) { const [k, v] = (b.dataset.pmv ?? "").split(":"); b.classList.toggle("on", String((s as unknown as Record<string, unknown>)[k]) === v); }
    for (const o of all("[data-pmf]")) { const k = o.dataset.pmf as keyof typeof fmt; o.textContent = fmt[k](s); }
    const lab = procLabels(s.proc);
    for (const o of all("[data-pml]")) o.textContent = lab[o.dataset.pml as "l1" | "l2"];
    if (isVisual()) fillAll(root);
  };
  const render = (): void => {
    const r = computePM(pm);
    const rows = rowsHTML(pmRows(r, pm));
    const st = statusLine(r);
    const vis = isVisual();
    for (const o of all("[data-pmo]")) {
      const k = o.dataset.pmo;
      if (k === "rows") o.innerHTML = rows;
      else if (k === "status") o.textContent = st;
      else if (k === "tune") o.innerHTML = tuningSVG(r, { ...(o.closest("[data-variant=visual]") ? SIZE.vis : SIZE.tech), visual: vis });
      else if (k === "period") o.innerHTML = periodSVG(r, { ...(o.closest("[data-variant=visual]") ? SIZE.vis : SIZE.tech), visual: vis });
      else if (k === "bench" && vis) o.innerHTML = benchSVG(r, pm);
      else if (k === "v-period") o.textContent = Number.isFinite(r.period) ? r.period.toFixed(2) : "–";
      else if (k === "v-lc") o.textContent = Number.isFinite(r.lc) ? r.lc.toFixed(2) : "–";
      else if (k === "v-fwhm") o.textContent = Number.isFinite(r.fwhmL) ? r.fwhmL.toFixed(3) : "–";
      else if (k === "v-l3") o.textContent = Number.isFinite(r.l3) ? (r.l3 * 1000).toFixed(1) : "–";
      else if (k === "model-badge") { const d = modelOf(pm.model); o.textContent = d.status; o.className = `b ${d.status === "P" ? "p" : d.status === "P-db" ? "pc" : "s"}`; }
    }
  };
  const update = (): void => { syncInputs(); render(); };
  dis.on(root, "input", (e: Event) => {
    const t = e.target as HTMLInputElement | HTMLSelectElement;
    const k = t.dataset?.pm as keyof PmState | undefined;
    if (!k) return;
    const v = +t.value;
    if (k === "model") pm.model = t.value as PmModel;
    else if (k === "l1" || k === "l2") pm[k] = lamFromSlider(v);
    else if (k === "L_mm") pm.L_mm = lenFromSlider(v);
    else if (k === "T" || k === "period" || k === "duty") pm[k] = v;
    const def = modelOf(pm.model);
    if (def.tdep && def.e.T_range_C) pm.T = Math.min(def.e.T_range_C[1], Math.max(def.e.T_range_C[0], pm.T));
    update();
  });
  dis.on(root, "click", (e: Event) => {
    const b = (e.target as Element).closest<HTMLButtonElement>("button[data-pmv], button[data-pmreset]");
    if (!b || !root.contains(b)) return;
    if (b.dataset.pmreset !== undefined) Object.assign(pm, PM_DEFAULT);
    else {
      const [k, v] = (b.dataset.pmv ?? "").split(":");
      if (k === "proc") { pm.proc = v as Proc; if (pm.proc === "opo" || pm.proc === "dfg") { pm.l1 = Math.min(pm.l1, 1.064); if (pm.proc === "dfg" && pm.l2 <= pm.l1) pm.l2 = 1.55; } }
      else if (k === "m") pm.m = +v as 1 | 3 | 5;
    }
    update();
  });
  dis.add(onUi(update));
  update();
  return dis.run;
}
