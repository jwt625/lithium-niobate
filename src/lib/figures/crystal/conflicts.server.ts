// Cross-section conflict popups of chapter 01 (keys "c:<id>"; picked up by popsFor like r:/t: keys). Values and wording
// from content/chapters/01-crystal/manuscript.md Secs. 3 L3, 8 L3 and open-questions.md B1-B3. Section-specific conflicts
// live in the page's own usePops entries.
import type { Pop } from "$lib/content/pops";

type Cite = (id: string, loc?: string) => string;

export const CONFLICTS: Record<string, (cite: Cite) => Pop> = {
    "c:ps": (cite) => ({
      h: "P<sub>s</sub>: two measured values",
      body:
        `<span class='v'>0.71 C/m<sup>2</sup></span> (71 &micro;C/cm<sup>2</sup>): ${cite("volk2008", "Table 1.1 p. 3; p. 181, P-E loop")}; ${cite("hsu1997", "abstract, \"experimental\"")}.<br>` +
        `<span class='v'>0.80 &plusmn; 0.05 C/m<sup>2</sup></span>: ${cite("gopalan1998", "abstract, P-E loop on congruent and near-stoichiometric crystal, \"relatively insensitive\" to stoichiometry and hydrogen")}.<br>` +
        `The 62 &micro;C/cm<sup>2</sup> near-stoichiometric entry of Volk &amp; Wöhlecke 2008, Table 1.1, cites a paper on stoichiometric LiTaO<sub>3</sub> (${cite("kitamura1998", "Crossref title")}) and is not shown as an LN value. ` +
        `Where one number is needed this chapter computes with 0.71 C/m<sup>2</sup>; 0.80 C/m<sup>2</sup> gives every such value 12.7% larger.`,
      badges: [["pc", "P-comp"], ["p", "P(abs)"]],
    }),
    "c:ec-sln": (cite) => ({
      h: "Near-stoichiometric E<sub>c</sub>: two values in one source",
      body:
        `<span class='v'>6.0&ndash;6.5 kV/mm</span>: ${cite("volk2008", "Table 7.1 p. 185, literature average")}.<br>` +
        `<span class='v'>2.1&ndash;2.5 kV/mm</span>: the same book, p. 118, citing ${cite("gopalan1998", "abstract")}, which gives only the ratio congruent / near-stoichiometric, 4&ndash;5 (C = 0.484 vs 0.498).<br>` +
        `A ratio of about 3 is reported for another near-stoichiometric crystal (${cite("chen2001", "via volk2008 p. 184")}). ` +
        `In kV/cm the two pages read 60&ndash;65 and 21&ndash;25, a factor near 10, which suggests a unit slip in one of them; the sources held do not decide it. Figures use the table value and carry this flag.`,
      badges: [["pc", "P-comp"]],
    }),
    "c:eint-cln": (cite) => ({
      h: "Congruent E<sub>int</sub>: table misprint",
      body:
        `Volk &amp; Wöhlecke 2008, Table 7.1, prints &ldquo;2&ndash;33 kV/cm&rdquo;; its text (p. 181) gives 33.5 kV/cm (first report) and later 22.2 kV/cm (refined), so the entry is read as <span class='v'>22&ndash;33 kV/cm = 2.2&ndash;3.4 kV/mm</span>. ` +
        `${cite("gopalan1998", "abstract")}: about 2.5 kV/mm.`,
      badges: [["pc", "P-comp"]],
    }),
};
