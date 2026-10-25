<!-- F7.6 The stripes (hero story H4; figures.md F7.6). Year scrubber over the H4 table (1962-2019); the domain strip
     changes with the stage. Live phasor sum of the second-harmonic field per coherence length (qpm.ts), with or without
     flipped stripes, and SH power versus crystal length (N^2 with QPM, bounded without; log toggle). First-order period
     from the Zelmon 1997 congruent-LN Sellmeier equation at 21 C (derived). -->
<script lang="ts">
  import { lab } from "../labels";
  import { phasorPath } from "../qpm";
  import { qpmPeriodSHG } from "$lib/figures/optics";
  import { HSTATUS } from "../status";

  const ROWS: { y: number; step: string; num: string; src: string; stage: "schem" | "growth" | "wg" | "fiber" | "poled" | "quasi" | "ridge" | "nano" | "ring" }[] = [
    { y: 1962, step: "Periodic reversal proposed", num: "", src: "armstrong1962", stage: "schem" },
    { y: 1980, step: "Czochralski-grown periodic laminar domains, half-period near l_c", num: "QPM for d33 approximately realized", src: "feng1980", stage: "growth" },
    { y: 1983, step: "Order-of-magnitude enhancement", num: "SH power proportional to N^2, N up to 200", src: "xue1983", stage: "growth" },
    { y: 1989, step: "Planar periodically poled waveguide, 532 nm", num: "5%/W cm^2, CW, room temperature", src: "lim1989a", stage: "wg" },
    { y: 1990, step: "Laser-heated pedestal growth, 1 um domains", num: "407 nm, > 230 domains effective", src: "magel1990", stage: "fiber" },
    { y: 1992, step: "Tuning and tolerances", num: "", src: "fejer1992", stage: "fiber" },
    { y: 1993, step: "Field poling at room temperature", num: "20.7 mW blue; 600%/W cm^2", src: "yamada1993", stage: "poled" },
    { y: 1995, step: "Bulk PPLN OPO", num: "Lambda = 31 um", src: "myers1995a", stage: "poled" },
    { y: 1997, step: "Quasi-periodic superlattice THG (LiTaO3)", num: "", src: "zhu1997", stage: "quasi" },
    { y: 2003, step: "Direct-bonded QPM ridge", num: "44%/W", src: "nishida2003", stage: "ridge" },
    { y: 2018, step: "Nanophotonic PPLN", num: "Lambda = 4 um, 2600%/W cm^2", src: "wang2018c", stage: "nano" },
    { y: 2019, step: "PP-TFLN microring", num: "250,000%/W", src: "lu2019", stage: "ring" },
  ];
  let ri = $state(6), flip = $state(true), lam = $state(1.064), N = $state(12), logY = $state(true);
  const row = $derived(ROWS[ri]);
  const L = $derived(qpmPeriodSHG(lam));
  const nt = (s: string): string => s.replace(/l_c/g, "l<sub>c</sub>").replace(/d33/, "d<sub>33</sub>").replace(/\^2/g, "<sup>2</sup>").replace(/Lambda/g, "&Lambda;").replace(/\bum\b/g, "&micro;m").replace(/LiTaO3/, "LiTaO<sub>3</sub>");

  // strip: 16 coherence lengths across 640 units
  const NS = 16, SW = 640;
  const fib = (() => { let a = "A", b = "AB"; while (b.length < 24) { const t = b; b = b + a; a = t; } return b; })(); // Fibonacci word
  const blocks = $derived.by(() => {
    const out: { x: number; w: number; up: boolean }[] = [];
    if (row.stage === "quasi") { let x = 0, k = 0; for (const ch of fib) { const w = ch === "A" ? 40 : 40 / 1.618; out.push({ x, w, up: k % 2 === 0 }); x += w; k++; if (x > SW) break; } return out; }
    for (let k = 0; k < NS; k++) out.push({ x: (k * SW) / NS, w: SW / NS, up: !flip || k % 2 === 0 });
    return out;
  });
  const wavy = (x: number): string => { let d = `M${x} 0`; for (let y = 0; y <= 60; y += 6) d += `L${(x + 2.2 * Math.sin(y / 9 + x / 30)).toFixed(1)} ${y}`; return d; };

  // phasor
  const ph = $derived(phasorPath(N, flip, 24));
  const amax = $derived(flip ? 2 * N : 2);
  const P = $derived.by(() => {
    const sc = 120 / Math.max(2, amax);
    let d = "";
    for (let k = 0; k < ph.re.length; k++) d += `${k ? "L" : "M"}${(150 + (ph.re[k] - (flip ? 0.5 : 0)) * sc).toFixed(1)} ${(140 - ph.im[k] * sc + (flip ? 0 : 0)).toFixed(1)}`;
    return d;
  });
  const A2 = $derived(ph.re[ph.re.length - 1] ** 2 + ph.im[ph.im.length - 1] ** 2);
  // power vs length (0-24 l_c), normalized to the power after one coherence length
  const PW = $derived.by(() => {
    const full = phasorPath(24, true, 12), none = phasorPath(24, false, 12);
    const X = (z: number): number => 40 + (z / 24) * 260;
    const Y = (p: number): number => logY ? 150 - ((Math.log10(Math.max(1e-2, p)) + 2) / 5) * 140 : 150 - (p / 576) * 140;
    const path = (a: { re: Float64Array; im: Float64Array }): string => { let d = ""; for (let k = 1; k < a.re.length; k++) d += `${k > 1 ? "L" : "M"}${X(k / 12).toFixed(1)} ${Y((a.re[k] ** 2 + a.im[k] ** 2) / 4).toFixed(1)}`; return d; };
    return { q: path(full), n: path(none), x: X(N), yq: Y(N * N), yn: Y(Math.sin((Math.PI * N) / 2) ** 2), ticks: logY ? [0.01, 0.1, 1, 10, 100, 1000].map((v) => ({ v, y: Y(v) })) : [0, 100, 200, 300, 400, 500].map((v) => ({ v, y: Y(v) })) };
  });
  const fmtP = (v: number): string => v.toFixed(v >= 100 ? 0 : v >= 10 ? 1 : 2).padStart(6, " ");
</script>

{#snippet strip(cls: string)}
  <svg class="hx-st-strip {cls}" viewBox="0 -24 {SW} 96" role="img" aria-label="Domain strip, stage {row.y}">
    {#each blocks as b, k (k)}
      <rect class={b.up ? "up" : "dn"} x={b.x} y="0" width={b.w} height="60" class:sch={row.stage === "schem"}/>
      {#if cls === "v"}<path class="ps" d={b.up ? `M${b.x + b.w / 2} 46 V14 m-5 8 l5 -8 l5 8` : `M${b.x + b.w / 2} 14 V46 m-5 -8 l5 8 l5 -8`}/>{/if}
      {#if row.stage === "growth" && k > 0}<path class="wall" d={wavy(b.x)}/>{/if}
    {/each}
    {#if row.stage === "poled"}{#each blocks as b, k (k)}{#if k % 2 === 0}<rect class="el" x={b.x + 2} y="-14" width={b.w - 4} height="8"/>{/if}{/each}<rect class="el" x="0" y="-22" width={SW} height="6"/>{/if}
    {#if row.stage === "wg" || row.stage === "ridge" || row.stage === "nano"}<rect class="wg" x="0" y={row.stage === "nano" ? 24 : 18} width={SW} height={row.stage === "nano" ? 12 : 24}/>{/if}
    {#if row.stage === "fiber"}<path class="wg" d="M0 4 H{SW} M0 56 H{SW}"/>{/if}
    {#if row.stage === "ring"}<circle class="wg" cx="320" cy="30" r="26"/>{/if}
    <rect class="fr" x="0" y="0" width={SW} height="60" class:sch={row.stage === "schem"}/>
  </svg>
{/snippet}
{#snippet phasor(cls: string)}
  <svg class="hx-st-ph {cls}" viewBox="0 0 300 160" role="img" aria-label="Phasor sum of the second-harmonic field">
    <line class="ax" x1="10" y1="140" x2="290" y2="140"/><line class="ax" x1="150" y1="10" x2="150" y2="150"/>
    <path class="pp" d={P}/>
    <text class="tk" x="292" y="154" text-anchor="end">Re A</text><text class="tk" x="156" y="18">Im A</text>
  </svg>
{/snippet}
{#snippet power(cls: string)}
  <svg class="hx-st-pw {cls}" viewBox="0 0 320 180" role="img" aria-label="Second-harmonic power versus crystal length">
    {#each PW.ticks as t (t.v)}<line class="gl" x1="40" x2="300" y1={t.y} y2={t.y}/><text class="tk" x="36" y={t.y + 3} text-anchor="end">{t.v}</text>{/each}
    <path class="cq" d={PW.q}/><path class="cn" d={PW.n}/>
    <line class="kn" x1={PW.x} x2={PW.x} y1="10" y2="150"/>
    <text class="tk" x="300" y="170" text-anchor="end">length / l_c</text><text class="tk" x="40" y="170">0</text><text class="tk" x="300" y="160" text-anchor="end">24</text>
  </svg>
{/snippet}

<div data-variant="tech" class="panel hx-st">
  <div class="ph"><span>Domains, {row.y}: {@html nt(row.step)}</span><span class="seg" role="group" aria-label="Fundamental wavelength"><button type="button" class:on={lam === 1.064} onclick={() => (lam = 1.064)}>1064 nm</button><button type="button" class:on={lam === 1.55} onclick={() => (lam = 1.55)}>1550 nm</button></span></div>
  <div class="ctl"><label for="st-y">Year</label><input id="st-y" type="range" min="0" max={ROWS.length - 1} step="1" bind:value={ri}><output>{row.y}</output></div>
  {@render strip("t")}
  <pre class="hx-st-ascii">{blocks.slice(0, 16).map((b) => (b.up ? "+" : "-").repeat(Math.max(1, Math.round(b.w / 10)))).join("|")}</pre>
  <div class="hx-st-g">
    <div>{@render phasor("t")}</div>
    <div>{@render power("t")}</div>
  </div>
  <div class="ctl"><label for="st-n">Length N l<sub>c</sub></label><input id="st-n" type="range" min="1" max="24" step="1" bind:value={N}><output>{String(N).padStart(2, " ")} l<sub>c</sub></output></div>
  <div class="ctl"><span class="k">Stripes</span><span class="seg" role="group" aria-label="Domain reversal"><button type="button" class:on={flip} onclick={() => (flip = true)}>FLIPPED (QPM)</button><button type="button" class:on={!flip} onclick={() => (flip = false)}>UNIFORM</button></span><span class="seg" role="group" aria-label="Power axis"><button type="button" class:on={logY} onclick={() => (logY = true)}>LOG</button><button type="button" class:on={!logY} onclick={() => (logY = false)}>LIN</button></span></div>
  <table class="kv"><colgroup><col><col class="cv"></colgroup><tbody>
    <tr><td>First-order period &Lambda; = 2 l<sub>c</sub> <span class="b hd" data-pop="hst:derived">derived</span></td><td class="v">{L.toFixed(3)} &micro;m</td></tr>
    <tr><td>SH power after N l<sub>c</sub> / after 1 l<sub>c</sub></td><td class="v">{fmtP(A2 / 4)}</td></tr>
    <tr><td>Row</td><td class="v"><span class="hx-stack hx-st-src">{#each ROWS as r, k (k)}<span class:hid={k !== ri}><span class="hx-ref" data-pop="src:{r.src}">{lab(r.src)}</span> <span class="b {HSTATUS.V.cls}" data-pop="hst:V">V</span></span>{/each}</span></td></tr>
  </tbody></table>
  <div class="pf"><div class="hx-stack">{#each ROWS as r, k (k)}<span class:hid={k !== ri}>{@html nt(r.num) || "&nbsp;"}</span>{/each}</div>Undepleted pump, ideal 50% duty cycle; stage drawings are schematic. &Lambda;: Zelmon 1997 congruent LN, 21 &deg;C <span class="hx-ref" data-pop="src:zelmon1997">{lab("zelmon1997")}</span>.</div>
</div>

<div data-variant="visual" class="hx-vst2">
  <div class="hx-vst2-y">
    <div class="hx-vst2-yr">{row.y}</div>
    <div class="hx-vst2-t hx-stack">{#each ROWS as r, k (k)}<div class:hid={k !== ri}><p>{@html nt(r.step)}</p><p class="hx-vst2-n">{@html nt(r.num) || "&nbsp;"} <span class="hx-ref" data-pop="src:{r.src}">{lab(r.src)}</span></p></div>{/each}</div>
  </div>
  <input class="v-range hx-vst2-r" type="range" min="0" max={ROWS.length - 1} step="1" bind:value={ri} aria-label="Year" aria-valuetext={String(row.y)}>
  <div class="hx-vst2-ticks">{#each ROWS as r, k (k)}<button type="button" class:on={k === ri} onclick={() => (ri = k)}>{r.y}</button>{/each}</div>
  {@render strip("v")}
  <div class="hx-vst2-g">
    <figure>{@render phasor("v")}<figcaption>Second-harmonic field, summed per coherence length</figcaption></figure>
    <figure>{@render power("v")}<figcaption>Power versus length: N<sup>2</sup> flipped, bounded uniform</figcaption></figure>
    <div class="hx-vst2-c">
      <div class="v-seg" role="group" aria-label="Domain reversal"><button type="button" class:on={flip} onclick={() => (flip = true)}>Flip the stripes</button><button type="button" class:on={!flip} onclick={() => (flip = false)}>Uniform</button></div>
      <div class="v-ctl" style="--w:6ch"><label for="vst-n">Crystal length</label><output>{String(N).padStart(2, " ")} l<sub>c</sub></output><input id="vst-n" class="v-range" type="range" min="1" max="24" step="1" bind:value={N}></div>
      <div class="v-seg" role="group" aria-label="Fundamental"><button type="button" class:on={lam === 1.064} onclick={() => (lam = 1.064)}>1064 nm</button><button type="button" class:on={lam === 1.55} onclick={() => (lam = 1.55)}>1550 nm</button></div>
      <div class="v-seg" role="group" aria-label="Power axis"><button type="button" class:on={logY} onclick={() => (logY = true)}>Log</button><button type="button" class:on={!logY} onclick={() => (logY = false)}>Linear</button></div>
      <dl class="v-hud"><dt>Period &Lambda; (derived)</dt><dd>{L.toFixed(3)} &micro;m</dd><dt>SH power / 1 l<sub>c</sub></dt><dd>{fmtP(A2 / 4)}</dd></dl>
    </div>
  </div>
  <p class="v-cap">Undepleted pump, ideal 50% duty cycle; stage drawings are schematic. Period: Zelmon 1997 congruent LN, 21 &deg;C <span class="hx-ref" data-pop="src:zelmon1997">{lab("zelmon1997")}</span>.</p>
</div>
