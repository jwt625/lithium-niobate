<!-- Reference list of a chapter 03 section (rows from content.server.ts refRows: citation, title, DOI or URL). -->
<script lang="ts">
  import type { RefRow } from "./types";
  let { rows }: { rows: RefRow[] } = $props();
</script>

<div class="scrollx">
  <table class="idx snd-refs">
    <thead><tr><th>Source</th><th>Reference</th><th>Link</th></tr></thead>
    <tbody>
      {#each rows as r (r.id)}
        <tr><td>{r.short}</td><td><span class="h">{r.cite}</span>{#if r.title && r.title !== r.cite}. {r.title}{/if}</td><td>{#if r.href}<a href={r.href}>{r.label}</a>{:else}<span class="dim">none</span>{/if}</td></tr>
      {/each}
    </tbody>
  </table>
</div>
