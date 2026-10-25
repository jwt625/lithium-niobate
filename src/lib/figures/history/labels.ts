// Visible short names of sources ("Rose 1844") for components that render citations in the browser. The page sets the
// map from its server load (content.ts label()) before its figures render; unknown ids fall back to the id.
const L = new Map<string, string>();
export function setLabels(m: Record<string, string>): void { for (const [k, v] of Object.entries(m)) L.set(k, v); }
export const lab = (id: string): string => L.get(id) ?? id;
