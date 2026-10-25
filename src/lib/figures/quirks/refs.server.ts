// Chapter 04 references and glossary, read from content/chapters/04-quirks/{refs,glossary}.yaml at prerender time.
// The YAML files use a flat subset (list of maps; scalar, double-quoted, or inline-array values; one nested list that is
// skipped), parsed here without a dependency. Pages receive only the entries they list.
// Practitioner notes (type practitioner-note) are cited neutrally: kind and date only, no author, title, or link
// (author questions 6-7 in DevLog-004a are open).
import { rawContent } from "$lib/content/loader";
import type { Pop } from "$lib/content/pops";
import GLOSSARY_MAP from "$lib/generated/glossary-map.json";

/** Chapter terms merged into the site glossary (pages address them as "g:<id>"); their "q:" entries are not shipped. */
const MERGED = new Set(GLOSSARY_MAP.filter((e) => e.chapter === "04-quirks" && e.page_key).map((e) => e.page_key as string));

export interface Ref {
  id: string; type?: string; authors?: string[]; title?: string; container?: string; volume?: string; pages?: string;
  issued?: string; doi?: string | null; arxiv?: string; content_read?: string;
}
export interface RefLine { id: string; short: string; html: string; read: string }
export interface Gloss { term: string; abbr?: string; definition: string; source?: string }

function scalar(v: string): unknown {
  const s = v.trim();
  if (s === "" || s === "null" || s === "~") return null;
  if (s.startsWith('"') || s.startsWith("[")) { try { return JSON.parse(s); } catch { return s; } }
  return s;
}
/** Parse "- key: value" list entries; `startKey` begins a new entry. Nested (deeper) lines are ignored. */
function parseList(text: string, startKey: string): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  let cur: Record<string, unknown> | null = null;
  for (const line of text.split("\n")) {
    if (/^\s*#/.test(line) || !line.trim()) continue;
    const m0 = line.match(new RegExp(`^- ${startKey}: (.*)$`));
    if (m0) { cur = { [startKey]: scalar(m0[1]) }; out.push(cur); continue; }
    const m1 = line.match(/^ {2}([a-z_]+): ?(.*)$/);
    if (m1 && cur) cur[m1[1]] = scalar(m1[2]);
  }
  return out;
}

let cache: { refs: Map<string, Ref>; gloss: Gloss[] } | null = null;
async function load(): Promise<{ refs: Map<string, Ref>; gloss: Gloss[] }> {
  if (cache) return cache;
  const [r, g] = await Promise.all([rawContent("/content/chapters/04-quirks/refs.yaml"), rawContent("/content/chapters/04-quirks/glossary.yaml")]);
  const refs = new Map<string, Ref>();
  for (const e of parseList(r, "id")) {
    const ref = Object.fromEntries(Object.entries(e).map(([k, v]) => [k, typeof v === "number" ? String(v) : v])) as unknown as Ref;
    refs.set(ref.id, ref);
  }
  const gloss = parseList(g, "term") as unknown as Gloss[];
  cache = { refs, gloss };
  return cache;
}

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const PARTICLES = new Set(["al", "van", "von", "de", "der", "da", "di", "le", "la", "du"]);
/** Family name: last token, keeping particles ("Al Sayem", "van der Berg"); organisations keep their name minus "Inc.". */
const family = (a: string): string => {
  const p = a.trim().replace(/,?\s+(Inc\.|Ltd\.|LLC)$/, "").split(/\s+/);
  if (/Technology|Institute|IEEE|Company|Corporation/.test(a)) return p.join(" ");
  let i = p.length - 1;
  while (i > 1 && PARTICLES.has(p[i - 1].toLowerCase())) i--;
  return p.slice(i).join(" ");
};
const year = (r: Ref): string => (r.issued ?? "").slice(0, 4);
const isNote = (r: Ref): boolean => r.type === "practitioner-note";

/** Short label: "Volk & Wöhlecke 2009", "Bryan et al. 1984"; practitioner notes: "practitioner note 2025-12-29". */
export function shortCite(r: Ref): string {
  if (isNote(r)) return `practitioner note ${r.issued ?? ""}`;
  const a = r.authors ?? [];
  const who = a.length === 0 ? r.id : a.length === 1 ? family(a[0]) : a.length === 2 ? `${family(a[0])} & ${family(a[1])}` : `${family(a[0])} et al.`;
  return `${who} ${year(r)}`;
}
function link(r: Ref): string {
  if (r.doi) return `<a href="https://doi.org/${esc(r.doi)}">doi:${esc(r.doi)}</a>`;
  if (r.arxiv) return `<a href="https://arxiv.org/abs/${esc(r.arxiv)}">arXiv:${esc(r.arxiv)}</a>`;
  return "";
}
/** Full reference line (HTML). */
export function fullCite(r: Ref): string {
  if (isNote(r)) return `Practitioner note (public post), ${esc(r.issued ?? "")}.`;
  const a = r.authors ?? [];
  const who = a.length > 6 ? `${a.slice(0, 3).map(esc).join(", ")} et al.` : a.map(esc).join(", ");
  const where = [r.container, r.volume, r.pages].filter(Boolean).map((x) => esc(String(x))).join(" ");
  const l = link(r);
  return `${who}${who ? ", " : ""}${r.title ? `${esc(r.title)}. ` : ""}${where}${where ? " " : ""}(${esc(year(r))})${l ? `, ${l}` : ""}.`;
}
/** What was read of the source (limits the status its values may carry). */
const readLine = (r: Ref): string => (r.content_read ? `Read: ${esc(String(r.content_read))}` : "");

/** Pops (keys "r:<id>"), short labels, and the reference list for the given ids (order kept, unknown ids dropped). */
export async function refData(ids: string[]): Promise<{ pops: Record<string, Pop>; short: Record<string, string>; list: RefLine[] }> {
  const { refs } = await load();
  const pops: Record<string, Pop> = {};
  const short: Record<string, string> = {};
  const list: RefLine[] = [];
  for (const id of ids) {
    const r = refs.get(id);
    if (!r) continue;
    short[id] = shortCite(r);
    const l = link(r);
    pops[`r:${id}`] = isNote(r)
      ? { h: "Practitioner note", body: `Public post dated ${esc(r.issued ?? "")}; observations and fixes as recorded there. Not peer reviewed.` }
      : { h: esc(shortCite(r)), body: `${r.title ? esc(r.title) : ""}${r.container ? `. <i>${esc(r.container)}</i>` : ""}${r.volume ? ` ${esc(r.volume)}` : ""}${r.pages ? `, ${esc(r.pages)}` : ""}.`, src: [l, readLine(r)].filter(Boolean).join("<br>") };
    list.push({ id, short: shortCite(r), html: fullCite(r), read: isNote(r) ? "" : readLine(r) });
  }
  return { pops, short, list };
}

/** Chapter glossary pops (keys "q:<slug>"), for terms the generated site glossary lacks. */
export async function glossPops(): Promise<Record<string, Pop>> {
  const { gloss, refs } = await load();
  const out: Record<string, Pop> = {};
  for (const t of gloss) {
    if (!t.term || !t.definition) continue;
    const slug = t.term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (MERGED.has(`q:${slug}`)) continue;
    const r = t.source ? refs.get(t.source) : undefined;
    out[`q:${slug}`] = { h: esc(t.term) + (t.abbr ? ` <span class="v">${esc(t.abbr)}</span>` : ""), body: esc(t.definition), src: r && !isNote(r) ? fullCite(r) : undefined };
  }
  return out;
}
