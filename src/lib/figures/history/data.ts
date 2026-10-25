// Chapter 07 History: static page data (client-safe). Chapter list, anchor events, accents, images (transcribed from
// content/chapters/07-history/images.yaml; only `use: ok` and `use: attrib` entries are shipped), curated dispute claims
// (manuscript sidebar D1-D13), bit-rate points (manuscript 7.7), news-ticker kinds (manuscript 7.10, figures.md F7.10).
import type { HStatus } from "./status";

export interface ChapterMeta {
  no: number; slug: string; title: string; span: string;
  /** Three anchor events (events-history.json ids) shown on the VISUAL chapter card. */
  anchors: [string, string, string];
  /** Accent token by physics (figures.md F7.0 "Color"); IR accents are drawn dashed. */
  accent: "neutral" | "l532" | "ir1550" | "au";
  /** Figure ids placed on the chapter page (figures.md). */
  figs: string[];
}

export const CHAPTERS7: readonly ChapterMeta[] = [
  { no: 1, slug: "a-crystal-on-paper", title: "A crystal on paper", span: "1801-1958", accent: "neutral", figs: ["F7.1"], anchors: ["h-1844-rose-niobium", "h-1917-czochralski", "h-1949-matthias-remeika"] },
  { no: 2, slug: "bell-labs-grows-a-crystal", title: "Bell Labs grows a crystal", span: "1960-1967", accent: "neutral", figs: ["F7.2", "F7.2b"], anchors: ["h-1964-boyd-nlo", "h-1965-giordmaine-miller-opo", "h-1966-ferroelectric-ln-series"] },
  { no: 3, slug: "damage-to-memory", title: "The damage that became a memory", span: "1966-2018", accent: "l532", figs: ["F7.3"], anchors: ["h-1966-ashkin-optical-damage", "h-1968-chen-holography", "h-1971-staebler-amodei-fixing"] },
  { no: 4, slug: "sound-on-a-crystal", title: "Sound on a crystal", span: "1965-2022", accent: "au", figs: ["F7.4"], anchors: ["h-1965-white-voltmer-idt", "h-1972-yamanouchi-leaky-saw", "h-1976-shibayama-128"] },
  { no: 5, slug: "light-in-a-channel", title: "Light in a channel", span: "1973-1991", accent: "ir1550", figs: ["F7.5", "F7.5b"], anchors: ["h-1973-kaminow-thin-film", "h-1974-schmidt-kaminow-ti", "h-1985-crystal-technology-modulator"] },
  { no: 6, slug: "taming-the-crystal", title: "Taming the crystal", span: "1962-2021", accent: "l532", figs: ["F7.6"], anchors: ["h-1962-abdp-qpm", "h-1980-zhong-mgo", "h-1993-yamada-field-poling"] },
  { no: 7, slug: "the-internets-modulator", title: "The internet's modulator", span: "1985-2021", accent: "ir1550", figs: ["F7.7"], anchors: ["h-1992-seino-fujitsu-drift", "h-2009-fujitsu-dpqpsk", "h-2021-fujitsu-millionth"] },
  { no: 8, slug: "peeling-the-crystal", title: "Peeling the crystal", span: "1995-2014", accent: "neutral", figs: ["F7.8"], anchors: ["h-1995-bruel-smart-cut", "h-1998-levy-cis", "h-2004-rabiei-gunter"] },
  { no: 9, slug: "thin-film-renaissance", title: "The thin-film renaissance", span: "2017-2023", accent: "neutral", figs: ["F7.9"], anchors: ["h-2017-zhang-microring", "h-2018-wang-nature", "h-2022-xu-dp-iq"] },
  { no: 10, slug: "ai-data-center", title: "Into the AI data center", span: "2023-2026", accent: "neutral", figs: ["F7.10"], anchors: ["h-2024-wang-tflt", "h-2025-sal-8inch", "h-2026-hyperlight-umc"] },
];
export const chapterBySlug = (s: string): ChapterMeta | undefined => CHAPTERS7.find((c) => c.slug === s);
export const chapterHref7 = (c: ChapterMeta): string => `/history/${c.slug}/`;

export const HEROES: readonly { id: string; no: string; title: string; chapter: number; fig: string; figTitle: string }[] = [
  { id: "h1", no: "H1", title: "The damage that became a memory", chapter: 3, fig: "F7.3", figTitle: "Write, fix, erase" },
  { id: "h2", no: "H2", title: "The first OPO", chapter: 2, fig: "F7.2b", figTitle: "OPO dial" },
  { id: "h3", no: "H3", title: "What \"thin film\" meant: 1973 vs 2018", chapter: 5, fig: "F7.5b", figTitle: "1973 vs 2018 cross-sections" },
  { id: "h4", no: "H4", title: "The stripes", chapter: 6, fig: "F7.6", figTitle: "Flip the stripes" },
];

// ---------- images (images.yaml, checked 2026-10-25 on Wikimedia Commons) ----------
export interface Img { key: string; src: string; w: number; h: number; subject: string; license: string; licenseUrl?: string; author: string; page: string; caption: string; chapter: number }
export const IMAGES: Readonly<Record<string, Img>> = {
  rose: { key: "rose", src: "/data/history/img/rose.jpg", w: 330, h: 491, subject: "Heinrich Rose, lithograph (Austrian National Library original)", license: "Public domain", author: "Rudolph Hoffmann (lithograph)", page: "https://commons.wikimedia.org/wiki/File:Heinrich_Rose_Litho.jpg", caption: "Heinrich Rose, who named niobium in 1844.", chapter: 1 },
  berzelius: { key: "berzelius", src: "/data/history/img/berzelius.jpg", w: 330, h: 420, subject: "Jons Jacob Berzelius, portrait, 1826", license: "Public domain", author: "John Way (per file page)", page: "https://commons.wikimedia.org/wiki/File:J%C3%B6ns_Jacob_Berzelius_1826.jpg", caption: "Berzelius, who named lithium after the Greek for stone.", chapter: 1 },
  hatchett: { key: "hatchett", src: "/data/history/img/hatchett.jpg", w: 330, h: 428, subject: "Charles Hatchett, lithograph by W. Drummond, 1836", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0/", author: "Wellcome Collection", page: "https://commons.wikimedia.org/wiki/File:Charles_Hatchett._Lithograph_by_W._Drummond,_1836,_after_T._Wellcome_V0002613.jpg", caption: "Charles Hatchett, who named columbium in 1801.", chapter: 1 },
  czochralski: { key: "czochralski", src: "/data/history/img/czochralski.jpg", w: 330, h: 350, subject: "Jan Czochralski, about 1910", license: "Public domain", author: "Unknown", page: "https://commons.wikimedia.org/wiki/File:J._Czochralski_ca_1910.jpg", caption: "Jan Czochralski, about 1910.", chapter: 1 },
  ashkin: { key: "ashkin", src: "/data/history/img/ashkin.jpg", w: 330, h: 312, subject: "Arthur Ashkin at Nobel week, 2018-12-08", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0/", author: "Bengt Nyman", page: "https://commons.wikimedia.org/wiki/File:Arthur_Ashkin_D81_2485_(44417144580)_(cropped).jpg", caption: "Arthur Ashkin, Stockholm, 2018.", chapter: 3 },
  belllabs: { key: "belllabs", src: "/data/history/img/belllabs.jpg", w: 960, h: 697, subject: "Bell Telephone Laboratories, Murray Hill NJ, 1942 (Library of Congress, Gottscho-Schleisner)", license: "Public domain", author: "Gottscho-Schleisner Collection", page: "https://commons.wikimedia.org/wiki/File:Bell_Telephone_Laboratories,_Murray_Hill,_New_Jersey._LOC_gsc.5a08712.jpg", caption: "Bell Telephone Laboratories, Murray Hill, 1942.", chapter: 2 },
  nist: { key: "nist", src: "/data/history/img/nist-crystal.jpg", w: 960, h: 573, subject: "Small LN crystal in a NIST quantum-optics setup, 2012", license: "Public domain (NIST, US Government work)", author: "National Institute of Standards and Technology", page: "https://commons.wikimedia.org/wiki/File:Lithium_Niobate_Crystal_(7788237698).jpg", caption: "A lithium niobate crystal in a NIST quantum-optics experiment, 2012.", chapter: 6 },
  wafer: { key: "wafer", src: "/data/history/img/wafer.jpg", w: 960, h: 720, subject: "LN single-crystal wafer", license: "CC0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/", author: "Smithy71", page: "https://commons.wikimedia.org/wiki/File:Lithium_Niobate_Wafer.jpg", caption: "A lithium niobate wafer.", chapter: 8 },
};
/** Portrait per people-table row (row index in the manuscript table). Other rows get a 3m ornament with initials. */
export const PORTRAIT_ROW: Readonly<Record<number, string>> = { 0: "hatchett", 1: "berzelius", 2: "rose", 3: "czochralski", 7: "ashkin" };
/** Chapter page photo (figure slot after L1). */
export const CHAPTER_IMAGE: Readonly<Record<number, string>> = { 1: "rose", 2: "belllabs", 3: "ashkin", 6: "nist", 8: "wafer" };

// ---------- disputes (manuscript "Sidebar: Who did it first?") ----------
export interface Claim { date: string; text: string; cites: [string, HStatus | null][] }
export interface Dispute { id: string; q: string; claims: Claim[]; verdict: string }
export const DISPUTES: readonly Dispute[] = [
  { id: "D1", q: "When was LiNbO3 first made or reported?", verdict: "Structure reported 1928; ferroelectric single crystals 1949. The 2023 \"70 years\" phrase is approximate and later than the 1949 letter.", claims: [
    { date: "1928", text: "Zachariasen thesis, as cited by Matthias & Remeika 1949", cites: [["zachariasen1928", "P"], ["matthias1949", "V"]] },
    { date: "1949", text: "Ferroelectric single crystals", cites: [["matthias1949", "V"]] },
    { date: "~1953", text: "Boes et al. 2023: \"first synthesized 70 years ago\"", cites: [["boes2023", "V"]] }] },
  { id: "D2", q: "Is LN an ilmenite?", verdict: "Related to ilmenite, distinct cation order; not ilmenite.", claims: [
    { date: "1949", text: "Matthias & Remeika call it ilmenite and note ilmenite is centrosymmetric", cites: [["matthias1949", "V"]] },
    { date: "1966", text: "Structure R3c", cites: [["abrahams1966a", "V"]] }] },
  { id: "D3", q: "First Czochralski LN", verdict: "Both 1965; credit both.", claims: [
    { date: "1965-02", text: "Ballman, US", cites: [["ballman1965", "P"]] },
    { date: "1965", text: "Fedulov et al., USSR; exact month unknown", cites: [["fedulov1965", "P"]] }] },
  { id: "D4", q: "MgO:LN priority and origin", verdict: "1980 first (conference abstract), 1984 first journal paper. Affiliation of the 1980 abstract open.", claims: [
    { date: "1980-06", text: "Zhong, Jin, Wu, IQEC abstract", cites: [["iqec1980", "P"]] },
    { date: "1983", text: "Zhong's paper lists SWITP Chengdu; the common attribution of the 1980 work to Nankai is not supported", cites: [["zhong1983", "V"]] },
    { date: "1984", text: "Bryan et al., journal paper", cites: [["bryan1984", "V"]] }] },
  { id: "D5", q: "Who invented QPM?", verdict: "A sequence, not one inventor.", claims: [
    { date: "1962", text: "Armstrong et al.", cites: [["armstrong1962", "V"]] },
    { date: "1963", text: "Franken & Ward, also credited", cites: [["franken1963", "P"]] },
    { date: "1980", text: "First LN experiment", cites: [["feng1980", "V"]] },
    { date: "1989", text: "Waveguide", cites: [["lim1989a", "V"]] },
    { date: "1993", text: "Field poling", cites: [["yamada1993", "V"]] }] },
  { id: "D6", q: "Was the IDT invented on LN?", verdict: "Quartz, 1965.", claims: [
    { date: "1965", text: "No: quartz", cites: [["whitevoltmer1965preprint", "V"]] }] },
  { id: "D7", q: "First 8-inch TFLN", verdict: "No single \"first\"; each claim with date and grade.", claims: [
    { date: "2023-09", text: "Anpai, Wuhan line (reporter: \"world's first\")", cites: [["sina-2024", "S"]] },
    { date: "2024-03", text: "Jiufengshan Lab, first 8-inch Si-photonic TFLN wafer (reporter claim)", cites: [["sina-2024", "S"]] },
    { date: "2025-09-25", text: "SAL, \"First 8-Inch TFLN Wafer\"", cites: [["sal-2025", "V"]] },
    { date: "2025", text: "8-inch bulk LN wafers (TDG) are a different product", cites: [["cls-2025", "S"]] }] },
  { id: "D8", q: "First 3-inch LNOI", verdict: "2012 published; 2015 claim conflicts.", claims: [
    { date: "2012", text: "Poberaj et al. report LNOI \"even as wafer of 3-inch diameter\"", cites: [["poberaj2012", "V"]] },
    { date: "2015", text: "NANOLN news piece claims a world-first 3-inch film", cites: [["ifeng-2026", "S"]] }] },
  { id: "D9", q: "First commercial thin-film LN modulator", verdict: "Fujitsu's claim is class-scoped; stated with its scope.", claims: [
    { date: "2021-10-22", text: "Fujitsu, scoped to \"200GBaud class\"", cites: [["fujitsu-2021b", "V"]] },
    { date: "2022", text: "A HyperLight TFLN modulator inside an 800G transceiver demo at OFC 2022", cites: [["lightwave-2022", "S"]] }] },
  { id: "D10", q: "Czochralski 1916, 1917 or 1918?", verdict: "Discovery 1916, publication 1917 (volume 1918).", claims: [
    { date: "1916-08-19", text: "Received; issued 1917-04-24; volume dated 1918", cites: [["czochralski1918", "V"]] },
    { date: "1916", text: "Pen anecdote", cites: [["malecka2013", "S"]] }] },
  { id: "D11", q: "Niobium named 1844 or 1846?", verdict: "1844.", claims: [
    { date: "1844", text: "Niobium", cites: [["rose1844", "V"]] },
    { date: "1846", text: "Pelopium", cites: [["rose1846", "V"]] }] },
  { id: "D12", q: "First OPO crystal's origin", verdict: "Bell Labs crystals; growth route not documented here.", claims: [
    { date: "1965", text: "Record item credits Ballman (growth) and Nassau and Levinstein (quality)", cites: [["belllabsrecord1965", "S"]] }] },
  { id: "D13", q: "First laser in an LN waveguide", verdict: "1989 Nd-doped; 1991 Er-doped at 1.532 um.", claims: [
    { date: "1989-10-26", text: "Nd:MgO:LiNbO3 channel-waveguide laser, Electron. Lett.", cites: [["lallier1989", "V"]] },
    { date: "1991", text: "Brinkmann et al. call their Er:Ti:LN laser \"the first integrated optical laser in LiNbO3\"", cites: [["brinkmann1991", "V"]] }] },
];

// ---------- F7.7 bit rate by decade (manuscript 7.7 L1/L2) ----------
export const BITRATE: readonly { year: number; gbps: number; label: string; src: string; st: HStatus; kind: "product" | "research"; note?: string }[] = [
  { year: 1997, gbps: 10, label: "UTP: 10 Gb/s LN modulators", src: "lightwave-1997", st: "S", kind: "product" },
  { year: 1998, gbps: 20, label: "Lucent X2600 family for 10 and 20 Gb/s", src: "lightwave-1998", st: "S", kind: "product" },
  { year: 2000, gbps: 40, label: "Wooten et al.: LN modulators for 2.5, 10 and 40 Gb/s systems", src: "wooten2000", st: "V", kind: "product" },
  { year: 2009, gbps: 100, label: "Fujitsu DP-QPSK LN modulator for 100 Gb/s", src: "fujitsu-2009", st: "V", kind: "product", note: "vendor claim" },
  { year: 2022, gbps: 1960, label: "Dual-polarization TFLN IQ modulator: 1.96 Tb/s net, single wavelength", src: "xu2022", st: "V", kind: "research" },
];

// ---------- F7.10 ticker (kinds assigned from each event's title and notes) ----------
export type TickKind = "paper" | "foundry" | "funding" | "product" | "standard" | "institution" | "corpus";
export const TICK_KIND: Readonly<Record<string, TickKind>> = {
  "h-2021-fujitsu-tfln": "product", "h-2021-hu-frequency-shifter": "paper", "h-2022-elena": "funding", "h-2022-xu-dp-iq": "paper",
  "h-2022-hust-huawei": "paper", "h-2022-luxtelligence": "foundry", "h-2023-lightium": "foundry", "h-2023-boes-review": "paper",
  "h-2023-snigirev-laser": "paper", "h-2023-anpai-8inch": "foundry", "h-2024-wang-tflt": "paper", "h-2024-chipx": "foundry",
  "h-2024-hyperlight-series-b": "funding", "h-2024-qant-npu": "product", "h-2025-afr-volume": "product", "h-2025-tdg-8inch": "product",
  "h-2025-ccraft": "foundry", "h-2025-elena-lnoi": "product", "h-2025-lam-4inch-quartz": "paper", "h-2025-sal-8inch": "foundry",
  "h-2025-imec-ecoc": "paper", "h-2025-gbt-46611": "standard", "h-2026-ligentec-xfab": "foundry", "h-2026-niels-tflt-sip": "paper",
  "h-2026-ofc-corpus": "corpus", "h-2026-hyperlight-umc": "foundry", "h-2026-ofc-1p6t": "product", "h-2026-imec-double": "institution",
  "h-2026-hyperlight-series-c": "funding", "h-2026-starnault-circulator": "paper",
};

/** Figure titles (figures.md) and whether the figure is built on its chapter page. */
export const FIGS: Readonly<Record<string, { title: string; built: boolean }>> = {
  "F7.1": { title: "Family tree of names", built: true },
  "F7.2": { title: "Pull a boule", built: true },
  "F7.2b": { title: "OPO dial", built: true },
  "F7.3": { title: "Write, fix, erase", built: true },
  "F7.4": { title: "SAW ripple", built: true },
  "F7.5": { title: "Diffusion profile", built: true },
  "F7.5b": { title: "1973 vs 2018", built: true },
  "F7.6": { title: "Flip the stripes", built: true },
  "F7.7": { title: "Bit rate by decade", built: true },
  "F7.8": { title: "Ion slice", built: true },
  "F7.9": { title: "Before and after 2018", built: true },
  "F7.10": { title: "Dated news ticker", built: true },
};

/** Sources the chapter figures cite beyond the chapter text (merged into the page's reference list). */
export const FIG_SOURCES: Readonly<Record<number, readonly string[]>> = {
  1: ["ekeberg1802", "rose1844", "rose1844bericht", "rose1846", "rose1846bericht", "marignac1866", "wollaston1809", "raynercanham2008", "vanderkrogt-nb", "hatchett1802", "arfwedson1818", "berzelius1818", "weeks1932", "zachariasen1928", "matthias1949"],
  2: ["czochralski1918", "ballman1965", "fedulov1965", "jundt1997", "zelmon1997", "luh1987", "belllabsrecord1965", "myers1995a", "myers1995b"],
  3: ["chen1968", "chen1969", "amodei1971b", "bryan1984"],
  4: ["kushibiki1999", "whitevoltmer1965preprint"],
  5: ["carruthers1974", "rabiei2004", "kaminow1973", "wang2018b", "schmidt1974", "jackel1982", "zelmon1997"],
  6: ["armstrong1962", "feng1980", "xue1983", "lim1989a", "magel1990", "fejer1992", "yamada1993", "myers1995a", "zhu1997", "nishida2003", "wang2018c", "lu2019", "zelmon1997"],
  7: ["lightwave-1997", "lightwave-1998", "wooten2000", "fujitsu-2009", "xu2022"],
  8: ["us6540827", "levy1998", "rabiei2004"],
};

/** Claim tags for ticker rows (from each event's notes): who makes the claim the row restates. */
export const TICK_CLAIM: Readonly<Record<string, "vendor" | "reporter" | "institution">> = {
  "h-2021-fujitsu-tfln": "vendor", "h-2024-qant-npu": "vendor", "h-2025-afr-volume": "vendor", "h-2025-tdg-8inch": "vendor",
  "h-2025-ccraft": "vendor", "h-2026-hyperlight-umc": "vendor", "h-2026-ofc-1p6t": "vendor", "h-2023-anpai-8inch": "reporter",
  "h-2026-imec-double": "institution", "h-2026-niels-tflt-sip": "institution",
};
