// FIG-01-06 Neumann machine (content/chapters/01-crystal/figures.md; manuscript Sec. 7).
// Exact group action from src/lib/physics/symmetry.ts: the selected generators of 3m (IEEE 176 frame, x normal to the yz
// mirror) are closed into a group; an applied static field E keeps only the stabilizer of E (Curie's principle); the property
// tensor's allowed form under that group comes from `neumann()` (Reynolds average of the full tensor, then Voigt contraction).
// This module only classifies and draws: cell classes (zero / independent / tied / transpose / field-allowed), the relation
// list, the induced impermeability Delta B_I = r_Ij E_j from the crystal's r form, the optical class allowed by the group, and
// the stereogram (mirror traces, threefold axis, orbit of a general pole drawn as tracery lobes, field arrow).
// Pure string renderers are used by the server load (prerendered default) and by the client mount.
import { groupOps3m, closeGroup, neumann as allowedForm, stabilizer, groupName, KINDS, type PropertyKind, type Relation, type NeumannResult } from "$lib/physics/symmetry.ts";
import type { Mat3, Vec3 } from "$lib/physics/linalg.ts";
import { neumann as store } from "$lib/stores/crystal";
import { Disposer, onUi } from "../dom.ts";
import { FS, MINUS } from "../fmt.ts";

export type OpKey = "C3" | "myz" | "mp60" | "mm60";
export type FieldDir = "0" | "x" | "y" | "z";
export interface NmState { kind: PropertyKind; ops: Record<OpKey, boolean>; field: FieldDir }

const OPS = groupOps3m(); // E, C3, C3^2, m_yz, m_p60, m_m60
const GEN: Record<OpKey, number> = { C3: 1, myz: 3, mp60: 4, mm60: 5 };
const EVEC: Record<FieldDir, Vec3> = { "0": [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
const SYMMETRIC: ReadonlySet<PropertyKind> = new Set(["eps", "c", "s"]);
export const KIND_LABEL: Record<PropertyKind, string> = { pyro: "pyroelectric p", eps: "permittivity ε", d: "piezoelectric d", e: "piezoelectric e", r: "electro-optic r", c: "stiffness c", s: "compliance s", p: "photoelastic p" };
const ELEM_LABEL = ["E", "C3", "C3²", "m yz", "m +60°", "m −60°"];

const matEq = (A: Mat3, B: Mat3): boolean => A.every((r, i) => r.every((v, j) => Math.abs(v - B[i][j]) < 1e-9));
const disp = (n: string): string => n.replace(/^eps/, "ε");

// ---------- coefficient text (rational, or rational times sqrt 3 for the single mirrors at +/-60 deg) ----------
const SQ3 = Math.sqrt(3);
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
function ratio(x: number): [number, number] | null {
  for (let q = 1; q <= 12; q++) { const p = Math.round(x * q); if (Math.abs(p / q - x) < 1e-9) return [p, q]; }
  return null;
}
function coefParts(c: number): { neg: boolean; num: number; den: number; rt: boolean } | null {
  let f = ratio(c), rt = false;
  if (!f) { f = ratio(c / SQ3); rt = true; }
  return f ? { neg: f[0] < 0, num: Math.abs(f[0]), den: f[1], rt } : null;
}
/** Right-hand side of a relation in the independents; `sp` puts spaces around + and minus. */
export function rhsText(terms: Relation["terms"], sp: boolean): string {
  if (!terms.length) return "0";
  const pl = sp ? " + " : "+", mi = sp ? ` ${MINUS} ` : MINUS;
  const parts = terms.map((t) => coefParts(t.coef));
  if (parts.some((p) => !p)) return terms.map((t, i) => `${i ? (t.coef < 0 ? mi : pl) : t.coef < 0 ? MINUS : ""}${Math.abs(t.coef).toPrecision(4)}${disp(t.name)}`).join("");
  const P = parts as NonNullable<ReturnType<typeof coefParts>>[];
  if (terms.length === 1) {
    const c = P[0];
    return `${c.neg ? MINUS : ""}${c.num === 1 ? "" : c.num}${c.rt ? "√3" : ""}${disp(terms[0].name)}${c.den > 1 ? `/${c.den}` : ""}`;
  }
  const L = P.reduce((m, c) => (m * c.den) / gcd(m, c.den), 1);
  let nums = P.map((c) => (c.num * L) / c.den);
  const g = nums.reduce((m, v) => gcd(m, v), 0);
  nums = nums.map((v) => v / g);
  const body = terms.map((t, i) => `${i ? (P[i].neg ? mi : pl) : P[i].neg ? MINUS : ""}${nums[i] === 1 ? "" : nums[i]}${P[i].rt ? "√3" : ""}${disp(t.name)}`).join("");
  return g > 1 || L > 1 ? `${g > 1 ? g : ""}(${body})${L > 1 ? `/${L}` : ""}` : body;
}
/** Short coefficient glyph of a single-term tie (VISUAL square label). */
function coefGlyph(r: Relation): string {
  if (r.cls === "equal") return "=";
  if (r.cls === "minus") return MINUS;
  if (r.cls === "combination") return "Σ";
  const c = coefParts(r.terms[0].coef);
  if (!c) return "×";
  return `${c.neg ? MINUS : ""}${c.num === 1 && !c.rt ? "" : c.num === 1 ? "" : c.num}${c.rt ? "√3" : ""}${c.den > 1 ? `/${c.den}` : ""}`;
}
/** Voigt contraction factor of a component (tensors.ts: d_iJ = f_J d_ijk, s_IJ = f_I f_J s_ijkl, f = 1, 1, 1, 2, 2, 2). */
const vf = (kind: PropertyKind, row: number, col: number): number => (kind === "d" ? (col >= 3 ? 2 : 1) : kind === "s" ? (row >= 3 ? 2 : 1) * (col >= 3 ? 2 : 1) : 1);

// ---------- model ----------
export type CellCls = "zero" | "independent" | "equal" | "minus" | "factor" | "combination" | "transpose";
export interface NmCell { name: string; row: number; col: number; cls: CellCls; rhs: string; rhsSp: string; glyph: string; partner: [number, number] | null; isNew: boolean; contraction: boolean }
export interface NmElem { label: string; sel: boolean; gen: boolean; inG: boolean; inEff: boolean }
export interface NmModel {
  kind: PropertyKind; rows: number; cols: number; cells: NmCell[][];
  group: string; groupOrder: number; indep: number; generic: number; zeros: number; tied: number; newCount: number;
  elems: NmElem[]; field: FieldDir; relLines: string[]; dB: string[]; optic: string;
}

function selectedGens(s: NmState): Mat3[] { return (Object.keys(GEN) as OpKey[]).filter((k) => s.ops[k]).map((k) => OPS[GEN[k]].R); }

function opticClass(eps: NeumannResult): string {
  if (eps.independentCount === 1) return "isotropic";
  const R = eps.relations;
  const uni = eps.independentCount === 2 && R[1][1].cls === "equal" && [R[0][1], R[0][2], R[1][2]].every((r) => r.cls === "zero");
  return uni ? "uniaxial" : "biaxial";
}

const pack = (items: string[], width: number, sep: string): string[] => {
  const out: string[] = [];
  let cur = "";
  for (const it of items) {
    if (!cur) cur = it;
    else if (cur.length + sep.length + it.length <= width) cur += `${sep}${it}`;
    else { out.push(cur); cur = it; }
  }
  if (cur) out.push(cur);
  return out;
};

export function nmModel(s: NmState): NmModel {
  const k = KINDS[s.kind];
  const gens = selectedGens(s);
  const G = closeGroup(gens);
  const E = EVEC[s.field];
  const stab = s.field === "0" ? { ops: G, name: groupName(G) } : stabilizer(gens, E);
  const res = allowedForm(s.kind, stab.ops);
  const base = s.field === "0" ? res : allowedForm(s.kind, G);
  const sym = SYMMETRIC.has(s.kind);
  const where = new Map<string, [number, number]>();
  res.relations.forEach((row, i) => row.forEach((r, j) => where.set(r.name, [i, j])));
  let zeros = 0, tied = 0, newCount = 0;
  const cells: NmCell[][] = res.relations.map((row, i) => row.map((r, j) => {
    if (sym && i > j) {
      const t = res.relations[j][i];
      return { name: r.name, row: i, col: j, cls: "transpose", rhs: disp(t.name), rhsSp: disp(t.name), glyph: "", partner: [j, i], isNew: false, contraction: false };
    }
    const isNew = s.field !== "0" && r.cls !== "zero" && base.relations[i][j].cls === "zero";
    if (isNew) newCount++;
    if (r.cls === "zero") zeros++;
    else if (r.cls !== "independent") tied++;
    const tiedCls = r.cls !== "zero" && r.cls !== "independent";
    return {
      name: r.name, row: i, col: j, cls: r.cls,
      rhs: r.cls === "independent" ? disp(r.name) : rhsText(r.terms, false), rhsSp: rhsText(r.terms, true),
      glyph: tiedCls ? coefGlyph(r) : "",
      partner: tiedCls ? where.get(r.terms[0].name) ?? null : null, isNew,
      contraction: tiedCls && r.terms.some((t) => { const p = where.get(t.name); return !!p && vf(s.kind, p[0], p[1]) !== vf(s.kind, i, j); }),
    };
  }));
  const ties = cells.flat().filter((c) => c.cls !== "zero" && c.cls !== "independent" && c.cls !== "transpose").map((c) => `${disp(c.name)} = ${c.rhsSp}`);
  const zn = cells.flat().filter((c) => c.cls === "zero").map((c) => disp(c.name));
  let relLines = pack(ties, 40, "   ");
  if (!ties.length) relLines.push(res.independentCount === k.generic ? `no ties: all ${k.generic} independent` : "no ties");
  if (zn.length) relLines.push(...pack([`zero: ${zn[0]}`, ...zn.slice(1)], 40, " "));
  if (relLines.length > 6) { const more = relLines.length - 5; relLines = [...relLines.slice(0, 5), `+${more} more lines: see the matrix`]; }
  while (relLines.length < 6) relLines.push("");
  // induced impermeability from the crystal's r form (group of the toggles, no field)
  const rB = allowedForm("r", G);
  const j = s.field === "0" ? -1 : "xyz".indexOf(s.field);
  const dB = [0, 1, 2, 3, 4, 5].map((I) => {
    if (j < 0) return `ΔB${I + 1} = 0`;
    const r = rB.relations[I][j];
    const t = r.cls === "zero" ? "0" : r.cls === "independent" ? r.name : rhsText(r.terms, false);
    return `ΔB${I + 1} = ${t === "0" ? "0" : `${t}·E${s.field}`}`;
  });
  const effElems = OPS.map((o) => stab.ops.some((g) => matEq(g, o.R)));
  const elems: NmElem[] = OPS.map((o, i) => {
    const key = (Object.keys(GEN) as OpKey[]).find((kk) => GEN[kk] === i);
    return { label: ELEM_LABEL[i], gen: !!key, sel: key ? s.ops[key] : i === 0, inG: G.some((g) => matEq(g, o.R)), inEff: effElems[i] };
  });
  return {
    kind: s.kind, rows: k.rows, cols: k.cols, cells, group: stab.name, groupOrder: stab.ops.length,
    indep: res.independentCount, generic: k.generic, zeros, tied, newCount, elems, field: s.field, relLines, dB,
    optic: opticClass(allowedForm("eps", stab.ops)),
  };
}

// ---------- shared readout strings ----------
const padL = (x: string | number, n: number): string => String(x).padStart(n, FS);
const padR = (x: string, n: number): string => x + FS.repeat(Math.max(0, n - x.length));
/** `group 3m  independent  4 / 18` (fixed 30 ch). */
export const hdrText = (m: NmModel): string => `group ${padR(m.group, 2)}  independent ${padL(m.indep, 2)} / ${padL(m.generic, 2)}`;
export const kindText = (m: NmModel): string => padR(`${KIND_LABEL[m.kind]}, ${m.rows} × ${m.cols}`, 30);
export const subText = (m: NmModel): string => padR(`zero ${padL(m.zeros, 2)}  tied ${padL(m.tied, 2)}${m.field === "0" ? "" : `  new under E ${padL(m.newCount, 2)}`}`, 40);
export const opticText = (m: NmModel): string => padR(`E ${m.field === "0" ? "= 0" : `along ${m.field}`}: group ${m.group}, ${m.optic}`, 30);
export function hoverText(m: NmModel, h: [number, number] | null): string {
  if (!h) return padR("point at a component", 48);
  const c = m.cells[h[0]]?.[h[1]];
  if (!c) return padR("", 48);
  let t: string;
  if (c.cls === "transpose") t = `${disp(c.name)} = ${c.rhs} (index symmetry)`;
  else if (c.cls === "zero") t = `${disp(c.name)} = 0 by symmetry`;
  else if (c.cls === "independent") t = `${disp(c.name)} independent${c.isNew ? ", allowed only under E" : ""}`;
  else t = `${disp(c.name)} = ${c.rhsSp}${c.contraction ? " (factor from contraction)" : ""}${c.isNew ? ", under E" : ""}`;
  return padR(t, 48);
}
/** Big VISUAL readouts: independent count, generic count, group name (fixed 2 ch each). */
export const bigText = (m: NmModel): { ind: string; gen: string; grp: string } => ({ ind: padL(m.indep, 2), gen: padL(m.generic, 2), grp: padR(m.group, 2) });
export const elemsHtml = (m: NmModel): string => m.elems.map((e, i) => {
  const st = e.inEff ? (i === 0 || (e.gen && e.sel) ? "on" : "imp") : e.inG ? "cut" : "off";
  const tip = st === "on" ? "in the group" : st === "imp" ? "in the group by closure" : st === "cut" ? "removed by the applied field" : "not in the group";
  return `<span class="nm-e ${st}" title="${e.label}: ${tip}">${e.label}</span>`;
}).join("");

// ---------- TECH matrix: fixed 7 x 7 character grid ----------
const IDX = ["1", "2", "3", "4", "5", "6"];
export function techGrid(m: NmModel, hover: [number, number] | null = null): string {
  const hp = hover ? m.cells[hover[0]]?.[hover[1]]?.partner : null;
  let out = `<span class="h"></span>`;
  for (let j = 0; j < 6; j++) out += `<span class="h">${j < m.cols ? (m.kind === "pyro" ? "xyz"[j] : IDX[j]) : ""}</span>`;
  for (let i = 0; i < 6; i++) {
    out += `<span class="h">${i < m.rows && m.kind !== "pyro" ? IDX[i] : i === 0 && m.kind === "pyro" ? "p" : ""}</span>`;
    for (let j = 0; j < 6; j++) {
      const c = m.cells[i]?.[j];
      if (!c) { out += `<span class="x"></span>`; continue; }
      const hv = (hover && hover[0] === i && hover[1] === j) || (hp && hp[0] === i && hp[1] === j);
      const cls = c.cls === "zero" ? "z" : c.cls === "independent" ? "i" : c.cls === "transpose" ? "tr" : "t";
      const txt = c.cls === "zero" ? "0" : c.cls === "transpose" ? c.rhs : c.rhs.length <= 11 ? c.rhs : "comb.";
      out += `<span class="c ${cls}${c.isNew ? " n" : ""}${hv ? " hv" : ""}" data-ij="${i}${j}">${txt}</span>`;
    }
  }
  return out;
}

// ---------- VISUAL glyph grid (SVG, fixed viewBox) ----------
const GP = 56, GS = 38, G0 = 40;
export function visGrid(m: NmModel, hover: [number, number] | null = null): string {
  const ox = G0 + ((6 - m.cols) * GP) / 2, oy = G0 + ((6 - m.rows) * GP) / 2;
  const cx = (j: number): number => ox + j * GP + GP / 2, cy = (i: number): number => oy + i * GP + GP / 2;
  const f = (v: number): string => v.toFixed(1);
  let lab = "", con = "", sq = "";
  for (let j = 0; j < m.cols; j++) lab += `<text class="ix" x="${f(cx(j))}" y="${f(oy - 10)}">${m.kind === "pyro" ? "xyz"[j] : IDX[j]}</text>`;
  if (m.kind !== "pyro") for (let i = 0; i < m.rows; i++) lab += `<text class="ix" x="${f(ox - 14)}" y="${f(cy(i) + 5)}">${IDX[i]}</text>`;
  const hp = hover ? m.cells[hover[0]]?.[hover[1]]?.partner : null;
  m.cells.forEach((row) => row.forEach((c) => {
    const x = cx(c.col), y = cy(c.row), h = GS / 2;
    const hv = (hover && hover[0] === c.row && hover[1] === c.col) || (hp && hp[0] === c.row && hp[1] === c.col);
    if (c.partner && c.cls !== "transpose") {
      const px = cx(c.partner[1]), py = cy(c.partner[0]), mx = (x + px) / 2, my = (y + py) / 2, dx = px - x, dy = py - y, L = Math.hypot(dx, dy) || 1;
      const bow = Math.min(28, 0.22 * L);
      con += `<path class="cn${hv ? " hv" : ""}" d="M${f(x)} ${f(y)}Q${f(mx - (dy / L) * bow)} ${f(my + (dx / L) * bow)} ${f(px)} ${f(py)}"/>`;
    }
    const base = `x="${f(x - h)}" y="${f(y - h)}" width="${GS}" height="${GS}"`;
    const nw = c.isNew ? " n" : "", hc = hv ? " hv" : "";
    if (c.cls === "zero") sq += `<rect class="z${hc}" ${base}/><circle class="zd" cx="${f(x)}" cy="${f(y)}" r="2"/>`;
    else if (c.cls === "transpose") sq += `<rect class="tr${hc}" x="${f(x - h + 8)}" y="${f(y - h + 8)}" width="${GS - 16}" height="${GS - 16}"/>`;
    else if (c.cls === "independent") sq += `<rect class="i${nw}${hc}" ${base}/><text class="il${nw}" x="${f(x)}" y="${f(y + 4)}">${disp(c.name)}</text>`;
    else sq += `<rect class="t${nw}${hc}" ${base}/><text class="tl${nw}" x="${f(x)}" y="${f(y + 5)}">${c.glyph}</text>`;
    sq += `<rect class="hit" data-ij="${c.row}${c.col}" x="${f(x - GP / 2)}" y="${f(y - GP / 2)}" width="${GP}" height="${GP}"/>`;
  }));
  return `${lab}<g class="cns">${con}</g>${sq}`;
}

// ---------- VISUAL stereogram (projection along c; mirror traces at 90, 150, 30 deg for normals 0, +60, -60 deg) ----------
const SC = 160, SR = 128;
const pol = (r: number, deg: number): [number, number] => [r * Math.cos((deg * Math.PI) / 180), -r * Math.sin((deg * Math.PI) / 180)];
const pf = (p: [number, number]): string => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
// one tracery lobe in the fundamental wedge 30-90 deg, deliberately without a mirror line of its own, so the drawn set of
// lobes has exactly the symmetry of the group (C3 alone: a pinwheel; 3m: a mirrored hexafoil)
const LOBE = `M${pf(pol(0.2 * SR, 50))}C${pf(pol(0.52 * SR, 35))} ${pf(pol(0.88 * SR, 42))} ${pf(pol(0.92 * SR, 66))}C${pf(pol(0.78 * SR, 86))} ${pf(pol(0.42 * SR, 80))} ${pf(pol(0.2 * SR, 50))}Z`;
const POLE = pol(0.64 * SR, 58);
export function visStereo(m: NmModel): string {
  const st = (i: number): string => (m.elems[i].inEff ? "on" : m.elems[i].inG ? "cut" : "off");
  let o = `<circle class="rim2" cx="${SC}" cy="${SC}" r="${SR + 7}"/><circle class="rim" cx="${SC}" cy="${SC}" r="${SR}"/><circle class="hub" cx="${SC}" cy="${SC}" r="${0.2 * SR}"/>`;
  o += `<g transform="translate(${SC} ${SC})">`;
  // orbit of the general pole: one lobe and one pole per element of the group in force
  OPS.forEach((op, i) => {
    if (!m.elems[i].inEff) return;
    const R = op.R; // screen y is down: conjugate by diag(1, -1)
    o += `<g transform="matrix(${R[0][0].toFixed(6)} ${(-R[1][0]).toFixed(6)} ${(-R[0][1]).toFixed(6)} ${R[1][1].toFixed(6)} 0 0)"><path class="lobe" d="${LOBE}"/><circle class="pole" cx="${POLE[0].toFixed(1)}" cy="${POLE[1].toFixed(1)}" r="5"/></g>`;
  });
  ([[3, 90], [4, 150], [5, 30]] as const).forEach(([i, a]) => { const p = pol(SR, a), q = pol(SR, a + 180); o += `<line class="mir ${st(i)}" x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}"/>`; });
  o += `<path class="c3 ${st(1)}" d="M0 -11L9.5 5.5H-9.5Z"/>`;
  o += `<line class="ax" x1="${SR + 10}" y1="0" x2="${SR + 22}" y2="0"/><text class="axl" x="${SR + 26}" y="5">x</text><line class="ax" x1="0" y1="${-SR - 10}" x2="0" y2="${-SR - 22}"/><text class="axl" x="6" y="${-SR - 16}">y</text>`;
  if (m.field === "x") o += `<g class="ef"><line x1="0" y1="0" x2="${SR - 14}" y2="0"/><path d="M${SR} 0l-16 -7v14z"/><text x="${SR - 34}" y="-12">E</text></g>`;
  else if (m.field === "y") o += `<g class="ef"><line x1="0" y1="0" x2="0" y2="${-SR + 14}"/><path d="M0 ${-SR}l-7 16h14z"/><text x="12" y="${-SR + 30}">E</text></g>`;
  else if (m.field === "z") o += `<g class="ef"><circle class="ring" r="22"/><circle class="ring" r="28"/><text x="24" y="-26">E</text></g>`;
  return `${o}</g>`;
}

// ---------- client mount ----------
export function mountNeumann(figT: HTMLElement | null, figV: HTMLElement | null): () => void {
  const dis = new Disposer();
  const roots = [figT, figV].filter(Boolean) as HTMLElement[];
  let hover: [number, number] | null = null, model = nmModel(store), queued = false;
  const all = <T extends Element>(sel: string): T[] => roots.flatMap((r) => [...r.querySelectorAll<T>(sel)]);
  const set = (sel: string, v: string, html = false): void => all<HTMLElement>(sel).forEach((e) => { if (html ? e.innerHTML !== v : e.textContent !== v) { if (html) e.innerHTML = v; else e.textContent = v; } });
  function paint(): void {
    queued = false;
    set(".nm-hdr", hdrText(model)); set(".nm-kind", kindText(model)); set(".nm-sub", subText(model)); set(".nm-opt", opticText(model));
    set(".nm-rel", model.relLines.join("\n")); set(".nm-db", model.dB.join("\n")); set(".nm-hov", hoverText(model, hover));
    const B = bigText(model);
    set(".nm-ind", B.ind); set(".nm-gen", B.gen); set(".nm-grp", B.grp);
    set(".nm-el", elemsHtml(model), true);
    set(".nm-mx", techGrid(model, hover), true);
    set("svg.nm-gg", visGrid(model, hover), true);
    set("svg.nm-st", visStereo(model), true);
    all<HTMLButtonElement>("button[data-nm-k]").forEach((b) => { const on = b.dataset.nmK === store.kind; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
    all<HTMLButtonElement>("button[data-nm-f]").forEach((b) => { const on = b.dataset.nmF === store.field; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
    all<HTMLButtonElement>("button[data-nm-op]").forEach((b) => {
      const k = b.dataset.nmOp as OpKey, on = store.ops[k], imp = !on && model.elems[GEN[k]].inG;
      b.classList.toggle("on", on); b.classList.toggle("nm-imp", imp); b.setAttribute("aria-pressed", String(on));
      b.title = imp ? "off, but in the group by closure of the others" : on ? "generator on" : "generator off";
    });
  }
  const request = (): void => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
  const update = (): void => { model = nmModel(store); request(); };
  for (const b of all<HTMLButtonElement>("button[data-nm-k]")) dis.on(b, "click", () => { store.kind = b.dataset.nmK as typeof store.kind; hover = null; update(); });
  for (const b of all<HTMLButtonElement>("button[data-nm-f]")) dis.on(b, "click", () => { store.field = b.dataset.nmF as FieldDir; update(); });
  for (const b of all<HTMLButtonElement>("button[data-nm-op]")) dis.on(b, "click", () => { const k = b.dataset.nmOp as OpKey; store.ops[k] = !store.ops[k]; update(); });
  for (const b of all<HTMLButtonElement>("button[data-nm-pre]")) dis.on(b, "click", () => { const v = b.dataset.nmPre === "all"; (Object.keys(store.ops) as OpKey[]).forEach((k) => (store.ops[k] = v)); update(); });
  for (const stage of all<HTMLElement>("[data-nm-hover]")) {
    dis.on(stage, "pointermove", (e: PointerEvent) => {
      const t = (e.target as Element | null)?.closest?.("[data-ij]") as HTMLElement | SVGElement | null;
      const ij = t?.getAttribute("data-ij");
      const h: [number, number] | null = ij ? [+ij[0], +ij[1]] : null;
      if ((h?.[0] ?? -1) !== (hover?.[0] ?? -1) || (h?.[1] ?? -1) !== (hover?.[1] ?? -1)) { hover = h; request(); }
    });
    dis.on(stage, "pointerleave", () => { hover = null; request(); });
  }
  dis.add(onUi(request));
  request();
  return dis.run;
}
