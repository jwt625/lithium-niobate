<!-- Chapter 06 section page: depth layers from the manuscript (server-converted HTML), figure slots rendered by the
     page's `fig` snippet at the manuscript's [[F6.nn]] / [[A#]] markers, then the section's sources and neighbours. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import ChapterPage from "$lib/components/ChapterPage.svelte";
  import type { SectionDoc } from "./manuscript";
  import type { SrcRow } from "./server";
  import { DEV_SECTIONS, secHref } from "./nav";
  import "./devices.css";

  let { doc, labels, sources, fig = undefined, meta = {}, extra = undefined, landing = false }: { doc: SectionDoc; labels: Partial<Record<"L1" | "L2" | "L3", string>>; sources: SrcRow[]; fig?: Snippet<[string]>; meta?: Partial<Record<"L1" | "L2" | "L3", string>>; extra?: Snippet; landing?: boolean } = $props();
  const LAB = { L1: "Phenomenon", L2: "Model and data", L3: "Measurement and conventions" };
  const lab = (lv: "L1" | "L2" | "L3"): string => `${lv} ${labels[lv] ?? LAB[lv]}`;
  const i = $derived(DEV_SECTIONS.findIndex((s) => s.no === doc.no));
  const prev = $derived(i > 0 ? DEV_SECTIONS[i - 1] : null);
  const next = $derived(landing ? DEV_SECTIONS[0] : i >= 0 && i < DEV_SECTIONS.length - 1 ? DEV_SECTIONS[i + 1] : null);
</script>

<ChapterPage crumbs={landing ? [{ label: "lithium niobate", href: "/" }, { label: "06 Devices" }] : [{ label: "lithium niobate", href: "/" }, { label: "06 Devices", href: "/devices/" }, { label: doc.no }]} title={landing ? "06 Devices" : `${doc.no} ${doc.title}`}
  depth={[...doc.levels.map((l) => ({ id: l.lv.toLowerCase(), label: lab(l.lv) })), ...(landing ? [{ id: "sections", label: "Sections" }] : []), { id: "sources", label: "Sources" }]}>
  {#each doc.levels as L (L.lv)}
    <section class="lay dv" id={L.lv.toLowerCase()} data-pair={L.lv.toLowerCase()} data-spine={lab(L.lv)}>
      <div class="sh"><h2 class="biref">{lab(L.lv)}</h2>{#if meta[L.lv]}<span class="meta">{@html meta[L.lv]}</span>{/if}</div>
      <div class="body">
        {#each L.items as it, k (k)}
          {#if it.t === "html"}{@html it.html}{:else if it.t === "h3"}<h3 class="h3">{@html it.html}</h3>{:else}{@render fig?.(it.id)}{/if}
        {/each}
      </div>
    </section>
  {/each}
  {@render extra?.()}
  <section class="lay dv" id="sources" data-pair="sources" data-spine="Sources">
    <div class="sh"><h2 class="biref">Sources</h2><span class="meta">{sources.length} cited in {doc.no}</span></div>
    <div class="body">
      {#if sources.length}
        <div class="scrollx">
          <table class="log dv-src">
            <thead><tr><th>Ref</th><th>Title</th><th>Link</th></tr></thead>
            <tbody>
              {#each sources as s (s.id)}
                <tr><td>{s.cite}</td><td class="e">{s.title}</td><td>{#if s.href}<a href={s.href} target="_blank" rel="noopener">{s.label}</a>{:else}{s.label}{/if}</td></tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p class="nodata">References for {doc.no} are given inline: DOIs in the table above.</p>
      {/if}
      <nav class="dv-pn" aria-label="Sections">
        {#if prev}<a href={secHref(prev)}><span class="num">{prev.no}</span> {prev.title}</a>{:else if !landing}<a href="/devices/"><span class="num">6.0</span> Chapter opener</a>{/if}
        {#if next}<a href={secHref(next)}><span class="num">{next.no}</span> {next.title}</a>{/if}
      </nav>
    </div>
  </section>
</ChapterPage>
