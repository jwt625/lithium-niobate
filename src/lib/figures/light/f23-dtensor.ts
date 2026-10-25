// d tensor: which coefficient a cut and polarization uses (section 2.3 L2). Eq. 2.11 with the 3m Kleinman-symmetric d (eq. 2.10, tensors.dShg3m):
// the input field of a chosen cut, propagation direction and polarization drives P_NL (nonlinear.nonlinearPolarization);
// P is linear in d, so the response is printed per coefficient (basis sets d33 = 1, d31 = 1, d22 = 1): symbolic by
// default, numeric only for a selected coefficient set, each with its own status. Shared state s6 drives both variants.
import { dShg3m } from "$lib/physics/tensors.ts";
import { nonlinearPolarization, activeVoigtColumns } from "$lib/physics/nonlinear.ts";
import type { Vec3 } from "$lib/physics/linalg.ts";
import type { StatusCode } from "$lib/content/site";
import { Disposer, need, q, rafQueue } from "../dom.ts";
import { bindRange, bindSeg } from "./ctl.ts";
import { FS, MINUS } from "../fmt.ts";
import { sg, fx, dash, badge, r1, hudRows, C775 } from "./f23-common.ts";
import type { Part } from "../visual/lifecycle.ts";

export interface DSet { lab: string; d33: number; d31: number; d22: number; code: StatusCode | null; pop: string | null }
/** Numeric sets that give all three coefficients (manuscript 2.3 L2 table, 1.06 um fundamental). Shoji 1997 (d22 absent,
 *  U) and Kitamoto 1995 (d31 only, U) appear only in the page table. */
export const DSETS: Record<string, DSet> = {
  sym: { lab: "symbolic", d33: Number.NaN, d31: Number.NaN, d22: Number.NaN, code: null, pop: null },
  volk: { lab: "Volk CLN", d33: 34, d31: 6, d22: 3, code: "P-comp", pop: "r:volk2008" },
  vsln: { lab: "Volk near-SLN", d33: 42, d31: 5, d22: 2.5, code: "P-comp", pop: "r:volk2008" },
  zhu: { lab: "Zhu review", d33: -27.0, d31: -4.3, d22: 2.1, code: "S", pop: "r:zhu2021" },
};

export interface S6 { cut: "x" | "y" | "z"; pol: "te" | "tm" | "tetm"; psi: number; set: string }
export const S6_DEFAULT: S6 = { cut: "x", pol: "te", psi: 0, set: "sym" };
export const s6: S6 = { ...S6_DEFAULT };

const AX = ["x", "y", "z"] as const;
/** Wafer normal, in-plane axes (horizontal h, vertical v) per cut; propagation k at psi from h toward v. */
const CUT: Record<S6["cut"], { n: number; h: number; v: number }> = { x: { n: 0, h: 1, v: 2 }, y: { n: 1, h: 0, v: 2 }, z: { n: 2, h: 0, v: 1 } };
const unit = (i: number): Vec3 => { const e: Vec3 = [0, 0, 0]; e[i] = 1; return e; };
const add = (a: Vec3, b: Vec3, s = 1): Vec3 => [a[0] + s * b[0], a[1] + s * b[1], a[2] + s * b[2]];
const scl = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const clean = (a: Vec3): Vec3 => a.map((v) => (Math.abs(v) < 1e-12 ? 0 : v)) as Vec3;

export function modes(cut: S6["cut"], psiDeg: number): { k: Vec3; te: Vec3; tm: Vec3 } {
  const c = CUT[cut], p = (psiDeg * Math.PI) / 180;
  const h = unit(c.h), v = unit(c.v);
  return { k: clean(add(scl(h, Math.cos(p)), v, Math.sin(p))), te: clean(add(scl(h, -Math.sin(p)), v, Math.cos(p))), tm: unit(c.n) };
}

/** Symbolic matrix of eq. 2.10 (rows x, y, z; Voigt columns xx, yy, zz, yz, xz, xy). */
export const DSYM = [["0", "0", "0", "0", "d31", `${MINUS}d22`], [`${MINUS}d22`, "d22", "0", "d31", "0", "0"], ["d31", "d31", "d33", "0", "0", "0"]];
const BASIS = { d33: dShg3m({ d33: 1, d31: 0, d22: 0 }), d31: dShg3m({ d33: 0, d31: 1, d22: 0 }), d22: dShg3m({ d33: 0, d31: 0, d22: 1 }) };
const KEYS = ["d33", "d31", "d22"] as const;

export interface Resp {
  E1: Vec3; E2: Vec3 | null; K: number; k: Vec3; te: Vec3; tm: Vec3;
  /** coefficient vectors: P / (K eps0 E1 E2) per unit coefficient */
  co: Record<(typeof KEYS)[number], Vec3>;
  cols: number[]; cells: boolean[][]; active: string[];
  num: Vec3 | null; set: DSet;
}
export function resp6(s: S6): Resp {
  const m = modes(s.cut, s.psi);
  const E1 = s.pol === "tm" ? m.tm : m.te, E2 = s.pol === "tetm" ? m.tm : null;
  const K = E2 ? 4 : 2;
  const co = {} as Resp["co"];
  for (const k of KEYS) co[k] = clean(scl(nonlinearPolarization(BASIS[k], E1, E2 ?? undefined), 1 / K));
  const cols = activeVoigtColumns(E1, E2 ?? undefined);
  const cells = DSYM.map((row) => row.map((c, l) => c !== "0" && cols.includes(l)));
  const active = KEYS.filter((k) => co[k].some((v) => v !== 0));
  const set = DSETS[s.set];
  const num = Number.isFinite(set.d33) ? clean(nonlinearPolarization(dShg3m({ d33: set.d33, d31: set.d31, d22: set.d22 }), E1, E2 ?? undefined).map((v) => v / K) as Vec3) : null;
  return { E1, E2, K, k: m.k, te: m.te, tm: m.tm, co, cols, cells, active, num, set };
}

// ---------- TECH ----------
export function matrix6(s: S6, r: Resp): string {
  const set = r.set, numeric = Number.isFinite(set.d33);
  const val = (c: string): string => {
    if (!numeric || c === "0") return c;
    const neg = c.startsWith(MINUS), key = (neg ? c.slice(1) : c) as "d33" | "d31" | "d22";
    return fx((neg ? -1 : 1) * set[key], 2, 6).trim();
  };
  const head = `<thead><tr><th></th>${["xx", "yy", "zz", "yz", "xz", "xy"].map((h, l) => `<th class="${r.cols.includes(l) ? "on" : ""}">${l + 1} ${h}</th>`).join("")}</tr></thead>`;
  const body = DSYM.map((row, i) => `<tr><th>${AX[i]}</th>${row.map((c, l) => `<td class="${r.cells[i][l] ? "on" : c !== "0" ? "nz" : ""}">${val(c)}</td>`).join("")}</tr>`).join("");
  return head + `<tbody>${body}</tbody>`;
}
const vec = (v: Vec3): string => `(${v.map((x) => sg(x, 2)).join(", ")})`;
/** Response table: rows P_x, P_y, P_z, projections on the TE and TM output fields; columns per coefficient + numeric. */
export function table6(s: S6, r: Resp): string {
  const numeric = r.num !== null;
  const pre = r.E2 ? "P/(4ε<sub>0</sub>E<sub>1</sub>E<sub>2</sub>)" : "P/(2ε<sub>0</sub>E²)";
  const line = (lab: string, f: (v: Vec3) => number): string => `<tr><td>${lab}</td>${KEYS.map((k) => `<td class="num">${sg(f(r.co[k]), 3)}</td>`).join("")}<td class="num">${numeric ? fx(f(r.num as Vec3), 2, 7) : dash(7)}</td></tr>`;
  return `<thead><tr><th>${pre}</th><th class="r">× d<sub>33</sub></th><th class="r">× d<sub>31</sub></th><th class="r">× d<sub>22</sub></th><th class="r">pm/V</th></tr></thead><tbody>`
    + line("x", (v) => v[0]) + line("y", (v) => v[1]) + line("z", (v) => v[2])
    + line("onto TE out", (v) => dot(v, r.te)) + line("onto TM out", (v) => dot(v, r.tm)) + "</tbody>";
}
export function info6(s: S6, r: Resp): string {
  const e = r.E2 ? `E<sub>1</sub> ${vec(r.E1)}, E<sub>2</sub> ${vec(r.E2)}` : `E ${vec(r.E1)}`;
  return `<span>k ${vec(r.k)}</span><span>${e}</span><span>active: ${(r.active.join(" ") || "none").padEnd(11, FS)}</span>`;
}
/** ASCII view of the wafer plane: in-plane axes, propagation k, E (TE in plane, TM out of plane). */
export function ascii6(s: S6, r: Resp): string {
  const W = 25, H = 9, cx = 12, cy = 4;
  const g: string[][] = Array.from({ length: H }, () => Array.from({ length: W }, () => " "));
  const c = CUT[s.cut];
  for (let x = 0; x < W; x++) g[cy][x] = "·";
  for (let y = 0; y < H; y++) g[y][cx] = "·";
  const put = (x: number, y: number, ch: string): void => { if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = ch; };
  const line = (a: number, len: number, both: boolean, endCh: string): void => {
    const ch = Math.abs(Math.sin(a)) < 0.38 ? "-" : Math.abs(Math.cos(a)) < 0.38 ? "|" : Math.sin(a) * Math.cos(a) > 0 ? "/" : "\\";
    for (let t = 1; t <= len; t++) {
      for (const sgn of both ? [1, -1] : [1]) put(Math.round(cx + sgn * t * Math.cos(a) * 1.0), Math.round(cy - sgn * t * Math.sin(a) * 0.4), t === len ? endCh : ch);
    }
  };
  const ka = (s.psi * Math.PI) / 180;
  line(ka, 11, false, "k");
  if (s.pol !== "tm") line(ka + Math.PI / 2, 9, true, "E");
  put(cx, cy, s.pol === "te" ? "+" : "o");
  put(W - 1, cy, AX[c.h]); put(cx, 0, AX[c.v]);
  const rows = g.map((row) => row.join(""));
  rows[H - 1] = `${s.cut}-cut, normal ${AX[c.n]}`.padEnd(W, " ").slice(0, W);
  rows[0] = (rows[0].slice(0, cx) + AX[c.v] + rows[0].slice(cx + 1));
  const leg = [`o: E along ${AX[c.n]} (TM)`, `+: origin`, `k at ${String(Math.round(s.psi)).padStart(3)}° from ${AX[c.h]}`];
  return rows.map((row, i) => row + "   " + (leg[i - 2] ?? "")).join("\n");
}

// ---------- VISUAL ----------
const P2 = (v: Vec3): [number, number] => [-0.62 * v[0] + 0.94 * v[1], 0.38 * v[0] + 0.24 * v[1] - 1.0 * v[2]];
const VIEW: Vec3 = [0.62, -0.4, 0.68];
export function visualStage6(s: S6, r: Resp): string {
  const cx = 300, cy = 335, S = 175;
  const pt = (v: Vec3): string => { const [a, b] = P2(v); return `${r1(cx + S * a)} ${r1(cy + S * b)}`; };
  const c = CUT[s.cut];
  const ext: Vec3 = [0.95, 0.95, 0.95]; ext[c.n] = 0.13;
  // slab faces (painter order)
  const faces: { pts: Vec3[]; d: number; top: boolean }[] = [];
  for (let ax = 0; ax < 3; ax++) for (const sgn of [-1, 1]) {
    const u = (ax + 1) % 3, w = (ax + 2) % 3;
    const corner = (a: number, b: number): Vec3 => { const p: Vec3 = [0, 0, 0]; p[ax] = sgn * ext[ax]; p[u] = a * ext[u]; p[w] = b * ext[w]; return p; };
    const pts = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
    const ctr: Vec3 = [0, 0, 0]; ctr[ax] = sgn * ext[ax];
    faces.push({ pts, d: dot(ctr, VIEW), top: ax === c.n && sgn === 1 });
  }
  faces.sort((a, b) => a.d - b.d);
  let o = `<svg viewBox="0 0 1000 560" role="img" aria-label="Crystal slab with its c axis, input optical field and the radiated second-harmonic polarization; d matrix with active coefficients">`;
  o += `<defs>${[["t", "var(--v-text)"], ["m", "var(--v-text3)"], ["k", "var(--v-text2)"], ["ir", "var(--v-ir1550)"], ["sh", C775]].map(([k, c]) => `<marker id="v06-ah-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="${k === "sh" || k === "ir" ? 4 : 7}" markerHeight="${k === "sh" || k === "ir" ? 4 : 7}" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`).join("")}`
    + "</defs>";
  for (const f of faces) o += `<path d="M${f.pts.map(pt).join("L")}Z" fill="var(--v-ln)" fill-opacity="${f.top ? 0.2 : 0.08}" stroke="var(--v-line2)" stroke-width="1.2"/>`;
  // crystal axes
  const axis = (i: number, len: number, lab: string, strong: boolean): string => {
    const e = unit(i), [a, b] = P2(scl(e, len));
    return `<path d="M${pt([0, 0, 0])}L${r1(cx + S * a)} ${r1(cy + S * b)}" stroke="${strong ? "var(--v-text)" : "var(--v-text3)"}" stroke-width="${strong ? 2 : 1.2}" marker-end="url(#v06-ah-${strong ? "t" : "m"})" fill="none"/><text class="${strong ? "f23-t1" : "f23-t2"}" x="${r1(cx + S * a * 1.1 + (i === 1 ? 6 : 0))}" y="${r1(cy + S * b * 1.1 + (i === 2 ? -4 : 14))}" text-anchor="middle">${lab}</text>`;
  };
  o += axis(0, 1.45, "x", false) + axis(1, 1.35, "y", false) + axis(2, 1.5, "c (z)", true);
  // propagation
  const [ka, kb] = P2(scl(r.k, 1.25));
  o += `<path d="M${pt([0, 0, 0])}L${r1(cx + S * ka)} ${r1(cy + S * kb)}" stroke="var(--v-text2)" stroke-width="1.5" stroke-dasharray="2 4" marker-end="url(#v06-ah-k)" fill="none"/><text class="f23-t2" x="${r1(cx + S * ka * 1.1)}" y="${r1(cy + S * kb * 1.1 + 5)}" text-anchor="middle">k</text>`;
  // input fields: double-headed (oscillating), 1550 nm declared false color, dashed
  const efield = (E: Vec3, lab: string): string => {
    const a = scl(E, 0.72), b = scl(E, -0.72);
    const [la, lb] = P2(scl(E, 0.86));
    return `<path class="ir-el" d="M${pt(b)}L${pt(a)}" stroke="var(--v-ir1550)" stroke-width="3.5" stroke-dasharray="9 6" marker-start="url(#v06-ah-ir)" marker-end="url(#v06-ah-ir)" fill="none"/><text class="f23-t2 ir-el" x="${r1(cx + S * la + 10)}" y="${r1(cy + S * lb - 6)}" fill="var(--v-ir1550)">${lab}</text>`;
  };
  o += efield(r.E1, r.E2 ? "E₁ 1550 nm" : "E 1550 nm");
  if (r.E2) o += efield(r.E2, "E₂");
  // radiated SH polarization: per-coefficient vectors (symbolic) or the resultant (numeric set), 775 nm
  const base = scl(r.k, 0.62); // radiated SH drawn downstream along k
  const shArrow = (v: Vec3, lab: string, w: number, op: number): string => {
    const n = Math.hypot(...v);
    if (n < 1e-9) return "";
    const d = scl(v, 0.8 / Math.max(1, n)), tip = add(base, d), [la, lb] = P2(add(base, scl(d, 1.18)));
    return `<path d="M${pt(base)}L${pt(tip)}" stroke="${C775}" stroke-opacity="0.28" stroke-width="${w + 8}" stroke-linecap="square" fill="none"/><path d="M${pt(base)}L${pt(tip)}" stroke="${C775}" stroke-opacity="${op}" stroke-width="${w}" marker-end="url(#v06-ah-sh)" fill="none"/><text class="f23-t1" x="${r1(cx + S * la + 14)}" y="${r1(cy + S * lb + 5)}" text-anchor="start">${lab}</text>`;
  };
  if (r.num) {
    const n = Math.hypot(...r.num) || 1;
    o += shArrow(scl(r.num, 1 / n), `P(2ω) ${r.set.lab}`, 5, 1);
  } else for (const k of KEYS) o += shArrow(r.co[k], k, 4, 0.95);
  // glyph matrix
  const gx = 620, gy = 120, cw = 58, ch = 58;
  ["xx", "yy", "zz", "yz", "xz", "xy"].forEach((h, l) => { o += `<text class="f23-t3 f23-mt" x="${gx + l * cw + cw / 2}" y="${gy - 12}" text-anchor="middle">${h}</text>`; });
  DSYM.forEach((row, i) => {
    o += `<text class="f23-t2 f23-mt" x="${gx - 14}" y="${gy + i * ch + ch / 2 + 5}" text-anchor="end">${AX[i]}</text>`;
    row.forEach((cell, l) => {
      const x = gx + l * cw, y = gy + i * ch, on = r.cells[i][l];
      if (cell === "0") { o += `<rect x="${x + cw / 2 - 2}" y="${y + ch / 2 - 2}" width="4" height="4" fill="var(--v-text3)"/>`; return; }
      o += `<rect x="${x + 4}" y="${y + 4}" width="${cw - 8}" height="${ch - 8}" fill="${on ? C775 : "none"}" fill-opacity="${on ? 0.9 : 0}" stroke="${on ? C775 : "var(--v-line2)"}" stroke-width="2"/>${on ? `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="none" stroke="${C775}" stroke-opacity="0.35" stroke-width="3"/>` : ""}`;
      o += `<text class="${on ? "f23-t2 f23-mt f23-on" : "f23-t2 f23-mt"}" x="${x + cw / 2}" y="${y + ch / 2 + 5}" text-anchor="middle">${cell}</text>`;
    });
  });
  o += `<text class="f23-t3 f23-mt" x="${gx}" y="${gy + 3 * ch + 26}">d<tspan baseline-shift="sub" font-size="0.75em">il</tspan>, Kleinman: d<tspan baseline-shift="sub" font-size="0.75em">15</tspan> = d<tspan baseline-shift="sub" font-size="0.75em">24</tspan> = d<tspan baseline-shift="sub" font-size="0.75em">31</tspan>; filled: driven by this input</text>`;
  o += "</svg>";
  return o;
}
const symStr = (co: Resp["co"], f: (v: Vec3) => number): string => {
  const parts = KEYS.map((k) => [k, f(co[k])] as const).filter(([, v]) => Math.abs(v) > 5e-4);
  if (!parts.length) return "0";
  return parts.map(([k, v], i) => `${i ? (v < 0 ? ` ${MINUS} ` : " + ") : v < 0 ? MINUS : ""}${Math.abs(Math.abs(v) - 1) < 5e-4 ? "" : Math.abs(v).toFixed(3) + " "}${k}`).join("");
};
export function hud6(s: S6, r: Resp): string {
  const n = r.num;
  const te = n ? `${fx(dot(n, r.te), 2, 7)} pm/V` : symStr(r.co, (v) => dot(v, r.te));
  const tm = n ? `${fx(dot(n, r.tm), 2, 7)} pm/V` : symStr(r.co, (v) => dot(v, r.tm));
  const pre = r.E2 ? "P/(4ε<sub>0</sub>E<sub>1</sub>E<sub>2</sub>)" : "P/(2ε<sub>0</sub>E²)";
  const pv = n ? `${vec(n)} pm/V` : `${KEYS.map((k) => (r.co[k].some((v) => v !== 0) ? `${k} ${vec(r.co[k])}` : "")).filter(Boolean).join("; ") || "0"}`;
  return hudRows([["Propagation k", vec(r.k)], [r.E2 ? "Fields E<sub>1</sub>, E<sub>2</sub>" : "Field E", r.E2 ? `${vec(r.E1)}, ${vec(r.E2)}` : vec(r.E1)], [pre, pv], ["SH field along TE", te], ["SH field along TM", tm], ["Coefficients driven", r.active.join(", ") || "none"]]);
}
export const setBadge6 = (s: S6): string => { const d = DSETS[s.set]; return d.code ? badge(d.code, d.pop ?? undefined) : `<span class="f23-nob">symbolic</span>`; };

// ---------- server defaults ----------
export function init6(): { mx: string; tab: string; info: string; ascii: string; stage: string; hud: string; sb: string } {
  const r = resp6(S6_DEFAULT);
  return { mx: matrix6(S6_DEFAULT, r), tab: table6(S6_DEFAULT, r), info: info6(S6_DEFAULT, r), ascii: ascii6(S6_DEFAULT, r), stage: visualStage6(S6_DEFAULT, r), hud: hud6(S6_DEFAULT, r), sb: setBadge6(S6_DEFAULT) };
}

// ---------- mount ----------
export function mount6(root: HTMLElement, onVisual: (init: () => Part | null) => () => void): () => void {
  const dis = new Disposer();
  const syncs: (() => void)[] = [];
  let vis = false;
  const draw = (): void => {
    const r = resp6(s6);
    need(root, "#f06-mx").innerHTML = matrix6(s6, r);
    need(root, "#f06-tab").innerHTML = table6(s6, r);
    need(root, "#f06-info").innerHTML = info6(s6, r);
    need(root, "#f06-ascii").textContent = ascii6(s6, r);
    need(root, "#f06-sb").innerHTML = setBadge6(s6);
    if (vis) { need(root, "#v06-stage").innerHTML = visualStage6(s6, r); need(root, "#v06-hud").innerHTML = hud6(s6, r); need(root, "#v06-sb").innerHTML = setBadge6(s6); }
  };
  const queue = rafQueue(draw);
  const changed = (): void => { syncs.forEach((f) => f()); queue(); };
  const bind = (p: string): void => {
    syncs.push(bindSeg(dis, q(root, `#${p}-cut`), () => s6.cut, (v) => { s6.cut = v as S6["cut"]; }, changed));
    syncs.push(bindSeg(dis, q(root, `#${p}-pol`), () => s6.pol, (v) => { s6.pol = v as S6["pol"]; }, changed));
    syncs.push(bindSeg(dis, q(root, `#${p}-set`), () => s6.set, (v) => { s6.set = v; }, changed));
    syncs.push(bindRange(dis, q(root, `#${p}-psi`), q(root, `#${p}-psi-o`), { read: (x) => x, write: (v) => v, fmt: (v) => `${String(Math.round(v)).padStart(3, FS)}°`, aria: (v) => `${Math.round(v)} degrees`, get: () => s6.psi, set: (v) => { s6.psi = v; } }, changed));
  };
  bind("f06");
  syncs.forEach((f) => f());
  const offV = onVisual(() => { bind("v06"); vis = true; syncs.forEach((f) => f()); draw(); return { repaint: () => { syncs.forEach((f) => f()); draw(); } }; });
  return () => { offV(); dis.run(); };
}
