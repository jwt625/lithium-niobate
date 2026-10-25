<script lang="ts">
  import SectionPage from "$lib/figures/making/SectionPage.svelte";
  import FigLitho from "$lib/figures/making/FigLitho.svelte";
  import FigEtch from "$lib/figures/making/FigEtch.svelte";
  import FigLoss from "$lib/figures/making/FigLoss.svelte";
  import type { LossRow } from "$lib/figures/making/flow";
  let { data } = $props();
  const rows = $derived(data.extra.rows as LossRow[]);
</script>

<SectionPage {data}>
  {#snippet fig()}<FigLitho /><FigEtch />{/snippet}
  {#snippet l2fig()}<FigLoss {rows} />{/snippet}
</SectionPage>
