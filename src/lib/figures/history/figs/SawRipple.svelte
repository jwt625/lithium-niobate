<!-- F7.4 SAW ripple (figures.md F7.4): an IDT on a 128 deg Y-X LN plate; the finger period sets the synchronous
     frequency f0 = v / p. v: free-surface Rayleigh velocity 3978.4 m/s computed in chapter 03 from the kushibiki1999
     constants (derived). Quartz: no velocity held, so f0 shows N/A (the 1965 White and Voltmer device was on quartz). -->
<script lang="ts">
  import { lab } from "../labels";
  import { onMount } from "svelte";
  const V = 3978.4; // m/s, chapter 03 calculation (derived)
  let p = $state(4), sub = $state<"LN" | "quartz">("LN"), ph = $state(0);
  const f0 = $derived(sub === "LN" ? V / (p * 1e-6) : NaN);
  const fTxt = $derived((Number.isFinite(f0) ? (f0 >= 1e9 ? `${(f0 / 1e9).toFixed(3)} GHz` : `${(f0 / 1e6).toFixed(1)} MHz`) : "N/A").padStart(9, " "));
  const K = 600 / 200; // px per um: the plate drawing spans 200 um
  const fingers = $derived(Array.from({ length: 10 }, (_, k) => 40 + k * (p * K) / 2).filter((x) => x < 200));
  const waves = $derived(Array.from({ length: 80 }, (_, k) => 210 + (k + ph) * p * K).filter((x) => x < 600));
  onMount(() => {
    let raf = 0, last = performance.now();
    const go = (now: number): void => { if (document.documentElement.dataset.fx === "on" && sub === "LN") ph = (ph + ((now - last) / 1000) * 0.6) % 1; last = now; raf = requestAnimationFrame(go); };
    raf = requestAnimationFrame(go);
    return () => cancelAnimationFrame(raf);
  });
</script>

{#snippet art(cls: string)}
  <svg class="hx-saw {cls}" viewBox="0 0 600 170" role="img" aria-label="Interdigital transducer launching a surface wave">
    <rect class="pl" x="0" y="20" width="600" height="130"/>
    <rect class="bus" x="30" y="28" width="{Math.min(170, fingers[fingers.length - 1] - 30 + 6)}" height="8"/><rect class="bus" x="30" y="134" width="{Math.min(170, fingers[fingers.length - 1] - 30 + 6)}" height="8"/>
    {#each fingers as x, k (k)}<rect class="fg" x={x} y={k % 2 ? 36 : 46} width={Math.max(0.8, (p * K) / 4)} height="88"/>{/each}
    {#if sub === "LN"}{#each waves as x, k (k)}<line class="wv" x1={x} x2={x} y1="40" y2="130" opacity={Math.max(0.15, 1 - (x - 210) / 500).toFixed(2)}/>{/each}{:else}<text class="nd" x="400" y="90" text-anchor="middle">no velocity data</text>{/if}
    <line class="sc" x1="420" x2={420 + 50 * K} y1="160" y2="160"/><text class="lbs" x="420" y="155">50 &micro;m</text>
    <text class="lbs" x="590" y="14" text-anchor="end">{sub === "LN" ? "128° Y-X LiNbO₃, X →" : "quartz"}</text>
  </svg>
{/snippet}

<div data-variant="tech" class="panel hx-sawp">
  <div class="ph"><span>IDT, f<sub>0</sub> = v / p</span><span class="seg" role="group" aria-label="Substrate"><button type="button" class:on={sub === "LN"} onclick={() => (sub = "LN")}>128 Y-X LN</button><button type="button" class:on={sub === "quartz"} onclick={() => (sub = "quartz")}>QUARTZ</button></span></div>
  {@render art("t")}
  <div class="ctl"><label for="saw-p">Finger period p</label><input id="saw-p" type="range" min="1" max="40" step="0.1" bind:value={p}><output>{p.toFixed(1)} &micro;m</output></div>
  <table class="kv"><colgroup><col><col class="cv"></colgroup><tbody>
    <tr><td>v<sub>SAW</sub>, free surface</td><td class="v">{sub === "LN" ? "3978.4 m/s" : "N/A"}</td></tr>
    <tr><td>f<sub>0</sub> = v / p <span class="b hd" data-pop="hst:derived">derived</span></td><td class="v">{fTxt}</td></tr>
  </tbody></table>
  <div class="pf">v: Rayleigh root for 128&deg; Y-X computed in chapter 03 from the elastic, piezoelectric and dielectric constants of <span class="hx-ref" data-pop="src:kushibiki1999">{lab("kushibiki1999")}</span> (derived; K<sup>2</sup> 5.41%). Drawing: 200 &micro;m across. No quartz velocity is held, so its frequency shows N/A. The 1965 IDT ran at 15 and 45 Mc on quartz <span class="hx-ref" data-pop="src:whitevoltmer1965preprint">{lab("whitevoltmer1965preprint")}</span>.</div>
</div>

<div data-variant="visual" class="hx-vsaw">
  <div class="v-seg" role="group" aria-label="Substrate"><button type="button" class:on={sub === "LN"} onclick={() => (sub = "LN")}>128&deg; Y-X lithium niobate</button><button type="button" class:on={sub === "quartz"} onclick={() => (sub = "quartz")}>Quartz (1965)</button></div>
  {@render art("v")}
  <div class="hx-vsaw-g">
    <div class="v-ctl" style="--w:8ch"><label for="vsaw-p">Finger period</label><output>{p.toFixed(1)} &micro;m</output><input id="vsaw-p" class="v-range" type="range" min="1" max="40" step="0.1" bind:value={p}></div>
    <dl class="v-hud"><dt>Surface-wave velocity</dt><dd>{sub === "LN" ? "3978.4 m/s" : "N/A"}</dd><dt>Center frequency f&#8320; = v/p</dt><dd>{fTxt}</dd></dl>
  </div>
  <p class="v-cap">Velocity computed in chapter 03 from <span class="hx-ref" data-pop="src:kushibiki1999">{lab("kushibiki1999")}</span> constants (derived; K<sup>2</sup> 5.41%). Drawing: 200 &micro;m across. No quartz velocity is held, so its frequency shows N/A. The 1965 IDT ran at 15 and 45 Mc on quartz <span class="hx-ref" data-pop="src:whitevoltmer1965preprint">{lab("whitevoltmer1965preprint")}</span>.</p>
</div>
