<!-- Figure frame (TECH .panel: bordered box with header strip and provenance footer; VISUAL restyles it as a card).
     Reserve the body height in CSS (aspect-ratio or fixed height) so data loading moves nothing. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  let { id = undefined, label, right = undefined, children, prov = undefined, variant = undefined, pair = undefined }: {
    id?: string; label: Snippet; right?: Snippet; children: Snippet; prov?: Snippet; variant?: "tech" | "visual"; pair?: string;
  } = $props();
</script>

<figure class="panel" {id} data-variant={variant} data-pair={pair} style="margin:0">
  <div class="ph"><span>{@render label()}</span>{#if right}<span>{@render right()}</span>{/if}</div>
  {@render children()}
  {#if prov}<div class="pf">{@render prov()}</div>{/if}
</figure>
