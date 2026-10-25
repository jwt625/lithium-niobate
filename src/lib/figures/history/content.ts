// Chapter 07 History: build-time parser for content/chapters/07-history/manuscript.md (server loads only).
// Turns the manuscript's chapters (L1/L2/L3), hero stories, the "Who did it first?" table and the people table into HTML
// blocks: citations [id, STATUS] become source popups plus history status badges; figure paragraphs ("Interactive: ...")
// become figure slots with their operating text as caption. Source records come from src/lib/generated/sources.json,
// with C07 ids mapped through data/events/c07-source-id-map.yaml (copied below as SOURCE_ID_MAP).
import SOURCES_RAW from "$lib/generated/sources.json";

export interface SourceRec {
  id: string; title?: string; author?: { family?: string; given?: string; literal?: string }[]; container_title?: string;
  publisher?: string; volume?: string; issue?: string; page?: string; article_number?: string; issued?: string; doi?: string; url?: string; type?: string;
}
/** Sources cited on these pages that are not (yet) in data/sources.yaml (reported to the integration lane). */
const EXTRA_SOURCES: SourceRec[] = [
  { id: "smm-products", title: "LT/LN single-crystal wafers (product page)", publisher: "Sumitomo Metal Mining", url: "https://www.smm.co.jp/en/business/material/products/lithium/", type: "webpage" },
];
/** Title corrections for OCR errors in bibliographic records (reported to the integration lane). */
const TITLE_FIX: Readonly<Record<string, [string, string]>> = { hatchett1802: ["bitberto", "hitherto"] };
const SOURCES = new Map([...(SOURCES_RAW as SourceRec[]), ...EXTRA_SOURCES].map((s) => {
  const f = TITLE_FIX[s.id];
  return [s.id, f && s.title ? { ...s, title: s.title.replace(f[0], f[1]) } : s] as const;
}));

/** data/events/c07-source-id-map.yaml (2026-10-25): C07 refs.yaml id -> data/sources.yaml id where they differ. */
export const SOURCE_ID_MAP: Readonly<Record<string, string>> = {
  R02: "note-r02", R04: "note-r04", R07: "note-r07", R09: "note-r09", abrahams1966a: "abrahams1966", amodei1971b: "staebler1971",
  he2019: "he2019-h", myers1995b: "myers1995", volk2009: "volk2008", wang2018b: "wang2018",
};
export const sourceId = (c07: string): string => SOURCE_ID_MAP[c07] ?? c07;
export const knownSource = (c07: string): boolean => SOURCES.has(sourceId(c07));

// ---------- history status codes (manuscript conventions; differ from the site-wide V = vendor) ----------
import { badgeHTML, type HStatus } from "./status";
export { badgeHTML, HSTATUS, type HStatus } from "./status";
const normStatus = (s: string): HStatus | null => (s === "V" || s === "P" || s === "S" ? s : s === "derived" ? "derived" : null);

// ---------- citations ----------
const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escA = (s: string): string => esc(s).replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export function shortCite(r: SourceRec): string {
  const names = (r.author ?? []).map((a) => a.family ?? a.literal ?? "").filter(Boolean);
  const who = names.length > 2 ? `${names[0]} et al.` : names.join(" & ");
  const where = [r.container_title ?? r.publisher, r.volume, r.page ?? r.article_number].filter(Boolean).join(" ");
  const yr = r.issued ? ` (${r.issued.slice(0, 4)})` : "";
  if (who || where) return [who, where].filter(Boolean).join(", ") + yr;
  return (r.title ?? r.id) + yr;
}
export function linkOf(r: SourceRec): string {
  if (r.doi) return `<a href="https://doi.org/${escA(r.doi)}">doi:${esc(r.doi)}</a>`;
  if (r.url) return `<a href="${escA(r.url)}">${esc(r.url.replace(/^https?:\/\//, "").slice(0, 64))}${r.url.length > 72 ? "&hellip;" : ""}</a>`;
  return "";
}
export interface PopData { h: string; body?: string; src?: string; badges?: [string, string][] }
/** Popup entry for a source (key "src:<c07 id>"). */
/** Visible short name of a source: "Rose 1844", "Wang et al. 2018b", "Fujitsu Optical Components 2021". */
const ORG: Readonly<Record<string, string>> = { lightwave: "Lightwave", fujitsu: "Fujitsu", opticsorg: "optics.org", bw: "Business Wire", bwchina: "Business Wire", gh: "Gooch & Housego", soc: "Sumitomo Osaka Cement", smm: "Sumitomo Metal Mining", murata: "Murata", summit: "Summit Partners", csem: "CSEM", sal: "Silicon Austria Labs", xfab: "X-FAB", imec: "imec", afr: "AFR", cls: "Cailian Press", sina: "Sina", ifeng: "ifeng", c114: "C114", picmag: "PIC Magazine", eenews: "eeNews", lfw: "Laser Focus World", rfb: "RF Globalnet", compoundsemi: "Compound Semiconductor", photonicsonline: "Photonics Online", exail: "Exail", einnews: "EIN Presswire", cordis: "CORDIS", nanoln: "NANOLN", liobate: "Liobate", luxtelligence: "Luxtelligence", oxide: "Oxide Corporation", shinetsu: "Shin-Etsu", eospace: "EOSPACE", nobelapi: "Nobel Prize API", vanderkrogt: "van der Krogt", kuzminov: "Kuz'minov", gbt46611: "GB/T 46611-2025" };
export function label(c07: string): string {
  const r = SOURCES.get(sourceId(c07));
  if (!r) return c07;
  const yr = r.issued?.slice(0, 4) ?? /\d{4}/.exec(c07)?.[0] ?? "";
  const suf = /\d{4}([a-z])$/.exec(c07)?.[1] ?? "";
  const names = (r.author ?? []).map((a) => a.family ?? (a.literal ? a.literal.split(" ").pop() : "") ?? "").filter(Boolean);
  if (names.length) return `${names.length > 2 ? `${names[0]} et al.` : names.join(" & ")} ${yr}${suf}`.trim();
  if (r.publisher) return `${r.publisher} ${yr}`.trim();
  const org = ORG[c07.split("-")[0]] ?? ORG[c07.replace(/\d.*$/, "")];
  if (org) return `${org} ${yr}`.trim();
  return `${(r.title ?? c07).split(/\s+/).slice(0, 3).join(" ").replace(/[,:;.]$/, "")} ${yr}`.trim();
}
export function sourcePop(c07: string): PopData | null {
  const r = SOURCES.get(sourceId(c07));
  if (!r) return null;
  const l = linkOf(r);
  return { h: esc(shortCite(r)), body: r.title ? esc(r.title) : undefined, src: [r.issued ? `Issued ${esc(r.issued)}` : "", l].filter(Boolean).join(". ") || undefined };
}

// ---------- inline markdown + notation ----------
const FORMULA = /\b(LiNbO3|LiTaO3|LiCbO3|Li2O|Nb2O5|SiO2|CaWO4|NaNbO3|NbOCl3|Si3N4|Li2CO3)\b/g;
const GREEK: Record<string, string> = { Delta: "&Delta;", delta: "&delta;", lambda: "&lambda;", Lambda: "&Lambda;", pi: "&pi;", beta: "&beta;", gamma: "&gamma;", mu: "&mu;", kappa: "&kappa;", epsilon: "&epsilon;", omega: "&omega;", theta: "&theta;" };
const greek = (s: string): string => GREEK[s] ?? s;

/** Notation pass on escaped text without tags: formulas, sub/superscripts, Greek, units, exponents. */
function notation(t: string): string {
  return t
    .replace(FORMULA, (m) => m.replace(/(\d+)/g, "<sub>$1</sub>"))
    .replace(/\bEr3\+/g, "Er<sup>3+</sup>")
    .replace(/\b93Nb\b/g, "<sup>93</sup>Nb")
    .replace(/\bN_D\+/g, "N<sub>D</sub><sup>+</sup>")
    .replace(/\b([A-Za-z]+)_([A-Za-z0-9]+)\b/g, (_m, a: string, b: string) => `${greek(a)}<sub>${greek(b)}</sub>`)
    .replace(/\b([rd])(33|22|13|51|31)\b/g, "$1<sub>$2</sub>")
    .replace(/\b(\d+(?:\.\d+)?)e(-?)(\d+)\b/g, (_m, a: string, s: string, e: string) => (a === "1" ? "" : `${a} &times; `) + `10<sup>${s ? "&minus;" : ""}${e}</sup>`)
    .replace(/\^(-?)(\d+)/g, (_m, s: string, e: string) => `<sup>${s ? "&minus;" : ""}${e}</sup>`)
    .replace(/(?<![&\w])(Delta|delta|lambda|Lambda|pi|beta|gamma|mu|kappa|epsilon|omega|theta)\b/g, (m) => greek(m))
    .replace(/(\d)( ?)um\b/g, "$1$2&micro;m")
    .replace(/(\d)( ?)uW\b/g, "$1$2&micro;W")
    .replace(/\+-/g, "&plusmn;");
}

export interface InlineCtx {
  /** Slug of the page being rendered (cross references to it become in-page anchors). */
  here?: string;
  /** Source ids cited (C07 ids), collected in order of first appearance. */
  cites: string[];
}

const CH_SLUGS = ["", "a-crystal-on-paper", "bell-labs-grows-a-crystal", "damage-to-memory", "sound-on-a-crystal", "light-in-a-channel", "taming-the-crystal", "the-internets-modulator", "peeling-the-crystal", "thin-film-renaissance", "ai-data-center"];
export const HERO_CHAPTER: Readonly<Record<string, number>> = { H1: 3, H2: 2, H3: 5, H4: 6 };
const HERO_TITLE: Readonly<Record<string, string>> = { H1: "The damage that became a memory", H2: "The first OPO", H3: "What &ldquo;thin film&rdquo; meant", H4: "The stripes" };

function citeGroup(inner: string, ctx: InlineCtx): string | null {
  const parts = inner.split(";").map((p) => p.trim());
  let any = false;
  const out = parts.map((p) => {
    const m = /^([A-Za-z][A-Za-z0-9-]*)(?:,\s*(.+))?$/.exec(p);
    if (!m || !knownSource(m[1])) return esc(p);
    any = true;
    const id = m[1];
    if (!ctx.cites.includes(id)) ctx.cites.push(id);
    const rest = (m[2] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const st = rest.length ? normStatus(rest[0]) : null;
    const extra = (st ? rest.slice(1) : rest).map(esc).join(", ");
    return `<span class="hx-ref" data-pop="src:${escA(id)}">${esc(label(id))}</span>${st ? `&nbsp;${badgeHTML(st)}` : ""}${extra ? ` <span class="hx-x">${extra}</span>` : ""}`;
  });
  return any ? `<span class="hx-cg">[${out.join("; ")}]</span>` : null;
}

/** Inline conversion of one manuscript line or cell: escape, citations, bold, code, notation, cross references. */
export function inline(src: string, ctx: InlineCtx): string {
  // protect citation groups first (they contain ids with digits that the notation pass must not touch)
  const slots: string[] = [];
  const hold = (h: string): string => `\u0000${slots.push(h) - 1}\u0000`;
  let t = src.replace(/\[([^[\]]+)\]/g, (m, inner: string) => { const g = citeGroup(inner, ctx); return g ? hold(g) : m; });
  t = esc(t);
  t = t.replace(/`([^`]+)`/g, (_m, c: string) => hold(`<code>${c}</code>`));
  t = t.replace(/\*\*([^*]+)\*\*/g, (_m, b: string) => `\u0001${b}\u0002`);
  t = t.replace(/"([^"]+)"/g, "&ldquo;$1&rdquo;");
  t = notation(t);
  // cross references: chapters 7.N, hero stories, disputes
  t = t.replace(/(^|[^\d.$A-Za-z])7\.(10|[1-9])(?![\d])(?! M)/g, (m, pre: string, n: string) => {
    if (/USD $/.test(pre)) return m;
    const slug = CH_SLUGS[+n];
    return slug === ctx.here ? `${pre}7.${n}` : `${pre}<a class="lk" href="/history/${slug}/">7.${n}</a>`;
  });
  t = t.replace(/\b(hero story )?(H[1-4])\b/g, (_m, _pre: string | undefined, h: string) => {
    const slug = CH_SLUGS[HERO_CHAPTER[h]];
    const href = slug === ctx.here ? `#${h.toLowerCase()}` : `/history/${slug}/#${h.toLowerCase()}`;
    return `<a class="lk" href="${href}">${HERO_TITLE[h]}</a>`;
  });
  t = t.replace(/\b(D(?:1[0-3]|[1-9]))\b(?![-\d])/g, (_m, d: string) => `<a class="lk" href="/history/#${d.toLowerCase()}">${d}</a>`);
  t = t.replace(/\u0001/g, "<b>").replace(/\u0002/g, "</b>");
  return t.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => slots[+i]);
}

// ---------- block structure ----------
export type Block =
  | { kind: "p"; html: string }
  | { kind: "ul"; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][]; cls: string }
  | { kind: "fig"; fig: string; title: string; cap: string };

export interface Layer { id: string; label: string; blocks: Block[] }
export interface Hero { id: string; no: string; title: string; chapter: number; layers: Layer[] }
export interface ChapterDoc { no: number; slug: string; title: string; span: string; layers: Layer[]; hero?: Hero; cites: string[] }

const splitRow = (l: string): string[] => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
const isSep = (l: string): boolean => /^\|\s*:?-{2,}/.test(l.trim());

function figFrom(text: string, ctx: InlineCtx): Block | null {
  // "Interactive: **Name** (figures.md F7.1). Operating text."  or  "**Interactive (F7.3).** Text"
  let m = /^Interactive:\s*\*\*([^*]+)\*\*\s*\(([^)]*)\)\.?\s*(.*)$/.exec(text);
  if (m) {
    const fig = /F7\.\d+b?/.exec(m[2])?.[0] ?? "";
    return { kind: "fig", fig, title: m[1], cap: inline(m[3].replace(/^[:.]\s*/, ""), ctx) };
  }
  m = /^\*\*Interactive \((F7\.\d+b?)\)\.\*\*\s*(.*)$/.exec(text);
  if (m) return { kind: "fig", fig: m[1], title: "", cap: inline(m[2], ctx) };
  return null;
}

/** Parse a run of lines into blocks. */
function blocks(lines: string[], ctx: InlineCtx, tableCls = "idx"): Block[] {
  const out: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim() || /^---\s*$/.test(l)) { i++; continue; }
    if (l.trim().startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) { if (!isSep(lines[i])) rows.push(splitRow(lines[i])); i++; }
      const [head, ...body] = rows;
      out.push({ kind: "table", head: head.map((h) => inline(h, ctx)), rows: body.map((r) => r.map((c) => cell(c, ctx))), cls: tableCls });
      continue;
    }
    if (/^- /.test(l)) {
      const items: string[] = [];
      while (i < lines.length && /^- /.test(lines[i])) { items.push(inline(lines[i].slice(2), ctx)); i++; }
      out.push({ kind: "ul", items });
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith("|") && !/^- /.test(lines[i])) { para.push(lines[i].trim()); i++; }
    const text = para.join(" ");
    const f = figFrom(text, ctx);
    out.push(f ?? { kind: "p", html: inline(text, ctx) });
  }
  return out;
}

/** Table cell: a lone status code becomes a badge; bare source ids become popup references. */
function cell(c: string, ctx: InlineCtx): string {
  const st = /^(V|P|S|derived)$/.exec(c);
  if (st) return badgeHTML(st[1] as HStatus);
  const multi = /^(V|P|S|derived)\s*\/\s*(V|P|S|derived)$/.exec(c);
  if (multi) return `${badgeHTML(multi[1] as HStatus)} / ${badgeHTML(multi[2] as HStatus)}`;
  // bare ids in source columns: "hatchett1802 (scan p. 65)", "rose1844, rose1846, both ..."
  const slots: string[] = [];
  const marked = c.replace(/\b([a-z][a-z0-9-]*\d{4}[a-z0-9-]*|[a-z]+-[a-z0-9-]+)\b/g, (m) => {
    if (!knownSource(m) || c.includes(`[${m}`)) return m;
    if (!ctx.cites.includes(m)) ctx.cites.push(m);
    return `\u0003${slots.push(m) - 1}\u0003`;
  });
  return inline(marked, ctx).replace(/\u0003(\d+)\u0003/g, (_m, k: string) => `<span class="hx-ref" data-pop="src:${escA(slots[+k])}">${esc(label(slots[+k]))}</span>`);
}

// ---------- manuscript sections ----------
export interface Manuscript { chapters: ChapterDoc[]; disputes: string[][]; disputeHead: string[]; people: string[][]; peopleHead: string[]; regions: Record<string, string[]>; cites: string[] }

export function parseManuscript(md: string): Manuscript {
  const L = md.split("\n");
  const chapters: ChapterDoc[] = [];
  const heroes: Hero[] = [];
  const all: string[] = [];
  let disputes: string[][] = [], disputeHead: string[] = [], people: string[][] = [], peopleHead: string[] = [];
  const regions: Record<string, string[]> = {};

  // index of level-2 headings
  const h2: { i: number; text: string }[] = [];
  L.forEach((l, i) => { if (/^## /.test(l)) h2.push({ i, text: l.slice(3).trim() }); });
  const until = (k: number): number => (k + 1 < h2.length ? h2[k + 1].i : L.length);

  for (let k = 0; k < h2.length; k++) {
    const { i, text } = h2[k];
    const body = L.slice(i + 1, until(k));
    const cm = /^7\.(\d+) (.+?) \((\d{4}-\d{4})\)$/.exec(text);
    if (cm) {
      const no = +cm[1], slug = CH_SLUGS[no];
      const ctx: InlineCtx = { here: slug, cites: [] };
      const layers: Layer[] = [];
      let cur: Layer | null = null, buf: string[] = [];
      const flush = (): void => { if (cur) { cur.blocks = blocks(buf, ctx); layers.push(cur); } buf = []; };
      for (const l of body) {
        const lm = /^### (L[123])$/.exec(l);
        if (lm) { flush(); cur = { id: lm[1].toLowerCase(), label: lm[1], blocks: [] }; continue; }
        buf.push(l);
      }
      flush();
      chapters.push({ no, slug, title: cm[2], span: cm[3], layers, cites: ctx.cites });
      continue;
    }
    if (text === "Hero stories") {
      const starts: number[] = [];
      body.forEach((l, j) => { if (/^### H\d\. /.test(l)) starts.push(j); });
      starts.forEach((s, n) => {
        const hm = /^### (H\d)\. (.+)$/.exec(body[s]) as RegExpExecArray;
        const chap = HERO_CHAPTER[hm[1]];
        const ctx: InlineCtx = { here: CH_SLUGS[chap], cites: [] };
        const seg = body.slice(s + 1, n + 1 < starts.length ? starts[n + 1] : body.length);
        // split on "**L1.**", "**Interactive (F7.x).**", "**L2.**", "**L3.**" paragraphs
        const layers: Layer[] = [];
        let cur: Layer | null = null, buf: string[] = [];
        const flush = (): void => { if (cur) { cur.blocks = blocks(buf, ctx); layers.push(cur); } buf = []; };
        for (const l of seg) {
          const lm = /^\*\*(L[123])\.\*\*\s*(.*)$/.exec(l);
          if (lm) { flush(); cur = { id: lm[1].toLowerCase(), label: lm[1], blocks: [] }; if (lm[2]) buf.push(lm[2]); continue; }
          if (/^\*\*Interactive \(/.test(l)) { buf.push("", l, ""); continue; }
          buf.push(l);
        }
        flush();
        heroes.push({ id: hm[1].toLowerCase(), no: hm[1], title: hm[2], chapter: chap, layers });
        chapters.find((c) => c.no === chap)?.cites.push(...ctx.cites.filter((c) => !chapters.find((x) => x.no === chap)?.cites.includes(c)));
      });
      continue;
    }
    if (text.startsWith("Sidebar: Who did it first")) {
      const ctx: InlineCtx = { here: "", cites: all };
      const rows = body.filter((l) => l.trim().startsWith("|") && !isSep(l)).map(splitRow);
      disputeHead = rows[0].map((h) => inline(h, ctx));
      disputes = rows.slice(1).map((r) => r.map((c, j) => (j === 0 ? c : inline(c, ctx))));
      continue;
    }
    if (text.startsWith("Regional threads")) {
      const key: Record<string, string> = { "USSR / Russia": "USSR", Japan: "JP", Europe: "EU", China: "CN", "Commercial Ti:LN": "TI:LN" };
      body.filter((l) => l.trim().startsWith("|") && !isSep(l)).map(splitRow).slice(1).forEach(([name, ids]) => {
        if (key[name]) regions[key[name]] = ids.split(",").map((s) => s.trim()).filter(Boolean);
      });
      continue;
    }
    if (text === "People and institutions") {
      const ctx: InlineCtx = { here: "", cites: all };
      const rows = body.filter((l) => l.trim().startsWith("|") && !isSep(l)).map(splitRow);
      peopleHead = rows[0];
      people = rows.slice(1).map((r) => r.map((c, j) => (j === 3 ? cell(c, ctx) : inline(c, ctx))));
      continue;
    }
  }
  for (const h of heroes) { const c = chapters.find((x) => x.no === h.chapter); if (c) c.hero = h; }
  return { chapters, disputes, disputeHead, people, peopleHead, regions, cites: all };
}

export const CHAPTER_SLUGS: readonly string[] = CH_SLUGS.slice(1);
