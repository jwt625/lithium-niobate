<script lang="ts">
  import SectionPage from "$lib/figures/making/SectionPage.svelte";
  import FigSlice from "$lib/figures/making/FigSlice.svelte";
  import FigCMP from "$lib/figures/making/FigCMP.svelte";
  let { data } = $props();
</script>

<SectionPage {data}>
  {#snippet fig()}<FigSlice />{/snippet}
  {#snippet l2fig()}<FigCMP />{/snippet}
</SectionPage>
