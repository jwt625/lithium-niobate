// SHG efficiency ledger (section 2.3 L3): the measured values of the 2.3 L2 table (all reported) on two panels that
// share the date axis and never share a unit (%/W/cm^2 above, %/W below); converter eta_norm, L -> %/W (nonlinear.percentPerW)
// and the ring model %/W vs Q at fixed g, H/hbar = g (a^2 b^dag + h.c.), critical coupling (nonlinear.ringShgEfficiency).
// chen2024nn is excluded (its 104 %/W in the research table is a known transcription error; the corrected value is unverified).
import { percentPerW, ringShgEfficiency } from "$lib/physics/nonlinear.ts";
import { C0 } from "$lib/physics/constants.ts";
import { Disposer, need, q, rafQueue } from "../dom.ts";
import { bindRange, bindSeg, bindToggle, logMap } from "./ctl.ts";
import { frame, axes, ticks, decadeLabel, clip, c as r1p, type Frame } from "./plot.ts";
import { FS } from "../fmt.ts";
import { fx, ex, badge, roRows, hudRows, lightColor, esc } from "./f23-common.ts";
import type { Part } from "../visual/lifecycle.ts";

type Ser = "wg" | "dfg" | "wgw" | "ring";
export interface Rec { key: string; pop: string; date: string; who: string; dev: string; v: number; ser: Ser; sh: number | null; dx: number; dy: number; anchor: "start" | "end" }
/** Manuscript 2.3 L2 table (dates: issue dates from refs.yaml). sh: SH wavelength in nm only where the held source gives
 *  the pump (wang2018optica: 1.5 um pump); mishra2021 is DFG with mid-IR output. */
export const RECS: Rec[] = [
  { key: "yamada1993", pop: "r:yamada1993", date: "1993-02-01", who: "Yamada et al. 1993", dev: "LiNbO3 waveguide, field-poled at room temperature, first-order QPM, blue SHG; 20.7 mW blue", v: 600, ser: "wg", sh: null, dx: 9, dy: 4, anchor: "start" },
  { key: "wang2018optica", pop: "r:wang2018optica", date: "2018-11-07", who: "Wang et al. 2018", dev: "TFLN PPLN, 1.5 µm pump, 4 µm period", v: 2600, ser: "wg", sh: 750, dx: -9, dy: 4, anchor: "end" },
  { key: "rao2019", pop: "r:rao2019", date: "2019-08-28", who: "Rao et al. 2019", dev: "TFLN, actively monitored poling", v: 4600, ser: "wg", sh: null, dx: -9, dy: -10, anchor: "end" },
  { key: "zhao2020oe", pop: "r:zhao2020oe", date: "2020-06-19", who: "Zhao et al. 2020", dev: "TFLN, shallow etch, MgO, 5 mm", v: 3757, ser: "wg", sh: null, dx: 9, dy: -8, anchor: "start" },
  { key: "mishra2021", pop: "r:mishra2021", date: "2021-06-16", who: "Mishra et al. 2021", dev: "TFLN on sapphire, DFG to 3.66 µm", v: 200, ser: "dfg", sh: 3660, dx: 9, dy: 4, anchor: "start" },
  { key: "park2022", pop: "r:park2022", date: "2022-05-19", who: "Park et al. 2022", dev: "TFLN, blue SHG", v: 33000, ser: "wg", sh: null, dx: -9, dy: 4, anchor: "end" },
  { key: "li2024apn", pop: "r:li2024apn", date: "2024-11-07", who: "Li et al. 2024", dev: "double-layer, polarization-reversed TFLN; 85% absolute at high power", v: 9600, ser: "wg", sh: null, dx: -9, dy: -8, anchor: "end" },
  { key: "luo2018", pop: "r:luo2018", date: "2018-08-16", who: "Luo et al. 2018", dev: "TFLN, modal phase matching (no poling), 8 mm", v: 4.7, ser: "wgw", sh: null, dx: 9, dy: 4, anchor: "start" },
  { key: "zhao2020oe-w", pop: "r:zhao2020oe", date: "2020-06-19", who: "Zhao et al. 2020", dev: "TFLN, shallow etch, MgO, 5 mm (whole device)", v: 939, ser: "wgw", sh: null, dx: 9, dy: -8, anchor: "start" },
  { key: "lu2019", pop: "r:lu2019", date: "2019-11-21", who: "Lu et al. 2019", dev: "z-cut PPLN microring", v: 250000, ser: "ring", sh: null, dx: -9, dy: 4, anchor: "end" },
  { key: "lu2020", pop: "r:lu2020", date: "2020-11-23", who: "Lu et al. 2020", dev: "PPLN microring; g/2π about 1.2 MHz (authors' convention)", v: 5e6, ser: "ring", sh: null, dx: 9, dy: 4, anchor: "start" },
];
const SER: Record<Ser, { unit: string; lab: string }> = {
  wg: { unit: "%/W/cm²", lab: "waveguide, normalized" }, dfg: { unit: "%/W/cm²", lab: "waveguide, DFG" },
  wgw: { unit: "%/W", lab: "waveguide, whole device" }, ring: { unit: "%/W", lab: "ring" },
};
const year = (d: string): number => { const [y, m, dd] = d.split("-").map(Number); return y + ((m - 1) * 30.44 + dd - 1) / 365.25; };

export interface S9 { log: boolean; eta: number; Lmm: number; Q: number; g: number; hov: string; wg: boolean; ring: boolean; dfg: boolean }
export const S9_DEFAULT: S9 = { log: true, eta: 2600, Lmm: 5, Q: 1e5, g: 1, hov: "wang2018optica", wg: true, ring: true, dfg: true };
export const s9: S9 = { ...S9_DEFAULT };
const EMAP = logMap(100, 40000, 1000), LMAP = logMap(0.1, 50, 1000), QMAP = logMap(1e4, 1e8, 1000), GMAP = logMap(0.1, 10, 1000);

const OMEGA = (2 * Math.PI * C0) / 1.55e-6;
export function conv9(s: S9): { pw: number; ring: number; kap: number } {
  const ka = OMEGA / s.Q, kb = (2 * OMEGA) / s.Q;
  const ring = 100 * ringShgEfficiency({ g: 2 * Math.PI * s.g * 1e6, kappa_a: ka, kappa_b: kb, kappa_a_ex: ka / 2, kappa_b_ex: kb / 2, omega_a: OMEGA });
  return { pw: percentPerW(s.eta, s.Lmm / 10), ring, kap: ka / (2 * Math.PI) };
}
const shown = (s: S9, r: Rec): boolean => (r.ser === "ring" ? s.ring : r.ser === "dfg" ? s.dfg : s.wg);

interface Geo { top: Frame; bot: Frame; pts: { key: string; x: number; y: number }[] }
function geo(s: S9, W: number, H: number, l: number, r: number): Geo {
  const gap = 40, t = 28, b = 34, ph = (H - t - b - gap) / 2;
  const top = frame({ w: W, h: t + ph, l, r, t, b: 0 }, { d: [1990, 2027] }, s.log ? { kind: "log", d: [100, 1e5] } : { d: [0, 36000] });
  const bot = frame({ w: W, h: H, l, r, t: t + ph + gap, b }, { d: [1990, 2027] }, s.log ? { kind: "log", d: [1, 1e9] } : { d: [0, 6e6] });
  return { top, bot, pts: [] };
}
const fr4 = (fr: Frame, v: number): number => Math.min(fr.box.h - fr.box.b, Math.max(fr.box.t, fr.y.f(v)));
function mark(ser: Ser, x: number, y: number, z: number, attr: string): string {
  const h = z / 2;
  if (ser === "wg" || ser === "dfg") return `<rect x="${r1p(x - h)}" y="${r1p(y - h)}" width="${z}" height="${z}" ${attr}/>`;
  if (ser === "wgw") return `<path d="M${r1p(x)} ${r1p(y - h - 1)}L${r1p(x + h + 1)} ${r1p(y + h)}L${r1p(x - h - 1)} ${r1p(y + h)}Z" ${attr}/>`;
  return `<path d="M${r1p(x)} ${r1p(y - h - 1.5)}L${r1p(x + h + 1.5)} ${r1p(y)}L${r1p(x)} ${r1p(y + h + 1.5)}L${r1p(x - h - 1.5)} ${r1p(y)}Z" ${attr}/>`;
}

/** Two-panel plot shared by both variants (TECH: mono labels, marker shape per normalization; VISUAL: optics colors). */
function plot9(s: S9, visual: boolean): { svg: string; pts: Geo["pts"] } {
  const W = visual ? 1000 : 600, H = visual ? 540 : 440;
  const g = geo(s, W, H, visual ? 96 : 64, visual ? 96 : 66);
  const cv = conv9(s);
  const yf = s.log ? decadeLabel : undefined;
  const id = visual ? "v09" : "f09";
  let o = `<defs>${clip(g.top, `${id}-ct`)}${clip(g.bot, `${id}-cb`)}</defs>`;
  const xt = ticks(g.top.x, 8).map((t) => ({ ...t, label: "" }));
  o += axes(g.top, { xt, yfmt: yf, ylab: "%/W/cm² (normalized: P<tspan baseline-shift=\"sub\" font-size=\"0.75em\">2ω</tspan>/(P<tspan baseline-shift=\"sub\" font-size=\"0.75em\">ω</tspan>²L²))", yTarget: 4 });
  o += axes(g.bot, { xTarget: 8, xfmt: (v) => String(Math.round(v)), yfmt: yf, ylab: "%/W (P<tspan baseline-shift=\"sub\" font-size=\"0.75em\">2ω</tspan>/P<tspan baseline-shift=\"sub\" font-size=\"0.75em\">ω</tspan>², one device)", yTarget: 5 });
  // converter lines: eta in the top panel, eta L^2 and the ring model in the bottom panel
  const hline = (fr: Frame, v: number, cls: string, lab: string, cid: string): string => {
    const y = fr.y.f(v), X1 = fr.box.w - fr.box.r;
    const yy = Math.min(fr.box.h - fr.box.b, Math.max(fr.box.t, y));
    return `<line class="${cls}" x1="${fr.box.l}" x2="${r1p(X1)}" y1="${r1p(y)}" y2="${r1p(y)}" clip-path="url(#${cid})"/><text class="${visual ? "f23-t3" : "lg"}" x="${r1p(X1 + 6)}" y="${r1p(yy + 4)}">${lab}</text>`;
  };
  o += hline(g.top, s.eta, visual ? "s2" : "s3", "η input", `${id}-ct`);
  o += hline(g.bot, cv.pw, visual ? "s2" : "s3", "ηL²", `${id}-cb`);
  o += hline(g.bot, cv.ring, visual ? "f23-ring" : "s5", "ring Q³", `${id}-cb`);
  if (visual) {
    const ya = year("1993-02-01"), x = g.top.x.f(ya);
    o += `<line x1="${r1p(x)}" x2="${r1p(x)}" y1="${g.top.box.t}" y2="${r1p(g.bot.box.h - g.bot.box.b)}" stroke="var(--v-au)" stroke-dasharray="3 5" stroke-width="1.5"/><text class="f23-t3 f23-ml" x="${r1p(x + 8)}" y="${r1p(g.bot.box.t + 18)}">1993 field-poled LN waveguide</text>`;
  }
  const pts: Geo["pts"] = [];
  for (const r of RECS) {
    if (!shown(s, r)) continue;
    const fr = r.ser === "wg" || r.ser === "dfg" ? g.top : g.bot;
    const x = fr.x.f(year(r.date)), y = fr4(fr, r.v);
    pts.push({ key: r.key, x, y });
    const on = r.key === s.hov;
    if (visual) {
      const col = r.sh ? lightColor(r.sh) : null;
      const fill = col && !col.ir ? col.c : r.ser === "dfg" ? "none" : "var(--v-text)";
      const stroke = col ? col.c : "var(--v-text)";
      o += mark(r.ser, x, y, on ? 16 : 12, `fill="${fill}" stroke="${stroke}" stroke-width="2"${col?.ir ? ' stroke-dasharray="3 2" class="ir-el"' : ""}`) + (on ? mark(r.ser, x, y, 26, `fill="none" stroke="${stroke}" stroke-opacity="0.45" stroke-width="2"`) : "");
      o += `<text class="f23-t2 f23-ml" x="${r1p(x + r.dx * 1.4)}" y="${r1p(y + r.dy * 1.3)}" text-anchor="${r.anchor}">${r.who}</text>`;
    } else {
      o += mark(r.ser, x, y, on ? 9 : 7, `class="${r.ser === "dfg" ? "mko" : "mk"}"`);
      if (on) o += `<rect class="cur" x="${r1p(x - 8)}" y="${r1p(y - 8)}" width="16" height="16" fill="none"/>`;
      o += `<text class="lg" x="${r1p(x + r.dx)}" y="${r1p(y + r.dy)}" text-anchor="${r.anchor}">${r.who}</text>`;
    }
  }
  const defs = "";
  return { svg: `<svg class="lp" viewBox="0 0 ${W} ${H}" role="img" aria-label="Reported SHG efficiencies by date, normalized per square centimetre above and per device below">${defs}${o}</svg>`, pts };
}

const fmtEta = (v: number): string => `${String(Math.round(v)).padStart(5, FS)} %/W/cm²`;
const fmtL = (v: number): string => `${v.toPrecision(3).padStart(5, FS)} mm`;
const fmtQ = (v: number): string => ex(v, 2);
const fmtG = (v: number): string => `${v.toPrecision(3).padStart(4, FS)} MHz`;
const valStr = (r: Rec): string => `${r.v >= 1e5 ? r.v.toLocaleString("en-US") : String(r.v)} ${SER[r.ser].unit}`;

export function hov9(s: S9): string {
  const r = RECS.find((x) => x.key === s.hov) ?? RECS[1];
  return `<span class="d">${r.date}</span><span class="w">${esc(r.who)}</span><b>${valStr(r)}</b><span>${SER[r.ser].lab}</span>${badge("reported", r.pop)}<span class="dv">${esc(r.dev)}</span>`;
}
function rows9(s: S9): { t: [string, string, string][]; v: [string, string][] } {
  const c = conv9(s);
  const t: [string, string, string][] = [
    ["η<sub>norm</sub> L² at the set L", `${fx(c.pw, 1, 10)} %/W`, badge("derived", "f23-conv")],
    ["ring, critical coupling, Q<sub>a</sub> = Q<sub>b</sub> = Q", `${ex(c.ring, 3)} %/W`, badge("derived", "f23-ring")],
    ["κ<sub>a</sub>/2π = ν<sub>a</sub>/Q (1550 nm)", `${fx(c.kap / 1e6, 1, 10)} MHz`, badge("derived", "f23-ring")],
  ];
  const r = RECS.find((x) => x.key === s.hov) ?? RECS[1];
  const v: [string, string][] = [
    ["Record", r.who],
    ["Issue date", r.date],
    ["Value", valStr(r)],
    ["Normalization", SER[r.ser].lab],
    ["η<sub>norm</sub> L² at the set L", `${fx(c.pw, 1, 10)} %/W`],
    ["Ring model %/W (critical, Q<sub>a</sub> = Q<sub>b</sub>)", ex(c.ring, 3)],
    ["κ<sub>a</sub>/2π = ν<sub>a</sub>/Q (1550 nm)", `${fx(c.kap / 1e6, 1, 10)} MHz`],
  ];
  return { t, v };
}

export function init9(): { plot: string; vplot: string; ro: string; hov: string; hud: string; vdev: string } {
  const rw = rows9(S9_DEFAULT);
  return { plot: plot9(S9_DEFAULT, false).svg, vplot: plot9(S9_DEFAULT, true).svg, ro: roRows(rw.t), hov: hov9(S9_DEFAULT), hud: hudRows(rw.v), vdev: vdev9(S9_DEFAULT) };
}
export function vdev9(s: S9): string { const r = RECS.find((x) => x.key === s.hov) ?? RECS[1]; return `${esc(r.dev)} ${badge("reported", r.pop)}`; }
export const fmt9 = { eta: fmtEta(S9_DEFAULT.eta), L: fmtL(S9_DEFAULT.Lmm), Q: fmtQ(S9_DEFAULT.Q), g: fmtG(S9_DEFAULT.g) };

// ---------- mount ----------
export function mount9(root: HTMLElement, onVisual: (init: () => Part | null) => () => void): () => void {
  const dis = new Disposer();
  const syncs: (() => void)[] = [];
  let vis = false;
  let ptsT: Geo["pts"] = [], ptsV: Geo["pts"] = [];
  const draw = (): void => {
    const t = plot9(s9, false), rw = rows9(s9);
    ptsT = t.pts;
    need(root, "#f09-plot").innerHTML = t.svg;
    need(root, "#f09-ro").innerHTML = roRows(rw.t);
    need(root, "#f09-hov").innerHTML = hov9(s9);
    if (vis) {
      const v = plot9(s9, true);
      ptsV = v.pts;
      need(root, "#v09-plot").innerHTML = v.svg;
      need(root, "#v09-hud").innerHTML = hudRows(rw.v);
      need(root, "#v09-dev").innerHTML = vdev9(s9);
    }
  };
  const queue = rafQueue(draw);
  const changed = (): void => { syncs.forEach((f) => f()); queue(); };
  const hover = (box: HTMLElement, pts: () => Geo["pts"], W: number): void => {
    dis.on(box, "pointermove", (e: PointerEvent) => {
      const svg = box.querySelector("svg");
      if (!svg) return;
      const rc = svg.getBoundingClientRect(), k = W / rc.width;
      const x = (e.clientX - rc.left) * k, y = (e.clientY - rc.top) * k;
      let best = "", bd = (visTest() ? 40 : 26) ** 2;
      for (const p of pts()) { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = p.key; } }
      if (best && best !== s9.hov) { s9.hov = best; queue(); }
    });
  };
  const visTest = (): boolean => vis && document.documentElement.dataset.mode === "visual";
  const bind = (p: string): void => {
    syncs.push(bindSeg(dis, q(root, `#${p}-ax`), () => (s9.log ? "log" : "lin"), (v) => { s9.log = v === "log"; }, changed));
    for (const k of ["wg", "ring", "dfg"] as const) syncs.push(bindToggle(dis, q<HTMLButtonElement>(root, `#${p}-${k}`), () => s9[k], (v) => { s9[k] = v; }, changed));
    syncs.push(bindRange(dis, q(root, `#${p}-eta`), q(root, `#${p}-eta-o`), { read: EMAP.to, write: EMAP.from, fmt: fmtEta, aria: (v) => `${Math.round(v)} percent per watt per square centimetre`, get: () => s9.eta, set: (v) => { s9.eta = v; } }, changed));
    syncs.push(bindRange(dis, q(root, `#${p}-l`), q(root, `#${p}-l-o`), { read: LMAP.to, write: LMAP.from, fmt: fmtL, aria: (v) => `${v.toPrecision(3)} millimetre`, get: () => s9.Lmm, set: (v) => { s9.Lmm = v; } }, changed));
    syncs.push(bindRange(dis, q(root, `#${p}-q`), q(root, `#${p}-q-o`), { read: QMAP.to, write: QMAP.from, fmt: fmtQ, aria: (v) => `quality factor ${v.toExponential(2)}`, get: () => s9.Q, set: (v) => { s9.Q = v; } }, changed));
    syncs.push(bindRange(dis, q(root, `#${p}-g`), q(root, `#${p}-g-o`), { read: GMAP.to, write: GMAP.from, fmt: fmtG, aria: (v) => `${v.toPrecision(3)} megahertz`, get: () => s9.g, set: (v) => { s9.g = v; } }, changed));
  };
  bind("f09");
  hover(need(root, "#f09-plot"), () => ptsT, 600);
  syncs.forEach((f) => f());
  const offV = onVisual(() => {
    bind("v09"); hover(need(root, "#v09-plot"), () => ptsV, 1000); vis = true; syncs.forEach((f) => f()); draw();
    return { repaint: () => { syncs.forEach((f) => f()); draw(); } };
  });
  // TECH hit points for the default state (server markup)
  ptsT = plot9(s9, false).pts;
  return () => { offV(); dis.run(); };
}

// ---------- measured-efficiency table (2.3 L2), sortable ----------
export interface Meas { dev: string; val: string; norm: string; pop: string; date: string; v: number; grp: number }
/** Manuscript 2.3 L2 table, as listed. grp orders the normalizations (waveguide %/W/cm^2, DFG, waveguide %/W, ring). */
export const MEAS: Meas[] = [
  { dev: "LiNbO<sub>3</sub> waveguide, field-poled at room temperature, first-order QPM, blue SHG", val: "600 %/W/cm²; 20.7 mW blue", norm: "waveguide", pop: "r:yamada1993", date: "1993-02-01", v: 600, grp: 0 },
  { dev: "TFLN PPLN, 1.5 µm pump, 4 µm period", val: "2600 %/W/cm²", norm: "waveguide", pop: "r:wang2018optica", date: "2018-11-07", v: 2600, grp: 0 },
  { dev: "TFLN, shallow etch, MgO, 5 mm", val: "3757 %/W/cm² (939 %/W)", norm: "waveguide", pop: "r:zhao2020oe", date: "2020-06-19", v: 3757, grp: 0 },
  { dev: "TFLN, actively monitored poling", val: "4600 %/W/cm²", norm: "waveguide", pop: "r:rao2019", date: "2019-08-28", v: 4600, grp: 0 },
  { dev: "double-layer, polarization-reversed TFLN", val: "9600 %/W/cm² measured; >10,000 theory; 85% absolute at high power", norm: "waveguide", pop: "r:li2024apn", date: "2024-11-07", v: 9600, grp: 0 },
  { dev: "TFLN, blue SHG", val: "33,000 %/W/cm²", norm: "waveguide", pop: "r:park2022", date: "2022-05-19", v: 33000, grp: 0 },
  { dev: "TFLN on sapphire, DFG to 3.66 µm", val: "up to 200 %/W/cm²", norm: "waveguide (DFG)", pop: "r:mishra2021", date: "2021-06-16", v: 200, grp: 1 },
  { dev: "TFLN, modal phase matching (no poling), 8 mm", val: "4.7 %/W", norm: "waveguide, %/W", pop: "r:luo2018", date: "2018-08-16", v: 4.7, grp: 2 },
  { dev: "z-cut PPLN microring", val: "250,000 %/W", norm: "ring", pop: "r:lu2019", date: "2019-11-21", v: 250000, grp: 3 },
  { dev: "PPLN microring; g/2π about 1.2 MHz", val: "5,000,000 %/W", norm: "ring", pop: "r:lu2020", date: "2020-11-23", v: 5e6, grp: 3 },
];
/** Sort control for the measured table: reorders rows inside a fixed-size tbody (row set and column widths unchanged). */
export function mountSort(root: HTMLElement): () => void {
  const dis = new Disposer();
  let mode = "list";
  const order = (): number[] => {
    const ix = MEAS.map((_, i) => i);
    if (mode === "date") ix.sort((a, b) => MEAS[a].date.localeCompare(MEAS[b].date));
    if (mode === "value") ix.sort((a, b) => MEAS[a].grp - MEAS[b].grp || MEAS[b].v - MEAS[a].v);
    return ix;
  };
  const apply = (): void => {
    const tb = q(root, "#f23-meas-b");
    if (!tb) return;
    const rows = new Map([...tb.querySelectorAll<HTMLTableRowElement>("tr[data-i]")].map((r) => [+(r.dataset.i ?? 0), r]));
    for (const i of order()) { const r = rows.get(i); if (r) tb.appendChild(r); }
  };
  const sync = bindSeg(dis, q(root, "#f23-sort"), () => mode, (v) => { mode = v; }, apply);
  sync();
  return () => dis.run();
}
