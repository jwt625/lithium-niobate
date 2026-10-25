// Popup registry. Lookup order for data-pop="key":
//   "g:<id>"  -> glossary entry <id> (src/lib/generated/glossary.json, written by scripts/build_data.py)
//   "<key>"   -> page-local entry (usePops / registerPops), else shell entry (root layout: masthead band, footer), else
//               glossary entry <key>
// Page-local entries win for bare keys so curated popups with live values keep their content when the glossary grows.
// Page context on a glossary popup: data-pop="g:<id>" data-pop-note="<key>" appends the body of page or shell entry
// <key> as a context line (below the definition, above the source); its badges and source line are appended too.
import { onMount } from "svelte";
import { shortCite, venue } from "./cite";

export type BadgeSpec = [cls: string, text: string];
export interface Pop {
  /** Heading (HTML). */
  h: string;
  /** Body (HTML); a function is evaluated each time the popup opens (live values). */
  body?: string | (() => string);
  badges?: BadgeSpec[];
  /** Source line (HTML, links allowed). */
  src?: string;
  /** Optional link: [label, href]. */
  more?: [string, string];
}

const local = new Map<string, Pop>();
const shell = new Map<string, Pop>();

/** Register entries (page level by default; "shell" for the root layout); returns the unregister function. */
export function registerPops(entries: Record<string, Pop>, level: "page" | "shell" = "page"): () => void {
  const m = level === "shell" ? shell : local;
  for (const [k, v] of Object.entries(entries)) m.set(k, v);
  return () => { for (const [k, v] of Object.entries(entries)) if (m.get(k) === v) m.delete(k); };
}
/** Register entries for the lifetime of the calling component (browser only). */
export function usePops(entries: Record<string, Pop>, level: "page" | "shell" = "page"): void {
  onMount(() => registerPops(entries, level));
}

// ---------- glossary (optional generated file) ----------
/** Glossary source: a sources-register id, or (terms merged from a chapter glossary) a citation from the chapter refs. */
interface GlossarySource { source_id?: string; locator?: string; ref?: string; citation?: string; doi?: string; url?: string }
interface GlossaryTerm { id: string; term: string; symbol?: string; short?: string; long?: string; def?: string; sources?: GlossarySource[] }
interface SourceRec { id: string; citation?: string; doi?: string; url?: string; author?: { family?: string; literal?: string }[]; container_title?: string; publisher?: string; volume?: string; page?: string; article_number?: string; issued?: string; title?: string }
/** Citation from a CSL-like record (sources.json): author-year short form, title, venue (src/lib/content/cite.ts). */
function citation(r: SourceRec): string {
  return [shortCite(r), r.title, venue(r)].filter(Boolean).join(", ");
}
// Lazy: the generated files are large (about 210 kB together), so they load on first need or at idle (Popups.svelte).
const gFiles = import.meta.glob<unknown>("../generated/glossary.json", { import: "default" });
const sFiles = import.meta.glob<unknown>("../generated/sources.json", { import: "default" });
const asList = <T>(raw: unknown, keys: string[]): T[] => {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object") {
    for (const k of keys) { const v = (raw as Record<string, unknown>)[k]; if (Array.isArray(v)) return v as T[]; }
    return Object.entries(raw as Record<string, unknown>).filter(([, v]) => v && typeof v === "object").map(([id, v]) => ({ id, ...(v as object) }) as T);
  }
  return [];
};
const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
/** Definition text of a glossary term: short, then long (only the part that does not repeat short; chapter terms carry
 *  long = short + detail), else the legacy `def`. Empty for a term with no definition at all. */
function definitions(t: GlossaryTerm): string[] {
  const short = (t.short ?? "").trim(), long = (t.long ?? "").trim();
  const out: string[] = [];
  if (short) out.push(short);
  if (long && long !== short) out.push(short && long.startsWith(short) ? long.slice(short.length).trim() : long);
  if (!out.length && t.def?.trim()) out.push(t.def.trim());
  return out.filter(Boolean);
}
/** Popup body for a glossary term; never empty (a term without short, long or def says so). */
function glossaryBody(t: GlossaryTerm): string {
  const d = definitions(t);
  return d.length ? d.map((x) => `<div class="gl-d">${esc(x)}</div>`).join("") : `<div class="gl-d nodef">no definition</div>`;
}
// Build-time check (server bundle only; the client build drops this block): list glossary ids without any definition.
if (import.meta.env.SSR) {
  void Object.values(gFiles)[0]?.().then((g) => {
    const bad = asList<GlossaryTerm>(g, ["terms", "glossary", "items"]).filter((t) => t?.id && !definitions(t).length).map((t) => t.id);
    if (bad.length) console.warn(`[glossary] ${bad.length} term(s) with neither short nor long definition: ${bad.join(", ")}`);
  }).catch(() => {});
}
const GLOSSARY = new Map<string, Pop>();
let loaded = false, loading: Promise<void> | null = null;
/** Load the generated glossary (and sources, for citations) once; resolves immediately when the files are absent. */
export function loadGlossary(): Promise<void> {
  if (loading) return loading;
  loading = (async () => {
    const [g, s] = await Promise.all([Object.values(gFiles)[0]?.(), Object.values(sFiles)[0]?.()]);
    const SOURCES = new Map(asList<SourceRec>(s, ["sources", "items"]).map((r) => [r.id, r]));
    const cite = (x: GlossarySource): string => {
      if (!x.source_id) {
        const link = x.doi ? `, <a href='https://doi.org/${esc(x.doi)}'>doi:${esc(x.doi)}</a>` : x.url ? `, <a href='${esc(x.url)}'>${esc(x.url)}</a>` : "";
        return `${esc(x.citation ?? x.ref ?? "")}${link}${x.locator ? `, ${esc(x.locator)}` : ""}`;
      }
      const r = SOURCES.get(x.source_id);
      const doi = r?.doi ? `, <a href='https://doi.org/${esc(r.doi)}'>doi:${esc(r.doi)}</a>` : r?.url ? `, <a href='${esc(r.url)}'>${esc(r.url)}</a>` : "";
      if (!r) return "";
      return `${esc(citation(r))}${doi}${x.locator ? `, ${esc(x.locator)}` : ""}`;
    };
    for (const t of asList<GlossaryTerm>(g, ["terms", "glossary", "items"])) {
      if (!t || !t.id || !t.term) continue;
      GLOSSARY.set(t.id, {
        h: esc(t.term) + (t.symbol ? ` <span class='v'>${esc(t.symbol)}</span>` : ""),
        body: glossaryBody(t),
        src: t.sources?.map(cite).filter(Boolean).join("; ") || undefined,
      });
    }
    loaded = true;
  })().catch(() => { loaded = true; });
  return loading;
}
export const glossaryLoaded = (): boolean => loaded;
export const glossarySize = (): number => GLOSSARY.size;

export function getPop(key: string): Pop | undefined {
  if (key.startsWith("g:")) return GLOSSARY.get(key.slice(2));
  return local.get(key) ?? shell.get(key) ?? GLOSSARY.get(key);
}

/** Popup for an element: entry `key`, extended by the page or shell entry `noteKey` (data-pop-note) when given. */
export function resolvePop(key: string, noteKey?: string): Pop | undefined {
  const base = getPop(key);
  const note = noteKey ? (local.get(noteKey) ?? shell.get(noteKey)) : undefined;
  if (!base || !note) return base;
  const val = (b: Pop["body"]): string => (typeof b === "function" ? b() : (b ?? ""));
  return {
    h: base.h,
    body: () => `${val(base.body)}${val(note.body) ? `<div class="note">${val(note.body)}</div>` : ""}`,
    badges: [...(base.badges ?? []), ...(note.badges ?? [])],
    src: [base.src, note.src].filter(Boolean).join("<br>") || undefined,
    more: base.more ?? note.more,
  };
}
