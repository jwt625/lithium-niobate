<!-- F05-11 From rock to chip: value chain with sourced facts per node, and the LN and Nb mass of one wafer (derived from
     density 4647 kg/m^3 and IUPAC atomic weights). TECH: boxed flow of nodes + mass table. VISUAL: wafer drawn to scale
     with Isotype mass squares (area proportional to mass). Pops: src:* keys registered by the page server. -->
<script lang="ts">
  import Badge from "$lib/components/Badge.svelte";
  import { waferMass, chargePerKg, nbMassFraction, MOLAR_MASS } from "$lib/physics/fab.ts";
  import { padL } from "./flow";

  const WAFERS = [{ d: 76.2, t: 0.5, l: "76.2 mm × 0.5 mm" }, { d: 100, t: 0.35, l: "100 mm × 0.35 mm" }, { d: 150, t: 0.5, l: "150 mm × 0.5 mm" }, { d: 200, t: 0.5, l: "200 mm × 0.5 mm" }];
  let w = $state(2);
  const W = $derived(WAFERS[w]);
  const m = $derived(waferMass(W.d, W.t));
  const ch = chargePerKg();
  const nb2o5 = $derived(m.LN_g * ch.Nb2O5), li2co3 = $derived(m.LN_g * ch.Li2CO3), co2 = $derived(m.LN_g * ch.CO2);
  const worldNb_g = 112000e6;
  const ratio = $derived(worldNb_g / m.Nb_g);
  const sciH = (v: number): string => { const e = Math.floor(Math.log10(v)); return `${(v / 10 ** e).toFixed(2)} × 10<sup>${e}</sup>`; };
  const g = (v: number): string => padL(v.toFixed(1), 5) + " g";
  // Isotype squares: side proportional to sqrt(mass), 100 g -> 120 px
  const side = (mass: number): number => 120 * Math.sqrt(mass / 100);
  const NODES: { h: string; facts: { t: string; code: "P" | "S" | "V" | "derived"; text: string; pop: string }[] }[] = [
    { h: "Pyrochlore ore (Nb)", facts: [{ t: "World Nb mine production 112,000 t (2024, 2025e)", code: "P", text: "P", pop: "src:usgs-nb" }, { t: "Brazil 104,000 t, about 93%", code: "P", text: "P", pop: "src:usgs-nb" }] },
    { h: "Brine, spodumene (Li)", facts: [{ t: "World Li production 290,000 t (2025, excl. US)", code: "P", text: "P", pop: "src:usgs-li" }, { t: "Batteries 88% of Li end use", code: "P", text: "P", pop: "src:usgs-li" }] },
    { h: "Nb₂O₅", facts: [{ t: "69.904 wt% Nb", code: "P", text: "P", pop: "src:usgs-nb" }, { t: "0.899 kg per kg LiNbO₃ (stoichiometric)", code: "derived", text: "derived", pop: "src:charge" }] },
    { h: "Li₂CO₃", facts: [{ t: "US contract average US$9,000/t (2025)", code: "P", text: "P", pop: "src:usgs-li" }, { t: "0.250 kg per kg LiNbO₃", code: "derived", text: "derived", pop: "src:charge" }] },
    { h: "Boule", facts: [{ t: "153 mm × 110 mm at 1–2 mm/h, 5–10 rpm", code: "S", text: "S", pop: "src:cz" }, { t: "Body mass 9.4 kg", code: "derived", text: "derived", pop: "src:boule-mass" }] },
    { h: "Wafer", facts: [{ t: "4- and 6-inch SAW wafers; 8-inch LN claimed in mass production", code: "V", text: "V", pop: "src:r09-sizes" }, { t: "128° Y LN: 350 µm at 4 inch, 500 µm at 6 inch", code: "V", text: "V", pop: "src:smm" }] },
    { h: "LNOI", facts: [{ t: "300–900 nm films on 3 to 8 inch", code: "V", text: "V", pop: "src:nanoln" }, { t: "LN6: 150 mm LN on insulator", code: "V", text: "V", pop: "src:soitec" }] },
    { h: "Foundry", facts: [{ t: "150 mm TFLN foundry (200 mm wafer shown)", code: "S", text: "S", pop: "src:ccraft" }, { t: "6- and 8-inch TFLN production partnership", code: "V", text: "V", pop: "src:hyperlight" }] },
    { h: "Chip", facts: [{ t: "0.27 dB/cm across a 4-inch DUV wafer", code: "P", text: "P", pop: "src:luke2020" }, { t: "MZM 1.73 cm, V<sub>π</sub> 1.94 V", code: "P", text: "P", pop: "src:li2023nc" }] },
    { h: "Module", facts: [{ t: "Commercial Ti:LN modulators up to 40 GHz", code: "V", text: "V", pop: "src:tiln" }] },
  ];
</script>

{#snippet sel(big: boolean)}
  <div class={big ? "v-seg" : "seg"} role="group" aria-label="Wafer size">{#each WAFERS as x, i (x.d)}<button type="button" class:on={w === i} onclick={() => (w = i)}>{big ? `${x.d} mm` : `${x.d} MM`}</button>{/each}</div>
{/snippet}

<figure class="panel mk-fig" data-variant="tech">
  <div class="ph"><span>From rock to chip: value chain and mass per wafer</span><span>flats ignored</span></div>
  <div class="mk-chain">
    {#each NODES as n, i (n.h)}
      {#if i}<span class="ar">→</span>{/if}
      <div class="nd"><b>{n.h}</b>{#each n.facts as f (f.t)}<div>{@html f.t} <Badge code={f.code} text={f.text} pop={f.pop} /></div>{/each}</div>
    {/each}
  </div>
  <div class="ctl"><span class="k">Wafer</span>{@render sel(false)}<output>{W.d} mm</output></div>
  <div class="mk-ro"><span>m_LN {g(m.LN_g)}</span><span>m_Nb {g(m.Nb_g)}</span><span>Nb₂O₅ {g(nb2o5)}</span><span>Li₂CO₃ {g(li2co3)}</span><span>CO₂ out {g(co2)}</span><Badge code="derived" pop="src:wafer-mass" /></div>
  <div class="mk-note">World Nb mine output = {@html sciH(ratio)} wafers of this size (derived; Nb share of LiNbO<sub>3</sub> {(nbMassFraction() * 100).toFixed(2)} wt%, M = {MOLAR_MASS.LiNbO3.toFixed(2)} g/mol). Charge masses are stoichiometric per finished wafer; kerf, lapping and polishing losses are not included (no source).</div>
</figure>

<figure class="mk-fig mk-vfig" data-variant="visual">
  <div class="mk-vf-grid">
    <svg class="mk-iso" viewBox="0 0 640 300" role="img" aria-label="Wafer to scale with mass squares">
      <!-- wafer to scale: 200 mm -> 260 px -->
      <circle cx="140" cy="150" r={(W.d / 200) * 130} class="wf" />
      <line x1={140 - (W.d / 200) * 130} x2={140 + (W.d / 200) * 130} y1="292" y2="292" class="dim" />
      <text x="140" y="286" class="lb m">{W.d} mm</text>
      {#each [{ v: m.LN_g, c: "q-ln", l: "LiNbO₃" }, { v: m.Nb_g, c: "q-nb", l: "Nb inside it" }, { v: nb2o5, c: "q-pw", l: "Nb₂O₅ in" }, { v: li2co3, c: "q-pw", l: "Li₂CO₃ in" }] as q, i (q.l)}
        {@const s = side(q.v)}
        <rect x={300 + i * 86 + (80 - Math.min(s, 80)) / 2} y={200 - s} width={s} height={s} class={q.c} />
        <text x={340 + i * 86} y="222" class="lb m">{q.l}</text>
        <text x={340 + i * 86} y="242" class="vl m">{q.v.toFixed(1)} g</text>
      {/each}
    </svg>
    <div class="mk-vf-side">
      <div class="v-ctl"><span class="v-lab">Wafer diameter</span>{@render sel(true)}</div>
      <dl class="v-hud">
        <dt>LN mass</dt><dd>{m.LN_g.toFixed(1)} g</dd>
        <dt>Niobium in it</dt><dd>{m.Nb_g.toFixed(1)} g</dd>
        <dt>CO₂ released</dt><dd>{co2.toFixed(1)} g</dd>
        <dt>World Nb output</dt><dd>{@html sciH(ratio)} wafers</dd>
      </dl>
      <p class="v-cap">Square area proportional to mass (100 g = 120 px square). Wafer drawn to scale. Charge masses are stoichiometric per finished wafer; kerf, lapping and polishing losses are not included (no source). <Badge code="derived" pop="src:wafer-mass" /></p>
    </div>
  </div>
  <div class="mk-vchain">
    {#each NODES as n (n.h)}<div class="vn"><b>{n.h}</b>{#each n.facts as f (f.t)}<p>{@html f.t} <Badge code={f.code} text={f.text} pop={f.pop} /></p>{/each}</div>{/each}
  </div>
</figure>
