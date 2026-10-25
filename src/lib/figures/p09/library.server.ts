// Library data (build time): all chapter references (content/chapters/*/refs.yaml, several layouts) merged by DOI, each
// tagged with the chapters that cite it and the manuscript sections whose text names its id (topic filter).
import { rawContent, rawPaths } from "$lib/content/loader";
import { CHAPTERS } from "$lib/content/site";
import { parseYaml, type YNode } from "./yaml";
import { sectionMap } from "./sections.server";

export interface LibRef { k: string; t: string; a: string; y: string; v: string; d?: string; u?: string; ch: string[]; s: string[]; tc?: boolean; ac?: boolean }
export interface LibSec { no: string; ch: string; title: string; n: number }

type Obj = Record<string, YNode>;
const str = (x: YNode | undefined): string => (typeof x === "string" ? x : Array.isArray(x) ? x.filter((v) => typeof v === "string").join(", ") : "");
const ORG = /\b(Inc\.?|Ltd\.?|Co\.|Corp\.?|IEEE|IEC|ISO|Laborator|Universit|Committee|Society|Institute|Agency|Survey|Consulting|Magazine|Press|News|Group|Optica|Lightwave|TC \d+)\b|\d/;
function fam(n: string): string {
  const t = n.replace(/\(eds?\.\)/g, "").trim();
  if (ORG.test(t)) return t;
  if (/,/.test(t)) return t.split(",")[0].trim();
  return t.split(/\s+/).pop() ?? t;
}
function join(names: string[], etal: boolean): string {
  const f = names.map(fam).filter(Boolean);
  if (!f.length) return "";
  return etal || f.length > 2 ? `${f[0]} et al.` : f.join(" & ");
}
function authorsShort(e: Obj): string {
  let list: string[] = [];
  if (Array.isArray(e.authors)) list = e.authors.filter((v) => typeof v === "string") as string[];
  else if (typeof e.authors === "string") list = ORG.test(e.authors) ? [e.authors] : e.authors.split(/,\s*|;\s*|\s+and\s+/);
  let etal = list.some((n) => /\bet al\.?/.test(n));
  list = list.map((n) => n.replace(/\bet al\.?/, "").trim()).filter(Boolean);
  if (list.length) return join(list, etal);
  if (typeof e.first_author === "string") return Number(str(e.n_authors) || "1") > 1 ? `${fam(e.first_author)} et al.` : fam(e.first_author);
  const c = str(e.citation);
  if (c) {
    const before = c.includes('"') ? c.split(/[,]?\s*"/)[0] : c;
    const toks = before.split(/,\s*/);
    const names: string[] = [];
    for (const t of toks) { if (/^(?:[A-Z][a-z]?\.\s?-?)+\s*[A-Z][\w'-]+$/.test(t.trim()) || (c.includes('"') && t.trim())) names.push(t.trim()); else break; }
    etal = /et al/.test(before);
    if (names.length) return join(names, etal);
  }
  return str(e.publisher);
}
const PROC_PAREN = /\s*\((?:[^()]*\b(?:as cited|snippet|variants conflict|omitted here|empty;|title only)[^()]*)\)/gi;
function titleOf(e: Obj): string {
  if (str(e.title)) return str(e.title).replace(PROC_PAREN, "").trim();
  const c = str(e.citation);
  const q = /"([^"]+)"/.exec(c)?.[1];
  if (q) return q;
  // book-style citation "A. B, C. D, Title, Series (Publisher, Year)": drop the leading author tokens
  return c.split(/,\s*/).filter((t, i, a) => !(i < a.length - 1 && /^(?:[A-Z][a-z]?\.\s?-?)+\s*[A-Z][\w'-]+$/.test(t.trim()))).join(", ").replace(/\s*\([^()]*\d{4}\)\s*$/, "").trim();
}
const yearOf = (e: Obj): string => /\d{4}/.exec(str(e.issued) || str(e.year) || str(e.date))?.[0] ?? /\((\d{4})\)\s*$/.exec(str(e.citation))?.[1] ?? "";
const venueOf = (e: Obj): string => {
  const v = str(e.container) || str(e.venue) || str(e.container_title) || str(e.publisher);
  if (v) return [v, str(e.volume), str(e.pages)].filter(Boolean).join(" ");
  return /"\s*,\s*([^"]+?)\s*\(\d{4}\)\s*$/.exec(str(e.citation))?.[1] ?? "";
};
const normDoi = (d: string): string => d.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").replace(/^doi:/i, "").toLowerCase();

export async function library(): Promise<{ refs: LibRef[]; secs: LibSec[]; perCh: Record<string, number>; total: number }> {
  const merged = new Map<string, LibRef>();
  const secs: LibSec[] = [];
  const perCh: Record<string, number> = {};
  let total = 0;
  for (const c of CHAPTERS) {
    const base = rawPaths().find((p) => new RegExp(`^/content/chapters/${c.no}-[^/]+/refs\\.yaml$`).test(p));
    if (!base) continue;
    const y = parseYaml(await rawContent(base));
    const list = (Array.isArray(y) ? y : Object.values(y as Obj).filter(Array.isArray).flat()) as Obj[];
    const ms = await rawContent(base.replace("refs.yaml", "manuscript.md")).catch(() => "");
    const parts = ms.split(/\n(?=## )/).map((s) => ({ h: /^## (\d+)\.(\d+)?\s*(.*)$/.exec(s.split("\n")[0]), s })).filter((p) => p.h);
    const chSecs = parts.map((p) => {
      const h = p.h as RegExpExecArray;
      const no = h[2] !== undefined ? `${h[1]}.${h[2]}` : `${+c.no}.${h[1]}`;
      return { no, title: h[3].replace(/^\.\s*/, "").replace(/\s*\((?:\d{4}-\d{4}|as of [^)]*)\)\s*$/, "").trim(), s: p.s };
    }).filter((x) => x.no.startsWith(`${+c.no}.`));
    const secCount: Record<string, number> = {};
    perCh[c.no] = list.length;
    total += list.length;
    for (const e of list) {
      if (!e || typeof e !== "object" || typeof e.id !== "string") continue;
      // internal research notes are not literature
      if (/^research\//.test(str(e.url)) || /^R\d\d:/.test(titleOf(e)) || /\bR\d\d\b/.test(titleOf(e)) || str(e.type) === "research-note" || /\blane\b|scratch/i.test(`${titleOf(e)} ${str(e.citation)}`)) continue;
      const id = e.id;
      const re = new RegExp(`(^|[^\\w-])${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w-])`);
      const inSecs = chSecs.filter((x) => re.test(x.s)).map((x) => x.no);
      inSecs.forEach((n) => { secCount[n] = (secCount[n] ?? 0) + 1; });
      const doi = typeof e.doi === "string" && e.doi.includes("/") ? normDoi(e.doi) : undefined;
      const url = /^https?:\/\//.test(str(e.url)) ? str(e.url) : undefined;
      const key = doi ? `doi:${doi}` : url ? `url:${url}` : `id:${c.no}:${id}`;
      const cur = merged.get(key);
      if (cur) {
        if (!cur.ch.includes(c.no)) cur.ch.push(c.no);
        for (const s of inSecs) if (!cur.s.includes(s)) cur.s.push(s);
        if (!cur.t || (cur.tc && str(e.title))) { cur.t = titleOf(e); cur.tc = !str(e.title); }
        if (Array.isArray(e.authors) && cur.ac) { cur.a = authorsShort(e); cur.ac = false; }
        if (!cur.y) cur.y = yearOf(e);
        continue;
      }
      merged.set(key, { k: key, t: titleOf(e), a: authorsShort(e), y: yearOf(e), v: venueOf(e), d: doi, u: doi ? undefined : url, ch: [c.no], s: inSecs, tc: !str(e.title), ac: !Array.isArray(e.authors) });
    }
    const smap = await sectionMap();
    for (const x of chSecs) secs.push({ no: x.no, ch: c.no, title: smap.get(x.no)?.title ?? x.title, n: secCount[x.no] ?? 0 });
  }
  const refs = [...merged.values()].map(({ tc: _tc, ac: _ac, ...r }) => r).sort((a, b) => (a.y || "9999").localeCompare(b.y || "9999") || a.a.localeCompare(b.a));
  return { refs, secs, perCh, total };
}
