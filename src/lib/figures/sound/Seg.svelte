<!-- Segmented control for chapter 03 figures. TECH markup (.seg) is restyled by visual.css; pass visual for the VISUAL
     variant (.v-seg, 44 px targets). Options: [{ v, t }] with t as HTML (sub/sup allowed). -->
<script lang="ts" generics="T extends string | number | boolean">
  let { options, value = $bindable(), label, visual = false, id = undefined }: { options: { v: T; t: string }[]; value: T; label: string; visual?: boolean; id?: string } = $props();
</script>

<div class={visual ? "v-seg" : "seg"} role="group" aria-label={label} {id}>
  {#each options as o (String(o.v))}<button type="button" class:on={value === o.v} aria-pressed={value === o.v} onclick={() => (value = o.v)}>{@html o.t}</button>{/each}
</div>
