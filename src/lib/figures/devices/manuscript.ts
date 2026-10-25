// Build-time conversion of content/chapters/06-devices/manuscript.md into page HTML (server loads only). Every sentence
// of page copy comes from the manuscript; this module typesets it (Greek, sub/superscripts, units), turns source tags
// {status | ref | ver} into badges with popups, atlas device ids into popups, tables into boxed tables, and splits each
// section into depth layers with figure slots at the [[F6.nn]] / [[A#]] markers.
import { esc } from "./svgplot.ts";

export interface Ref {
  id: string;
  type?: string;
  first_author?: string;
  n_authors?: number;
  second_author?: string;
  title?: string;
  venue?: string;
  volume?: string;
  pages?: string;
  year?: number;
  doi?: string;
  url?: string;
  numbers_ver?: string;
  note?: string;
  publisher?: string;
  path?: string;
  arxiv?: string;
  sections?: string[];
}

/** Parser for the list-of-maps layout of refs.yaml / glossary.yaml (scalars, quoted strings, [a, b] lists). */
export function parseYamlList(text: string): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  let cur: Record<string, unknown> | null = null;
  const val = (raw: string): unknown => {
    const s = raw.trim();
    if (s.startsWith("[") && s.endsWith("]")) return s.slice(1, -1).split(",").map((x) => x.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    if (/^".*"$/.test(s) || /^'.*'$/.test(s)) return s.slice(1, -1).replace(/\\"/g, '"');
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
    return s;
  };
  for (const line of text.split("\n")) {
    if (/^\s*#/.test(line) || !line.trim()) continue;
    const m0 = /^- (\w+):\s?(.*)$/.exec(line);
    if (m0) { cur = { [m0[1]]: val(m0[2]) }; out.push(cur); continue; }
    const m1 = /^ {2}(\w+):\s?(.*)$/.exec(line);
    if (m1 && cur) cur[m1[1]] = val(m1[2]);
  }
  return out;
}

export function refsMap(yaml: string): Map<string, Ref> {
  return new Map(parseYamlList(yaml).filter((r) => typeof r.id === "string").map((r) => [String(r.id), { ...(r as object), sections: (r.sections as string[] | undefined)?.map(String) } as Ref]));
}
export const shortCite = (r: Ref | undefined, id: string): string => {
  if (!r) return id;
  const who = r.first_author ?? r.publisher ?? r.title ?? id;
  const n = r.n_authors ?? 1;
  return `${who}${n > 2 ? " et al." : n === 2 ? (r.second_author ? ` and ${r.second_author}` : " et al.") : ""}${r.year ? ` ${r.year}` : ""}`;
};

/** R09 source ids cited in the manuscript (research/R09-industry-market.md sec. 10, accessed 2026-10-24). */
export const R09: Record<string, [string, string, string, string]> = {
  "3": ["Sumitomo Metal Mining, LT/LN product page", "https://www.smm.co.jp/en/business/material/products/lithium/", "F", "Sumitomo Metal Mining"],
  "4": ["Shin-Etsu Chemical, Oxide Single Crystals (LT)", "https://www.shinetsu.co.jp/en/products/electronics-materials/oxide-single-crystals/", "F", "Shin-Etsu"],
  "10": ["Soitec, Connect POI", "https://www.soitec.com/en/products/poi", "F", "Soitec"],
  "18": ["Summit Partners (HyperLight Series C), 2026-06-18", "https://www.summitpartners.com/news/hyperlight-announces-80-million-series-c-to-accelerate-tfln-deployment-for-ai-infrastructure", "F", "Summit Partners, 2026-06-18"],
  "31": ["AFR news, 2025-04-07 (OFC 2025)", "https://www.fiber-resources.com/medias/140.html", "F", "AFR, 2025-04-07"],
  "37": ["Exail, \"What is a LN electro-optical modulator\"", "https://www.exail.com/resources/knowledge-center/resources/what-is-a-lithium-niobate-electro-optical-modulator", "F", "Exail"],
  "41": ["Optica corporate member news, 2025-06-05", "https://www.optica.org/about/newsroom/corporate_member_news/2025/advr_joins_covesion_in_strategic_expansion", "F", "Optica member news, 2025-06-05"],
  "50": ["Microwave Journal, 2018-10-11", "https://www.microwavejournal.com/articles/31149-sawbaw-new-market-entrants-offer-new-approaches", "T", "Microwave Journal, 2018-10-11"],
  "53": ["The Quantum Insider, 2025-07-30", "https://thequantuminsider.com/2025/07/30/xanadu-and-hyperlight-unveil-advances-in-photonic-chips-setting-new-quantum-computing-benchmarks/", "T", "The Quantum Insider, 2025-07-30"],
};

// ---------- typesetting ----------
const GREEK: [RegExp, string][] = ([
  ["Gamma", "&Gamma;"], ["gamma", "&gamma;"], ["lambda", "&lambda;"], ["phi", "&phi;"], ["alpha", "&alpha;"], ["omega", "&omega;"], ["nu", "&nu;"],
  ["tau", "&tau;"], ["eta", "&eta;"], ["Lambda", "&Lambda;"], ["Delta", "&Delta;"], ["beta", "&beta;"], ["kappa", "&kappa;"], ["pi", "&pi;"],
] as [string, string][]).map(([w, g]) => [new RegExp(`(?<![&\\w])${w}(?![\\w;])`, "g"), g] as [RegExp, string]);
const SUBBASE = "n|Q|Z|V|P|f|d|u|g|k|phi|Gamma|nu|eta|kappa|tau|omega|lambda|E|alpha|a|T|m|D|t|x";
function typeset(t: string): string {
  let s = t;
  s = s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  s = s.replace(/\bV_pi L\b/g, "V<sub>&pi;</sub>L").replace(/\bV_pi\b/g, "V<sub>&pi;</sub>").replace(/\bVpi\b/g, "V<sub>&pi;</sub>");
  s = s.replace(/\bchi\((\d)\)/g, "&chi;<sup>($1)</sup>");
  s = s.replace(/\bg2\(0\)/g, "g<sup>(2)</sup>(0)").replace(/\bg0\/2pi\b/g, "g<sub>0</sub>/2&pi;").replace(/\bg\/2pi\b/g, "g/2&pi;");
  s = s.replace(/\b(r|d)(13|22|33|51|31|15)\b/g, "$1<sub>$2</sub>").replace(/\bn2\b/g, "n<sub>2</sub>").replace(/\bM2\b/g, "M<sub>2</sub>");
  s = s.replace(/\bSi3N4\b/g, "Si<sub>3</sub>N<sub>4</sub>").replace(/\bSiO2\b/g, "SiO<sub>2</sub>").replace(/\bLiNbO3\b/g, "LiNbO<sub>3</sub>").replace(/\bEr3\+/g, "Er<sup>3+</sup>");
  s = s.replace(/\bZ0\b/g, "Z<sub>0</sub>").replace(/\bnu0\b/g, "&nu;<sub>0</sub>").replace(/\bf3dB\b/g, "f<sub>3dB</sub>").replace(/\blog10\b/g, "log<sub>10</sub>");
  s = s.replace(new RegExp(`\\b(${SUBBASE})_([A-Za-z0-9]+)`, "g"), "$1<sub>$2</sub>");
  for (const [re, g] of GREEK) s = s.replace(re, g);
  s = s.replace(/(\d(?:\.\d+)?)e(-?\d+)\b/g, (_m, a: string, e: string) => `${a === "1" ? "" : `${a}&times;`}10<sup>${e.replace("-", "&minus;")}</sup>`);
  s = s.replace(/\^([ST])\b/g, "<sup>$1</sup>");
  s = s.replace(/\^\((-?[\w+]+)\)/g, "<sup>$1</sup>").replace(/\^(-?[0-9]+)/g, (_m, e: string) => `<sup>${e.replace("-", "&minus;")}</sup>`);
  s = s.replace(/(\d)\s?um\b/g, "$1&nbsp;&micro;m").replace(/(\d)\s?uW\b/g, "$1&nbsp;&micro;W").replace(/\bum\b/g, "&micro;m");
  s = s.replace(/ x (?=[\d(])/g, " &times; ").replace(/\+\/-/g, "&plusmn;").replace(/&gt;=/g, "&ge;").replace(/&lt;=/g, "&le;");
  s = s.replace(/\bsqrt\(/g, "&radic;(");
  s = s.replace(/R09 S(\d+)/g, (m, n: string) => (R09[n] ? `<span class="term" tabindex="0" data-pop="s:${n}">${R09[n][3]}</span>` : m));
  return s;
}

export interface Ctx {
  refs: Map<string, Ref>;
  atlasIds: Set<string>;
  /** short name of an atlas row id */
  atlasLabel?: (id: string) => string;
  /** collected while converting: popup keys and status codes used */
  usedRefs: Set<string>;
  usedAtlas: Set<string>;
  usedS: Set<string>;
  codes: Set<string>;
  /** glossary ids already linked in this section (first occurrence only) */
  gloss?: Set<string>;
}
/** Terms linked to the generated site glossary (src/lib/generated/glossary.json ids), first occurrence per section. */
const GLOSS: [RegExp, string][] = [
  [/\bTFLN\b/, "tfln"], [/\bTFLT\b/, "tflt"], [/\bLNOI\b/, "lnoi"], [/\bMZMs?\b/, "mzm"], [/\bpush-pull\b/, "push-pull"], [/\bx-cut\b/, "x-cut"],
  [/\bPPLN\b/, "ppln"], [/\bQPM\b/, "qpm"], [/\bSHG\b/, "shg"], [/\bOPO\b/, "opo"], [/\bOPA\b/, "opa"], [/\bIDT\b/, "idt"], [/\bXBAR\b/, "xbar"],
  [/\bBAW\b/, "baw"], [/\bphotorefraction\b/, "photorefraction"], [/\btraveling-wave\b/, "traveling-wave-electrode"], [/\bPockels effect\b/, "pockels-effect"],
  [/\bpiezoelectric\b/, "piezoelectric-effect"], [/\bvelocity match(ing)?\b/, "velocity-matching"], [/\bwafer bonding\b/, "wafer-bonding"],
];
const BADGE: Record<string, [string, string]> = {
  reported: ["r", "reported"], derived: ["d", "derived"], template: ["t", "template"], "P-comp": ["pc", "P-comp"], P: ["p", "P"], V: ["v", "V"], U: ["u", "U"], S: ["s", "S"],
};
/** {status | ref | ver} -> badge HTML. */
function tagHTML(raw: string, c: Ctx): string {
  const parts = raw.split("|").map((x) => x.trim());
  const st = parts[0];
  const ref = parts[1] ?? "";
  if (st === "E") return `<span class="tag">inference</span>`;
  if (st === "title") {
    c.usedRefs.add(ref);
    return `<span class="ref" tabindex="0" data-pop="r:${esc(ref)}">${esc(shortCite(c.refs.get(ref), ref))}</span>`;
  }
  const b = BADGE[st];
  if (!b) return "";
  c.codes.add(b[1]);
  let pop = `st:${b[1]}`;
  const am = /^atlas\s+([\w.-]+)/.exec(ref);
  if (am && c.atlasIds.has(am[1])) { pop = `a:${am[1]}`; c.usedAtlas.add(am[1]); }
  else if (ref === "atlas") pop = "atlas";
  else if (ref && c.refs.has(ref)) { pop = `r:${ref}`; c.usedRefs.add(ref); }
  return `<span class="b ${b[0]}" tabindex="0" data-pop="${esc(pop)}">${b[1]}</span>`;
}

/** Inline conversion: escape, protect tags / code / citations, typeset the rest, restore. */
export function inline(text: string, c: Ctx): string {
  const keep: string[] = [];
  const hold = (h: string): string => `\u0000${keep.push(h) - 1}\u0000`;
  let s = text.replace(/`(\{[^{}]+\})`/g, "$1").replace(/\{([^{}]+)\}/g, (_m, t: string) => hold(tagHTML(t, c)));
  s = s.replace(/`([^`]+)`/g, (_m, t: string) => {
    if (c.atlasIds.has(t)) { c.usedAtlas.add(t); return hold(`<span class="term" tabindex="0" data-pop="a:${esc(t)}">${esc(c.atlasLabel?.(t) ?? t)}</span>`); }
    return hold(`<code>${esc(t)}</code>`);
  });
  s = s.replace(/\[([a-z][a-z0-9-]*)\]/g, (m, id: string) => {
    if (!c.refs.has(id)) return m;
    c.usedRefs.add(id);
    return hold(`<span class="ref" tabindex="0" data-pop="r:${id}">[${esc(shortCite(c.refs.get(id), id))}]</span>`);
  });
  if (c.gloss) for (const [re, id] of GLOSS) {
    if (c.gloss.has(id)) continue;
    let hit = false;
    s = s.replace(re, (m) => { hit = true; return hold(`<span class="term" tabindex="0" data-pop="g:${id}">${esc(m)}</span>`); });
    if (hit) c.gloss.add(id);
  }
  s = typeset(esc(s).replace(/&amp;(?=[a-zA-Z]+;)/g, "&"));
  s.replace(/data-pop="s:(\d+)"/g, (_m, n: string) => { c.usedS.add(n); return ""; });
  return s.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => keep[Number(i)]);
}

// Sentences that quote an unverified value while saying it is not printed: the value is removed (DevLog-004 rule 3).
const REDACT: [RegExp, string][] = [
  [/n2 of LN \(1\.8e-19 m\^2\/W as tabulated in Zhu 2021\) has no primary measurement traced/, "The tabulated n2 of LN (Zhu 2021) has no primary measurement traced"],
  [/The acoustic figure of merit M2 for LN \(about 7e-15 s\^3\/kg in the Uchida and Niizeki compilation\) is unverified/, "The acoustic figure of merit M2 for LN in the Uchida and Niizeki compilation is unverified"],
  [/"11 dB inferred" for Nehra 2022 is not in the abstract/, "An inferred (loss-corrected) value for Nehra 2022 is not in the abstract and is not tabulated"],
];

export type Item = { t: "html"; html: string } | { t: "fig"; id: string } | { t: "h3"; html: string };
export interface Level { lv: "L1" | "L2" | "L3"; items: Item[] }
export interface SectionDoc { no: string; title: string; levels: Level[]; caps: Record<string, string> }

/** Display equations of the manuscript (MathML), keyed by the exact source line. */
export const EQ: Record<string, string> = {
  "T(V) = (1/2) [1 + cos(pi V / V_pi + phi_b)]":
    `<math display="block"><mi>T</mi><mo>(</mo><mi>V</mi><mo>)</mo><mo>=</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mrow><mo>[</mo><mn>1</mn><mo>+</mo><mi>cos</mi><mrow><mo>(</mo><mfrac><mrow><mi>&pi;</mi><mi>V</mi></mrow><msub><mi>V</mi><mi>&pi;</mi></msub></mfrac><mo>+</mo><msub><mi>&phi;</mi><mi>b</mi></msub><mo>)</mo></mrow><mo>]</mo></mrow></math>`,
  "V_pi L = lambda g / (2 n_e^3 r33 Gamma)   (push-pull MZM)":
    `<math display="block"><msub><mi>V</mi><mi>&pi;</mi></msub><mi>L</mi><mo>=</mo><mfrac><mrow><mi>&lambda;</mi><mi>g</mi></mrow><mrow><mn>2</mn><msubsup><mi>n</mi><mi>e</mi><mn>3</mn></msubsup><msub><mi>r</mi><mn>33</mn></msub><mi>&Gamma;</mi></mrow></mfrac><mspace width="1.2em"/><mtext>(push-pull MZM)</mtext></math>`,
  "V(z) = V+ [exp(-gamma z) + Gamma_L exp(-2 gamma L) exp(gamma z)],  V+ = V_S Z0/(Z0 + Z_S) / (1 - Gamma_S Gamma_L exp(-2 gamma L))":
    `<math display="block"><mi>V</mi><mo>(</mo><mi>z</mi><mo>)</mo><mo>=</mo><msup><mi>V</mi><mo>+</mo></msup><mrow><mo>[</mo><msup><mi>e</mi><mrow><mo>&minus;</mo><mi>&gamma;</mi><mi>z</mi></mrow></msup><mo>+</mo><msub><mi>&Gamma;</mi><mi>L</mi></msub><msup><mi>e</mi><mrow><mo>&minus;</mo><mn>2</mn><mi>&gamma;</mi><mi>L</mi></mrow></msup><msup><mi>e</mi><mrow><mi>&gamma;</mi><mi>z</mi></mrow></msup><mo>]</mo></mrow><mo>,</mo><mspace width="1em"/><msup><mi>V</mi><mo>+</mo></msup><mo>=</mo><mfrac><mrow><msub><mi>V</mi><mi>S</mi></msub><msub><mi>Z</mi><mn>0</mn></msub><mo>/</mo><mo>(</mo><msub><mi>Z</mi><mn>0</mn></msub><mo>+</mo><msub><mi>Z</mi><mi>S</mi></msub><mo>)</mo></mrow><mrow><mn>1</mn><mo>&minus;</mo><msub><mi>&Gamma;</mi><mi>S</mi></msub><msub><mi>&Gamma;</mi><mi>L</mi></msub><msup><mi>e</mi><mrow><mo>&minus;</mo><mn>2</mn><mi>&gamma;</mi><mi>L</mi></mrow></msup></mrow></mfrac></math>`,
  "m(f) = V+ [ (1 - exp(-u+ L)) / (u+ L) + Gamma_L exp(-2 gamma L) (exp(u- L) - 1) / (u- L) ],  u+ = alpha + j omega (n_RF - n_g)/c,  u- = alpha + j omega (n_RF + n_g)/c":
    `<math display="block"><mi>m</mi><mo>(</mo><mi>f</mi><mo>)</mo><mo>=</mo><msup><mi>V</mi><mo>+</mo></msup><mrow><mo>[</mo><mfrac><mrow><mn>1</mn><mo>&minus;</mo><msup><mi>e</mi><mrow><mo>&minus;</mo><msub><mi>u</mi><mo>+</mo></msub><mi>L</mi></mrow></msup></mrow><mrow><msub><mi>u</mi><mo>+</mo></msub><mi>L</mi></mrow></mfrac><mo>+</mo><msub><mi>&Gamma;</mi><mi>L</mi></msub><msup><mi>e</mi><mrow><mo>&minus;</mo><mn>2</mn><mi>&gamma;</mi><mi>L</mi></mrow></msup><mfrac><mrow><msup><mi>e</mi><mrow><msub><mi>u</mi><mo>&minus;</mo></msub><mi>L</mi></mrow></msup><mo>&minus;</mo><mn>1</mn></mrow><mrow><msub><mi>u</mi><mo>&minus;</mo></msub><mi>L</mi></mrow></mfrac><mo>]</mo></mrow><mo>,</mo><mspace width="1em"/><msub><mi>u</mi><mo>&plusmn;</mo></msub><mo>=</mo><mi>&alpha;</mi><mo>+</mo><mi>j</mi><mi>&omega;</mi><mfrac><mrow><msub><mi>n</mi><mi>RF</mi></msub><mo>&mnplus;</mo><msub><mi>n</mi><mi>g</mi></msub></mrow><mi>c</mi></mfrac></math>`,
};

/** Split a Markdown table row on "|" outside backticks and braces. */
function cells(l: string): string[] {
  const t = ` ${l.trim().replace(/^\|/, "").replace(/\|$/, "")} `;
  const out: string[] = [];
  let cur = "", tick = false, brace = 0;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (ch === "`") tick = !tick;
    if (ch === "{") brace++;
    if (ch === "}") brace = Math.max(0, brace - 1);
    if (ch === "|" && !tick && !brace && t[i - 1] === " " && t[i + 1] === " ") { out.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/** Convert one manuscript section ("6.1") into depth layers. */
export function section(md: string, no: string, c: Ctx): SectionDoc {
  const lines = md.split("\n");
  const start = lines.findIndex((l) => l.startsWith(`## ${no} `));
  if (start < 0) throw new Error(`manuscript has no section ${no}`);
  const title = lines[start].slice(3 + no.length + 1).trim().replace(/V_pi/g, "V\u03c0").replace(/\bchi\((\d)\)/g, "\u03c7($1)");
  let end = lines.findIndex((l, i) => i > start && (l.startsWith("## ") || l.startsWith("---")));
  if (end < 0) end = lines.length;
  const levels: Level[] = [];
  const caps: Record<string, string> = {};
  const gloss = new Set<string>();
  let lv: Level | null = null;
  let para: string[] = [];
  let list: string[] = [];
  let table: string[][] = [];
  const flush = (): void => {
    if (!lv) { para = []; list = []; table = []; return; }
    if (para.length) {
      let p = para.join(" ");
      for (const [re, r] of REDACT) p = p.replace(re, r);
      const def = /^Definition block\. (.*)$/.exec(p);
      const cg = { ...c, gloss };
      lv.items.push({ t: "html", html: def ? `<div class="def">${inline(def[1], cg)}</div>` : `<p class="tx">${inline(p, cg)}</p>` });
    }
    if (list.length) lv.items.push({ t: "html", html: `<ul class="dv-ul">${list.map((x) => { for (const [re, r] of REDACT) x = x.replace(re, r); return `<li>${inline(x, { ...c, gloss })}</li>`; }).join("")}</ul>` });
    if (table.length) {
      const [h, , ...body] = table;
      const th = h.map((x) => `<th>${inline(x, c)}</th>`).join("");
      const tb = body.map((r) => `<tr>${r.map((x, i) => `<td${i === 0 ? ' class="h"' : ""}>${inline(x, c)}</td>`).join("")}</tr>`).join("");
      lv.items.push({ t: "html", html: `<div class="scrollx"><table class="idx dv-t"><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></div>` });
    }
    para = []; list = []; table = [];
  };
  for (let i = start + 1; i < end; i++) {
    const l = lines[i];
    const h = /^### (L[123])(?::\s*(.*))?$/.exec(l);
    if (h) {
      flush();
      const want = h[1] as Level["lv"];
      if (!lv || lv.lv !== want) { lv = { lv: want, items: [] }; levels.push(lv); }
      if (h[2]) lv.items.push({ t: "h3", html: inline(h[2].charAt(0).toUpperCase() + h[2].slice(1), c) });
      continue;
    }
    if (!l.trim()) { flush(); continue; }
    if (/^Door art \(VISUAL\)/.test(l)) continue;
    const f = /^\[\[(F6\.\d\d|A\d)\]\]\s*(.*)$/.exec(l);
    if (f) { flush(); lv?.items.push({ t: "fig", id: f[1] }); continue; }
    const ct = /^Control text for (F6\.\d\d): (.*)$/.exec(l);
    if (ct) { flush(); caps[ct[1]] = inline(ct[2].charAt(0).toUpperCase() + ct[2].slice(1), c); continue; }
    if (EQ[l.trim()]) { flush(); lv?.items.push({ t: "html", html: `<div class="eq">${EQ[l.trim()]}</div>` }); continue; }
    if (l.startsWith("|")) { if (para.length || list.length) flush(); table.push(cells(l)); continue; }
    if (l.startsWith("- ")) { if (para.length || table.length) flush(); list.push(l.slice(2)); continue; }
    if (list.length && /^\s{2,}\S/.test(l)) { list[list.length - 1] += " " + l.trim(); continue; }
    if (table.length) flush();
    para.push(l.trim());
  }
  flush();
  return { no, title, levels, caps };
}
