<!-- F6.12 IDT and SAW across a waveguide, fixed scale (doubling f halves the pitch on screen). TECH: line drawing;
     VISUAL: Au fingers, ripple crests, dashed false-color waveguide. -->
<script lang="ts">
  import { onMount } from "svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { mountFig } from "./fig";
  import { IDT_DEFAULT, idtArt, idtOuts, type Cut, type IdtState } from "./f612";

  let { init, cuts }: { init: { T: string; V: string; outs: Record<string, string> }; cuts: Cut[] } = $props();
  const O = $derived(init.outs);
  let host: HTMLElement;
  onMount(() => {
    const state: IdtState = { ...IDT_DEFAULT };
    const h = mountFig(host, { id: "f612", state, plots: { art: (s, w, hh, look) => idtArt(s, cuts, w, hh, look) }, outs: (s) => idtOuts(s, cuts) });
    return () => h.dispose();
  });
</script>

<div bind:this={host}>
  <div class="panel dvf" data-variant="tech" data-fig="f612" data-look="tech">
    <div class="ph"><span>Interdigital transducer and SAW, top view, 14 px per µm</span><span class="dim">single-electrode IDT, finger width &lambda;/4</span></div>
    <div class="dv-pw h220" data-p="art">{@html init.T}</div>
    <div class="ro" aria-live="polite"><span>&lambda;<sub>ac</sub> <b data-o="lam" style="width:9ch">{@html O.lam}</b></span><span>IDT period (pitch) <b data-o="pitch" style="width:9ch">{@html O.pitch}</b></span><span>finger <b data-o="finger" style="width:9ch">{@html O.finger}</b></span><span>v <b data-o="v" style="width:10ch">{@html O.v}</b></span></div>
    <div class="ctl"><label for="f612-f">Frequency f</label><input id="f612-f" type="range" data-k="f" min="0.5" max="6" step="0.01" value="2"><output data-o="f">{@html O.f}</output></div>
    <div class="ctl"><span class="k">Cut</span><div class="seg" data-k="cut" role="group" aria-label="Cut">{#each cuts as c (c.id)}<button type="button" data-v={c.id} class={c.id === "128" ? "on" : ""}>{c.label}</button>{/each}</div><output></output></div>
    <div class="pf"><span style="white-space:normal">&lambda; = v/f. v: free-surface SAW velocity of the cut from the partial-wave solver with the Kushibiki 1999 constants <Badge code="derived" pop="r:kushibiki1999" /> (solver: <a class="u" href="/sound/">chapter 03</a>). Crests drawn qualitatively; the photoelastic index change follows the strain sign.</span></div>
  </div>
  <div class="dvv" data-variant="visual" data-fig="f612" data-look="visual">
    <div class="v-stage v-frame"><div class="dv-pw h300" data-p="art">{@html init.V}</div></div>
    <div class="v-ctls">
      <div class="v-ctl" style="--w:9ch"><label for="f612v-f">Drive frequency</label><output data-o="f">{@html O.f}</output><input id="f612v-f" type="range" data-k="f" min="0.5" max="6" step="0.01" value="2"></div>
      <div class="v-ctl"><span class="v-lab">Cut</span><div class="v-seg" data-k="cut" role="group" aria-label="Cut">{#each cuts as c (c.id)}<button type="button" data-v={c.id} class={c.id === "128" ? "on" : ""}>{c.label}</button>{/each}</div></div>
    </div>
    <dl class="v-hud"><dt>Acoustic wavelength = IDT period</dt><dd data-o="lam">{@html O.lam}</dd><dt>Finger width</dt><dd data-o="finger">{@html O.finger}</dd><dt>SAW velocity</dt><dd data-o="v">{@html O.v}</dd></dl>
    <div class="v-prov"><span>Doubling the frequency halves the finger pitch on screen (fixed 18 px per µm). Single-electrode IDT, finger width &lambda;/4; &lambda; = v/f with the free-surface SAW velocity of the cut from the partial-wave solver and the Kushibiki 1999 constants <Badge code="derived" pop="r:kushibiki1999" /> (solver: <a class="v-link" href="/sound/">chapter 03</a>). Crests drawn qualitatively; the photoelastic index change follows the strain sign.</span></div>
  </div>
</div>
