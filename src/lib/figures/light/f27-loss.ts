// Chapter 2.7, loss and Q records. Eq. 2.20: alpha = 2 pi n_g / (Q_i lambda), alpha_dB = 4.343 alpha
// (resonators.ts qToLoss / lossToQ / perCmToDbPerM). Records = the manuscript 2.7 L2 table (authority); a record given
// only as Q is placed on the loss axis with n_g 2.3 at 1550 nm (template) and marked as a bound. Floors: material limit
// of annealed ion-sliced film (shamsansari2022: Q 1.6e8, 0.2 dB/m) and the low end of the bulk CLN absorption range
// (leidinger2015: < 1e-4 /cm over 390 to 3800 nm, converted to dB/m).
// TECH: log-loss vs year scatter with dashed floor lines and a boxed converter. VISUAL: a staircase of rings sorted by
// loss, rim brightness = Q, descending to the material-floor band. Both share LOSS; the converter's loss is the cursor.
import { lossToQ, perCmToDbPerM, qToLoss } from "$lib/physics/resonators.ts";
import { DASH, pad } from "../fmt.ts";
import { Disposer, need, onUi, q, qa } from "../dom.ts";
import { rangeFill } from "../visual/range.ts";
import { axes, c, clip, frame, type Frame } from "./plot.ts";
import { bindRange, bindToggle, logMap } from "./ctl.ts";
import type { Part } from "../visual/lifecycle.ts";

export interface LossState { Q: number; ng: number; lam: number; log: boolean }
/** Shared converter and plot state (n_g 2.3: template display parameter; 1550 nm). */
export const LOSS: LossState = { Q: 2.9e7, ng: 2.3, lam: 1.55, log: true };
export const NG_T = 2.3, LAM_T = 1.55;

export interface Rec {
  id: string; cite: string; src: string; plat: string; val: string; date: string; t: number;
  /** loss in dB/m as plotted, and how it was obtained */
  dbm: number; how: "reported" | "unit" | "q-bound"; note?: string;
}
const yr = (iso: string): number => { const [y, m, d] = iso.split("-").map(Number); return m ? y + (m - 1 + (d ? (d - 0.5) / 31 : 0.5)) / 12 : y + 0.5; };
const qb = (Q: number): number => qToLoss({ Q, ng: NG_T, lam_um: LAM_T }).dB_per_m;
/** Manuscript 2.7 L2 loss table, device rows (dates: issue dates in refs.yaml). */
export const RECS: readonly Rec[] = [
  { id: "zhang2017", cite: "Zhang et al. 2017", src: "r:zhang2017", plat: "dry-etched TFLN ring", val: "Q about 1e7; 2.7 dB/m", date: "2017-12-18", t: yr("2017-12-18"), dbm: 2.7, how: "reported" },
  { id: "desiatov2019", cite: "Desiatov et al. 2019", src: "r:desiatov2019", plat: "visible (637 nm)", val: "6 dB/m; Q<sub>i</sub> 11e6", date: "2019-03-15", t: yr("2019-03-15"), dbm: 6, how: "reported", note: "637 nm" },
  { id: "luke2020", cite: "Luke et al. 2020", src: "r:luke2020", plat: "wafer-scale DUV lithography", val: "0.27 dB/cm", date: "2020-08-03", t: yr("2020-08-03"), dbm: 27, how: "unit" },
  { id: "gao2021", cite: "Gao et al. 2021", src: "r:gao2021", plat: "microdisk", val: "Q &gt; 1e8", date: "2021-12-01", t: yr("2021-12-01"), dbm: qb(1e8), how: "q-bound" },
  { id: "gao2022", cite: "Gao et al. 2022", src: "r:gao2022", plat: "CMP microring", val: "Q &gt; 1e8", date: "2022", t: yr("2022"), dbm: qb(1e8), how: "q-bound" },
  { id: "zhu2024", cite: "Zhu et al. 2024", src: "r:zhu2024", plat: "dry-etched ring, highest found", val: "Q<sub>i</sub> 29e6; 1.3 dB/m", date: "2024-07-26", t: yr("2024-07-26"), dbm: 1.3, how: "reported" },
];
/** Material floor (shamsansari2022) and bulk absorption floor (leidinger2015). */
export const FLOOR = { Q: 1.6e8, dbm: 0.2, dbmQ: qb(1.6e8), src: "r:shamsansari2022" } as const;
export const BULK = { perCm: 1e-4, dbm: perCmToDbPerM(1e-4), src: "r:leidinger2015" } as const;
/** Best dry-etched ring (zhu2024) vs the material floor. */
export const GAP = { q: FLOOR.Q / 2.9e7, loss: 1.3 / FLOOR.dbm } as const;

// ---------- formats ----------
const sig3 = (v: number): string => {
  if (!Number.isFinite(v) || v <= 0) return DASH;
  const a = Math.abs(v);
  if (a >= 100) return v.toFixed(0);
  if (a >= 10) return v.toFixed(1);
  if (a >= 1) return v.toFixed(2);
  if (a >= 0.1) return v.toFixed(3);
  if (a >= 0.01) return v.toFixed(4);
  return v.toExponential(1);
};
export const fmtQ = (Q: number): string => (Number.isFinite(Q) && Q > 0 ? Q.toExponential(2).replace(/e([+-])(\d)$/, "e$10$2") : `${DASH}.${DASH}${DASH}e${DASH}${DASH}${DASH}`);
export const fmtDbm = (v: number): string => pad(sig3(v), 6);
export const qInput = (Q: number): string => Q.toExponential(2).replace("e+", "e");
export const fmtNg = (v: number): string => v.toFixed(3);
export const fmtLam = (v: number): string => `${v.toFixed(3)} µm`;
export const fmtGap = (v: number): string => `${v.toFixed(1)}×`;

export interface LossRo { db: string; a: string; q: string; f: string }
export function lossRo(s: LossState): LossRo {
  const r = qToLoss({ Q: s.Q, ng: s.ng, lam_um: s.lam });
  return { db: `${fmtDbm(r.dB_per_m)} dB/m`, a: `${fmtDbm(r.alpha_per_m)} /m`, q: fmtQ(s.Q), f: `${pad(sig3(FLOOR.Q / s.Q), 6)}×` };
}
const cursorDb = (s: LossState): number => qToLoss({ Q: s.Q, ng: s.ng, lam_um: s.lam }).dB_per_m;

// ---------- TECH scatter ----------
const TB = { w: 600, h: 330, l: 56, r: 14, t: 24, b: 34 };
function techFrame(s: LossState): Frame {
  return frame(TB, { d: [2016, 2026] }, s.log ? { kind: "log", d: [0.01, 1000] } : { d: [0, 30] });
}
const LAB: Record<string, [number, number, string]> = {
  zhang2017: [8, 4, "start"], desiatov2019: [8, 4, "start"], luke2020: [8, 4, "start"], gao2021: [-8, 4, "end"], gao2022: [8, 4, "start"], zhu2024: [-8, -8, "end"],
};
export function lossTechSVG(s: LossState): string {
  const fr = techFrame(s), X0 = TB.l, X1 = TB.w - TB.r, Yb = TB.h - TB.b;
  const Y = (v: number): number => Math.min(Yb, Math.max(TB.t, fr.y.f(s.log ? Math.max(v, 1e-9) : v)));
  let g = axes(fr, { xlab: "year", ylab: "propagation loss (dB/m)", xt: [2016, 2018, 2020, 2022, 2024, 2026].map((v) => ({ v, label: String(v), major: true })) });
  g += `<defs>${clip(fr, "f27-lc")}</defs><g clip-path="url(#f27-lc)">`;
  // floors
  const yb0 = Y(FLOOR.dbmQ), yb1 = Y(FLOOR.dbm);
  g += `<rect class="band" x="${X0}" y="${c(Math.min(yb0, yb1))}" width="${X1 - X0}" height="${c(Math.max(1, Math.abs(yb1 - yb0)))}"/>`;
  g += `<line class="s2" x1="${X0}" x2="${X1}" y1="${c(yb1)}" y2="${c(yb1)}"/><line class="s6" x1="${X0}" x2="${X1}" y1="${c(Y(BULK.dbm))}" y2="${c(Y(BULK.dbm))}"/>`;
  // records
  for (const r of RECS) {
    const x = fr.x.f(r.t), y = Y(r.dbm);
    if (r.how === "q-bound") g += `<rect class="mko" x="${c(x - 3.5)}" y="${c(y - 3.5)}" width="7" height="7"/><path class="s1" d="M${c(x)} ${c(y + 5)}V${c(y + 20)}"/><path class="mk" d="M${c(x - 3.5)} ${c(y + 17)}L${c(x)} ${c(y + 24)}L${c(x + 3.5)} ${c(y + 17)}Z"/>`;
    else g += `<rect class="mk" x="${c(x - 3.5)}" y="${c(y - 3.5)}" width="7" height="7"/>`;
    const [dx, dy, an] = LAB[r.id];
    g += `<text class="lg" x="${c(x + dx)}" y="${c(y + dy)}" text-anchor="${an}">${r.cite}${r.note ? `, ${r.note}` : ""}</text>`;
  }
  // cursor (converter)
  const yc = Y(cursorDb(s));
  g += `<line class="cur" x1="${X0}" x2="${X1}" y1="${c(yc)}" y2="${c(yc)}"/></g>`;
  g += `<text class="v" x="${X0 + 6}" y="${c(yc - 5)}" text-anchor="start">Q<tspan baseline-shift="sub" font-size="8">i</tspan> ${fmtQ(s.Q)}</text>`;
  g += `<text class="lg" x="${X0 + 6}" y="${c(yb1 + 13)}">material limit 0.2 dB/m, Q 1.6e8</text>`;
  if (s.log) g += `<text class="lg" x="${X0 + 6}" y="${c(Y(BULK.dbm) + 13)}">bulk CLN absorption &lt; 1e−4 /cm</text>`;
  return g;
}

// ---------- VISUAL staircase ----------
const VW = 760, VH = 500, VL = 70, VR = 40, VT = 70, VB = 60;
let vLog = true;
const vY = (v: number): number => {
  const u = vLog ? (Math.log10(Math.max(v, 1e-9)) - Math.log10(0.02)) / (Math.log10(100) - Math.log10(0.02)) : v / 30;
  return VT + (1 - u) * (VH - VT - VB);
};
const SORTED = [...RECS].sort((a, b) => b.dbm - a.dbm || a.t - b.t);
/** rim brightness for a loss value: 27 dB/m dim, 0.2 dB/m full. */
const rim = (dbm: number): number => { const u = (Math.log10(27) - Math.log10(Math.max(0.2, Math.min(27, dbm)))) / (Math.log10(27) - Math.log10(0.2)); return 0.2 + 0.8 * u; };
export function lossStairSVG(s: LossState): string {
  vLog = s.log;
  const n = SORTED.length, step = (VW - VL - VR - 90) / (n - 1);
  const xs = SORTED.map((_, i) => VL + 30 + i * step);
  let g = `<defs><filter id="f27-glow" x="-20%" y="-300%" width="140%" height="700%"><feGaussianBlur stdDeviation="7"/></filter><filter id="f27-rg" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3"/></filter></defs>`;
  // ticks
  for (const v of s.log ? [0.1, 1, 10, 100] : [0, 10, 20, 30]) { const y = vY(v); g += `<line class="vs-gl" x1="${VL}" x2="${VW - VR}" y1="${c(y)}" y2="${c(y)}"/><text class="vs-tk" x="${VL - 10}" y="${c(y + 5)}" text-anchor="end">${v}</text>`; }
  g += `<text class="vs-al" x="${VL - 10}" y="${VT - 44}" text-anchor="end">dB/m</text>`;
  // floor band and bulk line
  const f0 = vY(FLOOR.dbmQ), f1 = vY(FLOOR.dbm);
  g += `<rect class="vs-floorg" x="${VL}" y="${c(f0 - 6)}" width="${VW - VL - VR}" height="${c(f1 - f0 + 12)}" filter="url(#f27-glow)"/><rect class="vs-floor" x="${VL}" y="${c(f0)}" width="${VW - VL - VR}" height="${c(Math.max(1.5, f1 - f0))}"/>`;
  g += `<text class="vs-fl" x="${VW - VR}" y="${c(f1 + 22)}" text-anchor="end">material floor: Q 1.6e8, 0.2 dB/m</text>`;
  const yb = vY(BULK.dbm);
  g += `<line class="vs-bulk" x1="${VL}" x2="${VW - VR}" y1="${c(yb)}" y2="${c(yb)}"/><text class="vs-bl" x="${VW - VR}" y="${c(yb + 20)}" text-anchor="end">bulk CLN absorption &lt; 1e−4 /cm = 0.043 dB/m</text>`;
  // stairs
  let d = `M${c(VL)} ${c(vY(SORTED[0].dbm))}`;
  SORTED.forEach((r, i) => { const y = vY(r.dbm); d += `V${c(y)}H${c(xs[i] + step / 2)}`; });
  g += `<path class="vs-stair" d="${d}"/>`;
  // rings
  SORTED.forEach((r, i) => {
    const x = xs[i], y = vY(r.dbm) - 30, op = rim(r.dbm).toFixed(3);
    g += `<circle cx="${c(x)}" cy="${c(y)}" r="24" class="vs-rimg" stroke-opacity="${op}" filter="url(#f27-rg)"/><circle cx="${c(x)}" cy="${c(y)}" r="24" class="vs-rim${r.how === "q-bound" ? " qb" : ""}" stroke-opacity="${op}"/>`;
    g += `<text class="vs-yr" x="${c(x)}" y="${c(y - 32)}" text-anchor="middle">${r.date.slice(0, 4)}</text><text class="vs-id" x="${c(x)}" y="${c(y - 50)}" text-anchor="middle">${r.cite.split(" ")[0]}</text>${r.note ? `<text class="vs-id" x="${c(x)}" y="${c(vY(r.dbm) + 18)}" text-anchor="middle">${r.note}</text>` : ""}`;
    g += `<text class="vs-v" x="${c(x)}" y="${c(y + 5)}" text-anchor="middle">${r.how === "q-bound" ? "&gt;1e8" : String(r.dbm)}</text>`;
  });
  // cursor
  const yc = Math.min(VH - VB, Math.max(VT, vY(cursorDb(s))));
  g += `<line class="vs-cur" x1="${VL}" x2="${VW - VR}" y1="${c(yc)}" y2="${c(yc)}"/><path class="vs-curh" d="M${VW - VR + 4} ${c(yc)}l14 -8v16z"/>`;
  g += `<text class="vs-cl" x="${VL + 8}" y="${c(yc - 8)}">Q<tspan baseline-shift="sub" font-size="10">i</tspan> ${fmtQ(s.Q)}</text>`;
  return `<svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Staircase of TFLN ring and waveguide records sorted by propagation loss, descending toward the material floor band">${g}</svg>`;
}

// ---------- mount ----------
const QMAP = logMap(1e5, 1e9, 1000);
const clampQ = (Q: number): number => Math.min(1e9, Math.max(1e5, Q));
/** Parse a typed number: "1.6e8", "1.6E8", "160000000", "1.6x10^8". */
export function parseNum(t: string): number {
  const s = t.trim().replace(/\s+/g, "").replace(/[×x]10\^?/i, "e").replace(",", ".");
  if (!/^[+]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return Number.NaN;
  return Number(s);
}

interface Bound { sync: () => void }
function bindConverter(dis: Disposer, root: ParentNode, pre: string, paint: () => void): Bound {
  const qr = q<HTMLInputElement>(root, `#${pre}-q-in`), qt = q<HTMLInputElement>(root, `#${pre}-q-tx`), at = q<HTMLInputElement>(root, `#${pre}-a-tx`);
  let typing: HTMLInputElement | null = null;
  const show = (): void => {
    if (qr) { qr.value = String(QMAP.from(clampQ(LOSS.Q))); qr.setAttribute("aria-valuetext", `Q ${LOSS.Q.toExponential(2)}`); rangeFill(qr); }
    if (qt && typing !== qt) { qt.value = qInput(LOSS.Q); qt.removeAttribute("aria-invalid"); }
    if (at && typing !== at) { at.value = sig3(cursorDb(LOSS)); at.removeAttribute("aria-invalid"); }
  };
  if (qr) dis.on(qr, "input", () => { LOSS.Q = QMAP.to(+qr.value); show(); paint(); });
  const onType = (el: HTMLInputElement, apply: (v: number) => boolean): void => {
    dis.on(el, "input", () => {
      typing = el;
      const ok = apply(parseNum(el.value));
      if (ok) el.removeAttribute("aria-invalid"); else el.setAttribute("aria-invalid", "true");
      if (ok) { show(); paint(); }
      typing = null;
    });
    dis.on(el, "change", () => show());
  };
  if (qt) onType(qt, (v) => { if (!(v >= 1e3 && v <= 1e11)) return false; LOSS.Q = v; return true; });
  if (at) onType(at, (v) => { if (!(v > 0 && v <= 1e4)) return false; LOSS.Q = lossToQ({ dB_per_m: v, ng: LOSS.ng, lam_um: LOSS.lam }); return true; });
  const ng = bindRange(dis, q(root, `#${pre}-ng-in`), q(root, `#${pre}-ng-o`), { read: (v) => v, write: (v) => v, fmt: fmtNg, aria: (v) => `group index ${v.toFixed(3)}`, get: () => LOSS.ng, set: (v) => { LOSS.ng = v; } }, () => { show(); paint(); });
  const lam = bindRange(dis, q(root, `#${pre}-lam-in`), q(root, `#${pre}-lam-o`), { read: (v) => v, write: (v) => v, fmt: fmtLam, aria: (v) => `${v.toFixed(3)} micrometres`, get: () => LOSS.lam, set: (v) => { LOSS.lam = v; } }, () => { show(); paint(); });
  const lg = bindToggle(dis, q<HTMLButtonElement>(root, `#${pre}-log`), () => LOSS.log, (v) => { LOSS.log = v; }, paint);
  return { sync: () => { show(); ng(); lam(); lg(); } };
}
const setRo = (root: ParentNode, pre: string, r: LossRo): void => {
  for (const k of Object.keys(r) as (keyof LossRo)[]) for (const el of qa(root, `#${pre}-${k}`)) el.textContent = r[k];
};

/** TECH loss panel (always mounted). */
export function mountLossTech(root: HTMLElement): () => void {
  const dis = new Disposer();
  const svg = need(root, "#f27-lsvg");
  const paint = (): void => { svg.innerHTML = lossTechSVG(LOSS); setRo(root, "f27-l", lossRo(LOSS)); };
  const b = bindConverter(dis, root, "f27-l", paint);
  const sync = (): void => { b.sync(); paint(); };
  dis.add(onUi(sync));
  sync();
  return dis.run;
}

/** VISUAL staircase (whenVisual). */
export function initLossVisual(root: HTMLElement): Part {
  const dis = new Disposer();
  const stage = need(root, "#f27-stair");
  const paint = (): void => { stage.innerHTML = lossStairSVG(LOSS); setRo(root, "f27-vl", lossRo(LOSS)); };
  const b = bindConverter(dis, root, "f27-vl", paint);
  const repaint = (): void => { b.sync(); paint(); };
  repaint();
  return { repaint, dispose: dis.run };
}
