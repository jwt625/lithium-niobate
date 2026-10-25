<!-- F8.11 Niobium per wafer. m_LN = rho pi (D/2)^2 t; m_Nb = m_LN w_Nb; total = N m_Nb (loss); share = total / world mine
     production. TECH: mono form, four fixed readouts. VISUAL: wafer to scale (300 mm box) and Nb-per-year against world
     output on one log mass axis. Shared state; every output is an estimate (E). -->
<script lang="ts">
  import G from "./G.svelte";
  import Badge from "$lib/components/Badge.svelte";
  import { waferMass } from "$lib/physics/fab.ts";
  import { DENSITY_KUSHIBIKI1999 } from "$lib/physics/constants.ts";
  import { pad } from "$lib/figures/fmt";

  const WORLD_T = 112000; // t Nb, 2025e, usgs2026nb (F)
  const SIZES: [number, string][] = [[76.2, '3"'], [100, '4"'], [150, '6"'], [200, '8"'], [300, '12"']];
  let D = $state(150), t = $state(0.5), lgN = $state(Math.log10(2.1e6)), loss = $state(1);
  const N = $derived(10 ** lgN);
  const m = $derived(waferMass(D, t, DENSITY_KUSHIBIKI1999.value));
  const total = $derived((N * m.Nb_g * loss) / 1e6);
  const share = $derived(total / WORLD_T);
  const f = (v: number, w: number, d: number): string => pad(v.toFixed(d), w);
  const nTxt = $derived(N >= 1e6 ? `${(N / 1e6).toFixed(2)} M` : `${(N / 1e3).toFixed(1)} k`);
  // VISUAL log axis 0.1 t .. 1e6 t over 0..1
  const lx = (v: number): number => Math.max(0, Math.min(1, (Math.log10(Math.max(v, 0.1)) + 1) / 7));
</script>

<div class="panel i8-nb" data-variant="tech">
  <div class="ph"><span>Nb in LN wafers: m = &rho; &pi;(D/2)<sup>2</sup> t &middot; w<sub>Nb</sub></span><span><G g="E" r="i8-nbwafer" /></span></div>
  <div class="ctl"><span class="k">Diameter D</span><div class="seg" role="group" aria-label="Wafer diameter">{#each SIZES as [d, l] (l)}<button type="button" class:on={D === d} onclick={() => (D = d)}>{l}</button>{/each}</div><output>{f(D, 5, 1)} mm</output></div>
  <div class="ctl"><label for="nb-t">Thickness t</label><input id="nb-t" type="range" min="0.25" max="1" step="0.05" bind:value={t}><output>{t.toFixed(2)} mm</output></div>
  <div class="ctl"><label for="nb-n">Wafers per year N</label><input id="nb-n" type="range" min="3" max="7" step="any" bind:value={lgN} aria-valuetext="{nTxt} wafers per year"><output>{pad(nTxt, 8)}</output></div>
  <div class="ctl"><label for="nb-l">Loss factor</label><input id="nb-l" type="range" min="1" max="5" step="0.1" bind:value={loss}><output>{loss.toFixed(1)} &times;</output></div>
  <div class="ctl"><span class="k">Preset</span><div class="seg" role="group" aria-label="Preset"><button type="button" class:on={D === 150 && Math.abs(lgN - Math.log10(2.1e6)) < 1e-9} onclick={() => { D = 150; lgN = Math.log10(2.1e6); }}>TDG 2029 plan scale</button></div><output><G g="V" r="r:tdg2026ir" /></output></div>
  <table class="kv i8-nbkv"><colgroup><col><col class="cv"><col class="cu"></colgroup><tbody>
    <tr><td>m<sub>LN</sub> per wafer</td><td class="v">{f(m.LN_g, 7, 1)}</td><td class="u">g</td></tr>
    <tr><td>m<sub>Nb</sub> per wafer</td><td class="v">{f(m.Nb_g, 7, 1)}</td><td class="u">g</td></tr>
    <tr><td>Nb per year, N &times; m<sub>Nb</sub> &times; loss</td><td class="v">{f(total, 9, 1)}</td><td class="u">t/yr</td></tr>
    <tr><td>share of world mine output (112,000 t, 2025e)</td><td class="v">{f(share * 100, 8, 4)}</td><td class="u">%</td></tr>
  </tbody></table>
  <div class="pf">&rho; 4,642.8 kg/m<sup>3</sup> <Badge code="P" pop="r:kushibiki1999" /> &middot; w<sub>Nb</sub> = 92.906 / 147.843 from standard atomic weights &middot; world output <G g="F" r="r:usgs2026nb" /> &middot; t default 0.5 mm, loss 1 to 5 (boule and kerf): <Badge code="template" pop="i8-tpl" /> &middot; preset 2.1 M 6-inch-equivalent wafers per year is TDG Holding's 2029 plan size, mixing LT and LN, treated as all LN (upper bound). Flats ignored.</div>
</div>

<div class="i8-nbv" data-variant="visual">
  <div class="i8-nbv-art">
    <svg viewBox="0 0 320 320" role="img" aria-label="Wafer of the chosen diameter drawn to scale in a 300 mm frame">
      <rect x="10" y="10" width="300" height="300" class="fr" />
      {#each SIZES as [d] (d)}<circle cx="160" cy="160" r={d / 2} class="ring" />{/each}
      <circle cx="160" cy="160" r={D / 2} class="wf" />
      <text x="160" y={160 - D / 2 - 6} text-anchor="middle">{D} mm</text>
      <text x="306" y="304" text-anchor="end" class="sm">frame 300 mm</text>
    </svg>
  </div>
  <div class="i8-nbv-side">
    <div class="v-ctl"><span class="v-lab">Wafer diameter</span><div class="v-seg" role="group" aria-label="Wafer diameter">{#each SIZES as [d, l] (l)}<button type="button" class:on={D === d} onclick={() => (D = d)}>{l}</button>{/each}</div></div>
    <div class="v-ctl" style="--w:9ch"><label for="nbv-t">Thickness</label><output>{t.toFixed(2)} mm</output><input id="nbv-t" class="v-range" type="range" min="0.25" max="1" step="0.05" bind:value={t}></div>
    <div class="v-ctl" style="--w:11ch"><label for="nbv-n">Wafers per year</label><output>{pad(nTxt, 8)}</output><input id="nbv-n" class="v-range" type="range" min="3" max="7" step="any" bind:value={lgN} aria-valuetext="{nTxt} wafers per year"></div>
    <div class="v-ctl" style="--w:6ch"><label for="nbv-l">Boule and kerf loss</label><output>{loss.toFixed(1)}&times;</output><input id="nbv-l" class="v-range" type="range" min="1" max="5" step="0.1" bind:value={loss}></div>
    <div class="i8-logbar" aria-label="Niobium per year against world mine output, log scale">
      <svg viewBox="0 0 400 96" preserveAspectRatio="none" role="img">
        {#each [0.1, 1, 10, 100, 1000, 1e4, 1e5, 1e6] as v (v)}<line x1={lx(v) * 400} x2={lx(v) * 400} y1="0" y2="70" class="gl" />{/each}
        <rect x="0" y="8" width={lx(total) * 400} height="22" class="need" />
        <rect x="0" y="40" width={lx(WORLD_T) * 400} height="22" class="world" />
      </svg>
      <div class="i8-logticks">{#each ["0.1 t", "1", "10", "100", "1 kt", "10 kt", "100 kt", "1 Mt"] as l, i (l)}<span style="left:{(i / 7) * 100}%">{l}</span>{/each}</div>
    </div>
    <dl class="v-hud">
      <dt>LN per wafer</dt><dd>{f(m.LN_g, 7, 1)} g</dd>
      <dt>Nb per wafer</dt><dd>{f(m.Nb_g, 7, 1)} g</dd>
      <dt>Nb per year (upper bar)</dt><dd>{f(total, 9, 1)} t</dd>
      <dt>Share of world output (lower bar)</dt><dd>{f(share * 100, 8, 4)} %</dd>
    </dl>
    <p class="v-cap">Estimate <G g="E" r="i8-nbwafer" />: density 4,642.8 kg/m<sup>3</sup> <Badge code="P" pop="r:kushibiki1999" />; Nb mass fraction 92.906 / 147.843 from standard atomic weights; world mine output 112,000 t Nb (2025e) <G g="F" r="r:usgs2026nb" />. Thickness default 0.5 mm and loss factor 1 to 5 (boule and kerf) are display parameters <Badge code="template" pop="i8-tpl" />. 2.1 M 6-inch-equivalent wafers per year is the size of TDG Holding's 2029 plan <G g="V" r="r:tdg2026ir" />, LT and LN mixed, treated as all LN (upper bound). Flats ignored. Log mass axis.</p>
  </div>
</div>

<style>
  .i8-nb .seg button { padding: 3px 7px; }
  .i8-nb .ctl output { white-space: pre; }
  .i8-nbkv col.cv { width: 112px; } .i8-nbkv col.cu { width: 52px; }
  .i8-nbv { display: grid; grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr); gap: 48px; align-items: start; }
  .i8-nbv-art svg { width: 100%; max-width: 440px; display: block; }
  .fr { fill: none; stroke: var(--v-line); stroke-dasharray: 3 4; }
  .ring { fill: none; stroke: var(--v-line2); stroke-width: 0.8; }
  .wf { fill: color-mix(in srgb, var(--v-ln) 16%, transparent); stroke: var(--v-ln); stroke-width: 1.6; transition: r 240ms var(--v-ease); }
  .i8-nbv-art text { font: 500 12px var(--v-ui); fill: var(--v-text2); }
  .i8-nbv-art text.sm { font-size: 10px; fill: var(--v-text3); }
  .i8-nbv-side { display: grid; gap: 18px; }
  .i8-nbv-side .v-seg { flex-wrap: wrap; }
  .i8-logbar svg { width: 100%; height: 96px; display: block; }
  .i8-logbar .gl { stroke: var(--v-line); }
  .i8-logbar .need { fill: color-mix(in srgb, var(--nb) 60%, transparent); stroke: var(--nb); }
  .i8-logbar .world { fill: none; stroke: var(--v-text2); stroke-dasharray: 4 3; }
  .i8-logticks { position: relative; height: 18px; font: 500 11px/18px var(--v-ui); color: var(--v-text3); }
  .i8-logticks span { position: absolute; transform: translateX(-50%); white-space: nowrap; }
  .i8-logticks span:first-child { transform: none; } .i8-logticks span:last-child { transform: translateX(-100%); }
  @media (max-width: 900px) { .i8-nbv { grid-template-columns: minmax(0, 1fr); gap: 24px; } }
</style>
