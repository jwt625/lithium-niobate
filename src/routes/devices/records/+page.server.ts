// 6.12 Records: manuscript text, records table (manuscript) and the A6 strip joined with the records dataset.
import { buildSection, meta, typesetText } from "$lib/figures/devices/server";
import { rawContent } from "$lib/content/loader";
import records from "$lib/generated/records.json";
import { recordsFromManuscript } from "$lib/figures/devices/records";

export const load = async () => {
  const b = await buildSection("6.12");
  const rows = recordsFromManuscript(await rawContent("/content/chapters/06-devices/manuscript.md"), records as { id: string; doi?: string; date?: string; as_of?: string }[]);
  for (const r of rows) { r.metric = await typesetText(r.metric); r.value = await typesetText(r.value); r.cond = await typesetText(r.cond); r.who = await typesetText(r.who); }
  return { meta: meta("6.12", "Records (provisional)", "Chapter 6.12: highest published lithium niobate device numbers found, each with date, platform, DOI and verification code.", b.keys), b, rows };
};
