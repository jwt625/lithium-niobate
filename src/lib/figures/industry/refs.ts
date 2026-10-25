// Chapter 08 sources and glossary as popup entries. Server-side: parses content/chapters/08-industry/refs.yaml and
// glossary.yaml (flat lists of maps: `key: value`, quoted or bare scalars, inline [a, b] lists) and builds the entries a
// page uses. Keys: "r:<ref id>" (one source), "r:<id>+<id>" (several sources), "g8:<slug>" (chapter glossary term).
import type { Pop } from "$lib/content/pops";

export type Rec = Record<string, string>;

/** Minimal parser for the flat YAML lists of the chapter folder (no nesting beyond inline lists). */
export function parseFlatYaml(text: string): Rec[] {
  const out: Rec[] = [];
  let cur: Rec | null = null;
  for (const raw of text.split("\n")) {
    if (/^\s*#/.test(raw) || !raw.trim()) continue;
    const m = /^(- |  )([A-Za-z0-9_]+):\s?(.*)$/.exec(raw);
    if (!m) continue;
    if (m[1] === "- ") { cur = {}; out.push(cur); }
    if (!cur) continue;
    let v = m[3].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1).replace(/\\"/g, '"');
    if (!(m[2] in cur)) cur[m[2]] = v; // first occurrence wins
  }
  return out;
}

export const GRADE_DEF: Record<string, string> = {
  F: "fact from a primary source opened and read (government data, filing, company release or product page)",
  V: "vendor claim about its own performance, capacity, or roadmap (read, not checked)",
  T: "trade press, opened and read",
  C: "seen only as a snippet or aggregator; page not opened",
  LG: "low grade (paywalled market teaser, investor forum, AI-assisted finance article): direction only",
  E: "estimate by this site, assumptions stated",
  S: "speculation, labelled",
};
/** Primary grade letter of a compound grade such as "F/V", "T/C", "F (statement)", "LG/C". */
export const gradeKey = (g: string): string => (g.match(/^(LG|F|V|T|C|E|S)/)?.[1] ?? "C");
/** CSS class suffix: F, V, T, C, E, S, LG. */
export const gradeCls = (g: string): string => `g${gradeKey(g)}`;

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;");
const host = (u: string): string => u.replace(/^https?:\/\//, "").replace(/\/$/, "");
const short = (u: string): string => { const h = host(u); return h.length > 64 ? h.slice(0, 61) + "&hellip;" : esc(h); };

function grades(g: string): string {
  const keys = [...new Set((g.match(/LG|F|V|T|C|E|S/g) ?? []).filter((k) => GRADE_DEF[k]))];
  return keys.map((k) => `<b>${k}</b>: ${GRADE_DEF[k]}.`).join(" ");
}

/** Note text for the page: drops clauses that describe this project's workflow (research-note ids, "manuscript",
 *  "correction row", "never plotted") and parenthetical research-note locators. */
function clean(n: string | undefined): string {
  if (!n) return "";
  return n.replace(/\s*\((?:[^()]*R0\d[^)]*)\)/g, "").replace(/\batlas [a-z]+\d{4}[a-z0-9/-]*;?\s*/g, "").replace(/\s+per R0\d( sec\. [\d.]+)?/g, "")
    .split(/;\s*|\.\s+/).filter((c) => c && !/manuscript|R0\d|correction row|never plotted|this chapter/i.test(c)).join("; ");
}
/** One source as popup parts. */
function srcLine(r0: Rec): { h: string; body: string; badge?: string; src: string } {
  const r: Rec = { ...r0, note: clean(r0.note), license: r0.license?.replace(/\s*\((?:[^()]*R0\d[^)]*)\)/g, "").replace(/,\s*R0\d[^)]*/, "") ?? "" };
  if (r.doi) {
    const who = r.n_authors && Number(r.n_authors) > 2 ? `${r.first_author} et al.` : r.first_author ?? "";
    const where = [r.venue, r.volume, r.pages].filter(Boolean).join(" ");
    return { h: esc(r.title ?? r.id), body: `${esc(who)}, ${esc(where)} (${esc(r.year ?? "")}).${r.note ? ` ${esc(r.note)}.` : ""}`,
      src: `<a href='https://doi.org/${esc(r.doi)}'>doi:${esc(r.doi)}</a>, Crossref record checked ${esc(r.crossref_checked ?? "")}` };
  }
  if (r.type === "research_note") {
    return { h: esc((r.title ?? r.id).replace(/^R0\d:\s*/, "")), body: `Project research note, ${esc(r.date ?? "")}.${r.note ? ` ${esc(r.note)}.` : ""}`, src: "Counts from public program metadata; full texts are not redistributed." };
  }
  if (r.type === "dataset") {
    return { h: esc(r.title ?? r.id), body: `${r.commit ? `Commit <span class='v'>${esc(r.commit.slice(0, 7))}</span>${r.commit_date ? ` (${esc(r.commit_date)})` : ""}. ` : ""}${r.note ? esc(r.note) + ". " : ""}License upstream: ${esc(r.license ?? "not stated")}.`,
      src: `<a href='${esc(r.url ?? "")}'>${short(r.url ?? "")}</a>` };
  }
  return {
    h: `${esc(r.publisher ?? "")}${r.title ? `: ${esc(r.title)}` : ""}`,
    body: `${r.date && r.date !== "undated" ? `<span class='v'>${esc(r.date)}</span>. ` : r.date === "undated" ? "Undated page. " : ""}${r.grade ? grades(r.grade) : ""}${r.note ? ` ${esc(r.note)}.` : ""}`,
    badge: r.grade?.replace(/\s*\(.*\)$/, ""), src: r.url ? `<a href='${esc(r.url)}'>${short(r.url)}</a>${r.accessed ? `, accessed ${esc(r.accessed)}` : ""}` : "",
  };
}

export function refPops(refs: Rec[], keys: Iterable<string>): Record<string, Pop> {
  const byId = new Map(refs.map((r) => [r.id, r]));
  const out: Record<string, Pop> = {};
  for (const key of keys) {
    if (!key.startsWith("r:")) continue;
    const ids = key.slice(2).split("+");
    const parts = ids.map((id) => { const r = byId.get(id); if (!r) throw new Error(`chapter 08: unknown ref id ${id}`); return srcLine(r); });
    if (parts.length === 1) {
      const p = parts[0];
      out[key] = { h: p.h, body: p.body, src: p.src, badges: p.badge ? [[`g8 ${gradeCls(p.badge)}`, esc(p.badge.replace(/\s*\(.*\)$/, ""))]] : undefined };
    } else {
      out[key] = { h: `${parts.length} sources`, body: parts.map((p) => `<div class='i8-ps'><b>${p.h}</b><br>${p.body}<br>${p.src}</div>`).join("") };
    }
  }
  return out;
}

export function glossaryPops(terms: Rec[]): Record<string, Pop> {
  const out: Record<string, Pop> = {};
  for (const t of terms) {
    if (!t.term) continue;
    out[`g8:${slug(t.term)}`] = { h: esc(t.term) + (t.expansion ? ` <span class='v'>${esc(t.expansion)}</span>` : ""), body: esc(t.definition ?? ""), src: t.see ? `Chapter 08 glossary; section ${esc(t.see)}` : undefined };
  }
  return out;
}
export const slug = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** All "r:" and "g8:" keys referenced in a data structure (fields named r, refs, pop, or strings with data-pop='...'). */
export function collectKeys(x: unknown, acc = new Set<string>()): Set<string> {
  if (typeof x === "string") {
    for (const m of x.matchAll(/data-pop=['"]((?:r|g8):[^'"]+)['"]/g)) acc.add(m[1]);
    if (/^(r|g8):[A-Za-z0-9+._-]+$/.test(x)) acc.add(x);
  } else if (Array.isArray(x)) x.forEach((v) => collectKeys(v, acc));
  else if (x && typeof x === "object") Object.values(x).forEach((v) => collectKeys(v, acc));
  return acc;
}
