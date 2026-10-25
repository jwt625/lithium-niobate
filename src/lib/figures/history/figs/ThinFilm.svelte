<!-- F7.5b What "thin film" meant: 1973 vs 2018 (hero story H3; figures.md F7.5b). Two cross-sections at one scale and
     one origin (the guide's surface center); the field-of-view slider zooms both from 50 um to 1 um. Sourced sizes: the
     12 um effective thickness of the out-diffused single-mode guide (carruthers1974) and the 680 nm film (rabiei2004).
     Index profile shape, rib width, etch depth, oxide thickness, electrode gap and mode outlines are schematic. -->
<script lang="ts">
  import { lab } from "../labels";
  let zi = $state(100); // zoom index: field of view = 50^(zi / 100) um, 1 to 50 um
  const fov = $derived(50 ** (zi / 100));
  const W = 400, H = 280, OX = 200, OY = 96;
  const s = $derived(W / fov); // px per um
  const bar = $derived.by(() => { const t = fov / 4, e = 10 ** Math.floor(Math.log10(t)), m = t / e; const n = m >= 5 ? 5 : m >= 2 ? 2 : 1; return n * e; });
  const fmtU = (v: number): string => (v >= 1 ? `${v} µm` : `${Math.round(v * 1000)} nm`);
  const fovTxt = $derived((fov >= 10 ? fov.toFixed(0) : fov.toFixed(1)).padStart(4, " ") + " µm");
  // 2018 schematic geometry (um)
  const T = 0.68, RIB = 0.75, SLAB = 0.33, OXD = 2, GAP = 2.5, EW = 12, ET = 0.6;
</script>

{#snippet cross(k: string, which: "1973" | "2018")}
  <svg class="hx-tf-svg" viewBox="0 0 {W} {H}" role="img" aria-label={which === "1973" ? "1973: out-diffused graded skin in bulk LN" : "2018: thin LN film rib on silicon dioxide on silicon"}>
    <defs>
      <clipPath id="tfc-{k}-{which}"><rect x="0" y="0" width={W} height={H}/></clipPath>
      <linearGradient id="tfg-{k}" x1="0" y1={OY} x2="0" y2={OY + 30 * s} gradientUnits="userSpaceOnUse"><stop offset="0" class="g0"/><stop offset="1" class="g1"/></linearGradient>
    </defs>
    <g clip-path="url(#tfc-{k}-{which})">
      <rect class="air" x="0" y="0" width={W} height={H}/>
      {#if which === "1973"}
        <rect class="ln" x="0" y={OY} width={W} height={H}/>
        <rect x="0" y={OY} width={W} height={30 * s} fill="url(#tfg-{k})"/>
        <line class="mode" x1="0" x2={W} y1={OY + 12 * s} y2={OY + 12 * s}/>
        <line class="surf" x1="0" x2={W} y1={OY} y2={OY}/>
      {:else}
        <rect class="si" x="0" y={OY + (T + OXD) * s} width={W} height={H}/>
        <rect class="ox" x="0" y={OY + T * s} width={W} height={OXD * s}/>
        <rect class="ln" x="0" y={OY + SLAB * s} width={W} height={(T - SLAB) * s}/>
        <path class="ln" d="M{OX - (RIB + 0.15) * s} {OY + SLAB * s} L{OX - RIB * s} {OY} H{OX + RIB * s} L{OX + (RIB + 0.15) * s} {OY + SLAB * s} Z"/>
        <rect class="au" x={OX + GAP * s} y={OY + SLAB * s - ET * s} width={EW * s} height={ET * s}/>
        <rect class="au" x={OX - (GAP + EW) * s} y={OY + SLAB * s - ET * s} width={EW * s} height={ET * s}/>
        <ellipse class="mode" cx={OX} cy={OY + 0.4 * s} rx={0.62 * s} ry={0.34 * s}/>
        <ellipse class="mode m2" cx={OX} cy={OY + 0.4 * s} rx={0.95 * s} ry={0.52 * s}/>
      {/if}
      <circle class="org" cx={OX} cy={OY} r="2.5"/>
    </g>
    <line class="bar" x1="16" x2={16 + bar * s} y1={H - 18} y2={H - 18}/><text class="bt" x="16" y={H - 26}>{fmtU(bar)}</text>
    <text class="yr" x={W - 12} y="22" text-anchor="end">{which}</text>
  </svg>
{/snippet}

<div data-variant="tech" class="panel hx-tf">
  <div class="ph"><span>Cross-sections, same scale and origin</span><span>field of view {fovTxt}</span></div>
  <div class="hx-tf-g">{@render cross("t", "1973")}{@render cross("t", "2018")}</div>
  <div class="ctl"><label for="tf-z">Field of view</label><input id="tf-z" type="range" min="0" max="100" step="1" bind:value={zi}><output>{fovTxt}</output></div>
  <table class="kv hx-tf-kv"><colgroup><col><col class="c18"><col class="c18"></colgroup>
    <tbody>
      <tr><td></td><td class="v">1973-1974</td><td class="v">2004-2018</td></tr>
      <tr><td>Guide</td><td class="v">12 &micro;m</td><td class="v">0.68 &micro;m</td></tr>
      <tr><td>V(&pi;)</td><td class="v">~24 V*</td><td class="v">1.4 V</td></tr>
      <tr><td>BW</td><td class="v">3.2 GHz</td><td class="v">N/A**</td></tr>
    </tbody>
  </table>
  <div class="pf">Guide: effective thickness of the single-mode out-diffused guide <span class="hx-ref" data-pop="src:carruthers1974">{lab("carruthers1974")}</span> <span class="b rec" data-pop="hst:V">rec</span>; film <span class="hx-ref" data-pop="src:rabiei2004">{lab("rabiei2004")}</span> <span class="b rec" data-pop="hst:V">rec</span>. V(&pi;), BW: <span class="hx-ref" data-pop="src:kaminow1973">{lab("kaminow1973")}</span> / <span class="hx-ref" data-pop="src:wang2018b">{lab("wang2018b")}</span> (20 mm). * &pi; / 0.13 rad/V <span class="b hd" data-pop="hst:derived">derived</span>, device length not in the abstract. ** bandwidth not reported in the text read. One device per value; not normalized for length. Profile, rib, oxide, electrodes and mode outlines: schematic.</div>
</div>

<div data-variant="visual" class="hx-vtf">
  <div class="hx-vtf-g">
    <figure><div class="hx-vtf-h"><b>1973</b> the crystal's own skin</div>{@render cross("v", "1973")}</figure>
    <figure><div class="hx-vtf-h"><b>2018</b> an ion-sliced film on SiO&#8322;</div>{@render cross("v", "2018")}</figure>
  </div>
  <div class="v-ctl hx-vtf-z" style="--w:7ch"><label for="vtf-z">Field of view, both drawings</label><output>{fovTxt}</output><input id="vtf-z" class="v-range" type="range" min="0" max="100" step="1" bind:value={zi}></div>
  <div class="hx-vtf-cards">
    <div><span>Guide thickness</span><b>12 &micro;m</b><b>0.68 &micro;m</b><small>about 18&times; <span class="b hd" data-pop="hst:derived">derived</span></small></div>
    <div><span>Voltage for &pi; phase</span><b>~24 V*</b><b>1.4 V</b><small>* derived from 0.13 rad/V, length not given</small></div>
    <div><span>Bandwidth</span><b>3.2 GHz</b><b>N/A**</b><small>** not reported in the text read</small></div>
  </div>
  <p class="v-cap">Sources: <span class="hx-ref" data-pop="src:carruthers1974">{lab("carruthers1974")}</span>, <span class="hx-ref" data-pop="src:rabiei2004">{lab("rabiei2004")}</span>, <span class="hx-ref" data-pop="src:kaminow1973">{lab("kaminow1973")}</span>, <span class="hx-ref" data-pop="src:wang2018b">{lab("wang2018b")}</span>. Index profile, rib, oxide, electrode gap and mode outlines (IR, <span class="ir">false color</span>) are schematic; the 12 &micro;m and 0.68 &micro;m are to scale. One device per value; not normalized for length.</p>
</div>
