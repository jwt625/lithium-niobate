<!-- Chapter 08 Industry, landing: opener (manuscript 8.0), section index (TECH table / VISUAL doors), data provenance (8.9). -->
<script lang="ts">
  import "$lib/figures/industry/industry.css";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import G from "$lib/figures/industry/G.svelte";
  import Icon8 from "$lib/figures/industry/Icon8.svelte";
  import { SECTIONS8, secHref } from "$lib/figures/industry/sections";
  import { GRADE_DEF } from "$lib/figures/industry/refs";
  import { useChapterPops } from "$lib/figures/industry/pops8";
  import { ATLAS, PATLAS, WAFER_MS } from "$lib/figures/industry/facts";
  import { ATLAS_POP, NB_POP } from "$lib/figures/industry/commonpops";
  import prov from "../../../static/data/industry/provenance.json";

  let { data }: { data: PageData } = $props();
  const T = $derived(data.totals);
  useChapterPops(null, {
    "i8-atlas": ATLAS_POP, "i8-nbwafer": NB_POP,
    "i8-spread": { h: "Spread of published base-year values", body: "Highest / lowest TFLN modulator base-year value among public teaser pages: US$476 M / US$73 M = 6.5. No value is preferred; section 8.6.", badges: [["g8 gE", "E"], ["g8 gLG", "inputs LG"]] },
  });


  const WSIZES: [number, string][] = [[76.2, '3"'], [100, '4"'], [150, '6"'], [200, '8"']];
  let wsel = $state(150);
  // gross dies per wafer, DPW = pi d^2/(4S) - pi d/sqrt(2S), d = D - 2 x 3 mm, S = 10 mm^2 (template die, see 8.3)
  const dpw = (D: number): string => { const d = D - 6, S = 10; return Math.round((Math.PI * d * d) / (4 * S) - (Math.PI * d) / Math.sqrt(2 * S)).toLocaleString("en-US").padStart(5, "\u2007"); };
  const keys: Record<string, { html: string; g: string; r?: string }> = $derived({
    "8.1": { html: "25.8 g Nb in one 6-inch, 0.5 mm LN wafer", g: "E", r: "i8-nbwafer" },
    "8.2": { html: `${data.b4.nanoln} of ${data.b4.stated} atlas TFLN/TFLT papers that name a wafer supplier name NanoLN`, g: "derived", r: "i8-atlas" },
    "8.3": { html: "200 G/lane TFLN products available, 400 G/lane sampling (2026-06)", g: "V", r: "r:r09-s18" },
    "8.4": { html: `TFLN push-pull V<sub>&pi;</sub>L median ${data.tfln.med?.toFixed(2)} V cm, n = ${data.tfln.n}`, g: "derived", r: "i8-atlas" },
    "8.5": { html: "4 OFC 2026 postdeadline papers report thin-film LN or LT modulators", g: "reported", r: "r:ofc2026-th4a2+ofc2026-th4a5+ofc2026-th4a6+ofc2026-th4b2" },
    "8.6": { html: "Published TFLN base-year values differ by 6.5x", g: "E", r: "i8-spread" },
    "8.7": { html: "Most phone SAW filters use LT, not LN; BAW filters use AlN", g: "E", r: "LT_SAW" },
    "8.8": { html: `${data.events} dated events, each with URL and access date`, g: "derived", r: "i8-evcount" },
  });
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "08 Industry" }]} title="08 Industry"
  depth={[{ id: "l1", label: "L1 The chain" }, { id: "sections", label: "Sections" }, { id: "l3", label: "L3 Provenance" }]}>

  <section class="lay" id="l1" data-pair="l1" data-spine="L1 The chain">
    <div class="sh"><h2 class="biref">L1 The chain</h2><span class="meta">industry facts accessed 2026-10-24 &middot; atlas {ATLAS.commit.slice(0, 7)} ({ATLAS.date})</span></div>
    <div class="body">
      <div class="def" data-variant="tech">
        <b>The lithium niobate industry</b> &mdash; the chain that turns Brazilian ore and battery-grade lithium into crystals, wafers, thin films, and chips. LN and its sibling crystal LT are cut into acoustic filters for phones in high volume (LT appears to dominate SAW filters: inference from product pages <G g="E" r="LT_SAW" />); thin-film LN is entering data-center optics as modulator chips.
      </div>
      <div class="i8-hero" data-variant="visual">
        <p class="i8-lede"><b>The lithium niobate industry</b> &mdash; the chain that turns Brazilian ore and battery-grade lithium into crystals, wafers, thin films, and chips. LN and its sibling crystal LT are cut into acoustic filters for phones in high volume (LT appears to dominate SAW filters: inference from product pages <G g="E" r="LT_SAW" />); thin-film LN is entering data-center optics as modulator chips.</p>
        <figure class="i8-wafers" aria-label="LN wafer diameters drawn to scale: 3, 4, 6, 8 inch">
          <svg viewBox="-160 -160 320 320" role="group" aria-label="Wafer outlines to scale; hover or focus a wafer">
            {#each WSIZES as [d, l] (l)}
              {@const r = d * 0.75}
              {@const fy = -Math.sqrt(r * r - (r * 0.32) ** 2)}
              <g class="i8-wg" class:on={wsel === d} role="button" tabindex="0" aria-label="{l} wafer" onmouseenter={() => (wsel = d)} onfocus={() => (wsel = d)}>
                <path class="i8-whit" d="M{(r * 0.32).toFixed(2)} {fy.toFixed(2)} A{r} {r} 0 1 1 {(-r * 0.32).toFixed(2)} {fy.toFixed(2)} Z" />
                <path class="i8-wo" d="M{(r * 0.32).toFixed(2)} {fy.toFixed(2)} A{r} {r} 0 1 1 {(-r * 0.32).toFixed(2)} {fy.toFixed(2)} Z" />
                <text class="i8-wl" x="0" y={(r - 8).toFixed(1)} text-anchor="middle">{l}</text>
              </g>
            {/each}
          </svg>
          <figcaption class="v-cap i8-wcap"><b class="i8-wsz">{WSIZES.find((x) => x[0] === wsel)?.[1]} ({wsel} mm)</b> <span class="i8-wn">{dpw(wsel)}</span> gross dies of 10 &times; 1 mm, 3 mm edge <Badge code="derived" pop="i8-dpw" />; <span class="i8-wm">{WAFER_MS.filter((m) => m.sizes.includes(wsel)).length}</span> dated milestones in <a class="v-link" href="/industry/wafers-and-lanes/">8.3</a>. Outlines to scale; flats not to standard.</figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="lay" id="sections" data-pair="sections" data-spine="Sections">
    <div class="sh"><h2 class="biref">Sections</h2></div>
    <div class="body">
      <div class="scrollx" data-variant="tech">
        <table class="idx i8-sec">
          <thead><tr><th>No.</th><th>Section</th><th>Figures</th><th>Key number</th><th>Grade</th></tr></thead>
          <tbody>
            {#each SECTIONS8 as s (s.no)}
              <tr><td>{s.no}</td><td class="h"><a href={secHref(s)}>{s.title}</a></td><td>{s.figs}</td><td>{@html keys[s.no].html}</td><td class="i8-g"><G g={keys[s.no].g} r={keys[s.no].r} /></td></tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div class="i8-doors" data-variant="visual">
        {#each SECTIONS8 as s (s.no)}
          <a class="i8-door v-facet" href={secHref(s)}>
            <Icon8 name={s.icon} size={56} />
            <span class="i8-door-no">{s.no}</span>
            <span class="i8-door-t">{s.title}</span>
            <span class="i8-door-k">{@html keys[s.no].html} <G g={keys[s.no].g} r={keys[s.no].r} /></span>
          </a>
        {/each}
      </div>
    </div>
  </section>

  <section class="lay" id="l3" data-pair="l3" data-spine="L3 Provenance">
    <div class="sh"><h2 class="biref">L3 Data provenance</h2><span class="meta">8.9</span></div>
    <div class="body">
      <p class="tx">Industry facts carry source URL, access date, and evidence grade. Atlas facts carry commit, fetch date, device row, and evidence file. Atlas sample: {T.papers} papers, {T.rows} rows ({T.device} device, {T.design} design), years {T.yMin} to {T.yMax}, commit <a class="u" href="{ATLAS.repo}/tree/{ATLAS.commit}">{ATLAS.commit.slice(0, 7)}</a> ({ATLAS.date}); {T.open} papers open-license, {T.restricted} restricted (facts and locators only). Market numbers: report teaser pages only (LG).</p>
      <h3 class="h3"><span class="term" data-pop="g:evidence-grade">Evidence grades</span></h3>
      <div class="scrollx">
        <table class="idx i8-gr">
          <thead><tr><th>Grade</th><th>Meaning</th><th>Default view</th></tr></thead>
          <tbody>
            {#each Object.entries(GRADE_DEF) as [k, v] (k)}
              <tr><td class="i8-g"><G g={k} r="gr:{k}" /></td><td>{v}</td><td>{k === "C" || k === "LG" ? "only where a figure says so, grade printed" : k === "S" ? "labelled" : "shown"}</td></tr>
            {/each}
            <tr><td class="i8-g"><Badge code="reported" pop="gr:reported" /></td><td>value as reported by the paper's authors</td><td>shown</td></tr>
            <tr><td class="i8-g"><Badge code="derived" pop="gr:derived" /></td><td>computed in the page from atlas rows or listed inputs</td><td>shown</td></tr>
          </tbody>
        </table>
      </div>
      <p class="fine">Compound grades combine their parts: F/V, a company statement of a dated event of its own; F/T, a primary page with detail from trade press; T/V, trade press reporting a vendor claim; T/C, trade-press coverage of a primary page that could not be opened, shown because two trade sources agree.</p>
      <h3 class="h3">Atlas files behind the charts</h3>
      <div class="scrollx">
        <table class="idx i8-prov">
          <thead><tr><th>Repository</th><th>Commit</th><th>File</th><th class="r">Rows</th><th>SHA-256</th></tr></thead>
          <tbody>
            {#each prov.inputs as f (f.file)}
              <tr><td class="h"><a href={f.repo}>{f.repo.replace("https://github.com/", "")}</a></td><td><a class="u" href="{f.repo}/tree/{f.commit}">{f.commit.slice(0, 7)}</a> ({f.commit_date})</td><td>{f.file}</td><td class="r num">{f.rows}</td><td class="i8-sha">{f.sha256}</td></tr>
            {/each}
          </tbody>
        </table>
      </div>
      <p class="fine">Neither repository carries a license file; facts are shown with attribution and locators. Subsets used by the charts: <a class="u" href="/data/industry/atlas-ln.json">atlas-ln.json</a>, <a class="u" href="/data/industry/photonics-atlas-lnoi.json">photonics-atlas-lnoi.json</a>, hashes in <a class="u" href="/data/industry/provenance.json">provenance.json</a>. Industry events: <a class="u" href="/api/v1/events/industry.json">/api/v1/events/industry.json</a>. Cross-check source: photonics-atlas {PATLAS.commit.slice(0, 7)} ({PATLAS.date}).</p>
    </div>
  </section>
</ChapterPage>

<style>
  .i8-sec td:nth-child(3) { color: var(--fg3); }
  .i8-sha { font-family: var(--mono); font-size: 10.5px; color: var(--fg3); overflow-wrap: anywhere; min-width: 18ch; }
  .i8-hero { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 48px; align-items: center; }
  .i8-wafers { margin: 0; }
  .i8-wafers svg { width: 100%; max-width: 420px; display: block; margin: 0 auto; }
  .i8-wo { fill: none; stroke: var(--v-text3, var(--fg3)); stroke-width: 1.2; }
  .i8-wg { cursor: pointer; outline: none; }
  .i8-wg.on .i8-wo, .i8-wg:focus-visible .i8-wo { stroke: var(--v-l532, var(--fg)); stroke-width: 2.4; }
  .i8-wg.on .i8-wl { fill: var(--v-l532, var(--fg)); }
  .i8-wsz { display: inline-block; width: 7.5em; white-space: nowrap; }
  .i8-wn { display: inline-block; width: 3.6em; text-align: right; font-variant-numeric: tabular-nums; }
  .i8-wm { display: inline-block; width: 1.2em; text-align: center; }
  .i8-whit { fill: none; stroke: transparent; stroke-width: 12; pointer-events: stroke; }
  .i8-wcap { height: 66px; overflow: hidden; font-variant-numeric: tabular-nums; }
  .i8-wl { font: 500 11px var(--v-ui, var(--mono)); fill: var(--v-text3, var(--fg3)); }
  @media (max-width: 1000px) { .i8-hero { grid-template-columns: minmax(0, 1fr); gap: 24px; } }
</style>
