// /data/: property explorer over every public record (scalars and tensors), property index, pointers to the dispersion
// viewer and the API documentation.
import type { PageMeta } from "$lib/content/site";
import INDEX from "$lib/generated/index.json";
import { dataRows, VARIANT_NAMES } from "$lib/figures/p09/data.server";

export const load = () => {
  const meta: Partial<PageMeta> = {
    title: "Data",
    description: "Lithium niobate property data: every public record with value, unit, conditions, frame, source with DOI and locator, and status; per-property pages with JSON and CSV endpoints.",
    keys: ["P", "P-comp", "P-db", "S", "V", "derived"],
  };
  const { rows, props } = dataRows();
  const statuses = [...new Set(rows.map((r) => r.st))].sort((a, b) => ["P", "P(abs)", "P-comp", "P-db", "S", "V", "C"].indexOf(a) - ["P", "P(abs)", "P-comp", "P-db", "S", "V", "C"].indexOf(b));
  const variants = [...new Set(rows.map((r) => r.v))].sort().map((id) => ({ id, name: VARIANT_NAMES[id] ?? id }));
  const counts = (INDEX as { counts: Record<string, unknown> }).counts;
  return { meta, rows, props, statuses, variants, counts };
};
