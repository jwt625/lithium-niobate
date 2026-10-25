<!-- Chapter 01 section frame: ChapterPage head (crumbs, title, depth index), the page's L1/L2/L3 sections, then the
     section's reference list (every source cited on the page, with DOI) and prev/next links. Registers the page's source
     and term popups (built by sources.server.ts popsFor). Renders no wrapper, so sections stay direct children of <main>. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import { usePops, type Pop } from "$lib/content/pops";
  import { CR_SECTIONS, crHref } from "./sections";
  import "./crystal.css";

  interface Depth { id: string; label: string }
  interface RefRow { id: string; name: string; html: string }
  let { slug, depth, pops, refs, children }: { slug: string; depth: Depth[]; pops: Record<string, Pop>; refs: RefRow[]; children: Snippet } = $props();

  // svelte-ignore state_referenced_locally
  usePops(pops);
  const i = $derived(CR_SECTIONS.findIndex((s) => s.slug === slug));
  const sec = $derived(CR_SECTIONS[i]);
  const prev = $derived(i > 0 ? CR_SECTIONS[i - 1] : null);
  const next = $derived(i < CR_SECTIONS.length - 1 ? CR_SECTIONS[i + 1] : null);
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "01 Crystal", href: "/crystal/" }, { label: sec.no }]} title="{sec.no} {sec.title}"
  depth={[...depth, { id: "refs", label: "Sources" }]}>
  {@render children()}
  <section class="lay cx-refs" id="refs" data-pair="refs" data-spine="Sources">
    <div class="sh"><h2 class="biref">Sources</h2><span class="meta">{refs.length} cited in {sec.no}</span></div>
    <div class="body">
      <ol class="cx-reflist">
        {#each refs as r (r.id)}<li id="ref-{r.id}"><span class="cx-refid">{r.name}</span><span>{@html r.html}</span></li>{/each}
      </ol>
      <nav class="cx-pn" aria-label="Sections of chapter 01">
        {#if prev}<a href={crHref(prev)} class="prev"><span class="k">&larr; {prev.no}</span><span class="t">{prev.title}</span></a>{:else}<a href="/crystal/" class="prev"><span class="k">&larr; 01</span><span class="t">Crystal, all sections</span></a>{/if}
        {#if next}<a href={crHref(next)} class="next"><span class="k">{next.no} &rarr;</span><span class="t">{next.title}</span></a>{:else}<a href="/crystal/" class="next"><span class="k">01 &rarr;</span><span class="t">Crystal, all sections</span></a>{/if}
      </nav>
    </div>
  </section>
</ChapterPage>
