<!-- Fixed-format readout: reserved width in ch, tabular figures, no wrapping, overflow clipped. The box never depends on
     the value, so live updates cannot move anything (DevLog-004 rule 4). Format the value with src/lib/figures/fmt.ts
     (figure-space padding, typographic minus) so its length is constant too. -->
<script lang="ts">
  let { value, width, align = "right", html = false, id = undefined }: { value: string; width: number; align?: "left" | "right"; html?: boolean; id?: string } = $props();
</script>

<output class="ro-fixed" {id} style="width:{width}ch;text-align:{align}">{#if html}{@html value}{:else}{value}{/if}</output>

<style>
  .ro-fixed { display: inline-block; white-space: pre; overflow: hidden; vertical-align: bottom; font-variant-numeric: tabular-nums lining-nums; }
</style>
