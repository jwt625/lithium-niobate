// 8.7 LN in your life: ten graded cards with visible caveats (F8.08).
import type { PageMeta } from "$lib/content/site";
export const load = () => {
  const meta: Partial<PageMeta> = {
    title: "LN in Your Life",
    description: "Chapter 8.7: where lithium niobate and its sibling LT meet everyday life, from phone filters to data centers and gyroscopes, each card with its caveat and evidence grade.",
    keys: [],
  };
  return { meta };
};
