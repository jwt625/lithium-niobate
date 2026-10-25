<script lang="ts">
  import SectionPage from "$lib/figures/making/SectionPage.svelte";
  import FigCut from "$lib/figures/making/FigCut.svelte";
  let { data } = $props();
</script>

<SectionPage {data}>
  {#snippet fig()}<FigCut />{/snippet}
</SectionPage>
