<!-- Chapter 02 landing. TECH: one dense overview table (per section: L1/L2/L3 keywords, headline numbers with status, figures).
     VISUAL: illustrated doors, one physical motif and one headline number per section. Same facts and sources in both. -->
<script lang="ts">
  import "$lib/figures/light/light.css";
  import type { PageData } from "./$types";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { CHAPTERS } from "$lib/content/site";
  import { LIGHT_SECTIONS } from "$lib/figures/light/sections";
  import { usePops } from "$lib/content/pops";
  import { LIGHT_POPS } from "$lib/figures/light/pops";

  let { data }: { data: PageData } = $props();
  usePops(LIGHT_POPS);
  // svelte-ignore state_referenced_locally
  usePops(data.content.pops);
  const ch = CHAPTERS.find((c) => c.slug === "light");
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "02 Light" }]} title="02 Light"
  depth={[{ id: "overview", label: "Overview" }, { id: "sections", label: "Sections" }]}>
  <section class="lay lt" id="overview" data-pair="overview" data-spine="Overview">
    <div class="sh"><h2 class="biref">Overview</h2><span class="meta">{LIGHT_SECTIONS.length} sections, each in three depth layers</span></div>
    <div class="body">
      <table class="idx lt-depth">
        <tbody>
          <tr><td>L1 Phenomenon</td><td>{@html ch?.kw.l1 ?? ""}</td></tr>
          <tr><td>L2 Model</td><td>{@html ch?.kw.l2 ?? ""}</td></tr>
          <tr><td>L3 Computation</td><td>{@html ch?.kw.l3 ?? ""}</td></tr>
        </tbody>
      </table>
    </div>
  </section>
  <section class="lay lt" id="sections" data-pair="sections" data-spine="Sections">
    <div class="sh"><h2 class="biref">Sections</h2><span class="meta">headline numbers carry their status; figures per section</span></div>
    <div class="body">
      <div class="scrollx" data-variant="tech">
        <table class="idx lt-ov">
          <thead><tr><th>No.</th><th>Section</th><th>L1 Phenomenon</th><th>L2 Model</th><th>L3 Computation</th><th>Headline numbers</th><th>Figures</th></tr></thead>
          <tbody>
            {#each LIGHT_SECTIONS as s (s.no)}
              {@const o = data.ov[s.slug]}
              <tr>
                <td>{s.no}</td><td class="h"><a href={s.href}>{s.title}</a></td>
                <td>{@html o.l1}</td><td>{@html o.l2}</td><td>{@html o.l3}</td>
                <td class="kn">{#each o.keys as k, i (i)}<div><span class="num">{@html k.v}</span> <Badge code={k.code} pop={k.pop} /><br><span class="dim">{@html k.what}</span></div>{/each}</td>
                <td>{@html s.figs}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div class="v-doors lt-doors" data-variant="visual">
        {#each LIGHT_SECTIONS as s (s.no)}
          {@const o = data.ov[s.slug]}
          <div class="v-door lt-door">
            <a class="lt-door-art" href={s.href} aria-label="{s.no} {s.title}"><div class="v-door-art"><svg viewBox="0 0 320 200" aria-hidden="true" preserveAspectRatio="xMidYMid slice">{@html data.doors[s.slug]}</svg><span class="v-door-no">{s.no}</span></div></a>
            <div class="v-door-body">
              <a class="v-door-t" href={s.href}>{s.title}</a>
              <span class="v-door-kw">{@html o.l1}</span>
              <span class="lt-door-val">{@html o.keys[0].v} <Badge code={o.keys[0].code} pop={o.keys[0].pop} /></span>
              <span class="lt-door-what">{@html o.keys[0].what}</span>
              {#if o.keys[1]}<span class="lt-door-val2">{@html o.keys[1].v} <Badge code={o.keys[1].code} pop={o.keys[1].pop} /></span><span class="lt-door-what">{@html o.keys[1].what}</span>{/if}
              <span class="v-door-st">{@html s.figs}</span>
            </div>
          </div>
        {/each}
      </div>
      <p class="fine lt-fc" data-variant="visual">Infrared light in the drawings: <span class="term" data-pop="v-false">false color</span>, dashed.</p>
    </div>
  </section>
</ChapterPage>

<style>
  :global(.lt table.lt-depth td:first-child) { white-space: nowrap; width: 1%; }
  :global(.lt table.lt-ov) { min-width: 1040px; }
  :global(.lt table.lt-ov td) { font-size: 12px; line-height: 17px; }
  :global(.lt table.lt-ov td.kn) { min-width: 210px; }
  :global(.lt table.lt-ov td.kn > div + div) { margin-top: 6px; }
  :global(.lt table.lt-ov td.kn .num) { color: var(--fg); }
  :global(:root[data-mode="visual"] .lt .lt-door-art) { display: block; color: inherit; }
  :global(:root[data-mode="visual"] .lt .lt-doors .v-door-art svg) { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  :global(:root[data-mode="visual"] .lt .lt-doors a.v-door-t) { color: var(--v-text); }
  :global(:root[data-mode="visual"] .lt .lt-doors a.v-door-t:hover) { color: var(--v-l532); }
  :global(:root[data-mode="visual"] .lt .lt-door-val) { margin-top: 8px; font: 300 30px/36px var(--v-serif); font-variant-numeric: lining-nums tabular-nums; color: var(--v-text); }
  :global(:root[data-mode="visual"] .lt .lt-door-val2) { margin-top: 6px; font: 400 20px/26px var(--v-serif); font-variant-numeric: lining-nums tabular-nums; color: var(--v-text); }
  :global(:root[data-mode="visual"] .lt .lt-door-what) { font: 400 14px/20px var(--v-ui); color: var(--v-text3); }
  :global(:root[data-mode="visual"] .lt .lt-doors .v-door-st) { color: var(--v-text3); }
  :global(:root[data-mode="visual"] .lt .lt-door:hover) { border-color: var(--v-l532); }
  :global(:root[data-mode="visual"] .lt .lt-fc) { margin-top: 24px; }
</style>
