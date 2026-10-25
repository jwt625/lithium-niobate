// Property explorer data (build time): every public scalar and tensor record of src/lib/generated, flattened to display
// rows (value with unit, conditions, frame, source with DOI and locator, status), plus the property index.
import PROPS from "$lib/generated/properties.json";
import TENSORS from "$lib/generated/tensors.json";
import VARIANTS from "$lib/generated/variants.json";
import INDEX from "$lib/generated/index.json";
import { cite, condText, frameText, stripNotes, replaceKeys } from "./sources.server";

const clean = (t: string | undefined): string => replaceKeys(stripNotes(t ?? "")).replace(/[^.]*\bis in the paper and was not read\.?/g, "").replace(/\s*\((?:frequently cited)\)/g, "").replace(/\s{2,}/g, " ").trim();

export interface DRow {
  id: string; prop: string; name: string; nh: string; sym: string; kind: "scalar" | "tensor"; cat: string; v: string; vname: string;
  val: string; unit: string; cond: string; frame: string; src: string; doi?: string; url?: string; loc: string; orig: string; olab: string; st: string; def: boolean; notes: string; vnote: string; transcribed: string;
  num?: number[]; // numeric values for the spread (value, or [min, max])
  unc?: number; ucum: string; wl?: number;
}
export interface DProp { id: string; name: string; nh: string; sym: string; kind: "scalar" | "tensor"; cat: string; n: number; variants: string[]; unit: string }

interface Prov { source_id: string; status: string; locator?: string; original_reference?: string; transcribed?: string; derivation?: string }
interface RawS { id: string; property: string; name: string; symbol?: string; category: string; variant: string; value?: number; min?: number; max?: number; value_text?: string; uncertainty?: { type: string; value?: number }; unit: { display: string; ucum: string }; conditions?: Record<string, unknown>; frame?: Record<string, unknown>; provenance: Prov; default?: boolean; notes?: string; variant_note?: string; public?: boolean }
interface RawT { id: string; tensor: string; name: string; symbol: string; variant: string; independent: Record<string, { value: number; uncertainty?: { value?: number } }>; unit: { display: string; ucum?: string }; conditions?: Record<string, unknown>; frame?: Record<string, unknown>; provenance: Prov; default?: boolean; notes?: string; variant_note?: string; public?: boolean }

/** Number as HTML keeping the source digits: 4e-05 -> 4 &times; 10<sup>&minus;5</sup>. */
export function numHTML(v: number): string {
  let s = String(v);
  if (Math.abs(v) > 0 && Math.abs(v) < 1e-3 && !s.includes("e")) s = v.toExponential(Math.max(0, s.replace(/^-?0\.0*/, "").length - 1));
  const m = /^(-?)(\d+(?:\.\d+)?)e([+-]?\d+)$/.exec(s);
  if (m) return `${m[1] ? "&minus;" : ""}${m[2]}&times;10<sup>${+m[3] < 0 ? "&minus;" : ""}${Math.abs(+m[3])}</sup>`;
  return s.replace(/^-/, "&minus;");
}
export const unitHTML = (u: string): string => (u === "-" || u === "1" ? "" : u.replace(/\^(-?\d+)/g, (_, e: string) => `<sup>${e.replace("-", "&minus;")}</sup>`).replace(/\bum\b/g, "&micro;m").replace(/\bAngstrom\b/g, "&Aring;").replace(/^C$/, "&deg;C").replace(/\bohm\b/gi, "&Omega;"));
export const subSym = (s: string): string => s.replace(/_([A-Za-z0-9,]+)/g, "<sub>$1</sub>").replace(/\^([A-Za-z0-9]+)/g, "<sup>$1</sup>").replace(/eps/g, "&epsilon;").replace(/lambda/g, "&lambda;").replace(/alpha/g, "&alpha;").replace(/sigma/g, "&sigma;").replace(/tau/g, "&tau;").replace(/\brho\b/g, "&rho;").replace(/\bDelta\b/g, "&Delta;");

/** Property name as HTML: n_e -> n<sub>e</sub>, cm^-1 -> cm<sup>-1</sup>. */
export const nameHTML = (n: string): string => n.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/_\(?([A-Za-z0-9,]+)\)?/g, (m, x: string) => (m.includes("(") ? `<sub>${x}</sub>` : `<sub>${x}</sub>`)).replace(/\^(-?\d+)/g, (_, e: string) => `<sup>${e.replace("-", "&minus;")}</sup>`).replace(/\balpha\b/g, "&alpha;");
export const VARIANT_NAMES: Record<string, string> = Object.fromEntries((VARIANTS as { id: string; name: string }[]).map((v) => [v.id, v.name]));

let cache: { rows: DRow[]; props: DProp[] } | null = null;
export function dataRows(): { rows: DRow[]; props: DProp[] } {
  if (cache) return cache;
  const rows: DRow[] = [];
  for (const r of PROPS as unknown as RawS[]) {
    if (r.public === false) continue;
    const c = cite(r.provenance.source_id);
    let val = "", num: number[] | undefined;
    if (typeof r.value === "number") { val = numHTML(r.value); num = [r.value]; }
    else if (typeof r.min === "number" && typeof r.max === "number") { val = `${numHTML(r.min)} to ${numHTML(r.max)}`; num = [r.min, r.max]; }
    if (r.value_text) val = val ? `${val} (${r.value_text})` : r.value_text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    if (r.uncertainty?.value !== undefined && val) val += ` &plusmn; ${numHTML(r.uncertainty.value)}`;
    else if (r.uncertainty?.type === "approximate") val = `&asymp; ${val}`;
    rows.push({
      id: r.id, prop: r.property, name: clean(r.name), nh: nameHTML(clean(r.name)), sym: subSym(r.symbol ?? ""), kind: "scalar", cat: r.category, v: r.variant, vname: VARIANT_NAMES[r.variant] ?? r.variant,
      val: val || "&ndash;", unit: unitHTML(r.unit.display), ucum: r.unit.ucum, cond: condText(r.conditions), frame: clean(frameText(r.frame)), src: c.text, doi: c.doi, url: c.url, loc: clean(r.provenance.locator),
      orig: clean(r.provenance.original_reference ?? r.provenance.derivation), olab: r.provenance.original_reference ? "original" : r.provenance.derivation ? "derived" : "", st: r.provenance.status, def: !!r.default, notes: clean(r.notes), vnote: clean(r.variant_note), transcribed: r.provenance.transcribed ?? "",
      num, unc: r.uncertainty?.value, wl: typeof r.conditions?.wavelength_nm === "number" ? (r.conditions.wavelength_nm as number) : undefined,
    });
  }
  for (const r of TENSORS as unknown as RawT[]) {
    if (r.public === false) continue;
    const c = cite(r.provenance.source_id);
    const comps = Object.entries(r.independent).map(([k, x]) => `${subSym(k.replace(/^([a-z]+)(\d+)$/, "$1_$2"))} ${numHTML(x.value)}`);
    rows.push({
      id: r.id, prop: r.tensor, name: r.name, nh: nameHTML(r.name), sym: subSym(r.symbol), kind: "tensor", cat: "tensor", v: r.variant, vname: VARIANT_NAMES[r.variant] ?? r.variant,
      val: comps.join(", "), unit: unitHTML(r.unit.display), ucum: r.unit.ucum ?? "", cond: condText(r.conditions), frame: clean(frameText(r.frame)), src: c.text, doi: c.doi, url: c.url, loc: clean(r.provenance.locator),
      orig: clean(r.provenance.original_reference ?? r.provenance.derivation), olab: r.provenance.original_reference ? "original" : r.provenance.derivation ? "derived" : "", st: r.provenance.status, def: !!r.default, notes: clean(r.notes), vnote: clean(r.variant_note), transcribed: r.provenance.transcribed ?? "",
    });
  }
  rows.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "scalar" ? -1 : 1) || a.name.localeCompare(b.name) || a.v.localeCompare(b.v) || Number(b.def) - Number(a.def));
  const props: DProp[] = [];
  for (const r of rows) {
    let p = props.find((x) => x.id === r.prop);
    if (!p) { p = { id: r.prop, name: r.name, nh: r.nh, sym: r.sym, kind: r.kind, cat: r.cat, n: 0, variants: [], unit: r.unit }; props.push(p); }
    p.n++;
    if (!p.variants.includes(r.v)) p.variants.push(r.v);
  }
  // properties whose only records are LiTaO3 (comparison material) say so in their name
  for (const p of props) if (p.variants.every((v) => v.startsWith("lt-"))) {
    const suffix = ", LiTaO3 (comparison material)";
    p.name += suffix; p.nh += ", LiTaO<sub>3</sub> (comparison material)";
    for (const r of rows) if (r.prop === p.id) { r.name = p.name; r.nh = p.nh; }
  }
  cache = { rows, props };
  return cache;
}

/** Variant ids that have a per-variant endpoint (static/api/v1/properties/{p}/{v}.json or tensors/{t}/{v}.json). */
export function endpointVariants(prop: string): string[] {
  const idx = INDEX as { properties: { property: string; variants: string[] }[]; tensors: { tensor: string; variant: string }[] };
  const p = idx.properties.find((x) => x.property === prop);
  if (p) return p.variants;
  return idx.tensors.filter((t) => t.tensor === prop).map((t) => t.variant);
}

export { STATUS_DEF, statusCls } from "./status";
