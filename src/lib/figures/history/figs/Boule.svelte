<!-- F7.2 Pull a boule (figures.md F7.2): a seed drawn from a melt at a chosen rate, with or without rotation; the boule
     grows as an illustration. No growth rates or diameters are sourced in this chapter: the panel holds no data.
     Reduced motion: the final state is drawn. -->
<script lang="ts">
  import { lab } from "../labels";
  import { onMount } from "svelte";
  let rate = $state(5), rot = $state(true), L = $state(1), pulling = $state(false), phase = $state(0);
  // illustrative shape: faster pulling draws a thinner body (display relation only)
  const R = $derived(40 - rate * 2.2);
  const body = $derived.by(() => {
    const top = 40, len = 150 * L, sh = Math.min(len, 26);
    const x0 = 150, y0 = top + 14;
    return `M${x0 - 4} ${top} V${y0} C ${x0 - 4} ${y0 + sh * 0.5} ${x0 - R} ${y0 + sh * 0.6} ${x0 - R} ${y0 + sh} V${y0 + len} Q ${x0} ${y0 + len + 10} ${x0 + R} ${y0 + len} V${y0 + sh} C ${x0 + R} ${y0 + sh * 0.6} ${x0 + 4} ${y0 + sh * 0.5} ${x0 + 4} ${y0} V${top} Z`;
  });
  const bottom = $derived(54 + 150 * L + 6);
  const reduce = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0, last = 0;
  function tick(now: number): void {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    L = Math.min(1, L + dt * rate * 0.02);
    if (rot) phase = (phase + dt * 40) % 12;
    if (L < 1) raf = requestAnimationFrame(tick); else pulling = false;
  }
  function pull(): void {
    L = 0.02;
    if (reduce()) { L = 1; return; }
    pulling = true; last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  }
  onMount(() => () => cancelAnimationFrame(raf));
  const stripes = $derived(Array.from({ length: 20 }, (_, k) => 54 + 26 + k * 7 + (rot ? phase * 0.58 : 0)).filter((y) => y < bottom - 6));
</script>

{#snippet art(cls: string)}
  <svg class="hx-bo {cls}" viewBox="0 0 300 300" role="img" aria-label="Czochralski pulling: seed, boule, melt in a crucible (illustration, no data)">
    <line class="rod" x1="150" y1="0" x2="150" y2="40"/>
    {#if rot}<path class="rot" d="M132 18 a18 6 0 1 0 36 0" /><path class="rot" d="M165 14 l4 4 l-5 2"/>{/if}
    <path class="boule" d={body}/>
    <clipPath id="bo-clip-{cls}"><path d={body}/></clipPath>
    <g clip-path="url(#bo-clip-{cls})">{#each stripes as y (y)}<line class="str" x1="100" x2="200" y1={y} y2={y + 2}/>{/each}</g>
    <path class="cru" d="M60 200 V286 H240 V200"/>
    <rect class="melt" x="62" y={Math.max(bottom, 206)} width="176" height={284 - Math.max(bottom, 206)}/>
    <line class="mel" x1="62" x2="238" y1={Math.max(bottom, 206)} y2={Math.max(bottom, 206)}/>
    {#each [212, 232, 252, 272] as y (y)}<circle class="coil" cx="48" cy={y} r="5"/><circle class="coil" cx="252" cy={y} r="5"/>{/each}
  </svg>
{/snippet}

<div data-variant="tech" class="panel hx-bop">
  <div class="ph"><span>Czochralski pull</span><span>illustration, no data</span></div>
  <div class="hx-bo-g">
    {@render art("t")}
    <div>
      <div class="ctl"><label for="bo-r">Pull rate</label><input id="bo-r" type="range" min="1" max="10" step="1" bind:value={rate}><output>{String(rate).padStart(2, " ")} / 10</output></div>
      <div class="ctl"><span class="k">Rotation</span><span class="seg" role="group" aria-label="Seed rotation"><button type="button" class:on={rot} onclick={() => (rot = true)}>ON</button><button type="button" class:on={!rot} onclick={() => (rot = false)}>OFF</button></span><span></span></div>
      <div class="ctl"><span class="k">Seed</span><span class="seg"><button type="button" onclick={pull}>DIP AND PULL</button></span><span></span></div>
      <div class="pf">Display scale only: no growth rates or diameters are sourced in this chapter. Method: <span class="hx-ref" data-pop="src:czochralski1918">{lab("czochralski1918")}</span>; LN growth 1965: <span class="hx-ref" data-pop="src:ballman1965">{lab("ballman1965")}</span>, <span class="hx-ref" data-pop="src:fedulov1965">{lab("fedulov1965")}</span>.</div>
    </div>
  </div>
</div>

<div data-variant="visual" class="hx-vbo">
  {@render art("v")}
  <div class="hx-vbo-c">
    <div class="v-ctl" style="--w:6ch"><label for="vbo-r">Pull rate (display)</label><output>{String(rate).padStart(2, " ")}/10</output><input id="vbo-r" class="v-range" type="range" min="1" max="10" step="1" bind:value={rate}></div>
    <div class="v-seg" role="group" aria-label="Seed rotation"><button type="button" class:on={rot} onclick={() => (rot = true)}>Rotate seed</button><button type="button" class:on={!rot} onclick={() => (rot = false)}>Still</button></div>
    <div class="v-seg"><button type="button" onclick={pull}>Dip the seed and pull</button></div>
    <p class="v-cap">An illustration with no data: growth rates and diameters are not sourced in this chapter. Method: <span class="hx-ref" data-pop="src:czochralski1918">{lab("czochralski1918")}</span>; LN growth 1965: <span class="hx-ref" data-pop="src:ballman1965">{lab("ballman1965")}</span>, <span class="hx-ref" data-pop="src:fedulov1965">{lab("fedulov1965")}</span>.</p>
  </div>
</div>
