// Instrument index: parse content/chapters/*/figures.md (figure specs written by the content lanes in several layouts:
// "| Field | Spec |" tables, "- **Field:** value" bullets, "Field: value" lines, "### ID title" sub-entries) into one row
// per instrument, and place each one in its manuscript section (the "## N.M" section that mentions the id; else the spec's
// own Placement / Section field). Pure functions; the server load supplies the raw text. Text is cleaned of
// content-pipeline references (file names, lane names, function signatures) so the page shows only the instrument.
export interface Instrument {
  id: string;
  ch: string; // "02"
  title: string;
  question: string;
  inputs: string;
  outputs: string;
  model: string;
  sec: string; // "2.3" or ""
  level: string; // "L1" | "L2" | "L3" | ""
}

const ID_RE = /^((?:FIG|fig|F)-?\d+(?:[-.]\d+)+b?)\s+(.+)$/;

const KEY_ALIASES: [RegExp, keyof Fields][] = [
  [/^question$/i, "question"],
  [/^model \/ inputs \/ outputs$/i, "mio"],
  [/^(model|computation|physical model)$/i, "model"],
  [/^(atlas )?inputs?$|^controls$/i, "inputs"],
  [/^outputs?( \(.*\))?$/i, "outputs"],
  [/^readouts?( \(.*\))?$/i, "readouts"],
  [/^(placement|section, level|section)$/i, "placement"],
  [/^content$/i, "content"],
];
interface Fields { question: string; mio: string; model: string; inputs: string; outputs: string; readouts: string; placement: string; content: string }

function fieldKey(k: string): keyof Fields | null {
  const t = k.replace(/\*\*/g, "").trim();
  for (const [re, f] of KEY_ALIASES) if (re.test(t)) return f;
  return null;
}

/** Remove markdown and content-pipeline references from one field. */
export function clean(s: string): string {
  let t = s.replace(/\*\*/g, "").replace(/<br\s*\/?>/g, "; ");
  // file paths and function signatures in backticks: drop when they name code or data files, keep plain symbols
  t = t.replace(/`([^`]*)`/g, (_, c: string) => (/\w\.(ts|js|mjs|json|ya?ml|md|csv|py|toml)\b|[a-z]\/\w|[A-Za-z_]\w*\(|^[a-z]+[A-Z]\w*$|^[a-z]+_[a-z_]+$/.test(c) ? "" : c.replace(/\s{2,}/g, ", ")));
  // layout notes of the spec (reserved widths, format masks)
  t = t.replace(/\s*\((?:reserved[^()]*|\d+\s*ch\b[^()]*|fixed[^()]*|format[^()]*|value field[^()]*|\d+ x \d+ px[^()]*)\)/gi, "");
  t = t.replace(/\s*\b\d+\s*ch\b(, padded)?/g, "");
  t = t.replace(/\s*\(existing\)/g, "").replace(/\bexisting /g, "");
  t = t.replace(/\((?:manuscript|requested|REQ|PHY|exists in|see |chart-specs|DevLog|R\d\d)[^()]*\)/gi, "");
  t = t.replace(/\b(?:manuscript|figures\.md)\s+(?=\d)/gi, "sec. ").replace(/\bas in manuscript table\b/gi, "as in the section's table").replace(/\bmanuscript\b/gi, "section text");
  // drop clauses that only address the content pipeline
  const parts = t.split(/(?<=[;.])\s+/);
  t = parts.filter((p) => !/\b(PHY|API lane|lane [A-Z]?\d|C0\d|mockup|DevLog|open-questions|open question|chart-specs|requested|port of|to be checked|scripts\/|\.ya?ml|\.json|\.ts\b|\.mjs)\b|\bQ-?[A-Z]*-?\d|\d+ px\b|<= \d+/i.test(p)).join(" ");
  t = t.replace(/\s*\[R\d\d[^\]]*\]/g, "").replace(/\s*\(?\bR\d\d(?:[: ](?:sec\.|row|rows|S)?\s*[\w.]+)?\)?/g, "").replace(/\b(?:formula )?from\s*(?=[;,.]|$)/g, "");
  t = t.replace(/\s+([,;.:])/g, "$1").replace(/\(\s*\)/g, "").replace(/[;,]\s*[;,]/g, ";").replace(/\s{2,}/g, " ").trim();
  return t.replace(/^[;,.:\s]+|[;,\s]+$/g, "");
}

/** Manuscript section ("2.3") per figure id: sections of "## N.M Title" (chapter 01 numbers "## N." as "1.N"). */
export function manuscriptPlacement(ch: string, ms: string, ids: string[]): Record<string, string> {
  const c = String(+ch);
  const out: Record<string, string> = {};
  const secs = ms.split(/\n(?=## )/);
  for (const s of secs) {
    const h = /^## (\d+)\.(\d+)?/.exec(s);
    if (!h) continue;
    const no = h[2] !== undefined ? `${h[1]}.${h[2]}` : `${c}.${h[1]}`;
    if (!no.startsWith(`${c}.`)) continue;
    for (const id of ids) {
      const re = new RegExp(`(^|[^\\w.-])${id.replace(/[.]/g, "\\.")}(?![\\w]|[.-]\\d)`);
      if (!re.test(s)) continue;
      const cur = out[id];
      // prefer a numbered section over the chapter door / opener (N.0)
      if (!cur || (cur.endsWith(".0") && !no.endsWith(".0"))) out[id] = no;
    }
  }
  return out;
}

function firstSection(ch: string, s: string): string {
  const c = String(+ch);
  const m = new RegExp(`(?:^|[^\\d.])(${c}\\.\\d{1,2})(?!\\d)`).exec(s);
  return m ? m[1] : "";
}
const firstLevel = (s: string): string => /\bL([123])\b/.exec(s)?.[0] ?? "";

export function parseFigures(ch: string, md: string, ms: string): Instrument[] {
  const lines = md.split(/\r?\n/);
  interface Block { id: string; title: string; level: number; body: string[] }
  const blocks: Block[] = [];
  let cur: Block | null = null;
  for (const ln of lines) {
    const h = /^(#{2,4})\s+(.*)$/.exec(ln);
    if (h) {
      const lvl = h[1].length;
      const m = ID_RE.exec(h[2].trim());
      if (m) { cur = { id: m[1], title: m[2].trim(), level: lvl, body: [] }; blocks.push(cur); continue; }
      if (cur && lvl <= cur.level) cur = null;
    }
    if (cur) cur.body.push(ln);
  }
  // placement map tables ("| Section | L1 | L2 | L3 |"): id -> section, level
  const mapPlace: Record<string, { sec: string; level: string }> = {};
  const pm = /\| Section \| L1 \| L2 \| L3 \|\n\|[-| ]+\|\n((?:\|.*\|\n?)+)/.exec(md);
  if (pm) for (const row of pm[1].trim().split("\n")) {
    const cells = row.split("|").slice(1, -1).map((c) => c.trim());
    const sec = firstSection(ch, cells[0]);
    cells.slice(1).forEach((cell, k) => { for (const m of cell.matchAll(/F\d\.\d+/g)) if (!mapPlace[m[0]]) mapPlace[m[0]] = { sec, level: `L${k + 1}` }; });
  }
  const msPlace = manuscriptPlacement(ch, ms, blocks.map((b) => b.id));

  return blocks.map((b) => {
    const f: Fields = { question: "", mio: "", model: "", inputs: "", outputs: "", readouts: "", placement: "", content: "" };
    for (const ln of b.body) {
      let k: string | null = null, v = "";
      const row = /^\|\s*([^|]+?)\s*\|\s*(.*?)\s*\|\s*$/.exec(ln);
      const bul = /^\s*[-*]\s+(?:\*\*([^*:]+):?\*\*:?|([A-Z][A-Za-z /,()]{1,40}):)\s*(.*)$/.exec(ln);
      const plain = /^([A-Z][A-Za-z /,()]{1,40}):\s+(.*)$/.exec(ln);
      if (row && !/^-+$/.test(row[1])) { k = row[1]; v = row[2]; }
      else if (bul) { k = bul[1] ?? bul[2]; v = bul[3]; }
      else if (plain) { k = plain[1]; v = plain[2]; }
      if (!k) continue;
      const key = fieldKey(k);
      if (key && !f[key]) f[key] = v;
    }
    // inline "Inputs: ... Outputs: ..." inside a model or summary field
    const inl = (src: string, w: "Inputs?" | "Outputs?"): string => new RegExp(`\\b${w}:\\s*(.+?)(?=\\s*\\b(?:Inputs?|Outputs?):|$)`).exec(src)?.[1] ?? "";
    let model = f.model, inputs = f.inputs, outputs = f.outputs || f.readouts;
    if (f.mio) { inputs ||= inl(f.mio, "Inputs?"); outputs ||= inl(f.mio, "Outputs?"); model ||= f.mio.replace(/\b(Inputs?|Outputs?):.*$/, "").trim(); }
    if (/\bInputs?:/.test(model)) { inputs ||= inl(model, "Inputs?"); outputs ||= inl(model, "Outputs?"); model = model.replace(/\s*\bInputs?:.*$/, "").trim(); }
    if (!model && f.content) model = f.content;
    if (!model) {
      // "Model and data:" (or similar) heading line followed by bullets; else the first descriptive bullet (chapter 07)
      const at = b.body.findIndex((l) => /^(Model|Physical models?|Computation)[^:|]*:\s*$/.test(l.trim()));
      const bullets: string[] = [];
      for (let i = at + 1; at >= 0 && i < b.body.length; i++) {
        const l = b.body[i].trim();
        if (!l.startsWith("- ")) { if (bullets.length) break; continue; }
        if (/^- (\*\*)?(Inputs?|Outputs?|Readouts?|TECH|VISUAL)\b/.test(l)) continue;
        bullets.push(l.slice(2));
      }
      if (!bullets.length) { const first = b.body.find((l) => /^- /.test(l.trim()) && !/^- (\*\*)?[A-Z][A-Za-z /]{1,30}:/.test(l.trim())); if (first) bullets.push(first.trim().slice(2)); }
      model = bullets.join("; ");
    }
    if (!f.placement) f.placement = /Placement:\s*(.*?)(?:\.\s|\.?$)/m.exec(b.body.join("\n"))?.[1] ?? "";
    const head = /\((?:sec\.\s*)?([^)]*)\)\s*$/.exec(b.title);
    const title = b.title.replace(/\s*\((?:sec\.|h\d|H\d)[^)]*\)\s*$/, "").trim();
    let sec = msPlace[b.id] ?? "";
    const placeText = `${f.placement} ${head?.[1] ?? ""}`;
    if (!sec) sec = firstSection(ch, placeText) || mapPlace[b.id]?.sec || "";
    if (!sec && ch === "07") { const n = /^F7\.(\d+)/.exec(b.id); if (n && n[1] !== "0") sec = `7.${n[1]}`; }
    const level = firstLevel(placeText) || mapPlace[b.id]?.level || "";
    return {
      id: b.id, ch, title: clean(title), question: clean(f.question), inputs: clean(inputs), outputs: clean(outputs), model: clean(model), sec, level,
    };
  });
}
