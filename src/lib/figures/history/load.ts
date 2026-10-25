// Chapter 07 History: server-side loaders (prerender only). Manuscript parse (cached) and the public event set.
import { rawContent } from "$lib/content/loader";
import EVENTS_RAW from "$lib/generated/events-history.json";
import { parseManuscript, sourcePop, label, type Manuscript, type PopData, type HStatus } from "./content";
import type { Ev } from "./events";

let cache: Manuscript | null = null;
export async function manuscript(): Promise<Manuscript> {
  if (!cache) cache = parseManuscript(await rawContent("/content/chapters/07-history/manuscript.md"));
  return cache;
}

interface RawEv {
  id: string; date: string; date_precision: string; chapter: number; title: string; hook?: string; people?: string[];
  organizations?: string[]; status: string; notes?: string; citations?: { doi?: string; url?: string; text?: string }[];
}
const PREC: Record<string, Ev["prec"]> = { day: "D", month: "M", year: "Y" };
/** Hook rewrites (same text applied to content/chapters/07-history/events.yaml; data/events/history.yaml pending). */
const HOOK_FIX: Readonly<Record<string, string>> = {
  "h-1966-ashkin-optical-damage": "A laser beam leaves a lasting index change in the crystal; in 1968 the effect stores holograms.",
  "h-1966-ferroelectric-ln-series": "Five papers in one journal issue cover growth, domains, poling, and X-ray and neutron structure.",
  "h-1976-shibayama-128": "At 127.86 degrees rotated Y the spurious shear wave is suppressed while surface-wave coupling stays large.",
  "h-1980-zhong-mgo": "About 4.6 mol% MgO raises the damage resistance at least a hundredfold.",
  "h-1985-crystal-technology-modulator": "1985: the first commercially available guided-wave intensity modulator.",
  "h-1992-seino-fujitsu-drift": "A bias point assured for 15 years, \"stable enough for use in commercial optical transmission systems\".",
  "h-2026-hyperlight-umc": "UMC, a silicon foundry, partners for thin-film LN production on 6- and 8-inch wafers.",
};
/** Events whose only source is not public (the author's local OFC 2026 extraction): not shown. */
const HIDDEN = new Set(["h-2026-ofc-corpus"]);
const cleanNote = (n: string): string => n.replace(/;?\s*UMC page 403\.?/g, "").trim();

/** Public history events (160), date order, with regional tags from the manuscript's regional index. */
export function events(regions: Record<string, string[]>): Ev[] {
  const tag = new Map<string, string[]>();
  for (const [r, ids] of Object.entries(regions)) for (const id of ids) tag.set(id, [...(tag.get(id) ?? []), r]);
  return (EVENTS_RAW as RawEv[])
    .filter((e) => !HIDDEN.has(e.id))
    .map((e) => {
      const c = e.citations?.find((x) => x.doi) ?? e.citations?.[0];
      return {
        id: e.id, date: e.date, prec: PREC[e.date_precision] ?? "Y", ch: e.chapter, title: e.title, hook: HOOK_FIX[e.id] ?? e.hook ?? "",
        people: e.people ?? [], org: (e.organizations ?? []).join("; "), st: (e.status === "derived" ? "derived" : e.status) as HStatus,
        doi: c?.doi, url: c?.doi ? undefined : c?.url, cite: (e.citations ?? []).map((x) => x.text ?? "").filter(Boolean).join("; "),
        notes: cleanNote(e.notes ?? ""), regions: tag.get(e.id) ?? [],
      } satisfies Ev;
    })
    .sort((a, b) => (a.date === b.date ? (a.id < b.id ? -1 : 1) : a.date < b.date ? -1 : 1));
}

/** Popup entries for the given C07 source ids (key "src:<id>"). */
export function sourcePops(ids: Iterable<string>): Record<string, PopData> {
  const out: Record<string, PopData> = {};
  for (const id of ids) { const p = sourcePop(id); if (p) out[`src:${id}`] = p; }
  return out;
}

/** Visible short names for the given C07 source ids. */
export function sourceLabels(ids: Iterable<string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const id of ids) out[id] = label(id);
  return out;
}

// ---------- LN modulator records on the chronology time axis ----------
import RECORDS_RAW from "$lib/generated/records.json";
import SOURCES_JSON from "$lib/generated/sources.json";
const SRCJ = new Map((SOURCES_JSON as { id: string; doi?: string; url?: string }[]).map((x) => [x.id, x]));
import { readFileSync } from "node:fs";
export interface RecPt { k: "bw" | "vpil"; t: number; v: number; src: "hist" | "rec" | "atlas"; who: string; note: string; doi?: string; url?: string; st: "rec" | "reported"; gt?: boolean }
interface RawRec { category: string; date: string; platform: string; metric: string; values?: { quantity?: string; value?: number; unit?: string }[]; doi?: string | null; first_author?: string; venue?: string; verification?: string; value_text?: string }
const dec = (d: string): number => { const [y, m = 7] = d.split("-").map(Number); return y + (m - 0.5) / 12; };
/** Points: two bulk-LN values from this chapter's sources, the modulator rows of the records table (6.12), and the
 *  thin-film LN rows of the eo-modulator-atlas subset; V_pi L in V cm, 3 dB EO bandwidth in GHz. */
export function recordSeries(): { pts: RecPt[]; atlas: { repo: string; sha: string; date: string } } {
  const pts: RecPt[] = [
    { k: "bw", t: dec("1973-05"), v: 3.2, src: "hist", who: label("kaminow1973"), note: "out-diffused bulk LN phase modulator, base bandwidth with a 50 ohm load", doi: SRCJ.get("kaminow1973")?.doi, st: "rec" },
    { k: "bw", t: dec("2009-09"), v: 25, src: "hist", who: label("fujitsu-2009"), note: "DP-QPSK Ti:LN modulator, 25 GHz (vendor claim)", url: SRCJ.get("fujitsu-2009")?.url, st: "rec" },
  ];
  for (const r of RECORDS_RAW as RawRec[]) {
    if (r.category !== "modulator" || !/TFLN/.test(r.platform) || !r.values || !r.doi) continue;
    if (r.verification && !/^Y/.test(r.verification)) continue;
    for (const q of r.values) {
      const name = (q.quantity ?? "").toLowerCase();
      if (q.value === undefined) continue;
      if (/^vpil( \(c-band\))?$/.test(name) && q.unit === "V.cm") pts.push({ k: "vpil", t: dec(r.date), v: q.value, src: "rec", who: `${r.first_author ?? ""} ${r.date.slice(0, 4)}`.trim(), note: `${r.metric}: ${r.value_text ?? ""}`, doi: r.doi, st: "reported" });
      if (/^(3-db )?eo bandwidth( \(c-band\))?$/.test(name) && q.unit === "GHz") pts.push({ k: "bw", t: dec(r.date), v: q.value, src: "rec", who: `${r.first_author ?? ""} ${r.date.slice(0, 4)}`.trim(), note: `${r.metric}: ${r.value_text ?? ""}`, doi: r.doi, st: "reported" });
    }
  }
  const raw = JSON.parse(readFileSync("static/data/devices/atlas-ln.json", "utf8")) as { source: { repo: string; sha: string; commit_date: string }; devices: { platform: string; telecom?: boolean; year?: number; vpil_best?: number; bw3db_ghz?: number; qualifiers?: string; paper_id: string }[]; papers: { paper_id: string; first_author?: string; year: number; doi?: string; url?: string; title: string }[] };
  const papers = new Map(raw.papers.map((p) => [p.paper_id, p]));
  for (const d of raw.devices) {
    if (d.platform !== "TFLN" || !d.telecom || !d.year) continue;
    const p = papers.get(d.paper_id);
    const base = { t: d.year + 0.5, src: "atlas" as const, who: p ? `${p.first_author ?? ""} ${p.year}`.trim() : d.paper_id, note: p?.title ?? "", doi: p?.doi, url: p?.doi ? undefined : p?.url, st: "reported" as const };
    if (d.vpil_best) pts.push({ ...base, k: "vpil", v: d.vpil_best });
    if (d.bw3db_ghz) pts.push({ ...base, k: "bw", v: d.bw3db_ghz, gt: (d.qualifiers ?? "").includes("bw3db_ghz:gt") });
  }
  return { pts, atlas: { repo: raw.source.repo, sha: raw.source.sha.slice(0, 7), date: raw.source.commit_date } };
}
