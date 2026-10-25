// Server load helpers for chapter-05 routes: one section's HTML per depth layer, its popups and footer status codes,
// and (when the page shows process steps) the Process viewer payload. Server only.
import type { PageMeta, StatusCode } from "$lib/content/site";
import type { Pop } from "$lib/content/pops";
import { newBook, sectionHTML, type SectionHTML } from "./md";
import { buildFlow } from "./flow-build";
import type { FlowData } from "./flow";
import { PopBook } from "./sources";
import { mkBy, MK_SECTIONS } from "./sections";

export interface SectionLoad {
  meta: Partial<PageMeta>;
  sec: SectionHTML & { slug: string; prev: { no: string; slug: string; short: string } | null; next: { no: string; slug: string; short: string } | null; steps: string[]; start: string | null };
  pops: Record<string, Pop>;
  flow: FlowData | null;
  extra: Record<string, unknown>;
}

const ORDER: StatusCode[] = ["P", "P-comp", "P-db", "S", "V", "U", "reported", "derived", "template", "engine"];

export type Cite = [key: string, h: string, body: string, src: string | null, loc: string, code: StatusCode | null];

export async function loadSection(no: string, opts: { flow?: boolean; extraCodes?: StatusCode[]; description: string; cites?: Cite[]; build?: (book: PopBook) => void; extra?: Record<string, unknown> } ): Promise<SectionLoad> {
  const book = await newBook(`mk${no.replace(".", "")}`);
  const sec = await sectionHTML(no, book);
  const s = mkBy(no);
  const i = MK_SECTIONS.indexOf(s);
  const nb = (k: number): { no: string; slug: string; short: string } | null => (MK_SECTIONS[k] ? { no: MK_SECTIONS[k].no, slug: MK_SECTIONS[k].slug, short: MK_SECTIONS[k].short } : null);
  let flow: FlowData | null = null;
  if (opts.flow || s.steps.length) {
    const f = await buildFlow(book.idx);
    flow = f.flow;
    // section pages ship only their own steps (the full viewer pages ship all)
    const keep = opts.flow ? null : new Set(s.steps);
    if (keep) flow = { ...flow, steps: flow.steps.filter((st) => keep.has(st.id)) };
    for (const [k, v] of Object.entries(f.pops)) if (!keep || keep.has(k.slice(3).split(".")[0])) book.pops[k] = v;
    book.code("reported"); book.code("derived"); book.code("template");
  }
  // figure popups: [popKey, heading, body, sourceKey | null, locator, statusCode]
  for (const [key, h, body, src, loc, code] of opts.cites ?? []) {
    book.put(key, { h, body, src: src ? src.split(",").map((k) => book.idx.cite(k.trim(), loc || undefined)).join("<br>") : undefined });
    if (code) book.code(code);
  }
  opts.build?.(book);
  for (const c of opts.extraCodes ?? []) book.code(c);
  const keys = ORDER.filter((c) => book.codes.has(c));
  return {
    meta: { title: `${no} ${sec.title}`, description: opts.description, keys, aside: "bias" },
    sec: { ...sec, slug: s.slug, prev: nb(i - 1), next: nb(i + 1), steps: s.steps, start: s.start ?? null },
    pops: book.pops,
    flow,
    extra: opts.extra ?? {},
  };
}
