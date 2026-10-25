<!-- VISUAL control (.v-ctl): sentence-case label, 22 px tabular readout of reserved width (--w in ch), 44 px range. -->
<script lang="ts">
  let { id, label, value = $bindable(), min, max, step, out, w = 10, aria = undefined, disabled = false }: {
    id: string; label: string; value: number; min: number; max: number; step: number; out: string; w?: number; aria?: string; disabled?: boolean;
  } = $props();
</script>

<div class="v-ctl" class:q-off={disabled} style="--w:{w}ch"><label for={id}>{@html label}</label><output for={id}>{out}</output><input {id} type="range" {min} {max} {step} {disabled} aria-valuetext={aria ?? out} bind:value></div>
