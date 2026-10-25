// 8.8 Events: the generated industry events (public set, src/lib/generated/events-industry.json) as a timeline (F8.09).
import type { PageMeta } from "$lib/content/site";
import { EVENTS } from "$lib/figures/industry/server";

const REGION: Record<string, string> = { china: "CN", us: "US", europe: "EU", japan: "JP", taiwan: "TW" };
const stage = (t: string[]): string =>
  t.includes("foundry") ? "foundry" : t.includes("wafer") ? "wafer" : t.some((x) => ["product", "modulator", "transceiver"].includes(x)) ? "product" : t.includes("funding") ? "funding" : "other";

export const load = () => {
  const meta: Partial<PageMeta> = {
    title: "Industry Events",
    description: "Chapter 8.8: dated lithium niobate industry events 2020-2026 with source URL, access date, and evidence grade; filter by grade, region, and stage.",
    keys: [],
  };
  const evs = [...EVENTS].sort((a, b) => a.date.localeCompare(b.date)).map((e) => ({
    id: e.id, date: e.date, title: e.title.replace(/\s*\(background\)/, "").replace(/\(per c114; text partly garbled\)/i, "(C114 report; month uncertain)"), grade: e.grade, region: e.tags.map((t) => REGION[t]).filter(Boolean), stage: stage(e.tags),
    url: e.citations[0]?.url ?? "", src: (e.citations[0]?.text ?? "").replace(/,? read in full by lane C\d+/i, "").replace(/403; content via search snippet, /, "content via ").replace(/\s*\(\s*\)/, ""), accessed: e.citations[0]?.accessed ?? e.access_date, orgs: e.organizations.join("; "),
    note: (e.date_note ?? "").replace(/\s*\([^)]*\b(C0\d|R0\d|lane)[^)]*\)/g, ""),
  }));
  return { meta, evs };
};
