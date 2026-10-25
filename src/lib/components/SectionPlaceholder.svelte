<!-- Placeholder page for an unbuilt non-chapter section (Lab, Data, Library, Colophon): title and a no-data line. -->
<script lang="ts">
  import { EXTRAS } from "$lib/content/site";
  let { slug }: { slug: string } = $props();
  const ex = $derived(EXTRAS.find((e) => e.slug === slug));
</script>

<div class="crumbs"><a href="/">lithium niobate</a> / {ex?.title}</div>
<h1 class="biref ch-title">{ex?.title}</h1>
<section class="lay" id="none" data-spine={ex?.title}>
  <div class="sh"><h2 class="biref">{ex?.title}</h2></div>
  <p class="nodata">{ex?.title} is not built; this area holds no data.</p>
</section>
