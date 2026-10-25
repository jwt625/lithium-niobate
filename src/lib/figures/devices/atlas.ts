// eo-modulator-atlas rows for chapter 06 (vendored subset static/data/devices/atlas-ln.json, pinned eb97f96).
// Conventions: content/chapters/08-industry/chart-specs.md sec. 1 (platforms, vpil_best, qualifiers, hover card).
import type { Shape } from "./svgplot.ts";
import { esc } from "./svgplot.ts";

export const ATLAS_SHA = "eb97f961165a331599e8191c62e15b5a52ba1d51";
export const ATLAS_SHORT = "eb97f96";
export const ATLAS_DATE = "2026-10-20";
export const ATLAS_REPO = "https://github.com/jwt625/eo-modulator-atlas";
export const ATLAS_COMMIT_URL = `${ATLAS_REPO}/tree/${ATLAS_SHA}`;

export interface Dev {
  device_id: string;
  paper_id: string;
  platform: string;
  eo_material?: string;
  waveguide_platform?: string;
  integration?: string;
  electrode_type?: string;
  device_class?: string;
  row_kind?: string;
  tags?: string;
  band?: string;
  vpi_convention?: string;
  bw3db_reference?: string;
  bw_method?: string;
  modulation_format?: string;
  il_onchip_scope?: string;
  crystal_cut?: string;
  qualifiers?: string;
  evidence_ref?: string;
  notes?: string;
  wavelength_nm?: number;
  length_mm?: number;
  vpi_dc_v?: number;
  vpi_rf_v?: number;
  vpil_dc_vcm?: number;
  vpil_rf_vcm?: number;
  bw3db_ghz?: number;
  bw_measured_to_ghz?: number;
  max_baud_gbd?: number;
  max_line_rate_gbps?: number;
  max_net_rate_gbps?: number;
  il_onchip_db?: number;
  prop_loss_db_per_cm?: number;
  rf_loss_db_per_cm?: number;
  rf_loss_freq_ghz?: number;
  z0_ohm?: number;
  n_rf?: number;
  ng_opt?: number;
  q_loaded?: number;
  eo_film_thickness_nm?: number;
  electrode_gap_um?: number;
  tuning_nm_per_v?: number;
  vpil_best?: number;
  vpil_source?: string;
  year: number | null;
  telecom: boolean;
}
export interface Paper { paper_id: string; title?: string; year?: number; venue?: string; doi?: string; url?: string; first_author?: string }
/** Short name of an atlas row: first author, paper year, and the row's variant within the paper, e.g. "Shen 2024 (a)". */
export function devLabel(d: Pick<Dev, "device_id" | "paper_id" | "year">, p?: Paper): string {
  const who = p?.first_author ?? d.paper_id.replace(/\d.*$/, "").replace(/^./, (c) => c.toUpperCase());
  const v = d.device_id.startsWith(`${d.paper_id}-`) ? d.device_id.slice(d.paper_id.length + 1) : "";
  return `${who} ${p?.year ?? d.year ?? ""}${v ? ` (${v})` : ""}`.trim();
}
export interface Atlas { source: Record<string, unknown>; devices: Dev[]; papers: Paper[] }

export type Q = "gt" | "lt" | "approx";
/** Qualifier on a field (schema convention (b)): "field:op" entries separated by ";". */
export function qual(d: Pick<Dev, "qualifiers">, field: string): Q | undefined {
  for (const s of (d.qualifiers ?? "").split(";")) {
    const [f, op] = s.trim().split(":");
    if (f === field && (op === "gt" || op === "lt" || op === "approx")) return op;
  }
  return undefined;
}
/** Qualifier of vpil_best: the field that produced it. */
export function qualVpil(d: Dev): Q | undefined {
  if (d.vpil_source === "reported_dc") return qual(d, "vpil_dc_vcm");
  if (d.vpil_source === "derived_dc") return qual(d, "vpi_dc_v") ?? qual(d, "length_mm");
  if (d.vpil_source === "reported_rf") return qual(d, "vpil_rf_vcm");
  return undefined;
}
export const hasTag = (d: Dev, t: string): boolean => (d.tags ?? "").split(";").includes(t);
export const isMZM = (d: Dev): boolean => d.device_class === "mzm" || d.device_class === "iq_mzm";
export const isLNLT = (d: Dev): boolean => d.platform === "TFLN" || d.platform === "TFLT";

export const PLATFORMS = ["TFLN", "TFLT", "SiPh", "InP", "BTO", "Polymer", "AlGaAs", "Other"] as const;
export const PLAT_SHAPE: Record<string, Shape> = { TFLN: "diamond", TFLT: "diamondo", SiPh: "square", InP: "tri", BTO: "circle", Polymer: "cross", AlGaAs: "trid", Other: "plus" };
export const platCls = (p: string): string => `pl-${p.toLowerCase().replace(/[^a-z0-9]+/g, "")}`;
export const shapeOf = (p: string): Shape => PLAT_SHAPE[p] ?? "plus";

/** Slim point carried in page data (full row details are fetched for the hover card). */
export interface Pt {
  id: string;
  pl: string;
  x: number;
  y: number;
  qx?: Q;
  qy?: Q;
  yr: number;
  /** flags: telecom band, push-pull convention, design row, hollow marker (tag set) */
  tel?: 1;
  pp?: 1;
  dz?: 1;
  ho?: 1;
  /** short name for labels (author year (variant)) */
  lb?: string;
  /** extra numbers (chart-specific): electrode type, length, wavelength, gap */
  et?: string;
  L?: number;
  lam?: number;
  g?: number;
  conv?: string;
}

// ---------- client: lazy full-row fetch for hover cards ----------
let atlasP: Promise<Atlas> | null = null;
export function loadAtlas(): Promise<Atlas> {
  atlasP ??= fetch("/data/devices/atlas-ln.json").then((r) => r.json() as Promise<Atlas>);
  return atlasP;
}

const trunc = (s: string, n: number): string => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const qtxt = (q: Q | undefined, v: string): string => (q === "gt" ? `&gt; ${v}` : q === "lt" ? `&lt; ${v}` : q === "approx" ? `about ${v}` : v);
const fmtN = (v: number | undefined, d = 3): string => (v == null ? "–" : String(Number(v.toPrecision(d))));

/** Hover card body (chart-specs 08 sec. 1.7). `fields`: plotted quantities as [label, value, unit, qualifier]. */
export function hoverHTML(d: Dev, p: Paper | undefined, fields: [string, number | undefined, string, Q | undefined][]): string {
  const link = p?.doi ? `<a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">doi:${esc(p.doi)}</a>` : p?.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">source</a>` : "";
  const ev = `<a href="${ATLAS_REPO}/blob/${ATLAS_SHA}/data/evidence/${encodeURIComponent(d.paper_id)}.yaml" target="_blank" rel="noopener">evidence</a>`;
  const rows = fields.map(([k, v, u, q]) => `<span>${k}</span><b>${qtxt(q, fmtN(v))}${u ? ` ${u}` : ""}</b>`).join("");
  return `<div class="hc-id">${esc(devLabel(d, p))} <span class="hc-pl">${esc(d.platform)}</span></div>`
    + `<div class="hc-t">${esc(trunc(p?.title ?? d.paper_id, 90))}${p?.year ? `, ${p.year}` : ""}${p?.venue ? `, ${esc(trunc(p.venue, 40))}` : ""}</div>`
    + `<div class="hc-kv">${rows}`
    + (d.vpil_source ? `<span>V<sub>&pi;</sub>L from</span><b>${d.vpil_source === "reported_dc" ? "reported (DC)" : d.vpil_source === "derived_dc" ? "V<sub>&pi;</sub> × L (DC)" : "reported (RF)"}</b>` : "")
    + `<span>V<sub>&pi;</sub> convention</span><b>${esc(convName(d.vpi_convention))}</b>`
    + (d.bw_method ? `<span>BW method</span><b>${esc(d.bw_method.replace(/_/g, " "))}</b>` : "")
    + `</div>`
    + (d.notes ? `<div class="hc-n">${esc(trunc(d.notes, 240))}</div>` : "")
    + `<div class="hc-l">${link}${link ? " · " : ""}${ev} · atlas ${ATLAS_SHORT}</div>`;
}

/** Median of numbers. */
export function median(a: number[]): number {
  if (!a.length) return NaN;
  const s = [...a].sort((x, y) => x - y), n = s.length;
  return n % 2 ? s[(n - 1) / 2] : 0.5 * (s[n / 2 - 1] + s[n / 2]);
}

/** Hover-card factory for an atlas chart: fields(d) lists the plotted quantities. */
export function atlasHover(fields: (d: Dev) => [string, number | undefined, string, Q | undefined][]): (id: string) => Promise<string | null> {
  let idx: { d: Map<string, Dev>; p: Map<string, Paper> } | null = null;
  return async (id: string) => {
    if (!idx) { const a = await loadAtlas(); idx = { d: new Map(a.devices.map((x) => [x.device_id, x])), p: new Map(a.papers.map((x) => [x.paper_id, x])) }; }
    const d = idx.d.get(id);
    return d ? hoverHTML(d, idx.p.get(d.paper_id), fields(d)) : null;
  };
}

/** Plain-language name of an atlas V_pi convention value. */
export const CONV: Record<string, string> = {
  mzm_push_pull: "push-pull MZM", mzm_differential: "differential", mzm_series_push_pull: "series push-pull", mzm_single_arm: "single-arm MZM",
  per_arm_phase_shifter: "per-arm phase shifter", resonance_tuning_derived: "from resonance tuning", unspecified: "convention not stated",
};
export const convName = (c: string | undefined): string => CONV[c ?? "unspecified"] ?? (c ?? "convention not stated").replace(/_/g, " ");
