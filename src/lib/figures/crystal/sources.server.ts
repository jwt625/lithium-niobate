// Chapter 01 source and term popups, built at prerender from content/chapters/01-crystal/{refs,glossary}.yaml.
// Keys (write them literally in page and figure sources so `popsFor` finds them):
//   "r:<refId>|<locator>"               one source with its locator, e.g. r:volk2008|Table 1.1 p. 3
//   "r:<id>|<loc>;<id>|<loc>"           several sources for one number
//   "t:<term-slug>"                      chapter term not (yet) in the generated glossary (slug of the glossary.yaml term)
// `popsFor(raw)` scans raw source text for such keys and returns only the entries the page uses, so each page ships
// only its own popups. Server only (the YAML text never reaches the client).
import type { Pop } from "$lib/content/pops";
import type { PageMeta, StatusCode } from "$lib/content/site";
import { rawContent } from "$lib/content/loader";
import { CONFLICTS } from "./conflicts.server";

interface Ref { id: string; citation: string; doi?: string; url?: string; isbn?: string }
interface Term { term: string; definition: string; source: string }

/** Minimal parser for the flat list-of-maps YAML used by refs.yaml and glossary.yaml (one `key: value` per line). */
function parseList(text: string, first: string): Record<string, string>[] {
  const out: Record<string, string>[] = [];
  let cur: Record<string, string> | null = null;
  for (const line of text.split("\n")) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const m = line.match(/^(- |  )([a-z_]+):\s?(.*)$/);
    if (!m) continue;
    if (m[1] === "- " && m[2] === first) { cur = {}; out.push(cur); }
    if (!cur) continue;
    let v = m[3].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1).replace(/\\"/g, '"');
    if (v === "null") v = "";
    cur[m[2]] = v;
  }
  return out;
}

export const termSlug = (term: string): string =>
  term.toLowerCase().replace(/\^/g, "").replace(/\+/g, "plus-").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** Plain-text chemistry and units in the YAML to light HTML (subscripts in formulas, A to Angstrom). */
const tidy = (s: string): string =>
  esc(s)
    .replace(/\bLiNbO3\b/g, "LiNbO<sub>3</sub>").replace(/\bLiTaO3\b/g, "LiTaO<sub>3</sub>").replace(/\bLi2O\b/g, "Li<sub>2</sub>O")
    .replace(/\bNb2O5\b/g, "Nb<sub>2</sub>O<sub>5</sub>").replace(/\bK2O\b/g, "K<sub>2</sub>O").replace(/\bO6\b/g, "O<sub>6</sub>")
    .replace(/(\d) A\b/g, "$1 &Aring;").replace(/\bdeg\b/g, "&deg;");

let cache: Promise<{ refs: Map<string, Ref>; terms: Map<string, Term> }> | null = null;
function load(): Promise<{ refs: Map<string, Ref>; terms: Map<string, Term> }> {
  cache ??= (async () => {
    const [r, g] = await Promise.all([rawContent("/content/chapters/01-crystal/refs.yaml"), rawContent("/content/chapters/01-crystal/glossary.yaml")]);
    const refs = new Map(parseList(r, "id").map((x) => [x.id, { id: x.id, citation: x.citation, doi: x.doi || undefined, url: x.url || undefined, isbn: x.isbn || undefined }]));
    const terms = new Map(parseList(g, "term").map((x) => [termSlug(x.term), { term: x.term, definition: x.definition, source: x.source }]));
    return { refs, terms };
  })();
  return cache;
}

function refLine(r: Ref): string {
  const link = r.doi ? ` <a href='https://doi.org/${esc(r.doi)}'>doi:${esc(r.doi)}</a>` : r.url && /^https?:/.test(r.url) ? ` <a href='${esc(r.url)}'>${esc(r.url.replace(/^https?:\/\//, ""))}</a>` : r.isbn ? ` ISBN ${esc(r.isbn)}` : "";
  return `${tidy(r.citation)}.${link}`;
}

const NAME_OVERRIDE: Record<string, string> = { volk2008: "Volk & Wöhlecke 2008", cti1999: "Crystal Technology 1999", ieee176: "IEEE Std 176-1987", ire1949: "IRE 1949", nye1985: "Nye 1985", schroder2012: "Schröder et al. 2012" };
/** Author-year label from the citation: "A & B 1985", "A et al. 1997" (year from the id). */
function shortName(r: Ref): string {
  if (NAME_OVERRIDE[r.id]) return NAME_OVERRIDE[r.id];
  const names = r.citation.split('"')[0].split(",").map((x) => x.trim()).filter(Boolean).map((x) => x.split(" ").pop() as string);
  const y = (r.id.match(/\d{4}[a-z]?/) ?? [""])[0];
  return `${names.length > 2 ? `${names[0]} et al.` : names.join(" & ")} ${y}`.trim();
}

const KEY_RE = /["'`](r|t|c):([^"'`<>{}\n]+)["'`]/g;

/** Popup entries for every r:/t: key that occurs in the given raw sources. Throws on an unknown ref id or term slug, so a
 *  typo fails the prerender instead of shipping a dead popup. */
export async function popsFor(...raw: string[]): Promise<Record<string, Pop>> {
  const { refs, terms } = await load();
  const out: Record<string, Pop> = {};
  for (const text of raw) {
    for (const m of text.matchAll(KEY_RE)) {
      const key = `${m[1]}:${m[2]}`;
      if (out[key]) continue;
      if (m[1] === "c") {
        const C = CONFLICTS[key];
        if (!C) throw new Error(`chapter 01 conflict "${key}" not defined in conflicts.server.ts`);
        out[key] = C((id, loc) => { const r = refs.get(id); if (!r) throw new Error(`chapter 01 ref "${id}" not in refs.yaml`); return `${refLine(r).replace(/\.( <a|$)/, "$1")}${loc ? `, ${tidy(loc)}` : ""}`; });
        continue;
      }
      if (m[1] === "t") {
        const t = terms.get(m[2]);
        if (!t) throw new Error(`chapter 01 term "${m[2]}" not in glossary.yaml`);
        const r = t.source.startsWith("note-") ? undefined : refs.get(t.source); // internal research notes are not cited on pages
        out[key] = { h: tidy(t.term), body: tidy(t.definition), src: r ? refLine(r) : undefined };
        continue;
      }
      const parts = m[2].split(";").map((p) => p.trim()).filter(Boolean).map((p) => {
        const [id, ...loc] = p.split("|");
        const r = refs.get(id.trim());
        if (!r) throw new Error(`chapter 01 ref "${id}" not in refs.yaml (key ${key})`);
        if (r.id.startsWith("note-")) throw new Error(`internal research note ${r.id} cited on a page (key ${key}); cite the primary source`);
        return { r, loc: loc.join("|").trim() };
      });
      out[key] = {
        h: parts.length === 1 ? "Source" : "Sources",
        body: parts.map((p) => `${refLine(p.r)}${p.loc ? ` <span class='v'>${tidy(p.loc)}</span>` : ""}`).join("<br>"),
      };
    }
  }
  return out;
}

/** Reference list of a page: every ref id that occurs in an r: key, in first-use order, with citation and DOI link. */
export async function refsFor(...raw: string[]): Promise<{ id: string; name: string; html: string }[]> {
  const { refs } = await load();
  const ids: string[] = [];
  for (const text of raw)
    for (const m of text.matchAll(KEY_RE)) {
      const add = (id: string): void => { if (id && !ids.includes(id)) ids.push(id); };
      if (m[1] === "c") { CONFLICTS[`c:${m[2]}`]?.((id) => { add(id); return ""; }); continue; }
      if (m[1] !== "r") continue;
      for (const p of m[2].split(";")) add(p.split("|")[0].trim());
    }
  return ids.map((id) => {
    const r = refs.get(id);
    if (!r) throw new Error(`chapter 01 ref "${id}" not in refs.yaml`);
    return { id, name: shortName(r), html: refLine(r) };
  });
}

/** Everything a section page's server load returns besides its own figure data. `raw` = the page source and the sources of
 *  every figure module that writes r:/t: keys (import them with ?raw). */
export async function sectionData(meta: { title: string; description: string; keys: StatusCode[] }, ...raw: string[]): Promise<{ meta: Partial<PageMeta>; pops: Record<string, Pop>; refs: { id: string; name: string; html: string }[] }> {
  return { meta: { ...meta, aside: "bias", qpm: 1.064 }, pops: await popsFor(...raw), refs: await refsFor(...raw) };
}

/** All chapter term slugs (for authors of page copy). */
export async function termSlugs(): Promise<string[]> {
  return [...(await load()).terms.keys()];
}
