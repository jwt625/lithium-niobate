<!-- Chapter / section page head: crumbs, title, sticky depth index (L1/L2/L3 anchors, highlights the layer in view), then
     the page body. Renders no wrapper element, so the page's sections stay direct children of <main> (visual.css insets
     `main > section`). Sections: <section class="lay" id="l1" data-pair="l1" data-spine="L1 ..."> with a `.sh` head. -->
<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { mountDepthNav } from "$lib/figures/depthnav";

  interface Crumb { label: string; href?: string }
  interface Depth { id: string; label: string }
  let { crumbs, title, depth, children }: { crumbs: Crumb[]; title: string; depth: Depth[]; children: Snippet } = $props();

  let nav: HTMLElement;
  onMount(() => mountDepthNav(nav, depth.map((d) => d.id)));
</script>

<div class="crumbs">{#each crumbs as c, i (i)}{#if i}{" / "}{/if}{#if c.href}<a href={c.href}>{c.label}</a>{:else}{c.label}{/if}{/each}</div>
<h1 class="biref ch-title">{title}</h1>
<nav class="depth" id="depth" aria-label="Depth" bind:this={nav}>
  {#each depth as d (d.id)}<a href="#{d.id}">{d.label}</a>{/each}
</nav>
{@render children()}
