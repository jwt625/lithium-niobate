// FIG-01-09 Poling bench: renderers shared by the prerender and the client. Pure functions of a PbRun and its analysis.
//   mapASCII     TECH character-cell domain map: one character per lattice column, two lattice rows per character row
//                ('#' both reversed, '+' one of two, '.' original); with line-height 1.3856 em and a 0.6 em glyph advance the
//                character cell has the true aspect of two lattice rows by one column, so hexagons keep their shape.
//   scopeASCII   TECH four-channel trace (V, I, Q, X with the KAI fit) with a '|' cursor at the current step.
//   scopeSVG     VISUAL four-channel trace (same channels; Q and 2 Ps A overlaid).
//   readouts     fixed-width readout strings (figure spaces, typographic minus; fmt.ts).
import { FS, MINUS, fix, pad, sgn } from "../fmt.ts";
import { kaiModel } from "../../physics/ferro.ts";
import { PB, colPitch_um, elDuty, patchArea, type PbAnalysis, type PbRun } from "./pbsim.ts";

const esc = (c: string): string => (c === "<" ? "&lt;" : c === "&" ? "&amp;" : c);
/** Grid of characters with per-cell class codes -> HTML with runs merged (0 plain, 1 b, 2 dim, 3 inv, 4 cursor). */
function gridHTML(ch: string[][], cl: Uint8Array[]): string {
  const tag = ["", "b", "i", "span class=\"inv\"", "b class=\"cur\""], end = ["", "b", "i", "span", "b"];
  const out: string[] = [];
  for (let r = 0; r < ch.length; r++) {
    let line = "", cur = 0;
    for (let c = 0; c < ch[r].length; c++) {
      const k = cl[r][c];
      if (k !== cur) { if (cur) line += `</${end[cur]}>`; if (k) line += `<${tag[k]}>`; cur = k; }
      line += esc(ch[r][c]);
    }
    if (cur) line += `</${end[cur]}>`;
    out.push(line);
  }
  return out.join("\n");
}

export const MAP_W = 96, MAP_ROWS = 32, LAB = 10;

/** TECH domain map with the comb row on top and x / y rulers (lattice spacing 0.25 um, template). */
export function mapASCII(r: PbRun, s: Uint8Array = r.st.s): string {
  const { ny } = r.p, W = MAP_W;
  const rows: string[][] = [], cls: Uint8Array[] = [];
  const push = (lab: string, body: string[], bc: Uint8Array): void => { rows.push([...lab.padEnd(LAB, " ").slice(0, LAB), ...body]); const c = new Uint8Array(LAB + W); c.fill(2, 0, LAB); c.set(bc, LAB); cls.push(c); };
  const per = r.p.period_cols, w = Math.round(r.p.duty * per);
  const comb: string[] = [], combC = new Uint8Array(W);
  for (let c = 0; c < W; c++) { const on = c % per < w; comb.push(on ? "=" : " "); combC[c] = on ? 1 : 0; }
  push("comb, +z ", comb, combC);
  for (let j = 0; j < MAP_ROWS; j++) {
    const r0 = 2 * (MAP_ROWS - 1 - j);
    const body: string[] = [], bc = new Uint8Array(W);
    for (let c = 0; c < W; c++) {
      const a = s[c * ny + r0] + s[c * ny + r0 + 1];
      body.push(a === 2 ? "#" : a === 1 ? "+" : ".");
      bc[c] = a === 2 ? 1 : a === 1 ? 0 : 2;
    }
    const yum = (MAP_ROWS - j) * 2 * 0.25; // top edge of the character row, um
    const lab = j % 8 === 0 ? `${pad(String(yum), 5)} um+` : `${" ".repeat(LAB - 1)}|`;
    push(lab, body, bc);
  }
  const rule: string[] = Array(W).fill("-"), lbl: string[] = Array(W).fill(" ");
  for (let x = 0; x <= 20; x += 5) {
    const c = Math.round(x / colPitch_um);
    if (c < W) { rule[c] = "+"; const t = String(x); for (let i = 0; i < t.length && c + i < W; i++) lbl[c + i] = t[i]; }
  }
  push(`${pad("0", 5)} um+`, rule, new Uint8Array(W).fill(2));
  push("    x, um ", lbl, new Uint8Array(W).fill(2));
  return gridHTML(rows, cls);
}

export interface Chan { key: "V" | "I" | "Q" | "X"; lo: number; hi: number; name: string; unit: string }
/** Channel scales: V fixed 0-13 kV (26 kV/mm x 0.5 mm); I in steps 20/40/80/160/320 nA chosen from the run so far; Q 0 to
 *  2 Ps A of the whole patch; X 0-1. */
export function channels(a: PbAnalysis, Ps: number): Chan[] {
  let m = 0;
  for (let i = 0; i <= a.k; i++) m = Math.max(m, a.I[i] * 1e9, -4 * a.I[i] * 1e9);
  const Is = [20, 40, 80, 160, 320].find((v) => v >= m) ?? 320;
  return [
    { key: "V", lo: 0, hi: 13, name: "V", unit: "kV" },
    { key: "I", lo: -Is / 4, hi: Is, name: "I", unit: "nA" },
    { key: "Q", lo: 0, hi: 2 * Ps * patchArea() * 1e12, name: "Q", unit: "pC" },
    { key: "X", lo: 0, hi: 1, name: "X", unit: "" },
  ];
}
const val = (r: PbRun, a: PbAnalysis, key: Chan["key"], i: number): number =>
  key === "V" ? r.V[i] / 1e3 : key === "I" ? a.I[i] * 1e9 : key === "Q" ? a.Q[i] * 1e12 : r.X[i];

/** Time axis of the traces: linear 0..window, or logarithmic from two time steps (0.1 ms) to the window. u in [0, 1]. */
export interface TAxis { u: (t_s: number) => number; t: (u: number) => number; ticks: { t: number; lab: string }[]; minor: number[] }
export function taxis(r: PbRun, log: boolean): TAxis {
  const tw = r.n * PB.dt, t0 = 2 * PB.dt;
  if (!log) {
    const twm = tw * 1e3, step = twm > 100 ? 20 : twm > 40 ? 10 : 5, ticks: TAxis["ticks"] = [];
    for (let tm = 0; tm <= twm + 1e-9; tm += step) ticks.push({ t: tm * 1e-3, lab: String(tm) });
    return { u: (t) => Math.max(0, Math.min(1, t / tw)), t: (u) => u * tw, ticks, minor: [] };
  }
  const L = Math.log(tw / t0), ticks: TAxis["ticks"] = [], minor: number[] = [];
  for (let e = -4; e <= 0; e++) for (const m of [1, 2, 5]) {
    const t = m * 10 ** e;
    if (t < t0 * 0.999 || t > tw * 1.001) continue;
    if (m === 1) ticks.push({ t, lab: e <= -4 ? "0.1" : String(+(t * 1e3).toPrecision(1)) }); else minor.push(t);
  }
  return { u: (t) => (t <= t0 ? 0 : Math.min(1, Math.log(t / t0) / L)), t: (u) => t0 * Math.exp(u * L), ticks, minor };
}

/** Mean (I) or end value (V, Q, X) per display bin; bins equal in u (time axis). NaN after step k (V: planned waveform). */
function binned(r: PbRun, a: PbAnalysis, key: Chan["key"], nb: number, ax: TAxis): { v: Float64Array; past: Uint8Array; kk: Int32Array } {
  const v = new Float64Array(nb).fill(Number.NaN), past = new Uint8Array(nb), kk = new Int32Array(nb);
  for (let b = 0; b < nb; b++) {
    const k0 = Math.min(r.n, Math.floor(ax.t(b / nb) / PB.dt + 1e-9)), k1 = Math.min(r.n, Math.max(1, Math.floor(ax.t((b + 1) / nb) / PB.dt + 1e-9)));
    kk[b] = k1;
    past[b] = k1 <= a.k ? 1 : 0;
    if (key === "V") { v[b] = r.V[k1] / 1e3; continue; }
    if (!past[b]) continue;
    if (key === "I" && k1 > k0) { let s = 0; for (let i = k0 + 1; i <= k1; i++) s += a.I[i]; v[b] = (s / (k1 - k0)) * 1e9; } else v[b] = val(r, a, key, k1);
  }
  return { v, past, kk };
}

const ROWS: Record<Chan["key"], number> = { V: 3, I: 7, Q: 4, X: 5 };
/** TECH trace: V (planned waveform dim ahead of the cursor), I, Q, X with the KAI fit ('o') and the electrode duty ('-'). */
export function scopeASCII(r: PbRun, a: PbAnalysis, Ps: number, log: boolean): string {
  const W = MAP_W, ch = channels(a, Ps), ax = taxis(r, log);
  const rows: string[][] = [], cls: Uint8Array[] = [];
  const cur = Math.min(W - 1, Math.floor(ax.u(r.t[a.k]) * W));
  for (const c of ch) {
    const R = ROWS[c.key];
    const g: string[][] = Array.from({ length: R }, () => Array(W).fill(" "));
    const k: Uint8Array[] = Array.from({ length: R }, () => new Uint8Array(W));
    const rowOf = (v: number): number => R - 1 - Math.max(0, Math.min(R - 1, Math.round(((v - c.lo) / (c.hi - c.lo)) * (R - 1))));
    if (c.key === "I") { const z = rowOf(0); for (let x = 0; x < W; x++) { g[z][x] = "-"; k[z][x] = 2; } }
    if (c.key === "X") { const z = rowOf(elDuty(r.cfg.el)); for (let x = 0; x < W; x += 2) { g[z][x] = "-"; k[z][x] = 2; } }
    if (c.key === "X" && a.fit) {
      for (let x = 0; x < W; x++) {
        const tb = ax.t((x + 1) / W);
        if (tb > r.cfg.T * 1e-3) break;
        const y = rowOf(kaiModel(tb, a.fit.n, a.fit.t0) * a.Xmax); g[y][x] = "o"; k[y][x] = 0;
      }
    }
    const { v, past } = binned(r, a, c.key, W, ax);
    let prev = -1;
    for (let x = 0; x < W; x++) {
      if (!Number.isFinite(v[x])) { prev = -1; continue; }
      const y = rowOf(v[x]);
      const over = v[x] > c.hi, under = v[x] < c.lo;
      if (prev >= 0 && Math.abs(y - prev) > 1) for (let yy = Math.min(y, prev) + 1; yy < Math.max(y, prev); yy++) { g[yy][x] = ":"; k[yy][x] = past[x] ? 1 : 2; }
      g[y][x] = over ? "^" : under ? "v" : "*"; k[y][x] = past[x] ? 1 : 2;
      prev = y;
    }
    for (let y = 0; y < R; y++) { if (g[y][cur] === " " || g[y][cur] === "-") { g[y][cur] = "|"; k[y][cur] = 4; } else k[y][cur] = 3; }
    const hiL = c.key === "X" ? "1" : c.key === "Q" ? fix(c.hi, 0) : String(c.hi);
    const loL = c.key === "X" || c.key === "V" || c.key === "Q" ? "0" : `${MINUS}${-c.lo}`;
    for (let y = 0; y < R; y++) {
      let lab = " ".repeat(LAB - 1) + "|";
      if (y === 0) lab = `${(c.name + " " + c.unit).padEnd(4).slice(0, 4)}${pad(hiL, 5)}+`;
      else if (y === R - 1) lab = `${" ".repeat(4)}${pad(loL, 5)}+`;
      else if (c.key === "I" && y === rowOf(0)) lab = `${" ".repeat(4)}${pad("0", 5)}+`;
      rows.push([...lab, ...g[y]]);
      const lc = new Uint8Array(LAB + W); lc.fill(2, 0, LAB); lc.set(k[y], LAB); cls.push(lc);
    }
  }
  const rule = Array(W).fill("-"), lbl = Array(W).fill(" ");
  for (const tk of ax.ticks) {
    const x = Math.min(W - 1, Math.round(ax.u(tk.t) * W));
    rule[x] = "+"; const x0 = Math.min(x, W - tk.lab.length); for (let i = 0; i < tk.lab.length; i++) lbl[x0 + i] = tk.lab[i];
  }
  for (const t of ax.minor) { const x = Math.min(W - 1, Math.round(ax.u(t) * W)); if (rule[x] === "-") rule[x] = "'"; }
  rows.push([..." ".repeat(LAB - 1), "+", ...rule]); cls.push(new Uint8Array(LAB + W).fill(2));
  rows.push([...(log ? "t, ms log " : "    t, ms "), ...lbl]); cls.push(new Uint8Array(LAB + W).fill(2));
  return gridHTML(rows, cls);
}

// ---------- VISUAL trace ----------
export const SC = { w: 760, h: 362, l: 74, r: 12, top: 10, gap: 16, axis: 30, hs: { V: 52, I: 92, Q: 66, X: 66 } as Record<Chan["key"], number> };
const f1 = (v: number): string => v.toFixed(1);

/** Channel geometry (top y, height) in the scope viewBox. */
export function chanBoxes(): Record<Chan["key"], [number, number]> {
  let y = SC.top;
  const o = {} as Record<Chan["key"], [number, number]>;
  for (const k of ["V", "I", "Q", "X"] as const) { o[k] = [y, SC.hs[k]]; y += SC.hs[k] + SC.gap; }
  return o;
}

/** Static and dynamic parts of the VISUAL trace as one SVG body (CSS classes carry the colours). */
export function scopeSVG(r: PbRun, a: PbAnalysis, Ps: number, log: boolean): string {
  const ch = channels(a, Ps), box = chanBoxes(), ax = taxis(r, log);
  const x0 = SC.l, x1 = SC.w - SC.r, pw = x1 - x0, nb = Math.round(pw / 2);
  const X = (b: number): number => x0 + ((b + 1) / nb) * pw;
  const o: string[] = [];
  for (const c of ch) {
    const [y0, h] = box[c.key];
    const Y = (v: number): number => y0 + h - ((Math.max(c.lo, Math.min(c.hi, v)) - c.lo) / (c.hi - c.lo)) * h;
    o.push(`<rect class="fr" x="${x0}" y="${y0}" width="${pw}" height="${h}"/>`);
    const ticks = c.key === "I" ? [c.lo, 0, c.hi] : [c.lo, c.hi];
    for (const tv of ticks) {
      const y = Y(tv);
      o.push(`<line class="tk" x1="${x0 - 5}" x2="${x0}" y1="${f1(y)}" y2="${f1(y)}"/>`);
      const lab = c.key === "X" ? (tv === 0 ? "0" : "1") : c.key === "Q" ? fix(tv, 0) : tv < 0 ? `${MINUS}${-tv}` : String(tv);
      o.push(`<text class="tl" x="${x0 - 8}" y="${f1(y + 4.5)}" text-anchor="end">${lab}</text>`);
    }
    if (c.key === "I") o.push(`<line class="zl" x1="${x0}" x2="${x1}" y1="${f1(Y(0))}" y2="${f1(Y(0))}"/>`);
    if (c.key === "X") o.push(`<line class="ed" x1="${x0}" x2="${x1}" y1="${f1(Y(elDuty(r.cfg.el)))}" y2="${f1(Y(elDuty(r.cfg.el)))}"/>`);
    o.push(`<text class="cl" x="${x0 + 8}" y="${y0 + 17}">${c.name}${c.unit ? `, ${c.unit}` : ""}</text>`);
    const { v, past, kk } = binned(r, a, c.key, nb, ax);
    const start = `${f1(x0)},${f1(Y(0))} `;
    if (c.key === "V") {
      let pp = "", fp = "", last = start;
      for (let b = 0; b < nb; b++) { const pt = `${f1(X(b))},${f1(Y(v[b]))} `; if (past[b]) { pp += pt; last = pt; } else { if (!fp) fp = last; fp += pt; } }
      if (fp) o.push(`<polyline class="tr fut" points="${fp.trim()}"/>`);
      if (pp) o.push(`<polyline class="tr" points="${start}${pp.trim()}"/>`);
      continue;
    }
    if (c.key === "Q") {
      let qa = "";
      for (let b = 0; b < nb; b++) if (past[b]) qa += `${f1(X(b))},${f1(Y(2 * Ps * r.A[kk[b]] * 1e12))} `;
      if (qa) o.push(`<polyline class="tr qa" points="${start}${qa.trim()}"/>`);
    }
    if (c.key === "X" && a.fit) {
      let fp = "";
      for (let b = 0; b < nb; b++) { const tb = ax.t((b + 1) / nb); if (tb > r.cfg.T * 1e-3) break; fp += `${f1(X(b))},${f1(Y(kaiModel(tb, a.fit.n, a.fit.t0) * a.Xmax))} `; }
      if (fp) o.push(`<polyline class="tr fit" points="${fp.trim()}"/>`);
    }
    let pp = "";
    for (let b = 0; b < nb; b++) if (past[b] && Number.isFinite(v[b])) pp += `${f1(X(b))},${f1(Y(v[b]))} `;
    if (pp) o.push(`<polyline class="tr" points="${start}${pp.trim()}"/>`);
  }
  const yb = box.X[0] + box.X[1];
  for (const t of ax.minor) { const x = x0 + ax.u(t) * pw; o.push(`<line class="tk" x1="${f1(x)}" x2="${f1(x)}" y1="${yb}" y2="${yb + 3}"/>`); }
  for (const tk of ax.ticks) {
    const x = x0 + ax.u(tk.t) * pw;
    o.push(`<line class="tk" x1="${f1(x)}" x2="${f1(x)}" y1="${yb}" y2="${yb + 6}"/><text class="tl" x="${f1(x)}" y="${yb + 21}" text-anchor="middle">${tk.lab}</text>`);
  }
  o.push(`<text class="tl" x="${x0 - 18}" y="${yb + 21}" text-anchor="end">t, ms</text>`);
  const xc = x0 + ax.u(r.t[a.k]) * pw;
  o.push(`<line class="cur" x1="${f1(xc)}" x2="${f1(xc)}" y1="${SC.top}" y2="${yb}"/>`);
  return o.join("");
}

// ---------- readouts ----------
export type PbReadouts = Record<string, string>;
export function readouts(r: PbRun, a: PbAnalysis, phase: "ready" | "run" | "done"): PbReadouts {
  const k = a.k;
  const tms = r.t[k] * 1e3, V = r.V[k] / 1e3;
  const A = r.A[k];
  let Xall = 0;
  for (let i = 0; i <= k; i++) Xall = Math.max(Xall, r.X[i]);
  const qa = A > 0 ? pad(fix((a.Q[k] / A) * 100, 1), 6) : pad("n/a", 6); // C/m^2 -> uC/cm^2
  const f = a.fit;
  return {
    t: `${pad(fix(tms, 2), 6)} ms`,
    V: `${pad(fix(V, 2), 5)} kV`,
    tv: `t ${pad(fix(tms, 2), 6)} ms${FS}V ${pad(fix(V, 2), 5)} kV`,
    E: `${pad(fix(r.cfg.E, 1), 4)} kV/mm${FS}=${FS}${pad(fix(r.cfg.E * 0.5, 2), 5)} kV`,
    Tp: `${pad(String(r.cfg.T), 2)} ms`,
    I: `${pad(sgn(a.I[k] * 1e9, 1), 6)} nA`,
    Q: `${pad(fix(a.Q[k] * 1e12, 1), 5)} pC`,
    QA: `${pad(fix(a.QA * 1e12, 1), 5)} pC`,
    qa: `${qa} µC/cm²`,
    A: `${pad(fix(A * 1e12, 1), 5)} µm²`,
    X: fix(r.X[k], 3),
    duty: fix(r.X[k], 2),
    eld: fix(elDuty(r.cfg.el), 2),
    back: Xall > 0 ? fix((Xall - r.X[k]) / Xall, 2) : "0.00",
    kai: f ? `n ${fix(f.n, 2)}` : `n ${pad("–", 4)}`,
    kai2: f ? `t₀ ${pad(fix(f.t0 * 1e3, 2), 5)} ms  r² ${fix(f.r2, 2)}` : `t₀ ${pad("–", 5)} ms  r² ${pad("–", 4)}`,
    phase: phase === "ready" ? "ready  " : phase === "run" ? "running" : "done   ",
    tw: `${pad(fix(r.n * PB.dt * 1e3, 0), 3)} ms`,
  };
}

// ---------- measured P-E loop (live) on the sourced-anchor reference ----------
// Frame: E and P along the applied field, which points against the virgin Ps, so the virgin state is P = -Ps and forward
// switching runs toward +Ps (the 1.8 loops, drawn along +z, are this picture mirrored through the origin). Live trace:
// E(t) = V(t)/d, P(t) = -Ps + Q_switched(t)/A_patch = -Ps + 2 Ps X(t). Reference: forward branch of the template tanh loop on
// the anchors (ferro.ts loopFields / loopBranch, width 0.05 Ec as in 1.8): forward switching at +Ec, reverse field
// -(Ec - 2 Eint), loop centre +Eint. The return branch is not drawn: the unipolar waveform never reverses the field.
import { loopBranch, loopFields } from "../../physics/ferro.ts";
export const LOOP = { Emax: 26, Pmax: 0.85, W: 44, R: 13, svgW: 360, svgH: 250 } as const;
export function loopAnchors(r: PbRun): { Efwd: number; Erev: number; ctr: number; w: number } {
  const F = loopFields(r.p.Ec / 1e6, r.p.Eint / 1e6); // kV/mm, along +z: Edown = -Ec, Eup = Ec - 2 Eint
  return { Efwd: -F.Edown, Erev: -F.Eup, ctr: -F.center, w: 0.05 * (r.p.Ec / 1e6) };
}
/** Forward reference branch in this frame: P(E) = -loopBranch(-E, ..., "down") = Ps tanh((E - Ec)/w). */
const refP = (E: number, Ps: number, r: PbRun): number => { const F = loopFields(r.p.Ec / 1e6, r.p.Eint / 1e6); return -loopBranch(-E, Ps, F.Eup, F.Edown, 0.05 * (r.p.Ec / 1e6), "down"); };
const liveE = (r: PbRun, k: number): number => r.V[k] / r.p.thickness_m / 1e6;
const liveP = (r: PbRun, k: number, Ps: number): number => -Ps + 2 * Ps * r.X[k];

export function loopASCII(r: PbRun, a: PbAnalysis, Ps: number): string {
  const { W, R, Emax, Pmax } = LOOP, L = 8;
  const g: string[][] = Array.from({ length: R }, () => Array(W).fill(" "));
  const k8: Uint8Array[] = Array.from({ length: R }, () => new Uint8Array(W));
  const col = (E: number): number => Math.max(0, Math.min(W - 1, Math.round(((E + Emax) / (2 * Emax)) * (W - 1))));
  const row = (P: number): number => Math.max(0, Math.min(R - 1, Math.round(((Pmax - P) / (2 * Pmax)) * (R - 1))));
  const an = loopAnchors(r);
  const z = row(0), c0 = col(0);
  for (let x = 0; x < W; x++) { g[z][x] = "-"; k8[z][x] = 2; }
  for (let y = 0; y < R; y++) { g[y][c0] = "|"; k8[y][c0] = 2; }
  for (const E of [an.Efwd, an.Erev]) { const x = col(E); for (let y = 0; y < R; y += 2) { g[y][x] = ":"; k8[y][x] = 2; } }
  for (let x = 0; x < W; x++) { const E = -Emax + (2 * Emax * x) / (W - 1); const y = row(refP(E, Ps, r)); g[y][x] = "o"; k8[y][x] = 2; }
  let px = -1, py = -1;
  for (let k = 0; k <= a.k; k++) {
    const x = col(liveE(r, k)), y = row(liveP(r, k, Ps));
    if (x === px && y === py) continue;
    if (px >= 0 && x === px) for (let yy = Math.min(y, py); yy <= Math.max(y, py); yy++) { g[yy][x] = "*"; k8[yy][x] = 1; }
    else if (px >= 0 && y === py) for (let xx = Math.min(x, px); xx <= Math.max(x, px); xx++) { g[y][xx] = "*"; k8[y][xx] = 1; }
    g[y][x] = "*"; k8[y][x] = 1; px = x; py = y;
  }
  { const x = col(liveE(r, a.k)), y = row(liveP(r, a.k, Ps)); g[y][x] = "@"; k8[y][x] = 3; }
  const rows: string[][] = [], cls: Uint8Array[] = [];
  const lab = (y: number): string => (y === row(Ps) ? `${pad(fix(Ps, 2), 6)} +` : y === z ? `${pad("0", 6)} +` : y === row(-Ps) ? `${pad(MINUS + fix(Ps, 2), 6)} +` : y === 0 ? "P, C/m²" : "       |");
  for (let y = 0; y < R; y++) { rows.push([...lab(y).padEnd(L).slice(0, L), ...g[y]]); const c = new Uint8Array(L + W); c.fill(2, 0, L); c.set(k8[y], L); cls.push(c); }
  const rule = Array(W).fill("-"), lbl = Array(W).fill(" ");
  const put = (E: number, t: string): void => { const x = col(E), x0 = Math.max(0, Math.min(x - Math.floor(t.length / 2), W - t.length)); rule[x] = "+"; for (let i = 0; i < t.length; i++) lbl[x0 + i] = t[i]; };
  put(-Emax, `${MINUS}${Emax}`); put(an.Erev, `${MINUS}${fix(-an.Erev, 0)}`); put(0, "0"); put(an.Efwd, fix(an.Efwd, 0)); put(Emax, String(Emax));
  rows.push([..."       +", ...rule]); cls.push(new Uint8Array(L + W).fill(2));
  rows.push([..."E kV/mm ", ...lbl]); cls.push(new Uint8Array(L + W).fill(2));
  return gridHTML(rows, cls);
}

export function loopSVG(r: PbRun, a: PbAnalysis, Ps: number): string {
  const { svgW, svgH, Emax, Pmax } = LOOP, l = 52, rt = 10, t = 12, b = 40;
  const X = (E: number): number => l + ((E + Emax) / (2 * Emax)) * (svgW - l - rt);
  const Y = (P: number): number => t + ((Pmax - Math.max(-Pmax, Math.min(Pmax, P))) / (2 * Pmax)) * (svgH - t - b);
  const an = loopAnchors(r), o: string[] = [];
  o.push(`<rect class="fr" x="${l}" y="${t}" width="${svgW - l - rt}" height="${svgH - t - b}"/>`);
  o.push(`<line class="zl" x1="${l}" x2="${svgW - rt}" y1="${f1(Y(0))}" y2="${f1(Y(0))}"/><line class="zl" x1="${f1(X(0))}" x2="${f1(X(0))}" y1="${t}" y2="${svgH - b}"/>`);
  for (const P of [-Ps, 0, Ps]) o.push(`<line class="tk" x1="${l - 5}" x2="${l}" y1="${f1(Y(P))}" y2="${f1(Y(P))}"/><text class="tl" x="${l - 8}" y="${f1(Y(P) + 4.5)}" text-anchor="end">${P === 0 ? "0" : (P < 0 ? MINUS : "") + fix(Math.abs(P), 2)}</text>`);
  for (const [E, lab] of [[-Emax, `${MINUS}${Emax}`], [an.Erev, `${MINUS}${fix(-an.Erev, 0)}`], [0, "0"], [an.Efwd, fix(an.Efwd, 0)], [Emax, String(Emax)]] as [number, string][])
    o.push(`<line class="tk" x1="${f1(X(E))}" x2="${f1(X(E))}" y1="${svgH - b}" y2="${svgH - b + 5}"/><text class="tl" x="${f1(X(E))}" y="${svgH - b + 19}" text-anchor="middle">${lab}</text>`);
  o.push(`<line class="an" x1="${f1(X(an.Efwd))}" x2="${f1(X(an.Efwd))}" y1="${t}" y2="${svgH - b}"/><line class="an" x1="${f1(X(an.Erev))}" x2="${f1(X(an.Erev))}" y1="${t}" y2="${svgH - b}"/>`);
  o.push(`<path class="ctr" d="M${f1(X(an.ctr))} ${svgH - b}l-5 -8h10z"/>`);
  o.push(`<text class="cl" x="${l + 6}" y="${t + 15}">P, C/m²</text><text class="tl" x="${svgW - rt}" y="${svgH - 4}" text-anchor="end">E along the applied field, kV/mm</text>`);
  let ref = "";
  for (let i = 0; i <= 120; i++) { const E = -Emax + (2 * Emax * i) / 120; ref += `${f1(X(E))},${f1(Y(refP(E, Ps, r)))} `; }
  o.push(`<polyline class="ref" points="${ref.trim()}"/>`);
  let pts = "", px = "", n = 0;
  const step = Math.max(1, Math.floor(a.k / 600));
  for (let k = 0; k <= a.k; k += step) { const p = `${f1(X(liveE(r, k)))},${f1(Y(liveP(r, k, Ps)))}`; if (p !== px) { pts += p + " "; px = p; n++; } }
  const pe = `${f1(X(liveE(r, a.k)))},${f1(Y(liveP(r, a.k, Ps)))}`;
  if (pe !== px) pts += pe;
  if (n) o.push(`<polyline class="tr" points="${pts.trim()}"/>`);
  o.push(`<circle class="now" cx="${pe.split(",")[0]}" cy="${pe.split(",")[1]}" r="4"/>`);
  return o.join("");
}
