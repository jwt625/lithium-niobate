// /colophon/: how the site is built (versions read from package.json at build time), data model, status codes,
// provenance rules, licenses, the two design systems, the motifs with their physics, build date.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { PageMeta } from "$lib/content/site";
import INDEX from "$lib/generated/index.json";
import { qpmPeriodSHG } from "$lib/figures/optics";

const ROUTES = import.meta.glob("/src/routes/**/+page.{svelte,svx}");
const TESTS = import.meta.glob("/src/lib/physics/*.test.ts");

export const load = () => {
  const meta: Partial<PageMeta> = {
    title: "Colophon",
    description: "How lithium-niobate.com is built: stack, data model and status codes, provenance rules, licenses, the TECH and VISUAL design systems, and the physics behind the page motifs.",
    keys: ["P", "P-comp", "P-db", "S", "V", "U", "reported", "derived", "template", "engine"],
  };
  const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as { dependencies: Record<string, string>; devDependencies: Record<string, string>; license: string; packageManager?: string };
  const v = (n: string): string => pkg.devDependencies[n] ?? pkg.dependencies[n] ?? "";
  const stack = [
    ["Framework", `SvelteKit ${v("@sveltejs/kit")}, Svelte ${v("svelte")}, static adapter ${v("@sveltejs/adapter-static")}: every route prerendered to HTML, no server at runtime`],
    ["Build", `Vite ${v("vite")}, TypeScript ${v("typescript")}, mdsvex ${v("mdsvex")}; ${pkg.packageManager?.replace("@", " ") ?? "pnpm"}`],
    ["3D", `three.js ${v("three")} (r${v("three").split(".")[1]}), loaded on the first VISUAL view only; scenes render on demand`],
    ["Physics", `src/lib/physics: dependency-free TypeScript, pure functions, ${Object.keys(TESTS).length} test files run with node --test`],
    ["Data", "canonical YAML in data/ with JSON Schemas, built by scripts/build_data.py (Python, run with uv) into static/api/v1, llms.txt and the page data"],
    ["Tests", `Playwright ${v("@playwright/test")}`],
    ["Type", "TECH: IBM Plex Sans, Mono, Sans Condensed. VISUAL: Newsreader, Inter, STIX Two Text (Greek). All SIL OFL, from Google Fonts"],
    ["Math", "MathML in the page source; no math script"],
    ["Pages", `${Object.keys(ROUTES).length} page sources, of which /data/<property>/ expands to one page per property`],
  ];
  const c = (INDEX as { counts: Record<string, number | Record<string, number>> }).counts;
  return { meta, stack, counts: c, qpm1064: qpmPeriodSHG(1.064).toFixed(2), qpm1550: qpmPeriodSHG(1.55).toFixed(2), built: new Date().toISOString().slice(0, 10), license: pkg.license };
};
