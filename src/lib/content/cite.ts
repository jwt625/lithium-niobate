// Citation display shared by reference tables and popups: author-year short form plus title; a citation key is never
// shown as a name (audit F, S6). Accepts the record shapes in use: CSL-like rows of src/lib/generated/sources.json
// (author[{family|literal}], issued, container_title) and the chapter refs.yaml layouts (authors ["R. S. Weis", ...],
// first_author + n_authors, citation string, year | issued | date, container | venue, publisher).

export interface CiteRec {
  id?: string;
  title?: string;
  author?: { family?: string; given?: string; literal?: string }[];
  authors?: string[] | string;
  first_author?: string;
  n_authors?: number | string;
  publisher?: string;
  citation?: string;
  issued?: string | number;
  year?: string | number;
  date?: string;
  container_title?: string;
  container?: string;
  venue?: string;
  volume?: string | number;
  page?: string;
  pages?: string;
  article_number?: string;
  doi?: string;
  url?: string;
}

const family = (name: string): string => {
  const n = name.trim().replace(/\s+et al\.?$/i, "");
  if (/,/.test(n)) return n.split(",")[0].trim(); // "Weis, R. S."
  const parts = n.split(/\s+/);
  return parts.length > 1 && /^[A-Z][a-z]*\.?$|^[A-Z]\.(-?[A-Z]\.)*$/.test(parts[0]) ? parts[parts.length - 1] : n; // "R. S. Weis" -> "Weis"
};

/** Family names in order (organizations as given). */
export function names(r: CiteRec): string[] {
  if (r.author?.length) return r.author.map((a) => a.family ?? a.literal ?? "").filter(Boolean);
  if (Array.isArray(r.authors)) return r.authors.map(family).filter(Boolean);
  if (typeof r.authors === "string") return r.authors.split(/\s*(?:,|;| and |&)\s*/).map(family).filter(Boolean);
  if (r.first_author) return Number(r.n_authors ?? 1) > 2 ? [family(r.first_author), "", ""] : [family(r.first_author)];
  if (r.citation) {
    // "R. S. Weis, T. K. Gaylord, "Title", ..." or "T. Volk, M. Woehlecke, Title, ...": names before the title
    const head = r.citation.split(/["“]/)[0];
    const parts = head.split(/,\s*|\s+and\s+|\s*&\s*/).map((x) => x.trim()).filter(Boolean);
    const who: string[] = [];
    for (const p of parts) {
      if (/^et al\.?$/i.test(p)) { who.push("", ""); break; }
      if (!/^(?:[A-Z][\w'À-ſ-]*\.?\s+){0,3}[A-Z][\w'À-ſ-]+(?:\s+et al\.?)?$/.test(p) || p.split(/\s+/).length > 5) break;
      who.push(family(p));
      if (/et al\.?$/.test(p)) { who.push("", ""); break; }
    }
    if (who.length) return who;
  }
  return r.publisher ? [r.publisher] : [];
}

/** Year as printed (issued, year, date or a year in the citation string). */
export function year(r: CiteRec): string {
  const y = String(r.issued ?? r.year ?? r.date ?? "").slice(0, 4);
  if (/^\d{4}$/.test(y)) return y;
  const m = r.citation?.match(/\((?:[^()]*\D)?((?:1[6-9]|20)\d{2})\)\s*\.?$/) ?? r.citation?.match(/\b((?:1[6-9]|20)\d{2})\b(?!.*\b(?:1[6-9]|20)\d{2}\b)/);
  return m?.[1] ?? "";
}

/** "Kushibiki et al. 1999", "Weis & Gaylord 1985", "IEEE 1988". Falls back to the title, never to the key. */
export function shortCite(r: CiteRec): string {
  const n = names(r), y = year(r);
  const who = n.length > 2 ? `${n[0]} et al.` : n.filter(Boolean).join(" & ");
  if (who) return y ? `${who} ${y}` : who;
  return [r.title ?? "untitled source", y].filter(Boolean).join(", ");
}

/** Where it appeared: container volume, page. */
export function venue(r: CiteRec): string {
  return [r.container_title ?? r.container ?? r.venue ?? (r.author || r.authors || r.first_author ? r.publisher : undefined), r.volume, r.page ?? r.pages ?? r.article_number].filter(Boolean).map(String).join(" ");
}

/** Link target: DOI resolver first, then the URL. */
export const citeHref = (r: CiteRec): string | undefined => (r.doi ? `https://doi.org/${r.doi}` : r.url && /^https?:/.test(r.url) ? r.url : undefined);
