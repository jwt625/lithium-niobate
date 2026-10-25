<!-- Source cell: short citation (+ locator) and the status badge whose popup gives the full reference. Short labels come
     from the section page context ("qshort", set by QSection.svelte from the server-parsed refs.yaml). -->
<script lang="ts">
  import { getContext } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import type { StatusCode } from "$lib/content/site";
  let { id, loc = "", code, text = undefined, cite = true }: { id: string; loc?: string; code: StatusCode; text?: string; cite?: boolean } = $props();
  const short = getContext<Record<string, string>>("qshort") ?? {};
</script>

{#if cite}<span class="q-src">{short[id] ?? id}{loc ? `, ${loc}` : ""}</span> {/if}<Badge {code} pop="r:{id}" {text} />
