<!-- Segmented choice. kind "t": TECH .seg (mono, 22 px); kind "v": VISUAL .v-seg (44 px). Options [value, label HTML]. -->
<script lang="ts" generics="T extends string | number | boolean">
  let { value = $bindable(), options, label, kind = "t" }: { value: T; options: [T, string][]; label: string; kind?: "t" | "v" } = $props();
</script>

<div class={kind === "t" ? "seg" : "v-seg"} role="group" aria-label={label}>{#each options as [v, l] (String(v))}<button type="button" class:on={v === value} aria-pressed={v === value} onclick={() => (value = v)}>{@html l}</button>{/each}</div>
