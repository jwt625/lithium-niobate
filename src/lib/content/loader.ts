// Content loading for page lanes.
// 1. Pages are routes: src/routes/<chapter>/<section>/+page.svelte or +page.svx (mdsvex). Nothing to load.
// 2. Fragments written as .svx under content/ (e.g. content/chapters/02-light/pages/birefringence.svx) compile to Svelte
//    components and are loaded with `svxFragment(path)`; render with <svelte:component> or {@const C = ...}<C />.
// 3. Raw research files (manuscript.md, refs.yaml, glossary.yaml, figures.md) are available as text through `rawContent`
//    for build-time use in +page.server.ts loads (parse YAML there; never ship manuscripts to the client wholesale).
import type { Component } from "svelte";

const SVX = import.meta.glob<{ default: Component; metadata?: Record<string, unknown> }>("/content/**/*.svx");
const RAW = import.meta.glob<string>(["/content/**/*.md", "/content/**/*.yaml"], { query: "?raw", import: "default" });

/** Paths of all .svx fragments under content/ (repo-relative, leading slash). */
export const svxPaths = (): string[] => Object.keys(SVX).sort();

/** Load a compiled .svx fragment: { default: component, metadata: frontmatter }. Throws for unknown paths. */
export async function svxFragment(path: string): Promise<{ default: Component; metadata?: Record<string, unknown> }> {
  const f = SVX[path];
  if (!f) throw new Error(`no .svx fragment at ${path}`);
  return f();
}

/** Raw text of a .md or .yaml file under content/ (for server loads). Throws for unknown paths. */
export async function rawContent(path: string): Promise<string> {
  const f = RAW[path];
  if (!f) throw new Error(`no content file at ${path}`);
  return f();
}
export const rawPaths = (): string[] => Object.keys(RAW).sort();
