<!-- F05-10 Periodic poling of a thin film. Field: build-time solution of the coplanar tooth/counter-electrode cross-section
     (poling-field.ts; derived, gap and cover template). Threshold rule: reversal where |E| > E_th; E_th default 21 kV/mm
     (bulk CLN, reported), marks at 28.2 kV/mm (thin film, quoted by chen2024materials, S) and 63 kV/mm (3 Ec). Domain
     width along Y: template kinetics (tooth half the period plus a lateral spread growing with E0/E_th); no LN thin-film
     nucleation or wall-velocity data are sourced. d_eff = (2/pi) d33 sin(pi D) x depth fraction, d33 legacy-scale. -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import type { PolingField } from "./poling-field";
  import { D_NLO_VOLK2008_LEGACY } from "$lib/physics/constants.ts";

  let { field }: { field: PolingField } = $props();
  const PER = [{ v: 4.38, l: "4.38 µm", pop: "src:chen" }, { v: 5.51, l: "5.51 µm", pop: "src:chen" }, { v: 0.747, l: "747 nm", pop: "src:nagy" }, { v: 0.6, l: "600 nm", pop: "src:zhao" }];
  let pi = $state(0);
  let E0 = $state(30); // nominal V/g, kV/mm
  let Eth = $state(21);
  const L = $derived(PER[pi].v);
  const mx = $derived(Math.max(...field.mag.flat()));
  const Epk = $derived(mx * E0);
  const mid = $derived(Math.floor(field.xs.length / 2));
  const depthFrac = $derived(field.mag.filter((row) => row[mid] * E0 > Eth).length / field.mag.length);
  const midRow = $derived(Math.floor(field.zs.length / 2));
  const reach = $derived.by(() => { const row = field.lat[midRow]; let n = 0; field.xs.forEach((x, i) => { if (Math.abs(x) <= field.gap_um / 2 && row[i] * E0 > Eth) n++; }); return n / field.xs.filter((x) => Math.abs(x) <= field.gap_um / 2).length; });
  const spread = $derived(E0 > Eth ? 0.15 * (E0 / Eth - 1) : 0); // um, template
  const width = $derived(E0 > Eth && reach > 0 ? L / 2 + 2 * spread : 0);
  const D = $derived(Math.min(1, width / L));
  const merged = $derived(width >= L);
  const d33 = D_NLO_VOLK2008_LEGACY.d33;
  const deff = $derived((2 / Math.PI) * d33 * Math.abs(Math.sin(Math.PI * D)) * depthFrac);
  const f = (v: number, w: number, d: number): string => v.toFixed(d).padStart(w, " ");
  const SH = " .:-=+*";
  const art = $derived(field.mag.map((row) => row.map((m) => (m * E0 > Eth ? "#" : SH[Math.min(6, Math.floor((m * E0 / Eth) * 6))])).join("")).join("\n"));
  const elec = $derived(field.xs.map((x) => (x < -field.gap_um / 2 ? "V" : x > field.gap_um / 2 ? "0" : " ")).join(""));
  // top view: 3 periods along Y (horizontal), gap along Z (vertical)
  const topArt = $derived.by(() => {
    const W = 48, H = 9, per = 3, rows: string[] = [];
    for (let r = 0; r < H; r++) {
      let s = "";
      for (let c = 0; c < W; c++) {
        const y = ((c + 0.5) / W) * per * L, ph = (y % L) / L;
        const tooth = ph >= 0.25 && ph < 0.75;
        if (r === 0) { s += tooth ? "A" : " "; continue; }
        if (r === H - 1) { s += "A"; continue; }
        const zf = (r - 0.5) / (H - 2);
        const half = width / L / 2;
        const inDom = merged || (Math.abs(ph - 0.5) <= half && zf <= reach);
        s += inDom ? "-" : "+";
      }
      rows.push(s);
    }
    return rows.join("\n");
  });
  const CW = 9, RH = 9;
</script>

{#snippet perSel(big: boolean)}
  <div class={big ? "v-seg" : "seg"} role="group" aria-label="Period">{#each PER as p, i (p.v)}<button type="button" class:on={pi === i} onclick={() => (pi = i)}>{p.l}</button>{/each}</div>
{/snippet}

<figure class="panel mk-fig" data-variant="tech">
  <div class="ph"><span>Periodic poling of x-cut thin film: field and threshold</span><span>gap {field.gap_um} µm (template), film {field.film_um} µm</span></div>
  <div class="mk-duo2">
    <div>
      <div class="mk-sub">cross-section along Z, film depth down; # |E| &gt; E_th, shading |E|/E_th</div>
      <pre class="mk-art" aria-label="ASCII field map in the film">{elec}
{art}</pre>
      <div class="mk-sub" style="border-top:1px solid var(--rule)">top view, 3 periods along Y: A comb and counter electrode, - reversed, + original</div>
      <pre class="mk-art" aria-label="ASCII top view of domains">{topArt}</pre>
    </div>
    <div>
      <div class="ctl"><label for="po-E">Nominal field V/g</label><input id="po-E" type="range" min="0" max="100" step="0.5" bind:value={E0}><output>{f(E0, 5, 1)} kV/mm</output></div>
      <div class="ctl"><label for="po-t">Threshold E_th</label><input id="po-t" type="range" min="5" max="70" step="0.1" bind:value={Eth}><output>{f(Eth, 5, 1)} kV/mm</output></div>
      <div class="ctl"><span class="k">Period</span>{@render perSel(false)}<output>{f(L, 5, 3)} µm</output></div>
      <table class="kv"><colgroup><col class="cn"><col><col class="cs"></colgroup><tbody>
        <tr><td>Λ</td><td class="v">{f(L, 5, 2)} µm</td><td class="s"><Badge code="reported" pop={PER[pi].pop} /></td></tr>
        <tr><td>E_peak in the film</td><td class="v">{f(Epk, 6, 1)} kV/mm</td><td class="s"><Badge code="derived" pop="src:field" /></td></tr>
        <tr><td>Depth fraction reversed (gap centre)</td><td class="v">{f(depthFrac, 4, 2)}</td><td class="s"><Badge code="derived" pop="src:field" /></td></tr>
        <tr><td>Reach across the gap</td><td class="v">{f(reach, 4, 2)}</td><td class="s"><Badge code="derived" pop="src:field" /></td></tr>
        <tr><td>Duty cycle D</td><td class="v">{f(D, 4, 2)}{merged ? " merged" : "       "}</td><td class="s"><Badge code="template" pop="src:kin" /></td></tr>
        <tr><td>d_eff (d33 {d33} pm/V, older-scale compilation)</td><td class="v">{f(deff, 5, 2)} pm/V</td><td class="s"><Badge code="template" pop="src:deff" /></td></tr>
      </tbody></table>
      <div class="mk-note">Marks: 21 kV/mm bulk CLN <Badge code="reported" pop="src:ec" />; 28.2 kV/mm thin film <Badge code="S" pop="src:chen-th" />; peak above 3 E<sub>c</sub> = 63 kV/mm in practice <Badge code="P" pop="src:chen" />.</div>
    </div>
  </div>
  <div class="pf">Field solved once per volt (finite volume, LN free permittivities, SiO<sub>2</sub> and Si template permittivities, air cover) and scaled by V/g. Domain growth kinetics are template; only the threshold rule and the field are physics here.</div>
</figure>

<figure class="mk-fig mk-vfig" data-variant="visual">
  <div class="mk-vf-grid">
    <div>
      <svg viewBox="0 0 {48 * CW} {16 * RH + 20}" role="img" aria-label="Field magnitude in the film between the electrodes">
        {#each field.xs as x, i (i)}{#if x < -field.gap_um / 2 || x > field.gap_um / 2}<rect x={i * CW} y="0" width={CW} height="12" class="au-f" />{/if}{/each}
        {#each field.mag as row, j (j)}{#each row as m, i (i)}<rect x={i * CW} y={16 + j * RH} width={CW + 0.3} height={RH + 0.3} style="fill: var(--v-l532); opacity: {Math.min(1, (m * E0) / Eth) * (m * E0 > Eth ? 0.95 : 0.45)}" shape-rendering="crispEdges" />{/each}{/each}
        <rect x="0" y="16" width={48 * CW} height={12 * RH} class="tmpl" style="fill:none" />
        <text class="lb" x="4" y={16 + 12 * RH + 16}>film cross-section along Z; bright: above threshold</text>
      </svg>
      <svg viewBox="0 0 480 170" style="margin-top:16px" role="img" aria-label="Top view of comb teeth and reversed domains">
        {#each Array(3) as _, k (k)}
          <rect x={k * 160 + 40} y="10" width="80" height="34" class="au-f" />
          {#if E0 > Eth && reach > 0}<path d="M{k * 160 + 80 - (width / L) * 80} 44 L{k * 160 + 80 - (width / L) * 80} {44 + reach * 100 - 10} L{k * 160 + 80} {44 + reach * 100} L{k * 160 + 80 + (width / L) * 80} {44 + reach * 100 - 10} L{k * 160 + 80 + (width / L) * 80} 44 Z" class="ln-f" style="opacity:0.9" />{/if}
        {/each}
        <rect x="0" y="148" width="480" height="20" class="au-f" />
        <text class="lb" x="4" y="164" style="fill: var(--v-ink0)">counter electrode</text>
      </svg>
    </div>
    <div class="mk-vf-side">
      <div class="v-ctl" style="--w:11ch"><label for="pov-E">Pulse field V/g</label><output>{E0.toFixed(1)} kV/mm</output><input id="pov-E" type="range" min="0" max="100" step="0.5" bind:value={E0}></div>
      <div class="v-ctl" style="--w:11ch"><label for="pov-t">Threshold field</label><output>{Eth.toFixed(1)} kV/mm</output><input id="pov-t" type="range" min="5" max="70" step="0.1" bind:value={Eth}></div>
      <div class="v-ctl"><span class="v-lab">Period</span>{@render perSel(true)}</div>
      <dl class="v-hud"><dt>Peak field in the film</dt><dd>{Epk.toFixed(1)} kV/mm</dd><dt>Duty cycle</dt><dd>{D.toFixed(2)}{merged ? " (merged)" : ""}</dd><dt>Reach across the gap</dt><dd>{(reach * 100).toFixed(0)}%</dd><dt>d_eff</dt><dd>{deff.toFixed(2)} pm/V</dd><dt>Depth reversed</dt><dd>{(depthFrac * 100).toFixed(0)}%</dd></dl>
      <p class="v-cap">Gap {field.gap_um} µm (template), film {field.film_um} µm. Field solved once per volt (finite volume; LN free permittivities; SiO<sub>2</sub> and Si permittivities and the air cover are template) and scaled by V/g <Badge code="derived" pop="src:field" />. Reference fields: 21 kV/mm bulk CLN <Badge code="reported" pop="src:ec" />, 28.2 kV/mm thin film <Badge code="S" pop="src:chen-th" />, peak above 3 E<sub>c</sub> = 63 kV/mm in practice <Badge code="P" pop="src:chen" />. d_eff uses d<sub>33</sub> = 34 pm/V (older-scale compilation) <Badge code="template" pop="src:deff" />.</p>
      <p class="v-cap" style="height:88px;overflow:hidden">{merged ? "Neighbouring domains merge: at sub-micrometre periods the lateral spread fills the space between teeth, which is why short periods need special pulse schemes." : "At periods near 600 nm neighbouring domains merge at lower pulse fields."} Domain shapes <Badge code="template" pop="src:kin" />.</p>
    </div>
  </div>
</figure>
