<!-- Renders a TECH and a VISUAL variant of the same block. Both are in the prerendered markup; CSS shows the one that
     matches html[data-mode] (set before first paint), so there is no flash and no hydration-time swap. Each wrapper is
     display: contents, so the variants lay out as children of the parent (grid items stay grid items). Share state
     between the two through src/lib/stores/figstate.ts. Note: CSS written as `parent > child` must account for the
     wrapper; put data-variant directly on the element instead when such a selector applies (as the mockup does). -->
<script lang="ts">
  import type { Snippet } from "svelte";
  let { tech, visual }: { tech: Snippet; visual: Snippet } = $props();
</script>

<div class="mv" data-variant="tech">{@render tech()}</div><div class="mv" data-variant="visual">{@render visual()}</div>

<style>
  .mv { display: contents; }
</style>
