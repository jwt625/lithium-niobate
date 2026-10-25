<!-- Chapter landing template: crumbs, title, depth index (L1/L2/L3 anchors), one section per depth layer with the
     chapter's index keywords, and the sections table (built sections link). Unbuilt areas say they hold no data.
     Page lanes either replace the route's +page.svelte / +page.svx or pass extra content as children (rendered after
     the sections table). -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import ChapterPage from "./ChapterPage.svelte";
  import { CHAPTERS } from "$lib/content/site";

  let { slug, children = undefined }: { slug: string; children?: Snippet } = $props();
  const ch = $derived(CHAPTERS.find((c) => c.slug === slug));
</script>

{#if ch}
  <ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: `${ch.no} ${ch.title}` }]} title="{ch.no} {ch.title}"
    depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: "L2 Model" }, { id: "l3", label: "L3 Computation" }, { id: "sections", label: "Sections" }]}>
    <section class="lay" id="l1" data-pair="l1" data-spine="L1 Phenomenon">
      <div class="sh"><h2 class="biref">L1 Phenomenon</h2><span class="meta">keywords</span></div>
      <div class="body"><p class="tx">{@html ch.kw.l1}</p></div>
    </section>
    <section class="lay" id="l2" data-pair="l2" data-spine="L2 Model">
      <div class="sh"><h2 class="biref">L2 Model</h2><span class="meta">keywords</span></div>
      <div class="body"><p class="tx">{@html ch.kw.l2}</p></div>
    </section>
    <section class="lay" id="l3" data-pair="l3" data-spine="L3 Computation">
      <div class="sh"><h2 class="biref">L3 Computation</h2><span class="meta">keywords</span></div>
      <div class="body"><p class="tx">{@html ch.kw.l3}</p></div>
    </section>
    <section class="lay" id="sections" data-pair="sections" data-spine="Sections">
      <div class="sh"><h2 class="biref">Sections</h2></div>
      <div class="body">
        {#if ch.sections.length}
          <div class="scrollx">
            <table class="idx kw">
              <thead><tr><th>No.</th><th>Section</th><th>Status</th></tr></thead>
              <tbody>
                {#each ch.sections as s (s.no)}
                  <tr><td>{s.no}</td><td class="h">{#if s.built}<a href={s.href}>{s.title}</a>{:else}{s.title}{/if}</td><td>{s.built ? "L1 to L3" : "not built"}</td></tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p class="nodata">No section of chapter {ch.no} is built; this area holds no data.</p>
        {/if}
        {@render children?.()}
      </div>
    </section>
  </ChapterPage>
{/if}
