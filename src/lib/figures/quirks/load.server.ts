// Shared server load for chapter 04 section pages: shell meta, reference pops and list (refs.yaml), chapter glossary pops.
import type { PageMeta, StatusCode } from "$lib/content/site";
import { glossPops, refData } from "./refs.server.ts";
import { QSECTIONS, sectionBySlug } from "./sections.ts";

export async function sectionLoad(slug: string, keys: StatusCode[], description: string) {
  const sec = sectionBySlug(slug);
  // list: this section's references; popups: every chapter reference, so shared figures (ring sweep on 4.3 and 4.8) resolve
  const all = [...new Set(QSECTIONS.flatMap((s) => s.refs).concat(["weis1985", "moretti2005", "xu2021oe", "lin2021", "schwesyg2011", "jundt1997"]))];
  const [refs, allRefs, gloss] = await Promise.all([refData(sec.refs), refData(all), glossPops()]);
  refs.pops = { ...allRefs.pops, ...refs.pops };
  refs.short = { ...allRefs.short, ...refs.short };
  const meta: Partial<PageMeta> = { title: `${sec.no} ${sec.short}`, description, keys, aside: "bias" };
  return { meta, slug, refs, gloss };
}
