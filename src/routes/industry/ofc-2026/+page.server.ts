// 8.5 OFC 2026 snapshot: board of LN/LT-platform papers; theme counts over the board rows.
import type { PageMeta } from "$lib/content/site";
export const load = () => {
  const meta: Partial<PageMeta> = {
    title: "OFC 2026",
    description: "Chapter 8.5: thin-film LN and LT at the 2026 Optical Fiber Communication Conference (2026-03): 15 papers, postdeadline results, themes, DOIs.",
    keys: ["reported", "derived"],
  };
  return { meta };
};
