// Chapter-05 manuscript (content/chapters/05-making/manuscript.md) -> page HTML at build time. Sections "## 5.n Title",
// depth layers "### L1|L2|L3"; blocks: paragraphs, pipe tables, "- " lists, one-line captions before tables (h3),
// reaction equations. Source tags "[key loc; status]" become badges with popups (sources.ts). Typography: SI units
// (um -> µm, deg -> °, C -> °C), superscripts (^n, e-notation), chemical subscripts, symbol subscripts. Process notes
// that address the content pipeline (open-question numbers, figure ids, lane names) are rewritten or dropped by the
// table EDITS below, so pages carry only facts, sources and operating instructions. Server only.
import { rawContent } from "$lib/content/loader";
import { PopBook, esc, parseTag, sourceIndex } from "./sources";
import { parseYaml } from "./yaml";
import GLOSSARY_MAP from "$lib/generated/glossary-map.json";

/** Exact rewrites of manuscript phrases that refer to the content pipeline instead of the subject. */
const EDITS: [RegExp | string, string][] = [
  [/ \(`open-questions\.md` Q\d+\)/g, ""],
  [/`open-questions\.md` Q\d+/g, "N/A"],
  [/ \(Q\d+\)/g, ""],
  [" in this pass", " as of 2026-10-25"],
  ["The F05-02 tool model uses template values for these and labels them.", "The growth figure draws them as labelled template values."],
  ["F05-02 shows the poling step with template values and a U badge on the procedure.", "The Process viewer draws boule poling with template values and a U badge on the procedure."],
  ["the site's cut explorer must take them from a vendor drawing per wafer, and F05-03 labels the default as template.", "each wafer's vendor drawing fixes them; the wafer-cut figure draws a template default."],
  ["Si handle CTE is not sourced in this lane.", "A sourced Si handle CTE is not held: N/A."],
  [" (F05-01 check P8)", " (Process viewer, step 9)"],
  ["Sidewall model used in F05-08", "Sidewall model used in the etch figure"],
  ["(C04)", "(chapter 04)"],
  ["(C06)", "(chapter 06)"],
  ["as recorded in the author's 2018 notes", "as recorded in a 2018 blog note"],
  ["as recorded in the author's notes", "as recorded in a blog note"],
  ["author's failure note:", "outside5sigma.com note:"],
  ["is the author's practice note", "is reported in the author's blog (outside5sigma.com)"],
  ["; author's notes", "; outside5sigma.com notes"],
  ["(author's audited asset)", "(3D asset specification)"],
];

const CHEM = /\b(Li2CO3|Nb2O5|LiNbO3|LiTaO3|Li2O|CO2|SiO2|Si3N4|H2O2|H2O|NH4OH|C3F8|CH4|N2|O2|Ag2O)\b/g;
const sub = (f: string): string => f.replace(/(\d+)/g, "<sub>$1</sub>");

/** Typography on HTML-escaped text (no tags inside). */
export function typo(s: string): string {
  let t = s;
  t = t.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "$1");
  t = t.replace(/ -&gt; /g, " → ").replace(/\+-/g, "±");
  t = t.replace(/(\d)\s?x\s?(10\^)/g, "$1 × $2");
  t = t.replace(/([\d)]|mm|um|nm|cm\^2) x (?=[\d(])/g, "$1 × ");
  t = t.replace(/\b(\d+(?:\.\d+)?)e(-?\d+)\b/g, (_m, a: string, b: string) => `${a} × 10^${b}`);
  t = t.replace(/(\d) ?u([mCWs])\b/g, "$1 µ$2").replace(/\bu(m|C)(\^|\/)/g, "µ$1$2").replace(/\/um\b/g, "/µm");
  t = t.replace(/(\d) ?deg\b/g, "$1°").replace(/\bdeg\b/g, "°");
  t = t.replace(/(\d) C(?![\w/])/g, "$1 °C");
  t = t.replace(/\^(-?[\d.]+)/g, (_m, e: string) => `<sup>${e.replace("-", "−")}</sup>`);
  t = t.replace(CHEM, (f) => sub(f));
  t = t.replace(/\bVpi(L?)\b/g, "V<sub>π</sub>$1");
  t = t.replace(/\b([rd])(\d\d)\b/g, "<i>$1</i><sub>$2</sub>");
  t = t.replace(/\b(T|E|P)(c|s)\b/g, "<i>$1</i><sub>$2</sub>");
  t = t.replace(/\b(alpha)_([a-z])\b/g, "α<sub>$2</sub>");
  t = t.replace(/\b([A-Za-z])_([A-Za-z0-9]{1,6})\b/g, "<i>$1</i><sub>$2</sub>");
  t = t.replace(/(\d) - (\d)/g, "$1 – $2");
  return t;
}

/** Inline markup: source tags -> badges, the rest escaped and typeset. */
export function inline(s: string, book: PopBook): string {
  const parts: string[] = [];
  let last = 0;
  const re = /\[([^[\]]+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const tag = parseTag(m[1], book.idx);
    if (!tag) continue;
    const pre = typo(esc(s.slice(last, m.index)).replace(/\s+$/, ""));
    parts.push(pre ? pre + " " : "");
    parts.push(book.tag(tag));
    last = m.index + m[0].length;
  }
  parts.push(typo(esc(s.slice(last))));
  return parts.join("").replace(/ (<span class="(?:b|ref) )/g, "&nbsp;$1");
}

function table(rows: string[], book: PopBook): string {
  const cells = (r: string): string[] => r.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
  const head = cells(rows[0]);
  const body = rows.slice(2).map(cells);
  const srcCol = head.findIndex((h) => /^Source/i.test(h));
  const th = head.map((h, i) => `<th${i === srcCol ? ' class="src"' : ""}>${inline(h, book)}</th>`).join("");
  const srcCell = (c: string): string => {
    const m = /^(derived|template)\b:?\s*(.*)$/.exec(c);
    if (!m) return inline(c, book);
    const rest = m[2].replace(/^\((.*)\)$/, "$1");
    const key = book.put(`${book.prefix}:w${++book.extra}`, { h: m[1] === "derived" ? "Derived value" : "Template value", body: `${m[1] === "derived" ? "Computed from tagged inputs" : "Illustrative value without a source"}${rest ? `: ${typo(esc(rest))}` : ""}.` });
    book.code(m[1] as "derived" | "template");
    return `<span class="b ${m[1] === "derived" ? "d" : "t"}" data-pop="${key}">${m[1]}</span>${rest ? " " + inline(rest, book) : ""}`;
  };
  const tb = body.map((r) => `<tr>${r.map((c, i) => `<td${i === srcCol ? ' class="src"' : i === 0 ? ' class="h"' : ""}>${i === srcCol ? srcCell(c) : inline(c, book)}</td>`).join("")}</tr>`).join("");
  return `<div class="scrollx"><table class="idx mk-t"><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></div>`;
}

/** Convert one depth layer's markdown to HTML blocks. */
export function blocks(md: string, book: PopBook): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const L = lines[i];
    if (!L.trim()) { i++; continue; }
    if (L.startsWith("> FIGURE") || L.startsWith("Door art") || L.startsWith("---")) { i++; continue; }
    if (L.trim().startsWith("|")) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(lines[i++]);
      out.push(table(rows, book));
      continue;
    }
    if (L.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || (lines[i].startsWith("  ") && lines[i].trim()))) {
        if (lines[i].startsWith("- ")) items.push(lines[i].slice(2)); else items[items.length - 1] += " " + lines[i].trim();
        i++;
      }
      out.push(`<ul class="mk-ul">${items.map((x) => `<li>${inline(x, book)}</li>`).join("")}</ul>`);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith("|") && !lines[i].startsWith("- ") && !lines[i].startsWith("> FIGURE")) para.push(lines[i++].trim());
    const text = para.join(" ");
    let j = i;
    while (j < lines.length && !lines[j].trim()) j++;
    const beforeTable = j < lines.length && lines[j].trim().startsWith("|");
    if (/ -> /.test(text) && /\b(Li2CO3|Nb2O5)\b/.test(text) && para.length === 1) out.push(`<div class="eq mk-eq"><span>${typo(esc(text))}</span></div>`);
    else if (beforeTable && para.length === 1 && !/[.:]$/.test(text)) out.push(`<h3 class="h3">${inline(text, book)}</h3>`);
    else out.push(`<p class="tx">${inline(text, book)}</p>`);
  }
  return out.join("\n");
}

/** Plain-text title with Unicode subscripts for chemical formulas (titles are rendered as text). */
export const chemTitle = (t: string): string => (new RegExp(CHEM.source).test(t) && t.includes(":") ? t.slice(0, t.indexOf(":")) : t);

// ---------- chapter glossary: first occurrence of a term on a page opens its definition ----------
/** Chapter terms merged into the site glossary: the term links to "g:<id>" and no page entry is written. A term merged
 *  into an existing entry (match "canonical" or "chapter") lost its chapter detail in the merge, so the page attaches the
 *  detail as a context line (data-pop-note); a "new" entry already carries it in its long text. */
const MERGED = new Map(GLOSSARY_MAP.filter((e) => e.chapter === "05-making" && e.page_key).map((e) => [e.page_key as string, { key: `g:${e.id}`, note: e.match !== "new" }] as const));
/** Detail text as shown on the page: pipeline references removed like in the manuscript. */
const cleanDetail = (d: string): string => {
  let t = d;
  for (const [a, b] of EDITS) t = typeof a === "string" ? t.split(a).join(b) : t.replace(a, b);
  return t.replace(/ \(open-questions(?:\.md)? Q\d+\)/g, "");
};
interface Term { key: string; local: string; re: RegExp; h: string; def: string; detail?: string; note: boolean }
type RawTerm = { term: string; abbr?: string; definition: string; detail?: string };
let rawTerms: RawTerm[] | null = null;
async function glossary(): Promise<Term[]> {
  if (!rawTerms) rawTerms = (parseYaml(await rawContent("/content/chapters/05-making/glossary.yaml")) as { terms: RawTerm[] }).terms;
  const out: Term[] = [];
  for (const t of rawTerms) {
    const base = t.term.replace(/\s*\(.*?\)\s*/g, "").split(/\s*\/\s*|,\s*/)[0].trim();
    if (!base || base === "Analog") continue;
    const local = "gl:" + base.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const merged = MERGED.get(local);
    const key = merged?.key ?? local;
    const alts = [base.replace(/deg/, "°")];
    if (t.abbr && /^[A-Z][A-Za-z0-9:-]{1,}$/.test(t.abbr)) alts.push(t.abbr);
    const pat = alts.map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const ci = !/^[A-Z0-9:-]+$/.test(base);
    out.push({ key, local, re: new RegExp(`(^|[^\\w-])(${pat})(?![\\w-])`, ci ? "i" : ""), h: esc(t.term), def: t.definition, detail: t.detail ? cleanDetail(t.detail) : undefined, note: !!merged?.note });
  }
  return out;
}

/** Wrap the first occurrence per page of each glossary term in text outside tags, badges, headings and table heads. */
function linkTerms(html: string, list: Term[], used: Set<string>, book: PopBook): string {
  const parts = html.split(/(<[^>]+>)/);
  let skip = 0;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p.startsWith("<")) {
      if (/^<(span|h3|th|a|sub|sup|i)\b/.test(p)) skip++;
      else if (/^<\/(span|h3|th|a|sub|sup|i)>/.test(p)) skip = Math.max(0, skip - 1);
      continue;
    }
    if (skip || !p.trim()) continue;
    let txt = p;
    for (const t of list) {
      if (used.has(t.local)) continue;
      const m = t.re.exec(txt);
      if (!m) continue;
      used.add(t.local);
      if (!t.key.startsWith("g:") && !book.pops[t.key]) book.put(t.key, { h: t.h, body: `${typo(esc(t.def))}${t.detail ? `<br>${inline(t.detail, book)}` : ""}` });
      const note = t.key.startsWith("g:") && t.note && t.detail ? ` data-pop-note="${book.put(`${t.local}:note`, { h: t.h, body: inline(t.detail, book).replace(/ +([.;,])(?=\s|$)/g, "$1") })}"` : ""; // space left by a dropped tag
      const at = m.index + m[1].length;
      txt = `${txt.slice(0, at)}<span class="term" data-pop="${t.key}"${note}>${m[2]}</span>${txt.slice(at + m[2].length)}`;
      break; // one term per text run keeps the scan simple; later runs pick up the rest
    }
    parts[i] = txt;
  }
  return parts.join("");
}

export interface SectionHTML { no: string; title: string; l1: string; l2: string; l3: string }

let manuscript: string | null = null;
async function text(): Promise<string> {
  if (manuscript === null) {
    let t = await rawContent("/content/chapters/05-making/manuscript.md");
    for (const [a, b] of EDITS) t = typeof a === "string" ? t.split(a).join(b) : t.replace(a, b);
    manuscript = t;
  }
  return manuscript;
}

/** Raw markdown of one section split by depth layer (L0 = text before any "### L"). */
export async function sectionRaw(no: string): Promise<{ title: string; L0: string; L1: string; L2: string; L3: string }> {
  const t = await text();
  const re = new RegExp(`^## ${no.replace(".", "\\.")} (.+)$`, "m");
  const m = re.exec(t);
  if (!m) throw new Error(`manuscript has no section ${no}`);
  const start = m.index + m[0].length;
  const next = t.slice(start).search(/^## \d/m);
  const body = next < 0 ? t.slice(start) : t.slice(start, start + next);
  const parts: Record<string, string> = { L0: "", L1: "", L2: "", L3: "" };
  let cur = "L0";
  for (const line of body.split("\n")) {
    const h = /^### (L[123])\s*$/.exec(line);
    if (h) { cur = h[1]; continue; }
    parts[cur] += line + "\n";
  }
  return { title: m[1].trim(), L0: parts.L0, L1: parts.L1, L2: parts.L2, L3: parts.L3 };
}

/** One section as HTML per depth layer, with its popups collected in `book`. */
export async function sectionHTML(no: string, book: PopBook): Promise<SectionHTML> {
  const r = await sectionRaw(no);
  const list = await glossary();
  const used = new Set<string>();
  const L = (md: string): string => linkTerms(blocks(md, book), list, used, book);
  return { no, title: chemTitle(r.title), l1: L(r.L1 || r.L0), l2: L(r.L2), l3: L(r.L3) };
}

/** New PopBook bound to the chapter source index. */
export async function newBook(prefix = "mk"): Promise<PopBook> {
  return new PopBook(await sourceIndex(), prefix);
}
