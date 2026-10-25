// Minimal YAML reader for the chapter refs.yaml files (build time only). Supported subset, as used by content/**/refs.yaml:
// block mappings and sequences by indentation (a sequence may sit at its parent key's indent), "- key: value" items,
// plain / "double" / 'single' quoted scalars, flow sequences [a, "b, c"] and flow mappings {k: v} (nested), comments.
// Not supported: block scalars (| >), anchors, tags, multi-line plain scalars. Scalars stay strings (no type coercion).
export type YNode = string | null | YNode[] | { [k: string]: YNode };

interface Line { ind: number; text: string; no: number }

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

function unquote(s: string): string {
  const t = s.trim();
  if (t.length >= 2 && t[0] === '"' && t[t.length - 1] === '"')
    return t.slice(1, -1).replace(/\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|["\\/nt])/g, (_, c: string) => (c === "n" ? "\n" : c === "t" ? "\t" : c.length > 1 ? String.fromCharCode(parseInt(c.slice(1), 16)) : c));
  if (t.length >= 2 && t[0] === "'" && t[t.length - 1] === "'") return t.slice(1, -1).replace(/''/g, "'");
  return t;
}

/** Parse a flow collection or scalar starting at s[i]; returns [node, next index]. */
function flow(s: string, i: number): [YNode, number] {
  const ws = (): void => { while (i < s.length && /\s/.test(s[i])) i++; };
  ws();
  if (s[i] === "[") {
    i++; const out: YNode[] = [];
    for (;;) { ws(); if (s[i] === "]") return [out, i + 1]; const [v, j] = flow(s, i); out.push(v); i = j; ws(); if (s[i] === ",") i++; else if (s[i] === "]") return [out, i + 1]; else if (i >= s.length) return [out, i]; }
  }
  if (s[i] === "{") {
    i++; const out: Record<string, YNode> = {};
    for (;;) {
      ws(); if (s[i] === "}") return [out, i + 1];
      let k = ""; while (i < s.length && s[i] !== ":" && s[i] !== "," && s[i] !== "}") k += s[i++];
      let v: YNode = null;
      if (s[i] === ":") { const [vv, j] = flow(s, i + 1); v = vv; i = j; }
      out[unquote(k)] = v; ws();
      if (s[i] === ",") i++; else if (s[i] === "}") return [out, i + 1]; else if (i >= s.length) return [out, i];
    }
  }
  if (s[i] === '"' || s[i] === "'") {
    const q = s[i]; let j = i + 1;
    while (j < s.length) { if (q === '"' && s[j] === "\\") { j += 2; continue; } if (s[j] === q) { if (q === "'" && s[j + 1] === "'") { j += 2; continue; } break; } j++; }
    return [unquote(s.slice(i, j + 1)), j + 1];
  }
  let j = i; let depth = 0;
  while (j < s.length) { const c = s[j]; if (c === "[" || c === "{") depth++; else if (c === "]" || c === "}") { if (depth === 0) break; depth--; } else if (c === "," && depth === 0) break; j++; }
  const raw = s.slice(i, j).trim();
  return [raw === "" || raw === "~" || raw === "null" ? null : raw, j];
}

function scalarOrFlow(v: string): YNode {
  const t = v.trim();
  if (t === "") return null;
  if (t[0] === "[" || t[0] === "{") return flow(t, 0)[0];
  if (t === "~" || t === "null") return null;
  return unquote(t);
}

/** Split "key: value" (key may be quoted); null when the line is not a mapping entry. */
function splitKey(t: string): [string, string] | null {
  const m = /^("(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^\s"'[{#-][^:]*?|-[^\s:][^:]*?)\s*:(?:\s+(.*))?$/.exec(t);
  if (!m) return null;
  return [unquote(m[1]), m[2] ?? ""];
}

export function parseYaml(src: string): YNode {
  const lines: Line[] = [];
  src.split(/\r?\n/).forEach((raw, no) => {
    if (/^\s*(#|$)/.test(raw) || raw.startsWith("---")) return;
    const t = stripComment(raw);
    if (!t.trim()) return;
    lines.push({ ind: t.length - t.trimStart().length, text: t.trimStart(), no: no + 1 });
  });
  let p = 0;

  function block(ind: number): YNode {
    if (p >= lines.length) return null;
    if (lines[p].text.startsWith("- ") || lines[p].text === "-") return seq(lines[p].ind);
    return map(ind);
  }

  function seq(ind: number): YNode[] {
    const out: YNode[] = [];
    while (p < lines.length && lines[p].ind === ind && (lines[p].text.startsWith("- ") || lines[p].text === "-")) {
      const ln = lines[p];
      const rest = ln.text === "-" ? "" : ln.text.slice(2);
      const itemInd = ind + 2 + (rest.length - rest.trimStart().length);
      const r = rest.trim();
      p++;
      if (!r) { out.push(p < lines.length && lines[p].ind > ind ? block(lines[p].ind) : null); continue; }
      const kv = r[0] === "[" || r[0] === "{" || r[0] === '"' || r[0] === "'" ? null : splitKey(r);
      if (!kv) { out.push(scalarOrFlow(r)); continue; }
      // mapping item: first entry inline, the rest at itemInd
      const obj: Record<string, YNode> = {};
      entry(obj, kv, itemInd);
      while (p < lines.length && lines[p].ind === itemInd && !lines[p].text.startsWith("- ")) {
        const kv2 = splitKey(lines[p].text);
        if (!kv2) throw new Error(`yaml line ${lines[p].no}: expected key`);
        p++;
        entry(obj, kv2, itemInd);
      }
      out.push(obj);
    }
    return out;
  }

  function entry(obj: Record<string, YNode>, [k, v]: [string, string], ind: number): void {
    if (v.trim() !== "") { obj[k] = scalarOrFlow(v); return; }
    // nested block: deeper indent, or a sequence at the same indent
    if (p < lines.length && (lines[p].ind > ind || (lines[p].ind === ind && lines[p].text.startsWith("- ")))) obj[k] = block(lines[p].ind);
    else obj[k] = null;
  }

  function map(ind: number): Record<string, YNode> {
    const obj: Record<string, YNode> = {};
    while (p < lines.length && lines[p].ind === ind && !lines[p].text.startsWith("- ")) {
      const kv = splitKey(lines[p].text);
      if (!kv) throw new Error(`yaml line ${lines[p].no}: expected key in mapping`);
      p++;
      entry(obj, kv, ind);
    }
    return obj;
  }

  const root = block(lines[0]?.ind ?? 0);
  if (p < lines.length) throw new Error(`yaml line ${lines[p].no}: unexpected indentation`);
  return root;
}
