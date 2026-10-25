<!-- Renders parsed manuscript blocks (content.ts): paragraphs, lists, tables; figure slots call the `fig` snippet. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Block } from "./content";
  let { blocks, fig }: { blocks: Block[]; fig: Snippet<[Extract<Block, { kind: "fig" }>]> } = $props();
</script>

{#each blocks as b, i (i)}
  {#if b.kind === "p"}<p class="tx">{@html b.html}</p>
  {:else if b.kind === "ul"}<ul class="tx hx-ul">{#each b.items as it, j (j)}<li>{@html it}</li>{/each}</ul>
  {:else if b.kind === "table"}
    <div class="scrollx"><table class="idx hx-mt"><thead><tr>{#each b.head as h, j (j)}<th>{@html h}</th>{/each}</tr></thead>
      <tbody>{#each b.rows as r, j (j)}<tr>{#each r as c, k (k)}<td class:h={k === 0}>{@html c}</td>{/each}</tr>{/each}</tbody></table></div>
  {:else if b.kind === "fig"}{@render fig(b)}
  {/if}
{/each}
