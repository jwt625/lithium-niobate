// Section map for the lab index and the library (build time). Section number -> title (manuscript "## N.M Title"),
// route (site.ts sections first, else the chapter lanes' local registries, read as text), and whether the route exists
// in src/routes now. Anchors (#l1..#l3) only when the target page source carries that id literally, so prerendering
// never meets a missing hash target. Unbuilt sections stay unlinked (DevLog-003a rule 9).
import { CHAPTERS } from "$lib/content/site";
import { rawContent, rawPaths } from "$lib/content/loader";

const ROUTE_SRC = import.meta.glob<string>("/src/routes/*/*/+page.{svelte,svx}", { query: "?raw", import: "default", eager: true });
const REG_SRC = import.meta.glob<string>("/src/lib/figures/*/{sections,nav,data}.ts", { query: "?raw", import: "default", eager: true });

export interface SecInfo { no: string; ch: string; title: string; href?: string; anchors: string[] }

const chNo = (slug: string): string => CHAPTERS.find((c) => c.slug === slug)?.no ?? "";

/** Raw source of an existing route page, keyed by URL path ("/light/birefringence/"). */
export function routeSources(): Map<string, string> {
  const m = new Map<string, string>();
  for (const [k, v] of Object.entries(ROUTE_SRC)) {
    const r = /^\/src\/routes\/([^/]+)\/([^/]+)\/\+page\.(svelte|svx)$/.exec(k);
    if (r && !r[2].startsWith("(") && !r[2].startsWith("[")) m.set(`/${r[1]}/${r[2]}/`, v);
  }
  return m;
}

/** Registry objects { no, slug, figs } found in the chapter lanes' section files (text scan, tolerant to their shapes). */
function registries(): { ch: string; no: string; slug: string; text: string; title?: string }[] {
  const out: { ch: string; no: string; slug: string; text: string; title?: string }[] = [];
  for (const [path, src] of Object.entries(REG_SRC)) {
    const chSlug = /\/src\/lib\/figures\/([^/]+)\//.exec(path)?.[1] ?? "";
    const ch = chNo(chSlug);
    if (!ch) continue;
    for (const line of src.split("\n")) {
      const no0 = /\bno:\s*"?(\d+(?:\.\d+)?)"?\s*,/.exec(line)?.[1];
      const slug = /\bslug:\s*"([a-z0-9-]+)"/.exec(line)?.[1];
      if (!no0 || !slug) continue;
      const no = no0.includes(".") ? no0 : `${+ch}.${no0}`;
      out.push({ ch, no, slug, text: line, title: /\btitle:\s*"([^"]+)"/.exec(line)?.[1] });
    }
  }
  return out;
}

let cache: { secs: Map<string, SecInfo>; regs: ReturnType<typeof registries> } | null = null;

export async function sectionMap(): Promise<Map<string, SecInfo>> {
  if (cache && !import.meta.env.DEV) return cache.secs;
  const secs = new Map<string, SecInfo>();
  const routes = routeSources();
  const regs = registries();
  for (const c of CHAPTERS) {
    const dir = rawPaths().find((p) => new RegExp(`^/content/chapters/${c.no}-[^/]+/manuscript\\.md$`).test(p));
    const ms = dir ? await rawContent(dir) : "";
    for (const h of ms.matchAll(/^## (\d+)\.(\d+)?\s*(.*)$/gm)) {
      const no = h[2] !== undefined ? `${h[1]}.${h[2]}` : `${+c.no}.${h[1]}`;
      if (!no.startsWith(`${+c.no}.`) || no.endsWith(".0")) continue;
      const title = h[3].replace(/^\.\s*/, "").replace(/\s*\((?:\d{4}-\d{4}|as of [^)]*)\)\s*$/, "").trim();
      const fromSite = c.sections.find((s) => s.no === no && s.built)?.href;
      const fromReg = regs.find((r) => r.ch === c.no && r.no === no)?.slug;
      const cand = fromSite ?? (fromReg ? `/${c.slug}/${fromReg}/` : undefined);
      const src = cand ? routes.get(cand) : undefined;
      const regTitle = regs.find((r) => r.ch === c.no && r.no === no)?.title;
      secs.set(no, { no, ch: c.no, title: regTitle ?? title, href: src !== undefined ? cand : undefined, anchors: src ? ["l1", "l2", "l3"].filter((a) => src.includes(`id="${a}"`)) : [] });
    }
  }
  cache = { secs, regs };
  return secs;
}

/** Fallback placement from the lanes' registries: a registry entry whose text names the figure id. */
export async function registryPlacement(id: string): Promise<string> {
  if (!cache) await sectionMap();
  const hit = cache?.regs.find((r) => new RegExp(`(^|[^\\w.-])${id.replace(/\./g, "\\.")}(?![\\w]|[.-]\\d)`).test(r.text));
  return hit?.no ?? "";
}

/** First existing route whose source matches re (e.g. a page that mounts a given scene). */
export function routeMatching(re: RegExp): string | undefined {
  for (const [href, src] of routeSources()) if (re.test(src)) return href;
  return undefined;
}

export const chapterOf = (no: string): string => no.split(".")[0].padStart(2, "0");
