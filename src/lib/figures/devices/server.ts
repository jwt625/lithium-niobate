// Chapter 06 server-side assembly (imported only by +page.server.ts loads): manuscript sections, popups (references,
// atlas rows, status definitions, R09 web sources), atlas chart points, and the default-state markup of the figures.
import { rawContent } from "$lib/content/loader";
import { STATUS, type PageMeta, type StatusCode } from "$lib/content/site";
import type { Pop } from "$lib/content/pops";
import atlasJson from "../../../../static/data/devices/atlas-ln.json";
import { type Atlas, type Dev, type Paper, type Pt, ATLAS_COMMIT_URL, ATLAS_DATE, ATLAS_REPO, ATLAS_SHA, ATLAS_SHORT, devLabel } from "./atlas.ts";
import { type Ctx, type Ref, type SectionDoc, R09, inline, refsMap, section, shortCite } from "./manuscript.ts";
import { esc } from "./svgplot.ts";

const MS = "/content/chapters/06-devices/manuscript.md";
const RF = "/content/chapters/06-devices/refs.yaml";
export const atlas = atlasJson as unknown as Atlas;
export const devById = new Map<string, Dev>(atlas.devices.map((d) => [d.device_id, d]));
export const paperById = new Map<string, Paper>(atlas.papers.map((p) => [p.paper_id, p]));
/** Short name of an atlas row id ("Shen 2024 (a)"). */
export const labelOf = (id: string): string => { const d = devById.get(id); return d ? devLabel(d, paperById.get(d.paper_id)) : id; };
/** Attach short names to chart points (marker aria-labels). */
export const lab = <T extends Pt>(pts: T[]): T[] => pts.map((p) => ({ ...p, lb: labelOf(p.id) }));
export const FETCHED = String((atlas.source as { fetched_on?: string }).fetched_on ?? "");

let cache: { md: string; refs: Map<string, Ref> } | null = null;
async function base(): Promise<{ md: string; refs: Map<string, Ref> }> {
  cache ??= { md: await rawContent(MS), refs: refsMap(await rawContent(RF)) };
  return cache;
}

export function refPop(r: Ref): Pop {
  const where = [r.venue ?? r.publisher, r.volume, r.pages].filter(Boolean).join(" ");
  const link = r.doi ? `<a href="https://doi.org/${esc(String(r.doi))}" target="_blank" rel="noopener">doi:${esc(String(r.doi))}</a>` : r.url ? `<a href="${esc(String(r.url))}" target="_blank" rel="noopener">${esc(String(r.url))}</a>` : r.path ? `research note ${esc(String(r.path))}` : "";
  return {
    h: esc(shortCite(r, r.id)),
    body: `${esc(String(r.title ?? ""))}${where ? `. ${esc(where)}` : ""}${r.year ? ` (${r.year})` : ""}.`,
    src: link,
  };
}
export function atlasPop(d: Dev): Pop {
  const p = paperById.get(d.paper_id);
  const link = p?.doi ? `<a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">doi:${esc(p.doi)}</a>` : p?.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">source</a>` : "";
  const vals = [
    d.vpil_best != null ? `V<sub>&pi;</sub>L ${d.vpil_best.toPrecision(3)} V cm (${esc(d.vpil_source ?? "")}, ${esc(d.vpi_convention ?? "convention unspecified")})` : "",
    d.bw3db_ghz != null ? `3 dB ${d.bw3db_ghz} GHz${/bw3db_ghz:gt/.test(d.qualifiers ?? "") ? " (lower bound)" : ""}` : "",
    d.length_mm != null ? `L ${d.length_mm} mm` : "", d.wavelength_nm != null ? `${d.wavelength_nm} nm` : "",
  ].filter(Boolean).join("; ");
  return {
    h: `${esc(devLabel(d, p))}, eo-modulator-atlas`,
    body: `${esc(p?.title ?? d.paper_id)}${p?.year ? ` (${p.year})` : ""}. ${esc(d.platform)}, ${esc(d.device_class ?? "")}. ${vals}`,
    badges: [["r", "reported"]],
    src: `${link}${link ? "; " : ""}<a href="${ATLAS_REPO}/blob/${ATLAS_SHA}/data/evidence/${encodeURIComponent(d.paper_id)}.yaml" target="_blank" rel="noopener">evidence</a>, eo-modulator-atlas ${ATLAS_SHORT} (${ATLAS_DATE})`,
  };
}
const statusPops = (): Record<string, Pop> => Object.fromEntries((Object.keys(STATUS) as StatusCode[]).map((k) => [`st:${k}`, { h: `Status ${k}`, body: STATUS[k].def }]));
export const ATLAS_POP: Pop = {
  h: "eo-modulator-atlas, pinned",
  body: `Statistic computed over atlas rows at commit ${ATLAS_SHORT} (${ATLAS_DATE}) with the filter stated in the text; the atlas is a literature sample, not a census. Rows vendored with SHA-256 verification on ${FETCHED}.`,
  badges: [["d", "derived"]],
  src: `<a href="${ATLAS_COMMIT_URL}" target="_blank" rel="noopener">github.com/jwt625/eo-modulator-atlas @ ${ATLAS_SHORT}</a>; no LICENSE file upstream; facts shown with attribution`,
};

export interface SrcRow { id: string; cite: string; title: string; href: string; label: string }
export interface Built { doc: SectionDoc; pops: Record<string, Pop>; keys: StatusCode[]; sources: SrcRow[] }
const srcRow = (r: Ref): SrcRow => ({ id: r.id, cite: shortCite(r, r.id), title: String(r.title ?? ""),
  href: r.doi ? `https://doi.org/${r.doi}` : String(r.url ?? ""), label: r.doi ? `doi:${r.doi}` : r.url ? String(r.url).replace(/^https?:\/\//, "") : String(r.path ?? "") });
/** Section HTML + every popup it references. `extraRefs` / `extraAtlas`: ids used by figures on the page. */
export async function buildSection(no: string, extraRefs: string[] = [], extraAtlas: string[] = [], extraCodes: StatusCode[] = []): Promise<Built> {
  const { md, refs } = await base();
  const c: Ctx = { refs, atlasIds: new Set(devById.keys()), atlasLabel: labelOf, usedRefs: new Set(extraRefs), usedAtlas: new Set(extraAtlas), usedS: new Set(), codes: new Set(extraCodes) };
  const doc = section(md, no, c);
  const pops: Record<string, Pop> = { ...statusPops(), atlas: ATLAS_POP };
  for (const id of c.usedRefs) { const r = refs.get(id); if (r && r.type !== "research_note") pops[`r:${id}`] = refPop(r); }
  for (const id of c.usedAtlas) { const d = devById.get(id); if (d) pops[`a:${id}`] = atlasPop(d); }
  for (const n of Object.keys(R09)) { const s = R09[n]; if (s) pops[`s:${n}`] = { h: esc(s[0]), body: `${s[2] === "F" ? "Company statement about its own products" : "Trade-press report"}; page accessed 2026-10-24.`, badges: [[s[2] === "F" ? "v" : "s", s[2] === "F" ? "V" : "S"]], src: `<a href="${esc(s[1])}" target="_blank" rel="noopener">${esc(s[1])}</a>` }; }
  const order: StatusCode[] = ["P", "P-comp", "P-db", "S", "V", "U", "reported", "derived", "template", "engine"];
  const web = [...c.usedS].filter((n) => R09[n]).map((n) => ({ id: `s${n}`, cite: R09[n][3], title: R09[n][0], href: R09[n][1], label: R09[n][1].replace(/^https?:\/\//, "").replace(/\/$/, "") }));
  const sources = [...[...c.usedRefs].map((id) => refs.get(id)).filter((r): r is Ref => !!r && r.type !== "research_note").map(srcRow), ...web].sort((a, b) => a.cite.localeCompare(b.cite));
  return { doc, pops, keys: order.filter((k) => c.codes.has(k)), sources };
}
export async function refsFor(ids: string[]): Promise<Record<string, Pop>> {
  const { refs } = await base();
  const o: Record<string, Pop> = {};
  for (const id of ids) { const r = refs.get(id); if (r) o[`r:${id}`] = refPop(r); }
  return o;
}
export async function refList(): Promise<Map<string, Ref>> { return (await base()).refs; }

export const meta = (no: string, title: string, description: string, keys: StatusCode[]): Partial<PageMeta> => ({ title: `${no} ${title}`, description, keys });
export const stamp = (): string => `atlas <a href="${ATLAS_COMMIT_URL}" target="_blank" rel="noopener">${ATLAS_SHORT}</a> · ${ATLAS_DATE} · fetched ${FETCHED}`;

/** Hover-card HTML for literature markers in figures (reference popup content in card form). */
export async function refCards(map: Record<string, string[]>, notes: Record<string, string> = {}): Promise<Record<string, string>> {
  const { refs } = await base();
  const out: Record<string, string> = {};
  for (const [key, ids] of Object.entries(map)) {
    out[key] = ids.map((id) => { const r = refs.get(id); if (!r) return ""; const p = refPop(r); return `<div class="hc-id">${p.h}</div><div class="hc-t">${typeof p.body === "string" ? p.body : ""}</div><div class="hc-l">${p.src ?? ""} · reported</div>`; }).join("") + (notes[key] ? `<div class="hc-n">${notes[key]}</div>` : "");
  }
  return out;
}

// SAW velocities for F6.12 (computed once per build; derived from kushibiki1999 constants by the partial-wave solver)
import { sawCut, sawFrameRotY, SAW_DEFAULT_MATERIAL } from "$lib/physics/saw.ts";
import { namedCut } from "$lib/physics/tensors.ts";
import type { Cut } from "./f612.ts";
let cutsMemo: Cut[] | null = null;
export function sawCuts(): Cut[] {
  cutsMemo ??= [
    { id: "128", label: "128° Y-X", v: sawCut(SAW_DEFAULT_MATERIAL, sawFrameRotY(128), "rayleigh").free.v, branch: "Rayleigh" },
    { id: "yz", label: "Y-Z", v: sawCut(SAW_DEFAULT_MATERIAL, namedCut("Y-cut, Z-prop"), "rayleigh").free.v, branch: "Rayleigh" },
    { id: "64", label: "64° Y-X", v: sawCut(SAW_DEFAULT_MATERIAL, sawFrameRotY(64), "leaky").free.v, branch: "leaky" },
  ];
  return cutsMemo;
}

/** Typeset a short manuscript string (Greek, sub/superscripts, units) for figure tables. */
export async function typesetText(s: string): Promise<string> {
  const { refs } = await base();
  return inline(s, { refs, atlasIds: new Set(), usedRefs: new Set(), usedAtlas: new Set(), usedS: new Set(), codes: new Set() });
}
