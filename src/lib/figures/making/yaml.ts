// Minimal YAML reader for the chapter-05 content files (process-flow.yaml, refs.yaml, glossary.yaml). Supports the subset
// those files use: block mappings and sequences by indentation, "- key: value" items, single-line flow mappings and
// sequences ({...}, [...]), single- and double-quoted strings, plain scalars, literal block scalars (|), comments.
// Numbers, null/~, true/false are typed. No anchors, tags, multi-document streams or multi-line flow collections.
// Used at build time only (+page.server.ts); throws with a line number on input outside the subset.

export type YamlValue = null | boolean | number | string | YamlValue[] | { [k: string]: YamlValue };

interface Line { indent: number; text: string; no: number }

const NUM = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;

function stripComment(s: string): string {
  let q: string | null = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === "\\" && q === '"') { i++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { if (i === 0 || /[\s[{,:]/.test(s[i - 1])) q = c; continue; }
    if (c === "#" && (i === 0 || /\s/.test(s[i - 1]))) return s.slice(0, i).trimEnd();
  }
  return s.trimEnd();
}

function plain(s: string): YamlValue {
  const t = s.trim();
  if (t === "" || t === "~" || t === "null") return null;
  if (t === "true") return true;
  if (t === "false") return false;
  if (NUM.test(t)) return Number(t);
  return t;
}

/** Parse one flow value starting at s[i]; returns [value, next index]. */
function flow(s: string, i: number, no: number): [YamlValue, number] {
  const ws = (): void => { while (i < s.length && /\s/.test(s[i])) i++; };
  ws();
  const c = s[i];
  if (c === "{") {
    const o: { [k: string]: YamlValue } = {};
    i++;
    for (;;) {
      ws();
      if (s[i] === "}") return [o, i + 1];
      let key: string;
      if (s[i] === '"' || s[i] === "'") { const [k, j] = quoted(s, i, no); key = k; i = j; }
      else { const j = s.indexOf(":", i); if (j < 0) throw new Error(`yaml line ${no}: flow key without ':'`); key = s.slice(i, j).trim(); i = j; }
      ws();
      if (s[i] !== ":") throw new Error(`yaml line ${no}: expected ':' after ${key}`);
      i++;
      const [v, j] = flow(s, i, no);
      o[key] = v;
      i = j;
      ws();
      if (s[i] === ",") { i++; continue; }
      if (s[i] === "}") return [o, i + 1];
      throw new Error(`yaml line ${no}: expected ',' or '}' in flow mapping`);
    }
  }
  if (c === "[") {
    const a: YamlValue[] = [];
    i++;
    for (;;) {
      ws();
      if (s[i] === "]") return [a, i + 1];
      const [v, j] = flow(s, i, no);
      a.push(v);
      i = j;
      ws();
      if (s[i] === ",") { i++; continue; }
      if (s[i] === "]") return [a, i + 1];
      throw new Error(`yaml line ${no}: expected ',' or ']' in flow sequence`);
    }
  }
  if (c === '"' || c === "'") return quoted(s, i, no);
  let j = i;
  while (j < s.length && !",}]".includes(s[j])) j++;
  return [plain(s.slice(i, j)), j];
}

function quoted(s: string, i: number, no: number): [string, number] {
  const q = s[i];
  let out = "";
  for (let j = i + 1; j < s.length; j++) {
    const c = s[j];
    if (q === '"' && c === "\\") {
      const n = s[++j];
      out += n === "n" ? "\n" : n === "t" ? "\t" : n;
      continue;
    }
    if (c === q) {
      if (q === "'" && s[j + 1] === "'") { out += "'"; j++; continue; }
      return [out, j + 1];
    }
    out += c;
  }
  throw new Error(`yaml line ${no}: unterminated string`);
}

function scalarOrFlow(t: string, no: number): YamlValue {
  const s = t.trim();
  if (s.startsWith("{") || s.startsWith("[") || s.startsWith('"') || s.startsWith("'")) {
    const [v, j] = flow(s, 0, no);
    if (s.slice(j).trim()) throw new Error(`yaml line ${no}: trailing text after value`);
    return v;
  }
  return plain(s);
}

/** Split "key: rest" (key unquoted, no ':' inside); null when the text is not a mapping entry. */
function splitKey(text: string): [string, string] | null {
  const m = /^([^\s"'{[\-#][^:]*?|-[^\s:][^:]*?):(?:\s+(.*))?$/.exec(text);
  if (!m) return null;
  return [m[1].trim(), m[2] ?? ""];
}

export function parseYaml(src: string): YamlValue {
  const raw = src.replace(/\r\n?/g, "\n").split("\n");
  const lines: Line[] = [];
  const rawLines: { indent: number; text: string; no: number }[] = raw.map((r, k) => ({ indent: r.length - r.trimStart().length, text: r, no: k + 1 }));
  // block scalars need raw lines, so keep an index from the filtered list back to raw
  const rawIndex: number[] = [];
  raw.forEach((r, k) => {
    if (/\t/.test(r.slice(0, r.length - r.trimStart().length))) throw new Error(`yaml line ${k + 1}: tab indentation`);
    const t = stripComment(r);
    if (!t.trim()) return;
    lines.push({ indent: t.length - t.trimStart().length, text: t.trim(), no: k + 1 });
    rawIndex.push(k);
  });
  let p = 0;

  function block(indent: number): YamlValue {
    if (p >= lines.length) return null;
    return lines[p].text === "-" || lines[p].text.startsWith("- ") ? seq(indent) : map(indent);
  }

  function blockScalar(parentIndent: number, rawFrom: number): string {
    // collect raw lines after rawFrom with indent > parentIndent (blank lines included)
    const out: string[] = [];
    let k = rawFrom + 1;
    let base = -1;
    for (; k < rawLines.length; k++) {
      const r = rawLines[k];
      if (!r.text.trim()) { out.push(""); continue; }
      if (r.indent <= parentIndent) break;
      if (base < 0) base = r.indent;
      out.push(r.text.slice(base));
    }
    while (out.length && !out[out.length - 1]) out.pop();
    // advance p past consumed lines
    while (p < lines.length && rawIndex[p] < k) p++;
    return out.join("\n") + "\n";
  }

  function value(rest: string, indent: number, line: Line): YamlValue {
    if (rest === "|" || rest === "|-") {
      const s = blockScalar(indent, rawIndex[p - 1]);
      return rest === "|-" ? s.replace(/\n$/, "") : s;
    }
    if (rest) return scalarOrFlow(rest, line.no);
    if (p < lines.length && (lines[p].indent > indent || (lines[p].indent === indent && (lines[p].text === "-" || lines[p].text.startsWith("- "))))) return block(lines[p].indent);
    return null;
  }

  function map(indent: number): { [k: string]: YamlValue } {
    const o: { [k: string]: YamlValue } = {};
    while (p < lines.length && lines[p].indent === indent && !(lines[p].text === "-" || lines[p].text.startsWith("- "))) {
      const line = lines[p];
      const kv = splitKey(line.text);
      if (!kv) throw new Error(`yaml line ${line.no}: expected 'key: value', got "${line.text}"`);
      p++;
      o[kv[0]] = value(kv[1], indent, line);
    }
    if (p < lines.length && lines[p].indent > indent) throw new Error(`yaml line ${lines[p].no}: unexpected indentation`);
    return o;
  }

  function seq(indent: number): YamlValue[] {
    const a: YamlValue[] = [];
    while (p < lines.length && lines[p].indent === indent && (lines[p].text === "-" || lines[p].text.startsWith("- "))) {
      const line = lines[p];
      const rest = line.text === "-" ? "" : line.text.slice(2).trim();
      if (!rest) { p++; a.push(p < lines.length && lines[p].indent > indent ? block(lines[p].indent) : null); continue; }
      const kv = rest.startsWith("{") || rest.startsWith("[") || rest.startsWith('"') || rest.startsWith("'") ? null : splitKey(rest);
      if (kv) {
        // "- key: value" opens a mapping whose keys sit at indent + 2
        const inner = indent + (line.text.length - line.text.slice(1).trimStart().length);
        lines[p] = { indent: inner, text: rest, no: line.no };
        a.push(map(inner));
      } else {
        p++;
        a.push(scalarOrFlow(rest, line.no));
      }
    }
    return a;
  }

  const v = block(lines.length ? lines[0].indent : 0);
  if (p < lines.length) throw new Error(`yaml line ${lines[p].no}: unparsed content`);
  return v;
}
