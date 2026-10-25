// Chapter 07 History landing: chronology (160 public events), chapter index, disputes, people. All data computed at
// prerender; the client filters the event list (no fetch).
import { KEY_SETS, type PageMeta } from "$lib/content/site";
import { manuscript, events, sourcePops, sourceLabels, recordSeries } from "$lib/figures/history/load";
import { DISPUTES } from "$lib/figures/history/data";
import { inline } from "$lib/figures/history/content";

export const load = async () => {
  const ms = await manuscript();
  const evs = events(ms.regions);
  const ctx = { here: "", cites: [] as string[] };
  const def = inline("By name, stone and Niobe: lithium from the Greek for stone, proposed by Berzelius for the alkali Arfwedson found in petalite [arfwedson1818, V]; niobium after Niobe, daughter of Tantalus, named by Heinrich Rose in a paper read to the Berlin Academy on 1844-10-31 [rose1844, V; rose1844bericht, V]. Its sibling LiTaO3 is stone and Tantalus.", ctx);
  const ids = new Set<string>([...ms.cites, ...ctx.cites, ...DISPUTES.flatMap((d) => d.claims.flatMap((c) => c.cites.map(([id]) => id)))]);
  const meta: Partial<PageMeta> = {
    title: "History",
    description: `Lithium niobate, 1801 to 2026: ${evs.length} dated events with sources and status; ten chapters from the naming of niobium to thin-film wafers; optical damage turned holographic memory, the first OPO, thin film in 1973 and 2018, periodic poling; disputed priorities; people.`,
    keys: [], keyDefs: KEY_SETS.history,
  };
  return { meta, evs, def, people: ms.people, peopleHead: ms.peopleHead, srcPops: sourcePops(ids), labels: sourceLabels(ids), records: recordSeries(), counts: Array.from({ length: 10 }, (_, i) => evs.filter((e) => e.ch === i + 1).length) };
};
