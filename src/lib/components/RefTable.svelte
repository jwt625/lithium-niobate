<!-- Reference list for a section (shared; audit F, S6): author-year short form linked to the DOI or URL, title, venue,
     optional note. The citation key is used only as the row anchor (id="ref-<key>"), never shown. One DOM for both
     systems (table.spec; visual.css restyles it). -->
<script lang="ts">
  import { shortCite, venue, citeHref, type CiteRec } from "$lib/content/cite";
  let { refs, note = undefined }: { refs: (CiteRec & { id: string })[]; note?: (r: CiteRec & { id: string }) => string } = $props();
</script>

<div class="scrollx">
  <table class="spec reftable">
    <thead><tr><th>Source</th><th>Title</th><th>Venue</th>{#if note}<th>Note</th>{/if}</tr></thead>
    <tbody>
      {#each refs as r (r.id)}
        {@const href = citeHref(r)}
        <tr id="ref-{r.id}"><td class="h">{#if href}<a href={href}>{shortCite(r)}</a>{:else}{shortCite(r)}{/if}</td><td>{r.title ?? ""}</td><td>{venue(r)}</td>{#if note}<td>{@html note(r)}</td>{/if}</tr>
      {/each}
    </tbody>
  </table>
</div>
