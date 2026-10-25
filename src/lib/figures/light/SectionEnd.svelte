<!-- Chapter 02 section end: references cited on the page (refs.yaml, with DOIs and how far each was read) and the
     previous / next section links. Renders one <section> (a direct child of <main>, like every page section). -->
<script lang="ts">
  import { neighbours } from "./sections";
  import type { RefEntry } from "./types";

  let { slug, refs }: { slug: string; refs: RefEntry[] } = $props();
  const nb = $derived(neighbours(slug));
</script>

<section class="lay lt" id="refs" data-pair="refs" data-spine="References">
  <div class="sh"><h2 class="biref">References</h2><span class="meta">{refs.length} sources cited in this section</span></div>
  <div class="body">
    <div class="scrollx">
      <table class="refs">
        <tbody>
          {#each refs as r (r.id)}
            <tr><td class="c">{r.cite}</td><td>{[r.title, r.where].filter(Boolean).join(". ")}.</td><td class="d">{#if r.doi}<a href="https://doi.org/{r.doi}">doi:{r.doi}</a>{:else if r.url}<a href={r.url}>{r.url}</a>{:else}no DOI{/if}</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
    <nav class="pn" aria-label="Sections">
      {#if nb.prev}<a href={nb.prev.href}><span class="n">{nb.prev.no}</span>{nb.prev.title}</a>{:else}<a href="/light/"><span class="n">02</span>Light</a>{/if}
      {#if nb.next}<a class="nx" href={nb.next.href}><span class="n">{nb.next.no}</span>{nb.next.title}</a>{:else}<a class="nx" href="/light/"><span class="n">02</span>Light</a>{/if}
    </nav>
  </div>
</section>
