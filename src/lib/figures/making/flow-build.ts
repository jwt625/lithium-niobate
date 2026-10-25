// Build-time conversion of process-flow.yaml into the Process viewer payload (flow.ts FlowData) plus popup records for
// every parameter. Server only. No value is added here: values, units, statuses, sources and notes are copied from the
// YAML; derived counts (status mix, per-route PDim counts) are computed from it.
import { rawContent } from "$lib/content/loader";
import type { Pop } from "$lib/content/pops";
import { parseYaml, type YamlValue } from "./yaml";
import { esc, type SourceIndex } from "./sources";
import type { FlowData, PD, PStatus, StepD } from "./flow";
import type { Geom, Route } from "./xsec";

type Obj = Record<string, YamlValue>;

const STATUS_DEF: Record<PStatus, string> = {
  reported: "read in the cited document at the locator",
  derived: "computed from other parameters of the flow",
  template: "not reported; illustrative",
  na: "not reported and not drawn",
};

export function unitHTML(u: string): string {
  return esc(u)
    .replace(/^C\b/, "°C").replace(/\bdeg\b/, "°").replace(/\bum\b/g, "µm")
    .replace(/\^(-?\d+)/g, (_m, e: string) => `<sup>${e.replace("-", "−")}</sup>`).replace(/^1\/Pa$/, "Pa<sup>−1</sup>");
}
const sup = (e: number): string => `<sup>${e < 0 ? "−" : ""}${Math.abs(e)}</sup>`;

export function valueHTML(v: YamlValue, unit: string): string {
  if (v === null || v === undefined) return "n/a";
  if (Array.isArray(v)) {
    if (v.length === 2 && v[0] === v[1]) return `${v[0]} × ${v[1]}`;
    return v.map((x) => valueHTML(x, unit)).join("–");
  }
  if (typeof v === "number") {
    if (unit === "cm^-2") { const e = Math.floor(Math.log10(v)); return `${(v / 10 ** e).toFixed(1)} × 10${sup(e)}`; }
    if (unit === "nm/min") return v.toFixed(1);
    return String(v);
  }
  return esc(String(v)).replace(/\bum\b/g, "µm").replace(/(\d) C\b/g, "$1 °C");
}

/** Drop pipeline references (open-question numbers, design-note ids) from notes shown to readers. */
export const clean = (t: string, idx?: SourceIndex): string => {
  let s = t.replace(/ ?\(open-questions Q\d+\)/g, "").replace(/ ?\(Q\d+\)/g, "").replace(/; badge U on the text/g, "; procedure unverified")
    .replace(/ \(computed in viewer; site-map motif R12\)/g, "").replace(/; site-map motif R12/g, "")
    .replace(/\s*\((?:[^()]*\bR\d\d\b[^()]*)\)/g, "").replace(/\s*\bvia R\d\d[^,;)]*/g, "").replace(/\bR\d\d[: ]#?[\w.-]+/g, "")
    .replace(/eo-modulator-atlas row \S+/g, "the device table of the cited paper").replace(/ in figures\.md F05-08/g, " of the argon-etching figure in 5.7").replace(/\s*\(?(?:figures\.md|DevLog)[^),;]*\)?/g, "").replace(/\bMeshPhysicalMaterial\b/g, "3D material");
  if (idx) s = s.replace(/\b([a-z]+_?[a-z]*\d{4}[a-z]*)\b/g, (k) => (idx.refs.has(k) ? idx.short(k) : k));
  return s.replace(/\s{2,}/g, " ").replace(/\s+([,.;])/g, "$1").trim();
};
/** Readable formula: parameter keys as words. */
const words = (f: string): string => f.replace(/([a-z])_([a-z])/g, "$1 $2").replace(/([a-z])_([a-z])/g, "$1 $2");
const TOOL_WORDS: Record<string, string> = { cmp: "CMP", pecvd: "PECVD", rie: "RIE", icp: "ICP", rf: "RF", cz: "Cz", ebeam: "e-beam", gsg: "GSG" };
export const toolName = (id: string): string => id.split("_").map((w) => TOOL_WORDS[w] ?? w).join(" ");

function pd(key: string, d: Obj, stepId: string, stepName: string, idx: SourceIndex, pops: Record<string, Pop>): PD {
  const st = (String(d.status ?? "na") as PStatus);
  const unit = String(d.unit ?? "");
  const p: PD = {
    k: key, v: valueHTML(d.value, unit), u: unitHTML(unit), st, an: d.analog === true,
    src: null, loc: d.locator != null ? clean(String(d.locator), idx) : null,
    note: d.note != null ? clean(String(d.note), idx) : null, f: d.formula != null ? words(clean(String(d.formula), idx)) : null,
    r: Array.isArray(d.routes) ? d.routes.map(String) : null, pop: `pf:${stepId}.${key}`,
  };
  const label = key === "duration" ? "process time" : key.replace(/_/g, " ");
  const body = [
    `<span class="v">${p.v}${p.u ? " " + p.u : ""}</span>`,
    `${st}: ${STATUS_DEF[st]}${p.an ? "; analog (from a paper other than the route anchor, or from LiTaO<sub>3</sub>)" : ""}.`,
    p.f ? `Formula: ${esc(p.f)}.` : "",
    p.note ? `${esc(p.note)}.`.replace(/\.\.$/, ".") : "",
  ].filter(Boolean).join("<br>");
  const src = d.source != null ? String(d.source) : null;
  pops[p.pop] = { h: `${esc(label)} <span class="dim">(${esc(stepName)})</span>`, body, src: src && idx.resolvable(src) ? idx.cite(src, p.loc ?? undefined) : undefined };
  return p;
}

export async function buildFlow(idx: SourceIndex): Promise<{ flow: FlowData; pops: Record<string, Pop> }> {
  const y = parseYaml(await rawContent("/content/chapters/05-making/process-flow.yaml")) as Obj;
  const pops: Record<string, Pop> = {};
  const anchors = y.anchors as Obj;
  const routes = (y.routes as Obj[]).map((r) => ({ id: String(r.id) as Route, label: String(r.label), anchor: String((anchors[String(r.id)] as Obj).paper) }));
  const steps: StepD[] = (y.steps as Obj[]).map((s) => {
    const id = String(s.id);
    const name = String(s.name);
    // parameters whose only support is an internal note (no primary citation) are not shown
    const shown = Object.entries((s.params as Obj) ?? {}).filter(([, d]) => { const src = (d as Obj).source; return src == null || idx.resolvable(String(src)); });
    const params = shown.map(([k, d]) => pd(k, d as Obj, id, name, idx, pops));
    const dur = pd("duration", s.duration as Obj, id, name, idx, pops);
    const dv = (s.duration as Obj).value;
    let tmin: number | null = null, tlabel = "n/a";
    if (id === "s03_pull") { const L = Number(((s.params as Obj).body_length as Obj).value); tmin = (L / 1.5) * 60; tlabel = "body at the 1.5 mm/h midpoint of the reported 1–2 mm/h"; }
    else if (typeof dv === "number") { tmin = String((s.duration as Obj).unit) === "h" ? dv * 60 : dv; tlabel = (s.duration as Obj).formula ? `derived: ${words(clean(String((s.duration as Obj).formula), idx))}` : "reported"; }
    else if (dv === "< 1") { tmin = 1; tlabel = "upper bound: under 1 min per wafer"; }
    const sc = s.scale as Obj, tool = s.tool as Obj, cam = s.camera as Obj;
    return {
      id, phase: String(s.phase), name: String(s.name), routes: (s.routes as YamlValue[]).map(String),
      primary: String(sc.primary), inset: sc.inset == null ? null : String(sc.inset), tool: toolName(String(tool.id)), part: String(tool.involved_part),
      retarget: cam.retarget === true, reason: cam.reason != null ? String(cam.reason) : null,
      params, dur, physics: "", note: null,
      tmin, tlabel, tst: dur.st, weight: 1,
    };
  });
  const order = Object.fromEntries(routes.map((r) => [r.id, steps.filter((s) => s.routes.includes(r.id)).map((s) => s.id)])) as Record<Route, string[]>;
  const counts = Object.fromEntries(routes.map((r) => {
    const c = { reported: 0, analog: 0, derived: 0, template: 0, na: 0, total: 0 };
    for (const s of steps) if (s.routes.includes(r.id)) for (const p of [...s.params, s.dur]) {
      if (p.r && !p.r.includes(r.id)) continue;
      c[p.st]++; c.total++; if (p.an) c.analog++;
    }
    return [r.id, c];
  })) as FlowData["counts"];
  const S = (id: string): Obj => ((y.steps as Obj[]).find((s) => s.id === id)?.params ?? {}) as Obj;
  const n = (id: string, k: string): number => {
    const v = (S(id)[k] as Obj | undefined)?.value;
    if (typeof v !== "number") throw new Error(`process-flow: ${id}.${k} is not a number`);
    return v;
  };
  const geom: Geom = {
    siRidge: n("s07_handle", "handle_si_thickness_ridge"), siStrip: n("s07_handle", "handle_si_thickness_strip"), ox: n("s07_handle", "thermal_oxide"),
    donor: n("s05_orient_slice", "wafer_thickness_donor"), split: n("s08_implant", "projected_peak_depth"), target: n("s11_cmp", "target_film") / 1000,
    hmSio2: n("s13r_hardmask", "thickness") / 1000, arc: n("s14r_coat", "arc") / 1000, resist: n("s14r_coat", "resist") / 1000,
    etchRidge: n("s17r_ln_etch", "etch_depth") / 1000, angleRidge: n("s17r_ln_etch", "sidewall_angle"),
    dlc: n("s13s_hardmask", "dlc_thickness") / 1000, dlcUsed: n("s16s_ln_etch", "dlc_consumed") / 1000, etchStrip: n("s16s_ln_etch", "etch_depth") / 1000,
    angleStrip: n("s16s_ln_etch", "sidewall_angle"), baseStrip: n("s16s_ln_etch", "base_width"),
    clad: n("s19r_clad", "thickness") / 1000, auRidge: n("s20r_electrodes", "thickness") / 1000, tiStrip: n("s18s_electrodes", "ti") / 1000, auStrip: n("s18s_electrodes", "au") / 1000,
    gapRidge: n("s20r_electrodes", "gap"),
    boule: { D_mm: n("s03_pull", "crystal_diameter"), L_mm: n("s03_pull", "body_length") },
  };
  return { flow: { routes, steps, order, geom, counts }, pops };
}
