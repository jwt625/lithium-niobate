<script lang="ts">
  import SectionPage from "$lib/figures/making/SectionPage.svelte";
  import FigPoling from "$lib/figures/making/FigPoling.svelte";
  import type { PolingField } from "$lib/figures/making/poling-field";
  let { data } = $props();
  const field = $derived(data.extra.field as PolingField);
</script>

<SectionPage {data}>
  {#snippet fig()}<FigPoling {field} />{/snippet}
</SectionPage>
