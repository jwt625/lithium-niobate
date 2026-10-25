<!-- F7.8 Ion slice (figures.md F7.8): implant (energy sets the damage-layer depth), bond to an oxidized substrate, split
     and polish. Depth scale is illustrative (linear in energy through the one sourced pair, 3.8 MeV and about 10 um,
     us6540827, P); sourced film thicknesses listed with their papers. -->
<script lang="ts">
  import { lab } from "../labels";
  let step = $state(0), E = $state(3.8);
  const depth = $derived((E / 3.8) * 10); // um, illustrative linear scale through the sourced pair
  const sourced = $derived(Math.abs(E - 3.8) < 0.05);
  const K = 7; // px per um in the drawing
  const STEPS = ["Implant", "Bond", "Split and polish"];
  const dTxt = $derived(`${depth.toFixed(1).padStart(4, " ")} µm`);
</script>

{#snippet art(cls: string)}
  <svg class="hx-is {cls}" viewBox="0 0 520 260" role="img" aria-label="Ion slicing cross-section, step {step + 1}: {STEPS[step]}">
    {#if step === 0}
      <rect class="ln" x="60" y="80" width="400" height="160"/>
      <line class="dmg" x1="60" x2="460" y1={80 + depth * K} y2={80 + depth * K}/>
      {#each Array.from({ length: 9 }, (_, k) => k) as k (k)}<path class="ion" d="M{90 + k * 42} 20 V70 m-5 -8 l5 8 l5 -8"/>{/each}
      <text class="lb" x="470" y={84 + depth * K}>{sourced ? "~10 µm" : "illustrative"}</text>
    {:else if step === 1}
      <rect class="ln" x="60" y="20" width="400" height="120"/>
      <line class="dmg" x1="60" x2="460" y1={140 - depth * K} y2={140 - depth * K}/>
      <rect class="ox" x="60" y="140" width="400" height="14"/><rect class="si" x="60" y="154" width="400" height="90"/>
      <text class="lb" x="470" y="150">SiO&#8322;</text><text class="lb" x="470" y="200">handle</text>
    {:else}
      <rect class="ln" x="60" y="10" width="400" height={Math.max(20, 120 - depth * K - 30)}/>
      <path class="ion" d="M260 {Math.max(30, 120 - depth * K - 20) + 4} v-14 m-5 6 l5 -6 l5 6"/>
      <rect class="ln" x="60" y={140 - depth * K} width="400" height={depth * K}/>
      <rect class="ox" x="60" y="140" width="400" height="14"/><rect class="si" x="60" y="154" width="400" height="90"/>
      <text class="lb" x="470" y={140 - (depth * K) / 2 + 4}>film</text>
    {/if}
  </svg>
{/snippet}

<div data-variant="tech" class="panel hx-isp">
  <div class="ph"><span>Crystal ion slicing, step {step + 1} of 3</span><span class="seg" role="group" aria-label="Step">{#each STEPS as s, k (s)}<button type="button" class:on={step === k} onclick={() => (step = k)}>{k + 1}</button>{/each}</span></div>
  {@render art("t")}
  <div class="ctl"><label for="is-e">Implant energy</label><input id="is-e" type="range" min="0.5" max="5" step="0.1" bind:value={E}><output>{E.toFixed(1)} MeV</output></div>
  <table class="kv"><colgroup><col><col class="cv"></colgroup><tbody>
    <tr><td>Damage-layer depth (linear through 3.8 MeV / 10 &micro;m)</td><td class="v">{dTxt}</td></tr>
    <tr><td>Film, Levy et al. 1998 <span class="hx-ref" data-pop="src:levy1998">{lab("levy1998")}</span></td><td class="v">9 &micro;m</td></tr>
    <tr><td>Film, Rabiei &amp; G&uuml;nter 2004 <span class="hx-ref" data-pop="src:rabiei2004">{lab("rabiei2004")}</span></td><td class="v">680 nm</td></tr>
  </tbody></table>
  <div class="pf">3.8 MeV for a damage layer near 10 &micro;m: <span class="hx-ref" data-pop="src:us6540827">{lab("us6540827")}</span> <span class="b rec" data-pop="hst:V">rec</span> (patent, not tied to the paper). Other energies: drawn on a linear scale through that pair, not a range calculation.</div>
</div>

<div data-variant="visual" class="hx-vis2">
  <div class="v-seg" role="group" aria-label="Step">{#each STEPS as s, k (s)}<button type="button" class:on={step === k} onclick={() => (step = k)}>{k + 1}. {s}</button>{/each}</div>
  {@render art("v")}
  <div class="hx-vis2-g">
    <div class="v-ctl" style="--w:8ch"><label for="vis-e">Implant energy</label><output>{E.toFixed(1)} MeV</output><input id="vis-e" class="v-range" type="range" min="0.5" max="5" step="0.1" bind:value={E}></div>
    <dl class="v-hud"><dt>Damage-layer depth</dt><dd>{dTxt}</dd><dt>Scale</dt><dd>{sourced ? "sourced pair" : "illustrative"}</dd><dt>Films reported</dt><dd>9 &micro;m (1998), 680 nm (2004)</dd></dl>
  </div>
  <p class="v-cap">3.8 MeV and about 10 &micro;m from <span class="hx-ref" data-pop="src:us6540827">{lab("us6540827")}</span> (patent, not tied to the paper; other energies on a linear scale through that pair, not a range calculation); films: <span class="hx-ref" data-pop="src:levy1998">{lab("levy1998")}</span>, <span class="hx-ref" data-pop="src:rabiei2004">{lab("rabiei2004")}</span>.</p>
</div>
