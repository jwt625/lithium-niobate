<!-- Chapter 04 section frame: crumbs, title, depth index (L1, L2, L3, Sources), page popups (references "r:<id>", chapter
     glossary "q:<slug>", page entries), the page body (sections L1-L3 as direct children of <main>), the reference list,
     and previous / next section links. -->
<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import { usePops, type Pop } from "$lib/content/pops";
  import { QSECTIONS, qHref, sectionBySlug } from "./sections.ts";
  import { MOTIF_POPS } from "./motifs.ts";
  import "./quirks.css";

  interface RefLine { id: string; short: string; html: string; read: string }
  interface Data { slug: string; refs: { pops: Record<string, Pop>; short: Record<string, string>; list: RefLine[] }; gloss: Record<string, Pop> }
  let { data, pops = {}, l2 = "L2 Model", l3 = "L3 Measurement and limits", children }: { data: Data; pops?: Record<string, Pop>; l2?: string; l3?: string; children: Snippet } = $props();
  // svelte-ignore state_referenced_locally
  const d0 = data;
  const sec = sectionBySlug(d0.slug);
  const i = QSECTIONS.indexOf(sec);
  const prev = QSECTIONS[i - 1], next = QSECTIONS[i + 1];
  // svelte-ignore state_referenced_locally
  usePops({ ...d0.gloss, ...d0.refs.pops, ...MOTIF_POPS, ...pops });
  setContext("qshort", d0.refs.short);
</script>

<ChapterPage crumbs={[{ label: "lithium niobate", href: "/" }, { label: "04 Quirks", href: "/quirks/" }, { label: sec.no }]} title="{sec.no} {sec.title}"
  depth={[{ id: "l1", label: "L1 Phenomenon" }, { id: "l2", label: l2 }, { id: "l3", label: l3 }, { id: "src", label: "Sources" }]}>
  {@render children()}
  <section class="lay" id="src" data-pair="src" data-spine="Sources">
    <div class="sh"><h2 class="biref">Sources</h2></div>
    <div class="body">
      <ol class="q-refs">
        {#each d0.refs.list as r (r.id)}<li id="ref-{r.id}"><span class="q-rid">{r.short}</span><span class="q-rtx">{@html r.html}{#if r.read}<span class="q-rread">{@html r.read}</span>{/if}</span></li>{/each}
      </ol>
      <nav class="q-pn" aria-label="Chapter 04 sections">
        {#if prev}<a href={qHref(prev)}><span class="q-pk">previous</span><span>{prev.no} {prev.short}</span></a>{:else}<a href="/quirks/"><span class="q-pk">chapter</span><span>04 Quirks</span></a>{/if}
        {#if next}<a href={qHref(next)} class="r"><span class="q-pk">next</span><span>{next.no} {next.short}</span></a>{:else}<a href="/quirks/" class="r"><span class="q-pk">chapter</span><span>04 Quirks</span></a>{/if}
      </nav>
    </div>
  </section>
</ChapterPage>
