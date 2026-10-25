// Chapter 02 (Light) build-time content: references (content/chapters/02-light/refs.yaml) and glossary terms
// (glossary.yaml) turned into page-local popups and per-section reference lists. Server only (+page.server.ts loads).
// The YAML files are flat lists of `- id:` records with scalar, quoted or JSON-array values; a line parser is enough
// (no YAML dependency in the project).
import { rawContent } from "$lib/content/loader";
import type { Pop } from "$lib/content/pops";
import type { RefEntry } from "./types";
export type { RefEntry };

type Rec = Record<string, string | string[]>;

function unquote(v: string): string {
  v = v.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1).replace(/\\"/g, '"');
  return v;
}
/** Strip a trailing `# comment` outside quotes and brackets. */
function stripComment(v: string): string {
  let q: string | null = null, depth = 0;
  for (let i = 0; i < v.length; i++) {
    const c = v[i];
    if (q) { if (c === q && v[i - 1] !== "\\") q = null; continue; }
    if (c === '"' || c === "'") q = c;
    else if (c === "[") depth++;
    else if (c === "]") depth--;
    else if (c === "#" && depth === 0 && (i === 0 || v[i - 1] === " ")) return v.slice(0, i).trimEnd();
  }
  return v;
}
function parseValue(v: string): string | string[] {
  v = stripComment(v).trim();
  if (v.startsWith("[") && v.endsWith("]")) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    const out: string[] = [];
    let cur = "", q: string | null = null;
    for (const c of inner) {
      if (q) { if (c === q) q = null; else cur += c; continue; }
      if (c === '"' || c === "'") { q = c; continue; }
      if (c === ",") { out.push(cur.trim()); cur = ""; continue; }
      cur += c;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  return unquote(v);
}
export function parseFlatYamlList(text: string): Rec[] {
  const out: Rec[] = [];
  let cur: Rec | null = null;
  for (const raw of text.split("\n")) {
    if (!raw.trim() || raw.trimStart().startsWith("#")) continue;
    const m0 = raw.match(/^- ([a-z_]+):\s*(.*)$/);
    if (m0) { cur = { [m0[1]]: parseValue(m0[2]) }; out.push(cur); continue; }
    const m = raw.match(/^ {2}([a-z_]+):\s*(.*)$/);
    if (m && cur) cur[m[1]] = parseValue(m[2]);
  }
  return out;
}

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const str = (r: Rec, k: string): string => { const v = r[k]; const t = Array.isArray(v) ? v.join(", ") : (v ?? ""); return t === "null" || t === "~" ? "" : t; };


function family(a: string): string {
  const s = a.trim();
  if (s === "et al.") return s;
  const parts = s.split(/\s+/);
  return parts.length > 3 ? s : parts[parts.length - 1]; // organizations keep their full name
}
/** How far a source was read, without internal note ids or process words (pages show the reading depth only). */
function cleanRead(t: string): string {
  const parts = t.replace(/\s+by R\d\d\b/g, "").replace(/\([^)]*\b(R\d\d|lane|subagent|coordinator|audit)\b[^)]*\)/gi, "").split(";").map((x) => x.trim())
    .filter((x) => x && !/\b(R\d\d|lane|subagents?|coordinator|audited|evidence file|project)\b/i.test(x));
  return parts.join("; ").replace(/\s*\([^)]*\/[^)]*\)/g, "").replace(/\bweis1985\b/g, "Weis & Gaylord 1985").replace(/\bschwesyg2011\b/g, "Schwesyg 2011").replace(/\s+/g, " ").trim() || "not stated";
}
function refEntry(r: Rec): RefEntry {
  const id = str(r, "id");
  const authors = (Array.isArray(r.authors) ? r.authors : r.authors ? [r.authors] : []).filter(Boolean);
  const fam = authors.filter((a) => a !== "et al.").map(family);
  const year = str(r, "volume_year") || (str(r, "issued") || "").slice(0, 4);
  const who = fam.length > 2 || authors.includes("et al.") ? `${fam[0]} et al.` : fam.join(" & ");
  const title = str(r, "title");
  const cite = who ? `${who}${year ? ` ${year}` : ""}` : title || id;
  const where = [str(r, "container"), str(r, "volume"), str(r, "pages") || str(r, "article")].filter(Boolean).join(" ") + (year ? ` (${year})` : "");
  const doi = str(r, "doi") || undefined;
  const url = str(r, "url") || undefined;
  return { id, cite, title, where, doi, url: url && /^https?:/.test(url) ? url : undefined, read: cleanRead(str(r, "content_read")), year };
}

export interface TermEntry { id: string; term: string; short: string; def: string; symbol?: string; unit?: string; src?: string }

let REFS: Map<string, RefEntry> | null = null;
let TERMS: Map<string, TermEntry> | null = null;
async function load(): Promise<void> {
  if (REFS && TERMS) return;
  const [rt, gt] = await Promise.all([rawContent("/content/chapters/02-light/refs.yaml"), rawContent("/content/chapters/02-light/glossary.yaml")]);
  REFS = new Map(parseFlatYamlList(rt).filter((r) => r.id).map((r) => [str(r, "id"), refEntry(r)]));
  TERMS = new Map(parseFlatYamlList(gt).filter((r) => r.id).map((r) => [str(r, "id"), {
    id: str(r, "id"), term: str(r, "term"), short: str(r, "short"), def: str(r, "def"),
    symbol: str(r, "symbol") || undefined, unit: str(r, "unit") || undefined, src: str(r, "src") || undefined,
  }]));
}

const doiLink = (d: string): string => `<a href='https://doi.org/${esc(d)}'>doi:${esc(d)}</a>`;

/** Popup for reference id: citation, title, venue, how far the content was read, DOI link. */
function refPop(e: RefEntry): Pop {
  return {
    h: esc(e.cite),
    body: `${esc([e.title, e.where].filter(Boolean).join(". "))}.<br><span class='dim'>Read: ${esc(e.read)}</span>`,
    src: e.doi ? doiLink(e.doi) : e.url ? `<a href='${esc(e.url)}'>${esc(e.url)}</a>` : undefined,
  };
}
function termPop(t: TermEntry): Pop {
  const R = REFS as Map<string, RefEntry>;
  const s = t.src ? R.get(t.src) : undefined;
  return {
    h: esc(t.term) + (t.symbol ? ` <span class='v'>${esc(t.symbol)}</span>` : ""),
    body: `${esc(t.def)}${t.unit ? ` <span class='dim'>Unit: ${esc(t.unit)}.</span>` : ""}`,
    src: s ? `${esc(s.cite)}${s.doi ? `, ${doiLink(s.doi)}` : ""}` : undefined,
  };
}

/** Keys used in a source text: data-pop / pop="r:<ref id>" and "gl:<term id>" (also inside generated strings). */
export function scanKeys(...sources: string[]): { refs: string[]; terms: string[] } {
  const refs = new Set<string>(), terms = new Set<string>();
  for (const s of sources) {
    for (const m of s.matchAll(/["'(\s]r:([A-Za-z0-9-]+)/g)) refs.add(m[1]);
    for (const m of s.matchAll(/["'(\s]gl:([A-Za-z0-9-]+)/g)) terms.add(m[1]);
  }
  return { refs: [...refs], terms: [...terms] };
}

export interface LightContent {
  pops: Record<string, Pop>;
  /** Reference list for the section (sorted by citation), ids and DOIs. */
  refList: RefEntry[];
  /** Keys used but absent from refs.yaml / glossary.yaml (should be empty; reported by the lane spec). */
  missing: string[];
}

/** Build popups and the reference list for the given page sources (raw text of the page and its figure modules)
 *  plus explicit extra keys. */
export async function lightContent(sources: string[], extra: { refs?: string[]; terms?: string[] } = {}): Promise<LightContent> {
  await load();
  const R = REFS as Map<string, RefEntry>, T = TERMS as Map<string, TermEntry>;
  const k = scanKeys(...sources);
  const refIds = [...new Set([...k.refs, ...(extra.refs ?? [])])];
  const termIds = [...new Set([...k.terms, ...(extra.terms ?? [])])];
  const pops: Record<string, Pop> = {};
  const missing: string[] = [];
  const refList: RefEntry[] = [];
  for (const id of refIds) { const e = R.get(id); if (e) { pops[`r:${id}`] = refPop(e); if (!/^R\d\d$/.test(id)) refList.push(e); } else missing.push(`r:${id}`); }
  for (const id of termIds) { const t = T.get(id); if (t) pops[`gl:${id}`] = termPop(t); else missing.push(`gl:${id}`); }
  refList.sort((a, b) => a.cite.localeCompare(b.cite));
  if (missing.length) throw new Error(`chapter 02: popup keys without a refs.yaml / glossary.yaml entry: ${missing.join(", ")}`);
  return { pops, refList, missing };
}

/** Reference entry by id (for tables that print the citation). */
export async function refById(id: string): Promise<RefEntry | undefined> { await load(); return (REFS as Map<string, RefEntry>).get(id); }
