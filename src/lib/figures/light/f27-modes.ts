// Chapter 2.7: TFLN rib-waveguide modes from the precomputed full-vector FEM lattice (static/data/tfln-modes/lattice.json,
// eo-modulator-atlas engine; physics/modes.ts createModeLattice, multilinear interpolation). Loaded lazily when the
// figure nears the viewport; before that every readout prints fixed-width dashes and the plot shows axes, the slab limits
// and the Li et al. 2026 reference only (same SVG box, so nothing moves on data load).
// TECH: n_eff vs top width for TE0, TM0, TE1 at the chosen t, etch, sidewall, wavelength and cut; flagged lattice regions
// drawn as a grey band under the curves; the region w > 3.0 um (outside the lattice) hatched; slab limits (film thickness
// t, symmetric SiO2-clad anisotropic slab, modes.ts slabIndex) dashed. VISUAL: the cross-section at the chosen geometry,
// to scale, with the c axis and a |E_x| / |E_y| share glyph of the selected mode, above the same curves with mode markers.
// Li et al. 2026 rib (w = 3.5 um) lies outside the width axis: its direct engine values are drawn as a reference point.
import { createModeLattice, FLAG, lnLabEps, slabIndex, MODE_LABELS, type Cut, type LatticeData, type ModeLabel, type ModeLattice, type ModeResult } from "$lib/physics/modes.ts";
import { refractiveIndex } from "$lib/physics/sellmeier.ts";
import { ZELMON_CLN_E, ZELMON_CLN_O } from "$lib/physics/constants.ts";
import { sio2Index } from "$lib/physics/thinfilm.ts";
import { MINUS } from "../fmt.ts";
import { Disposer, need, onUi, q, qa } from "../dom.ts";
import { axes, c, clip, frame, type Frame } from "./plot.ts";
import { bindRange, bindSeg, logMap } from "./ctl.ts";
import type { Part } from "../visual/lifecycle.ts";

export interface ModeState { t: number; etch: number; w: number; sw: number; lam: number; cut: Cut; mode: ModeLabel }
/** Shared state of both variants. Default: an x-cut rib whose TM0 / TE1 pair anticrosses near w = 1.75 um. */
export const MS: ModeState = { t: 400, etch: 0.6, w: 1.7544, sw: 60, lam: 1.55, cut: "x", mode: "TE0" };
/** Li et al. 2026 rib and its direct engine values (outside the lattice width axis). */
export const LI_REF = { t: 300, etch: 0.6, w: 3.5, sw: 60, lam: 1.55, cut: "x" as Cut, neff: 1.7696, ng: 2.135 };
export const W_MIN = 0.6, W_MAX_LAT = 3.0, W_MAX = 3.5;
export const WMAP = logMap(W_MIN, W_MAX, 1000);
const DATA_URL = "/data/tfln-modes/lattice.json";

// ---------- data ----------
let LAT: ModeLattice | null = null;
let pending: Promise<ModeLattice | null> | null = null;
const subs = new Set<() => void>();
export const lattice = (): ModeLattice | null => LAT;
/** Fetch and index the lattice once; subscribers repaint when it arrives. */
export function loadLattice(): Promise<ModeLattice | null> {
  if (!pending) {
    pending = fetch(DATA_URL)
      .then((r) => (r.ok ? (r.json() as Promise<LatticeData>) : null))
      .then((d) => { LAT = d ? createModeLattice(d) : null; subs.forEach((f) => f()); return LAT; })
      .catch(() => null);
  }
  return pending;
}
function onLattice(f: () => void): () => void { subs.add(f); return () => subs.delete(f); }

// ---------- physics adapters ----------
export function slabLimits(s: ModeState): { te: number; tm: number; nc: number } {
  const no = refractiveIndex(ZELMON_CLN_O, s.lam), ne = refractiveIndex(ZELMON_CLN_E, s.lam), nc = sio2Index(s.lam * 1000);
  const eps = lnLabEps(s.cut, no, ne), d = s.t / 1000;
  return { te: slabIndex({ d_um: d, lambda_um: s.lam, eps, n_clad: nc, pol: "TE" }), tm: slabIndex({ d_um: d, lambda_um: s.lam, eps, n_clad: nc, pol: "TM" }), nc };
}
const query = (L: ModeLattice, s: ModeState, mode: ModeLabel, w = s.w): ModeResult => L.query({ t: s.t, etch: s.etch, w, sidewall: s.sw, lambda: s.lam, cut: s.cut, pol: mode });
export const isLiGeom = (s: ModeState): boolean => s.t === LI_REF.t && Math.abs(s.etch - LI_REF.etch) < 1e-9 && s.sw === LI_REF.sw && s.lam === LI_REF.lam && s.cut === LI_REF.cut;

// ---------- readouts ----------
export interface ModeRo { neff: string; ng: string; aeff: string; ln: string; te: string; st: string; w: string; t: string; e: string }
const ST_W = 17;
export const DASH_RO = { neff: "–.––––", ng: "–.–––", aeff: "–.–– µm²", ln: "–.––", te: "–.––" };
/** Quality flags (drawn as the grey band); POL_RELABELED and TRACK_LOW are informational only. */
export const QUALITY = FLAG.NOT_FOUND | FLAG.NOT_CONVERGED | FLAG.WINDOW_EDGE | FLAG.LEAKY | FLAG.CROSS_LEAKY | FLAG.POL_HYBRID | FLAG.REIDENTIFIED;
/** Status from the flags of the contributing lattice nodes (blank when clean). */
export function status(r: ModeResult): string {
  const v = r.validity, f = v.flagsOr;
  if (!v.inRange) return "out of range";
  if (f & FLAG.NOT_FOUND || !Number.isFinite(r.n_eff)) return "not found";
  if (f & FLAG.LEAKY) return "leaky";
  if (f & (FLAG.WINDOW_EDGE | FLAG.NOT_CONVERGED)) return "window edge";
  if (f & (FLAG.POL_HYBRID | FLAG.REIDENTIFIED) || v.hybrid) return "near anticrossing";
  if (f & FLAG.CROSS_LEAKY) return "lateral leak risk";
  if (f & FLAG.POL_RELABELED) return "pol. relabelled";
  if (f & FLAG.TRACK_LOW) return "low track overlap";
  return "";
}
export const fmtW = (w: number): string => `${w.toFixed(2)} µm`;
export const fmtT = (t: number): string => `${t.toFixed(0)} nm`;
export const fmtE = (e: number): string => e.toFixed(2);
export function modeRo(s: ModeState, L: ModeLattice | null): ModeRo {
  const geo = { w: fmtW(s.w), t: fmtT(s.t), e: fmtE(s.etch) };
  if (!L) return { ...DASH_RO, st: " ".repeat(ST_W), ...geo };
  const r = query(L, s, s.mode), st = status(r);
  const ok = r.validity.inRange && Number.isFinite(r.n_eff);
  return {
    neff: ok ? r.n_eff.toFixed(4) : DASH_RO.neff, ng: ok ? r.n_g.toFixed(3) : DASH_RO.ng,
    aeff: ok ? `${r.a_eff_um2.toFixed(2)} µm²` : DASH_RO.aeff, ln: ok ? r.ln_fraction.toFixed(2) : DASH_RO.ln, te: ok ? r.te_fraction.toFixed(2) : DASH_RO.te,
    st: st.padEnd(ST_W, " "), ...geo,
  };
}

// ---------- curves ----------
interface Curve { mode: ModeLabel; xs: number[]; ys: number[]; fl: boolean[] }
const NS = 90;
function curves(L: ModeLattice, s: ModeState): Curve[] {
  return MODE_LABELS.map((mode) => {
    const xs: number[] = [], ys: number[] = [], fl: boolean[] = [];
    for (let i = 0; i < NS; i++) {
      const w = W_MIN * (W_MAX_LAT / W_MIN) ** (i / (NS - 1));
      const r = query(L, s, mode, w);
      xs.push(w); ys.push(r.n_eff); fl.push((r.validity.flagsOr & QUALITY) !== 0);
    }
    return { mode, xs, ys, fl };
  });
}
function yRange(cv: Curve[], sl: { te: number; tm: number; nc: number }, li: boolean): [number, number] {
  let lo = Math.min(sl.te, sl.tm), hi = Math.max(sl.te, sl.tm);
  for (const k of cv) for (const y of k.ys) if (Number.isFinite(y)) { lo = Math.min(lo, y); hi = Math.max(hi, y); }
  if (li) { lo = Math.min(lo, LI_REF.neff); hi = Math.max(hi, LI_REF.neff); }
  lo = Math.max(lo, sl.nc);
  const span = Math.max(0.05, hi - lo), p = span * 0.08;
  return [Math.floor((lo - p) * 100) / 100, Math.ceil((hi + p) * 100) / 100];
}
const SER: Record<ModeLabel, string> = { TE0: "s1", TM0: "s2", TE1: "s3" };
/** Curves, flag bands, slab lines, out-of-lattice hatch, cursor and markers inside frame fr (shared by both variants). */
function plotBody(fr: Frame, s: ModeState, cv: Curve[] | null, sl: { te: number; tm: number }, opt: { mk: number; vis: boolean }): string {
  const { box } = fr, X0 = box.l, X1 = box.w - box.r, Y0 = box.h - box.b, Y1 = box.t;
  const P = (x: number, y: number): string => `${c(fr.x.f(x))} ${c(fr.y.f(y))}`;
  let g = `<defs><pattern id="f27-hp${opt.vis ? "v" : "t"}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" class="hpl"/></pattern>${clip(fr, `f27-mc${opt.vis ? "v" : "t"}`)}</defs>`;
  const xo = fr.x.f(W_MAX_LAT);
  g += `<rect class="oor" x="${c(xo)}" y="${c(Y1)}" width="${c(X1 - xo)}" height="${c(Y0 - Y1)}" fill="url(#f27-hp${opt.vis ? "v" : "t"})"/>`;
  g += `<text class="lg" x="${c((xo + X1) / 2)}" y="${c(Y0 - 22)}" text-anchor="middle">outside</text><text class="lg" x="${c((xo + X1) / 2)}" y="${c(Y0 - 8)}" text-anchor="middle">lattice</text>`;
  g += `<g clip-path="url(#f27-mc${opt.vis ? "v" : "t"})">`;
  g += `<line class="s6" x1="${X0}" x2="${c(xo)}" y1="${c(fr.y.f(sl.te))}" y2="${c(fr.y.f(sl.te))}"/><line class="s6" x1="${X0}" x2="${c(xo)}" y1="${c(fr.y.f(sl.tm))}" y2="${c(fr.y.f(sl.tm))}"/>`;
  if (cv) {
    for (const k of cv) {
      let d = "", band = "", pen = false, bpen = false;
      for (let i = 0; i < k.xs.length; i++) {
        const ok = Number.isFinite(k.ys[i]);
        if (!ok) { pen = false; bpen = false; continue; }
        d += `${pen ? "L" : "M"}${P(k.xs[i], k.ys[i])}`; pen = true;
        if (k.fl[i]) { band += `${bpen ? "L" : "M"}${P(k.xs[i], k.ys[i])}`; bpen = true; } else bpen = false;
      }
      if (band) g += `<path class="fl" d="${band}"/>`;
      g += `<path class="${SER[k.mode]}" d="${d}"/>`;
    }
  }
  g += `</g>`;
  // slab labels at the left
  g += `<text class="lg" x="${X0 + 4}" y="${c(fr.y.f(sl.te) - 4)}">slab TE</text><text class="lg" x="${X0 + 52}" y="${c(fr.y.f(sl.tm) - 4)}">slab TM</text>`;
  if (cv) for (const k of cv) {
    let j = k.ys.length - 1; while (j >= 0 && !Number.isFinite(k.ys[j])) j--;
    if (j >= 0) g += `<text class="lg" x="${c(fr.x.f(k.xs[j]) + 4)}" y="${c(fr.y.f(k.ys[j]) + 4)}" text-anchor="start">${k.mode}</text>`;
  }
  // Li et al. 2026 reference (engine), only at its own geometry
  if (isLiGeom(s)) {
    const x = fr.x.f(LI_REF.w), y = fr.y.f(LI_REF.neff);
    g += `<path class="mk" d="M${c(x)} ${c(y - 6)}l6 6 -6 6 -6 -6z"/><text class="lg" x="${c(x - 9)}" y="${c(y - 9)}" text-anchor="end">Li et al. 2026, engine</text>`;
  }
  // cursor and markers
  const xc = fr.x.f(Math.min(W_MAX, Math.max(W_MIN, s.w)));
  g += `<line class="cur" x1="${c(xc)}" x2="${c(xc)}" y1="${c(Y1)}" y2="${c(Y0)}"/>`;
  if (cv && LAT && s.w <= W_MAX_LAT + 1e-9) for (const m of MODE_LABELS) {
    const r = query(LAT, s, m);
    if (!Number.isFinite(r.n_eff)) continue;
    const y = fr.y.f(r.n_eff), sel = m === s.mode, h = sel ? opt.mk : opt.mk * 0.62;
    if (y < Y1 || y > Y0) continue;
    g += opt.vis
      ? `<circle class="vm${sel ? " on" : ""}" cx="${c(xc)}" cy="${c(y)}" r="${c(h)}"/>`
      : `<rect class="${sel ? "mk" : "mko"}" x="${c(xc - h / 2)}" y="${c(y - h / 2)}" width="${c(h)}" height="${c(h)}"/>`;
  }
  return g;
}
const WT = [0.6, 0.8, 1, 1.5, 2, 3].map((v) => ({ v, label: String(v), major: true }));

/** TECH plot (inner SVG content, viewBox 0 0 600 340). */
export function modesTechSVG(s: ModeState, L: ModeLattice | null): string {
  const sl = slabLimits(s), cv = L ? curves(L, s) : null;
  const fr = frame({ w: 600, h: 340, l: 56, r: 58, t: 24, b: 34 }, { kind: "log", d: [W_MIN, W_MAX] }, { d: yRange(cv ?? [], sl, isLiGeom(s)) });
  return axes(fr, { xlab: "top width w (µm)", ylab: "n<tspan baseline-shift=\"sub\" font-size=\"8\">eff</tspan>", xt: WT, yTarget: 5 }) + plotBody(fr, s, cv, sl, { mk: 8, vis: false });
}

/** VISUAL: cross-section at the chosen geometry (to scale) above the curves (full SVG, viewBox 0 0 760 720). */
export function modesVisualSVG(s: ModeState, L: ModeLattice | null): string {
  const K = 104, CX = 380, YB = 236; // px per um, centre, BOX top
  const X = (x: number): number => CX + x * K, Y = (y: number): number => YB - y * K;
  const t = s.t / 1000, e = s.etch * t, slab = t - e, wb = s.w + (2 * e) / Math.tan((s.sw * Math.PI) / 180);
  const xl = -3.4, xr = 3.4;
  let g = `<rect x="${c(X(xl))}" y="${c(Y(1.75))}" width="${c((xr - xl) * K)}" height="${c(1.75 * K)}" class="vx-clad"/>`;
  g += `<rect x="${c(X(xl))}" y="${c(Y(0))}" width="${c((xr - xl) * K)}" height="${c(0.5 * K)}" class="vx-box"/>`;
  const wl = Math.min(s.w, 6.6), wbl = Math.min(wb, 6.7);
  if (slab > 1e-6) g += `<rect x="${c(X(xl))}" y="${c(Y(slab))}" width="${c((xr - xl) * K)}" height="${c(slab * K)}" class="vx-ln"/>`;
  g += `<path class="vx-ln" d="M${c(X(-wbl / 2))} ${c(Y(slab))}L${c(X(-wl / 2))} ${c(Y(t))}H${c(X(wl / 2))}L${c(X(wbl / 2))} ${c(Y(slab))}Z"/>`;
  // c axis glyph
  const ax = s.cut === "x" ? `<path class="vx-c" d="M${c(X(-3.2))} ${c(Y(1.45))}h70"/><path class="vx-ch" d="M${c(X(-3.2) + 80)} ${c(Y(1.45))}l-12 -6v12z"/><text class="vx-cl" x="${c(X(-3.2))}" y="${c(Y(1.45) - 12)}">c (z), in plane</text>`
    : `<path class="vx-c" d="M${c(X(-3.1))} ${c(Y(1.1))}v-48"/><path class="vx-ch" d="M${c(X(-3.1))} ${c(Y(1.1) - 58)}l-6 12h12z"/><text class="vx-cl" x="${c(X(-3.1) + 14)}" y="${c(Y(1.1) - 30)}">c (z), normal</text>`;
  g += ax;
  // |E_x| / |E_y| share glyph of the selected mode at the rib centre
  const r = L && s.w <= W_MAX_LAT + 1e-9 ? query(L, s, s.mode) : null;
  const te = r && Number.isFinite(r.te_fraction) ? Math.min(1, Math.max(0, r.te_fraction)) : null;
  const col = s.lam > 1.5 ? "var(--v-ir1550)" : s.lam > 1 ? "var(--v-ir1064)" : "var(--v-l775)";
  const ir = s.lam > 1 ? ` class="ir-el" stroke-dasharray="6 4"` : "";
  if (te !== null) {
    const R = 64, rx = Math.max(3, R * Math.sqrt(te)), ry = Math.max(3, R * Math.sqrt(1 - te)), cy = Y(slab + e / 2);
    g += `<ellipse cx="${CX}" cy="${c(cy)}" rx="${c(rx)}" ry="${c(ry)}" fill="none" stroke="${col}" stroke-width="3"${ir}/>`;
    g += `<path d="M${c(CX - rx)} ${c(cy)}H${c(CX + rx)}M${CX} ${c(cy - ry)}V${c(cy + ry)}" stroke="${col}" stroke-width="1.2" fill="none"${ir}/>`;
  }
  // width dimension and scale bar
  g += `<path class="vx-dm" d="M${c(X(-wl / 2))} ${c(Y(t) - 22)}H${c(X(wl / 2))}M${c(X(-wl / 2))} ${c(Y(t) - 28)}v12M${c(X(wl / 2))} ${c(Y(t) - 28)}v12"/>`;
  g += `<text class="vx-dmt" x="${CX}" y="${c(Y(t) - 32)}" text-anchor="middle">w ${s.w.toFixed(2)} µm${s.w > W_MAX_LAT + 1e-9 ? ", outside lattice" : ""}</text>`;
  g += `<path class="vx-dm" d="M${c(X(xr) - 10 - K)} ${c(Y(-0.36))}H${c(X(xr) - 10)}"/><text class="vx-dmt" x="${c(X(xr) - 10 - K / 2)}" y="${c(Y(-0.36) - 8)}" text-anchor="middle">1 µm</text>`;
  g += `<text class="vx-lb" x="${c(X(xl) + 10)}" y="${c(Y(-0.25) + 6)}">SiO₂</text><text class="vx-lb" x="${c(X(xr) - 10)}" y="${c(Y(1.5))}" text-anchor="end">SiO₂ cladding</text>`;
  // curves
  const sl = slabLimits(s), cv = L ? curves(L, s) : null;
  const fr = frame({ w: 760, h: 420, l: 70, r: 70, t: 30, b: 44 }, { kind: "log", d: [W_MIN, W_MAX] }, { d: yRange(cv ?? [], sl, isLiGeom(s)) });
  const body = axes(fr, { xlab: "top width w, µm", ylab: "n<tspan baseline-shift=\"sub\" font-size=\"10\">eff</tspan>", xt: WT, yTarget: 5 }) + plotBody(fr, s, cv, sl, { mk: 10, vis: true });
  return `<svg viewBox="0 0 760 720" role="img" aria-label="Cross-section of the rib at the chosen geometry, to scale, above effective index versus top width for the TE0, TM0 and TE1 modes">${g}<g transform="translate(0 300)" class="lp">${body}</g></svg>`;
}

// ---------- mount ----------
function bindAll(dis: Disposer, root: ParentNode, pre: string, paint: () => void): () => void {
  const R = (v: number): number => v;
  const syncs = [
    bindRange(dis, q(root, `#${pre}-t-in`), q(root, `#${pre}-t-o`), { read: R, write: R, fmt: fmtT, aria: (v) => `${v.toFixed(0)} nanometres`, get: () => MS.t, set: (v) => { MS.t = v; } }, paint),
    bindRange(dis, q(root, `#${pre}-e-in`), q(root, `#${pre}-e-o`), { read: R, write: R, fmt: fmtE, aria: (v) => `etch fraction ${v.toFixed(2)}`, get: () => MS.etch, set: (v) => { MS.etch = v; } }, paint),
    bindRange(dis, q(root, `#${pre}-w-in`), q(root, `#${pre}-w-o`), { read: WMAP.to, write: WMAP.from, fmt: fmtW, aria: (v) => `${v.toFixed(2)} micrometres`, get: () => MS.w, set: (v) => { MS.w = v; } }, paint),
    bindSeg(dis, q(root, `#${pre}-sw`), () => String(MS.sw), (v) => { MS.sw = +v; }, paint),
    bindSeg(dis, q(root, `#${pre}-lam`), () => String(MS.lam), (v) => { MS.lam = +v; }, paint),
    bindSeg(dis, q(root, `#${pre}-cut`), () => MS.cut, (v) => { MS.cut = v === "z" ? "z" : "x"; }, paint),
    bindSeg(dis, q(root, `#${pre}-mode`), () => MS.mode, (v) => { MS.mode = (MODE_LABELS as readonly string[]).includes(v) ? (v as ModeLabel) : "TE0"; }, paint),
  ];
  const sync = (): void => syncs.forEach((f) => f());
  const pb = q<HTMLButtonElement>(root, `#${pre}-li`);
  if (pb) dis.on(pb, "click", () => { Object.assign(MS, { t: LI_REF.t, etch: LI_REF.etch, w: LI_REF.w, sw: LI_REF.sw, lam: LI_REF.lam, cut: LI_REF.cut, mode: "TE0" }); sync(); paint(); });
  return sync;
}
const setRo = (root: ParentNode, pre: string, r: ModeRo): void => {
  for (const k of ["neff", "ng", "aeff", "ln", "te", "st"] as const) for (const el of qa(root, `#${pre}-${k}`)) el.textContent = r[k];
};
/** Start loading when el comes within 800 px of the viewport. */
function lazyLoad(dis: Disposer, el: Element): void {
  if (LAT) return;
  if (typeof IntersectionObserver === "undefined") { void loadLattice(); return; }
  const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io.disconnect(); void loadLattice(); } }, { rootMargin: "800px 0px" });
  io.observe(el);
  dis.add(() => io.disconnect());
}

/** TECH panel (always mounted). */
export function mountModesTech(root: HTMLElement): () => void {
  const dis = new Disposer();
  const svg = need(root, "#f27-msvg");
  const paint = (): void => { svg.innerHTML = modesTechSVG(MS, LAT); setRo(root, "f27-m", modeRo(MS, LAT)); };
  const sync = bindAll(dis, root, "f27-m", paint);
  const full = (): void => { sync(); paint(); };
  dis.add(onUi(full));
  dis.add(onLattice(paint));
  lazyLoad(dis, need(root, "#f27-lat"));
  full();
  return dis.run;
}

/** VISUAL instrument (whenVisual). */
export function initModesVisual(root: HTMLElement): Part {
  const dis = new Disposer();
  const stage = need(root, "#f27-vmodes");
  const paint = (): void => { stage.innerHTML = modesVisualSVG(MS, LAT); setRo(root, "f27-vm", modeRo(MS, LAT)); };
  const sync = bindAll(dis, root, "f27-vm", paint);
  dis.add(onLattice(paint));
  lazyLoad(dis, stage);
  const repaint = (): void => { sync(); paint(); };
  repaint();
  return { repaint, dispose: dis.run };
}

// ---------- held-out error (server: from lattice meta) ----------
export interface HeldStats { median: number; p95: number; max: number }
interface HeldQ { n_eff: HeldStats; n_g: HeldStats }
export interface HeldMode { comparable: number; clean: number; flagged?: number; all: HeldQ; clean_stats: HeldQ; flagged_stats?: HeldQ }
const sci1 = (v: number): string => v.toExponential(1).replace("e-", `e${MINUS}`).replace("e+", "e");
/** Boxed table rows of the held-out interpolation error: clean, flagged and all points (median / p95). */
export function heldRows(stats: Record<string, HeldMode>): string {
  const mp = (x: HeldStats | undefined): string => (x ? `${sci1(x.median)} / ${sci1(x.p95)}` : "–");
  let s = "";
  for (const m of MODE_LABELS) {
    const h = stats[m];
    if (!h) continue;
    s += `<tr><td class="h">${m}</td><td class="num">${h.clean} / ${h.flagged ?? h.comparable - h.clean}</td>`
      + `<td class="num">${mp(h.clean_stats.n_eff)}</td><td class="num">${mp(h.flagged_stats?.n_eff)}</td><td class="num">${mp(h.all.n_eff)}</td>`
      + `<td class="num">${mp(h.clean_stats.n_g)}</td><td class="num">${mp(h.flagged_stats?.n_g)}</td><td class="num">${mp(h.all.n_g)}</td></tr>`;
  }
  return s;
}
