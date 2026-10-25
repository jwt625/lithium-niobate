# Content conventions for page lanes

Binding rules: DevLog-004 "Rules for all lanes". Foundation decisions: DevLog-005.

## Where a page lives

| Page | Route file | Notes |
|---|---|---|
| Chapter landing | `src/routes/<chapter>/+page.svelte` | Default: `<ChapterLanding slug="..." />`. Replace it, or pass extra content as children |
| Section | `src/routes/<chapter>/<section-slug>/+page.svelte` or `+page.svx` | Slug in kebab case, e.g. `/light/pockels-effect/` (trailing slash; every route is prerendered) |
| Static data for a figure | `static/data/<name>.json` | Fetch as `/data/<name>.json` after mount; reserve the figure box first |
| Per-page shell overrides | `+page.server.ts` returning `{ meta }` | `PageMeta` in `site.ts`: `title`, `description`, `keys` (footer status key), `keyDefs` (extra footer legend from `KEY_SETS`, e.g. evidence grades; default on chapter 08), `aside` ("bias" or "fem"), `qpm` |

After a section is built, set `built: true` and add it to `sections` of its chapter in `src/lib/content/site.ts` (masthead nav, wafer map, landing index, chapter landing, and VISUAL doors read it). A chapter with `built: false` is plain text in the nav and has no door link.

`.svx` (mdsvex) pages may use Markdown plus Svelte components; import components in a `<script>` block. Equations: MathML (as in chapter 2.2), not images.

Fragments can also live under `content/**/*.svx` and be loaded with `svxFragment(path)` from `src/lib/content/loader.ts`. Raw research files (`manuscript.md`, `refs.yaml`, `glossary.yaml`) are readable as text with `rawContent(path)` in a `+page.server.ts` load; parse there, ship only what the page shows.

## Page skeleton

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import ModeVariant from "$lib/components/ModeVariant.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { usePops } from "$lib/content/pops";
  usePops({ "my-src": { h: "Heading", body: "<span class='v'>30.8 pm/V</span> ...", badges: [["pc", "P-comp"]], src: "Citation, <a href='https://doi.org/...'>doi:...</a>" } });
  onMount(() => { /* mount imperative figures inside the page; return their teardown */ });
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "02 Light", href: "/light/" }, { label: "2.1" }]}
  title="2.1 Birefringence" depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: "L2 ..." }, { id: "l3", label: "L3 ..." }]}>
  <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
    <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">...</span></div>
    <div class="body"><p class="tx">...</p></div>
  </section>
  ...
</ChapterPage>
```

- Sections are direct children of `<main>` (ChapterPage renders no wrapper). `data-spine` names the spine mark; `data-pair` pairs a TECH block with its VISUAL sibling so a mode switch keeps the scroll position.
- Text classes: `.tx` (paragraph), `.eq` + `.eqn` (equation and its number), `.h3`, `.fine`, `.nodata` (placeholder that states it holds no data).
- Tables: `table.spec` / `table.idx` (boxed cells), `table.log` (events), `table.kv` with a `<colgroup>` (fixed columns for live values).
- Figures: `.panel` with `.ph` header, `.ctl` control rows (label, input, `<output>`), `.pf` provenance footer; or `Figure.svelte`.

## Both design systems

Every block exists in TECH and VISUAL (DevLog-003a, 003b). Same facts, numbers, sources, badges.

- Same DOM, restyled: tables, text, panels (visual.css restyles TECH markup).
- Different DOM: `<ModeVariant>` with `tech` and `visual` snippets, or two sibling elements with `data-variant="tech"` / `data-variant="visual"` (use the attribute form when the element is a grid item or a CSS rule uses `parent > child`). Both variants are prerendered; CSS shows one from `html[data-mode]`, set before first paint.
- Shared state between the variants: `src/lib/stores/figstate.ts` (add one object per instrument).
- Imperative figure code reads mode and theme from the DOM (`isVisual()`, `isLight()`, `cssVar()` in `src/lib/figures/dom.ts`) and repaints on `onUi(cb)`. VISUAL-only components initialize lazily with `whenVisual(init)` (`src/lib/figures/visual/lifecycle.ts`).
- VISUAL colors only with physical meaning: `--v-l532` and other spectral tokens, IR in declared false color and always dashed (`.ir-el` dims under the GRIIRA motif).
- Shell motif hook: a page may hide the photorefractive cursor trace (`#pr-trace`) by toggling the class `hx-notrace` on `<html>` while its own trace runs (chapter 07 timeline band; rule `:root.hx-notrace #pr-trace { opacity: 0 }` in that chapter's CSS). Remove the class on unmount.

## Provenance

- Badges: `<Badge code="P-comp" pop="key" />`. Codes: P, P(abs), P-comp, P-db, S, V, U, reported, derived, template, engine, rec; qualifiers via `qual` (practitioner notes: `<Badge code="reported" qual="practitioner" />`; title-only reads: `<Badge code="P(abs)" qual="title" />`), never new codes (`STATUS` in `site.ts`, which also holds the footer definitions; `rec` = bibliographic record verified at the source, used for history events whose YAML status is V). Each sourced number carries a badge whose popup gives the source and locator.
- Popups: `data-pop="key"` on any element. Lookup: page entries (`usePops`), then shell entries (layout), then the generated glossary (`src/lib/generated/glossary.json`, loaded lazily). `data-pop="g:<id>"` addresses a glossary term directly. `data-pop-visual="key"` overrides the key in VISUAL. `body` may be a function for live values.
- Values with status U are never shown as fact. A placeholder says it holds no data.
- References: `<RefTable refs={...} />` (`src/lib/components/RefTable.svelte`) lists a section's sources as author-year short form (linked to DOI or URL), title and venue; `shortCite()` in `src/lib/content/cite.ts` gives the same short form for prose and popups. Citation keys (e.g. `kushibiki1999`) are row anchors (`#ref-<key>`) and popup keys only, never visible names. Research-note ids (R01-R14) are never cited on pages.

## Numbers and layout shift

- Physics only from `src/lib/physics/*.ts` (import single files with the `.ts` extension, never the directory); display-level adapters in `src/lib/figures/optics.ts`.
- Live values: fixed formats from `src/lib/figures/fmt.ts` (figure-space padding, typographic minus, `sci()`), in reserved-width slots (`Readout.svelte`, `.fv`, `table.kv` colgroups, `output` with `white-space: pre`).
- Reserve every figure box in CSS (`aspect-ratio` or fixed height) before data arrives. Compute static SVG and the default-state readouts in `+page.server.ts` and render them with `{@html}`, so the prerendered page shows final values and hydration reuses identical strings.
- Check: `pnpm test:e2e` (layout-shift suite drives every range input and segmented button; add the page to `PAGES` in `tests/e2e/layout-shift.spec.ts` and the route to `ROUTES` in `tests/e2e/util.ts`).

## Style rules

Sharp corners; dark default and light theme; no emoji; ISO dates; SI or field-standard units with absolute values; no filler copy, no statements about the site, no process labels.
