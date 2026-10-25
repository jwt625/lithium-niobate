// Chapter-05 provenance at build time: refs.yaml records, research-note row ids (R02, R05..R14), and the source tags of
// the manuscript ("[key loc, key2; status qualifier]") turned into badge markup plus popup entries. Server only (reads
// content/ and research/ as raw text); the page receives the finished HTML strings and the popup records it uses.
import { rawContent } from "$lib/content/loader";
import type { Pop } from "$lib/content/pops";
import type { StatusCode } from "$lib/content/site";
import { parseYaml, type YamlValue } from "./yaml";

export interface RefRec { id: string; doi?: string; url?: string; title?: string; authors?: string; venue?: string; volume?: string; pages?: string; issued?: string; read?: string; note?: string }

/** Blog posts (outside5sigma.com) behind the R02 row ids used in the manuscript: [label, path]. OFS-N rows map to
 *  /ofs/weekly-OFS-N/. Research-note ids themselves are never printed. */
const BLOG: Record<string, [string, string]> = {
  A1: ["LN properties notes (2018)", "/tutorial/ln-properties/"],
  A11: ["a-Si hard mask pattern test on LN (2018-08-20)", "/research/lnnb17-fab-si-hardmask-pattern-test-180820/"],
  B1: ["notes on e-beam lithography (2024-10-13)", "/tutorial/yapping-on-ebeam-lithography/"],
};
const blogRow = (row: string): [string, string] | null => {
  const o = /^OFS-(\d+)$/.exec(row);
  if (o) return [`OFS weekly #${o[1]}`, `/ofs/weekly-OFS-${o[1]}/`];
  return BLOG[row] ?? null;
};

const R09_ROWS = import.meta.glob<string>("/research/R09-*.md", { query: "?raw", import: "default", eager: true });

/** R09 source list (section 10): id -> [publisher and date, url, grade]. */
function r09Sources(): Map<string, [string, string, string]> {
  const m = new Map<string, [string, string, string]>();
  const txt = Object.values(R09_ROWS)[0] ?? "";
  for (const line of txt.split("\n")) {
    const c = /^\| (S\d+) \| (.+?) \| (https?:\/\/\S+)(?: ; \S+)? \| ([A-Z/]+) \|$/.exec(line.trim());
    if (c) m.set(c[1], [c[2], c[3], c[4]]);
  }
  return m;
}

/** Escape for HTML once: entities already present in Crossref titles are decoded first. */
export const esc = (s: string): string => s.replace(/&amp;/g, "&").replace(/&ndash;/g, "–").replace(/&mdash;/g, "—").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Short author list: "A", "A & B", "A et al.". */
function who(authors?: string): string {
  if (!authors) return "";
  if (/Inc\.|Ltd|Corp|\(ed\.\)/.test(authors) && !/,\s*[A-Z][a-z]+,/.test(authors.replace(/, Inc\./, ""))) return authors.replace(/ \(ed\.\)/, "");
  const n = authors.split(/,\s*/).filter(Boolean).map((a) => (a === a.toUpperCase() ? a[0] + a.slice(1).toLowerCase() : a));
  return n.length > 2 ? `${n[0]} et al.` : n.join(" & ");
}

export interface SourceIndex {
  refs: Map<string, RefRec>;
  r09: Map<string, [string, string, string]>;
  isKey: (k: string) => boolean;
  /** True when the key resolves to a primary citation that may be shown. */
  resolvable: (k: string) => boolean;
  /** Citation line (HTML) for a key with optional locator. */
  cite: (key: string, loc?: string) => string;
  /** Short label (author year) for a key. */
  short: (key: string) => string;
}

let cached: SourceIndex | null = null;
export async function sourceIndex(): Promise<SourceIndex> {
  if (cached) return cached;
  const y = parseYaml(await rawContent("/content/chapters/05-making/refs.yaml")) as { refs: YamlValue[] };
  const refs = new Map<string, RefRec>();
  for (const r of y.refs as Record<string, YamlValue>[]) {
    const rec: RefRec = { id: String(r.id) };
    for (const k of ["doi", "url", "title", "authors", "venue", "volume", "pages", "issued", "read", "note"] as const) if (r[k] != null) rec[k] = String(r[k]);
    refs.set(rec.id, rec);
  }
  const r09 = r09Sources();
  const resolvable = (k: string): boolean => {
    if (refs.has(k)) return true;
    const m = /^(R\d\d):(\S+)$/.exec(k);
    if (!m) return false;
    if (m[1] === "R09") return r09.has(m[2]);
    if (m[1] === "R02") return blogRow(m[2]) !== null;
    return false;
  };
  const isKey = (k: string): boolean => refs.has(k) || /^R\d\d(?::\S+)?$/.test(k);
  const short = (key: string): string => {
    const r = refs.get(key);
    if (r) return `${who(r.authors) || r.title || key} ${r.issued?.slice(0, 4) ?? ""}`.trim();
    const m = /^(R\d\d):(\S+)$/.exec(key);
    if (m && m[1] === "R09" && r09.has(m[2])) return (r09.get(m[2]) as [string, string, string])[0].split(/,|\(/)[0].trim();
    if (m && m[1] === "R02" && blogRow(m[2])) return "outside5sigma.com";
    return idLabel(key);
  };
  const cite = (key: string, loc?: string): string => {
    const r = refs.get(key);
    const lc = loc ? loc.replace(/\s*\(?via R\d\d[^,;)]*\)?/g, "").replace(/\s*\(R\d\d[^)]*\)/g, "").trim() : "";
    const L = lc ? `, ${esc(lc)}` : "";
    if (r) {
      const where = [r.venue, r.volume, r.pages].filter(Boolean).join(" ");
      const link = r.doi ? ` <a href="https://doi.org/${esc(r.doi)}">doi:${esc(r.doi)}</a>` : r.url ? ` <a href="${esc(r.url)}">${esc(r.url.replace(/^https?:\/\//, ""))}</a>` : "";
      return `${esc(who(r.authors))}${r.title ? `, <i>${esc(r.title)}</i>` : ""}${where ? `, ${esc(where)}` : ""}${r.issued ? ` (${esc(r.issued.slice(0, 4))})` : ""}${L}.${link}`;
    }
    const m = /^(R\d\d):(\S+)$/.exec(key);
    if (m && m[1] === "R09" && r09.has(m[2])) {
      const [pub, url] = r09.get(m[2]) as [string, string, string];
      return `${esc(pub)}${L}. <a href="${esc(url)}">${esc(url.replace(/^https?:\/\//, "").slice(0, 64))}</a>`;
    }
    if (m && m[1] === "R02" && blogRow(m[2])) {
      const [label, path] = blogRow(m[2]) as [string, string];
      return `Author's blog, outside5sigma.com: ${esc(label)}${L}. <a href="https://outside5sigma.com${esc(path)}">outside5sigma.com${esc(path)}</a>`;
    }
    // id-like key without a refs.yaml record: cited through the research note named in the locator ("via R08:3.3")
    return `${esc(idLabel(key))}${L ? L : ""}; bibliographic record not held in this chapter's reference list.`;
  };
  cached = { refs, r09, isKey, resolvable, cite, short };
  return cached;
}

// ---------- status vocabulary ----------
export interface StatusInfo { cls: string; text: string; def: string; code: StatusCode }
const DEF: Record<string, [cls: string, def: string, code: StatusCode]> = {
  P: ["p", "value read in the primary document at the locator", "P"],
  "P(abs)": ["p", "value read in the primary abstract only", "P"],
  "P(title)": ["p", "only the title and metadata of the primary document were checked", "P"],
  "P-comp": ["pc", "read in a compilation that cites the original; original not read", "P-comp"],
  "P-db": ["pc", "database transcription of a primary source", "P-db"],
  S: ["s", "secondary: a review or research note quoting the original", "S"],
  V: ["v", "vendor statement about its own product", "V"],
  F: ["p", "primary first-party source, opened and read (government data, filing, press release, product page)", "P"],
  T: ["s", "trade press, opened and read", "S"],
  C: ["s", "seen only as a search snippet; page not opened", "S"],
  LG: ["u", "low grade: direction only, never a headline number", "U"],
  E: ["d", "estimate; assumptions stated in the research note", "derived"],
  U: ["u", "unverified: claimed value and claimed source listed; not shown as fact", "U"],
  derived: ["d", "computed from the tagged inputs", "derived"],
  template: ["t", "illustrative value without a source", "template"],
  reported: ["r", "as reported by the authors", "reported"],
};

/** Map a manuscript status string ("P (arXiv)", "P, LT analog", "V/S", "Y company page", "U until re-read") to a badge. */
export function statusInfo(raw: string): StatusInfo & { qual: string } {
  let s = raw.trim();
  let qual = "";
  // R08 verification grade Y: the number appears in the published abstract or official page
  if (/^Y\b/.test(s)) { qual = s.slice(1).trim(); s = /company|page/.test(qual) ? "F" : "P(abs)"; qual = qual ? `${qual}; DOI and abstract or page checked (R08)` : "DOI and abstract checked (R08)"; }
  const m = /^(P-comp|P-db|P\s?\((?:abs|title)\)|P|S|V|F|T|C|LG|E|U|derived|template|reported)((?:\/(?:P|S|V|F|T|C))*)(.*)$/.exec(s);
  if (!m) return { cls: "s", text: s, def: "status as given in the source note", code: "S", qual: "" };
  const base = m[1].replace(/\s/g, "");
  const d = DEF[base] ?? DEF.S;
  const combo = m[2] ? base + m[2] : base;
  let rest = m[3].trim().replace(/^[,;]\s*/, "");
  if (/^\(arXiv\)/.test(rest)) rest = "arXiv version read" + rest.slice(7);
  qual = [rest, qual].filter(Boolean).join("; ");
  let def = d[1];
  if (m[2]) def = combo.split("/").map((c) => `${c}: ${(DEF[c] ?? DEF.S)[1]}`).join("; ");
  return { cls: d[0], text: combo, def, code: d[2], qual };
}

// ---------- tags -> badges ----------
export interface TagRef { key: string; loc: string }
export interface Tag { refs: TagRef[]; status: string | null }

/** Id-like key not held in refs.yaml ("holzgrafe2024" cited via a research note): label "Holzgrafe 2024". */
const ID_LIKE = /^([a-z]+)_?([a-z]*?)(\d{4})[a-z]*$/;
export const idLabel = (k: string): string => { const m = ID_LIKE.exec(k); return m ? `${m[1][0].toUpperCase()}${m[1].slice(1)} ${m[3]}` : k; };

/** Parse the inside of "[...]" into keys with locators and a status; null when it is not a source tag. */
export function parseTag(inner: string, idx: SourceIndex): Tag | null {
  const semi = inner.indexOf(";");
  const keysPart = semi >= 0 ? inner.slice(0, semi) : inner;
  const status = semi >= 0 ? inner.slice(semi + 1).trim() : null;
  const pieces = keysPart.split(/,\s*/);
  const refs: TagRef[] = [];
  for (const piece of pieces) {
    const p = piece.trim();
    const k = /^(\S+?)(?:\s+(.*))?$/.exec(p);
    const key = k?.[1] ?? "";
    if (key && (idx.isKey(key) || ID_LIKE.test(key))) refs.push({ key, loc: k?.[2]?.trim() ?? "" });
    else if (refs.length) refs[refs.length - 1].loc += (refs[refs.length - 1].loc ? ", " : "") + p;
    else return null;
  }
  return refs.length ? { refs, status } : null;
}

/** Collects popups and status codes used by one page. */
export class PopBook {
  pops: Record<string, Pop> = {};
  codes = new Set<StatusCode>();
  private n = 0;
  extra = 0;
  private seen = new Map<string, string>();
  readonly idx: SourceIndex;
  readonly prefix: string;
  constructor(idx: SourceIndex, prefix = "mk") { this.idx = idx; this.prefix = prefix; }

  /** Badge (or plain reference marker when the tag has no status) for a parsed tag. */
  tag(t0: Tag): string {
    // research-note rows without a primary citation are never shown (the tag disappears)
    const t: Tag = { ...t0, refs: t0.refs.filter((r) => this.idx.resolvable(r.key)) };
    if (!t.refs.length) return "";
    const sig = JSON.stringify(t);
    let key = this.seen.get(sig);
    const st = t.status ? statusInfo(t.status) : null;
    if (!key) {
      key = `${this.prefix}:${++this.n}`;
      this.seen.set(sig, key);
      const lines = t.refs.map((r) => this.idx.cite(r.key, r.loc));
      const h = t.refs.map((r) => esc(this.idx.short(r.key))).join("; ");
      const qual = st?.qual ? this.keysToNames(st.qual) : "";
      const body = st ? `<span class="v">${esc(st.text)}</span>: ${esc(st.def)}${qual ? `. ${esc(qual)}` : ""}.` : undefined;
      this.pops[key] = { h, body, src: lines.join("<br>") };
    }
    if (!st) return `<span class="ref" data-pop="${key}">${esc(t.refs.map((r) => this.idx.short(r.key)).join("; "))}</span>`;
    this.codes.add(st.code);
    return `<span class="b ${st.cls}" data-pop="${key}">${esc(st.text)}</span>`;
  }

  /** Replace citation keys inside free text with author-year names. */
  keysToNames(text: string): string {
    return text.replace(/\b([a-z]+_?[a-z]*\d{4}[a-z]*)\b/g, (k) => (this.idx.refs.has(k) ? this.idx.short(k) : k));
  }

  /** Register a popup under an explicit key (figure readouts, process parameters). */
  put(key: string, p: Pop): string { this.pops[key] = p; return key; }
  code(c: StatusCode): void { this.codes.add(c); }
}
