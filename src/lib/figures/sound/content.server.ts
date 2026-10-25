// Chapter 03 (Sound) build-time content: references and glossary from content/chapters/03-sound/{refs,glossary}.yaml,
// turned into popup entries and per-section reference lists. Server only (prerender); pages receive plain data.
import { rawContent } from "$lib/content/loader";
import type { Pop } from "$lib/content/pops";
import GLOSSARY_MAP from "$lib/generated/glossary-map.json";

/** Chapter terms merged into the site glossary (pages address them as "g:<id>"); their "sg:" entries are not shipped. */
const MERGED = new Set(GLOSSARY_MAP.filter((e) => e.chapter === "03-sound" && e.page_key).map((e) => e.page_key as string));

type Val = string | string[];
type Rec = Record<string, Val>;

/** Minimal parser for the flat YAML lists used by the chapter files: "- key: value" opens an item, "  key: value"
 *  continues it; values are plain, double-quoted, or inline arrays. Comments (#) at line start are skipped. */
function parseList(text: string): Rec[] {
  const out: Rec[] = [];
  let cur: Rec | null = null;
  const scalar = (s: string): string => {
    s = s.trim();
    if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1).replace(/\\"/g, '"');
    return s === "null" || s === "~" ? "" : s;
  };
  const value = (s: string): Val => {
    s = s.trim();
    if (s.startsWith("[") && s.endsWith("]")) {
      const body = s.slice(1, -1);
      const items: string[] = [];
      let buf = "", q = false;
      for (const ch of body) {
        if (ch === '"') q = !q;
        if (ch === "," && !q) { items.push(scalar(buf)); buf = ""; } else buf += ch;
      }
      if (buf.trim()) items.push(scalar(buf));
      return items;
    }
    return scalar(s);
  };
  for (const line of text.split("\n")) {
    if (/^\s*#/.test(line) || !line.trim()) continue;
    const m = /^(- |  )([a-z_]+):\s?(.*)$/.exec(line);
    if (!m) continue;
    if (m[1] === "- ") { cur = {}; out.push(cur); }
    if (cur) cur[m[2]] = value(m[3]);
  }
  return out;
}

export interface Ref {
  id: string;
  short: string;
  cite: string;
  title: string;
  doi?: string;
  url?: string;
  license?: string;
  type: string;
}

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const str = (v: Val | undefined): string => (Array.isArray(v) ? v.join(", ") : (v ?? ""));
const CORP = /\b(Co\.|Ltd\.?|SA|Inc\.?|OJSC|IEEE)\b/;
/** Family name of a person ("J. Kushibiki" -> "Kushibiki", "Lord Rayleigh" -> "Rayleigh"); corporate authors keep their
 *  name without legal suffixes ("Sumitomo Metal Mining Co., Ltd." -> "Sumitomo Metal Mining"). */
function family(a: string): string {
  const t = a.trim();
  if (CORP.test(t)) return t.replace(/^OJSC\s+/, "").replace(/,?\s*(Co\.,?\s*)?(Ltd\.?|SA|Inc\.?)\s*$/, "").replace(/\s+Co\.?$/, "").trim();
  const cut = t.replace(/\s*\(.*\)\s*$/, "");
  return cut.split(/\s+/).pop() ?? cut;
}
const persons = (r: Rec): string[] => (Array.isArray(r.authors) ? r.authors : r.authors ? [r.authors as string] : []).filter((a) => !/^et al/.test(a.trim()));
/** Author-year short form: "Kushibiki et al. 1999", "Weis & Gaylord 1985", "Sumitomo Metal Mining". */
function shortOf(r: Rec): string {
  const fam = persons(r).map(family);
  const etal = (Array.isArray(r.authors) ? r.authors : []).some((a) => /^et al/.test(a.trim()));
  const yr = str(r.issued).slice(0, 4);
  const who = fam.length >= 3 || (etal && fam.length) ? `${fam[0]} et al.` : fam.join(" & ");
  return [who || str(r.container) || str(r.title), r.type === "webpage" && !str(r.issued) ? "" : yr].filter(Boolean).join(" ");
}

function citeOf(r: Rec): string {
  const fam = persons(r).map(family);
  const who = fam.length > 3 ? `${fam[0]} et al.` : fam.length ? fam.slice(0, -1).join(", ") + (fam.length > 1 ? " & " : "") + fam[fam.length - 1] : "";
  const where = [str(r.container), str(r.volume), str(r.pages)].filter(Boolean).join(" ");
  const yr = str(r.issued).slice(0, 4);
  return [who, where].filter(Boolean).join(", ") + (yr ? ` (${yr})` : "");
}

let cache: { refs: Map<string, Ref>; gloss: Rec[] } | null = null;
async function load(): Promise<{ refs: Map<string, Ref>; gloss: Rec[] }> {
  if (cache) return cache;
  const [rt, gt] = await Promise.all([rawContent("/content/chapters/03-sound/refs.yaml"), rawContent("/content/chapters/03-sound/glossary.yaml")]);
  const refs = new Map<string, Ref>();
  for (const r of parseList(rt)) {
    const id = str(r.id);
    if (!id) continue;
    refs.set(id, { id, short: shortOf(r), cite: citeOf(r) || str(r.title), title: str(r.title), doi: str(r.doi) || undefined, url: str(r.url) || undefined, license: str(r.license) || undefined, type: str(r.type) });
  }
  cache = { refs, gloss: parseList(gt) };
  return cache;
}

const link = (r: Ref): string => (r.doi ? `<a href="https://doi.org/${esc(r.doi)}">doi:${esc(r.doi)}</a>` : r.url ? `<a href="${esc(r.url)}">${esc(r.url.replace(/^https?:\/\//, ""))}</a>` : "");

/** Glossary key for a chapter term: "sg:" + slug of the term. */
export const glossKey = (term: string): string => "sg:" + term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Popup entries: "r:<id>" for every reference, "sg:<slug>" for every chapter glossary term. */
export async function chapterPops(): Promise<Record<string, Pop>> {
  const { refs, gloss } = await load();
  const pops: Record<string, Pop> = {};
  for (const r of refs.values()) {
    if (r.type === "research-note" || r.type === "computation") continue;
    pops[`r:${r.id}`] = { h: esc(r.short), body: esc(r.title), src: `${esc(r.cite)}${link(r) ? ", " + link(r) : ""}` };
  }
  for (const g of gloss) {
    const term = str(g.term);
    if (!term) continue;
    const ids = Array.isArray(g.refs) ? g.refs : [];
    pops[glossKey(term)] = {
      h: esc(term),
      body: esc(str(g.short)) + (g.long ? `<br><br>${esc(str(g.long))}` : ""),
      src: ids.map((id) => { const r = refs.get(id); return r ? `${esc(r.cite)}${r.doi ? ", " + link(r) : ""}` : esc(id); }).join("; ") || undefined,
    };
  }
  return pops;
}

import type { RefRow } from "./types";
export type { RefRow };

/** Reference list rows for a section, in the given order. Unknown ids throw (content drift is a build error). */
export async function refRows(ids: string[]): Promise<RefRow[]> {
  const { refs } = await load();
  return ids.map((id) => {
    const r = refs.get(id);
    if (!r) throw new Error(`sound: unknown reference id ${id}`);
    if (r.type === "research-note" || r.type === "computation") throw new Error(`sound: ${id} is not a citable source`);
    return {
      id, short: r.short, cite: r.cite, title: r.title,
      href: r.doi ? `https://doi.org/${r.doi}` : r.url,
      label: r.doi ? `doi:${r.doi}` : r.url?.replace(/^https?:\/\//, ""),
    };
  });
}

/** Page data for a section: popup entries for the listed references (plus `extra` ids used only in badges) and every
 *  chapter glossary term, and the reference rows in list order. */
export async function sectionData(refIds: string[], extra: string[] = []): Promise<{ pops: Record<string, Pop>; refs: RefRow[] }> {
  const all = await chapterPops();
  const keep = new Set([...refIds, ...extra].map((id) => `r:${id}`));
  const pops: Record<string, Pop> = {};
  for (const [k, v] of Object.entries(all)) if ((k.startsWith("sg:") && !MERGED.has(k)) || keep.has(k)) pops[k] = v;
  return { pops, refs: await refRows(refIds) };
}
