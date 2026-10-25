// 8.6 Market size: published ranges by evidence grade (F8.07). No headline number (author question 9 pending).
import type { PageMeta } from "$lib/content/site";
export const load = () => {
  const meta: Partial<PageMeta> = {
    title: "Market Ranges",
    description: "Chapter 8.6: published market forecasts for thin-film LN modulators and bulk LN crystals, each with its evidence grade; ranges only, no headline number.",
    keys: [],
  };
  return { meta };
};
