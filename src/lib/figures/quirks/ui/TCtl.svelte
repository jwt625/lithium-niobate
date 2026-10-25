<!-- TECH control row (.panel .ctl): label, range input, fixed-width output. Value is bindable (log sliders bind the
     exponent; the parent formats `out`). -->
<script lang="ts">
  let { id, label, value = $bindable(), min, max, step, out, aria = undefined, disabled = false }: {
    id: string; label: string; value: number; min: number; max: number; step: number; out: string; aria?: string; disabled?: boolean;
  } = $props();
</script>

<div class="ctl" class:q-off={disabled}><label for={id}>{@html label}</label><input {id} type="range" {min} {max} {step} {disabled} aria-valuetext={aria ?? out} bind:value><output for={id} class="q-o">{out}</output></div>
