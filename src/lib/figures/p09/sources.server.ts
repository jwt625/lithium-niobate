// Source register lookup for the P09 pages (build time): short citation, DOI, URL, how it was read.
import SOURCES from "$lib/generated/sources.json";

interface Src { id: string; title?: string; author?: { family?: string; given?: string; literal?: string }[]; container_title?: string; publisher?: string; volume?: string; page?: string; article_number?: string; issued?: string; doi?: string; url?: string; read?: string; access?: { oa_status?: string } }
const BY = new Map((SOURCES as Src[]).map((s) => [s.id, s]));

export interface Cite { id: string; text: string; short: string; doi?: string; url?: string; year: string; title: string; read?: string }
function who(s: Src): string {
  const all = (s.author ?? []).map((a) => a.family ?? a.literal ?? "").filter(Boolean);
  const etal = all.some((n) => /^et al\.?$/.test(n));
  const names = all.filter((n) => !/^et al\.?$/.test(n));
  if (!names.length) return s.publisher ?? "";
  return etal || names.length > 2 ? `${names[0]} et al.` : names.join(" & ");
}
export function cite(id: string): Cite {
  const s = BY.get(id);
  if (!s) return { id, text: id, short: keyShort(id), year: "", title: "" };
  const w = who(s);
  const where = [s.container_title ?? (w === s.publisher ? undefined : s.publisher), s.volume, s.page ?? s.article_number].filter(Boolean).join(" ");
  const year = (s.issued ?? "").slice(0, 4);
  return { id, text: [w, where].filter(Boolean).join(", ") + (year ? ` (${year})` : ""), short: [w, year].filter(Boolean).join(" "), doi: s.doi, url: s.url, year, title: s.title ?? "", read: s.read };
}
/** Author-year form of a citation key that is not in the register: "kovacs1990" -> "Kovacs 1990". */
export function keyShort(key: string): string {
  const m = /^([a-z]+?)(\d{4})[a-z]*$/.exec(key);
  return m ? `${m[1][0].toUpperCase()}${m[1].slice(1)} ${m[2]}` : key;
}
import DISPM from "$lib/generated/dispersion.json";
const DISP_NAME = new Map((DISPM as { id: string; name: string }[]).map((d) => [d.id, d.name.replace(/,? (congruent|stoichiometric) LiNbO3/, " $1").replace(/LiNbO3/g, "LN")]));
/** Replace raw citation keys and dispersion-model ids inside free text by author-year short forms. */
export function replaceKeys(t: string): string {
  return t
    .replace(/\b(?:zelmon1997|gayer2008|jundt1997)-[a-z0-9-]+?-[eo]\b/g, (m) => DISP_NAME.get(m) ?? m)
    .replace(/\b[a-z][a-z]*\d{4}[a-z]*(?:-[a-z]+\d{4}[a-z]*)*\b/g, (m) => {
      const parts = m.split("-");
      if (parts.length > 1) return parts.map((k, i) => (BY.has(k) ? cite(k).short : keyShort(k)) + (i === 0 ? "" : "")).join(", quoting ");
      return BY.has(m) ? cite(m).short : /^[a-z]+\d{4}[a-z]?$/.test(m) && m.length > 6 ? keyShort(m) : m;
    });
}
export const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/** Popup source line (HTML): citation, DOI link, locator. */
export function srcLine(id: string, locator?: string): string {
  const c = cite(id);
  const link = c.doi ? `, <a href="https://doi.org/${esc(c.doi)}">doi:${esc(c.doi)}</a>` : c.url ? `, <a href="${esc(c.url)}">${esc(c.url.replace(/^https?:\/\//, ""))}</a>` : "";
  return `${esc(c.text)}${link}${locator ? `, ${esc(locator)}` : ""}`;
}

const COND_LABEL: Record<string, string> = { temperature_C: "T", temperature_K: "T", wavelength_nm: "λ", frequency_Hz: "f", mechanical_boundary: "mech.", electrical_boundary: "elec.", method: "method", temperature_text: "T", frequency_text: "f", note: "", polarization: "pol." };
const COND_UNIT: Record<string, string> = { temperature_C: " °C", temperature_K: " K", wavelength_nm: " nm", frequency_Hz: " Hz" };
const BOUND: Record<string, string> = { S: "clamped (S)", T: "free (T)", E: "constant E", D: "constant D" };
/** Conditions object as one line, e.g. "λ 633 nm; mech. free (T)". */
export function condText(c: Record<string, unknown> | undefined): string {
  if (!c) return "";
  return Object.entries(c).filter(([, v]) => v !== null && v !== undefined && v !== "").map(([k, v]) => {
    const val = (k === "mechanical_boundary" || k === "electrical_boundary") && typeof v === "string" ? (BOUND[v] ?? v) : String(v);
    const lab = COND_LABEL[k] ?? k.replace(/_/g, " ");
    return `${lab ? `${lab} ` : ""}${val}${COND_UNIT[k] ?? ""}`;
  }).join("; ");
}
/** Frame object as one line. */
export function frameText(f: Record<string, unknown> | undefined): string {
  if (!f) return "";
  const parts = [f.setting && `${f.setting}`, f.x && `x: ${f.x}`, f.z && `z: ${f.z}`, f.convention && f.convention !== "unstated" ? `convention ${f.convention}` : "sign convention unstated", f.z_sign_definition && `+z: ${f.z_sign_definition}`];
  return stripNotes(parts.filter(Boolean).join("; "));
}

/** Remove internal research-note references ("(R14 row 36a)", "R06 sec. 2.4", "scripts/...") from data notes. */
export function stripNotes(s: string): string {
  const RID = /\b(?:note-)?R\d\d(?:\s*(?:sec\.\s*\d+(?:\.\d+)*|rows?\s*\d+[a-z]?(?:\s*(?:,|and|-)\s*\d+[a-z]?)*|gap\s*\d+|N\d+|item\s*\d+|S\d+))*/g;
  let t = s.replace(/(?:^|\s)See R\d\d.*?\.(?=\s+[A-Za-z]{3,}|$)/g, "").replace(/\bR\d\d\s*sec\.\s*\d+(?:\.\d+)*:\s*/g, "Cross-check: ").replace(/[^.]*\b(?:not blended|research pass|lane [A-Z]\d)[^.]*\.?/g, "");
  t = t.replace(/\bR\d\d(?:\s*sec\.\s*\d+(?:\.\d+)*)?:?\s+(lists|gives)\b/g, "A cross-check $1");
  t = t.replace(/\s*\([^()]*\bR\d\d\b[^()]*\)/g, (m) => { const inner = m.trim().slice(1, -1).replace(RID, "").replace(/^[\s;,:]+|[\s;,:]+$/g, "").replace(/\b(?:in|from|see|cf\.)$/i, "").trim(); return inner ? ` (${inner})` : ""; });
  t = t.replace(RID, "").replace(/\s*\((?:pitfall \d+|N\d+)\)/g, "");
  t = t.replace(/\s*\(scripts\/[^)]*\)/g, "").replace(/,?\s*(?:computed )?by scripts\/\S+/g, "").replace(/,?\s*scripts\/\S+/g, "");
  t = t.replace(/\(\s*\)/g, "").replace(/\s+([;,.)])/g, "$1").replace(/;\s*;/g, ";").replace(/^\s*[;,:]\s*/, "").replace(/\s{2,}/g, " ").trim();
  return t.replace(/^\(([^()]*)\)$/, "$1");
}
