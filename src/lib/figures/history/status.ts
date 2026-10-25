// History status codes (chapter 07 conventions). Data status V (bibliographic record verified) is shown as the site-wide
// code `rec` (site.ts STATUS, KEY_SETS.history); P, S, derived keep their chapter 07 meaning (.b.hp/.hs/.hd, history.css).
export type HStatus = "V" | "P" | "S" | "derived";
export const HSTATUS: Readonly<Record<HStatus, { cls: string; text: string; name: string; def: string }>> = {
  V: { cls: "rec", text: "rec", name: "verified record", def: "The record (Crossref, publisher abstract, archival scan, or the issuing organization's own page) confirms the publication or announcement and the claim restates it. Vendor numbers stay vendor claims." },
  P: { cls: "hp", text: "P", name: "publication confirmed", def: "The publication is confirmed; the stated link or detail comes from a secondary source." },
  S: { cls: "hs", text: "S", name: "secondary only", def: "Secondary source only: trade press, snippet, catalog, or retrospective." },
  derived: { cls: "hd", text: "derived", name: "derived", def: "Computed here from cited values; the method is stated with the value." },
};
export const badgeHTML = (s: HStatus): string => `<span class="b ${HSTATUS[s].cls}" data-pop="hst:${s}">${HSTATUS[s].text}</span>`;

/** Client-side notation for short curated strings: chemical formulas and micrometres (HTML-escaped input expected). */
export const fm = (s: string): string =>
  s.replace(/\b(LiNbO3|LiTaO3|Li2O|Nb2O5|SiO2|Si3N4)\b/g, (m) => m.replace(/(\d+)/g, "<sub>$1</sub>")).replace(/\bum\b/g, "&micro;m");

export const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
