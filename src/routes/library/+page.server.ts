// /library/: review papers, every chapter reference merged by DOI (filters: chapter, section, decade, text), and the
// LN publication set from src/lib/generated/publications.json.
import type { PageMeta } from "$lib/content/site";
import PUBS from "$lib/generated/publications.json";
import { library } from "$lib/figures/p09/library.server";
import { REVIEWS, REVIEW_GAPS } from "$lib/figures/p09/reviews";

interface Pub { id: string; title: string; authors: string[]; container_title?: string; issued: string; doi?: string; url?: string; topics?: string[]; type: string; access?: { oa_status?: string }; ln_class?: string; page?: string; volume?: string }

export const load = async () => {
  const meta: Partial<PageMeta> = {
    title: "Library",
    description: "Lithium niobate literature: review papers with scope and open-access status, every reference cited on the site merged by DOI with chapter, section and year filters, and a publication set on thin-film LN phononics and transduction.",
  };
  const { refs, secs, perCh, total } = await library();
  const byDoi = new Map(refs.filter((r) => r.d).map((r) => [r.d as string, r.ch]));
  const reviews = REVIEWS.map((r) => ({ ...r, ch: byDoi.get(r.id.toLowerCase()) ?? [] }));
  const years = new Map<string, number>();
  for (const r of refs) if (r.y) years.set(r.y, (years.get(r.y) ?? 0) + 1);
  const pubs = (PUBS as Pub[]).slice().sort((a, b) => b.issued.localeCompare(a.issued)).map((p) => ({ id: p.id, title: p.title, authors: p.authors.join(", "), venue: [p.container_title, p.volume, p.page].filter(Boolean).join(" ") || (p.type === "thesis" ? "PhD thesis, Stanford University" : ""), year: p.issued.slice(0, 4), date: p.issued, doi: p.doi, url: p.url, topics: p.topics ?? [], oa: p.access?.oa_status ?? "unknown", cls: p.ln_class ?? "", type: p.type }));
  const topicCount = new Map<string, number>();
  for (const p of pubs) for (const t of p.topics) topicCount.set(t, (topicCount.get(t) ?? 0) + 1);
  const topTopics = [...topicCount.entries()].sort((a, b) => b[1] - a[1]);
  return { meta, refs, secs: secs.filter((s) => s.n > 0), perCh, total, reviews, gaps: REVIEW_GAPS, years: [...years.entries()].sort(), pubs, topTopics };
};
