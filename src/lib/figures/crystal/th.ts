// FIG-01-05 Threshold explorer (content/chapters/01-crystal/figures.md). Data browser over th-data.ts, no interpolation:
//   concentration axes with the printed threshold values (TECH: monospace axis per host with ^ markers and keys; VISUAL: one
//   illustrated axis whose markers slide when the host changes), the OH stretch band below / above the step (volk2008
//   Table 2.4, congruent host, Mg and Zn only), and the Li-site texture at the sourced Mg states 0, 3, 8 % (iyi1995 scheme via
//   volk2008 Table 2.2); any other concentration shows the nearest lower sourced state with a "no data between" label.
// The texture: 400 Li sites from composition.ts seededLattice (0 % state: 4 % vacancies, 1 % Nb antisites). seededLattice
// knows two defect species only, so the Mg states are derived here (display helper, not physics): antisites and 8 of the 16
// vacancies take Mg at 3 %, 4 Li sites empty; at 8 % a further 20 Li sites take Mg and 20 empty. Counts equal the sourced
// fractions times 400 exactly; which site holds which species is a seeded display choice.
// Pure renderers run at prerender (server load) and in the browser; mountThresh binds both variants to the `thresh` store.
import { seededLattice, LATTICE_CODE, mgBasisConvert } from "$lib/physics/composition.ts";
import { createRng } from "$lib/physics/prng.ts";
import { thresh } from "$lib/stores/crystal";
import { Disposer, onUi } from "../dom.ts";
import { rangeFill } from "../visual/range.ts";
import { DOPS, HOSTS, HOST_NAME, THRESH, OH_BANDS, SITES, type Dop, type Host, type Mark, type SiteState, type OH } from "./th-data.ts";

export interface ThState { dop: Dop; host: Host; c: number }
const EPS = 1e-9;
const f1 = (v: number): string => v.toFixed(1);
const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const padR = (s: string, n: number): string => (s.length >= n ? s : s + " ".repeat(n - s.length));

// ---------------------------------------------------------------- state logic
export const groupOf = (s: ThState): (typeof THRESH)[Dop][Host] => THRESH[s.dop][s.host];

/** Lowest and highest printed value of a group (range marks count with their upper end). */
function span(marks: Mark[]): { lo: number; hi: number } {
  const v = marks.flatMap((m) => (m.hi !== undefined ? [m.v, m.hi] : [m.v]));
  return { lo: Math.min(...v), hi: Math.max(...v) };
}

/** Where the slider sits relative to the printed values (comparison only, no interpolation). Fixed 31 characters. */
export function vsText(s: ThState): string {
  const ms = groupOf(s).marks;
  let t: string;
  if (!ms.length) t = "no sourced threshold";
  else if (ms.length === 1 && ms[0].kind === "lt") t = `${s.c < ms[0].v - EPS ? "below" : s.c > ms[0].v + EPS ? "above" : "at"} bound: threshold < ${f1(ms[0].v)}`;
  else {
    const { lo, hi } = span(ms);
    if (lo === hi) t = `${s.c < lo - EPS ? "below" : s.c > lo + EPS ? "above" : "at"} sourced ${f1(lo)}`;
    else { const r = `(${f1(lo)}-${f1(hi)})`; t = s.c < lo - EPS ? `below all sourced ${r}` : s.c > hi + EPS ? `above all sourced ${r}` : `inside sourced spread ${r}`; }
  }
  return padR(t, 31);
}
export const mainText = (s: ThState): string => padR(`${padR(s.dop, 5)} ${f1(s.c)} mol%  host ${HOST_NAME[s.host].short}`, 29);

/** Site state shown: the sourced iyi1995 state at or below c (congruent host only); other dopants show the undoped 0 % state. */
export function siteOf(s: ThState): { st: SiteState | null; label: string; exact: boolean } {
  if (s.host !== "cln") return { st: null, label: "no sourced site occupancy in this host", exact: false };
  if (s.dop !== "MgO") {
    const exact = s.c < EPS;
    return { st: SITES[0], label: exact ? "sourced state: undoped (0 %)" : `undoped state (0 %) shown; no ${s.dop} site data`, exact };
  }
  let k = 0;
  for (let i = 0; i < SITES.length; i++) if (SITES[i].c <= s.c + EPS) k = i;
  const st = SITES[k], nx = SITES[k + 1], exact = Math.abs(s.c - st.c) < EPS;
  const label = exact ? `sourced state: ${st.c} % MgO` : nx ? `${st.c} % state shown; no data between ${st.c} and ${nx.c} %` : `${st.c} % state shown; no data above ${st.c} %`;
  return { st, label, exact };
}

/** OH band side: below / above the printed step, "at" exactly on it (the table gives < and >), none without data. */
export function ohOf(s: ThState): { oh: OH | null; side: "below" | "above" | "at" | "none" } {
  const oh = s.host === "cln" ? OH_BANDS[s.dop] ?? null : null;
  if (!oh) return { oh: null, side: "none" };
  return { oh, side: s.c < oh.step - EPS ? "below" : s.c > oh.step + EPS ? "above" : "at" };
}
export function ohText(s: ThState): string {
  const { oh, side } = ohOf(s);
  if (!oh) return "no sourced OH band data";
  const w = (a: number[]): string => a.join(", ");
  if (side === "at") return `${w(oh.below)} | ${w(oh.above)} cm\u207B\u00B9 (step)`;
  return `${w(side === "below" ? oh.below : oh.above)} cm\u207B\u00B9, ${side} ${oh.stepTxt}`;
}

// ---------------------------------------------------------------- texture (400 sites)
export const TILE_N = 20, TILE_SEED = 1605;
export const SP = { Li: 0, V: 1, Nb: 2, Mg: 3 } as const;
function buildTiles(): Uint8Array[] {
  const base = seededLattice(TILE_N, 0.04, 0.01, TILE_SEED);
  const N = base.length;
  const rng = createRng(TILE_SEED + 1);
  const shuffle = (a: number[]): number[] => { for (let i = a.length - 1; i > 0; i--) { const j = rng.int(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const idx = (code: number): number[] => [...base.keys()].filter((i) => base[i] === code);
  const anti = idx(LATTICE_CODE.antisite), vac = shuffle(idx(LATTICE_CODE.vacancy)), li = shuffle(idx(LATTICE_CODE.Li));
  const pct = (p: number): number => Math.round((p / 100) * N);
  const s0 = new Uint8Array(N), s3 = new Uint8Array(N), s8 = new Uint8Array(N);
  for (let i = 0; i < N; i++) { const c = base[i] === LATTICE_CODE.vacancy ? SP.V : base[i] === LATTICE_CODE.antisite ? SP.Nb : SP.Li; s0[i] = c; }
  const B = vac.slice(0, pct(2)), C = vac.slice(pct(2)), D = li.slice(0, pct(1)), E = li.slice(pct(1), pct(6)), F = li.slice(pct(6), pct(11));
  s3.fill(SP.Li); s8.fill(SP.Li);
  for (const i of [...anti, ...B]) { s3[i] = SP.Mg; s8[i] = SP.Mg; }
  for (const i of [...C, ...D]) { s3[i] = SP.V; s8[i] = SP.V; }
  for (const i of E) s8[i] = SP.Mg;
  for (const i of F) s8[i] = SP.V;
  return [s0, s3, s8];
}
let tiles: Uint8Array[] | null = null;
export const tileFor = (st: SiteState | null): Uint8Array | null => { if (!st) return null; tiles ??= buildTiles(); return tiles[SITES.indexOf(st)]; };
export function tileCounts(t: Uint8Array): Record<keyof typeof SP, number> {
  const n = { Li: 0, V: 0, Nb: 0, Mg: 0 };
  t.forEach((c) => { if (c === SP.Li) n.Li++; else if (c === SP.V) n.V++; else if (c === SP.Nb) n.Nb++; else n.Mg++; });
  return n;
}

// ---------------------------------------------------------------- TECH: ASCII
type Cell = { ch: string; cls?: string };
const ser = (row: Cell[]): string => {
  let out = "", cur: string | undefined, buf = "";
  const flush = (): void => { if (!buf) return; out += cur ? `<span class="${cur}">${esc(buf)}</span>` : esc(buf); buf = ""; };
  for (const c of row) { if (c.cls !== cur) { flush(); cur = c.cls; } buf += c.ch; }
  flush();
  return out;
};
const blank = (n: number): Cell[] => Array.from({ length: n }, () => ({ ch: " " }));
const put = (row: Cell[], x: number, s: string, cls?: string): void => { [...s].forEach((ch, i) => { if (x + i >= 0 && x + i < row.length) row[x + i] = { ch, cls }; }); };

/** Monospace concentration axes, one per host (S characters per mol%, label column P), with ^ markers, spread '=',
 *  upper bound '<---^', keys, and the slider as an inverted column. 10 rows. */
export function asciiAxes(s: ThState, S: number, P: number): string {
  const W = P + 9 * S + 1, X = (v: number): number => P + Math.round(v * S);
  const rows: string[] = [];
  const head = blank(W);
  for (let k = 0; k <= 9; k++) put(head, P + k * S, String(k), "dim");
  put(head, 0, "mol%", "dim");
  rows.push(ser(head));
  const cx = X(s.c);
  for (const h of HOSTS) {
    const on = h === s.host, g = THRESH[s.dop][h];
    const ax = blank(W), mk = blank(W), ky = blank(W);
    put(ax, 0, padR(S >= 10 ? HOST_NAME[h].ascii : HOST_NAME[h].asciiN, P - 1), on ? "inv" : "dim");
    for (let k = 0; k <= 9 * S; k++) ax[P + k] = { ch: k % S === 0 ? "+" : "-", cls: on ? undefined : "dim" };
    ax[cx] = { ch: ax[cx].ch, cls: on ? "inv" : "cur" };
    if (!g.marks.length) put(ky, P, "no sourced value", "dim");
    else {
      const { lo, hi } = span(g.marks);
      if (g.marks.length > 1) for (let x = X(lo); x <= X(hi); x++) mk[x] = { ch: "=", cls: on ? undefined : "dim" };
      for (const m of g.marks) {
        if (m.kind === "lt") { for (let x = P; x < X(m.v); x++) mk[x] = { ch: x === P ? "<" : "-", cls: on ? undefined : "dim" }; }
        if (m.kind === "range" && m.hi !== undefined) mk[X(m.hi)] = { ch: "^", cls: on ? "hi" : "dim" };
        mk[X(m.v)] = { ch: "^", cls: on ? "hi" : "dim" };
      }
      let last = -1;
      for (const m of [...g.marks].sort((a, b) => a.v - b.v)) { const x = Math.max(X(m.v), last + 1); put(ky, x, m.k, on ? "hi" : "dim"); last = x; }
    }
    rows.push(ser(ax), ser(mk), ser(ky));
  }
  return rows.join("\n");
}

/** Site field: 400 sites as 16 rows of 25, two characters per site, odd rows offset (triangular look). 16 rows x 51 ch. */
export const TILE_ROWS = 16, TILE_COLS = 25, TILE_W = 51;
export function asciiTile(s: ThState): string {
  const { st } = siteOf(s), t = tileFor(st);
  const rows: string[] = [];
  if (!t) {
    for (let r = 0; r < TILE_ROWS; r++) {
      const row = blank(TILE_W);
      for (let i = 0; i < TILE_COLS; i++) put(row, 2 * i + (r % 2), "?", "dim");
      if (r === 7 || r === 8) { const m = r === 7 ? "  no sourced site occupancy  " : `  for ${s.dop} in ${HOST_NAME[s.host].short}  `; put(row, Math.floor((TILE_W - m.length) / 2), m); }
      rows.push(ser(row));
    }
    return rows.join("\n");
  }
  const G: Record<number, Cell> = { [SP.Li]: { ch: ".", cls: "dim" }, [SP.V]: { ch: " " }, [SP.Nb]: { ch: "#", cls: "hi" }, [SP.Mg]: { ch: "m", cls: "hi" } };
  for (let r = 0; r < TILE_ROWS; r++) {
    const row = blank(TILE_W);
    for (let i = 0; i < TILE_COLS; i++) row[2 * i + (r % 2)] = G[t[r * TILE_COLS + i]];
    rows.push(ser(row));
  }
  return rows.join("\n");
}

/** OH two-cell readout contents. */
export function ohCells(s: ThState): { hb: string; ha: string; wb: string; wa: string; ub: string; ua: string; side: string } {
  const { oh, side } = ohOf(s);
  if (!oh) return { hb: "below", ha: "above", wb: "no data", wa: "no data", ub: "", ua: "", side };
  return {
    hb: `below &lt; ${oh.stepTxt}`, ha: `above &gt; ${oh.stepTxt}`,
    wb: `${oh.below.join(", ")} cm<sup>&minus;1</sup>`, wa: `${oh.above.join(", ")} cm<sup>&minus;1</sup>`,
    ub: oh.um ? `${oh.um[0].toFixed(2)} &micro;m` : "", ua: oh.um ? `${oh.um[1].toFixed(2)} &micro;m` : "", side,
  };
}

// ---------------------------------------------------------------- VISUAL: SVG
export const AX = { W: 1000, H: 250, y: 160, X: (c: number): number => 50 + 100 * c } as const;
export const NSLOT = 5;
interface Slot { on: boolean; x: number; key: string; ky: number; bar: number; full: boolean }
export function axisGeom(s: ThState): { slots: Slot[]; spread: { on: boolean; x: number; w: number }; lt: { on: boolean; w: number }; cx: number; msg: string } {
  const g = groupOf(s), ms = [...g.marks].sort((a, b) => a.v - b.v), rows = THRESH[s.dop][s.host].rows;
  const fullKeys = new Set(rows.filter((r) => r.code === "P").flatMap((r) => r.keys.split(" ")));
  const slots: Slot[] = [];
  const last = [-1e9, -1e9, -1e9], KY = [104, 70, 36];
  for (let i = 0; i < NSLOT; i++) {
    const m = ms[i];
    if (!m) { slots.push({ on: false, x: slots[i - 1]?.x ?? AX.X(0), key: "", ky: KY[0], bar: 0, full: false }); continue; }
    const x = AX.X(m.v);
    let row = last.findIndex((lx) => x - lx >= 44);
    if (row < 0) row = last.indexOf(Math.min(...last));
    last[row] = x;
    slots.push({ on: true, x, key: m.k, ky: KY[row], bar: m.kind === "range" && m.hi !== undefined ? AX.X(m.hi) - x : 0, full: fullKeys.has(m.k) });
  }
  const multi = ms.length > 1, sp = multi ? span(ms) : { lo: 0, hi: 0 };
  const lt = ms.length === 1 && ms[0].kind === "lt";
  return {
    slots, spread: { on: multi, x: AX.X(sp.lo), w: Math.max(1, AX.X(sp.hi) - AX.X(sp.lo)) }, lt: { on: lt, w: lt ? AX.X(ms[0].v) - AX.X(0) : 1 },
    cx: AX.X(s.c), msg: ms.length ? "" : `no sourced threshold for ${s.dop} in this host`,
  };
}
const DIA = "M0 -12L12 0L0 12L-12 0Z", HALF = "M0 -12L0 12L-12 0Z";
export function axisSVG(s: ThState): string {
  const G = axisGeom(s);
  let t = "";
  for (let k = 0; k <= 9; k++) t += `<line x1="${AX.X(k)}" y1="${AX.y}" x2="${AX.X(k)}" y2="${AX.y + 12}" class="tk"/><text x="${AX.X(k)}" y="${AX.y + 42}" text-anchor="middle" class="tl">${k}</text>`;
  for (let k = 0; k < 9; k++) t += `<line x1="${AX.X(k + 0.5)}" y1="${AX.y}" x2="${AX.X(k + 0.5)}" y2="${AX.y + 6}" class="tk"/>`;
  const slots = G.slots.map((q, i) => `<g class="th-mk${q.on ? "" : " off"}${q.full ? " full" : ""}" data-i="${i}" style="transform:translate(${q.x.toFixed(1)}px,0px)">`
    + `<rect class="bar" x="0" y="${AX.y - 6}" height="12" width="${q.bar.toFixed(1)}"/><line class="ld" x1="0" x2="0" y1="${AX.y - 12}" y2="${q.ky + 8}"/>`
    + `<path class="dia" d="${DIA}" transform="translate(0 ${AX.y})"/><path class="half" d="${HALF}" transform="translate(0 ${AX.y})"/><text class="ky" x="0" y="${q.ky}" text-anchor="middle">${q.key}</text></g>`).join("");
  return `<svg viewBox="0 0 ${AX.W} ${AX.H}" role="img" aria-label="Concentration axis 0 to 9 mol% with the printed damage-resistance thresholds of the chosen dopant and host">`
    + `<defs><pattern id="th-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" class="hl"/></pattern></defs>`
    + `<rect class="th-spread${G.spread.on ? "" : " off"}" x="0" y="${AX.y - 44}" width="1" height="44" style="transform:translate(${G.spread.x.toFixed(1)}px,0px) scale(${G.spread.w.toFixed(1)},1)"/>`
    + `<rect class="th-lt${G.lt.on ? "" : " off"}" x="${AX.X(0)}" y="${AX.y - 44}" width="1" height="44" style="transform-origin:${AX.X(0)}px 0px;transform:scale(${G.lt.w.toFixed(1)},1)"/>`
    + `<path class="th-ltarr${G.lt.on ? "" : " off"}" d="M${AX.X(0) + 18} ${AX.y - 34}L${AX.X(0) + 4} ${AX.y - 22}L${AX.X(0) + 18} ${AX.y - 10}"/>`
    + `<line x1="${AX.X(0)}" y1="${AX.y}" x2="${AX.X(9)}" y2="${AX.y}" class="ax"/>${t}`
    + `<text x="${AX.X(9)}" y="${AX.H - 4}" text-anchor="end" class="ul">mol% as printed</text>`
    + `<g class="th-cur" transform="translate(${G.cx.toFixed(1)} 0)"><line x1="0" x2="0" y1="16" y2="${AX.y + 14}"/><path d="M-9 4L9 4L0 16Z"/></g>`
    + `<g class="th-slots">${slots}</g>`
    + `<text class="th-amsg" x="${AX.W / 2}" y="98" text-anchor="middle">${esc(G.msg)}</text></svg>`;
}

export const OHX = { W: 1000, H: 240, y: 196, k0: 3440, k1: 3580, X: (k: number): number => 50 + ((k - 3440) * 850) / 140 } as const;
export function ohLines(s: ThState): string {
  const { oh, side } = ohOf(s);
  if (!oh) return `<text class="th-msg" x="${OHX.W / 2}" y="132" text-anchor="middle">no sourced OH band position for ${esc(s.dop)} in this host</text>`;
  const act = side === "below" ? oh.below : side === "above" ? oh.above : [...oh.below, ...oh.above];
  const ghost = [...oh.below, ...oh.above].filter((k) => !act.includes(k));
  let out = ghost.map((k) => `<line class="gh" x1="${OHX.X(k).toFixed(1)}" x2="${OHX.X(k).toFixed(1)}" y1="64" y2="${OHX.y - 2}"/>`).join("");
  act.forEach((k, i) => {
    const x = OHX.X(k), left = act.length > 1 && i === 0 && side !== "at" ? true : side === "at" && i < oh.below.length;
    out += `<line class="ln${side === "at" ? " half" : ""}" x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="64" y2="${OHX.y - 2}"/>`
      + `<text class="lv" x="${(x + (left ? -12 : 12)).toFixed(1)}" y="${side === "at" ? 150 : 98}" text-anchor="${left ? "end" : "start"}">${k}</text>`;
  });
  return out;
}
export function ohSVG(s: ThState): string {
  let t = "";
  for (let k = OHX.k0; k <= OHX.k1; k += 20) t += `<line x1="${OHX.X(k).toFixed(1)}" y1="${OHX.y}" x2="${OHX.X(k).toFixed(1)}" y2="${OHX.y + 10}" class="tk"/>${k % 40 === 0 ? `<text x="${OHX.X(k).toFixed(1)}" y="${OHX.y + 38}" text-anchor="middle" class="tl">${k}</text>` : ""}`;
  for (const um of [2.8, 2.85, 2.9]) { const x = OHX.X(1e4 / um).toFixed(1); t += `<line x1="${x}" y1="40" x2="${x}" y2="50" class="tk"/><text x="${x}" y="30" text-anchor="middle" class="tl">${um.toFixed(2)}</text>`; }
  return `<svg viewBox="0 0 ${OHX.W} ${OHX.H}" role="img" aria-label="OH stretch absorption line position on a wavenumber axis, 3440 to 3580 per centimetre">`
    + `<line x1="${OHX.X(OHX.k0)}" y1="50" x2="${OHX.X(OHX.k1)}" y2="50" class="ax2"/><line x1="${OHX.X(OHX.k0)}" y1="${OHX.y}" x2="${OHX.X(OHX.k1)}" y2="${OHX.y}" class="ax"/>${t}`
    + `<text x="${OHX.W - 4}" y="30" text-anchor="end" class="ul">&micro;m</text><text x="${OHX.W - 4}" y="${OHX.y + 38}" text-anchor="end" class="ul">cm<tspan dy="-9" font-size="0.7em">&minus;1</tspan></text>`
    + `<g class="th-ohl">${ohLines(s)}</g></svg>`;
}

export const TL = { sp: 24, pad: 18 } as const;
export const TILE_VB = { W: Math.round(2 * TL.pad + (TILE_N - 0.5) * TL.sp), H: Math.round(2 * TL.pad + (TILE_N - 1) * TL.sp * 0.866) };
export function tileSites(s: ThState): string {
  const { st } = siteOf(s), t = tileFor(st);
  let out = "";
  for (let j = 0; j < TILE_N; j++) for (let i = 0; i < TILE_N; i++) {
    const x = TL.pad + (i + 0.5 * (j % 2)) * TL.sp, y = TL.pad + j * TL.sp * 0.866, c = t ? t[j * TILE_N + i] : -1;
    const X = x.toFixed(1), Y = y.toFixed(1);
    if (c === SP.Mg) out += `<rect class="mg" x="${(x - 6.5).toFixed(1)}" y="${(y - 6.5).toFixed(1)}" width="13" height="13"/>`;
    else if (c === SP.Nb) out += `<circle class="nb" cx="${X}" cy="${Y}" r="7.5"/>`;
    else if (c === SP.V) out += `<circle class="v" cx="${X}" cy="${Y}" r="5.5"/>`;
    else out += `<circle class="${c === -1 ? "unk" : "li"}" cx="${X}" cy="${Y}" r="4"/>`;
  }
  return out;
}
export const tileSVG = (s: ThState): string =>
  `<svg viewBox="0 0 ${TILE_VB.W} ${TILE_VB.H}" role="img" aria-label="Li-site texture, 400 sites: Li, Li vacancies, Nb antisites and Mg at the sourced states"><g class="th-sites">${tileSites(s)}</g></svg>`;

// ---------------------------------------------------------------- everything the page shows at a state
export function renderAll(s: ThState) {
  const site = siteOf(s), oc = ohCells(s);
  return {
    axW: asciiAxes(s, 10, 10), axN: asciiAxes(s, 5, 5), tileT: asciiTile(s),
    main: mainText(s), vs: vsText(s), oh: ohText(s), siteLabel: padR(site.label, 46), siteAscii: site.st ? site.st.ascii : "no data", siteHtml: site.st ? site.st.html : "no data",
    oc, axis: axisSVG(s), ohSvg: ohSVG(s), tile: tileSVG(s), cOut: `${f1(s.c)} mol%`, gkey: `${s.dop}|${s.host}`,
    basis: mgBasisConvert(1, "MgO/(Li2O+MgO+Nb2O5)", "MgO/(LiNbO3+MgO)"),
  };
}
export const DEFAULT: ThState = { dop: "MgO", host: "cln", c: 2.5 };

// ---------------------------------------------------------------- browser
export function mountThresh(figT: HTMLElement | null, figV: HTMLElement | null): () => void {
  const dis = new Disposer();
  const roots = [figT, figV].filter(Boolean) as HTMLElement[];
  const st = (): ThState => ({ dop: (DOPS as readonly string[]).includes(thresh.dop) ? (thresh.dop as Dop) : "MgO", host: (HOSTS as readonly string[]).includes(thresh.host) ? (thresh.host as Host) : "cln", c: Math.min(9, Math.max(0, Math.round(thresh.c * 10) / 10)) });
  const all = <T extends Element = HTMLElement>(sel: string): T[] => roots.flatMap((r) => [...r.querySelectorAll<T>(sel)]);
  const setHTML = (sel: string, html: string): void => all(sel).forEach((e) => { if (e.innerHTML !== html) e.innerHTML = html; });
  const setText = (sel: string, txt: string): void => all(sel).forEach((e) => { if (e.textContent !== txt) e.textContent = txt; });
  let prev = { site: "", oh: "", g: "" };

  function update(): void {
    const s = st(), R = renderAll(s);
    all<HTMLButtonElement>("button[data-dop]").forEach((b) => b.classList.toggle("on", b.dataset.dop === s.dop));
    all<HTMLButtonElement>("button[data-host]").forEach((b) => b.classList.toggle("on", b.dataset.host === s.host));
    all<HTMLInputElement>("input.th-c").forEach((i) => { if (+i.value !== s.c) i.value = String(s.c); i.setAttribute("aria-valuetext", `${f1(s.c)} mol% ${s.dop}`); rangeFill(i); });
    setText(".th-cout", R.cOut);
    setHTML(".th-ax.w", R.axW); setHTML(".th-ax.n", R.axN);
    setText(".th-main", R.main); setText(".th-vs", R.vs); setText(".th-ohro", R.oh); setText(".th-sitelab", R.siteLabel);
    all("[data-g]").forEach((e) => e.classList.toggle("on", e.dataset.g === R.gkey));
    all("[data-gnone]").forEach((e) => e.classList.toggle("on", !THRESH[s.dop][s.host].rows.length));
    setText(".th-none-t", `no sourced threshold for ${s.dop} in ${HOST_NAME[s.host].short}`);
    all("[data-note]").forEach((e) => e.classList.toggle("on", e.dataset.note === s.dop));
    all("[data-hostrow]").forEach((e) => e.classList.toggle("on", e.dataset.hostrow === s.host));
    // site state (discrete: redraw only when the shown state changes)
    const sst = siteOf(s).st, siteKey = `${s.dop}|${s.host}|${sst ? SITES.indexOf(sst) : -1}`;
    if (siteKey !== prev.site) {
      prev.site = siteKey;
      setHTML(".th-tile", R.tileT);
      all(".th-sites").forEach((g) => { g.innerHTML = tileSites(s); });
      setHTML(".th-siteform", R.siteHtml);
      all(".th-vtile").forEach((e) => e.classList.toggle("nod", !siteOf(s).st));
    }
    all(".th-sitero").forEach((e) => e.classList.toggle("exact", siteOf(s).exact));
    // OH
    const oc = R.oc, ohKey = `${s.dop}|${s.host}|${oc.side}`;
    if (ohKey !== prev.oh) {
      prev.oh = ohKey;
      setHTML(".th-oh .hb", oc.hb); setHTML(".th-oh .ha", oc.ha); setHTML(".th-oh .wb", oc.wb); setHTML(".th-oh .wa", oc.wa); setHTML(".th-oh .ub", oc.ub); setHTML(".th-oh .ua", oc.ua);
      all(".th-oh .cb").forEach((e) => e.classList.toggle("on", oc.side === "below"));
      all(".th-oh .ca").forEach((e) => e.classList.toggle("on", oc.side === "above"));
      all(".th-ohl").forEach((g) => { g.innerHTML = ohLines(s); });
    }
    // VISUAL axis: move the marker pool in place (CSS transitions slide them when effects are on)
    const G = axisGeom(s);
    all<SVGGElement>(".th-mk").forEach((g) => {
      const q = G.slots[+(g.dataset.i ?? 0)];
      g.classList.toggle("off", !q.on); g.classList.toggle("full", q.full);
      g.style.transform = `translate(${q.x.toFixed(1)}px,0px)`;
      g.querySelector(".bar")?.setAttribute("width", q.bar.toFixed(1));
      g.querySelector(".ld")?.setAttribute("y2", String(q.ky + 8));
      const k = g.querySelector(".ky"); if (k) { k.setAttribute("y", String(q.ky)); if (q.on) k.textContent = q.key; }
    });
    all<SVGRectElement>(".th-spread").forEach((r) => { r.classList.toggle("off", !G.spread.on); if (G.spread.on) r.style.transform = `translate(${G.spread.x.toFixed(1)}px,0px) scale(${G.spread.w.toFixed(1)},1)`; });
    all<SVGRectElement>(".th-lt").forEach((r) => { r.classList.toggle("off", !G.lt.on); r.style.transform = `scale(${G.lt.w.toFixed(1)},1)`; });
    all(".th-ltarr").forEach((r) => r.classList.toggle("off", !G.lt.on));
    all(".th-cur").forEach((g) => g.setAttribute("transform", `translate(${G.cx.toFixed(1)} 0)`));
    setText(".th-amsg", G.msg);
    all("[data-mgonly]").forEach((e) => e.classList.toggle("on", s.dop === "MgO"));
  }

  for (const r of roots) {
    dis.on(r, "click", (e: MouseEvent) => {
      const b = (e.target as Element).closest<HTMLButtonElement>("button[data-dop], button[data-host]");
      if (!b) return;
      if (b.dataset.dop) thresh.dop = b.dataset.dop;
      if (b.dataset.host) thresh.host = b.dataset.host;
      update();
    });
    dis.on(r, "input", (e: Event) => {
      const t = e.target as HTMLInputElement;
      if (!t.classList?.contains("th-c")) return;
      thresh.c = Math.round(+t.value * 10) / 10;
      update();
    });
  }
  dis.add(onUi(() => update()));
  update();
  return dis.run;
}
