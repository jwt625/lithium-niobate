// Chapter 07 History, chapter pages 7.1-7.10 (one route, prerendered for each slug). Text: manuscript.md parsed at build
// time (L1/L2/L3 and the chapter's hero story); events of the chapter; source popups for every citation on the page.
import { error } from "@sveltejs/kit";
import { readFileSync } from "node:fs";
import type { EntryGenerator } from "./$types";
import { KEY_SETS, type PageMeta } from "$lib/content/site";
import { manuscript, events, sourcePops, sourceLabels } from "$lib/figures/history/load";
import { CHAPTERS7, FIG_SOURCES, chapterBySlug } from "$lib/figures/history/data";
import { knownSource } from "$lib/figures/history/content";

export const entries: EntryGenerator = () => CHAPTERS7.map((c) => ({ slug: c.slug }));

export const load = async ({ params }) => {
  const meta7 = chapterBySlug(params.slug);
  if (!meta7) error(404, "no such chapter");
  const ms = await manuscript();
  const doc = ms.chapters.find((c) => c.no === meta7.no);
  if (!doc) error(500, `chapter 7.${meta7.no} missing in manuscript`);
  const evs = events(ms.regions).filter((e) => e.ch === meta7.no);
  const cites = [...doc.cites, ...(FIG_SOURCES[meta7.no] ?? []).filter((id) => !doc.cites.includes(id) && knownSource(id))];
  const first = doc.layers[0]?.blocks.find((b) => b.kind === "p");
  const lede = first && first.kind === "p" ? first.html.replace(/<span class="hx-cg">\[.*?\]<\/span>/g, "").replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").split(/(?<=\.)\s/)[0] : "";
  const meta: Partial<PageMeta> = { title: `7.${doc.no} ${doc.title}`, description: `Lithium niobate history, ${doc.span}: ${lede}`.slice(0, 300), keys: [], keyDefs: KEY_SETS.history };
  const tick = meta7.no === 10 ? events(ms.regions).filter((e) => e.ch === 10 || (e.ch === 9 && e.date >= "2021-10")).reverse() : [];
  const atlas = meta7.no === 9 ? atlasPoints() : null;
  return { meta, doc: { ...doc, cites }, atlas, evs, tick, srcPops: sourcePops(cites), labels: sourceLabels(cites), no: meta7.no };
};

/** Fig. "Before and after 2018": thin-film LN/LT modulator rows of the eo-modulator-atlas subset vendored by the devices
 *  lane (static/data/devices/atlas-ln.json, pinned commit in its provenance file); telecom band, V_pi L and 3 dB
 *  bandwidth both present. */
interface AtlasDev { device_id: string; paper_id: string; platform: string; vpil_best?: number; bw3db_ghz?: number; telecom?: boolean; year?: number; qualifiers?: string; vpil_source?: string }
interface AtlasPaper { paper_id: string; title: string; year: number; venue?: string; doi?: string; url?: string; first_author?: string }
function atlasPoints() {
  const raw = JSON.parse(readFileSync("static/data/devices/atlas-ln.json", "utf8")) as { source: { repo: string; sha: string; commit_date: string }; devices: AtlasDev[]; papers: AtlasPaper[] };
  const papers = new Map(raw.papers.map((p) => [p.paper_id, p]));
  const pts = raw.devices
    .filter((d) => (d.platform === "TFLN" || d.platform === "TFLT") && d.telecom && d.vpil_best && d.bw3db_ghz && d.year)
    .map((d) => { const p = papers.get(d.paper_id); return { id: d.device_id, pl: d.platform, vpil: d.vpil_best as number, bw: d.bw3db_ghz as number, year: d.year as number, gt: (d.qualifiers ?? "").includes("bw3db_ghz:gt"), who: p ? `${p.first_author ?? ""} ${p.year}`.trim() : "", title: p?.title ?? "", venue: p?.venue ?? "", doi: p?.doi ?? "", url: p?.url ?? "" }; })
    .sort((a, b) => a.year - b.year || (a.id < b.id ? -1 : 1));
  return { repo: raw.source.repo, sha: raw.source.sha.slice(0, 7), date: raw.source.commit_date, pts };
}
